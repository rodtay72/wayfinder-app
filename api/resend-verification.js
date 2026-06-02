import crypto from 'node:crypto';
import {
  findAuthUserByEmail,
  getAuthUserFromAccessToken,
  getProfileByUserId,
  normalizeEmail,
  parseBody,
  patchProfileByUserId
} from './_supabase-admin.js';
import { sendVerificationEmail } from './_verification-email.js';

const GENERIC_MESSAGE = 'If this email exists, a verification link has been sent.';
const RATE_LIMIT_SECONDS = 60;
const EXPIRY_HOURS = 24;

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const hashToken = (token) => crypto.createHash('sha256').update(token, 'utf8').digest('hex');

const bearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

const secondsUntilRetry = (lastAttemptAt) => {
  if (!lastAttemptAt) return 0;
  const elapsedMs = Date.now() - new Date(lastAttemptAt).getTime();
  const remaining = RATE_LIMIT_SECONDS - Math.floor(elapsedMs / 1000);
  return remaining > 0 ? remaining : 0;
};

async function resolveUser(req, body) {
  const token = bearerToken(req);
  if (token) {
    const user = await getAuthUserFromAccessToken(token);
    return { user, authenticated: true };
  }

  const email = normalizeEmail(body.email);
  if (!email) return { user: null, authenticated: false };
  const user = await findAuthUserByEmail(email);
  return { user, authenticated: false };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);

  try {
    const { user, authenticated } = await resolveUser(req, body);
    if (!user?.id || !user?.email) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    const profile = await getProfileByUserId(user.id);
    if (!profile || profile.email_verified) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    const retryAfterSeconds = secondsUntilRetry(profile.verification_email_last_attempt_at);
    if (retryAfterSeconds > 0) {
      if (!authenticated) return res.status(200).json({ message: GENERIC_MESSAGE });
      return res.status(429).json({
        message: 'Please wait before requesting another verification email.',
        retryAfterSeconds
      });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - RATE_LIMIT_SECONDS * 1000).toISOString();
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    const attempts = Number(profile.verification_email_attempts || 0) + 1;

    const updateFilter = {
      email_verified: 'eq.false',
      or: `(verification_email_last_attempt_at.is.null,verification_email_last_attempt_at.lt.${cutoff})`
    };
    const updated = await patchProfileByUserId(user.id, {
      verification_token: tokenHash,
      verification_token_expires_at: expiresAt,
      verification_email_attempts: attempts,
      verification_email_last_attempt_at: now.toISOString()
    }, updateFilter);

    if (!Array.isArray(updated) || updated.length === 0) {
      if (!authenticated) return res.status(200).json({ message: GENERIC_MESSAGE });
      return res.status(429).json({
        message: 'Please wait before requesting another verification email.',
        retryAfterSeconds: RATE_LIMIT_SECONDS
      });
    }

    try {
      const result = await sendVerificationEmail(user.email, token);
      await patchProfileByUserId(user.id, {
        email_sent_at: new Date().toISOString(),
        email_delivery_provider: result.provider
      });
    } catch (sendError) {
      await patchProfileByUserId(user.id, {
        email_delivery_provider: 'send-failed'
      });
      if (!authenticated) return res.status(200).json({ message: GENERIC_MESSAGE });
      return res.status(502).json({
        message: 'Verification email could not be sent. Please try again later.'
      });
    }

    return res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (error) {
    return res.status(500).json({
      message: 'Verification email could not be sent. Please try again later.'
    });
  }
}
