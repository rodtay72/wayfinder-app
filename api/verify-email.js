import crypto from 'node:crypto';
import {
  parseBody,
  patchProfileByUserId,
  supabaseAdminFetch
} from './_supabase-admin.js';

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const hashToken = (token) => crypto.createHash('sha256').update(token, 'utf8').digest('hex');

async function getProfileByTokenHash(tokenHash) {
  const params = new URLSearchParams({
    select: 'user_id,email_verified,verification_token_expires_at',
    verification_token: `eq.${tokenHash}`,
    limit: '1'
  });
  const data = await supabaseAdminFetch(`/rest/v1/profiles?${params.toString()}`, {
    method: 'GET'
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  const token = String(body.token || '').trim();

  if (!token) {
    return res.status(400).json({
      status: 'missing',
      message: 'Verification token is missing.'
    });
  }

  try {
    const tokenHash = hashToken(token);
    const profile = await getProfileByTokenHash(tokenHash);

    if (!profile) {
      return res.status(400).json({
        status: 'invalid',
        message: 'This verification link is invalid or has already been used.'
      });
    }

    if (profile.email_verified) {
      await patchProfileByUserId(profile.user_id, {
        verification_token: null,
        verification_token_expires_at: null
      });
      return res.status(409).json({
        status: 'used',
        message: 'This verification link has already been used.'
      });
    }

    const expiresAt = profile.verification_token_expires_at ? new Date(profile.verification_token_expires_at) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      await patchProfileByUserId(profile.user_id, {
        verification_token: null,
        verification_token_expires_at: null
      });
      return res.status(410).json({
        status: 'expired',
        message: 'This verification link has expired. Please request a new one.'
      });
    }

    await patchProfileByUserId(profile.user_id, {
      email_verified: true,
      verified_at: new Date().toISOString(),
      verification_token: null,
      verification_token_expires_at: null
    });

    return res.status(200).json({
      status: 'verified',
      message: 'Your Wayfinder account is verified.'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'We could not verify this link. Please try again or request a new link.'
    });
  }
}
