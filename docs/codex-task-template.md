# Codex Task Template

## Starter Prompt

```text
Read AGENTS.md first.

Task:
<describe task>

Rules:
- Keep the app working.
- Preserve verified-email gate.
- Preserve ensure_profile explicit Bearer fetch.
- Preserve dashboard authenticated reads using verified session.
- Do not add browser-side profiles.insert or profiles.upsert.
- Preserve PDPA-safe UI.
- Normal UI must not show parent email, Supabase UUID, child names, JWTs, or secrets.
- Dashboard data should load by parent_id first.

Before commit:
- Run scripts/verify-wayfinder.ps1.
- Report files changed, checks run, and whether auth/dashboard/privacy was touched.
```

Before editing, read:
- AGENTS.md
- docs/app-architecture-navigation-review.md
- docs/auth-profile-flow.md
- docs/partner-collaboration-and-deployment-rules.md

Task:
<describe task here>

Constraints:
- Keep app working.
- Preserve verified-email gate.
- Preserve ensure_profile explicit Bearer fetch.
- Preserve dashboard authenticated reads using verified session.
- Do not add browser-side profiles.insert or profiles.upsert.
- Preserve PDPA-safe UI.
- Normal UI must not show parent email, Supabase UUID, child names, JWTs, or secrets.
- Dashboard data should load by parent_id first.

Before committing, run:
git diff --check
node --check supabase.js
Select-String -Path .\*.js -SimpleMatch -Pattern "profiles.insert","profiles.upsert","ensure_profile","Authorization"

Report:
- files changed
- checks run
- whether auth/profile flow was touched
- whether dashboard read path was touched
- whether privacy UI was checked
- whether commit/push was done
