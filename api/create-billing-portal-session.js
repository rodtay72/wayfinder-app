import {
  getAuthUserFromAccessToken,
  supabaseAdminFetch,
  parseBody,
  readJson
} from './_supabase-admin.js';

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

const isAuthEmailVerified = (user) => {
  if (!user) return false;
  if (user.email_confirmed_at) return true;
  if (user.confirmed_at) return true;
  return false;
};

async function getParentProfileByUserId(userId) {
  if (!userId) return null;
  const params = new URLSearchParams({
    select: 'user_id,role',
    user_id: `eq.${userId}`,
    limit: '1'
  });
  const data = await supabaseAdminFetch(`/rest/v1/profiles?${params.toString()}`, {
    method: 'GET'
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function getStripeCustomerIdForUser(userId) {
  if (!userId) return null;
  const params = new URLSearchParams({
    select: 'stripe_customer_id',
    user_id: `eq.${userId}`,
    limit: '1'
  });
  const rows = await supabaseAdminFetch(`/rest/v1/stripe_billing_references?${params.toString()}`, {
    method: 'GET'
  });
  if (!Array.isArray(rows) || !rows[0]?.stripe_customer_id) return null;
  const customerId = String(rows[0].stripe_customer_id).trim();
  return customerId || null;
}

const getPortalConfig = () => {
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim().replace(/\/+$/, '');

  if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_test_')) {
    return null;
  }

  if (!appBaseUrl || !/^https:\/\/.+/i.test(appBaseUrl)) {
    return null;
  }

  return { stripeSecretKey, appBaseUrl };
};

const logPortalFailure = (reason, details = {}) => {
  console.error(`[billing-portal] ${reason}`, details);
};

async function createStripeBillingPortalSession({ stripeSecretKey, customerId, returnUrl }) {
  const params = new URLSearchParams();
  params.append('customer', customerId);
  params.append('return_url', returnUrl);

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await readJson(response);
  if (!response.ok) {
    const stripeError = data?.error || {};
    logPortalFailure('Stripe portal session create failed', {
      httpStatus: response.status,
      stripeType: stripeError.type || null,
      stripeCode: stripeError.code || null
    });
    return null;
  }

  return data;
}

async function requireVerifiedParent(req, res) {
  const accessToken = bearerToken(req);
  const user = await getAuthUserFromAccessToken(accessToken);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required.' });
    return { ok: false };
  }

  let profile;
  try {
    profile = await getParentProfileByUserId(user.id);
  } catch (err) {
    const message = String(err?.message || '');
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      res.status(503).json({ error: 'Billing portal is not configured.' });
      return { ok: false };
    }
    logPortalFailure('profile lookup failed', { httpStatus: err?.status || null });
    res.status(500).json({ error: 'Billing portal could not be opened.' });
    return { ok: false };
  }

  if (!profile) {
    res.status(403).json({ error: 'Parent profile required.' });
    return { ok: false };
  }

  if (String(profile.role || '').toLowerCase() !== 'parent') {
    res.status(403).json({ error: 'Parent account required.' });
    return { ok: false };
  }

  if (!isAuthEmailVerified(user)) {
    res.status(403).json({ error: 'Verified email required.' });
    return { ok: false };
  }

  return { ok: true, user };
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  parseBody(req);

  const config = getPortalConfig();
  if (!config) {
    logPortalFailure('portal config missing');
    return res.status(503).json({ error: 'Billing portal is not configured.' });
  }

  const auth = await requireVerifiedParent(req, res);
  if (!auth.ok) return undefined;

  let customerId;
  try {
    customerId = await getStripeCustomerIdForUser(auth.user.id);
  } catch (err) {
    logPortalFailure('billing reference lookup failed', { httpStatus: err?.status || null });
    return res.status(500).json({ error: 'Billing portal could not be opened.' });
  }

  if (!customerId) {
    return res.status(404).json({ error: 'No billing account found yet.' });
  }

  const returnUrl = `${config.appBaseUrl}/?billing=return`;

  let session;
  try {
    session = await createStripeBillingPortalSession({
      stripeSecretKey: config.stripeSecretKey,
      customerId,
      returnUrl
    });
  } catch {
    logPortalFailure('Stripe portal request failed');
    return res.status(500).json({ error: 'Billing portal could not be opened.' });
  }

  const url = String(session?.url || '').trim();
  if (!url) {
    logPortalFailure('Stripe portal session missing url');
    return res.status(500).json({ error: 'Billing portal could not be opened.' });
  }

  return res.status(200).json({ url });
}
