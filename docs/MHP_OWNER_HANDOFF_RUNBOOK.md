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
| MHP colleague invite request | Completed — **admin-mediated only**; copy request message or email Wayfinder admin; no signup link |
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
- The professional can copy a request message or email Wayfinder admin — there is **no public signup link** for MHP.
- MHP accounts require **owner/admin invitation or manual enablement** after the safety checklist (§4).

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

---

## Related docs

- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — living launch snapshot
- [MOBILE_APP_ICONS.md](./MOBILE_APP_ICONS.md) — Parent vs MHP install identities
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — general parent app launch checks
- [auth-profile-flow.md](./auth-profile-flow.md) — auth and profile chain (do not change without explicit approval)
