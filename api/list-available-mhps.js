import {
  SUPABASE_URL,
  getAuthUserFromAccessToken,
  parseBody,
  readJson,
  requireServiceRoleKey,
  supabaseAdminFetch
} from './_supabase-admin.js';

const PORTRAIT_BUCKET = 'professional-profile-portraits';
const PORTRAIT_SIGNED_URL_SECONDS = Number(process.env.MHP_PARENT_PORTRAIT_SIGNED_URL_SECONDS || 3600);

const ERROR_CODES = {
  AUTH_REQUIRED: 'auth_required',
  STORAGE_NOT_READY: 'storage_not_ready',
  LIST_FAILED: 'list_failed'
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

const trimOrNull = (value) => {
  const text = String(value || '').trim();
  return text || null;
};

const buildDisplayLabel = ({ wayfinderId, fullName, professionalTitle, institutionName }) => {
  if (fullName) return fullName;
  if (professionalTitle) return professionalTitle;
  if (institutionName) return institutionName;
  return wayfinderId ? `Mental Health Practitioner (MHP) ${wayfinderId}` : 'Mental Health Practitioner (MHP)';
};

const membershipIsActive = (row) => {
  if (String(row?.membership_status || '').toLowerCase() !== 'active') return false;
  const expiresAt = row?.institutional_membership_expires_at;
  if (!expiresAt) return true;
  const expiryMs = new Date(expiresAt).getTime();
  return Number.isFinite(expiryMs) && expiryMs > Date.now();
};

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const jsonError = (res, { status, error_code, error, rows = [] }) => res.status(status).json({
  ok: false,
  error_code: error_code || ERROR_CODES.LIST_FAILED,
  error: error || 'Request failed.',
  rows
});

async function createPortraitSignedUrl(storagePath) {
  const serviceKey = requireServiceRoleKey();
  const encodedPath = encodeStoragePath(storagePath);
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(PORTRAIT_BUCKET)}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: PORTRAIT_SIGNED_URL_SECONDS })
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Portrait signing failed.');
    error.status = response.status;
    throw error;
  }
  const relative = data?.signedURL || data?.signedUrl || null;
  if (!relative) return null;
  return relative.startsWith('http')
    ? relative
    : `${SUPABASE_URL}/storage/v1${relative.startsWith('/') ? relative : `/${relative}`}`;
}

async function fetchPublishedMhpCandidates() {
  const profiles = await supabaseAdminFetch(
    '/rest/v1/mental_health_professional_profiles?profile_status=eq.published&profile_visible=eq.true&select=user_id,full_name,professional_title',
    { method: 'GET' }
  );
  const mhpRows = Array.isArray(profiles) ? profiles : [];
  const userIds = mhpRows
    .map((row) => String(row?.user_id || '').trim())
    .filter(Boolean);
  if (!userIds.length) return [];

  const profileRows = [];
  for (const chunk of chunkArray(userIds, 80)) {
    const inList = chunk.map((id) => encodeURIComponent(id)).join(',');
    const rows = await supabaseAdminFetch(
      `/rest/v1/profiles?user_id=in.(${inList})&role=eq.counsellor&parent_id=not.is.null&select=user_id,parent_id`,
      { method: 'GET' }
    );
    if (Array.isArray(rows)) profileRows.push(...rows);
  }

  const membershipRows = [];
  for (const chunk of chunkArray(userIds, 80)) {
    const inList = chunk.map((id) => encodeURIComponent(id)).join(',');
    const rows = await supabaseAdminFetch(
      `/rest/v1/mental_health_professional_memberships?user_id=in.(${inList})&membership_status=eq.active&select=user_id,institution_name,institutional_membership_expires_at,membership_status`,
      { method: 'GET' }
    );
    if (Array.isArray(rows)) membershipRows.push(...rows);
  }

  const profileByUserId = new Map(profileRows.map((row) => [String(row.user_id), row]));
  const membershipByUserId = new Map(membershipRows.map((row) => [String(row.user_id), row]));

  return mhpRows
    .map((mhp) => {
      const userId = String(mhp.user_id || '').trim();
      const profile = profileByUserId.get(userId);
      const membership = membershipByUserId.get(userId);
      if (!profile?.parent_id || !membershipIsActive(membership)) return null;
      const fullName = trimOrNull(mhp.full_name);
      if (!fullName) return null;
      const wayfinderId = trimOrNull(profile.parent_id);
      if (!wayfinderId) return null;
      const professionalTitle = trimOrNull(mhp.professional_title);
      const institutionName = trimOrNull(membership?.institution_name);
      return {
        userId,
        wayfinderId,
        fullName,
        professionalTitle,
        institutionName,
        displayLabel: buildDisplayLabel({
          wayfinderId,
          fullName,
          professionalTitle,
          institutionName
        })
      };
    })
    .filter(Boolean);
}

async function fetchSelectedPortraitPaths(userIds) {
  if (!userIds.length) return new Map();
  const portraitRows = [];
  for (const chunk of chunkArray(userIds, 80)) {
    const inList = chunk.map((id) => encodeURIComponent(id)).join(',');
    const rows = await supabaseAdminFetch(
      `/rest/v1/mental_health_professional_profile_images?user_id=in.(${inList})&image_kind=eq.approved_portrait&image_status=eq.approved&selected_at=not.is.null&storage_bucket=eq.${encodeURIComponent(PORTRAIT_BUCKET)}&select=user_id,storage_path,selected_at&order=selected_at.desc`,
      { method: 'GET' }
    );
    if (Array.isArray(rows)) portraitRows.push(...rows);
  }

  const selectedByUserId = new Map();
  for (const row of portraitRows) {
    const userId = String(row?.user_id || '').trim();
    const storagePath = trimOrNull(row?.storage_path);
    if (!userId || !storagePath || selectedByUserId.has(userId)) continue;
    selectedByUserId.set(userId, storagePath);
  }
  return selectedByUserId;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed', rows: [] });

  parseBody(req);

  try {
    const accessToken = bearerToken(req);
    const user = await getAuthUserFromAccessToken(accessToken);
    if (!user?.id) {
      return jsonError(res, {
        status: 401,
        error_code: ERROR_CODES.AUTH_REQUIRED,
        error: 'Sign in required.'
      });
    }

    requireServiceRoleKey();

    const candidates = await fetchPublishedMhpCandidates();
    const portraitPaths = await fetchSelectedPortraitPaths(candidates.map((row) => row.userId));
    const expiresAt = new Date(Date.now() + PORTRAIT_SIGNED_URL_SECONDS * 1000).toISOString();

    const rows = [];
    for (const candidate of candidates) {
      const storagePath = portraitPaths.get(candidate.userId) || null;
      let approvedPortraitUrl = null;
      if (storagePath) {
        try {
          approvedPortraitUrl = await createPortraitSignedUrl(storagePath);
        } catch {
          approvedPortraitUrl = null;
        }
      }
      rows.push({
        wayfinder_id: candidate.wayfinderId,
        display_label: candidate.displayLabel,
        full_name: candidate.fullName,
        professional_title: candidate.professionalTitle,
        institution_name: candidate.institutionName,
        approved_portrait_url: approvedPortraitUrl,
        portrait_expires_at: approvedPortraitUrl ? expiresAt : null
      });
    }

    rows.sort((a, b) => {
      const nameCompare = String(a.full_name || '').localeCompare(String(b.full_name || ''), undefined, { sensitivity: 'base' });
      if (nameCompare !== 0) return nameCompare;
      return String(a.wayfinder_id || '').localeCompare(String(b.wayfinder_id || ''));
    });

    return res.status(200).json({ ok: true, rows });
  } catch (err) {
    const message = String(err?.message || err);
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return jsonError(res, {
        status: 503,
        error_code: ERROR_CODES.STORAGE_NOT_READY,
        error: 'Mental Health Practitioner (MHP) listing is not ready yet.'
      });
    }
    return jsonError(res, {
      status: 503,
      error_code: ERROR_CODES.LIST_FAILED,
      error: 'Mental Health Practitioner (MHP) listing could not be loaded right now.'
    });
  }
}
