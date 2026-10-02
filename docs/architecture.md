# LabSlot — System Architecture

## Overview

LabSlot is a full-stack Laboratory Resource Management & Booking System built for college use.

**Stack**
- Frontend: React + Vite + Tailwind CSS + React Router + Axios + Recharts
- Backend: Node.js + Express.js
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcrypt

## High-Level Architecture

```
Browser (React SPA)
        │
        │ REST + JWT
        ▼
Express.js API Server
        │
        │ Mongoose ODM
        ▼
MongoDB Atlas
```

## Backend Layer Responsibilities (Phase 3+)

| Layer            | Folder / File              | Responsibility                                      |
|------------------|----------------------------|-----------------------------------------------------|
| Entry point      | `server.js`                | Bootstraps Express, middleware, routes, error handling |
| Configuration    | `config/db.js`             | MongoDB connection                                  |
| Models           | `models/*.js`              | Mongoose schemas, indexes, static helpers           |
| Routes           | `routes/*.js`              | HTTP method + path → controller                     |
| Controllers      | `controllers/*.js`         | Request/response logic                              |
| Middleware       | `middleware/*.js`          | Auth, role check, validation, 404, error handler    |
| Utils            | `utils/*.js`               | Response helpers, AppError, asyncHandler            |
| Services         | `services/*.js`            | Business logic (conflict detection, notifications)  |
| Scripts          | `scripts/*.js`             | Seed data, one-off utilities                        |

## Request Flow

1. Client sends HTTP request.
2. CORS + Helmet + body parsers run.
3. Route matches → controller (wrapped in `asyncHandler`).
4. Controller may call services / models.
5. Success → `sendSuccess()` with consistent JSON shape.
6. Error → thrown `AppError` or native error → global `errorHandler`.
7. 404 for unmatched routes via `notFound` middleware.

## Consistent API Response Format

**Success**
```json
{
  "success": true,
  "message": "Equipment retrieved successfully",
  "data": { ... }
}
```

**Error**
```json
{
  "success": false,
  "message": "Equipment is already booked during the selected time."
}
```

## Environment-aware Behaviour

- `NODE_ENV=development` → detailed error stacks, morgan logging.
- `NODE_ENV=production` → generic error messages, no stack traces leaked.

## Security Foundations (Phase 3)

- Helmet for HTTP security headers.
- CORS restricted to frontend origin.
- No secrets in source code (`.env` + `.env.example`).
- Global error handler never exposes internal details in production.
- Graceful shutdown on SIGTERM / SIGINT / unhandled rejections.

Authentication, role middleware, and business routes are added in Phase 4 onwards.
