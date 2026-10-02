# LabSlot API Reference

Base URL: `http://localhost:5000/api`  
Protected routes require: `Authorization: Bearer <JWT>`

## Auth
| Method | Path | Access |
|--------|------|--------|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| GET | /auth/me | Private |
| PUT | /auth/me | Private |

## Labs
| Method | Path | Access |
|--------|------|--------|
| GET | /labs | Private |
| GET | /labs/:id | Private |
| POST | /labs | Admin |
| PUT | /labs/:id | Admin |
| DELETE | /labs/:id | Admin |

## Equipment
| Method | Path | Access |
|--------|------|--------|
| GET | /equipment | Private |
| GET | /equipment/:id | Private |
| GET | /equipment/:id/availability | Private |
| POST | /equipment | Admin |
| PUT | /equipment/:id | Admin/Assistant |
| DELETE | /equipment/:id | Admin |
| POST | /equipment/:id/qr | Admin |

## Bookings
| Method | Path | Access |
|--------|------|--------|
| GET | /bookings | Private (scoped) |
| GET | /bookings/:id | Private |
| POST | /bookings | Student |
| PUT | /bookings/:id/cancel | Owner / Assistant / Admin |
| PUT | /bookings/:id/approve | Assistant / Admin |
| PUT | /bookings/:id/reject | Assistant / Admin |
| PUT | /bookings/:id/issue | Assistant / Admin |
| PUT | /bookings/:id/return | Assistant / Admin |

## Maintenance
| Method | Path | Access |
|--------|------|--------|
| GET | /maintenance | Private (students: own) |
| GET | /maintenance/stats | Assistant / Admin |
| GET | /maintenance/:id | Private |
| POST | /maintenance | Private |
| PUT | /maintenance/:id | Assistant / Admin |
| PUT | /maintenance/:id/complete | Assistant / Admin |

## Notifications
| Method | Path | Access |
|--------|------|--------|
| GET | /notifications | Private |
| PUT | /notifications/:id/read | Private |
| PUT | /notifications/read-all | Private |

## Dashboard
| Method | Path | Access |
|--------|------|--------|
| GET | /dashboard/student | Student |
| GET | /dashboard/assistant | Assistant |
| GET | /dashboard/admin | Admin |

## Analytics
| Method | Path | Access |
|--------|------|--------|
| GET | /analytics/overview | Admin |
| GET | /analytics/bookings | Admin |
| GET | /analytics/equipment | Admin |
| GET | /analytics/labs | Admin |

## Users
| Method | Path | Access |
|--------|------|--------|
| GET | /users | Admin |
| POST | /users | Admin (student/assistant only) |
| GET/PUT/DELETE | /users/:id | Admin |

## Health
| Method | Path | Access |
|--------|------|--------|
| GET | /health | Public |
