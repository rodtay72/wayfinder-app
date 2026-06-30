# MHP Owner Handoff Runbook

**Issue #71 — docs-only owner/admin guide for Mental Health Professional onboarding**

This runbook helps the owner/admin operate Mental Health Professional (MHP) onboarding safely. It does **not** change app runtime, auth, Supabase, SQL, RLS, or UI behaviour.

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)

---

## 1. Purpose

Wayfinder supports a separate **Mental Health Professional** workspace (internal role: `counsellor`) for reviewing parent reflections when access is granted. MHP accounts must remain **owner/admin controlled** — there is no public professional signup and no self-service role change.

This runbook gives the owner a practical handoff checklist: what Issue #71 completed, how parent vs MHP invites differ, what to verify before telling someone their MHP account is ready, and what remains a non-blocking follow-up.

Wayfinder is **not** a child-diagnosis app, behaviour-labelling app, or generic Behaviour → Advice tool. Child behaviour may reveal a moment where the parent’s Cognition, Affect, and Behaviour (CAB) is not yet aligned with the child’s emerging need.

---

## 2. Current completed Issue #71 scope

The following MHP-related work is substantially complete on the Issue #71 track:

| Area | Status |
|------|--------|
| MHP accreditation number support | Completed — separate from certificate/licence number; editable in profile draft |
| MHP licence extraction / details review | Completed — **viewer-first** read-only review by default; optional “Adjust extracted details” when needed |
| MHP profile draft behaviour | Completed — profile remains draft until explicitly saved/reviewed by the professional |
| Parent invite / share flow | Completed — parent dashboard can share a **parent signup link only** |
| MHP colleague invite request | Completed — **admin-mediated only**; in-app pending request submit (PR #129 when SQL applied) or open email draft to Wayfinder admin (`ask.anything@psytec.com.sg`); counsellor must send email if using draft; no signup link; **no automatic access** |
| Public MHP signup | **Not enabled** |
| Counsellor self-creating counsellors | **Not enabled** |
| Mobile install identities | Completed — separate home-screen names and icons for **Wayfinder Parent** and **Wayfinder MHP** |

Nothing in this scope auto-approves MHP membership, auto-publishes a public MHP profile, or weakens journal or dashboard privacy.

---

## 3. Roles and labels

| Context | Label / value |
|---------|----------------|
| User-facing professional label | **Mental Health Professional** / **MHP** |
| Internal Supabase / app role | `counsellor` — **do not rename** |
| Parent accounts | `parent` role — unchanged |
| MHP enablement | Owner/admin controlled only |

Home-screen install name for the professional portal is **Wayfinder MHP**. Internal code, database role values, and API paths may still use `counsellor`.

---

## 4. MHP enablement safety checklist

Use this checklist **before** telling someone their MHP account is ready. Checklist only — no executable SQL in this document.

- [ ] Confirm the person’s email is **verified** in Supabase auth.
- [ ] Confirm the account belongs to the **intended person** (out-of-band confirmation if needed).
- [ ] Confirm this account **should** become an MHP workspace user.
- [ ] Confirm you are **not** using public signup or any self-service role change to enable MHP access.
- [ ] Confirm the app-facing ID for this account begins with **`C-`** (MHP / counsellor identity convention).
- [ ] Confirm the MHP profile is **draft / not public**.
- [ ] Confirm membership is **`pending_review`** unless you have **explicitly** activated membership for this person.
- [ ] Confirm the **public profile is not visible** unless separately reviewed and approved.
- [ ] Send the manual **“MHP account ready”** message to the professional **only after** all checks above pass.

If any item is unclear, pause enablement and resolve before granting access or sending ready instructions.

---

## 5. Parent invite vs MHP invite

### Parent invite (parent portal)

- The **Invite another parent** control shares a **parent signup link only** (`index.html`).
- It does **not** create MHP accounts or change roles.
- Parents invite other parents to the parent reflection pathway — not to the professional workspace.

### MHP invite / colleague request (MHP portal)

- The MHP **invite request** flow does **not** create professional accounts automatically.
- Copy explains that **Mental Health Professional accounts are created by Wayfinder administrator invitation only**.
- The professional can **submit a pending request for admin review** (PR #129 — requires owner-applied [supabase-mhp-invite-requests.sql](../supabase-mhp-invite-requests.sql)), **copy a request message**, or **open an email draft** to Wayfinder admin (`ask.anything@psytec.com.sg` when configured in app copy) — there is **no public signup link** for MHP.
- **Submit request** creates only a `pending` row in `mental_health_professional_invite_requests`. It does **not** create auth users, profiles, counsellor roles, invite tokens, membership, or publication.
- The **Email / open draft** action pre-fills **To**, subject, and body, but **does not send email automatically**. The counsellor must click **Send** in their mail app. Admin must review before any access is created.
- MHP accounts require **owner/admin invitation or manual enablement** after the safety checklist (§4).

### Owner admin invite request intake (PR #129)

- Owner/admin can view **pending** colleague invite requests on `/admin.html` when signed in as owner admin and after SQL apply.
- Counsellor **Submit request** creates only a `pending` row — no auth user, profile, token, membership, or publication.
- Parents have **no access** to invite request rows via RLS.

### Owner admin invite approval token (PR #131)

- Owner/admin can click **Approve and generate invite link** on a pending (or reviewing) request after applying [supabase-mhp-invite-approval-token-contract.sql](../supabase-mhp-invite-approval-token-contract.sql).
- RPC `create_mhp_invite_token_from_request` returns the **raw token once** — only a **hash** is stored in `mental_health_professional_invite_tokens`.
- Request status becomes **`approved`**; the row leaves the pending queue on refresh.
- Admin UI shows a one-time link, **Copy invite link**, and **Open email draft to colleague** — no automatic email send.
- Copy must state: *This link is for invitation only. It does not activate or publish MHP access automatically.*
- Planned invite route: `/counsellor.html?mhp_invite=<token>` on **public production** — `https://wayfinder-modular.vercel.app/counsellor.html?mhp_invite=<token>` (**PR #138** — token opens invitation page only; acceptance uses verified email after signup/sign-in). Owner-generated colleague links **always use production origin**, not Vercel preview domains.
- **Does not** create Supabase auth users, profiles, counsellor roles, membership, or publication at approval time.
- Payment gateway runtime remains paused until the MHP invitation pipeline is stable end-to-end.

### Invitee email-bound acceptance and onboarding entry (PR #132 + PR #138)

**Canonical flow (PR #138):**

1. Invitee opens `/counsellor.html?mhp_invite=<token>` — token validates invited email only.
2. Invitee creates account with locked invited email.
3. Supabase sends confirmation email; redirect target is `/counsellor.html?mhp_setup=profile` (**not** a raw token URL).
4. After email verification, invitee signs in at `/counsellor.html` (official MHP sign-in) or lands on setup route with verified session.
5. App calls `consume_mhp_invite_for_current_user_by_email()` — **verified email match**, not URL token.
6. Existing `MentalHealthProfessionalProfileEditor` opens via `CounsellorApp` → `editProfile`.

**Recovery:** Invitees do **not** need to preserve the original invite tab. If the token tab or email redirect was lost, sign in at `/counsellor.html` with the invited verified email → **Continue Mental Health Professional profile setup**.

**SQL (owner apply in order):**

- [supabase-mhp-invite-token-acceptance-contract.sql](../supabase-mhp-invite-token-acceptance-contract.sql) — token status + legacy token consume + journal read gate
- [supabase-mhp-invite-email-bound-acceptance-contract.sql](../supabase-mhp-invite-email-bound-acceptance-contract.sql) — **PR #138** email-bound status + consume RPCs

**Runtime rules:**

- `get_mhp_invite_token_status` — validates raw token for **initial invitation page only** (anon-safe).
- `get_mhp_invite_status_for_current_user_email` — authenticated; minimal fields for active invite by verified email.
- `consume_mhp_invite_for_current_user_by_email` — preferred post-verification path; requires `email_confirmed_at`; no raw token.
- `consume_mhp_invite_token_for_current_user` — kept for backward compatibility with old links; **not** the preferred path after authentication.
- Parent portal URLs with `mhp_invite` redirect to `/counsellor.html?mhp_invite=<token>` without creating a parent profile.
- `/counsellor.html` without token is **official MHP sign-in only** when signed out; no public self-registration.
- Browser does **not** persist invite tokens in `sessionStorage` for flow continuation (PR #138).
- Consumption creates counsellor profile (`C-` Wayfinder ID), draft MHP profile (`profile_status = draft`, `profile_visible = false`), and `pending_review` membership — **not publication**.
- Wrong verified email cannot consume — no active invite exists for that email.
- **Journal read safety:** broad `journal_entries` counsellor read requires `can_read_parent_journals_as_mhp()` — active membership only.

### PR #138 merge gates (owner — before merge)

**Review status:** Design direction **accepted** (2026-06-29). Do **not** return to token/`sessionStorage` continuation for invite onboarding.

**Do not merge PR #138 until all of the following are true:**

1. **SQL applied** — Run [supabase-mhp-invite-email-bound-acceptance-contract.sql](../supabase-mhp-invite-email-bound-acceptance-contract.sql) in Supabase SQL Editor **after** [supabase-mhp-invite-token-acceptance-contract.sql](../supabase-mhp-invite-token-acceptance-contract.sql) (PR #132).
2. **Fresh smoke** — Use a **new owner-generated invite link** on production and complete **test-state hygiene** first. Recurring owner smoke email: `rodney@thegreenhouse.sg` — see § MHP invite smoke-test hygiene below.

**Vercel preview vs production (not a Wayfinder auth bug):**

Owner/admin invite approval on a **Vercel protected preview deployment** previously built links from `window.location.origin`, which sent external invitees to **Vercel Login** before Wayfinder loaded. Runtime now always emits colleague-facing invite links on the **public production base URL**:

`https://wayfinder-modular.vercel.app/counsellor.html?mhp_invite=<token>`

For **smoke testing PR #138 before merge**, either:

- Test the preview deployment while **logged into Vercel as owner** (preview protection bypass), or
- **Merge after SQL review** and generate fresh invite links from **production** `/admin.html` on `wayfinder-modular.vercel.app`.

Do **not** send preview-domain invite links to real external invitees. Do **not** treat Vercel preview login as a Wayfinder auth defect.

3. **Smoke confirmations (all must pass):**
   - [ ] Invite link shows invited email
   - [ ] Signup uses locked invited email
   - [ ] Confirmation email redirects to `/counsellor.html?mhp_setup=profile` (not a raw token URL)
   - [ ] Sign-in consumes invite by **verified email** (`consume_mhp_invite_for_current_user_by_email`) — not URL token
   - [ ] Closing the tab after signup still allows recovery from `/counsellor.html` (sign in → **Continue profile setup**)
   - [ ] Wrong verified email cannot consume (no active invite for that email)
   - [ ] `pending_review` MHP cannot broadly read parent `journal_entries` (`can_read_parent_journals_as_mhp()` requires active membership)
   - [ ] Plain `/counsellor.html` remains official MHP sign-in when signed out (no public signup)

**Non-negotiables:**

- No browser-side `profiles.insert` or `profiles.upsert`
- No service-role keys in browser code
- Do not weaken email verification, RLS, MHP publication rules, licence privacy, or the active-membership journal-read gate
- Do not bypass verification or auto-confirm production users
- **Payment gateway remains paused** until this flow passes end-to-end

Record Pass / Fail in operator notes only. Do not paste emails, UUIDs, tokens, or invite links into GitHub.

### MHP invite smoke-test hygiene (recurring owner email)

**Recurring owner smoke-test email:** `rodney@thegreenhouse.sg` — always treat this as Rodney’s default invited-email address for fresh MHP invite onboarding tests unless a different clean address is explicitly chosen.

**Before every fresh MHP invite onboarding test**, run **test-state hygiene** in Supabase (SQL Editor + Authentication → Users). Do **not** start a “clean signup” test until inspection is complete.

#### 1. Inspect current state (required)

Run in Supabase SQL Editor:

```sql
-- Auth user
select id, email, email_confirmed_at, created_at, last_sign_in_at
from auth.users
where lower(email) = lower('rodney@thegreenhouse.sg');

-- App profile
select user_id, parent_id, role, email_verified, created_at
from public.profiles
where user_id in (select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg'));

-- MHP profile + membership
select user_id, full_name, profile_status, profile_visible, updated_at
from public.mental_health_professional_profiles
where user_id in (select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg'));

select user_id, membership_status, institutional_membership_expires_at, updated_at
from public.mental_health_professional_memberships
where user_id in (select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg'));

-- Parent-side rows (should be zero for pure MHP invite tests)
select count(*) as dyads
from public.dyads
where user_id in (select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg'));

select count(*) as journal_entries
from public.journal_entries
where user_id in (select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg'));

-- Invite tokens for this invited email (active / consumed / revoked)
select id, token_status, expires_at, consumed_at, consumed_by, created_at, request_id
from public.mental_health_professional_invite_tokens
where lower(invited_email) = lower('rodney@thegreenhouse.sg')
order by created_at desc;
```

Also check **Supabase Dashboard → Authentication → Users** for `rodney@thegreenhouse.sg` (confirmed vs unconfirmed, created_at).

#### 2. Confirmation email diagnosis rule

Do **not** interpret a missing confirmation email as an app or SMTP defect until you know whether an **Auth user already existed** for the invited email.

- Existing unconfirmed user → resend may not behave like first signup; inspect Auth user + Logs first.
- Leftover rows from a prior test → clean reset (below) before retrying.
- Only after a **confirmed clean state** should missing email point to SMTP / redirect / template configuration.

#### 3. Clean signup reset (when intent is fresh first-time onboarding)

**Order matters.** Owner/manual only — do **not** add runtime cleanup in app code.

1. **Delete app rows first** (only for the test user — replace nothing; email is fixed above):

```sql
with target_user as (
  select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg') limit 1
)
delete from public.journal_entries j using target_user t where j.user_id = t.id;

with target_user as (
  select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg') limit 1
)
delete from public.dyads d using target_user t where d.user_id = t.id;

with target_user as (
  select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg') limit 1
)
delete from public.mental_health_professional_memberships m using target_user t where m.user_id = t.id;

with target_user as (
  select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg') limit 1
)
delete from public.mental_health_professional_profiles p using target_user t where p.user_id = t.id;

with target_user as (
  select id from auth.users where lower(email) = lower('rodney@thegreenhouse.sg') limit 1
)
delete from public.profiles p using target_user t where p.user_id = t.id;
```

2. **Delete the Auth user** — Supabase Dashboard → **Authentication → Users** → delete `rodney@thegreenhouse.sg` (do not use service-role keys in browser; do not auto-confirm or bypass verification).

3. **Generate a fresh invite** — new owner approval from `/admin.html` on production; use the new production link only:

   `https://wayfinder-modular.vercel.app/counsellor.html?mhp_invite=<token>`

#### 4. Test discipline

- Do **not** reuse old invite links.
- Do **not** reuse old confirmation emails (request a new signup or resend only after clean state).
- Do **not** reintroduce token/`sessionStorage` continuation workarounds.
- Do **not** weaken Supabase auth, RLS, email verification, MHP licence/privacy rules, publication rules, or journal read gates.
- **Payment gateway remains paused** until MHP invite onboarding passes end-to-end smoke.

### Repair mistaken parent profile created during MHP invite testing

**Context:** Before PR #133A, an invited MHP could accidentally fall into the parent signup route and create a parent profile. If the account has no parent data, owner may remove only the mistaken `public.profiles` row and then rerun the corrected MHP invite flow.

**Important:** Do **not** add automatic cleanup in app runtime. Do **not** delete auth users from code. Do **not** auto-convert parent profiles to counsellor in the browser. This is **owner/manual SQL only** after PR #133A is deployed.

**Owner diagnostic SQL** — replace `<MHP_EMAIL>` with the invited test email (do not commit real emails into Git):

```sql
select
  u.id as user_uuid,
  u.email,
  p.parent_id,
  p.role,
  p.email_verified
from auth.users u
left join public.profiles p on p.user_id = u.id
where lower(u.email) = lower('<MHP_EMAIL>');
```

**Check whether any parent or MHP data exists** — replace `<MHP_EMAIL>`:

```sql
with target_user as (
  select id
  from auth.users
  where lower(email) = lower('<MHP_EMAIL>')
  limit 1
)
select
  (select count(*) from public.journal_entries j where j.user_id = (select id from target_user)) as journal_entries,
  (select count(*) from public.dyads d where d.user_id = (select id from target_user)) as dyads,
  (select count(*) from public.mental_health_professional_profiles m where m.user_id = (select id from target_user)) as mhp_profiles,
  (select count(*) from public.mental_health_professional_memberships mm where mm.user_id = (select id from target_user)) as mhp_memberships;
```

**Only if all four counts are zero**, owner may remove the mistaken parent profile row — replace `<MHP_EMAIL>`:

```sql
with target_user as (
  select id
  from auth.users
  where lower(email) = lower('<MHP_EMAIL>')
  limit 1
)
delete from public.profiles p
using target_user t
where p.user_id = t.id
  and p.role = 'parent'
returning p.user_id, p.parent_id, p.role;
```

**After repair:**

1. Open the corrected MHP invite link (`/counsellor.html?mhp_invite=<token>`).
2. Create account / verify email; confirmation redirect should use `/counsellor.html?mhp_setup=profile`.
3. Sign in at `/counsellor.html` with the invited verified email if needed.
4. Confirm email-bound consumption creates counsellor profile only.
5. Confirm profile opens in existing `MentalHealthProfessionalProfileEditor`.

PR #133A route isolation prevents the same mistaken parent profile from being recreated when the invite link is used correctly.

### MHP invite signup — Supabase Auth email delivery

**Status:** Email-bound MHP invite acceptance (PR #138) replaces fragile token-continuation through browser tabs and redirects.

**Canonical flow:**

`Invite link (token)` → `Create account` → `Check your email to continue` → Supabase confirmation → `/counsellor.html?mhp_setup=profile` → sign in with invited email → `consume_mhp_invite_for_current_user_by_email()` → existing `MentalHealthProfessionalProfileEditor`.

**Important:** The raw invite token opens the invitation page only. After email verification, onboarding access is based on the **authenticated user's verified email** matching an active approved invite — not on carrying `mhp_invite=<token>` through redirects. Invitees can recover by signing in at `/counsellor.html` with the invited email.

**Remaining owner blocker:** Supabase Dashboard **email delivery configuration** — Custom SMTP, redirect allow list (must include `counsellor.html**` for `?mhp_setup=profile`), branded sender. Do **not** bypass email verification.

#### Required Supabase settings

1. **Keep email verification ON**
   - `Authentication > Providers > Email` → **Confirm email: ON**
   - **Do not** enable auto-confirm for email signup.
   - **Do not** disable confirmation for production onboarding.

2. **Configure Custom SMTP** (required/recommended for reliable production delivery)
   - `Authentication > SMTP Settings` — configure **after** `psytec.com.sg` domain verification with the email provider.
   - **Sender name:** `Wayfinder by PsyTec`
   - **Sender email:** `ask.anything@psytec.com.sg`
   - **Reply-to:** `ask.anything@psytec.com.sg`
   - **SPF / DKIM / DMARC** must be configured with the email provider before expecting reliable inbox delivery.
   - Full checklists: [supabase-branded-email-rollout.md](./supabase-branded-email-rollout.md)

3. **Confirmation email template**
   - `Authentication > Email Templates` → **Confirm signup**
   - **Must keep** `{{ .ConfirmationURL }}` — do not replace with a static URL or custom unverified path.
   - Branding guidance: [supabase-branded-email-rollout.md](./supabase-branded-email-rollout.md)

4. **Redirect URL allow list**
   - `Authentication > URL Configuration`
   - **Site URL:** `https://wayfinder-modular.vercel.app`
   - **Redirect URLs must include:**
     - `https://wayfinder-modular.vercel.app/counsellor.html`
     - `https://wayfinder-modular.vercel.app/counsellor.html**` (wildcard — allows query parameters)
   - **MHP invite flow uses post-verification redirect:**
     - `https://wayfinder-modular.vercel.app/counsellor.html?mhp_setup=profile`
   - **Initial invite link (token only):**
     - `https://wayfinder-modular.vercel.app/counsellor.html?mhp_invite=<token>`
   - If the wildcard entry is missing, confirmation links may be rejected even when email is delivered.

#### Diagnose missing confirmation email

Check in this order (do **not** paste SMTP passwords, API keys, raw tokens, Supabase UUIDs, or real invite links into GitHub):

1. **Supabase Dashboard → Authentication → Users** — was the test user created? Is email unconfirmed?
2. **Supabase Dashboard → Authentication → Logs** — signup / mail / rate-limit errors?
3. **SMTP provider delivery logs** — message accepted, bounced, or deferred?
4. **Recipient spam/junk folder** — especially before SPF/DKIM/DMARC are verified.
5. **Redirect URL allow list** — does it include `counsellor.html**` for invite query params?
6. **Custom SMTP** — is it enabled and sending as `ask.anything@psytec.com.sg`?

Supabase default mail may be rate-limited or unreliable for production; Custom SMTP is the expected production path.

#### MHP invite email smoke test (after SMTP + redirect URLs configured)

1. Owner generates invite link from `/admin.html`.
2. Invitee opens `/counsellor.html?mhp_invite=<token>` → invited email shown.
3. Invitee creates account → app shows **Check your email to continue**.
4. Confirmation email arrives from `Wayfinder by PsyTec <ask.anything@psytec.com.sg>`.
5. Invitee clicks confirmation link → browser returns to `/counsellor.html?mhp_setup=profile` (not token URL).
6. Invitee signs in with invited verified email (if session not auto-established).
7. App consumes invite by **verified email** (`consume_mhp_invite_for_current_user_by_email`) — not URL token.
8. Existing `MentalHealthProfessionalProfileEditor` opens.
9. **Recovery test:** close tab after signup → go to `/counsellor.html` → sign in with invited email → **Continue profile setup** works without original invite tab.
10. Wrong verified email cannot consume — no active invite for that email.

#### Do not

- Disable email verification or auto-confirm production users in Supabase or frontend.
- Bypass verification with service-role keys, manual `email_confirmed_at` updates for production onboarding, or custom unverified access paths.
- Add frontend “send email ourselves” workarounds unless separately approved as a distinct auth architecture change.
- Commit SMTP passwords, API keys, raw invite tokens, or private test emails to the repo or GitHub.

---

## 6. Data / privacy guardrails

This Issue #71 scope and this runbook do **not** authorise:

- Weakening auth, email verification, or session handling
- Weakening RLS or broadening journal visibility
- Changing Parent ID / Child ID generation or privacy masking rules
- Activating a new **public professional directory**
- Publishing an MHP profile unless separately reviewed and approved

Journal save/read, dashboard loading, parent reflection privacy, and ALIGN/CAB framing remain unchanged. MHP access to parent content remains governed by existing grant and review flows — not by this documentation.

---

## 7. Manual smoke checklist

After MHP-related merges or before telling a professional their account is ready, run these checks on production (or staging if applicable):

- [ ] **Parent portal** loads (`/index.html`) — dashboard, journal trail, existing parent data.
- [ ] **Counsellor / MHP portal** loads (`/counsellor.html`).
- [ ] Existing **parent journal and dashboard** still load for a verified parent test account.
- [ ] **Parent invite modal** opens from the parent dashboard and shows parent signup copy only.
- [ ] **MHP invite / request modal** opens from the MHP workspace and shows admin-mediated copy only (no signup link).
- [ ] **MHP profile edit / licence review** remains **viewer-first** by default; adjust mode still works when needed.
- [ ] **No blank screen** on parent or MHP entry after verified login.

Record Pass / Fail only in operator notes. Do not paste emails, UUIDs, tokens, child names, or reflection content into GitHub.

---

## 8. Known follow-up / not blocking

| Item | Notes |
|------|--------|
| Android Add to Home Screen icon caching | Some Android devices may still show an **older shortcut icon** after deploy. This is a **static asset / browser cache** issue, not an auth, data, or journal blocker. |
| Remediation | Delete old shortcut, clear Chrome site data for the production URL, reopen the correct portal, add to home screen again. Future **asset-only** fixes can ship separately (see [MOBILE_APP_ICONS.md](./MOBILE_APP_ICONS.md)). |

These items do **not** block owner handoff of the MHP onboarding/invite flow documented here.

---

## Owner-applied SQL — practitioner selector names (Issue #71 C6d)

**PR #95** changed frontend selector wording and fallback display only. Real Mental Health Professional names in the parent practitioner dropdown require the owner-applied SQL patch:

- File: [supabase-list-available-counsellors-mhp-names.sql](../supabase-list-available-counsellors-mhp-names.sql)
- Run manually in the Supabase SQL Editor (not auto-applied on deploy)

After applying, verify in SQL Editor:

```sql
select * from public.list_available_counsellors();
```

**Expected:** `C-00001` returns `full_name` **Rodney Tay** (or the populated MHP profile name) when that profile row exists. Other rows may show professional title or institution name, or fall back to `Mental Health Professional C-XXXXX`.

**Must not appear:** emails, Supabase UUIDs, invite tokens, licence files, storage paths, extraction JSON, or other private fields.

This selector is for parent-directed review sharing — not the public professional directory. It does **not** require `profile_visible = true` or `profile_status = 'published'`. It does **not** activate membership or publish profiles.

**Superseded by PR #104:** After owner applies [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql), the parent selector lists **published + active** MHPs only — see §9 below.

---

## Owner-applied SQL — complete MHP profiles only (Issue #71 C6e)

**C6d** made safe MHP name fields available in `list_available_counsellors()`. **C6e** narrows parent selector visibility to completed MHP profile identities.

- File: [supabase-list-available-counsellors-mhp-complete-only.sql](../supabase-list-available-counsellors-mhp-complete-only.sql)
- Run manually in the Supabase SQL Editor after C6d (replaces the same function)

**Behaviour:** Only Mental Health Professionals with a non-blank `full_name` in `mental_health_professional_profiles` appear in the parent practitioner selector. Incomplete MHP accounts may remain internal but are **hidden** from parent selection until `full_name` is populated.

**Does not:** publish profiles, activate memberships, expose emails/UUIDs/tokens/licence files, or weaken RLS.

After applying, verify:

```sql
select * from public.list_available_counsellors();
```

**Expected:** Only rows with populated `full_name` (for example **Rodney Tay** for `C-00001`). Incomplete `C-` accounts without `full_name` do **not** appear.

**Superseded by PR #104:** After owner applies [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql), the parent selector requires **published + active** publication — not merely a populated `full_name`. See §9.

---

## 9. Owner-admin publication model (PR #104)

MHP draft or profile completion is **not** publication. Only Wayfinder owner/admin can approve and publish a Mental Health Professional for parent/client visibility.

### Draft / pending vs published / active

| State | Meaning | Parent selector |
|-------|---------|-----------------|
| `profile_status` = `draft` or `pending_review` | MHP is completing profile/licence review | **Hidden** |
| `profile_status` = `published` + `profile_visible` = true | Owner/admin approved public professional identity | **May appear** if membership also active |
| `membership_status` = `pending_review` | Membership not yet owner-approved | **Hidden** |
| `membership_status` = `active` | Owner/admin activated membership | **May appear** if profile also published |
| `profile_status` = `hidden` or `suspended` | Owner/admin withheld or suspended profile | **Hidden** |
| `membership_status` = `expired` or `suspended` | Membership lapsed or suspended | **Hidden** |

**Rule:** Parent journal-sharing dropdown (`list_available_counsellors()`) lists only MHPs where **all** of the following are true:

- `profiles.role` = `counsellor` and `parent_id` is set
- `mental_health_professional_profiles.full_name` is non-blank
- `profile_status` = `published`
- `profile_visible` = true
- `membership_status` = `active`
- membership expiry is null or in the future

This matches publication status — not merely whether the MHP filled in a name.

### Owner admin setup

1. Owner applies [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql) in Supabase SQL Editor.
2. Owner manually inserts their auth `user_id` into `public.owner_admin_users`:

```sql
insert into public.owner_admin_users (user_id, admin_status)
values ('<owner-auth-user-uuid>', 'active');
```

3. While signed in as that owner admin, verify:

```sql
select public.is_wayfinder_owner_admin();
```

**Expected:** `true` for the owner admin account; `false` for all other users.

There is **no** authenticated INSERT/UPDATE/DELETE policy on `owner_admin_users`. Only manual owner setup in Supabase.

### Owner publication RPC (only supported path until admin UI)

Until an owner admin review page is built, publication uses:

```sql
select public.owner_set_mhp_publication(
  '<mhp-auth-user-uuid>'::uuid,
  'published',   -- draft | pending_review | published | hidden | suspended
  true,          -- profile_visible
  'active'       -- pending_review | active | expired | suspended
);
```

**Rules enforced by RPC:**

- Only `is_wayfinder_owner_admin()` callers may run it
- `published` requires `profile_visible = true` and `membership_status = 'active'`
- `membership_status = 'active'` alone does **not** publish — owner must set `profile_status = 'published'` explicitly
- Does **not** change auth role, `profiles.parent_id`, or licence document records
- Does **not** expose PDFs or extraction JSON

**Example — return MHP to draft review:**

```sql
select public.owner_set_mhp_publication(
  '<mhp-auth-user-uuid>'::uuid,
  'pending_review',
  false,
  'pending_review'
);
```

### Verify parent selector after publication

```sql
select * from public.list_available_counsellors();
```

**Expected:** Only owner-published, active MHP rows with non-blank `full_name`. Draft/pending MHPs with names do **not** appear.

**Must not appear:** emails, Supabase UUIDs, invite tokens, licence files, storage paths, extraction JSON, or hidden identifiers.

### What PR #104 does not do

- No public MHP signup
- No counsellor self-creation or self-publish
- No automatic membership activation
- No public profile directory UI (future PR)

---

## 10. Owner admin page (PR #105)

Wayfinder provides an owner-admin review page at **`/admin.html`**. It is **not linked from the parent dashboard** — access it directly when signed in as an owner admin.

### Prerequisites

1. Apply [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql) (PR #104)
2. Apply [supabase-mhp-owner-admin-review-rpc.sql](../supabase-mhp-owner-admin-review-rpc.sql) (PR #105)
3. Apply [supabase-mhp-invite-requests.sql](../supabase-mhp-invite-requests.sql) (PR #129) — for in-app pending invite request submit and owner admin intake queue
4. Apply [supabase-mhp-invite-approval-token-contract.sql](../supabase-mhp-invite-approval-token-contract.sql) (PR #131) — for owner/admin approve + one-time invite token generation
5. Apply [supabase-mhp-invite-token-acceptance-contract.sql](../supabase-mhp-invite-token-acceptance-contract.sql) (PR #132) — for invitee token validation + consumption
6. Insert the owner auth `user_id` into `public.owner_admin_users` (see §9)

### Page behaviour

| State | What the user sees |
|-------|-------------------|
| Not signed in | Owner admin **sign-in only** — no signup, no public invite |
| Signed in, not owner admin | **Owner admin access required.** — no MHP data |
| Signed in as owner admin | **Pending MHP colleague invite requests** (approve + one-time link in PR #131) and **Mental Health Professional review queue** with filters and publication actions |

### Invite request intake and approval (PR #129 + PR #131)

- Shows **pending** and **reviewing** rows from `mental_health_professional_invite_requests`.
- **Approve and generate invite link** (PR #131) calls owner/admin RPC; raw token returned once; hash stored only.
- **Generated invitation links** section keeps recently created links visible for copy/email after the request is approved.
- Displays colleague name/email, optional requester note, requester Wayfinder ID, and submitted date.
- **No automatic email send** — admin copies link or opens mailto draft to colleague.
- If approval SQL is not applied, approve shows unavailable message; pending queue still loads.
- Invitee token consumption: **PR #132 + #133A** — route `/counsellor.html?mhp_invite=<token>&setup=profile`; consume → existing profile/licence editor.

### Review queue filters

- **Pending / Draft** — `draft`, `pending_review`
- **Published** — owner-published profiles
- **Hidden / Suspended** — withheld or suspended profiles
- **All** — every counsellor MHP profile row

Each card shows Wayfinder ID, name, licence/accreditation fields, profile and membership status, licence document metadata (not PDFs), enquiry contact fields, and short bio preview. Supabase UUIDs, auth emails, storage paths, and extracted JSON are **not** shown.

### Publication actions (server RPC authority)

| Action | RPC effect | Parent selector |
|--------|----------|-----------------|
| **Publish + activate** | `published`, visible, `active` membership | **Appears** when other selector rules pass |
| **Keep pending review** | `pending_review`, hidden | **Hidden** |
| **Unpublish / hide** | `hidden`, hidden | **Hidden** |
| **Suspend** | `suspended`, hidden, suspended membership | **Hidden** |

Publish + activate and Suspend require confirmation in the UI. MHPs **cannot** self-publish through the frontend — `owner_set_mhp_publication` enforces owner admin on the server.

### Manual smoke (after PR #105 merge + SQL apply)

1. Open `/admin.html` and sign in as owner admin → queue loads
2. Sign in as non-owner → access denied, no queue data
3. **Publish + activate** an MHP → parent journal-sharing dropdown shows that practitioner
4. **Keep pending**, **hide**, or **suspend** → MHP removed from parent dropdown
5. MHP portal (`/counsellor.html`), parent dashboard, Journal Trail, and Relationship Garden still load

**No App Version entry** — this is owner/admin UX only, not parent/client-facing.

---

## 11. MHP profile images (PR #106)

Photo URL on the MHP profile draft is **not** the production image workflow. See [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) for the preferred model:

- Private **source photo** upload (future PR)
- **Wayfinder-style illustrated portrait** generation/selection (future PR)
- **Owner/admin image approval** alongside profile publication (future PR)
- Parent/client sees **approved portrait only** for published + active MHPs (future PR)

SQL/storage contract (owner-applied, no runtime yet): [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql)

**Not implemented in PR #106:** upload UI, image generation, admin image review UI, public profile directory image display.

---

## 12. Private source photo upload (PR #107)

MHPs can upload a **private source photo** from Edit profile in the MHP portal (`/counsellor.html`).

| Rule | Detail |
|------|--------|
| Visibility | Source photo is **private** — not shown to parents/clients |
| Preview | Logged-in MHP sees a **temporary signed URL** preview only |
| Publication | Upload does **not** publish profile or activate membership |
| Photo URL field | **Legacy/transitional** — upload does not copy into `photo_url` |
| Owner review | Image approval remains a **future PR** (generation + owner admin review) |

**Owner SQL prerequisite:** Apply [supabase-mhp-profile-image-upload-policies.sql](../supabase-mhp-profile-image-upload-policies.sql) after PR #106 table contract. Both buckets must remain **private**.

**File rules:** JPG, PNG, or WebP up to 2 MB.

See [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) for the full image lifecycle.

---

## 13. Owner source photo review (PR #110)

The owner/admin review page at `/admin.html` can show a **temporary signed preview** of each MHP's private source photo during profile review.

| Rule | Detail |
|------|--------|
| Visibility | Source photo remains **private** — not shown to parents or clients |
| Preview | Owner admin sees a **temporary signed URL** thumbnail only |
| Approval | Viewing the source photo does **not** approve, publish, or promote the image |
| Photo URL field | **Legacy/transitional** — source photo is not copied into `photo_url` |
| Parent display | **Not implemented** — portrait generation and parent/client display remain future PRs |

**Owner SQL prerequisite:** Apply [supabase-mhp-owner-image-review-rpc.sql](../supabase-mhp-owner-image-review-rpc.sql) after PR #106 table contract and PR #107 upload policies. Both buckets must remain **private**.

---

## 14. Owner approved portrait upload (PR #113)

The owner/admin review page at `/admin.html` can **upload** a final approved Wayfinder-style portrait for an MHP.

| Rule | Detail |
|------|--------|
| Who uploads | **Owner/admin only** — MHP cannot self-upload approved portraits in this PR |
| Storage | Private bucket `professional-profile-portraits` — path `mhp/{mhp_user_id}/approved/{timestamp}.{ext}` |
| Metadata | `image_kind = approved_portrait`, `image_status = approved`, `portrait_style = wayfinder_manual` |
| Visibility | **Private** — not shown to parents or clients |
| Publication | Upload does **not** publish profile, change membership, or write `photo_url` |
| Parent display | **Not implemented** — parent/client portrait display remains a future PR |

**File rules:** JPG, PNG, or WebP up to 2 MB.

**Owner SQL prerequisite:** Apply [supabase-mhp-owner-portrait-upload-policies.sql](../supabase-mhp-owner-portrait-upload-policies.sql) after PR #106, PR #107, and PR #110 review RPC.

**Verify after upload:**

```sql
select
  image_kind,
  image_status,
  storage_bucket,
  storage_path,
  mime_type,
  file_size_bytes,
  portrait_style,
  approved_by,
  approved_at,
  created_at
from public.mental_health_professional_profile_images
where image_kind = 'approved_portrait'
order by created_at desc
limit 10;
```

---

## 15. Owner AI sketch portrait generation (PR #114)

Owner/admin can generate a **private Wayfinder-style sketched portrait** from an MHP's uploaded source photo on `/admin.html`. As of PR #116, the server-side prompt targets a **black-and-white photorealistic graphite pencil sketch** with strong likeness (no colour wash or soft editorial illustration).

| Rule | Detail |
|------|--------|
| Who generates | **Owner/admin only** — server-side OpenAI call; no browser API keys |
| Input | Latest private `source_photo` from owner metadata RPC |
| Output | Private `generated_portrait` in `professional-profile-portraits` |
| Approval | Owner clicks **Save as approved portrait** → new `approved_portrait` row (copy); does not write `photo_url` |
| Visibility | **Private** — not shown to parents or clients |
| Manual fallback | PR #113 manual approved portrait upload remains available |

**Vercel server environment (required for generation):**

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Server-side OpenAI Image API only — never expose to browser |
| `OPENAI_IMAGE_MODEL` | Optional — default `gpt-image-1` (configure another GPT Image model if needed) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side storage download/upload + metadata insert (same as licence extraction) |
| `MHP_PORTRAIT_GENERATION_TIMEOUT_MS` | Optional — default `110000` (ms) for OpenAI request timeout |

**Owner SQL prerequisite:** Apply [supabase-mhp-owner-generated-portrait-policies.sql](../supabase-mhp-owner-generated-portrait-policies.sql) after PR #113.

**API route:** `POST /api/mhp-generate-portrait` — actions `generate` and `approveGenerated`; requires owner admin bearer token.

**Verify after generation/approval:**

```sql
select
  image_kind,
  image_status,
  storage_bucket,
  storage_path,
  mime_type,
  file_size_bytes,
  portrait_style,
  approved_by,
  approved_at,
  created_at
from public.mental_health_professional_profile_images
where image_kind in ('generated_portrait', 'approved_portrait')
order by created_at desc
limit 20;
```

---

## 16. Current approved portrait selection (PR #117)

An MHP may have **multiple** `approved_portrait` history rows. Only one should be treated as the **current** selected approved portrait before any future parent/client display.

| Rule | Detail |
|------|--------|
| Current portrait | `image_kind = approved_portrait`, `image_status = approved`, `selected_at is not null` — newest `selected_at` wins |
| Legacy fallback | If no row has `selected_at`, UI/API may use newest approved portrait by `created_at desc` until owner selects explicitly |
| Owner action | `owner_select_mhp_approved_portrait(image_id)` clears `selected_at` on other approved rows for that MHP and sets `selected_at = now()` on the chosen row |
| History | Older approved portraits are **not deleted** |
| Display | Still private owner/admin only — not shown to parents/clients; does not write `photo_url` |

**Owner SQL prerequisite:** Apply [supabase-mhp-owner-current-portrait-selection.sql](../supabase-mhp-owner-current-portrait-selection.sql) after PR #110 review RPC.

Manual upload and **Save as approved portrait** from generated sketch both mark the new approved portrait as current after insert.

---

## 17. Parent portrait display (PR #118)

Parents may see the **current selected approved portrait** only in existing review-sharing selection areas — not a public directory browse.

| Rule | Detail |
|------|--------|
| API | `POST /api/list-available-mhps` — authenticated parent session; server enforces same visibility as `list_available_counsellors()` |
| Portrait source | `approved_portrait` + `approved` + `selected_at is not null` + bucket `professional-profile-portraits` |
| URL delivery | Short-lived signed URL generated **server-side** with service role; bucket stays private |
| Parent UI | Small rounded avatar beside MHP name; initials placeholder if portrait unavailable |
| Never shown | Source photo, generated candidate, unselected approved history, storage paths, Supabase UUIDs, `photo_url` |

No new parent/client storage SELECT policies. Fallback: if API unavailable, selector still loads MHP names via `list_available_counsellors()` without portraits.

---

## 18. Owner-approved MHP portrait workflow (production)

Use this end-to-end workflow when onboarding or updating an MHP portrait. Detailed PR sections above (§12–§17) remain reference; this section is the **operational checkpoint**.

### Step-by-step

1. **MHP uploads private source photo** — MHP portal → private source photo to `professional-profile-image-sources` (PR #107 / #109).
2. **Owner reviews source photo in admin** — `/admin.html` → private source photo preview (PR #110).
3. **Owner may generate AI sketch candidate** — **Generate Wayfinder sketch** (PR #114–#116); output is `generated_portrait` only.
4. **Owner may ignore AI candidate if likeness is poor** — generated sketch is **not** parent-visible and **not** authoritative.
5. **Owner uploads approved pencil sketch manually if preferred** — **Upload approved portrait** (PR #113) remains the trusted production fallback.
6. **Owner confirms “Current approved portrait” is selected** — status shows **approved · Current** with `selected_at` populated (PR #117).
7. **Owner confirms MHP profile is published, visible, and active** — publication RPC / admin queue (PR #104 / #105).
8. **Parent side shows only the selected approved portrait** — review-sharing selector via `/api/list-available-mhps` (PR #118).

### Smoke checklist

- [ ] `/admin.html` (owner) shows **Current approved portrait** for the MHP.
- [ ] Parent portal → Journal Trail review sharing → selector shows **selected approved portrait** beside MHP name.
- [ ] **Source photo** is **not** shown to parent.
- [ ] **Generated candidate** is **not** shown to parent.
- [ ] **Older approved portraits** (history) are **not** shown to parent.
- [ ] **`photo_url`** unchanged / not used for new portrait display.
- [ ] **Journal and dashboard** still load.
- [ ] **MHP portal** unchanged (source upload still private; no parent-facing portrait leak).

---

## Related docs

- [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) — profile image strategy and future PR sequence

- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — living launch snapshot
- [MOBILE_APP_ICONS.md](./MOBILE_APP_ICONS.md) — Parent vs MHP install identities
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — general parent app launch checks
- [auth-profile-flow.md](./auth-profile-flow.md) — auth and profile chain (do not change without explicit approval)
