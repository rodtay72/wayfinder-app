# Gmail Verification Apps Script

Wayfinder sends custom verification emails through a configurable endpoint. For the PsyTec Gmail path, deploy a Google Apps Script Web App under a Google Workspace account that owns or has Gmail "Send As" permission for:

```text
ask.anything@psytec.com.sg
```

Sender name:

```text
Wayfinder by PsyTec
```

## Vercel Environment Variables

Set these in Vercel for the Wayfinder project:

```text
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
VERIFICATION_EMAIL_ENDPOINT=<Apps Script Web App URL>
VERIFICATION_EMAIL_SECRET=<shared random secret>
EMAIL_FROM=ask.anything@psytec.com.sg
EMAIL_FROM_NAME=Wayfinder by PsyTec
```

Do not put Gmail credentials, Apps Script secrets, or Supabase service-role keys in frontend files.

Supabase setup: keep Supabase "Confirm email" enabled until this replacement flow is deployed, configured, and smoke-tested. After the replacement verification flow passes, Supabase Dashboard -> Authentication -> Providers -> Email -> disable "Confirm email". Keep password reset settings unchanged unless you are intentionally changing that flow.

Database setup: run `supabase-email-verification.sql` in the Supabase SQL Editor after the existing profile/schema SQL files.

## Apps Script Properties

In Apps Script, add Script Properties:

```text
VERIFICATION_EMAIL_SECRET=<same shared random secret as Vercel>
APP_BASE_URL=https://wayfinder-modular.vercel.app
EMAIL_FROM=ask.anything@psytec.com.sg
EMAIL_FROM_NAME=Wayfinder by PsyTec
LOGO_URL=<optional public Wayfinder logo URL>
```

`APP_BASE_URL` is used by Apps Script to build:

```text
https://wayfinder-modular.vercel.app/verify.html?token=...
```

## Web App Code

This endpoint accepts POST JSON containing at least:

```json
{ "email": "parent@example.com", "token": "raw-token", "secret": "shared-secret" }
```

```javascript
function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expectedSecret = props.getProperty('VERIFICATION_EMAIL_SECRET');
    var appBaseUrl = props.getProperty('APP_BASE_URL');
    var emailFrom = props.getProperty('EMAIL_FROM') || 'ask.anything@psytec.com.sg';
    var emailFromName = props.getProperty('EMAIL_FROM_NAME') || 'Wayfinder by PsyTec';
    var logoUrl = props.getProperty('LOGO_URL') || '';

    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }
    if (!appBaseUrl || !body.email || !body.token) {
      return jsonResponse({ ok: false, error: 'Missing email, token, or APP_BASE_URL' });
    }

    var verifyUrl = appBaseUrl.replace(/\/$/, '') + '/verify.html?token=' + encodeURIComponent(body.token);
    var subject = body.subject || 'Verify Your Wayfinder Account';
    var supportEmail = body.supportEmail || emailFrom;
    var expiryHours = body.expiryHours || 24;
    var logoHtml = logoUrl
      ? '<img src="' + escapeHtml(logoUrl) + '" alt="Wayfinder" style="max-width:140px;height:auto;margin-bottom:18px;">'
      : '<div style="font-size:22px;font-weight:700;color:#2A3B36;margin-bottom:18px;">Wayfinder</div>';

    var htmlBody =
      '<div style="font-family:Arial,sans-serif;background:#FBF5EA;padding:28px;">' +
      '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #E8D9B5;">' +
      logoHtml +
      '<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7C9885;font-weight:700;">Wayfinder by PsyTec</div>' +
      '<h1 style="font-size:24px;line-height:1.25;color:#2A3B36;margin:12px 0;">Verify Your Wayfinder Account</h1>' +
      '<p style="font-size:15px;line-height:1.6;color:#40514b;">Thank you for creating a Wayfinder account. Please verify your email before opening your parent or counsellor workspace.</p>' +
      '<p style="text-align:center;margin:28px 0;">' +
      '<a href="' + verifyUrl + '" style="background:#5E7A68;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700;display:inline-block;">Verify my account</a>' +
      '</p>' +
      '<p style="font-size:13px;line-height:1.6;color:#66736d;">This link expires in ' + expiryHours + ' hours. If the button does not work, paste this link into your browser:</p>' +
      '<p style="font-size:12px;line-height:1.5;word-break:break-all;color:#40514b;">' + verifyUrl + '</p>' +
      '<hr style="border:0;border-top:1px solid #E8D9B5;margin:24px 0;">' +
      '<p style="font-size:13px;line-height:1.6;color:#66736d;">Need help? Contact <a href="mailto:' + escapeHtml(supportEmail) + '">' + escapeHtml(supportEmail) + '</a>.</p>' +
      '</div></div>';

    var plainBody =
      'Verify Your Wayfinder Account\n\n' +
      'Please verify your email before opening your Wayfinder workspace:\n' +
      verifyUrl + '\n\n' +
      'This link expires in ' + expiryHours + ' hours.\n' +
      'Support: ' + supportEmail;

    GmailApp.sendEmail(body.email, subject, plainBody, {
      htmlBody: htmlBody,
      name: emailFromName,
      from: emailFrom,
      replyTo: supportEmail
    });

    return jsonResponse({ ok: true, provider: 'google-apps-script' });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: 'Email send failed: ' + (err && err.message ? err.message : String(err))
    });
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

## Deployment Notes

- Deploy as a Web App that can receive POST requests from the Wayfinder Vercel app.
- Use the Google Workspace account that owns or has "Send As" permission for `ask.anything@psytec.com.sg`.
- Verify Gmail "Send As" permissions before production testing. If the alias is missing, `GmailApp.sendEmail` can fail or send from the wrong account.
- Apps Script and Gmail quotas are not unlimited. Google documents current quotas here: https://developers.google.com/apps-script/guides/services/quotas
- For production growth, consider custom SMTP or a transactional email provider if Gmail quota, deliverability, or audit needs become stricter.

## Deliverability Checklist

Before deployment, verify DNS and alignment for `psytec.com.sg`:

- SPF includes the systems allowed to send mail for the domain.
- DKIM is configured for the Google Workspace sender.
- DMARC is configured and monitored.
- Test messages pass SPF/DKIM alignment to reduce spam placement.

Also confirm the email shows:

- From: `Wayfinder by PsyTec <ask.anything@psytec.com.sg>`
- Subject: `Verify Your Wayfinder Account`
- Verification button
- 24-hour expiry notice
- Support contact: `ask.anything@psytec.com.sg`
