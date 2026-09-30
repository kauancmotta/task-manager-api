<div align="center">

# 📋 Task Manager API

**A production-ready REST API for collaborative task management**

Built with NestJS · TypeORM · PostgreSQL · JWT · Google OAuth2

![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-fe0902?style=flat-square)
![Vitest](https://img.shields.io/badge/Vitest-55%2B%20tests-6e9f18?style=flat-square&logo=vitest&logoColor=white)
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
- 🧪 **Unit Tests** — 55+ Vitest test files covering all services, controllers and guards
- 🗑️ **Cascade Soft-Delete** — Deleting a user propagates through tasks, assignees and attachments

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
| Testing | Vitest |
| Logging | nestjs-pino (structured) |
| IDs | UUID v7 (time-sorted) |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
src/
├── common/                   # Shared infrastructure
│   ├── decorators/           # @CurrentUser, @Public
│   ├── exceptions/           # AppException + ErrorCodes enum
│   ├── filters/              # Global exception filter
│   ├── guards/               # JwtAuthGuard (applied globally)
│   ├── interceptors/         # Logging interceptor
│   ├── pipes/                # AppValidationPipe (structured errors)
│   ├── presenters/           # Response serialization classes
│   ├── swagger/              # SwaggerXxxResponse helpers
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
│   └── storage/              # Abstract StorageService (Local / S3)
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
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL 16 (or Docker)

### Installation

```bash
git clone https://github.com/kauancmotta/task-manager-api
cd task-manager-api
pnpm install
```

### Configure environment

```bash
cp .env.example .env
# Fill in the required values — see Environment Variables below
```

### Start the database

```bash
docker compose up -d postgres
```

### Run migrations

```bash
pnpm migration:run
```

### Start the server

```bash
pnpm start:dev           # development (watch mode)
pnpm build && pnpm start:prod  # production
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api/docs`

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
| `GET` | `/tasks` | List tasks with pagination + filters |
| `POST` | `/tasks` | Create task with categories (min 1 required) |
| `GET` | `/tasks/:id` | Get task by ID |
| `PATCH` | `/tasks/:id` | Update task (status, title, categories) |
| `DELETE` | `/tasks/:id` | Soft-delete + cascade assignees/attachments |
| `POST` | `/tasks/:id/attachments` | Upload file attachment |
| `DELETE` | `/tasks/:id/attachments/:attachmentId` | Remove attachment |

### Categories — `/categories` 🔒

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | List user's categories (optional search) |
| `POST` | `/categories` | Create category (name, description, color) |
| `GET` | `/categories/:id` | Get category by ID |
| `PATCH` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category (hard delete) |

### Users — `/users` 🔒

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users/:id` | Get user profile |
| `PATCH` | `/users/:id` | Update user profile |
| `DELETE` | `/users/:id` | Soft-delete account + cascade all data |

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

## 🧪 Running Tests

```bash
pnpm test             # run all unit tests
pnpm test:watch       # watch mode
pnpm test:coverage    # with coverage report
```

Tests use `vi.hoisted + vi.mock` for ESM-compatible mocking of `fs`, `nodemailer`, and `@aws-sdk/client-s3`. Every service and controller has full coverage including error paths and edge cases.

---

## ⚙️ Environment Variables

```bash
# Server
PORT=3000

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
APP_URL=http://localhost:3000

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
```

---

## 🐳 Docker

```bash
# Start all services (API + PostgreSQL)
docker compose up

# Start only the database
docker compose up -d postgres
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
