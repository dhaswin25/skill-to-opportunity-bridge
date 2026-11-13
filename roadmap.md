# Remix Setup — SkillBridge AI Platform

## Done
- [x] Empty Drizzle migration set verified; database schema intact (17 tables, RLS on all).

## Open
- [ ] Provision Super Admin for dhaswinselvam25@gmail.com (confirm email, admin role, /admin + /admin-login access).
- [ ] Seed default AI configuration row (model openai/gpt-5.6-luna, enabled, live mode, daily_limit 30, SkillBridge prompt).
- [ ] Expand courses & learning sources catalog (skills.ts + published platform_content across 6 tracks).
- [ ] Verify employer signup -> pending status, admin approve/reject flow, /employer gating + review banner.
- [ ] Add src/lib/__tests__/admin-security.test.ts (roles, suspension, AI cost formula, audit log) and run vitest.
