# Issue #71 — MHP production smoke and closure checklist

**Docs-only closure criteria for the Mental Health Professional onboarding / invite track**

Related:

- [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)

---

## Purpose

This checklist records final **owner smoke-test criteria** before closing [Issue #71](https://github.com/rodtay72/wayfinder-app/issues/71). It helps Rodney decide whether the MHP onboarding / invite track is ready to close.

This document does **not** contain secrets, emails, tokens, UUIDs, child names, parent reflections, licence PDFs, or executable SQL. Record only pass/fail and non-sensitive observations.

Wayfinder is **not** a child-diagnosis app, behaviour-labelling app, or generic Behaviour → Advice tool. Child behaviour may reveal a moment where the parent’s Cognition, Affect, and Behaviour (CAB) is not yet aligned with the child’s emerging need.

---

## Scope covered

The Issue #71 track includes:

| Area | Summary |
|------|---------|
| MHP accreditation number support | Separate from certificate/licence number; editable in profile draft |
| Licence extraction / details review | **Viewer-first** by default |
| MHP profile | Remains **draft / review-controlled** until explicitly saved |
| Parent invite / share | **Parent signup link only** |
| MHP colleague invite / request | **Admin-mediated only** — no automatic account creation |
| Public MHP signup | **Not enabled** |
| Counsellor self-creating counsellors | **Not enabled** |
| Mobile install identities | Separate **Wayfinder Parent** and **Wayfinder MHP** home-screen names and icons |
| Owner handoff runbook | Added — [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md) |
| Parent practitioner selector copy | PR #95 — MHP/practitioner wording and display fallback in app |
| Parent practitioner selector names | C6d owner SQL — [supabase-list-available-counsellors-mhp-names.sql](../supabase-list-available-counsellors-mhp-names.sql); apply manually for real names |
| Parent practitioner selector complete only (C6e) | Owner SQL patch — [supabase-list-available-counsellors-mhp-complete-only.sql](../supabase-list-available-counsellors-mhp-complete-only.sql); hide incomplete MHP rows without full_name |
| Owner production smoke (C6f) | **PASS** — ready to close Issue #71 |

---

## Production smoke checklist

**Production URL:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

### Parent portal

- [ ] `/index.html` loads without blank screen.
- [ ] Verified parent can sign in.
- [ ] Dashboard loads Parent ID, children, past reflections/activities.
- [ ] Journal Trail loads.
- [ ] Decode entries still display if present.
- [ ] Parent invite modal opens.
- [ ] Parent invite shares parent signup link only.
- [ ] Practitioner selector label reads **Choose your Mental Health Professional** (after PR #95).
- [ ] Practitioner options show real MHP names where profile data exists (after C6d SQL applied).
- [ ] Parent practitioner selector only shows MHP profiles with completed parent-safe `full_name` (after C6e SQL applied).
- [ ] Incomplete `C-` accounts without `full_name` do not appear in the selector.
- [ ] No parent email, Supabase UUID, or hidden identifiers appear in normal UI.

### MHP / counsellor portal

- [ ] `/counsellor.html` loads without blank screen.
- [ ] MHP/counsellor account can sign in.
- [ ] Workspace loads parent-shared reflections according to existing access rules.
- [ ] Edit profile page opens.
- [ ] Licence/details review is viewer-first by default.
- [ ] “Adjust extracted details” works only when intentionally opened.
- [ ] MHP invite/request modal opens.
- [ ] MHP invite/request shows admin-mediated copy only.
- [ ] No public MHP signup link appears.
- [ ] No automatic professional account creation occurs.

### Account / admin safety

- [ ] MHP account enablement remains owner/admin controlled.
- [ ] Internal role value remains `counsellor`.
- [ ] User-facing label remains Mental Health Professional / MHP.
- [ ] App-facing MHP IDs use `C-` convention where manually enabled.
- [ ] Membership remains `pending_review` unless owner explicitly activates.
- [ ] Public profile remains not visible unless separately reviewed/approved.

### Privacy / data guardrails

- [ ] No auth weakening observed.
- [ ] No email verification bypass observed.
- [ ] Parent journal/dashboard data remains scoped as before.
- [ ] Parent ID / Child ID display remains intact.
- [ ] No child diagnosis, behaviour labelling, or advice-first framing introduced.
- [ ] Android home-screen icon cache issue, if still present, is recorded as non-blocking static asset/cache follow-up.

---

## Owner smoke result

| Date | Environment | Owner result | Notes |
|------|-------------|--------------|-------|
| 2026-06-26 | Production | **PASS** | Owner confirmed after PR #95, C6d SQL, and C6e SQL |

**Owner-confirmed (non-sensitive):**

- Parent portal loaded.
- MHP practitioner selector displayed completed practitioner profile(s) only.
- Incomplete `C-` accounts were hidden from the selector.
- Real MHP name / professional identity displayed (not generic Counsellor fallback rows).
- No generic Counsellor fallback rows remained in the selector.
- No private identifiers (email, Supabase UUID, tokens) were exposed in normal UI.

**Basis:** PR #95 selector wording/display fallback merged; C6d safe MHP names SQL owner-applied; C6e complete-profile-only selector SQL owner-applied and verified.

---

## Closure decision

- [x] Ready to close Issue #71 after owner confirms smoke pass.
- [ ] Keep Issue #71 open if any auth, RLS, journal, dashboard, invite, membership, or profile-publication issue appears.
- [x] Move Android icon cache to separate asset-only follow-up if needed.

---

## Non-sensitive evidence rule

Do **not** paste into GitHub issues, PRs, or this checklist:

- emails
- UUIDs
- tokens
- child names
- parent reflection text
- licence PDFs
- private professional details

Record only **pass/fail** and **non-sensitive observations** (for example: “parent invite modal opened”, “MHP workspace loaded”, “viewer-first review default confirmed”).
