# AyuCare LK

**Integrated Clinic & Dispensary Management System**  
**Sprint 01 — Project Foundation & Patient Management**

AyuCare LK is a proposed web-based healthcare management platform for primary-care clinics and attached dispensaries in Sri Lanka. The platform aims to connect patient registration, appointments, clinical consultations, electronic prescriptions, pharmacy inventory, dispensing, billing, and reporting through secure, role-based workflows.

> **Project status:** Under development. This README documents the **Sprint 01 target and setup conventions**. A listed feature or endpoint is not necessarily implemented; verify against the current code and API documentation before marking work complete.

## Sprint 01 goal

Establish a functioning full-stack foundation and demonstrate this workflow using **synthetic patient data**:

**Staff login → Protected dashboard → Patient registration → PostgreSQL persistence → Patient search → View/edit patient**

### Sprint 01 scope

- NestJS API foundation, configuration, request validation, and API documentation.
- Staff authentication and basic role-based access control (RBAC).
- PostgreSQL database setup with Prisma ORM and migrations.
- Patient creation, retrieval, search, and update APIs.
- Next.js staff login, dashboard, and patient management interfaces.
- Frontend–backend integration, automated tests, and an end-to-end demonstration.

### Beyond Sprint 01

Subsequent phases are planned to cover appointments and queues, consultations, prescriptions, medicine inventory, dispensing, POS/billing, and reporting. Four selected innovations are also part of the wider project roadmap:

1. **Intelligent Queue & Waiting-Time Prediction** — estimated consultation waiting times.
2. **Secure QR Patient Journey Pass** — secure, authorized visit tracking across service points.
3. **Multilingual Medication Instructions** — clinically reviewed Sinhala, Tamil, and English instructions.
4. **Offline-Resilient Clinic Operations** — safe synchronization of selected low-risk operations during connectivity interruptions.

These are **not Sprint 01 implementation commitments**.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Staff frontend | Next.js, React, TypeScript | Staff web UI |
| Styling | Tailwind CSS | Responsive UI and shared styles |
| Backend | NestJS, Node.js, TypeScript | REST APIs and business logic |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Database schema, queries, and migrations |
| Authentication | JWT with backend authorization guards | Staff authentication and protected endpoints |
| API documentation | Swagger / OpenAPI | API exploration and integration |
| Testing | Jest and project-configured UI/E2E tools | Automated verification |
| Collaboration | Git, GitHub, Jira | Version control and sprint tracking |

## Proposed architecture

```text
Staff Web App (Next.js)
          |
       HTTPS / REST
          |
NestJS API (modular monolith)
   |             |
Auth / RBAC    Patient module
   |             |
   +------ Prisma ORM
                |
           PostgreSQL
```

The initial deployment model is a **modular monolith**: one backend application with clearly separated business modules. Backend authorization is required even when the frontend hides restricted controls.

## Repository layout

The expected structure is shown below. The actual repository may evolve as development proceeds.

```text
ayucare-lk/
├── frontend/             # Next.js application (Member 01 / Member 02)
├── backend/              # NestJS application (Member 03 / Member 04)
│   ├── src/
│   │   ├── auth/
│   │   ├── patients/
│   │   └── ...
│   └── prisma/           # Prisma schema and migrations (location may vary)
├── docs/                 # Requirements, architecture, API and test documentation
└── README.md
```

## Sprint 01 work allocation

| Member | Workstream | Main deliverables |
|---|---|---|
| **01** | Frontend foundation and authentication UI | Next.js setup, login screen, protected dashboard, shared layout |
| **02** | Patient management UI | Register, list, search, view, and edit patient screens |
| **03** | Backend foundation and authentication | NestJS setup, staff login, JWT guards, RBAC, Swagger |
| **04** | Database and patient APIs | PostgreSQL/Prisma, User/Role/Patient data models, patient APIs |

All members contribute to integration, documentation, testing, and review. Actual contributions and pull requests should reflect the work performed by their authors.

## Getting started (local development)

### Prerequisites

- Node.js and npm compatible with the repository's `package.json` requirements.
- PostgreSQL server running locally (or a secure development database).
- Git and a code editor such as VS Code.
- Optional: pgAdmin 4 for database inspection, and Postman for API testing.

> **Security:** Never publish real passwords, JWT secrets, access tokens, `.env` files, or real patient information. Use synthetic data for development and demos.

### 1. Clone or open the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd ayucare-lk
```

If you already have the project locally, open that project instead. Do not clone over existing working files.

### 2. Configure PostgreSQL

Create a **development-only** database named `ayucare_db` in pgAdmin or PostgreSQL. Configure the database credentials locally; do not put them into this README.

### 3. Backend environment

The backend is currently in `AyuCareLK-Member03/backend/`. Copy its `.env.example` to `.env` and set your local database credentials and a unique JWT secret:

```dotenv
NODE_ENV=development
PORT=3001
FRONTEND_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ayucare_db?schema=public
JWT_ACCESS_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
```

In PowerShell, run `Copy-Item .env.example .env` from the backend folder, then edit `.env`. URL-encode special characters in the database password. The backend validates these settings at startup. Do not commit `.env`.

### 4. Install backend dependencies and prepare the database

Run these commands from `AyuCareLK-Member03/backend/`:

```powershell
cd AyuCareLK-Member03/backend
npm ci
npm run db:validate
npm run db:status
npm run db:generate
```

If `db:status` reports pending migrations, review the existing database and migration SQL before applying them with `npx prisma migrate deploy`. Do not reset an existing database. To log in, configure a synthetic development staff account as described in the [backend README](./AyuCareLK-Member03/backend/README.md) and run `npm run db:seed:dev`.

Then start the backend:

```powershell
npm run start:dev
```

The backend health endpoint is `http://localhost:3001/api/v1/health` and Swagger is at `http://localhost:3001/api/docs` in development.

### 5. Frontend environment and startup

The frontend defaults to `http://localhost:3001/api/v1`. If the backend runs at another address, copy `frontend/.env.example` to `frontend/.env.local` and set:

```dotenv
BACKEND_API_URL=http://localhost:3001/api/v1
```

In a second terminal, from the repository root, run:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. For checks, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` separately in each application folder. A successful build does not verify database-backed login and patient flows; test those after configuring the local database.

## Sprint 01 API contract (target)

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/auth/login` | Sign in an active staff user | Public |
| `GET` | `/auth/me` | Return current authenticated staff profile | Authenticated |
| `POST` | `/auth/logout` | Apply the implemented logout strategy | Authenticated |
| `POST` | `/patients` | Register a patient | Authorized staff |
| `GET` | `/patients` | List/search patients | Authorized staff |
| `GET` | `/patients/:id` | View one patient | Authorized staff |
| `PATCH` | `/patients/:id` | Update allowed patient fields | Authorized staff |

Append the configured API prefix (for example `/api/v1`) to these paths. Actual DTO fields, response shapes, and endpoint availability must be checked in Swagger or the source code. Do not assume a stateless JWT is immediately revoked by logout unless a revocation mechanism is implemented.

## API verification with Postman

1. Start PostgreSQL and the NestJS backend.
2. Call `POST /auth/login` with **seeded development staff** credentials.
3. If JWT bearer authentication is used, set the access token in Postman's **Authorization → Bearer Token** field.
4. Call `POST /patients` with a valid **synthetic** patient payload conforming to the actual DTO.
5. Verify the record with `GET /patients` and `GET /patients/:id`.
6. Update a permitted field using `PATCH /patients/:id`; retrieve it again to verify persistence.
7. Confirm the saved record in PostgreSQL using pgAdmin or Prisma Studio.
8. Check negative cases: invalid data (`400`), missing/invalid authentication (`401`), insufficient permission (`403`), and missing patient (`404`), as applicable to the implementation.

Do not paste credentials or tokens into screenshots, documentation, issues, or commits.

## Testing and quality

Sprint 01 testing should cover:

- **Unit tests:** authentication logic, validation, patient services, and permissions.
- **Integration tests:** Prisma/PostgreSQL operations, API guards, and patient persistence.
- **End-to-end tests:** login → dashboard → registration → search → edit.
- **Security checks:** rejected unauthorized requests and no sensitive fields in responses.

Use **test-driven development (Red → Green → Refactor)** when implementing new rules: write a failing test, make it pass, then improve the implementation without changing its behavior.

Typical commands (run in the relevant application directory; check available scripts first):

```bash
npm test
npm run build
npm run lint
```

Report test results based on commands actually executed; do not assume they passed.

## Sprint 01 Definition of Done

- [ ] Staff login works with a real development database user.
- [ ] Protected dashboard enforces the expected authentication behavior.
- [ ] Patient registration stores synthetic data in PostgreSQL.
- [ ] Patient list and search display database-backed records.
- [ ] Patient details can be retrieved and permitted fields updated.
- [ ] Input validation and basic error handling work.
- [ ] Unauthorized/forbidden access is handled correctly.
- [ ] Backend and frontend build and relevant tests pass.
- [ ] README, API documentation, and Jira issue statuses are updated.
- [ ] A complete local Sprint 01 demonstration has been verified.

## Project management

Sprint 01 is planned as **Project Foundation & Patient Management**, with a proposed two-week duration. Jira is used to track epics, user stories, acceptance criteria, tasks, blockers, and sprint progress. Mark an issue *Done* only when its acceptance criteria and test evidence have been verified.

## Data protection and project disclaimer

AyuCare LK is a software engineering project and is **not yet a production-ready clinical system**. Patient records, prescribing, dispensing, payments, offline synchronization, and multilingual medical instructions require further validation, security assessment, clinical oversight where applicable, and compliance review before real-world deployment.
