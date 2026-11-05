# AyuCare LK — Member 03 backend foundation

This package is the Member 03 foundation only: NestJS bootstrap, JWT authentication, role guards, health check, Swagger, validation, and auth tests. It intentionally excludes Member 04 Prisma/database and Patient API code.

## Setup

Use Node.js 24 and npm. Run `npm ci` in `backend/`. Copy `.env.example` to a local `.env` and set a random JWT_ACCESS_SECRET of at least 32 characters. Keep `.env` untracked. Then run `npm run start:dev`. API health: http://localhost:3001/api/v1/health. Development Swagger: http://localhost:3001/api/docs.

Checks: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test`.

## Authentication contract

POST /api/v1/auth/login accepts `{ "email": "staff@example.test", "password": "<password>" }`. Success returns `{ "accessToken": "<JWT>", "tokenType": "Bearer", "expiresIn": 900, "user": { "id": "<id>", "email": "staff@example.test", "role": "DOCTOR" } }`. GET /api/v1/auth/me requires `Authorization: Bearer <JWT>` and returns the safe user profile. POST /api/v1/auth/logout requires a bearer token and returns 204. Logout only removes the token client-side; an issued JWT remains valid until expiry unless the account is disabled.

Roles: SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, CASHIER. Use @Roles with the global RolesGuard. Protected routes reject missing/invalid tokens with 401 and disallowed roles with 403.

## Member 04 integration dependency

The StaffUserStore interface in `src/auth/staff-user.store.ts` is the contract. It requires `findByEmail` and `findById`, returning an active flag, role, and Argon2id password hash. This branch uses `UnavailableStaffUserStore`, which returns 503 for login until Member 04 supplies a Prisma implementation and binds it in AuthModule. There is no public registration or duplicate user database. Unit and API tests use a mock store, so their successful login test does not prove production database login.

Member 04 should provide the canonical User/Role schema, unique email, password hash, active flag, timestamps, PrismaService, and secure development-only seeding. Keep the role values aligned. Do not put real credentials in source control.
