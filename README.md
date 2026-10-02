# LabSlot — Laboratory Resource Management & Equipment Booking System

Full-stack web application for college laboratories: discover equipment, book with conflict detection, approve/issue/return, track maintenance, and view analytics.

**Suitable for 5th-semester Computer Science PBL / viva demonstration.**

---

## Problem Statement

Colleges often manage lab equipment through informal processes, leading to double-bookings, unclear availability, and poor maintenance tracking. LabSlot digitizes the workflow for students, lab assistants, and administrators.

## Objectives

- Real-time equipment discovery and availability
- Backend-enforced booking conflict prevention
- Role-based workflows (Student / Assistant / Admin)
- Maintenance lifecycle linked to equipment status
- In-app notifications and admin analytics
- QR-based equipment identification

## Features

- JWT authentication + bcrypt password hashing
- Role-based authorization (frontend routes + backend middleware)
- Labs & equipment CRUD with search/filter
- Booking workflow: pending → approve/reject → issue → return
- Overlap detection on the server
- Maintenance: report → in-progress → complete
- Notifications (create, unread, mark read)
- QR code generation (URL to equipment detail)
- Role dashboards with live MongoDB statistics
- Admin analytics (Recharts)
- Dark mode, command palette (⌘K), responsive layout

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts, React Hook Form |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, CORS, QRCode |
| Database | MongoDB Atlas |

## Architecture

```
React SPA  →  REST + JWT  →  Express API  →  Mongoose  →  MongoDB Atlas
```

```
LabSlot/
├── frontend/          # React + Vite
├── backend/           # Express API
├── docs/              # architecture, database, api
├── README.md
└── .gitignore
```

## User Roles

| Role | Capabilities |
|------|----------------|
| **Student** | Register, browse labs/equipment, book, cancel, report issues, notifications, profile |
| **Lab Assistant** | Approve/reject, issue/return, maintenance, equipment view |
| **Admin** | Users, labs, equipment, bookings, maintenance, analytics, QR |

## Booking Workflow

```
Student submits → pending
  ├─ Assistant/Admin approves → approved → issue → issued → return → returned
  └─ reject → rejected
Student/staff may cancel pending/approved → cancelled
```

**Conflict rule (backend):**  
`existing.startTime < newEnd AND existing.endTime > newStart` for statuses `pending`, `approved`, `issued`, `overdue`.

Equipment with status `maintenance`, `damaged`, or `retired` cannot be booked.

## Equipment Lifecycle

```
available → booked → issued → available
available → maintenance → available
issued → damaged → maintenance → available
any → retired (terminal)
```

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Network Access: allow your IP or `0.0.0.0/0` for development
4. Copy the connection string

## Environment Variables

**backend/.env** (copy from `backend/.env.example`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/labslot?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_string_at_least_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**frontend/.env** (optional; copy from `frontend/.env.example`)

```
VITE_API_URL=http://localhost:5000/api
```

## Installation & Run

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Health check: http://localhost:5000/api/health

### Seed demo data

```bash
cd backend
node scripts/seed.js
```

### Frontend

```bash
cd frontend
cp .env.example .env   # optional
npm install
npm run dev
```

Open **http://localhost:5173**

### Production frontend build

```bash
cd frontend
npm run build
npm run preview
```

## Demo Credentials (DEVELOPMENT ONLY)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@labslot.edu | Admin@123 |
| Assistant | rahul.assistant@labslot.edu | Assistant@123 |
| Student | priya.student@labslot.edu | Student@123 |

Or register a new student from the UI.

## API Overview

Base: `http://localhost:5000/api`  
Auth header: `Authorization: Bearer <token>`

| Area | Paths |
|------|--------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/me` |
| Labs | `GET/POST /labs`, `GET/PUT/DELETE /labs/:id` |
| Equipment | `GET/POST /equipment`, `GET/PUT/DELETE /equipment/:id`, `GET /equipment/:id/availability`, `POST /equipment/:id/qr` |
| Bookings | `GET/POST /bookings`, `PUT /bookings/:id/cancel\|approve\|reject\|issue\|return` |
| Maintenance | `GET/POST /maintenance`, `PUT /maintenance/:id`, `PUT /maintenance/:id/complete`, `GET /maintenance/stats` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Dashboard | `GET /dashboard/student\|assistant\|admin` |
| Analytics | `GET /analytics/overview\|bookings\|equipment\|labs` |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id` (admin) |
| Health | `GET /health` |

See `docs/api.md` for more detail.

## Database Models

- **users** — students, assistants, admins (password hashed, `select: false`)
- **labs** — laboratories
- **equipment** — items with status, condition, QR
- **bookings** — full lifecycle + conflict indexes
- **maintenances** — reported issues
- **notifications** — per-user alerts

## Testing Checklist

- [ ] Register student / login all roles / logout
- [ ] Invalid password → 401
- [ ] Duplicate email → 409
- [ ] Student cannot open `/admin`
- [ ] Book equipment; overlapping slot → 400/409 with clear message
- [ ] Approve → issue → return
- [ ] Report maintenance → equipment unbookable → complete → available
- [ ] Admin analytics shows real counts
- [ ] QR generate stores data URL; scan path resolves equipment
- [ ] Mobile: hamburger drawer, stacked cards, scrollable tables

## Deployment Notes

| Component | Suggested host |
|-----------|----------------|
| Frontend | Vercel / Netlify |
| Backend | Render / Railway / Fly.io |
| Database | MongoDB Atlas |

1. Set production `MONGO_URI`, strong `JWT_SECRET`, `NODE_ENV=production`
2. Set `CLIENT_URL` / `VITE_API_URL` to production URLs
3. Restrict CORS to your frontend origin
4. Build frontend with `npm run build` and deploy `dist/`

## Common Errors

| Issue | Fix |
|-------|-----|
| Mongo connection failed | Check `MONGO_URI`, Atlas IP whitelist, user password |
| CORS error | Match `CLIENT_URL` to frontend origin |
| 401 on API | Login again; token expired |
| Overlap still allowed | Confirm both bookings same equipment and overlapping times |
| Blank page after login | Check browser console; ensure backend is running |

## Future Enhancements

- Email/SMS notifications  
- Calendar export  
- Lab-specific assistant assignment  
- Fine-grained audit log  
- PWA / mobile app  

## License

MIT — Educational / PBL use
