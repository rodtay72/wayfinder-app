export function classifyStripeSecretKey(stripeSecretKey) {
  const key = String(stripeSecretKey || '').trim();
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  return 'invalid';
}

export function isStripeLiveExplicitlyAllowed() {
  return String(process.env.STRIPE_ALLOW_LIVE || '').trim() === 'true';
}

export function resolveStripeRuntime(stripeSecretKey = process.env.STRIPE_SECRET_KEY) {
  const key = String(stripeSecretKey || '').trim();
  const mode = classifyStripeSecretKey(key);

  if (mode === 'invalid') {
    return { ok: false, mode: 'invalid', stripeSecretKey: null };
  }

  if (mode === 'live' && !isStripeLiveExplicitlyAllowed()) {
    return { ok: false, mode: 'live', stripeSecretKey: null, liveNotEnabled: true };
  }

  return { ok: true, mode, stripeSecretKey: key };
}

export function shouldProcessStripeWebhookEvent(stripeMode, eventLivemode) {
  if (stripeMode === 'test') return eventLivemode === false;
  if (stripeMode === 'live') return eventLivemode === true;
  return false;
}
