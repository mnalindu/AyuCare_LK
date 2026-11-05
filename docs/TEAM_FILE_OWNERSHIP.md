# AyuCare LK — Team File Ownership Manifest (Sprint 01)

> **Authority**: This manifest is the official team demarcation for Sprint 01 delivery.
> **Last Updated**: Phase 04 (Full Frontend QA & Integration Testing Complete).
> **Workflow**: Member 02 develops all six screens locally on `feat/sprint01-full-local`. When ready to deliver, Member 02 pushes ONLY `SHARED` and `MEMBER02` files to `feat/member02-patients`. Member 01 receives a clean path-preserving ZIP containing only `MEMBER01` files to commit and push from her own branch (`feat/member01-auth`).

---

## 1. Ownership Rules & Import Boundaries

1. **`SHARED`**:
   - Reusable Next.js app configuration, design system tokens, layout shell, base UI primitives, shared types, and server-side session interface contract.
   - **Rule**: `SHARED` files must **NEVER** import from `MEMBER01` implementation files (`features/auth`, `(auth)/login`, `(staff)/dashboard`).
   - Owned and published by **Member 02** as the base foundation for the team.

2. **`MEMBER02`**:
   - Patient Management screens (`/patients`, `/patients/new`, `/patients/[id]`, `/patients/[id]/edit`), patient BFF route handlers, patient Zod validation, client service, and patient tests.
   - **Rule**: `MEMBER02` files import only from `SHARED` and internal `MEMBER02` paths. They **NEVER** import from `MEMBER01`.
   - Owned by **Member 02**.

3. **`MEMBER01`**:
   - Staff Login screen (`/login`), Staff Dashboard (`/dashboard`), Auth BFF route handlers (`/api/auth/*`), Auth context/hooks, and auth tests.
   - **Rule**: `MEMBER01` files import from `SHARED` and internal `MEMBER01` paths.
   - Owned by **Member 01**.

---

## 2. File Ownership Inventory

### A. SHARED Foundation (Included in Member 02 PR)
| File Path | Description | Owner | Status |
|---|---|:---:|:---:|
| `.gitignore` | Root Git exclusion rules | SHARED | Created (Phase 01) |
| `docs/TEAM_FILE_OWNERSHIP.md` | Team ownership and branch delivery manifest | SHARED | Updated (Phase 02) |
| `frontend/package.json` | Project dependencies and build scripts | SHARED | Created (Phase 01) |
| `frontend/package-lock.json` | Dependency lockfile | SHARED | Created (Phase 01) |
| `frontend/tsconfig.json` | Strict TypeScript configuration & `@/*` alias | SHARED | Created (Phase 01) |
| `frontend/next.config.mjs` | Next.js configuration | SHARED | Created (Phase 01) |
| `frontend/postcss.config.mjs` | PostCSS config for Tailwind | SHARED | Created (Phase 01) |
| `frontend/tailwind.config.ts` | Clinical Clarity tokens & radii configuration | SHARED | Created (Phase 01) |
| `frontend/.eslintrc.json` | Next.js ESLint configuration | SHARED | Created (Phase 01) |
| `frontend/vitest.config.ts` | Vitest testing configuration | SHARED | Created (Phase 01) |
| `frontend/tests/setup.ts` | Test environment setup (`@testing-library/jest-dom`) | SHARED | Created (Phase 01) |
| `frontend/.env.example` | Environment variable template | SHARED | Created (Phase 01) |
| `frontend/src/app/globals.css` | Clinical clarity tokens, reset, reduced motion | SHARED | Created (Phase 01) |
| `frontend/src/app/layout.tsx` | Root Next.js layout, fonts (Plus Jakarta Sans & Inter) | SHARED | Created (Phase 01) |
| `frontend/src/app/page.tsx` | Root landing & foundation status view | SHARED | Created (Phase 01) |
| `frontend/src/app/(staff)/layout.tsx` | Server layout for staff workspace | SHARED | Created (Phase 01) |
| `frontend/src/types/auth.ts` | `StaffRole`, `StaffUser`, `AuthSession` contracts | SHARED | Created (Phase 01) |
| `frontend/src/types/api.ts` | `ApiErrorResponse`, `PaginatedResponse` contracts | SHARED | Created (Phase 01) |
| `frontend/src/lib/utils.ts` | `cn`, localized date formatters (`Asia/Colombo`) | SHARED | Created (Phase 01) |
| `frontend/src/lib/auth/rbac.ts` | Pure RBAC check helpers (`canViewPatients`, `canManagePatients`) | SHARED | Created (Phase 01) |
| `frontend/src/lib/auth/session-contract.ts` | Server-only HttpOnly cookie reader & CSRF validator | SHARED | Created (Phase 01) |
| `frontend/src/lib/api/http-client.ts` | Typed server BFF fetcher and client fetcher | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/button.tsx` | Accessible button with loading state & variants | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/input.tsx` | Accessible input with validation error & actions | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/badge.tsx` | Status tags and pill chips | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/card.tsx` | Level-1 elevation containers | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/alert.tsx` | Accessible alert banners (danger, warning, success) | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/dialog.tsx` | Accessible modal overlay (Level-3 elevation) | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/toast.tsx` | Auto-dismissing toast notifications & provider | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/skeleton.tsx` | Pulse loading skeleton for tables and cards | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/table.tsx` | Accessible tabular data foundation | SHARED | Created (Phase 01) |
| `frontend/src/components/ui/empty-state.tsx` | Centered empty result layout | SHARED | Created (Phase 01) |
| `frontend/src/components/layout/sidebar.tsx` | Persistent 248px desktop navigation sidebar | SHARED | Created (Phase 01) |
| `frontend/src/components/layout/topbar.tsx` | 64px top navigation bar with user session pill | SHARED | Created (Phase 01) |
| `frontend/src/components/layout/mobile-nav.tsx` | Responsive off-canvas slide drawer for mobile | SHARED | Created (Phase 01) |
| `frontend/src/components/layout/staff-shell.tsx` | Responsive shell wrapper | SHARED | Created (Phase 01) |
| `frontend/tests/lib/utils.test.ts` | Unit tests for class merging and date formatting | SHARED | Created (Phase 01) |
| `frontend/tests/lib/rbac.test.ts` | Unit tests for role-based access rules | SHARED | Created (Phase 01) |
| `frontend/tests/components/button.test.tsx` | Unit tests for button component | SHARED | Created (Phase 01) |
| `frontend/tests/components/input.test.tsx` | Unit tests for input component | SHARED | Created (Phase 01) |
| `frontend/tests/components/badge.test.tsx` | Unit tests for badge component | SHARED | Created (Phase 01) |

---

### B. MEMBER 02 — Patient Management (Authored by Member 02; included in Member 02 PR)
| File Path | Description | Owner | Status |
|---|---|:---:|:---:|
| `frontend/src/types/patient.ts` | Patient entity, DTOs, and query parameters | MEMBER02 | Created (Phase 02) |
| `frontend/src/lib/validation/patient-schema.ts` | Zod validation schemas matching NestJS rules | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/api/patients/route.ts` | Next.js BFF proxy (GET list, POST create) | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/api/patients/[id]/route.ts` | Next.js BFF proxy (GET details, PATCH update) | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/services/patient-client.ts` | Client-side API fetchers & age/id helpers | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/patient-search-bar.tsx` | Debounced search bar with indexed scope tag | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/patient-pagination.tsx` | Accessible pagination controls & page jumping | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/unsaved-changes-dialog.tsx` | Modal dialog confirming discard of dirty edits | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/patient-list-table.tsx` | Tabular & mobile card views with RBAC buttons | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/patient-form.tsx` | Multi-section form with live preview card | MEMBER02 | Created (Phase 02) |
| `frontend/src/features/patients/components/patient-detail-card.tsx` | Identity, demographics, contact, and audit bento | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/(staff)/patients/page.tsx` | Screen 1: Patient Directory & Search screen | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/(staff)/patients/new/page.tsx` | Screen 2: Register New Patient screen | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/(staff)/patients/[id]/page.tsx` | Screen 3: Patient Details screen | MEMBER02 | Created (Phase 02) |
| `frontend/src/app/(staff)/patients/[id]/edit/page.tsx` | Screen 4: Edit Patient Demographics screen | MEMBER02 | Created (Phase 02) |
| `frontend/tests/patients/patient-validation.test.ts` | Zod validation & phone/DOB sanitation tests | MEMBER02 | Created (Phase 02) |
| `frontend/tests/patients/patient-client.test.ts` | Patient number formatting & age calculation tests | MEMBER02 | Created (Phase 02) |
| `frontend/tests/patients/patient-components.test.tsx` | Search, pagination, table RBAC, and dialog tests | MEMBER02 | Created (Phase 02) |
| `frontend/tests/patients/patient-bff.test.ts` | Patient BFF route handler authentication & CSRF tests | MEMBER02 | Created (Phase 04) |

---

### C. MEMBER 01 — Authentication & Dashboard (Created locally in Phase 03, path-preserving ZIP handoff in Phase 07)
| File Path | Description | Owner | Status |
|---|---|:---:|:---:|
| `frontend/src/lib/validation/auth-schema.ts` | Zod validation schema matching NestJS LoginDto | MEMBER01 | Created (Phase 03) |
| `frontend/src/app/api/auth/login/route.ts` | Next.js BFF login handler (sets HttpOnly cookie) | MEMBER01 | Created (Phase 03) |
| `frontend/src/app/api/auth/me/route.ts` | Next.js BFF me handler (proxies HttpOnly token) | MEMBER01 | Created (Phase 03) |
| `frontend/src/app/api/auth/logout/route.ts` | Next.js BFF logout handler (clears cookies) | MEMBER01 | Created (Phase 03) |
| `frontend/src/features/auth/components/password-input.tsx` | Accessible password reveal toggle input | MEMBER01 | Created (Phase 03) |
| `frontend/src/features/auth/components/login-form.tsx` | Staff login form with client validation & BFF call | MEMBER01 | Updated (Auth Redesign) |
| `frontend/src/features/auth/components/signup-form.tsx` | Staff access request & onboarding form | MEMBER01 | Created (Auth Redesign) |
| `frontend/src/features/auth/components/auth-visual-panel.tsx` | Themed healthcare SVG & status illustration panel | MEMBER01 | Created (Auth Redesign) |
| `frontend/src/features/auth/components/auth-split-card.tsx` | Split-screen animated side-swapping auth container | MEMBER01 | Created (Auth Redesign) |
| `frontend/src/app/(auth)/layout.tsx` | Server layout for auth routes with session redirect | MEMBER01 | Created (Phase 03) |
| `frontend/src/app/(auth)/login/page.tsx` | Screen 5: Split-screen staff authentication screen | MEMBER01 | Updated (Auth Redesign) |
| `frontend/src/features/dashboard/components/dashboard-welcome.tsx` | Identity banner with real role & email telemetry | MEMBER01 | Created (Phase 03) |
| `frontend/src/features/dashboard/components/dashboard-quick-actions.tsx` | RBAC task action cards & record count badge | MEMBER01 | Created (Phase 03) |
| `frontend/src/app/(staff)/dashboard/page.tsx` | Screen 6: Staff operational dashboard screen | MEMBER01 | Created (Phase 03) |
| `frontend/tests/auth/login-schema.test.ts` | Unit tests for login schema validation | MEMBER01 | Created (Phase 03) |
| `frontend/tests/auth/auth-bff.test.ts` | Integration tests for auth BFF route handlers | MEMBER01 | Created (Phase 03) |
| `frontend/tests/auth/auth-split-card.test.tsx` | Component & interaction tests for split auth card | MEMBER01 | Created (Auth Redesign) |
| `frontend/tests/dashboard/dashboard.test.tsx` | Component & RBAC tests for dashboard views | MEMBER01 | Created (Phase 03) |
