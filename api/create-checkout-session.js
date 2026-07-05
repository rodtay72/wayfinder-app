import {
  SUPABASE_URL,
  getAuthUserFromAccessToken,
  getProfileByUserId,
  parseBody,
  readJson
} from './_supabase-admin.js';

const ALLOWED_PLAN_KEYS = new Set(['wayfinder_plus', 'wayfinder_connect']);
const ALLOWED_INTERVALS = new Set(['monthly', 'yearly']);

const CHECKOUT_ENV_NAMES = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_PLUS_MONTHLY',
  'STRIPE_PRICE_PLUS_YEARLY',
  'STRIPE_PRICE_CONNECT_MONTHLY',
  'STRIPE_PRICE_CONNECT_YEARLY',
  'APP_BASE_URL'
];

const PRICE_ENV_VAR_NAMES = [
  'STRIPE_PRICE_PLUS_MONTHLY',
  'STRIPE_PRICE_PLUS_YEARLY',
  'STRIPE_PRICE_CONNECT_MONTHLY',
  'STRIPE_PRICE_CONNECT_YEARLY'
];

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

const isPreviewDiagnosticEnabled = () => process.env.VERCEL_ENV !== 'production';

const envVarPresent = (name) => Boolean(String(process.env[name] ?? '').trim());

const envVarStartsWith = (name, prefix) => String(process.env[name] ?? '').trim().startsWith(prefix);

const sanitizeSupabaseMessage = (message) => {
  let text = String(message || '').trim();
  if (!text) return null;
  text = text.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[redacted]');
  text = text.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[redacted]');
  text = text.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted]');
  return text.slice(0, 120) || null;
};

const supabaseUrlHostHint = () => {
  const url = String(process.env.SUPABASE_URL || SUPABASE_URL || '').trim();
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('.supabase.co')) {
      const ref = host.replace('.supabase.co', '');
      return ref ? `${ref.slice(0, 4)}***.supabase.co` : 'supabase.co';
    }
    return 'non-supabase-host';
  } catch {
    return 'invalid-url';
  }
};

const buildSupabaseEnvDiagnostic = () => {
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const trimmedServiceKey = String(rawServiceKey ?? '').trim();

  return {
    supabaseUrlConfigured: envVarPresent('SUPABASE_URL'),
    supabaseUrlHostHint: supabaseUrlHostHint(),
    supabaseAnonKeyPresent: envVarPresent('SUPABASE_ANON_KEY'),
    serviceRoleKeyPresent: Boolean(trimmedServiceKey),
    serviceRoleKeyLooksJwtLike: trimmedServiceKey.split('.').length === 3,
    serviceRoleKeyHasLeadingOrTrailingWhitespace: rawServiceKey != null && String(rawServiceKey) !== trimmedServiceKey
  };
};

const buildProfileLookupDiagnostic = ({
  authUserLookupSucceeded = false,
  authUserIdPresent = false,
  profileLookupSucceeded = null,
  profileRowPresent = null,
  profileLookupHttpStatus = null,
  profileLookupErrorCode = null,
  profileLookupErrorMessage = null
} = {}) => ({
  authUserLookupSucceeded,
  authUserIdPresent,
  profileLookupSucceeded,
  profileRowPresent,
  ...buildSupabaseEnvDiagnostic(),
  profileLookupHttpStatus,
  profileLookupErrorCode,
  profileLookupErrorMessage
});

const buildRuntimeEnvDiagnostic = () => {
  const sha = String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim();
  const envPresence = {};
  for (const name of CHECKOUT_ENV_NAMES) {
    envPresence[name] = envVarPresent(name);
  }

  const envFormat = {
    STRIPE_SECRET_KEYStartsWithSkTest: envVarStartsWith('STRIPE_SECRET_KEY', 'sk_test_'),
    APP_BASE_URLLooksHttps: /^https:\/\/.+/i.test(String(process.env.APP_BASE_URL || '').trim())
  };
  for (const name of PRICE_ENV_VAR_NAMES) {
    envFormat[`${name}StartsWithPrice`] = envVarStartsWith(name, 'price_');
  }

  return {
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    vercelGitCommitShaPrefix: sha ? sha.slice(0, 7) : null,
    envPresence,
    envFormat
  };
};

const buildConfigDiagnostic = ({ priceEnvKey = null } = {}) => ({
  stripeSecretKeyLooksTest: envVarStartsWith('STRIPE_SECRET_KEY', 'sk_test_'),
  appBaseUrlPresent: envVarPresent('APP_BASE_URL'),
  appBaseUrlLooksHttps: /^https:\/\/.+/i.test(String(process.env.APP_BASE_URL || '').trim()),
  selectedPriceEnvKey: priceEnvKey || null,
  selectedPriceEnvPresent: priceEnvKey ? envVarPresent(priceEnvKey) : false,
  selectedPriceLooksLikePriceId: priceEnvKey ? envVarStartsWith(priceEnvKey, 'price_') : false
});

const buildPreviewDiagnostic = ({
  validationIssue = null,
  stripeStatus = null,
  stripeErrorType = null,
  stripeErrorCode = null,
  stripeErrorParam = null,
  config = null,
  profileLookup = null
}) => ({
  ...(validationIssue ? { validationIssue } : {}),
  ...(stripeStatus !== null ? {
    stripeStatus,
    stripeErrorType: stripeErrorType || null,
    stripeErrorCode: stripeErrorCode || null,
    stripeErrorParam: stripeErrorParam || null
  } : {}),
  ...(profileLookup ? { profileLookup } : {}),
  runtime: buildRuntimeEnvDiagnostic(),
  config: config || buildConfigDiagnostic()
});

const respondCheckoutFailure = (res, status, options = {}) => {
  const body = { error: 'Checkout could not be started.' };
  if (isPreviewDiagnosticEnabled()) {
    body.diagnostic = buildPreviewDiagnostic(options);
  }
  return res.status(status).json(body);
};

const respondNotConfigured = (res) => {
  const body = { error: 'Checkout is not configured.' };
  if (isPreviewDiagnosticEnabled()) {
    body.diagnostic = buildPreviewDiagnostic({
      validationIssue: 'base checkout config missing'
    });
  }
  return res.status(500).json(body);
};

const respondUnhandledFailure = (res, validationIssue = 'unhandled server exception') => {
  logCheckoutFailure('unhandled checkout handler failure', { validationIssue });
  const body = { error: 'Checkout could not be started.' };
  if (isPreviewDiagnosticEnabled()) {
    body.diagnostic = buildPreviewDiagnostic({ validationIssue });
  }
  return res.status(500).json(body);
};

const getBaseCheckoutConfig = () => {
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim().replace(/\/+$/, '');

  if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_test_')) {
    return null;
  }

  if (!appBaseUrl) {
    return null;
  }

  return { stripeSecretKey, appBaseUrl };
};

const describeIdFormat = (value) => {
  const id = String(value || '').trim();
  if (!id) return 'missing';
  if (id.startsWith('price_')) return 'price_***present';
  if (id.startsWith('prod_')) return 'prod_***wrong_type';
  if (id.startsWith('plan_')) return 'plan_***wrong_type';
  return 'invalid_prefix';
};

const logStripeCheckoutFailure = ({ httpStatus, stripeError = {}, planKey, interval, priceEnvKey, priceFormat }) => {
  console.error('[checkout] Stripe session create failed', {
    httpStatus: httpStatus || null,
    stripeType: stripeError.type || null,
    stripeCode: stripeError.code || null,
    stripeParam: stripeError.param || null,
    planKey: planKey || null,
    interval: interval || null,
    priceEnvKey: priceEnvKey || null,
    priceFormat: priceFormat || null
  });
};

const logCheckoutFailure = (reason, details = {}) => {
  console.error(`[checkout] ${reason}`, details);
};

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

async function createStripeCheckoutSession({ stripeSecretKey, params, planKey, interval, priceEnvKey, priceFormat }) {
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
    const stripeError = data?.error || {};
    logStripeCheckoutFailure({
      httpStatus: response.status,
      stripeError,
      planKey,
      interval,
      priceEnvKey,
      priceFormat
    });
    const error = new Error('Stripe checkout session could not be created.');
    error.status = response.status;
    error.stripeType = stripeError.type || null;
    error.stripeCode = stripeError.code || null;
    error.stripeParam = stripeError.param || null;
    throw error;
  }

  return data;
};

async function requireVerifiedParent(req, res) {
  const accessToken = bearerToken(req);
  const user = await getAuthUserFromAccessToken(accessToken);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required.' });
    return { ok: false };
  }

  let profile;
  try {
    profile = await getProfileByUserId(user.id);
  } catch (err) {
    const message = String(err?.message || '');
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      res.status(503).json({ error: 'Profile lookup is not configured.' });
      return { ok: false };
    }
    throw err;
  }

  if (!profile) {
    res.status(403).json({ error: 'Parent profile required.' });
    return { ok: false };
  }

  if (String(profile.role || '').toLowerCase() !== 'parent') {
    res.status(403).json({ error: 'Parent account required.' });
    return { ok: false };
  }

  if (!isTruthy(profile.email_verified)) {
    res.status(403).json({ error: 'Verified email required.' });
    return { ok: false };
  }

  return { ok: true, user, profile };
}

async function inspectProfileLookup(accessToken) {
  const user = await getAuthUserFromAccessToken(accessToken);
  const authUserIdPresent = Boolean(user?.id);
  let profileLookup = buildProfileLookupDiagnostic({
    authUserLookupSucceeded: authUserIdPresent,
    authUserIdPresent
  });

  if (!authUserIdPresent) {
    return { profile: null, profileLookup, validationIssue: 'sign in required' };
  }

  try {
    const profile = await getProfileByUserId(user.id);
    profileLookup = buildProfileLookupDiagnostic({
      authUserLookupSucceeded: true,
      authUserIdPresent: true,
      profileLookupSucceeded: true,
      profileRowPresent: Boolean(profile)
    });

    if (!profile) {
      return { profile: null, profileLookup, validationIssue: 'parent profile required' };
    }

    if (String(profile.role || '').toLowerCase() !== 'parent') {
      return { profile, profileLookup, validationIssue: 'parent account required' };
    }

    if (!isTruthy(profile.email_verified)) {
      return { profile, profileLookup, validationIssue: 'verified email required' };
    }

    return { profile, profileLookup, validationIssue: null };
  } catch (err) {
    const message = String(err?.message || '');
    profileLookup = buildProfileLookupDiagnostic({
      authUserLookupSucceeded: true,
      authUserIdPresent: true,
      profileLookupSucceeded: false,
      profileRowPresent: false,
      profileLookupHttpStatus: err?.status || null,
      profileLookupErrorCode: err?.data?.code || null,
      profileLookupErrorMessage: sanitizeSupabaseMessage(message)
    });

    const validationIssue = message.includes('SUPABASE_SERVICE_ROLE_KEY')
      ? 'profile lookup unavailable'
      : 'profile lookup failed';

    return { profile: null, profileLookup, validationIssue };
  }
}

async function handleDiagnosticOnly(req, res, body) {
  if (!isPreviewDiagnosticEnabled()) {
    return res.status(404).json({ error: 'Not found.' });
  }

  try {
    const accessToken = bearerToken(req);
    const { profileLookup, validationIssue } = await inspectProfileLookup(accessToken);

    if (!profileLookup.authUserIdPresent) {
      return res.status(401).json({
        error: 'Sign in required.',
        diagnostic: buildPreviewDiagnostic({
          validationIssue,
          profileLookup
        })
      });
    }

    const planKey = String(body?.planKey || '').trim();
    const interval = String(body?.interval || '').trim();
    let priceEnvKey = null;
    if (planKey && interval && PRICE_ENV_KEYS[planKey]?.[interval]) {
      priceEnvKey = PRICE_ENV_KEYS[planKey][interval];
    }

    return res.status(200).json({
      ok: true,
      mode: 'preview_runtime_env',
      diagnostic: buildPreviewDiagnostic({
        validationIssue,
        profileLookup,
        config: buildConfigDiagnostic({ priceEnvKey })
      })
    });
  } catch (err) {
    logCheckoutFailure('diagnosticOnly handler failure', { errorName: err?.name || 'Error' });
    return res.status(500).json({
      error: 'Checkout could not be started.',
      diagnostic: buildPreviewDiagnostic({
        validationIssue: 'diagnostic handler exception',
        profileLookup: buildProfileLookupDiagnostic()
      })
    });
  }
}

export default async function handler(req, res) {
  setCors(res);
  let diagnosticContext = { priceEnvKey: null };

  try {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const body = parseBody(req);
    if (body?.diagnosticOnly === true) {
      return await handleDiagnosticOnly(req, res, body);
    }

    const config = getBaseCheckoutConfig();
    if (!config) {
      return respondNotConfigured(res);
    }

    const auth = await requireVerifiedParent(req, res);
    if (!auth.ok) return undefined;

    const { user } = auth;
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

    const priceEnvKey = PRICE_ENV_KEYS[planKey][interval];
    const priceId = String(process.env[priceEnvKey] || '').trim();
    diagnosticContext = { priceEnvKey };
    const configDiagnostic = buildConfigDiagnostic({ priceEnvKey });

    if (!/^https:\/\/.+/i.test(config.appBaseUrl)) {
      logCheckoutFailure('invalid APP_BASE_URL before Stripe API call', { priceEnvKey });
      return respondCheckoutFailure(res, 500, {
        validationIssue: 'invalid APP_BASE_URL',
        config: configDiagnostic
      });
    }

    if (!priceId) {
      logCheckoutFailure('selected Stripe price env var missing before Stripe API call', { priceEnvKey });
      return respondCheckoutFailure(res, 500, {
        validationIssue: 'selected price env var missing',
        config: configDiagnostic
      });
    }

    const priceFormat = describeIdFormat(priceId);
    if (!priceId.startsWith('price_')) {
      logCheckoutFailure('invalid Stripe price env format before Stripe API call', {
        priceEnvKey,
        priceFormat,
        planKey,
        interval
      });
      return respondCheckoutFailure(res, 500, {
        validationIssue: 'selected price is not a Price ID',
        config: configDiagnostic
      });
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
      params,
      planKey,
      interval,
      priceEnvKey,
      priceFormat
    });

    const url = String(session?.url || '').trim();
    if (!url) {
      logCheckoutFailure('Stripe session created without checkout url', {
        planKey,
        interval,
        priceEnvKey,
        priceFormat
      });
      return respondCheckoutFailure(res, 500, {
        validationIssue: 'stripe session missing checkout url',
        config: configDiagnostic
      });
    }

    return res.status(200).json({ url });
  } catch (err) {
    const message = String(err?.message || '');
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      logCheckoutFailure('profile lookup unavailable: service role not configured');
      return respondCheckoutFailure(res, 500, {
        validationIssue: 'profile lookup unavailable',
        config: buildConfigDiagnostic(diagnosticContext)
      });
    }

    if (!err?.stripeType && !err?.stripeCode) {
      logCheckoutFailure('unexpected checkout failure', {
        errorName: err?.name || 'Error'
      });
    }

    if (err?.stripeType || err?.stripeCode || err?.status) {
      return respondCheckoutFailure(res, 500, {
        stripeStatus: err?.status || null,
        stripeErrorType: err?.stripeType || null,
        stripeErrorCode: err?.stripeCode || null,
        stripeErrorParam: err?.stripeParam || null,
        config: buildConfigDiagnostic(diagnosticContext)
      });
    }

    return respondUnhandledFailure(res, 'unhandled server exception');
  }
}
