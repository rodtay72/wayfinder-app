const DEFAULT_SUPABASE_URL = 'https://mhvjmakraociizeqbvbz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odmptYWtyYW9jaWl6ZXFidmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODQ5ODgsImV4cCI6MjA5NTQ2MDk4OH0.WgUnHsG4SiiEO1pjBxHQkWe8eXgqVii0asbG9cNIeBQ';

export const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

const jsonHeaders = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
});

export const parseBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const requireServiceRoleKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }
  return key;
};

export async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function supabaseAdminFetch(path, options = {}) {
  const key = requireServiceRoleKey();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders(key),
      ...(options.headers || {})
    }
  });
  const data = await readJson(response);

  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.error || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getAuthUserFromAccessToken(accessToken) {
  if (!accessToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });
  const data = await readJson(response);
  if (!response.ok) return null;
  return data;
}

export async function findAuthUserByEmail(email) {
  const target = normalizeEmail(email);
  if (!target) return null;

  for (let page = 1; page <= 5; page += 1) {
    const params = new URLSearchParams({ page: String(page), per_page: '1000' });
    const data = await supabaseAdminFetch(`/auth/v1/admin/users?${params.toString()}`, {
      method: 'GET'
    });
    const users = Array.isArray(data) ? data : data?.users || [];
    const found = users.find(user => normalizeEmail(user.email) === target);
    if (found) return found;
    if (users.length < 1000) break;
  }

  return null;
}

export async function getProfileByUserId(userId) {
  if (!userId) return null;
  const params = new URLSearchParams({
    select: 'user_id,parent_id,role,email_verified,email_sent_at,verification_email_attempts,verification_email_last_attempt_at',
    user_id: `eq.${userId}`,
    limit: '1'
  });
  const data = await supabaseAdminFetch(`/rest/v1/profiles?${params.toString()}`, {
    method: 'GET'
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function patchProfileByUserId(userId, patch, extraQuery = {}) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    ...extraQuery
  });
  return supabaseAdminFetch(`/rest/v1/profiles?${params.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch)
  });
}
