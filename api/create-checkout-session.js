import {
  getAuthUserFromAccessToken,
  getProfileByUserId,
  parseBody,
  readJson
} from './_supabase-admin.js';

const ALLOWED_PLAN_KEYS = new Set(['wayfinder_plus', 'wayfinder_connect']);
const ALLOWED_INTERVALS = new Set(['monthly', 'yearly']);

const PRICE_ENV_KEYS = {
  wayfinder_plus: {
    monthly: 'STRIPE_PRICE_PLUS_MONTHLY',
    yearly: 'STRIPE_PRICE_PLUS_YEARLY'
  },
  wayfinder_connect: {
    monthly: 'STRIPE_PRICE_CONNECT_MONTHLY',
    yearly: 'STRIPE_PRICE_CONNECT_YEARLY'
  }
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

const isTruthy = (value) => value === true || value === 'true' || value === 1 || value === '1';

const getCheckoutConfig = () => {
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim().replace(/\/+$/, '');

  if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_test_')) {
    return null;
  }

  if (!appBaseUrl) {
    return null;
  }

  const priceIds = {};
  for (const planKey of ALLOWED_PLAN_KEYS) {
    for (const interval of ALLOWED_INTERVALS) {
      const envKey = PRICE_ENV_KEYS[planKey][interval];
      const priceId = String(process.env[envKey] || '').trim();
      if (!priceId) {
        return null;
      }
      priceIds[`${planKey}:${interval}`] = priceId;
    }
  }

  return { stripeSecretKey, appBaseUrl, priceIds };
};

const resolvePriceId = (config, planKey, interval) => config.priceIds[`${planKey}:${interval}`] || null;

const buildStripeCheckoutParams = ({
  priceId,
  appBaseUrl,
  userId,
  planKey,
  customerEmail
}) => {
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('success_url', `${appBaseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${appBaseUrl}/?checkout=cancelled`);
  params.append('client_reference_id', userId);
  params.append('metadata[wayfinder_plan_key]', planKey);
  params.append('metadata[wayfinder_user_id]', userId);
  params.append('metadata[checkout_purpose]', 'subscription_upgrade');
  params.append('subscription_data[metadata][wayfinder_plan_key]', planKey);
  params.append('subscription_data[metadata][wayfinder_user_id]', userId);
  params.append('subscription_data[metadata][checkout_purpose]', 'subscription_upgrade');

  if (customerEmail) {
    params.append('customer_email', customerEmail);
  }

  return params;
};

async function createStripeCheckoutSession({ stripeSecretKey, params }) {
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error('Stripe checkout session could not be created.');
    error.status = response.status;
    error.stripeType = data?.error?.type || null;
    throw error;
  }

  return data;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const config = getCheckoutConfig();
  if (!config) {
    return res.status(500).json({ error: 'Checkout is not configured.' });
  }

  try {
    const accessToken = bearerToken(req);
    const user = await getAuthUserFromAccessToken(accessToken);
    if (!user?.id) {
      return res.status(401).json({ error: 'Sign in required.' });
    }

    const profile = await getProfileByUserId(user.id);
    if (!profile) {
      return res.status(403).json({ error: 'Parent profile required.' });
    }

    if (String(profile.role || '').toLowerCase() !== 'parent') {
      return res.status(403).json({ error: 'Parent account required.' });
    }

    if (!isTruthy(profile.email_verified)) {
      return res.status(403).json({ error: 'Verified email required.' });
    }

    const body = parseBody(req);
    const planKey = String(body?.planKey || '').trim();
    const interval = String(body?.interval || '').trim();

    if (!planKey || !interval) {
      return res.status(400).json({ error: 'planKey and interval are required.' });
    }

    if (planKey === 'wayfinder') {
      return res.status(400).json({ error: 'Wayfinder Free does not use Checkout.' });
    }

    if (!ALLOWED_PLAN_KEYS.has(planKey)) {
      return res.status(400).json({ error: 'Invalid planKey.' });
    }

    if (!ALLOWED_INTERVALS.has(interval)) {
      return res.status(400).json({ error: 'Invalid interval.' });
    }

    const priceId = resolvePriceId(config, planKey, interval);
    if (!priceId) {
      return res.status(500).json({ error: 'Checkout is not configured.' });
    }

    const customerEmail = String(user.email || '').trim() || null;
    const params = buildStripeCheckoutParams({
      priceId,
      appBaseUrl: config.appBaseUrl,
      userId: user.id,
      planKey,
      customerEmail
    });

    const session = await createStripeCheckoutSession({
      stripeSecretKey: config.stripeSecretKey,
      params
    });

    const url = String(session?.url || '').trim();
    if (!url) {
      return res.status(500).json({ error: 'Checkout could not be started.' });
    }

    return res.status(200).json({ url });
  } catch {
    return res.status(500).json({ error: 'Checkout could not be started.' });
  }
}
