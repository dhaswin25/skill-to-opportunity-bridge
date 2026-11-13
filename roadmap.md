# Remix Setup — SkillBridge AI Platform

## Done
- [x] Empty Drizzle migration set verified; database schema intact (17 tables, RLS on all).
- [x] Owner account created, email confirmed, Super Admin role granted; /admin and /admin-login verified.
- [x] Default AI configuration row seeded (openai/gpt-5.6-luna, live, 30/day, SkillBridge prompt); live answer and demo fallback both checked.
- [x] Courses & learning sources expanded in the skill library and 37 published content items seeded across 6 tracks.
- [x] Employer flow verified end to end: signup -> pending, admin approve, workspace unlocked.
- [x] Security test suite added (src/lib/__tests__/admin-security.test.ts); full vitest run passes 33/33.
- [x] Control Center "Post a job" form added; 8 currently open roles (Coinbase, Databricks x3, Figma, Cloudflare, Pinterest, MongoDB) posted, each linking to the official apply page.
