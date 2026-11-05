# AyuCare LK backend (Sprint 01)

NestJS API foundation with PostgreSQL and Prisma 7.10.1. Staff authentication uses the Prisma-backed user store. The local database has staff and patient tables, and the Patient API supports registration, listing, retrieval, and demographic updates.

## Setup

Use a Prisma 7 compatible Node.js version (the project was verified with Node.js 24.18.0) and npm. From `backend/`:

```powershell
npm ci
# If .env does not exist, copy the example. Keep any existing .env and DATABASE_URL.
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env: set DATABASE_URL for your local ayucare_db and a unique random JWT_ACCESS_SECRET.
npm run db:validate
npm run db:status
npm run db:generate
npm run db:check
npm run dev
```

For local authentication testing only, set `DEV_SEED_STAFF_EMAIL` to a synthetic `.test` address, set `DEV_SEED_STAFF_PASSWORD` to a unique random password of at least 16 characters, and optionally set `DEV_SEED_STAFF_ROLE`. Then run `npm run db:seed:dev` and `npm run db:verify-auth`. The seed requires `NODE_ENV=development`, creates only a missing account, and never changes an existing account. Neither command prints the password or token.

`GET http://localhost:3001/api/v1/health` checks the API process. In development and test, Swagger is at `http://localhost:3001/api/docs`. It is disabled in production.

Environment variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP port, default 3001 |
| `FRONTEND_ORIGINS` | Comma-separated exact browser origins, such as `http://localhost:3000` |
| `JWT_ACCESS_SECRET` | Required signing secret, at least 32 characters |
| `JWT_ACCESS_TTL_SECONDS` | Access token lifetime, 60–3600 seconds; default 900 |
| `SWAGGER_PATH` | Swagger path outside production; default `api/docs` |
| `DATABASE_URL` | Local PostgreSQL connection for `ayucare_db`; keep it only in untracked `.env` |
| `DEV_SEED_STAFF_EMAIL` | Optional synthetic `.test` email for local seeding |
| `DEV_SEED_STAFF_PASSWORD` | Optional local seed password; never commit it |
| `DEV_SEED_STAFF_ROLE` | Optional role for a synthetic staff account; defaults to `DOCTOR` |

Run `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` for checks. The authentication tests inject a mock user store only inside the test process, so they do not write to PostgreSQL.

## API contract for Member 01

All routes use `/api/v1`. Send `Content-Type: application/json` for login. A valid request is:

```http
POST /api/v1/auth/login
Content-Type: application/json

{"email":"doctor@example.com","password":"example-password"}
```

With a seeded active staff account and valid credentials, the response is `200`:

```json
{"accessToken":"<signed JWT>","tokenType":"Bearer","expiresIn":900,"user":{"id":"staff-id","email":"doctor@example.com","role":"DOCTOR"}}
```

Store the token in memory where practical. Send `Authorization: Bearer <signed JWT>` to protected routes. `GET /api/v1/auth/me` returns the safe `user` object. `POST /api/v1/auth/logout` requires a valid bearer token and returns `204` with no body. Remove the client token on logout. **The JWT remains usable until it expires** (or the account is disabled); the endpoint does not revoke it. Do not describe logout as immediate server-side revocation.

Login returns `400` for invalid or missing fields and `401` with the same `Invalid credentials` message for unknown staff, inactive staff, or wrong passwords. Protected routes return `401` for missing, malformed, expired, or invalid JWTs and `403` for insufficient roles. Database outages can cause `500` until a dedicated availability handler is added. Error bodies have `statusCode`, `message`, `path`, and `timestamp`.

## Role support

The canonical Prisma roles are `SUPER_ADMIN`, `CLINIC_ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`, and `CASHIER`; they match the auth enum. Routes are protected by default through a global JWT guard. Add `@Public()` only to intended anonymous routes. Add `@Roles(StaffRole.DOCTOR, StaffRole.CLINIC_ADMIN)` to restrict a controller or handler; the global RolesGuard checks the current database role. No role hierarchy is assumed. Patient endpoints can reuse these decorators and guards.

## Patient API

Every Patient route requires a bearer token. `SUPER_ADMIN`, `CLINIC_ADMIN`, and `RECEPTIONIST` may create and update patients. `DOCTOR` may read patients. `PHARMACIST` and `CASHIER` have no Patient API access in this sprint. The API returns only patient demographic and contact fields; it does not include staff records, password hashes, or clinical information.

| Method and path | Purpose | Success |
| --- | --- | --- |
| `POST /api/v1/patients` | Register a patient | `201` |
| `GET /api/v1/patients?page=1&limit=20&search=Nimali` | Paginated search by case-insensitive name, UUID, or patient number | `200` |
| `GET /api/v1/patients/:id` | Retrieve by internal UUID | `200` |
| `PATCH /api/v1/patients/:id` | Update name, date of birth, phone, email, or address | `200` |

Registration example:

```http
POST /api/v1/patients
Authorization: Bearer <access-token>
Content-Type: application/json

{"fullName":"Nimali Perera","dateOfBirth":"1990-04-15","phone":"+94771234567","email":"nimali@example.test","address":"Colombo"}
```

The server assigns `id`, `patientNumber`, and `registeredById`. A safe response is:

```json
{"id":"11111111-1111-4111-8111-111111111111","patientNumber":23,"fullName":"Nimali Perera","dateOfBirth":"1990-04-15","phone":"+94771234567","email":"nimali@example.test","address":"Colombo","isActive":true,"createdAt":"2026-01-01T00:00:00.000Z","updatedAt":"2026-01-01T00:00:00.000Z"}
```

`PATCH` accepts only `fullName`, `dateOfBirth`, `phone`, `email`, and `address`; send `null` to clear an optional field. IDs, patient number, status, registrar, and timestamps cannot be changed through this API. Dates of birth use `YYYY-MM-DD` and cannot be in the future according to Sri Lanka local time. List page starts at 1, limit defaults to 20 and cannot exceed 100. List responses contain `items`, `page`, `limit`, `total`, and `totalPages`.

Invalid input returns `400`, missing or invalid JWT returns `401`, insufficient role returns `403`, an unknown patient UUID returns `404`, and a likely duplicate registration or unique identifier conflict returns `409`. The duplicate check requires matching name and birth date plus a matching phone or email. It is a best-effort check; the schema does not declare demographic fields unique because contacts can be shared, so simultaneous matching registrations still require human review.

## Prisma schema and migration approach

`prisma/schema.prisma` defines `User` mapped to `staff_users` and the six-value `StaffRole` enum. `User` has UUID `id`, unique lowercase `email`, `passwordHash`, `role`, `isActive`, `createdAt`, and `updatedAt`. `PrismaStaffUserStore` implements the existing auth lookup interface. Passwords are stored as Argon2id hashes; the seed never writes plaintext. The database check command only reads table counts.

`Patient` maps to `patients`. It has an internal UUID and a unique, automatically assigned positive `patientNumber`, required `fullName`, optional date of birth and contact fields, active status, and timestamps. Its optional `registeredById` points to a staff user and becomes null if that user is deleted. The migration adds indexes for patient number, name, phone, and registrar. Phone and email are deliberately not unique because people can share them. Blank names are rejected by a database check constraint.

Run `npm run db:verify-patients` in development to exercise real Prisma create, search, retrieval, update, and duplicate checks using a synthetic patient. The script rolls its transaction back and verifies that the patient row count is unchanged. It requires the synthetic development staff account described above.

The local `ayucare_db` had zero public tables before the staff migration. A second additive migration created the patient table without dropping or altering existing staff data. Both were applied with `prisma migrate deploy`. On any other database, inspect its tables and migration history first. Never use `prisma migrate reset` or `prisma db push` against existing data. For future changes, use `prisma migrate dev --create-only --name <name>` to review SQL, then apply it deliberately. Keep Prisma CLI and client on the same 7.x version.

No staff account is created by migration. The local development seed reads credentials from the ignored `.env`, lowercases email, hashes the password with Argon2id, and creates only a missing `.test` account. It refuses to overwrite an existing account. Do not commit passwords, hashes, or production credentials. Create production staff through an approved administrative process.

The JWT contains `sub` (staff ID), `role`, `iat`, and `exp`. Each authenticated request re-reads the staff record so deactivation and role changes take effect immediately. The API returns only `id`, `email`, and `role` to clients. No public registration route is provided.
