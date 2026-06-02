const SUBJECT = 'Verify Your Wayfinder Account';
const EXPIRY_HOURS = 24;

const inferProvider = (endpoint) => {
  try {
    const hostname = new URL(endpoint).hostname;
    if (hostname.includes('script.google.com')) return 'google-apps-script';
    return hostname;
  } catch {
    return 'custom-endpoint';
  }
};

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

export async function sendVerificationEmail(email, token) {
  const endpoint = requiredEnv('VERIFICATION_EMAIL_ENDPOINT');
  const secret = requiredEnv('VERIFICATION_EMAIL_SECRET');
  const fromEmail = requiredEnv('EMAIL_FROM');
  const fromName = requiredEnv('EMAIL_FROM_NAME');
  const provider = inferProvider(endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      token,
      secret,
      fromEmail,
      fromName,
      subject: SUBJECT,
      expiryHours: EXPIRY_HOURS,
      supportEmail: fromEmail
    })
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.message || 'Verification email provider rejected the request.');
  }

  return { provider: data.provider || provider };
}
