# Supabase Branded Email Rollout

## Current Decision

Wayfinder is proceeding with Option A first:

- Keep Supabase Confirm Email enabled.
- Do not disable Supabase confirmation.
- Do not use the custom verification flow as the rollout path yet.
- Keep the existing Supabase-confirmed-session gate in place.
- Do not change app auth logic.
- Do not add secrets to the repo.

For Option A, Supabase Auth remains responsible for sending the signup confirmation, invite, and reset password emails. The immediate rollout is to brand those Supabase Auth emails as:

```text
Wayfinder by PsyTec <ask.anything@psytec.com.sg>
```

Important interaction: branded Supabase confirmation emails confirm the Supabase Auth email flow. Current Option A Wayfinder app access is gated by the refreshed Supabase session user confirmation fields, `session.user.email_confirmed_at` or `session.user.confirmed_at`. Do not treat template branding as a custom `profiles.email_verified` cutover.

## Supabase Configuration Checklist

Use the Supabase Dashboard manually. Do not paste secrets into repo files, screenshots, chat, or browser-visible code.

1. Open the Supabase project for Wayfinder.
2. Go to `Authentication > Providers > Email`.
3. Confirm email/password signup remains enabled if parent signup should remain open.
4. Confirm `Confirm Email` remains enabled.
5. Do not enable auto-confirm for email signup.
6. Go to `Authentication > URL Configuration`.
7. Check the Site URL.
   - Recommended production Site URL: `https://wayfinder-modular.vercel.app`
8. Add or confirm Redirect URLs used by the app and manual tests.
   - `https://wayfinder-modular.vercel.app`
   - `https://wayfinder-modular.vercel.app/`
   - `https://wayfinder-modular.vercel.app/index.html`
   - `https://wayfinder-modular.vercel.app/counsellor.html`
   - `https://wayfinder-modular.vercel.app/counsellor.html**` — **required for MHP invite signup/resend** (`emailRedirectTo` uses `/counsellor.html?mhp_setup=profile` after PR #138)
   - Localhost URLs only when intentionally testing locally.
9. Go to `Authentication > Email Templates`.
10. Update the `Confirm signup` subject and body.
11. Update the `Invite user` template if Supabase invites are used for counsellor/admin provisioning.
12. Update the `Reset password` template if the current reset password flow is enabled or will be tested.
13. Leave template links as Supabase Auth links using `{{ .ConfirmationURL }}` for Option A.
14. Do not point Supabase templates at `/verify.html` for this rollout.
15. Go to `Authentication > SMTP Settings` or the current Custom SMTP configuration area.
16. Configure Custom SMTP only if `ask.anything@psytec.com.sg` has an approved SMTP provider and credentials.
17. Send test emails before changing production-facing wording.

Supabase references:

- Email templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- General Auth configuration: https://supabase.com/docs/guides/auth/general-configuration

## Template Variables

Use Supabase-supported template variables. For these Option A templates, the important variable is:

```text
{{ .ConfirmationURL }}
```

Supabase uses that value for confirmation, invite, and recovery links depending on the template type. Keep it intact unless a separate auth-flow change is approved.

## Confirm Signup Template

Subject:

```text
Verify Your Wayfinder Account
```

Body:

```html
<h2>Verify Your Wayfinder Account</h2>

<p>Welcome to Wayfinder by PsyTec.</p>

<p>Please confirm this email address before opening your Wayfinder account.</p>

<p>
  <a href="{{ .ConfirmationURL }}">Verify my account</a>
</p>

<p>This link may expire. If it no longer works, return to Wayfinder and request a new confirmation email.</p>

<p>If you did not create a Wayfinder account, you can safely ignore this message.</p>

<p>Wayfinder keeps account emails simple. Please do not reply with names, journal content, or private family details.</p>

<p>Need help? Contact <a href="mailto:ask.anything@psytec.com.sg">ask.anything@psytec.com.sg</a>.</p>

<p>Wayfinder by PsyTec</p>
```

Plain-language intent:

- Warm welcome.
- Clear confirmation action.
- No clinical claims.
- No request for sensitive parent, child, or journal details.
- Expiry wording says "may expire" unless the exact Supabase token expiry is separately confirmed.

## Reset Password Template

Use this only if Wayfinder's reset password flow is active or being tested.

Subject:

```text
Reset Your Wayfinder Password
```

Body:

```html
<h2>Reset Your Wayfinder Password</h2>

<p>We received a request to reset the password for your Wayfinder account.</p>

<p>
  <a href="{{ .ConfirmationURL }}">Reset my password</a>
</p>

<p>This link may expire. If it no longer works, request a new password reset from Wayfinder.</p>

<p>If you did not request this change, you can safely ignore this message.</p>

<p>For your privacy, please do not reply with names, journal content, passwords, or private family details.</p>

<p>Need help? Contact <a href="mailto:ask.anything@psytec.com.sg">ask.anything@psytec.com.sg</a>.</p>

<p>Wayfinder by PsyTec</p>
```

## Invite User Template

Use this if Supabase invitations are used for counsellor or admin-provisioned accounts.

Subject:

```text
You Are Invited To Wayfinder
```

Body:

```html
<h2>You Are Invited To Wayfinder</h2>

<p>You have been invited to create a Wayfinder account.</p>

<p>
  <a href="{{ .ConfirmationURL }}">Accept invitation</a>
</p>

<p>This invitation link may expire. If it no longer works, contact the Wayfinder team for a new invitation.</p>

<p>If you were not expecting this invitation, you can safely ignore this message.</p>

<p>For privacy, please do not reply with client names, child names, journal content, or other sensitive details.</p>

<p>Need help? Contact <a href="mailto:ask.anything@psytec.com.sg">ask.anything@psytec.com.sg</a>.</p>

<p>Wayfinder by PsyTec</p>
```

## Custom SMTP Setup Checklist

Custom SMTP is configured in the **Supabase Dashboard**, not in this repo. Wayfinder frontend code does **not** send signup confirmation emails — Supabase Auth does.

### Prerequisites

- [ ] `psytec.com.sg` domain verification complete with the email provider (see [Domain verification checklist](#domain-verification-checklist) below).
- [ ] SPF, DKIM, and DMARC records published and verified before expecting reliable inbox delivery.
- [ ] SMTP credentials collected from the approved provider — **do not commit passwords or API keys to GitHub**.

### Supabase Dashboard steps

1. Open the Wayfinder Supabase project.
2. Go to `Authentication > Providers > Email`.
3. Confirm **Confirm email** remains **ON**.
4. Do **not** enable auto-confirm for email signup.
5. Go to `Authentication > SMTP Settings`.
6. Enable **Custom SMTP**.
7. Enter provider SMTP host, port, and security mode (TLS/SSL per provider docs).
8. Enter SMTP username and password (store only in Supabase Dashboard — never in repo).
9. Set **Sender name:** `Wayfinder by PsyTec`
10. Set **Sender email:** `ask.anything@psytec.com.sg`
11. Set **Reply-to:** `ask.anything@psytec.com.sg`
12. Save and send a test message from Supabase if the dashboard offers one.
13. Go to `Authentication > Email Templates` → **Confirm signup** — confirm `{{ .ConfirmationURL }}` is present (see [Confirm signup template](#confirm-signup-template) below).
14. Go to `Authentication > URL Configuration` — confirm redirect allow list includes counsellor invite wildcard (see [Counsellor invite redirect allow list](#counsellor-invite-redirect-allow-list) below).

### Sender / From / Reply-to guidance

| Field | Value |
|-------|-------|
| Sender name | `Wayfinder by PsyTec` |
| Sender email (From) | `ask.anything@psytec.com.sg` |
| Reply-to | `ask.anything@psytec.com.sg` |

- Use the public admin address only — do not use private test user emails in docs or GitHub.
- The sending account must have permission to send as `ask.anything@psytec.com.sg`.
- Branded sender requires domain verification and SPF/DKIM/DMARC alignment — default Supabase mail is not sufficient for production MHP invite onboarding.

### Provider credential placeholders

Collect from the approved email provider or Google Workspace administrator. Do not store secret values in the repository.

- SMTP host
- SMTP port
- SMTP security mode (TLS or SSL, per provider instructions)
- SMTP username
- SMTP password or app password

If Google Workspace or Gmail SMTP is used:

- The sending account must own, or have permission to send as, `ask.anything@psytec.com.sg`.
- The Google Workspace administrator must confirm SMTP access is allowed.
- An app password or other supported SMTP credential may be needed.
- Gmail and Google Workspace sending limits may apply.
- Google Workspace SMTP can suit an initial low-volume rollout; production may later need a transactional email provider for stronger deliverability, monitoring, and volume controls.

Google references:

- Gmail sending limits: https://support.google.com/a/answer/166852
- Apps Script quotas, for future custom sender work: https://developers.google.com/apps-script/guides/services/quotas

## Domain Verification Checklist

Complete **before** enabling Custom SMTP for production MHP invite signup.

- [ ] Confirm ownership of `psytec.com.sg` with the email provider or Google Workspace admin.
- [ ] Add or update **SPF** record to include the approved sending provider (obtain exact value from provider — do not guess).
- [ ] Enable and verify **DKIM** for the sending domain (record selector and CNAME values from provider).
- [ ] Confirm **DMARC** policy exists and aligns with rollout risk posture.
- [ ] Verify From-domain alignment passes for test messages.
- [ ] Understand return-path / envelope sender behavior for the chosen provider.
- [ ] Send test messages to Gmail and Outlook/Microsoft 365 inboxes.
- [ ] Check inbox, spam, and junk folders for test messages.
- [ ] Review message headers for SPF, DKIM, and DMARC pass/alignment.
- [ ] Disable email tracking or link rewriting if it breaks Supabase Auth `{{ .ConfirmationURL }}` links.

Provider placeholders (collect from admin — do not paste secrets into GitHub):

```text
SPF include/value from provider: <obtain from provider>
DKIM selector(s): <obtain from provider>
DKIM public key/CNAME value(s): <obtain from provider>
DMARC policy/value: <confirm with domain admin>
SMTP host and port: <obtain from provider>
```

## Counsellor Invite Redirect Allow List

MHP invite-bound signup and resend verification set `emailRedirectTo` to:

```text
https://wayfinder-modular.vercel.app/counsellor.html?mhp_setup=profile
```

Initial owner-generated invite links still use `/counsellor.html?mhp_invite=<token>` to open the invitation page only. After email verification, acceptance uses verified email match — **not** the raw token in the redirect URL (PR #138).

Supabase Auth confirmation links will only redirect to allowed URLs. In `Authentication > URL Configuration`:

- **Site URL:** `https://wayfinder-modular.vercel.app`
- **Redirect URLs must include:**
  - `https://wayfinder-modular.vercel.app/counsellor.html`
  - `https://wayfinder-modular.vercel.app/counsellor.html**` — **wildcard required** so query parameters (`?mhp_setup=profile`, legacy token URLs) are permitted

Without the wildcard entry, confirmation email may arrive but the redirect after click may be rejected.

Also keep parent portal redirect URLs as already listed in [Supabase Configuration Checklist](#supabase-configuration-checklist).

## MHP Invite Smoke Test

Run after Custom SMTP, domain verification, and redirect allow list are configured. Requires a valid owner-generated MHP invite link (do not paste real tokens into GitHub).

1. **Owner generates invite link** from `/admin.html`.
2. **Invitee opens invite link** → lands on `/counsellor.html?mhp_invite=<token>` (invited email shown).
3. **Invitee creates account** with the invited email → app shows **Check your email to continue**.
4. **Confirmation email arrives** from `Wayfinder by PsyTec <ask.anything@psytec.com.sg>`.
5. **Invitee clicks confirmation link** in the email.
6. **Browser returns** to `/counsellor.html?mhp_setup=profile` (not a raw token URL).
7. **Invitee signs in** with invited verified email if needed → app consumes invite by **verified email** (`consume_mhp_invite_for_current_user_by_email`).
8. **Existing MHP profile/licence editor opens** (`MentalHealthProfessionalProfileEditor`).

Additional checks:

- **Recovery:** invitee can go to `/counsellor.html`, sign in with invited email, and tap **Continue profile setup** without the original invite tab.
- Resend confirmation from the pending screen uses `/counsellor.html?mhp_setup=profile` redirect (no token).
- Diagnose missing email via Supabase Authentication → Users, Authentication → Logs, and SMTP provider delivery logs.
- Do **not** disable email verification or auto-confirm production users as a workaround.

See also: [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md) § MHP invite signup — Supabase Auth email delivery.

## Vercel Configuration

For pure Option A, no new Vercel environment variables are required. Supabase email templates and Supabase Custom SMTP are configured in the Supabase Dashboard.

Do not add Gmail credentials, SMTP passwords, Supabase service-role keys, or email provider secrets to Vercel unless a separate approved flow needs them.

Future/custom-flow variables, not required for Option A:

```text
EMAIL_FROM=ask.anything@psytec.com.sg
EMAIL_FROM_NAME=Wayfinder by PsyTec
APP_BASE_URL=https://wayfinder-modular.vercel.app
VERIFICATION_EMAIL_ENDPOINT=
VERIFICATION_EMAIL_SECRET=
```

The repo already contains staged custom verification endpoint files. For this Option A package, do not activate, reconfigure, or expand that custom sender path unless separately approved.

## Smoke-Test Checklist

Run this with Supabase Confirm Email still enabled. The branded email verification rollout applies to both client/parent access and counsellor access.

### Email Delivery And Link

- New parent signup receives a branded Supabase confirmation email.
- Confirmation email shows sender name `Wayfinder by PsyTec`.
- Confirmation email shows sender email `ask.anything@psytec.com.sg`.
- Confirmation email subject is `Verify Your Wayfinder Account`.
- Verification link works and confirms the Supabase Auth email flow.
- Resend verification works if currently available in the tested flow.
- Reset password email works if the reset password template was changed.
- Reset password link opens the Set New Password screen before email-verification, wrong-portal, dashboard, or counsellor routing.
- Password update works without exposing tokens or secrets in normal UI.
- Test messages pass SPF, DKIM, and DMARC alignment.
- Test messages do not land in spam/junk for Gmail and Outlook test inboxes.

### Client / Parent Portal

- New parent signup receives the branded verification email.
- Unverified parent is blocked from Dashboard use.
- Unverified parent is blocked from child setup.
- Unverified parent is blocked from journal entries.
- Unverified parent is blocked from AI reflection features.
- Unverified parent is blocked from therapist/request features if those features are currently exposed.
- Resend verification works if currently available.
- Verification link works.
- Verified parent can log in.
- Existing Parent ID / Wayfinder ID is reused.
- Dashboard renders.
- Child ID loads when child records exist.
- Journal history loads when journal records exist.
- Normal UI does not show parent email, Supabase UUID, child names, JWTs, refresh tokens, anon keys, service-role keys, or secrets.

### Counsellor Portal

- Unverified counsellor is blocked.
- Verified parent user is denied from `counsellor.html`.
- Verified counsellor with `profiles.role = counsellor` can access `counsellor.html`.
- **MHP invite signup:** see [MHP Invite Smoke Test](#mhp-invite-smoke-test) — full 8-step owner checklist after Custom SMTP and redirect URLs are configured.
- Counsellor reset-password flow lets the counsellor update their password, then continue to `counsellor.html`.
- Counsellor UI remains PDPA-safe.
- Counsellor UI does not show JWTs, refresh tokens, anon keys, service-role keys, or secrets.

Known gate check: app access is currently gated by Supabase confirmation fields returned on the refreshed session user. If the deferred custom verification flow is later activated, confirm the operational process for `profiles.email_verified` before considering that separate cutover complete.

## Rollback Plan

Keep Supabase Confirm Email enabled throughout rollback.

If template wording causes confusion or link failures:

- Revert the Supabase email template to the previous known-good template.
- Keep `{{ .ConfirmationURL }}` in place.
- Send a fresh test confirmation email.
- Retest signup confirmation and login.

If Custom SMTP delivery fails:

- Revert Custom SMTP to the previous SMTP provider or Supabase default.
- Keep Confirm Email enabled.
- Confirm whether Supabase default SMTP restrictions affect live recipients.
- Retest with approved test users.

Because Option A does not change app code, rollback should not require a code deploy.

## What Not To Do

- Do not disable Confirm Email yet.
- Do not build or activate a custom verification flow for this rollout.
- Do not point Supabase templates at `/verify.html`.
- Do not put Gmail credentials in the repo.
- Do not put SMTP passwords in the repo.
- Do not put the Supabase service-role key in browser code.
- Do not expose JWTs, refresh tokens, auth links, OTPs, or secrets in logs.
- Do not weaken RLS or counsellor/parent data policies.
- Do not claim that Supabase branded emails activate the deferred custom `profiles.email_verified` flow.
