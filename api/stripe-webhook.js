import crypto from 'node:crypto';
import { supabaseAdminFetch } from './_supabase-admin.js';

export const config = { api: { bodyParser: false } };

const PRICE_ENV_VAR_NAMES = [
  'STRIPE_PRICE_PLUS_MONTHLY',
  'STRIPE_PRICE_PLUS_YEARLY',
  'STRIPE_PRICE_CONNECT_MONTHLY',
  'STRIPE_PRICE_CONNECT_YEARLY'
];

const HANDLED_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
]);

const ALLOWED_LOG_PLAN_KEYS = new Set(['wayfinder', 'wayfinder_plus', 'wayfinder_connect']);
const SIGNATURE_TOLERANCE_SECONDS = 300;

class PermanentWebhookError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PermanentWebhookError';
  }
}

class RetryableWebhookError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RetryableWebhookError';
  }
}

const buildPriceToPlan = () => {
  const map = {};
  for (const envName of PRICE_ENV_VAR_NAMES) {
    const priceId = String(process.env[envName] || '').trim();
    if (!priceId) continue;
    if (envName.includes('PLUS')) {
      map[priceId] = 'wayfinder_plus';
    } else if (envName.includes('CONNECT')) {
      map[priceId] = 'wayfinder_connect';
    }
  }
  return map;
};

const getWebhookConfig = () => {
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!stripeSecretKey.startsWith('sk_test_')) return null;
  if (!webhookSecret) return null;
  if (!supabaseUrl || !serviceRoleKey) return null;

  for (const name of PRICE_ENV_VAR_NAMES) {
    const priceId = String(process.env[name] || '').trim();
    if (!priceId.startsWith('price_')) return null;
  }

  return {
    stripeSecretKey,
    webhookSecret,
    priceToPlan: buildPriceToPlan()
  };
};

const eventIdSuffix = (eventId) => {
  const id = String(eventId || '').trim();
  if (!id) return null;
  return id.length >= 6 ? id.slice(-6) : id;
};

const logWebhook = ({ eventType = null, eventIdSuffix: idSuffix = null, livemode = null, outcome, planKey = null, httpStatus }) => {
  const entry = {
    eventType,
    eventIdSuffix: idSuffix,
    livemode,
    outcome,
    httpStatus
  };
  if (planKey && ALLOWED_LOG_PLAN_KEYS.has(planKey)) {
    entry.planKey = planKey;
  }
  console.error('[stripe-webhook]', entry);
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const verifyStripeSignature = (rawBody, signatureHeader, webhookSecret) => {
  const header = String(signatureHeader || '').trim();
  if (!header || !webhookSecret) return false;

  const parts = header.split(',');
  let timestamp = null;
  const signatures = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (!key || value == null) continue;
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return signatures.some((signature) => {
    try {
      const receivedBuffer = Buffer.from(signature, 'hex');
      if (receivedBuffer.length !== expectedBuffer.length) return false;
      return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });
};

const extractId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const id = value.trim();
    return id || null;
  }
  if (typeof value === 'object' && value.id) {
    const id = String(value.id).trim();
    return id || null;
  }
  return null;
};

export function extractSubscriptionIdFromInvoice(invoice) {
  if (!invoice || typeof invoice !== 'object') return null;

  const direct = extractId(invoice.subscription);
  if (direct) return direct;

  const parentSub = extractId(invoice.parent?.subscription_details?.subscription);
  if (parentSub) return parentSub;

  const lines = Array.isArray(invoice.lines?.data) ? invoice.lines.data : [];
  for (const line of lines) {
    const lineSub = extractId(line?.parent?.subscription_item_details?.subscription);
    if (lineSub) return lineSub;
  }

  return null;
}

const isRetryableSupabaseError = (err) => {
  const status = err?.status;
  if (!status) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
};

const wrapSupabaseCall = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (isRetryableSupabaseError(err)) {
      throw new RetryableWebhookError(err.message || 'Supabase request failed');
    }
    throw new PermanentWebhookError(err.message || 'Supabase request failed');
  }
};

async function claimWebhookEvent(eventId, eventType, livemode) {
  return wrapSupabaseCall(async () => {
    const result = await supabaseAdminFetch('/rest/v1/rpc/claim_stripe_webhook_event', {
      method: 'POST',
      body: JSON.stringify({
        p_stripe_event_id: eventId,
        p_event_type: eventType,
        p_livemode: livemode
      })
    });
    return Boolean(result);
  });
}

async function markWebhookOutcome(eventId, outcome) {
  return wrapSupabaseCall(async () => {
    await supabaseAdminFetch('/rest/v1/rpc/mark_stripe_webhook_event_outcome', {
      method: 'POST',
      body: JSON.stringify({
        p_stripe_event_id: eventId,
        p_outcome: outcome
      })
    });
  });
}

async function releaseWebhookClaim(eventId) {
  const id = String(eventId || '').trim();
  if (!id) return;
  await supabaseAdminFetch(`/rest/v1/stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
}

async function syncEntitlement({
  userId,
  planKey,
  subscriptionStatus,
  customerId = null,
  subscriptionId = null,
  periodStart = null,
  periodEnd = null,
  clearSubscriptionId = false
}) {
  return wrapSupabaseCall(async () => {
    await supabaseAdminFetch('/rest/v1/rpc/sync_parent_entitlement_from_stripe', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_plan_key: planKey,
        p_subscription_status: subscriptionStatus,
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscriptionId,
        p_current_period_start: periodStart,
        p_current_period_end: periodEnd,
        p_clear_subscription_id: clearSubscriptionId
      })
    });
  });
}

async function lookupBillingRef({ subscriptionId = null, customerId = null }) {
  if (subscriptionId) {
    const params = new URLSearchParams({
      select: 'user_id',
      stripe_subscription_id: `eq.${subscriptionId}`,
      limit: '1'
    });
    const rows = await wrapSupabaseCall(async () => supabaseAdminFetch(
      `/rest/v1/stripe_billing_references?${params.toString()}`,
      { method: 'GET' }
    ));
    if (Array.isArray(rows) && rows[0]?.user_id) return rows[0].user_id;
  }

  if (customerId) {
    const params = new URLSearchParams({
      select: 'user_id',
      stripe_customer_id: `eq.${customerId}`,
      limit: '1'
    });
    const rows = await wrapSupabaseCall(async () => supabaseAdminFetch(
      `/rest/v1/stripe_billing_references?${params.toString()}`,
      { method: 'GET' }
    ));
    if (Array.isArray(rows) && rows[0]?.user_id) return rows[0].user_id;
  }

  return null;
}

async function fetchSubscription(subscriptionId, config) {
  let response;
  try {
    response = await fetch(
      `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.stripeSecretKey}`,
          Accept: 'application/json'
        }
      }
    );
  } catch {
    throw new RetryableWebhookError('Stripe subscription fetch failed');
  }

  if (!response.ok) {
    if (response.status >= 500 || response.status === 429) {
      throw new RetryableWebhookError('Stripe subscription fetch failed');
    }
    if (response.status === 404) {
      throw new PermanentWebhookError('Stripe subscription fetch failed');
    }
    throw new PermanentWebhookError('Stripe subscription fetch failed');
  }

  return response.json();
}

const getSubscriptionPriceId = (subscription) => {
  const items = subscription?.items?.data;
  if (Array.isArray(items) && items.length > 0) {
    const priceId = extractId(items[0]?.price) || String(items[0]?.price?.id || '').trim();
    if (priceId) return priceId;
  }
  return extractId(subscription?.plan);
};

const resolvePlanKey = (priceId, metadataPlanKey, priceToPlan) => {
  const derived = priceToPlan[String(priceId || '').trim()];
  if (!derived) {
    throw new PermanentWebhookError('Unknown price ID');
  }
  const metadataPlan = String(metadataPlanKey || '').trim();
  if (metadataPlan && metadataPlan !== derived) {
    throw new PermanentWebhookError('Plan metadata mismatch');
  }
  return derived;
};

const mapSubscriptionStatus = (stripeStatus) => {
  switch (String(stripeStatus || '').trim()) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete_expired':
    case 'unpaid':
      return 'expired';
    case 'incomplete':
      return null;
    default:
      return null;
  }
};

const unixToIso = (unixSeconds) => {
  const value = Number(unixSeconds);
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
};

async function resolveUserIdFromSubscription(subscription) {
  const fromMeta = String(subscription?.metadata?.wayfinder_user_id || '').trim();
  if (fromMeta) return fromMeta;

  const subscriptionId = extractId(subscription);
  const customerId = extractId(subscription?.customer);

  if (subscriptionId) {
    const bySub = await lookupBillingRef({ subscriptionId });
    if (bySub) return bySub;
  }
  if (customerId) {
    const byCustomer = await lookupBillingRef({ customerId });
    if (byCustomer) return byCustomer;
  }

  throw new PermanentWebhookError('Unresolvable user_id');
}

async function resolveUserIdFromSession(session, subscription) {
  const fromMeta = String(session?.metadata?.wayfinder_user_id || '').trim();
  if (fromMeta) return fromMeta;

  const fromRef = String(session?.client_reference_id || '').trim();
  if (fromRef) return fromRef;

  if (subscription) {
    try {
      return await resolveUserIdFromSubscription(subscription);
    } catch (err) {
      if (!(err instanceof PermanentWebhookError)) throw err;
    }
  }

  const customerId = extractId(session?.customer);
  if (customerId) {
    const byCustomer = await lookupBillingRef({ customerId });
    if (byCustomer) return byCustomer;
  }

  throw new PermanentWebhookError('Unresolvable user_id');
}

async function syncFromSubscription(subscription, config, overrides = {}) {
  const stripeStatus = String(subscription?.status || '').trim();
  const mappedStatus = overrides.subscriptionStatus || mapSubscriptionStatus(stripeStatus);

  if (!mappedStatus) {
    return { outcome: 'skipped' };
  }

  const customerId = extractId(subscription?.customer);
  const subscriptionId = extractId(subscription);
  const userId = overrides.userId || await resolveUserIdFromSubscription(subscription);

  if (mappedStatus === 'expired') {
    await syncEntitlement({
      userId,
      planKey: 'wayfinder',
      subscriptionStatus: 'expired',
      customerId,
      subscriptionId: null,
      periodStart: null,
      periodEnd: null,
      clearSubscriptionId: true
    });
    return { outcome: 'processed', planKey: 'wayfinder' };
  }

  const priceId = getSubscriptionPriceId(subscription);
  const planKey = resolvePlanKey(
    priceId,
    subscription?.metadata?.wayfinder_plan_key,
    config.priceToPlan
  );

  await syncEntitlement({
    userId,
    planKey,
    subscriptionStatus: mappedStatus,
    customerId,
    subscriptionId,
    periodStart: unixToIso(subscription?.current_period_start),
    periodEnd: unixToIso(subscription?.current_period_end),
    clearSubscriptionId: false
  });

  return { outcome: 'processed', planKey };
}

async function handleCheckoutSessionCompleted(event, config) {
  const session = event.data?.object;
  if (String(session?.mode || '') !== 'subscription') {
    return { outcome: 'skipped' };
  }

  const subscriptionId = extractId(session?.subscription);
  if (!subscriptionId) {
    throw new PermanentWebhookError('Missing subscription on checkout session');
  }

  const subscription = await fetchSubscription(subscriptionId, config);
  const userId = await resolveUserIdFromSession(session, subscription);
  return syncFromSubscription(subscription, config, { userId });
}

async function handleSubscriptionLifecycle(event, config) {
  const subscription = event.data?.object;
  return syncFromSubscription(subscription, config);
}

async function handleSubscriptionDeleted(event, config) {
  const subscription = event.data?.object;
  const userId = await resolveUserIdFromSubscription(subscription);
  const customerId = extractId(subscription?.customer);

  await syncEntitlement({
    userId,
    planKey: 'wayfinder',
    subscriptionStatus: 'expired',
    customerId,
    subscriptionId: null,
    periodStart: null,
    periodEnd: null,
    clearSubscriptionId: true
  });

  return { outcome: 'processed', planKey: 'wayfinder' };
}

async function handleInvoiceEvent(event, config, targetStatus) {
  const invoice = event.data?.object;
  const subscriptionId = extractSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    throw new PermanentWebhookError('Invoice missing subscription id');
  }

  const subscription = await fetchSubscription(subscriptionId, config);

  if (targetStatus) {
    return syncFromSubscription(subscription, config, { subscriptionStatus: targetStatus });
  }

  return syncFromSubscription(subscription, config);
}

async function processEvent(event, config) {
  const eventType = String(event?.type || '').trim();

  if (!HANDLED_EVENT_TYPES.has(eventType)) {
    return { outcome: 'skipped' };
  }

  switch (eventType) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(event, config);
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionLifecycle(event, config);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event, config);
    case 'invoice.payment_succeeded':
      return handleInvoiceEvent(event, config);
    case 'invoice.payment_failed':
      return handleInvoiceEvent(event, config, 'past_due');
    default:
      return { outcome: 'skipped' };
  }
}

async function finalizeClaimedEvent(event, config) {
  const eventId = String(event?.id || '').trim();
  const eventType = String(event?.type || '').trim();
  const livemode = Boolean(event?.livemode);
  const idSuffix = eventIdSuffix(eventId);

  try {
    const result = await processEvent(event, config);
    await markWebhookOutcome(eventId, result.outcome);
    logWebhook({
      eventType,
      eventIdSuffix: idSuffix,
      livemode,
      outcome: result.outcome,
      planKey: result.planKey || null,
      httpStatus: 200
    });
    return { status: 200, body: { received: true } };
  } catch (err) {
    if (err instanceof RetryableWebhookError) {
      try {
        await releaseWebhookClaim(eventId);
      } catch {
        throw err;
      }
      logWebhook({
        eventType,
        eventIdSuffix: idSuffix,
        livemode,
        outcome: 'retryable_error',
        httpStatus: 500
      });
      return { status: 500, body: { error: 'Webhook processing failed.' } };
    }

    if (err instanceof PermanentWebhookError) {
      try {
        await markWebhookOutcome(eventId, 'failed');
      } catch (markErr) {
        if (markErr instanceof RetryableWebhookError || isRetryableSupabaseError(markErr)) {
          try {
            await releaseWebhookClaim(eventId);
          } catch {
            throw markErr;
          }
          logWebhook({
            eventType,
            eventIdSuffix: idSuffix,
            livemode,
            outcome: 'retryable_error',
            httpStatus: 500
          });
          return { status: 500, body: { error: 'Webhook processing failed.' } };
        }
        throw markErr;
      }
      logWebhook({
        eventType,
        eventIdSuffix: idSuffix,
        livemode,
        outcome: 'failed',
        httpStatus: 200
      });
      return { status: 200, body: { received: true } };
    }

    try {
      await releaseWebhookClaim(eventId);
    } catch {
      // fall through to retryable response
    }
    logWebhook({
      eventType,
      eventIdSuffix: idSuffix,
      livemode,
      outcome: 'retryable_error',
      httpStatus: 500
    });
    return { status: 500, body: { error: 'Webhook processing failed.' } };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    logWebhook({ outcome: 'method_not_allowed', httpStatus: 405 });
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const config = getWebhookConfig();
  if (!config) {
    logWebhook({ outcome: 'not_configured', httpStatus: 503 });
    return res.status(503).json({ error: 'Webhook is not configured.' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    logWebhook({ outcome: 'retryable_error', httpStatus: 500 });
    return res.status(500).json({ error: 'Webhook body read failed.' });
  }

  const signatureHeader = req.headers['stripe-signature'] || req.headers['Stripe-Signature'] || '';
  if (!verifyStripeSignature(rawBody, signatureHeader, config.webhookSecret)) {
    logWebhook({ outcome: 'invalid_signature', httpStatus: 400 });
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    logWebhook({ outcome: 'invalid_signature', httpStatus: 400 });
    return res.status(400).json({ error: 'Invalid payload.' });
  }

  const eventId = String(event?.id || '').trim();
  const eventType = String(event?.type || '').trim();
  const livemode = Boolean(event?.livemode);
  const idSuffix = eventIdSuffix(eventId);

  if (!eventId || !eventType) {
    logWebhook({ outcome: 'invalid_signature', httpStatus: 400 });
    return res.status(400).json({ error: 'Invalid event.' });
  }

  try {
    if (livemode) {
      const claimed = await claimWebhookEvent(eventId, eventType, livemode);
      if (claimed) {
        await markWebhookOutcome(eventId, 'skipped');
      }
      logWebhook({
        eventType,
        eventIdSuffix: idSuffix,
        livemode,
        outcome: claimed ? 'skipped' : 'duplicate',
        httpStatus: 200
      });
      return res.status(200).json({ received: true });
    }

    const claimed = await claimWebhookEvent(eventId, eventType, livemode);
    if (!claimed) {
      logWebhook({
        eventType,
        eventIdSuffix: idSuffix,
        livemode,
        outcome: 'duplicate',
        httpStatus: 200
      });
      return res.status(200).json({ received: true });
    }

    const response = await finalizeClaimedEvent(event, config);
    return res.status(response.status).json(response.body);
  } catch (err) {
    if (err instanceof RetryableWebhookError) {
      logWebhook({
        eventType,
        eventIdSuffix: idSuffix,
        livemode,
        outcome: 'retryable_error',
        httpStatus: 500
      });
      return res.status(500).json({ error: 'Webhook processing failed.' });
    }

    logWebhook({
      eventType,
      eventIdSuffix: idSuffix,
      livemode,
      outcome: 'retryable_error',
      httpStatus: 500
    });
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
}
