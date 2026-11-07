# AyuCare LK — Member 04 export

This archive contains the database and patient backend work for integration into the existing NestJS backend. It is not a standalone application. Paths are relative to the project root.

Included: Prisma 7 schema and migrations for staff users and patients; Prisma service/module and staff lookup adapter; Patient module, DTOs, controller, and service; database check, development seed, and verification scripts; Member 04 tests.

Shared-file integration in the existing backend:
- app.module.ts: import PrismaModule and PatientsModule; add both to the module imports.
- auth.module.ts: bind STAFF_USER_STORE to PrismaStaffUserStore from src/prisma/prisma-staff-user.store.ts.
- config/env.ts: validate DATABASE_URL without logging its value.
- package.json: use Prisma and @prisma/client 7.10.1, @prisma/adapter-pg 7.10.1, pg 8.23.1, and argon2 0.45.2. Add scripts for prisma generate/validate/migrate status, development seed, and verification as needed.
- Preserve the existing authentication guards and roles; Patient routes import them.

Before applying migrations to a different database, inspect its existing schema and run Prisma migration status. Do not reset it. Generate Prisma Client with `npx prisma generate`. Configure DATABASE_URL in an untracked .env; never place credentials in this archive. Development seeding uses DEV_SEED_STAFF_EMAIL, DEV_SEED_STAFF_PASSWORD, and DEV_SEED_STAFF_ROLE and requires NODE_ENV=development. Use only synthetic .test staff emails.

Excluded: .env, passwords, JWT secrets, database data, node_modules, dist, generated Prisma Client, and Member 03 authentication/foundation files.