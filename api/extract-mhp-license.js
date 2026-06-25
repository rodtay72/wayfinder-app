import zlib from 'node:zlib';
import {
  SUPABASE_URL,
  getAuthUserFromAccessToken,
  parseBody,
  readJson,
  supabaseAdminFetch
} from './_supabase-admin.js';

const MHP_LICENSE_BUCKET = 'professional-license-documents';
const DEFAULT_MODEL = process.env.MHP_LICENSE_EXTRACTION_MODEL || 'gpt-4o-mini';
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 12000;
const MIN_PDF_TEXT_CHARS = 20;
const USER_EXTRACTION_FAILURE = 'Extraction failed. Please try again or contact Wayfinder support.';

const ERROR_CODES = {
  AUTH_REQUIRED: 'auth_required',
  DOCUMENT_NOT_FOUND: 'document_not_found',
  ROLE_NOT_AUTHORISED: 'role_not_authorised',
  PROFILE_LOOKUP_FAILED: 'profile_lookup_failed',
  MISSING_OPENAI_KEY: 'missing_openai_key',
  MISSING_SERVICE_ROLE_KEY: 'missing_service_role_key',
  STORAGE_DOWNLOAD_FAILED: 'storage_download_failed',
  PDF_TEXT_UNREADABLE: 'pdf_text_unreadable',
  OPENAI_REQUEST_FAILED: 'openai_request_failed',
  EXTRACTION_UNAVAILABLE: 'extraction_unavailable'
};

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const bearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

const createDiag = () => ({
  documentIdPresent: false,
  tokenPresent: false,
  userResolved: false,
  profileResolved: false,
  documentResolved: false
});

const logExtractionFailure = ({ stage, status, error_code, message, diag }) => {
  console.error('[mhp-license-extract]', {
    stage: stage || 'unknown',
    status: status ?? null,
    error_code: error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE,
    message: message || 'Licence extraction failed',
    documentIdPresent: !!diag?.documentIdPresent,
    tokenPresent: !!diag?.tokenPresent,
    userResolved: !!diag?.userResolved,
    profileResolved: !!diag?.profileResolved,
    documentResolved: !!diag?.documentResolved
  });
};

const fail = (res, { status, error_code, error, stage, diag }) => {
  logExtractionFailure({ stage, status, error_code, message: error, diag });
  return res.status(status).json({ ok: false, error, error_code });
};

const encodeStoragePath = (storagePath) => String(storagePath || '')
  .split('/')
  .filter(Boolean)
  .map((part) => encodeURIComponent(part))
  .join('/');

const decodePdfString = (value) => String(value || '')
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\\(/g, '(')
  .replace(/\\\)/g, ')')
  .replace(/\\\\/g, '\\');

const decodePdfHexString = (value) => {
  const clean = String(value || '').replace(/[^0-9A-Fa-f]/g, '');
  if (!clean || clean.length < 2) return '';
  let out = '';
  const byteLength = clean.length - (clean.length % 2);
  for (let i = 0; i < byteLength; i += 2) {
    const code = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(code)) continue;
    out += String.fromCharCode(code);
  }
  return out.replace(/\u0000/g, '').trim();
};

const pushPdfTextChunk = (chunks, value) => {
  const text = String(value || '').replace(/\u0000/g, '').trim();
  if (text) chunks.push(text);
};

const collectPdfTextFromSegment = (segment, chunks) => {
  const raw = String(segment || '');
  const literalTjRegex = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  let match;
  while ((match = literalTjRegex.exec(raw)) !== null) {
    pushPdfTextChunk(chunks, decodePdfString(match[1]));
  }
  const hexTjRegex = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
  while ((match = hexTjRegex.exec(raw)) !== null) {
    pushPdfTextChunk(chunks, decodePdfHexString(match[1]));
  }
  const quoteTjRegex = /'((?:\\.|[^\\'])*)'\s*Tj/g;
  while ((match = quoteTjRegex.exec(raw)) !== null) {
    pushPdfTextChunk(chunks, decodePdfString(match[1]));
  }
  const tjArrayRegex = /\[((?:\([^)]*\)|<[^>]*>|'[^']*'|[^\]])*)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(raw)) !== null) {
    const inner = match[1];
    const literalPartRegex = /\(((?:\\.|[^\\)])*)\)/g;
    let part;
    while ((part = literalPartRegex.exec(inner)) !== null) {
      pushPdfTextChunk(chunks, decodePdfString(part[1]));
    }
    const hexPartRegex = /<([0-9A-Fa-f\s]+)>/g;
    while ((part = hexPartRegex.exec(inner)) !== null) {
      pushPdfTextChunk(chunks, decodePdfHexString(part[1]));
    }
    const quotePartRegex = /'((?:\\.|[^\\'])*)'/g;
    while ((part = quotePartRegex.exec(inner)) !== null) {
      pushPdfTextChunk(chunks, decodePdfString(part[1]));
    }
  }
};

const extractPdfText = (buffer) => {
  const raw = buffer.toString('latin1');
  const chunks = [];
  collectPdfTextFromSegment(raw, chunks);
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(raw)) !== null) {
    const streamBody = streamMatch[1];
    collectPdfTextFromSegment(streamBody, chunks);
    try {
      const inflated = zlib.inflateSync(Buffer.from(streamBody, 'latin1'));
      collectPdfTextFromSegment(inflated.toString('latin1'), chunks);
    } catch {
      // Ignore non-deflate streams.
    }
  }
  return chunks
    .join('\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
};

const sanitizeExtraction = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  const confidence = source.confidence && typeof source.confidence === 'object'
    ? source.confidence
    : {};
  return {
    full_name: String(source.full_name || '').trim() || null,
    professional_title: String(source.professional_title || '').trim() || null,
    credential_label: String(source.credential_label || '').trim() || null,
    issuing_body: String(source.issuing_body || '').trim() || null,
    license_registration_number: String(source.license_registration_number || '').trim() || null,
    accreditation_number: String(source.accreditation_number || '').trim() || null,
    valid_from: String(source.valid_from || '').trim() || null,
    valid_to: String(source.valid_to || '').trim() || null,
    raw_validity_text: String(source.raw_validity_text || '').trim() || null,
    confidence,
    requires_human_review: true
  };
};

const buildExtractionPrompt = (pdfText) => `You extract draft registration fields from a Mental Health Professional licence or registration certificate PDF.

This is draft support only. You are NOT verifying the licence, approving membership, or publishing a profile.

Return strict JSON with these keys only:
- full_name
- professional_title
- credential_label
- issuing_body
- license_registration_number
- accreditation_number
- valid_from (YYYY-MM-DD if possible, else null)
- valid_to (YYYY-MM-DD if possible, else null)
- raw_validity_text (exact validity wording from the certificate if present)
- confidence (object with 0-1 scores for each extracted field key above except raw_validity_text)
- requires_human_review (always true)

Rules:
- Use null when a field cannot be found.
- Do not guess registration numbers or dates.
- Prefer exact certificate wording for names, titles, issuing body, and numbers.
- Dates should be ISO YYYY-MM-DD when clearly stated.
- This output will be reviewed by a human before any Wayfinder review step.

Reference example format (Singapore Association for Counselling certificate):
- full_name: Mr Rodney Tay
- professional_title / credential_label: SAC Registered Counsellor / Registered Counsellor
- issuing_body: Singapore Association for Counselling
- valid_from: 2026-02-01
- valid_to: 2028-01-31
- license_registration_number: 2312/2026
- accreditation_number: C0820

Certificate text:
${pdfText}`;

async function getExtractionProfileRole(userId) {
  const ownerId = String(userId || '').trim();
  if (!ownerId) {
    return { ok: false, profile: null, role: null, status: 400, message: 'Profile lookup requires a user id.' };
  }
  const params = new URLSearchParams({
    select: 'user_id,role',
    user_id: `eq.${ownerId}`,
    limit: '1'
  });
  try {
    const data = await supabaseAdminFetch(`/rest/v1/profiles?${params.toString()}`, {
      method: 'GET'
    });
    const profile = Array.isArray(data) && data.length > 0 ? data[0] : null;
    return {
      ok: true,
      profile,
      role: profile?.role || null,
      status: 200,
      message: null
    };
  } catch (err) {
    return {
      ok: false,
      profile: null,
      role: null,
      status: err?.status || 503,
      message: err?.message || 'Profile lookup failed'
    };
  }
}

async function getLicenseDocument(documentId, userId) {
  const params = new URLSearchParams({
    select: 'id,user_id,storage_bucket,storage_path,original_filename,mime_type,file_size_bytes,document_status,extraction_status',
    id: `eq.${documentId}`,
    user_id: `eq.${userId}`,
    limit: '1'
  });
  const rows = await supabaseAdminFetch(`/rest/v1/mental_health_professional_license_documents?${params.toString()}`, {
    method: 'GET'
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function downloadLicensePdf(bucket, storagePath) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    error.error_code = ERROR_CODES.MISSING_SERVICE_ROLE_KEY;
    error.status = 503;
    throw error;
  }
  const encodedPath = encodeStoragePath(storagePath);
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: 'GET',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  if (!response.ok) {
    const detail = await readJson(response);
    const error = new Error(detail?.message || detail?.error || response.statusText || 'Storage download failed');
    error.error_code = ERROR_CODES.STORAGE_DOWNLOAD_FAILED;
    error.status = response.status;
    throw error;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_PDF_BYTES) {
    const error = new Error('Licence PDF exceeds size limit.');
    error.error_code = ERROR_CODES.STORAGE_DOWNLOAD_FAILED;
    error.status = 413;
    throw error;
  }
  return buffer;
}

async function patchLicenseDocument(documentId, userId, patch) {
  const params = new URLSearchParams({
    id: `eq.${documentId}`,
    user_id: `eq.${userId}`
  });
  return supabaseAdminFetch(`/rest/v1/mental_health_professional_license_documents?${params.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString()
    })
  });
}

async function callExtractionModel(pdfText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.error_code = ERROR_CODES.MISSING_OPENAI_KEY;
    error.status = 503;
    throw error;
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 900,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You extract structured draft fields from professional licence certificates. Return only valid JSON. Never verify or approve credentials.'
        },
        { role: 'user', content: buildExtractionPrompt(pdfText) }
      ]
    })
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'AI extraction request failed');
    error.error_code = ERROR_CODES.OPENAI_REQUEST_FAILED;
    error.status = response.status;
    throw error;
  }
  const text = data?.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('AI extraction returned invalid JSON.');
    error.error_code = ERROR_CODES.OPENAI_REQUEST_FAILED;
    error.status = 502;
    throw error;
  }
}

const mapExtractionError = (err) => {
  const errorCode = err?.error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE;
  const status = err?.status === 401 || err?.status === 403 || err?.status === 404
    ? err.status
    : errorCode === ERROR_CODES.PDF_TEXT_UNREADABLE
      ? 422
      : errorCode === ERROR_CODES.MISSING_OPENAI_KEY || errorCode === ERROR_CODES.MISSING_SERVICE_ROLE_KEY || errorCode === ERROR_CODES.PROFILE_LOOKUP_FAILED
        ? 503
        : err?.status || 500;
  const userMessage = [
    ERROR_CODES.AUTH_REQUIRED,
    ERROR_CODES.DOCUMENT_NOT_FOUND,
    ERROR_CODES.ROLE_NOT_AUTHORISED
  ].includes(errorCode)
    ? String(err?.message || USER_EXTRACTION_FAILURE)
    : USER_EXTRACTION_FAILURE;
  return { status, error_code: errorCode, error: userMessage };
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return fail(res, {
      status: 405,
      error_code: ERROR_CODES.EXTRACTION_UNAVAILABLE,
      error: 'Method not allowed',
      stage: 'method',
      diag: createDiag()
    });
  }

  const body = parseBody(req);
  const documentId = String(body.documentId || body.document_id || '').trim();
  const token = bearerToken(req);
  const diag = createDiag();
  diag.documentIdPresent = !!documentId;
  diag.tokenPresent = !!token;

  if (!token) {
    return fail(res, {
      status: 401,
      error_code: ERROR_CODES.AUTH_REQUIRED,
      error: 'Authentication required.',
      stage: 'auth',
      diag
    });
  }
  if (!documentId) {
    return fail(res, {
      status: 400,
      error_code: ERROR_CODES.EXTRACTION_UNAVAILABLE,
      error: USER_EXTRACTION_FAILURE,
      stage: 'request',
      diag
    });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail(res, {
      status: 503,
      error_code: ERROR_CODES.MISSING_SERVICE_ROLE_KEY,
      error: USER_EXTRACTION_FAILURE,
      stage: 'config',
      diag
    });
  }

  let userId = null;
  try {
    const user = await getAuthUserFromAccessToken(token);
    if (!user?.id) {
      return fail(res, {
        status: 401,
        error_code: ERROR_CODES.AUTH_REQUIRED,
        error: 'Authentication required.',
        stage: 'auth',
        diag
      });
    }
    diag.userResolved = true;
    userId = user.id;

    const profileLookup = await getExtractionProfileRole(userId);
    if (!profileLookup.ok) {
      return fail(res, {
        status: 503,
        error_code: ERROR_CODES.PROFILE_LOOKUP_FAILED,
        error: USER_EXTRACTION_FAILURE,
        stage: 'profile_lookup',
        diag
      });
    }
    diag.profileResolved = true;

    const role = String(profileLookup.role || '').trim().toLowerCase();
    if (!profileLookup.profile || role !== 'counsellor') {
      return fail(res, {
        status: 403,
        error_code: ERROR_CODES.ROLE_NOT_AUTHORISED,
        error: 'Mental Health Professional access required.',
        stage: 'profile_lookup',
        diag
      });
    }

    const document = await getLicenseDocument(documentId, userId);
    diag.documentResolved = !!document;
    if (!document) {
      return fail(res, {
        status: 404,
        error_code: ERROR_CODES.DOCUMENT_NOT_FOUND,
        error: 'Licence document not found.',
        stage: 'document_lookup',
        diag
      });
    }

    const bucket = String(document.storage_bucket || MHP_LICENSE_BUCKET).trim();
    const storagePath = String(document.storage_path || '').trim();
    if (!storagePath || bucket !== MHP_LICENSE_BUCKET) {
      return fail(res, {
        status: 400,
        error_code: ERROR_CODES.DOCUMENT_NOT_FOUND,
        error: 'Licence document not found.',
        stage: 'document_metadata',
        diag
      });
    }

    const currentExtractionStatus = String(document.extraction_status || 'pending').trim().toLowerCase();
    if (currentExtractionStatus === 'processing') {
      return fail(res, {
        status: 409,
        error_code: ERROR_CODES.EXTRACTION_UNAVAILABLE,
        error: USER_EXTRACTION_FAILURE,
        stage: 'processing',
        diag
      });
    }

    await patchLicenseDocument(documentId, userId, {
      extraction_status: 'processing'
    });

    try {
      const pdfBuffer = await downloadLicensePdf(bucket, storagePath);
      const pdfText = extractPdfText(pdfBuffer);
      if (!pdfText || pdfText.length < MIN_PDF_TEXT_CHARS) {
        const error = new Error('Could not extract readable text from the licence PDF.');
        error.error_code = ERROR_CODES.PDF_TEXT_UNREADABLE;
        error.status = 422;
        throw error;
      }

      const modelResult = await callExtractionModel(pdfText);
      const extraction = sanitizeExtraction(modelResult);
      const extractedAt = new Date().toISOString();

      const updatedRows = await patchLicenseDocument(documentId, userId, {
        extracted_json: {
          full_name: extraction.full_name,
          professional_title: extraction.professional_title,
          credential_label: extraction.credential_label,
          issuing_body: extraction.issuing_body,
          license_registration_number: extraction.license_registration_number,
          accreditation_number: extraction.accreditation_number,
          valid_from: extraction.valid_from,
          valid_to: extraction.valid_to,
          raw_validity_text: extraction.raw_validity_text
        },
        extraction_confidence: extraction.confidence,
        extraction_model: DEFAULT_MODEL,
        extracted_at: extractedAt,
        extraction_status: 'completed',
        document_status: 'extracted'
      });

      const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;
      return res.status(200).json({
        ok: true,
        document_id: documentId,
        document_status: updated?.document_status || 'extracted',
        extraction_status: updated?.extraction_status || 'completed',
        extracted_at: updated?.extracted_at || extractedAt,
        requires_human_review: true,
        extraction: {
          full_name: extraction.full_name,
          professional_title: extraction.professional_title,
          credential_label: extraction.credential_label,
          issuing_body: extraction.issuing_body,
          license_registration_number: extraction.license_registration_number,
          accreditation_number: extraction.accreditation_number,
          valid_from: extraction.valid_from,
          valid_to: extraction.valid_to,
          raw_validity_text: extraction.raw_validity_text,
          confidence: extraction.confidence,
          requires_human_review: true
        }
      });
    } catch (err) {
      try {
        await patchLicenseDocument(documentId, userId, {
          extraction_status: 'failed'
        });
      } catch {
        // Best-effort failure marker only.
      }
      const mapped = mapExtractionError(err);
      return fail(res, {
        status: mapped.status,
        error_code: mapped.error_code,
        error: mapped.error,
        stage: 'extract',
        diag
      });
    }
  } catch (error) {
    const mapped = mapExtractionError(error);
    return fail(res, {
      status: mapped.status >= 500 ? 500 : mapped.status,
      error_code: error?.error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE,
      error: USER_EXTRACTION_FAILURE,
      stage: 'handler',
      diag
    });
  }
}
