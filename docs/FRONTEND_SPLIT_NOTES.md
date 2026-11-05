# AyuCare LK Frontend Delivery — Important Notes

These packages were separated from the user's uploaded working source ZIP. No existing TS/TSX source code was rewritten.

## Team boundaries
- SHARED: Next.js configuration, server session contract, common UI, navigation shell, shared tests.
- MEMBER02: patient list/register/details/edit, patient API proxies, validation, unit tests.
- MEMBER01: authentication login/request access UI, dashboard, auth API handlers and tests.

## Integration warning
The MEMBER02-only branch is a partial app and must NOT be presented as a functional authenticated workflow before MEMBER01 is integrated.
The shared root route redirects to /login, but the /login route belongs to MEMBER01 and will not exist in the MEMBER02-only branch.
Topbar logout similarly references a route that only exists after Member 01 is added.
This is intentional separation; it is not an auth bypass.

## Runtime / truthfulness caveats
- The existing signup request UI displays a success-like claim about routing to the clinic administrator, but the backend does NOT implement a staff access-request API. Member01 should change this to a truthful non-submission notice.
- The UI also contains unverified clinic/SLMC/compliance/audit/encryption claims that should be removed or verified before submission.
- Shared getServerSessionUser() reads a client-readable user profile cookie for display. Backend must remain source of truth for authorization; review server-trusted roles/identity before production.
- Backend state in this local ZIP is not included. GitHub dev should already contain the backend PR3. True login/database integration has not been verified with this ZIP.
- This source ZIP omitted the original .gitignore and .env.example; this delivery supplies a frontend-scoped .gitignore and safe .env.example.

## Quality and safety
Never copy actual credentials, .env.local, database dumps, .next, node_modules, or test patients into PRs.
Run npm ci, npm run typecheck, npm test, npm run lint and npm run build.
Verify these tests independently; earlier user-provided reports are not proof of live backend integration.
