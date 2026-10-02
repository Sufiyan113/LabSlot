# LabSlot — Database Design

## Overview

LabSlot uses **MongoDB** with **Mongoose** as the ODM.  
All collections are designed for a college laboratory resource management system.

Collections:
- `users`
- `labs`
- `equipment`
- `bookings`
- `maintenances`
- `notifications`

---

## 1. Entity-Relationship Overview

```
User ──────────────┐
                   │ 1
                   │
                   ▼ *
              Booking ──────► Equipment ──────► Lab
                   │               │
                   │               │ 1
                   │               ▼ *
                   │          Maintenance
                   │
Notification ◄─────┘
```

**Relationships:**
| From          | To           | Type       | Field          |
|---------------|--------------|------------|----------------|
| Booking       | User         | Many-to-One| `user`         |
| Booking       | Equipment    | Many-to-One| `equipment`    |
| Booking       | Lab          | Many-to-One| `lab`          |
| Equipment     | Lab          | Many-to-One| `lab`          |
| Maintenance   | Equipment    | Many-to-One| `equipment`    |
| Maintenance   | User (reporter)| Many-to-One| `reportedBy` |
| Maintenance   | User (assignee)| Many-to-One| `assignedTo` |
| Notification  | User         | Many-to-One| `user`         |
| Lab           | User (assistants)| One-to-Many| `assistants` |

---

## 2. Collection Details

### 2.1 users

| Field         | Type     | Required | Notes |
|---------------|----------|----------|-------|
| name          | String   | Yes      | 2–80 chars |
| email         | String   | Yes      | Unique, lowercase |
| password      | String   | Yes      | Hashed with bcrypt (select: false) |
| role          | String   | Yes      | `student` \| `assistant` \| `admin` |
| studentId     | String   | No       | Unique + sparse (only for students) |
| department    | String   | No       | |
| phone         | String   | No       | |
| profileImage  | String   | No       | URL/path |
| isActive      | Boolean  | No       | Default `true` |
| createdAt     | Date     | Auto     | |
| updatedAt     | Date     | Auto     | |

**Indexes:**  
- `email` → unique  
- `studentId` → unique + sparse  
- `{ role: 1, department: 1 }`

**Why these fields?**
- `role` drives all authorization middleware.
- `studentId` is college-specific and useful for reports.
- Password is never returned (`select: false` + `toJSON` cleanup).
- `isActive` allows soft-disable without deleting history.

---

### 2.2 labs

| Field        | Type     | Required | Notes |
|--------------|----------|----------|-------|
| name         | String   | Yes      | |
| code         | String   | Yes      | Unique, uppercase (e.g. `IOT-LAB`) |
| building     | String   | Yes      | |
| floor        | String   | No       | |
| roomNumber   | String   | Yes      | |
| department   | String   | Yes      | |
| description  | String   | No       | |
| capacity     | Number   | No       | Default 30 |
| status       | String   | No       | `active` \| `inactive` \| `under_renovation` |
| assistants   | [ObjectId]| No      | Refs to User |
| createdAt    | Date     | Auto     | |
| updatedAt    | Date     | Auto     | |

**Virtual:** `equipmentCount` (count of Equipment documents)

**Indexes:**  
- `code` → unique  
- `{ department: 1, status: 1 }`  
- Text index on `name`, `code`, `description`

---

### 2.3 equipment

| Field         | Type     | Required | Notes |
|---------------|----------|----------|-------|
| name          | String   | Yes      | |
| equipmentId   | String   | Yes      | Unique, uppercase (e.g. `ESP32-IOT-004`) |
| category      | String   | Yes      | Enum of common lab categories |
| lab           | ObjectId | Yes      | Ref → Lab |
| description   | String   | No       | |
| manufacturer  | String   | No       | |
| model         | String   | No       | |
| condition     | String   | No       | `excellent` \| `good` \| `fair` \| `poor` \| `damaged` |
| status        | String   | No       | See lifecycle below |
| purchaseDate  | Date     | No       | |
| qrCode        | String   | No       | Data URL or encoded value |
| image         | String   | No       | |
| totalBookings | Number   | No       | Incremented on successful booking |
| notes         | String   | No       | |

**Status values:**  
`available` | `booked` | `issued` | `maintenance` | `damaged` | `retired`

**Indexes:**  
- `equipmentId` → unique  
- `{ lab: 1, status: 1 }`  
- `{ category: 1, status: 1 }`  
- Text index on `name`, `equipmentId`, `description`

---

### 2.4 bookings

| Field           | Type     | Required | Notes |
|-----------------|----------|----------|-------|
| user            | ObjectId | Yes      | Ref → User (student) |
| equipment       | ObjectId | Yes      | Ref → Equipment |
| lab             | ObjectId | Yes      | Ref → Lab (denormalized for fast queries) |
| bookingDate     | Date     | Yes      | Calendar day |
| startTime       | Date     | Yes      | Full datetime |
| endTime         | Date     | Yes      | Must be after startTime |
| purpose         | String   | Yes      | 5–500 chars |
| status          | String   | No       | See lifecycle |
| approvedBy      | ObjectId | No       | Ref → User (assistant/admin) |
| rejectionReason | String   | No       | |
| issuedAt        | Date     | No       | |
| returnedAt      | Date     | No       | |
| issueNotes      | String   | No       | |
| returnNotes     | String   | No       | |

**Status values:**  
`pending` | `approved` | `rejected` | `cancelled` | `issued` | `returned` | `overdue`

**Critical indexes for conflict detection:**
```js
{ equipment: 1, startTime: 1, endTime: 1 }
{ user: 1, status: 1, bookingDate: -1 }
{ lab: 1, status: 1, bookingDate: 1 }
```

**Static method:** `Booking.findConflicts(equipmentId, startTime, endTime, excludeId)`

---

### 2.5 maintenances

| Field           | Type     | Required | Notes |
|-----------------|----------|----------|-------|
| equipment       | ObjectId | Yes      | Ref → Equipment |
| reportedBy      | ObjectId | Yes      | Ref → User |
| issue           | String   | Yes      | Short title |
| description     | String   | Yes      | |
| priority        | String   | No       | `low` \| `medium` \| `high` \| `critical` |
| status          | String   | No       | `reported` \| `in-progress` \| `completed` |
| assignedTo      | ObjectId | No       | Ref → User |
| startedAt       | Date     | No       | |
| completedAt     | Date     | No       | |
| resolutionNotes | String   | No       | |

---

### 2.6 notifications

| Field        | Type     | Required | Notes |
|--------------|----------|----------|-------|
| user         | ObjectId | Yes      | Ref → User |
| title        | String   | Yes      | |
| message      | String   | Yes      | |
| type         | String   | No       | Enum of event types |
| relatedId    | ObjectId | No       | Optional link to Booking / Equipment etc. |
| relatedModel | String   | No       | |
| isRead       | Boolean  | No       | Default `false` |

**Index:** `{ user: 1, isRead: 1, createdAt: -1 }` — powers unread badge & list.

---

## 3. Equipment Status Lifecycle

```
                  ┌─────────────┐
                  │  available  │◄──────────────────────┐
                  └──────┬──────┘                       │
                         │ booking approved             │
                         ▼                              │
                  ┌─────────────┐                       │
                  │   booked    │                       │
                  └──────┬──────┘                       │
                         │ issue                        │
                         ▼                              │
                  ┌─────────────┐     return            │
                  │   issued    │───────────────────────┤
                  └──────┬──────┘                       │
                         │ report damage                │
                         ▼                              │
                  ┌─────────────┐     repair complete   │
                  │   damaged   │───────────────────────┤
                  └──────┬──────┘                       │
                         │                              │
                         ▼                              │
                  ┌─────────────┐                       │
                  │ maintenance │───────────────────────┘
                  └──────┬──────┘
                         │ (terminal)
                         ▼
                  ┌─────────────┐
                  │   retired   │
                  └─────────────┘
```

**Rules enforced by backend:**
- Students can only book equipment whose status is `available`.
- Equipment under `maintenance`, `damaged`, or `retired` is never bookable.
- Status transitions are performed inside the same transaction / controller that changes the booking status.

---

## 4. Booking Conflict Detection — Data Requirements

To detect conflicts the backend needs:

1. **equipment** ObjectId of the requested item.
2. **startTime** and **endTime** as JavaScript `Date` objects (or ISO strings that parse cleanly).
3. Current booking statuses that **block** the equipment:  
   `['pending', 'approved', 'issued', 'overdue']`

**Query (implemented as `Booking.findConflicts`):**

```js
{
  equipment: equipmentId,
  status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
  startTime: { $lt: newEndTime },
  endTime:   { $gt: newStartTime }
}
```

This is the classic interval-overlap condition.  
If any document is returned → reject the new booking with HTTP 409.

The compound index `{ equipment: 1, startTime: 1, endTime: 1 }` makes this query efficient.

---

## 5. How Mongoose References & populate() Are Used

```js
// Example: get a booking with related data
const booking = await Booking.findById(id)
  .populate('user', 'name email studentId department')
  .populate('equipment', 'name equipmentId status condition')
  .populate('lab', 'name code building roomNumber')
  .populate('approvedBy', 'name email');
```

- Only the fields needed by the UI are selected (projection).
- `lean()` is used when we only need plain objects (faster, no Mongoose document methods).
- Virtuals (`equipmentCount`, `maintenanceCount`) are populated with `.populate('equipmentCount')` when required.

---

## 6. Testing the Models (Phase 2)

Because the full Express server is not yet built, you can test models in isolation:

```bash
cd backend
# (after installing mongoose & dotenv)
node
```

```js
require('dotenv').config();
const mongoose = require('mongoose');
const { User, Lab, Equipment, Booking } = require('./models');

await mongoose.connect(process.env.MONGO_URI);

// Create a test user
const user = await User.create({
  name: 'Test Student',
  email: 'test@labslot.edu',
  password: 'Test@123',
  role: 'student',
  studentId: 'TEST-001',
});
console.log(user); // password should be hashed

// Test conflict helper (after creating sample bookings)
const conflicts = await Booking.findConflicts(
  equipmentId,
  new Date('2025-10-15T10:00:00'),
  new Date('2025-10-15T12:00:00')
);
```

Or write a small temporary script `scripts/testModels.js` that connects, creates documents, runs assertions, and disconnects.

---

## 7. Files Created in Phase 2

```
backend/models/
├── User.js
├── Lab.js
├── Equipment.js
├── Booking.js
├── Maintenance.js
├── Notification.js
└── index.js

backend/scripts/
└── seedDataStructure.js   (reference shape for later seed script)

docs/
└── database.md
```

All models are ready for Phase 3 (Backend Foundation) and Phase 4 (Authentication).
