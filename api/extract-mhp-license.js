import zlib from 'node:zlib';
import {
  SUPABASE_URL,
  getAuthUserFromAccessToken,
  getProfileByUserId,
  parseBody,
  readJson,
  requireServiceRoleKey,
  supabaseAdminFetch
} from './_supabase-admin.js';

const MHP_LICENSE_BUCKET = 'professional-license-documents';
const DEFAULT_MODEL = process.env.MHP_LICENSE_EXTRACTION_MODEL || 'gpt-4o-mini';
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 12000;

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

const collectPdfTextOperators = (raw) => {
  const chunks = [];
  const tjRegex = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(raw)) !== null) {
    const text = decodePdfString(match[1]).trim();
    if (text) chunks.push(text);
  }
  const tjArrayRegex = /\[((?:\([^)]*\)|[^\]])*)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(raw)) !== null) {
    const inner = match[1];
    const partRegex = /\(((?:\\.|[^\\)])*)\)/g;
    let part;
    while ((part = partRegex.exec(inner)) !== null) {
      const text = decodePdfString(part[1]).trim();
      if (text) chunks.push(text);
    }
  }
  return chunks.join('\n');
};

const extractPdfText = (buffer) => {
  const raw = buffer.toString('latin1');
  const chunks = [collectPdfTextOperators(raw)];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(raw)) !== null) {
    try {
      const inflated = zlib.inflateSync(Buffer.from(streamMatch[1], 'latin1'));
      const text = collectPdfTextOperators(inflated.toString('latin1'));
      if (text) chunks.push(text);
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
  const serviceKey = requireServiceRoleKey();
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
    error.status = response.status;
    throw error;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_PDF_BYTES) {
    const error = new Error('Licence PDF exceeds size limit.');
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
    error.status = response.status;
    throw error;
  }
  const text = data?.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  const documentId = String(body.documentId || body.document_id || '').trim();
  const token = bearerToken(req);

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }
  if (!documentId) {
    return res.status(400).json({ ok: false, error: 'documentId is required.' });
  }

  let userId = null;
  try {
    const user = await getAuthUserFromAccessToken(token);
    if (!user?.id) {
      return res.status(401).json({ ok: false, error: 'Authentication required.' });
    }
    userId = user.id;

    const profile = await getProfileByUserId(userId);
    if (!profile || String(profile.role || '').trim().toLowerCase() !== 'counsellor') {
      return res.status(403).json({ ok: false, error: 'Mental Health Professional access required.' });
    }

    const document = await getLicenseDocument(documentId, userId);
    if (!document) {
      return res.status(404).json({ ok: false, error: 'Licence document not found.' });
    }

    const bucket = String(document.storage_bucket || MHP_LICENSE_BUCKET).trim();
    const storagePath = String(document.storage_path || '').trim();
    if (!storagePath || bucket !== MHP_LICENSE_BUCKET) {
      return res.status(400).json({ ok: false, error: 'Licence document is not available for extraction.' });
    }

    const currentExtractionStatus = String(document.extraction_status || 'pending').trim().toLowerCase();
    if (currentExtractionStatus === 'processing') {
      return res.status(409).json({ ok: false, error: 'Extraction is already in progress.' });
    }

    await patchLicenseDocument(documentId, userId, {
      extraction_status: 'processing'
    });

    let extraction = null;
    try {
      const pdfBuffer = await downloadLicensePdf(bucket, storagePath);
      const pdfText = extractPdfText(pdfBuffer);
      if (!pdfText || pdfText.length < 20) {
        const error = new Error('Could not extract readable text from the licence PDF.');
        error.stage = 'pdfText';
        throw error;
      }

      const modelResult = await callExtractionModel(pdfText);
      extraction = sanitizeExtraction(modelResult);
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
      const status = err.status === 401 || err.status === 403 || err.status === 404
        ? err.status
        : err.stage === 'pdfText'
          ? 422
          : err.status || 500;
      return res.status(status).json({
        ok: false,
        error: status >= 500
          ? 'Licence extraction is unavailable right now.'
          : 'Licence extraction failed. Please try again or enter details manually later.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Licence extraction is unavailable right now.'
    });
  }
}
