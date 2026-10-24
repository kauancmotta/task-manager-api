<div align="center">

# 📋 Task Manager API

**Task management API built to scale — JWT, OAuth2, S3, state machine and full test coverage**

Built with NestJS · TypeORM · PostgreSQL · JWT · Google OAuth2

![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-fe0902?style=flat-square)
![Vitest](https://img.shields.io/badge/Vitest-unit%20%2B%20e2e-6e9f18?style=flat-square&logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## ✨ Features

- 🔐 **Authentication** — JWT + refresh tokens, Google OAuth2 (opt-in), email verification, OTP password reset
- ✅ **Task Management** — CRUD with status state machine, priority levels, pagination and filters
- 📁 **File Attachments** — Abstract storage layer with Local (dev) and AWS S3 (prod) providers
- 👥 **Task Assignment** — Assign tasks to team members
- 🏷️ **Categories** — Organize tasks with color-coded categories (minimum 1 per task enforced)
- 📧 **Email Notifications** — Nodemailer + Handlebars templates for all auth flows
- 📄 **OpenAPI / Swagger** — Full interactive docs at `/api/docs` with typed response schemas
- 🧪 **Tests** — Unit tests (55+ files) covering services, controllers and guards + E2E tests with Supertest against a real PostgreSQL instance
- 🗑️ **Cascade Soft-Delete** — Deleting a user propagates through tasks, assignees and attachments
- 📊 **Observability** — OpenTelemetry traces + metrics, Prometheus, Grafana dashboards and Tempo distributed tracing

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript (`module: nodenext`) |
| Database | PostgreSQL 16 |
| ORM | TypeORM 0.3 |
| Authentication | Passport JWT + Google OAuth2 |
| Email | Nodemailer + Handlebars |
| Storage | Local / AWS S3 (abstract provider) |
| API Docs | @nestjs/swagger v8 |
| Testing | Vitest + Supertest (E2E) |
| Logging | nestjs-pino (structured) |
| IDs | UUID v7 (time-sorted) |
| Containerization | Docker + Docker Compose |
| Traces | OpenTelemetry SDK + Tempo |
| Metrics | OpenTelemetry SDK + Prometheus |
| Dashboards | Grafana (provisioned) |

---

## 📁 Project Structure

```
src/
├── common/                   # Shared infrastructure
│   ├── decorators/           # @CurrentUser, @Public, @UuidParam
│   ├── exceptions/           # AppException + ErrorCodes enum
│   ├── filters/              # Global exception filter
│   ├── guards/               # JwtAuthGuard (applied globally)
│   ├── interceptors/         # Logging interceptor
│   ├── pipes/                # AppValidationPipe (structured errors)
│   ├── presenters/           # Response serialization classes
│   ├── storage/              # Abstract StorageService (Local / S3)
│   ├── swagger/              # SwaggerXxxResponse helpers
│   ├── telemetry/            # OpenTelemetry SDK bootstrap (traces + metrics)
│   └── testing/              # Mock factories
│       ├── mock-entities.ts
│       ├── mock-logger.ts
│       ├── mock-repository.ts
│       ├── mock-services.ts
│       └── mock-typeorm.ts
├── modules/
│   ├── auth/                 # JWT, OAuth2, email verify, OTP reset
│   ├── users/                # User CRUD + soft-delete cascade
│   ├── tasks/                # Tasks with state machine + QueryBuilder
│   ├── categories/           # Category CRUD + validation
├── database/
│   ├── entities/             # BaseEntity (soft-delete), all entities
│   └── migrations/
├── email/                    # MailModule + Handlebars templates
│   └── templates/
│       ├── email-confirmation.hbs
│       ├── email-verified.hbs
│       ├── password-reset.hbs
│       └── password-changed.hbs
└── main.ts                   # Bootstrap, global pipes, CORS, Swagger

observability/                # Observability stack (separate compose)
├── otel-collector-config.yaml
├── prometheus.yml
└── grafana/
    └── provisioning/
        ├── datasources/      # Prometheus + Tempo auto-provisioned
        └── dashboards/       # Task Manager API dashboard

test/
├── helpers/
│   ├── app.helper.ts         # App bootstrap + mail spy for E2E
│   └── db.helper.ts          # Migrations + clearDatabase between tests
├── interfaces/
│   └── auth.interfaces.ts    # Shared response types
├── auth.e2e-spec.ts
├── categories.e2e-spec.ts
├── tasks.e2e-spec.ts
└── users.e2e-spec.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- yarn
- PostgreSQL 16 (or Docker)

### Installation

```bash
git clone https://github.com/kauancmotta/task-manager-api
cd task-manager-api
yarn install
```

### Configure environment

```bash
cp .env.example .env
# Fill in the required values — see Environment Variables below
```

### Start the database

```bash
docker compose -f ./.docker/docker-compose.dev.yaml up -d postgres
```

### Run migrations

```bash
yarn migration:run
```

### Start the server

```bash
yarn start:dev                    # development (watch mode)
yarn build && yarn start:prod     # production
```

API: `http://localhost:3001`  
Swagger: `http://localhost:3001/api/docs`

---

## 📡 API Endpoints

### Auth — `/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account + send verification email | — |
| `POST` | `/auth/login` | Email + password → access & refresh tokens | — |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token | — |
| `POST` | `/auth/logout` | Revoke current refresh token | JWT |
| `POST` | `/auth/logout-all` | Revoke all user refresh tokens | JWT |
| `GET` | `/auth/me` | Get current authenticated user | JWT |
| `POST` | `/auth/verify-email` | Verify email with SHA-256 token | — |
| `POST` | `/auth/resend-verification` | Resend verification email | — |
| `POST` | `/auth/forgot-password` | Send 6-digit OTP to email | — |
| `POST` | `/auth/reset-password` | Reset password with OTP | — |
| `GET` | `/auth/google` | Redirect to Google OAuth2 consent | — |
| `GET` | `/auth/google/callback` | Google OAuth2 callback → tokens | — |

### Tasks — `/tasks` 🔒

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List tasks with pagination + filters (status, search) |
| `POST` | `/tasks` | Create task with categories (min 1 required) |
| `GET` | `/tasks/:id` | Get task by ID |
| `PATCH` | `/tasks/:id` | Update task name, description or priority |
| `PATCH` | `/tasks/:id/status` | Update task status (follows state machine) |
| `DELETE` | `/tasks/:id` | Soft-delete + cascade assignees/attachments |
| `DELETE` | `/tasks/:id/:categoryId/category` | Remove a category from a task |
| `POST` | `/tasks/:taskId/assignees` | Add assignee to task |
| `DELETE` | `/tasks/:taskId/assignees/:id` | Remove assignee from task |
| `POST` | `/tasks/:taskId/attachments` | Upload file attachment |
| `DELETE` | `/tasks/:taskId/attachments/:id` | Remove attachment |

### Categories — `/categories` 🔒

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | List user's categories (optional search) |
| `POST` | `/categories` | Create category (name, color, optional description) |
| `GET` | `/categories/:id` | Get category by ID |
| `PATCH` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category (hard delete) |

### Users — `/users` 🔒

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/users/me` | Update user profile (name) |
| `PATCH` | `/users/me/change-password` | Change password |
| `PATCH` | `/users/me/avatar` | Upload avatar image |
| `DELETE` | `/users/me/avatar` | Remove avatar |
| `DELETE` | `/users/me` | Soft-delete account + cascade all data |

---

## 🔄 Task Status State Machine

Transitions are validated server-side. Invalid transitions return a typed `AppException` with a machine-readable `errorCode`.

```
TODO ──────→ IN_PROGRESS → DONE
  │
  └─────────→ PENDING ──→ IN_PROGRESS
```

```typescript
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]:        [TaskStatus.IN_PROGRESS, TaskStatus.PENDING],
  [TaskStatus.PENDING]:     [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
  [TaskStatus.DONE]:        [],
};
```

---

## 🗑️ Cascade Soft-Delete

TypeORM's `softDelete()` runs a single UPDATE by ID and **never triggers cascades**.  
This project uses `softRemove()` on a loaded entity, which follows the relation graph:

| Relation | Cascade type |
|---|---|
| User → Tasks | `soft-remove` |
| User → TaskAssignees | `soft-remove` |
| User → TaskAttachments | `soft-remove` |
| User → Categories | `remove` (hard delete) |
| User → RefreshTokens | `remove` (hard delete) |
| Task → TaskAssignees | `soft-remove` |
| Task → TaskAttachments | `soft-remove` |

---

## 📊 Observability

The observability stack runs as a separate Docker Compose file and shares the application network. It provides distributed tracing, metrics collection and pre-built dashboards — all provisioned automatically on startup.

### Architecture

```
API (OTel SDK)
  │
  ▼ OTLP/HTTP
OTel Collector
  ├──→ Tempo      (traces)
  └──→ Prometheus (metrics, scraped from collector)
         │
         ▼
       Grafana   (dashboards + trace exploration)
```

### Stack

| Component | Role | Port |
|---|---|---|
| OpenTelemetry Collector | Receives OTLP, fans out to backends | 4317 (gRPC), 4318 (HTTP) |
| Tempo | Distributed trace storage | internal |
| Prometheus | Metrics storage | 9090 |
| Grafana | Dashboards + Explore | 3000 |

### Starting the observability stack

The stack requires the application network to be created first (by starting the main compose):

```bash
# Start the main app first (creates the docker_app network)
docker compose -f ./.docker/docker-compose.prod.yaml up -d

# Then start observability
docker compose -f ./.docker/docker-compose.observability.yaml up -d
```

Grafana is available at `http://localhost:3000` (default credentials: `admin` / `admin`).

The **Task Manager API** dashboard is provisioned automatically and shows:

- **Requests/sec** — real-time throughput
- **P95 Latency** — 95th percentile response time
- **4xx Rate** — client error rate
- **5xx Rate** — server error rate
- **Request Duration by Route** — p95 and p50 latency per endpoint
- **Requests by Status Code** — traffic breakdown per HTTP status

Distributed traces are available in **Explore → Tempo** and can be correlated with metrics directly from the dashboard.

---

## 🧪 Running Tests

### Unit Tests

```bash
yarn test             # run all unit tests
yarn test:watch       # watch mode
yarn test:coverage    # with coverage report
```

Tests use `vi.hoisted + vi.mock` for ESM-compatible mocking of `fs`, `nodemailer`, and `@aws-sdk/client-s3`. Every service and controller has full coverage including error paths and edge cases.

### E2E Tests

E2E tests run against a real PostgreSQL instance via Docker. Each test file runs in isolation — the database is cleared between tests and all files run sequentially to avoid conflicts.

```bash
# Start the test database
docker compose -f ./.docker/docker-compose.test.yaml up -d

# Run E2E tests
yarn test:e2e
```

The E2E suite covers auth flows (register → verify → login → refresh → logout), categories, tasks (including status transitions and category management) and user operations.

---

## ⚙️ Environment Variables

```bash
# Server
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_DATABASE=task_manager

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password

# App
APP_URL=http://localhost:3001

# Storage: "local" (default) or "s3"
STORAGE_PROVIDER=local

# AWS S3 (required when STORAGE_PROVIDER=s3)
AWS_BUCKET=
AWS_REGION=

# Google OAuth2 (optional — set true to enable)
GOOGLE_OAUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Observability (optional — set when running the observability stack)
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

---

## 🐳 Docker

```bash
# Start all services (API + PostgreSQL)
docker compose -f ./.docker/docker-compose.dev.yaml up

# Start only the database
docker compose -f ./.docker/docker-compose.dev.yaml up -d postgres

# Start the test database (isolated instance for E2E)
docker compose -f ./.docker/docker-compose.test.yaml up -d

# Start the observability stack (OTel Collector + Prometheus + Grafana + Tempo)
docker compose -f ./.docker/docker-compose.observability.yaml up -d
```

---

## 👤 Author

**Kauan Correia Motta**  
Full Stack Developer · Node.js · TypeScript · NestJS

[![LinkedIn](https://img.shields.io/badge/LinkedIn-kauan--motta-0077b5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/kauan-motta/)
[![GitHub](https://img.shields.io/badge/GitHub-kauancmotta-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/kauancmotta)
[![Email](https://img.shields.io/badge/Email-dev.kauan.motta%40gmail.com-ea4335?style=flat-square&logo=gmail&logoColor=white)](mailto:dev.kauan.motta@gmail.com)

---

<div align="center">

MIT License · Built with ❤️ and NestJS

</div>