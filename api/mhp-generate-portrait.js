import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  getAuthUserFromAccessToken,
  parseBody,
  readJson,
  supabaseAdminFetch
} from './_supabase-admin.js';

const SOURCE_BUCKET = 'professional-profile-image-sources';
const PORTRAIT_BUCKET = 'professional-profile-portraits';
const PORTRAIT_STYLE = 'wayfinder_ai_sketch_v1';
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_GENERATED_BYTES = 5 * 1024 * 1024;
const OPENAI_TIMEOUT_MS = Number(process.env.MHP_PORTRAIT_GENERATION_TIMEOUT_MS || 110000);

const SKETCH_PROMPT = 'Create a warm Wayfinder-style professional portrait illustration from this source photo. Use a soft pencil-sketch and gentle editorial illustration style with subtle natural colour, clean neutral background, and kind professional presence. Keep the person recognisable from the source image, but make the result clearly illustrated rather than photographic. Do not include text, logos, clinical symbols, diagnosis imagery, children, documents, badges, or decorative frames.';

const ERROR_CODES = {
  AUTH_REQUIRED: 'auth_required',
  NOT_OWNER_ADMIN: 'not_owner_admin',
  INVALID_REQUEST: 'invalid_request',
  NO_SOURCE_PHOTO: 'no_source_photo',
  MISSING_OPENAI_KEY: 'missing_openai_key',
  MISSING_SERVICE_ROLE_KEY: 'missing_service_role_key',
  STORAGE_DOWNLOAD_FAILED: 'storage_download_failed',
  STORAGE_UPLOAD_FAILED: 'storage_upload_failed',
  METADATA_INSERT_FAILED: 'metadata_insert_failed',
  GENERATED_NOT_FOUND: 'generated_not_found',
  GENERATION_FAILED: 'generation_failed',
  OPENAI_TIMEOUT: 'openai_timeout',
  OPENAI_MODERATION: 'openai_moderation',
  STORAGE_NOT_READY: 'storage_not_ready'
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

const encodeStoragePath = (storagePath) => String(storagePath || '')
  .split('/')
  .filter(Boolean)
  .map((part) => encodeURIComponent(part))
  .join('/');

const buildGeneratedStoragePath = (mhpUserId) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = Math.random().toString(36).slice(2, 10);
  return `mhp/${mhpUserId}/generated/${stamp}-${suffix}.png`;
};

const buildApprovedStoragePath = (mhpUserId) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = Math.random().toString(36).slice(2, 10);
  return `mhp/${mhpUserId}/approved/${stamp}-${suffix}.png`;
};

const jsonError = (res, { status, error_code, error, record = null }) => res.status(status).json({
  ok: false,
  error_code: error_code || ERROR_CODES.GENERATION_FAILED,
  error: error || 'Request failed.',
  record
});

const jsonOk = (res, record) => res.status(200).json({ ok: true, record });

async function verifyOwnerAdmin(accessToken) {
  const user = await getAuthUserFromAccessToken(accessToken);
  if (!user?.id) {
    return { ok: false, status: 401, error_code: ERROR_CODES.AUTH_REQUIRED, userId: null };
  }
  if (!SUPABASE_ANON_KEY) {
    return { ok: false, status: 503, error_code: ERROR_CODES.STORAGE_NOT_READY, userId: user.id };
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_wayfinder_owner_admin`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: '{}'
  });
  const data = await readJson(response);
  if (!response.ok || !data) {
    return { ok: false, status: 403, error_code: ERROR_CODES.NOT_OWNER_ADMIN, userId: user.id };
  }
  return { ok: true, userId: user.id };
}

async function listOwnerMhpProfileImages(accessToken, mhpUserId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/owner_list_mhp_profile_images`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ p_mhp_user_id: mhpUserId })
  });
  const data = await readJson(response);
  if (!response.ok) {
    const text = JSON.stringify(data || {}).toLowerCase();
    if (response.status === 404 || text.includes('owner_list_mhp_profile_images')) {
      const error = new Error('Owner image review RPC unavailable.');
      error.error_code = ERROR_CODES.STORAGE_NOT_READY;
      error.status = 503;
      throw error;
    }
    const error = new Error(data?.message || 'Could not list MHP profile images.');
    error.error_code = ERROR_CODES.STORAGE_NOT_READY;
    error.status = response.status;
    throw error;
  }
  return Array.isArray(data) ? data : [];
}

async function downloadStorageObject(bucket, storagePath) {
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
    const error = new Error(detail?.message || detail?.error || 'Storage download failed.');
    error.error_code = ERROR_CODES.STORAGE_DOWNLOAD_FAILED;
    error.status = response.status;
    throw error;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

async function uploadStorageObject(bucket, storagePath, buffer, contentType) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    error.error_code = ERROR_CODES.MISSING_SERVICE_ROLE_KEY;
    error.status = 503;
    throw error;
  }
  const encodedPath = encodeStoragePath(storagePath);
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'false'
    },
    body: buffer
  });
  if (!response.ok) {
    const detail = await readJson(response);
    const error = new Error(detail?.message || detail?.error || 'Storage upload failed.');
    error.error_code = ERROR_CODES.STORAGE_UPLOAD_FAILED;
    error.status = response.status;
    throw error;
  }
}

async function insertProfileImageMetadata(row) {
  const rows = await supabaseAdminFetch('/rest/v1/mental_health_professional_profile_images', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row)
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function getGeneratedPortraitRow(generatedImageId, mhpUserId) {
  const params = new URLSearchParams({
    select: 'id,user_id,image_kind,image_status,storage_bucket,storage_path,mime_type,file_size_bytes,portrait_style,created_at',
    id: `eq.${generatedImageId}`,
    user_id: `eq.${mhpUserId}`,
    image_kind: 'eq.generated_portrait',
    image_status: 'eq.generated',
    storage_bucket: `eq.${PORTRAIT_BUCKET}`,
    limit: '1'
  });
  const rows = await supabaseAdminFetch(`/rest/v1/mental_health_professional_profile_images?${params.toString()}`, {
    method: 'GET'
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

const sourceFilenameForMime = (mimeType) => {
  const mime = String(mimeType || '').toLowerCase();
  if (mime === 'image/png') return 'source.png';
  if (mime === 'image/webp') return 'source.webp';
  return 'source.jpg';
};

async function generateSketchFromSource(sourceBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.');
    error.error_code = ERROR_CODES.MISSING_OPENAI_KEY;
    error.status = 503;
    throw error;
  }

  const model = String(process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1').trim();
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', SKETCH_PROMPT);
  form.append('size', '1024x1024');
  form.append('response_format', 'b64_json');
  form.append('image', new Blob([sourceBuffer], { type: mimeType || 'image/jpeg' }), sourceFilenameForMime(mimeType));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  let response;
  try {
    response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form,
      signal: controller.signal
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      const error = new Error('OpenAI image generation timed out.');
      error.error_code = ERROR_CODES.OPENAI_TIMEOUT;
      error.status = 504;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await readJson(response);
  if (!response.ok) {
    const message = String(data?.error?.message || data?.message || response.statusText || '').toLowerCase();
    const error = new Error(data?.error?.message || data?.message || 'OpenAI image generation failed.');
    if (message.includes('moderation') || message.includes('safety') || message.includes('policy')) {
      error.error_code = ERROR_CODES.OPENAI_MODERATION;
    } else {
      error.error_code = ERROR_CODES.GENERATION_FAILED;
    }
    error.status = response.status >= 400 && response.status < 600 ? response.status : 502;
    throw error;
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    const error = new Error('OpenAI returned no image data.');
    error.error_code = ERROR_CODES.GENERATION_FAILED;
    error.status = 502;
    throw error;
  }

  const pngBuffer = Buffer.from(b64, 'base64');
  if (!pngBuffer.length || pngBuffer.length > MAX_GENERATED_BYTES) {
    const error = new Error('Generated portrait exceeds size limit.');
    error.error_code = ERROR_CODES.GENERATION_FAILED;
    error.status = 413;
    throw error;
  }
  return pngBuffer;
}

const safeRecord = (row) => ({
  image_id: row.id,
  image_kind: row.image_kind,
  image_status: row.image_status,
  storage_bucket: row.storage_bucket,
  storage_path: row.storage_path,
  mime_type: row.mime_type || null,
  file_size_bytes: row.file_size_bytes ?? null,
  portrait_style: row.portrait_style || null,
  created_at: row.created_at || null,
  approved_at: row.approved_at || null
});

async function handleGenerate({ res, accessToken, ownerUserId, mhpUserId }) {
  const rows = await listOwnerMhpProfileImages(accessToken, mhpUserId);
  const sourceRow = rows.find((row) => row.image_kind === 'source_photo');
  if (!sourceRow?.storage_bucket || !sourceRow?.storage_path) {
    return jsonError(res, {
      status: 400,
      error_code: ERROR_CODES.NO_SOURCE_PHOTO,
      error: 'Upload or ask the MHP to upload a private source photo first.'
    });
  }

  const sourceBucket = String(sourceRow.storage_bucket || '').trim();
  const sourcePath = String(sourceRow.storage_path || '').trim();
  if (sourceBucket !== SOURCE_BUCKET) {
    return jsonError(res, {
      status: 400,
      error_code: ERROR_CODES.NO_SOURCE_PHOTO,
      error: 'Upload or ask the MHP to upload a private source photo first.'
    });
  }

  const sourceBuffer = await downloadStorageObject(sourceBucket, sourcePath);
  if (sourceBuffer.length > MAX_SOURCE_BYTES) {
    return jsonError(res, {
      status: 400,
      error_code: ERROR_CODES.GENERATION_FAILED,
      error: 'The sketch could not be generated. Please try another source image or generate manually.'
    });
  }

  const pngBuffer = await generateSketchFromSource(sourceBuffer, sourceRow.mime_type || 'image/jpeg');
  const storagePath = buildGeneratedStoragePath(mhpUserId);
  await uploadStorageObject(PORTRAIT_BUCKET, storagePath, pngBuffer, 'image/png');

  const inserted = await insertProfileImageMetadata({
    user_id: mhpUserId,
    image_kind: 'generated_portrait',
    storage_bucket: PORTRAIT_BUCKET,
    storage_path: storagePath,
    mime_type: 'image/png',
    file_size_bytes: pngBuffer.length,
    portrait_style: PORTRAIT_STYLE,
    image_status: 'generated',
    selected_at: null,
    approved_by: null,
    approved_at: null
  });

  if (!inserted?.id) {
    return jsonError(res, {
      status: 503,
      error_code: ERROR_CODES.METADATA_INSERT_FAILED,
      error: 'Generated portrait storage is not ready yet. Apply PR #114 SQL.'
    });
  }

  return jsonOk(res, safeRecord(inserted));
}

async function handleApproveGenerated({ res, ownerUserId, mhpUserId, generatedImageId }) {
  const generatedRow = await getGeneratedPortraitRow(generatedImageId, mhpUserId);
  if (!generatedRow) {
    return jsonError(res, {
      status: 404,
      error_code: ERROR_CODES.GENERATED_NOT_FOUND,
      error: 'Generated sketch not found for this MHP.'
    });
  }

  const pngBuffer = await downloadStorageObject(PORTRAIT_BUCKET, generatedRow.storage_path);
  const approvedPath = buildApprovedStoragePath(mhpUserId);
  await uploadStorageObject(PORTRAIT_BUCKET, approvedPath, pngBuffer, 'image/png');

  const now = new Date().toISOString();
  const inserted = await insertProfileImageMetadata({
    user_id: mhpUserId,
    image_kind: 'approved_portrait',
    storage_bucket: PORTRAIT_BUCKET,
    storage_path: approvedPath,
    mime_type: 'image/png',
    file_size_bytes: pngBuffer.length,
    portrait_style: generatedRow.portrait_style || PORTRAIT_STYLE,
    image_status: 'approved',
    selected_at: now,
    approved_by: ownerUserId,
    approved_at: now
  });

  if (!inserted?.id) {
    return jsonError(res, {
      status: 503,
      error_code: ERROR_CODES.METADATA_INSERT_FAILED,
      error: 'Approved portrait could not be saved. Apply PR #114 SQL.'
    });
  }

  return jsonOk(res, safeRecord(inserted));
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return jsonError(res, { status: 405, error_code: ERROR_CODES.INVALID_REQUEST, error: 'Method not allowed.' });
  }

  const body = parseBody(req);
  const action = String(body.action || '').trim();
  const mhpUserId = String(body.mhpUserId || body.mhp_user_id || '').trim();
  const generatedImageId = String(body.generatedImageId || body.generated_image_id || '').trim();
  const token = bearerToken(req);

  if (!token) {
    return jsonError(res, { status: 401, error_code: ERROR_CODES.AUTH_REQUIRED, error: 'Authentication required.' });
  }
  if (!mhpUserId) {
    return jsonError(res, { status: 400, error_code: ERROR_CODES.INVALID_REQUEST, error: 'MHP user id is required.' });
  }
  if (!['generate', 'approveGenerated'].includes(action)) {
    return jsonError(res, { status: 400, error_code: ERROR_CODES.INVALID_REQUEST, error: 'Invalid action.' });
  }
  if (action === 'approveGenerated' && !generatedImageId) {
    return jsonError(res, { status: 400, error_code: ERROR_CODES.INVALID_REQUEST, error: 'Generated image id is required.' });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError(res, {
      status: 503,
      error_code: ERROR_CODES.MISSING_SERVICE_ROLE_KEY,
      error: 'Generated portrait storage is not ready yet. Apply PR #114 SQL.'
    });
  }

  try {
    const gate = await verifyOwnerAdmin(token);
    if (!gate.ok) {
      return jsonError(res, {
        status: gate.status,
        error_code: gate.error_code,
        error: gate.error_code === ERROR_CODES.AUTH_REQUIRED ? 'Authentication required.' : 'Owner admin required.'
      });
    }

    if (action === 'generate') {
      return await handleGenerate({ res, accessToken: token, ownerUserId: gate.userId, mhpUserId });
    }
    return await handleApproveGenerated({
      res,
      ownerUserId: gate.userId,
      mhpUserId,
      generatedImageId
    });
  } catch (err) {
    const errorCode = err?.error_code || ERROR_CODES.GENERATION_FAILED;
    const status = err?.status || (errorCode === ERROR_CODES.MISSING_OPENAI_KEY ? 503 : 502);
    let message = 'The sketch could not be generated. Please try another source image or generate manually.';
    if (errorCode === ERROR_CODES.MISSING_OPENAI_KEY) {
      message = 'Sketch generation is not configured yet.';
    } else if (errorCode === ERROR_CODES.STORAGE_NOT_READY || errorCode === ERROR_CODES.MISSING_SERVICE_ROLE_KEY) {
      message = 'Generated portrait storage is not ready yet. Apply PR #114 SQL.';
    } else if (errorCode === ERROR_CODES.NO_SOURCE_PHOTO) {
      message = 'Upload or ask the MHP to upload a private source photo first.';
    } else if (errorCode === ERROR_CODES.GENERATED_NOT_FOUND) {
      message = 'Generated sketch not found for this MHP.';
    } else if (errorCode === ERROR_CODES.OPENAI_TIMEOUT) {
      message = 'Sketch generation timed out. Please try again.';
    } else if (errorCode === ERROR_CODES.METADATA_INSERT_FAILED) {
      message = 'Generated portrait storage is not ready yet. Apply PR #114 SQL.';
    }
    console.error('[mhp-generate-portrait]', {
      action,
      mhpUserId,
      error_code: errorCode,
      message: err?.message || String(err)
    });
    return jsonError(res, { status, error_code: errorCode, error: message });
  }
}
