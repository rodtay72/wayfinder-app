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
const DETERMINISTIC_MODEL = 'deterministic-pdf-text-v1';
const OPENAI_TIMEOUT_MS = 10000;
const FUNCTION_BUDGET_MS = Number(process.env.MHP_EXTRACTION_BUDGET_MS || 8000);
const MIN_DETERMINISTIC_HIGH_CONFIDENCE_FIELDS = 5;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 12000;
const MIN_PDF_TEXT_CHARS = 20;
const MAX_PDF_PARSE_MS = 3000;
const MAX_CANDIDATE_STREAMS = 8;
const MAX_COMPRESSED_STREAM_BYTES = 64 * 1024;
const MAX_INFLATED_STREAM_BYTES = 128 * 1024;
const MAX_DICTIONARY_LOOKBACK_BYTES = 2048;
const USER_EXTRACTION_FAILURE = 'Extraction failed. Please try again or contact Wayfinder support.';
const USER_EXTRACTION_TIMEOUT = 'Extraction took too long. Please try again later.';

const ERROR_CODES = {
  AUTH_REQUIRED: 'auth_required',
  DOCUMENT_NOT_FOUND: 'document_not_found',
  ROLE_NOT_AUTHORISED: 'role_not_authorised',
  PROFILE_LOOKUP_FAILED: 'profile_lookup_failed',
  MISSING_OPENAI_KEY: 'missing_openai_key',
  MISSING_SERVICE_ROLE_KEY: 'missing_service_role_key',
  STORAGE_DOWNLOAD_FAILED: 'storage_download_failed',
  PDF_TEXT_UNREADABLE: 'pdf_text_unreadable',
  PDF_TEXT_PARSE_TIMEOUT: 'pdf_text_parse_timeout',
  OPENAI_REQUEST_FAILED: 'openai_request_failed',
  OPENAI_TIMEOUT: 'openai_timeout',
  EXTRACTION_TIMEOUT_GUARD: 'extraction_timeout_guard',
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

const createRunMetrics = () => ({
  pdfByteLength: null,
  extractedTextLength: null,
  deterministicFieldCount: null,
  usedOpenAi: false,
  scannedStreamCount: null,
  skippedStreamCount: null,
  candidateStreamCount: null,
  inflatedStreamCount: null,
  parseDurationMs: null
});

const logPdfParseMetrics = (metrics) => ({
  scannedStreamCount: metrics?.scannedStreamCount ?? null,
  skippedStreamCount: metrics?.skippedStreamCount ?? null,
  candidateStreamCount: metrics?.candidateStreamCount ?? null,
  inflatedStreamCount: metrics?.inflatedStreamCount ?? null,
  extractedTextLength: metrics?.extractedTextLength ?? null,
  parseDurationMs: metrics?.parseDurationMs ?? null
});

const logExtractionStage = ({ stage, durationMs, status, error_code, diag, metrics, totalElapsedMs }) => {
  console.error('[mhp-license-extract-stage]', {
    stage: stage || 'unknown',
    durationMs: durationMs ?? null,
    status: status || 'ok',
    error_code: error_code ?? null,
    documentIdPresent: !!diag?.documentIdPresent,
    userResolved: !!diag?.userResolved,
    profileResolved: !!diag?.profileResolved,
    documentResolved: !!diag?.documentResolved,
    pdfByteLength: metrics?.pdfByteLength ?? null,
    deterministicFieldCount: metrics?.deterministicFieldCount ?? null,
    usedOpenAi: !!metrics?.usedOpenAi,
    totalElapsedMs: totalElapsedMs ?? null,
    ...logPdfParseMetrics(metrics)
  });
};

const logExtractionFailure = ({ stage, status, error_code, message, diag, metrics, totalElapsedMs }) => {
  console.error('[mhp-license-extract]', {
    stage: stage || 'unknown',
    status: status ?? null,
    error_code: error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE,
    message: message || 'Licence extraction failed',
    documentIdPresent: !!diag?.documentIdPresent,
    tokenPresent: !!diag?.tokenPresent,
    userResolved: !!diag?.userResolved,
    profileResolved: !!diag?.profileResolved,
    documentResolved: !!diag?.documentResolved,
    pdfByteLength: metrics?.pdfByteLength ?? null,
    deterministicFieldCount: metrics?.deterministicFieldCount ?? null,
    usedOpenAi: !!metrics?.usedOpenAi,
    totalElapsedMs: totalElapsedMs ?? null,
    ...logPdfParseMetrics(metrics)
  });
};

const createBudgetGuard = (diag, metrics) => {
  const startedAt = Date.now();
  return {
    elapsed: () => Date.now() - startedAt,
    assertBudget: (stage) => {
      if (Date.now() - startedAt >= FUNCTION_BUDGET_MS) {
        const error = new Error('Extraction exceeded internal time budget.');
        error.error_code = ERROR_CODES.EXTRACTION_TIMEOUT_GUARD;
        error.status = 504;
        error.stage = stage;
        throw error;
      }
    },
    async runStage(stage, fn) {
      this.assertBudget(stage);
      const stageStart = Date.now();
      try {
        const result = await fn();
        logExtractionStage({
          stage,
          durationMs: Date.now() - stageStart,
          status: 'ok',
          diag,
          metrics,
          totalElapsedMs: Date.now() - startedAt
        });
        this.assertBudget(stage);
        return result;
      } catch (err) {
        logExtractionStage({
          stage,
          durationMs: Date.now() - stageStart,
          status: 'error',
          error_code: err?.error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE,
          diag,
          metrics,
          totalElapsedMs: Date.now() - startedAt
        });
        throw err;
      }
    }
  };
};

const fail = (res, { status, error_code, error, stage, diag, metrics, budget }) => {
  logExtractionFailure({
    stage,
    status,
    error_code,
    message: error,
    diag,
    metrics,
    totalElapsedMs: budget?.elapsed?.() ?? null
  });
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

const hasPdfTextOperators = (content) => {
  const raw = String(content || '');
  return /\bBT\b/.test(raw) && /\bET\b/.test(raw) && (/\bTj\b/.test(raw) || /\bTJ\b/.test(raw));
};

const findStreamDictionary = (raw, streamIndex) => {
  const lookbackStart = Math.max(0, streamIndex - MAX_DICTIONARY_LOOKBACK_BYTES);
  const prefix = raw.slice(lookbackStart, streamIndex);
  const dictStart = prefix.lastIndexOf('<<');
  if (dictStart === -1) return '';
  return prefix.slice(dictStart);
};

const isSkippableStreamDictionary = (dictText) => {
  const dict = String(dictText || '');
  if (/\/Subtype\s*\/Image\b/i.test(dict)) return true;
  if (/\/Type\s*\/XObject\b/i.test(dict) && /\/Subtype\s*\/Image\b/i.test(dict)) return true;
  if (/\/FontFile(?:2|3)?\b/i.test(dict)) return true;
  if (/\/Length1\b/i.test(dict)) return true;
  if (/\/Subtype\s*\/XML\b/i.test(dict)) return true;
  return false;
};

const isCandidateTextStreamDictionary = (dictText, compressedLength) => {
  const dict = String(dictText || '');
  if (isSkippableStreamDictionary(dict)) return false;
  if (compressedLength <= 0 || compressedLength > MAX_COMPRESSED_STREAM_BYTES) return false;
  if (/\/Filter\s*\/FlateDecode\b/i.test(dict) || /\/Filter\s*\[\s*\/FlateDecode/i.test(dict)) return true;
  if (/\/Length\s+\d+/i.test(dict) && !/\/Subtype\b/i.test(dict) && !/\/Font\b/i.test(dict)) return true;
  return false;
};

const inflateCandidateStream = (streamBody) => {
  try {
    return zlib.inflateSync(Buffer.from(streamBody, 'latin1'));
  } catch {
    return null;
  }
};

const finalizePdfText = (chunks) => chunks
  .join('\n')
  .replace(/\u0000/g, '')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, MAX_TEXT_CHARS);

const extractPdfTextSafe = (buffer, assertBudget) => {
  const parseStart = Date.now();
  const stats = {
    scannedStreamCount: 0,
    skippedStreamCount: 0,
    candidateStreamCount: 0,
    inflatedStreamCount: 0,
    extractedTextLength: 0,
    parseDurationMs: 0
  };

  const assertParseBudget = () => {
    if (Date.now() - parseStart >= MAX_PDF_PARSE_MS) {
      const error = new Error('PDF text parsing exceeded time budget.');
      error.error_code = ERROR_CODES.PDF_TEXT_PARSE_TIMEOUT;
      error.status = 504;
      error.stage = 'pdf_text_extract';
      throw error;
    }
    if (assertBudget) assertBudget('pdf_text_extract');
  };

  const raw = buffer.toString('latin1');
  const chunks = [];
  let searchFrom = 0;

  while (searchFrom < raw.length) {
    assertParseBudget();

    const streamIdx = raw.indexOf('stream', searchFrom);
    if (streamIdx === -1) break;

    let bodyStart = streamIdx + 6;
    if (raw[bodyStart] === '\r') bodyStart += 1;
    if (raw[bodyStart] === '\n') bodyStart += 1;
    else {
      searchFrom = streamIdx + 6;
      continue;
    }

    const endIdx = raw.indexOf('endstream', bodyStart);
    if (endIdx === -1) break;

    stats.scannedStreamCount += 1;

    let bodyEnd = endIdx;
    if (bodyEnd > bodyStart && raw[bodyEnd - 1] === '\n') bodyEnd -= 1;
    if (bodyEnd > bodyStart && raw[bodyEnd - 1] === '\r') bodyEnd -= 1;

    const streamBody = raw.slice(bodyStart, bodyEnd);
    const dictText = findStreamDictionary(raw, streamIdx);
    searchFrom = endIdx + 9;

    if (!isCandidateTextStreamDictionary(dictText, streamBody.length)) {
      stats.skippedStreamCount += 1;
      continue;
    }

    stats.candidateStreamCount += 1;
    if (stats.inflatedStreamCount >= MAX_CANDIDATE_STREAMS) {
      stats.skippedStreamCount += 1;
      continue;
    }

    const useFlate = /\/Filter\s*\/FlateDecode\b/i.test(dictText)
      || /\/Filter\s*\[\s*\/FlateDecode/i.test(dictText);
    let content = streamBody;
    if (useFlate) {
      const inflated = inflateCandidateStream(streamBody);
      if (!inflated || inflated.length === 0 || inflated.length > MAX_INFLATED_STREAM_BYTES) {
        stats.skippedStreamCount += 1;
        continue;
      }
      content = inflated.toString('latin1');
      stats.inflatedStreamCount += 1;
    } else {
      if (streamBody.length > MAX_INFLATED_STREAM_BYTES) {
        stats.skippedStreamCount += 1;
        continue;
      }
      stats.inflatedStreamCount += 1;
    }

    if (!hasPdfTextOperators(content)) {
      stats.skippedStreamCount += 1;
      continue;
    }

    collectPdfTextFromSegment(content.slice(0, MAX_INFLATED_STREAM_BYTES), chunks);
    if (finalizePdfText(chunks).length >= MIN_PDF_TEXT_CHARS) break;
  }

  const text = finalizePdfText(chunks);
  stats.extractedTextLength = text.length;
  stats.parseDurationMs = Date.now() - parseStart;
  return { text, stats };
};

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

const pad2 = (value) => String(value).padStart(2, '0');

const parseHumanDateToIso = (value) => {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[2].toLowerCase()];
  if (!month) return null;
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (!Number.isFinite(day) || !Number.isFinite(year) || day < 1 || day > 31) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
};

const normalizePdfPlainText = (pdfText) => String(pdfText || '')
  .replace(/\u0000/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const setDeterministicField = (fields, confidence, key, value, score) => {
  const next = String(value || '').trim();
  if (!next) return;
  if (!fields[key] || (confidence[key] || 0) <= score) {
    fields[key] = next;
    confidence[key] = score;
  }
};

const parseDeterministicLicenseFields = (pdfText) => {
  const compact = normalizePdfPlainText(pdfText);
  const fields = {
    full_name: null,
    professional_title: null,
    credential_label: null,
    issuing_body: null,
    license_registration_number: null,
    accreditation_number: null,
    valid_from: null,
    valid_to: null,
    raw_validity_text: null
  };
  const confidence = {};

  const sacCredential = compact.match(/\bSAC Registered Counsellor\b/i);
  if (sacCredential) {
    setDeterministicField(fields, confidence, 'credential_label', 'SAC Registered Counsellor', 0.96);
    setDeterministicField(fields, confidence, 'professional_title', 'Registered Counsellor', 0.9);
  } else {
    const registeredCounsellor = compact.match(/\bRegistered Counsellor\b/i);
    if (registeredCounsellor) {
      setDeterministicField(fields, confidence, 'professional_title', 'Registered Counsellor', 0.88);
    }
  }

  const sacBody = compact.match(/\bSingapore Association for Counselling\b/i);
  if (sacBody) {
    setDeterministicField(fields, confidence, 'issuing_body', 'Singapore Association for Counselling', 0.96);
  }

  const nameMatch = compact.match(/\b(Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][A-Za-z'’.-]+(?:\s+[A-Z][A-Za-z'’.-]+)+/);
  if (nameMatch) {
    setDeterministicField(fields, confidence, 'full_name', nameMatch[0].replace(/\s+/g, ' ').trim(), 0.92);
  }

  const accNoMatch = compact.match(/\bAcc\.?\s*No\.?\s*[:\-]?\s*(C\d{3,6})\b/i)
    || compact.match(/\bAccreditation(?:\s+Number|\s+No\.?)?\s*[:\-]?\s*(C\d{3,6})\b/i)
    || compact.match(/\b(C\d{3,6})\b/);
  if (accNoMatch) {
    setDeterministicField(fields, confidence, 'accreditation_number', accNoMatch[1], 0.95);
  }

  const certNoMatch = compact.match(/\bCert\.?\s*No\.?\s*[:\-]?\s*(\d{3,4}\/\d{4})\b/i)
    || compact.match(/\b(?:Registration|Certificate|Licence|License)(?:\s+Number|\s+No\.?)?\s*[:\-]?\s*(\d{3,4}\/\d{4})\b/i)
    || compact.match(/\b(\d{3,4}\/\d{4})\b/);
  if (certNoMatch) {
    setDeterministicField(fields, confidence, 'license_registration_number', certNoMatch[1], 0.95);
  }

  const validityMatch = compact.match(/(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\s+(?:to|–|-|—)\s+(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i);
  if (validityMatch) {
    const rawValidity = `${validityMatch[1]} to ${validityMatch[2]}`;
    setDeterministicField(fields, confidence, 'raw_validity_text', rawValidity, 0.95);
    const validFrom = parseHumanDateToIso(validityMatch[1]);
    const validTo = parseHumanDateToIso(validityMatch[2]);
    if (validFrom) setDeterministicField(fields, confidence, 'valid_from', validFrom, 0.93);
    if (validTo) setDeterministicField(fields, confidence, 'valid_to', validTo, 0.93);
  }

  return { fields, confidence };
};

const countHighConfidenceDeterministicFields = (fields, confidence) => {
  const keys = [
    'full_name',
    'professional_title',
    'credential_label',
    'issuing_body',
    'license_registration_number',
    'accreditation_number',
    'valid_from',
    'valid_to',
    'raw_validity_text'
  ];
  return keys.filter((key) => {
    const value = fields[key];
    if (!value) return false;
    return (confidence[key] || 0) >= 0.85;
  }).length;
};

const isDeterministicExtractionSufficient = (fields, confidence) => (
  countHighConfidenceDeterministicFields(fields, confidence) >= MIN_DETERMINISTIC_HIGH_CONFIDENCE_FIELDS
);

const buildExtractionResponse = (extraction, extractionModel, documentId, updated, extractedAt) => ({
  ok: true,
  document_id: documentId,
  document_status: updated?.document_status || 'extracted',
  extraction_status: updated?.extraction_status || 'completed',
  extracted_at: updated?.extracted_at || extractedAt,
  extraction_model: extractionModel,
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

const saveCompletedExtraction = async (documentId, userId, extraction, extractionModel) => {
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
    extraction_model: extractionModel,
    extracted_at: extractedAt,
    extraction_status: 'completed',
    document_status: 'extracted'
  });
  const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;
  return { extraction, extractionModel, extractedAt, updated };
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

async function callExtractionModel(pdfText, remainingBudgetMs) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.error_code = ERROR_CODES.MISSING_OPENAI_KEY;
    error.status = 503;
    throw error;
  }
  const timeoutMs = Math.max(1000, Math.min(OPENAI_TIMEOUT_MS, remainingBudgetMs - 250));
  if (timeoutMs <= 1000) {
    const error = new Error('Extraction exceeded internal time budget before OpenAI call.');
    error.error_code = ERROR_CODES.EXTRACTION_TIMEOUT_GUARD;
    error.status = 504;
    throw error;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 600,
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
  } catch (err) {
    if (err?.name === 'AbortError') {
      const error = new Error('OpenAI extraction timed out.');
      error.error_code = ERROR_CODES.OPENAI_TIMEOUT;
      error.status = 504;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const mapExtractionError = (err) => {
  const errorCode = err?.error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE;
  const status = err?.status === 401 || err?.status === 403 || err?.status === 404
    ? err.status
    : errorCode === ERROR_CODES.PDF_TEXT_UNREADABLE
      ? 422
      : errorCode === ERROR_CODES.OPENAI_TIMEOUT || errorCode === ERROR_CODES.EXTRACTION_TIMEOUT_GUARD || errorCode === ERROR_CODES.PDF_TEXT_PARSE_TIMEOUT
        ? 504
      : errorCode === ERROR_CODES.MISSING_OPENAI_KEY || errorCode === ERROR_CODES.MISSING_SERVICE_ROLE_KEY || errorCode === ERROR_CODES.PROFILE_LOOKUP_FAILED
        ? 503
        : err?.status || 500;
  let userMessage = USER_EXTRACTION_FAILURE;
  if ([
    ERROR_CODES.AUTH_REQUIRED,
    ERROR_CODES.DOCUMENT_NOT_FOUND,
    ERROR_CODES.ROLE_NOT_AUTHORISED
  ].includes(errorCode)) {
    userMessage = String(err?.message || USER_EXTRACTION_FAILURE);
  } else if (errorCode === ERROR_CODES.OPENAI_TIMEOUT || errorCode === ERROR_CODES.EXTRACTION_TIMEOUT_GUARD || errorCode === ERROR_CODES.PDF_TEXT_PARSE_TIMEOUT) {
    userMessage = USER_EXTRACTION_TIMEOUT;
  }
  return { status, error_code: errorCode, error: userMessage };
};

const markExtractionFailed = async (documentId, userId, budget, diag, metrics) => {
  if (!documentId || !userId) return;
  const stageStart = Date.now();
  try {
    await patchLicenseDocument(documentId, userId, {
      extraction_status: 'failed'
    });
    logExtractionStage({
      stage: 'mark_failed',
      durationMs: Date.now() - stageStart,
      status: 'ok',
      diag,
      metrics,
      totalElapsedMs: budget?.elapsed?.() ?? null
    });
  } catch (err) {
    logExtractionStage({
      stage: 'mark_failed',
      durationMs: Date.now() - stageStart,
      status: 'error',
      error_code: ERROR_CODES.EXTRACTION_UNAVAILABLE,
      diag,
      metrics,
      totalElapsedMs: budget?.elapsed?.() ?? null
    });
  }
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
      diag: createDiag(),
      metrics: createRunMetrics()
    });
  }

  const body = parseBody(req);
  const documentId = String(body.documentId || body.document_id || '').trim();
  const token = bearerToken(req);
  const diag = createDiag();
  const metrics = createRunMetrics();
  const budget = createBudgetGuard(diag, metrics);
  diag.documentIdPresent = !!documentId;
  diag.tokenPresent = !!token;

  if (!token) {
    return fail(res, {
      status: 401,
      error_code: ERROR_CODES.AUTH_REQUIRED,
      error: 'Authentication required.',
      stage: 'auth_user_lookup',
      diag,
      metrics,
      budget
    });
  }
  if (!documentId) {
    return fail(res, {
      status: 400,
      error_code: ERROR_CODES.EXTRACTION_UNAVAILABLE,
      error: USER_EXTRACTION_FAILURE,
      stage: 'request',
      diag,
      metrics,
      budget
    });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail(res, {
      status: 503,
      error_code: ERROR_CODES.MISSING_SERVICE_ROLE_KEY,
      error: USER_EXTRACTION_FAILURE,
      stage: 'config',
      diag,
      metrics,
      budget
    });
  }

  let userId = null;
  try {
    const user = await budget.runStage('auth_user_lookup', () => getAuthUserFromAccessToken(token));
    if (!user?.id) {
      return fail(res, {
        status: 401,
        error_code: ERROR_CODES.AUTH_REQUIRED,
        error: 'Authentication required.',
        stage: 'auth_user_lookup',
        diag,
        metrics,
        budget
      });
    }
    diag.userResolved = true;
    userId = user.id;

    const profileLookup = await budget.runStage('profile_role_lookup', () => getExtractionProfileRole(userId));
    if (!profileLookup.ok) {
      return fail(res, {
        status: 503,
        error_code: ERROR_CODES.PROFILE_LOOKUP_FAILED,
        error: USER_EXTRACTION_FAILURE,
        stage: 'profile_role_lookup',
        diag,
        metrics,
        budget
      });
    }
    diag.profileResolved = true;

    const role = String(profileLookup.role || '').trim().toLowerCase();
    if (!profileLookup.profile || role !== 'counsellor') {
      return fail(res, {
        status: 403,
        error_code: ERROR_CODES.ROLE_NOT_AUTHORISED,
        error: 'Mental Health Professional access required.',
        stage: 'profile_role_lookup',
        diag,
        metrics,
        budget
      });
    }

    const document = await budget.runStage('document_metadata_lookup', () => getLicenseDocument(documentId, userId));
    diag.documentResolved = !!document;
    if (!document) {
      return fail(res, {
        status: 404,
        error_code: ERROR_CODES.DOCUMENT_NOT_FOUND,
        error: 'Licence document not found.',
        stage: 'document_metadata_lookup',
        diag,
        metrics,
        budget
      });
    }

    const bucket = String(document.storage_bucket || MHP_LICENSE_BUCKET).trim();
    const storagePath = String(document.storage_path || '').trim();
    if (!storagePath || bucket !== MHP_LICENSE_BUCKET) {
      return fail(res, {
        status: 400,
        error_code: ERROR_CODES.DOCUMENT_NOT_FOUND,
        error: 'Licence document not found.',
        stage: 'document_metadata_lookup',
        diag,
        metrics,
        budget
      });
    }

    await budget.runStage('mark_processing', () => patchLicenseDocument(documentId, userId, {
      extraction_status: 'processing'
    }));

    try {
      const pdfBuffer = await budget.runStage('storage_download', () => downloadLicensePdf(bucket, storagePath));
      metrics.pdfByteLength = pdfBuffer.length;

      const pdfExtractResult = await budget.runStage('pdf_text_extract', async () => {
        const result = extractPdfTextSafe(
          pdfBuffer,
          (stage) => budget.assertBudget(stage)
        );
        metrics.scannedStreamCount = result.stats.scannedStreamCount;
        metrics.skippedStreamCount = result.stats.skippedStreamCount;
        metrics.candidateStreamCount = result.stats.candidateStreamCount;
        metrics.inflatedStreamCount = result.stats.inflatedStreamCount;
        metrics.extractedTextLength = result.stats.extractedTextLength;
        metrics.parseDurationMs = result.stats.parseDurationMs;
        return result.text;
      });
      const pdfText = pdfExtractResult;

      if (!pdfText || pdfText.length < MIN_PDF_TEXT_CHARS) {
        const error = new Error('Could not extract readable text from the licence PDF.');
        error.error_code = ERROR_CODES.PDF_TEXT_UNREADABLE;
        error.status = 422;
        throw error;
      }

      const deterministic = await budget.runStage('deterministic_parse', async () => parseDeterministicLicenseFields(pdfText));
      metrics.deterministicFieldCount = countHighConfidenceDeterministicFields(
        deterministic.fields,
        deterministic.confidence
      );

      let extractionModel = DETERMINISTIC_MODEL;
      let extraction;
      if (isDeterministicExtractionSufficient(deterministic.fields, deterministic.confidence)) {
        extraction = sanitizeExtraction({
          ...deterministic.fields,
          confidence: deterministic.confidence,
          requires_human_review: true
        });
      } else {
        metrics.usedOpenAi = true;
        budget.assertBudget('openai_fallback');
        const remainingBudgetMs = FUNCTION_BUDGET_MS - budget.elapsed();
        const modelResult = await budget.runStage('openai_fallback', () => callExtractionModel(
          pdfText,
          remainingBudgetMs
        ));
        extraction = sanitizeExtraction(modelResult);
        extractionModel = DEFAULT_MODEL;
      }

      const saved = await budget.runStage('save_extraction', () => saveCompletedExtraction(
        documentId,
        userId,
        extraction,
        extractionModel
      ));

      logExtractionStage({
        stage: 'complete',
        durationMs: 0,
        status: 'ok',
        diag,
        metrics,
        totalElapsedMs: budget.elapsed()
      });

      return res.status(200).json(buildExtractionResponse(
        saved.extraction,
        saved.extractionModel,
        documentId,
        saved.updated,
        saved.extractedAt
      ));
    } catch (err) {
      await markExtractionFailed(documentId, userId, budget, diag, metrics);
      const mapped = mapExtractionError(err);
      return fail(res, {
        status: mapped.status,
        error_code: mapped.error_code,
        error: mapped.error,
        stage: err?.stage || 'extract',
        diag,
        metrics,
        budget
      });
    }
  } catch (error) {
    await markExtractionFailed(documentId, userId, budget, diag, metrics);
    const mapped = mapExtractionError(error);
    return fail(res, {
      status: mapped.status >= 500 ? mapped.status : mapped.status,
      error_code: error?.error_code || mapped.error_code || ERROR_CODES.EXTRACTION_UNAVAILABLE,
      error: mapped.error,
      stage: error?.stage || 'handler',
      diag,
      metrics,
      budget
    });
  }
}
