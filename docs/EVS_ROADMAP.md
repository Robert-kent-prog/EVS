# EVS — Complete Project Roadmap

## System Overview

The Exam Administration Verification System (EVS) is a mobile-centered platform for secure exam card generation and real-time exam attendance verification at South Eastern Kenya University. It consists of:

- **Mobile App** — React Native + Expo (Student & Invigilator modules)
- **Backend API** — Node.js + Express
- **Database** — MongoDB (server) + SQLite (mobile offline storage)
- **PDF Engine** — PDFKit for exam cards and attendance reports

---

## SECTION 1: PHASE 1 FIXES — COMPLETED ✅

### Security Fixes Implemented

| # | Fix | File(s) Changed | Status |
|---|-----|-----------------|--------|
| 1 | **CORS lockdown** — Replaced open `cors()` with restricted `corsOptions` allowing only whitelisted origins | `app.js`, `config/corsOptions.js` | ✅ Done |
| 2 | **Helmet security headers** — Added X-Frame-Options, CSP, HSTS, X-Content-Type-Options, and other HTTP security headers | `app.js` | ✅ Done |
| 3 | **NoSQL injection prevention** — Installed and applied `express-mongo-sanitize` to strip MongoDB operators from user input | `app.js` | ✅ Done |
| 4 | **Student route authentication** — Added `verifyJWT` to the verify endpoint; added `verifyAdmin` to all CRUD routes (list all, create, update, delete) | `routes/studentRoutes.js` | ✅ Done |
| 5 | **User route authentication** — All user management routes (create, read, update, delete) now require admin authentication | `routes/UserRoutes.js` | ✅ Done |
| 6 | **Exam card route authentication** — All 6 exam card routes (eligibility, generate, list, current, download, delete) now require JWT authentication | `routes/examCardRoutes.js` | ✅ Done |
| 7 | **Sensitive data leak fix** — Verify endpoint no longer returns password hashes or active JWT tokens; uses `.select('-password -AccessToken -__v')` | `controllers/studentController.js` | ✅ Done |
| 8 | **Static uploads removed** — Removed unprotected `/uploads` static file serving; PDFs now accessible only through authenticated API routes | `app.js` | ✅ Done |
| 9 | **Body size limits** — Added 1MB limit on JSON and URL-encoded request bodies to prevent memory exhaustion attacks | `app.js` | ✅ Done |
| 10 | **Cryptographic serial numbers** — Replaced predictable `Math.random()` serial number generation with `crypto.randomBytes()` | `service/examCardService.js` | ✅ Done |

### Performance Fixes Implemented

| # | Fix | File(s) Changed | Status |
|---|-----|-----------------|--------|
| 11 | **Student database indexes** — Enabled indexes on `studentId` (unique), `examCardNo` (unique), and `email` (unique) for fast lookups | `models/Student.js` | ✅ Done |
| 12 | **ExamCard database indexes** — Added index on `studentId` and compound index `{studentId, isValid}` for active card queries | `models/ExamCard.js` | ✅ Done |
| 13 | **LecturerEvaluation index** — Added compound index `{student, unitCode}` for eligibility check queries | `models/LecturerEvaluation.js` | ✅ Done |
| 14 | **MongoDB connection pooling** — Configured pool: 50 max / 10 min connections, 45s socket timeout, 5s server selection timeout | `config/db.js` | ✅ Done |
| 15 | **Response compression** — Installed and applied `compression` middleware to gzip all API responses | `app.js` | ✅ Done |

### Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `helmet` | latest | Security headers |
| `express-mongo-sanitize` | latest | NoSQL injection prevention |
| `compression` | latest | Response compression |

---

## SECTION 2: SPRINT 2 SECURITY IMPLEMENTATION STATUS 🔒

### Completed in Sprint 2 ✅

| # | Fix | Description | File(s) Changed | Status |
|---|-----|-------------|-----------------|--------|
| S1 | **Rate Limiting** | Added concrete in-memory rate limiting and applied it API-wide plus on login, password reset, and PDF generation endpoints | `app.js`, `middleware/rateLimiters.js`, `routes/AuthRoutes.js`, `routes/PasswordRoutes.js`, `routes/pdfRoutes.js` | ✅ Done |
| S3 | **Input Validation** | Added shared validation utilities and enforced them across login, registration, student/user CRUD, lecturer evaluation submission, exam card access, and password reset flows | `utils/validation.js`, `controllers/AuthController.js`, `controllers/studentController.js`, `controllers/examCardController.js`, `controllers/passwordResetController.js`, `service/studentService.js`, `service/userService.js` | ✅ Done |
| S4 | **Remove AccessToken from DB** | Removed JWT persistence from MongoDB schemas and login services; student verify responses no longer reference or expose token fields | `models/Student.js`, `models/user.js`, `service/AuthService.js`, `controllers/studentController.js` | ✅ Done |
| S5 | **Password Reset Security** | Password resets now hash new passwords explicitly with bcrypt, support both user and student accounts, and return safe development fallback tokens if email transport is unavailable | `controllers/passwordResetController.js`, `models/PasswordResetToken.js`, `routes/AuthRoutes.js`, `routes/PasswordRoutes.js` | ✅ Done |
| S6 | **Password Complexity** | Enforced minimum password complexity (8+ chars with uppercase, lowercase, and a number) for create, update, and reset flows | `utils/validation.js`, `service/studentService.js`, `service/userService.js`, `controllers/passwordResetController.js` | ✅ Done |
| S10 | **Core Error Sanitization** | Removed raw internal error payloads from the auth, student, user, exam-card, and password-reset controllers so clients receive bounded messages instead of full internals | `controllers/AuthController.js`, `controllers/studentController.js`, `controllers/userController.js`, `controllers/examCardController.js`, `controllers/passwordResetController.js` | ✅ Done |
| S13 | **Exam Card Ownership Enforcement** | Students can now only check eligibility, generate cards, list cards, download PDFs, and delete cards for their own registration number; student profile fetch is self/admin only | `controllers/examCardController.js`, `controllers/studentController.js` | ✅ Done |
| S14 | **Mobile Secure Token Storage** | Centralized all mobile session tokens into `expo-secure-store` with automatic migration from legacy AsyncStorage token keys | `app/_services/secureSession.ts`, `app/_services/api.ts`, `app/_services/auth.ts`, `app/_services/examCardFile.ts`, `app/_context/AuthContext.tsx`, `app/_context/StudentAuthContext.tsx` | ✅ Done |
| S15 | **Role Session Isolation** | Student and invigilator logins now clear the opposite role’s token path to avoid mixed sessions on the same device | `app/_services/secureSession.ts`, `app/_services/api.ts`, `app/_context/AuthContext.tsx`, `app/_context/StudentAuthContext.tsx` | ✅ Done |
| S16 | **Token Verification Contract Fix** | `/verify-token` now returns an explicit success payload, allowing the mobile app to perform a real backend token validation during startup | `routes/verifyTokenRoute.js`, `middleware/VerifyJWT.js`, `middleware/VerifyAdmin.js` | ✅ Done |
| S2 | **JWT Token Expiry** | Reduced access-token lifetime, added refresh-token persistence with rotation and revocation, exposed backend refresh/logout endpoints, and wired the mobile app to automatically refresh expired sessions | `service/AuthService.js`, `controllers/AuthController.js`, `routes/AuthRoutes.js`, `models/RefreshToken.js`, `middleware/rateLimiters.js`, `app/_services/api.ts`, `app/_services/secureSession.ts`, `app/_context/AuthContext.tsx`, `app/_context/StudentAuthContext.tsx`, `app/_services/auth.ts`, `app/_types/index.ts` | ✅ Done |
| S9 | **Production Logging** | Replaced remaining ad-hoc backend logging with a shared structured logger and standardized error metadata across auth, student, user, exam-card, PDF, DB, and startup flows | `utils/logger.js`, `app.js`, `config/db.js`, `controllers/AuthController.js`, `controllers/studentController.js`, `controllers/userController.js`, `controllers/examCardController.js`, `controllers/passwordResetController.js`, `controllers/pdfController.js`, `service/examCardService.js`, `service/pdfService.js` | ✅ Done |
| S12 | **Account Lockout** | Added principal-aware failed-login tracking with escalating temporary lockouts, `423 Locked` responses, and `Retry-After` headers on repeated authentication failures | `models/Student.js`, `models/user.js`, `service/AuthService.js`, `controllers/AuthController.js` | ✅ Done |
| S17 | **Endpoint Smoke Test Coverage** | Added an automated Mongo-backed smoke suite covering authentication, refresh/logout, password reset, student CRUD, evaluations, attendance, exam cards, and PDF report endpoints before commit | `test-smoke.js`, `package.json` | ✅ Done |

### Remaining Security Priorities

#### Medium Priority

| # | Issue | Description | Effort | Status |
|---|-------|-------------|--------|--------|
| S7 | **HTTPS / TLS** | All traffic is plaintext HTTP. Must configure TLS in production (typically via Nginx reverse proxy) | 2 hours | Pending |
| S8 | **Secret Rotation** | JWT secrets, email credentials, and DB URI are in Git history. Rotate all secrets before any deployment | 1 hour | Pending |
| S11 | **CSRF Protection** | Cookie parser is enabled; add CSRF tokens for any future cookie-based flows | 2 hours | Pending |

### Verification Completed in Sprint 2 ✅

| # | Verification | Description | Status |
|---|--------------|-------------|--------|
| V1 | **Backend syntax checks** | `node --check` passes on the updated auth, refresh-token, attendance, exam-card, logging, and password-reset files | ✅ Done |
| V2 | **Mobile type safety** | `npx tsc --noEmit` passes after the mobile refresh-token/session changes | ✅ Done |
| V3 | **End-to-end backend smoke suite** | `npm run smoke:test` passes across authentication, refresh rotation, logout, password resets, lockout, student routes, attendance, evaluations, exam cards, and PDF endpoints | ✅ Done |

---

## SECTION 3: REMAINING PERFORMANCE FIXES ⚡

### Reliability Fix Added During Sprint 2 ✅

| # | Fix | Description | File(s) Changed | Status |
|---|-----|-------------|-----------------|--------|
| P0 | **On-Demand PDF Lookup Fix** | Fixed exam card PDF regeneration to resolve the student by registration number instead of MongoDB `_id`, preventing false PDF regeneration failures when a saved URL is missing | `service/examCardService.js` | ✅ Done |

### High Priority

| # | Issue | Description | Effort |
|---|-------|-------------|--------|
| P1 | **PM2 Clustering** | Single Node.js process handles all requests (~500 max concurrent). Use PM2 with `-i max` to utilize all CPU cores. This alone could 4-8x throughput | 1 hour |
| P2 | **PDF Worker Threads** | PDF generation blocks the event loop. Move to worker threads or a Bull/BullMQ job queue so PDFs generate in the background | 2 days |
| P3 | **Redis Caching** | Redis config exists but is not installed or used. Cache: student eligibility (5 min TTL), student profile lookups, exam card status. Would dramatically reduce DB load | 2 days |
| P4 | **Reduce Redundant Queries** | `generateExamCard` makes 9 DB calls (queries the same student twice, etc.). Pass objects through instead of re-querying | 3 hours |
| P5 | **Pagination on List Endpoints** | `getAllStudents()` returns the entire collection (4000+ records). Add `.skip()` / `.limit()` with pagination parameters | 3 hours |

### Medium Priority

| # | Issue | Description | Effort |
|---|-------|-------------|--------|
| P6 | **PDF Cleanup Job** | PDF files accumulate on disk forever. Add a cron job to delete expired reports and use TTL index on `PdfReport.expiresAt` | 2 hours |
| P7 | **MongoDB Replica Set** | Single MongoDB instance is a single point of failure. Set up 3-node replica set for redundancy and read scaling | 1 day |
| P8 | **Nginx Reverse Proxy** | Add Nginx in front for TLS termination, static asset caching, request buffering, and connection management | 1 day |
| P9 | **Load Testing** | No load tests exist. Use k6 or Artillery to simulate 4,000 concurrent users and identify bottlenecks | 1 day |
| P10 | **Cloud PDF Storage** | Move PDF storage from local filesystem to AWS S3 or Google Cloud Storage for reliability and scalability | 1 day |

---

## SECTION 4: NEW FEATURES TO IMPLEMENT 🚀

### 🔴 High Impact / High Value

#### F1. Real Scannable QR Code on Exam Cards ✅ (Completed)
**Current state:** The exam card PDF draws a visual barcode simulation using rectangles — it is NOT scannable by any barcode reader.
**Implemented state:** Now implements a real QR code using the `qrcode` npm package containing the serial number. Embedded in the PDF. Invigilator scans it with the camera and the app instantly verifies the student. Let's see this in action!
**Effort:** 1 day
**Files affected:** `service/pdfService.js`

---

#### F2. Admin Web Dashboard
**Current state:** No admin interface exists. The documentation recommends it. Administrators must use API calls directly.
**Proposed:** Build a responsive web dashboard (React or Next.js) for the examinations office with:
- Real-time exam session monitoring (students verified per venue)
- Student management (search, filter, bulk import)
- Eligibility override capability
- Report generation and download
- System health and usage analytics
**Effort:** 1-2 weeks
**New files:** Entire new frontend project

---

#### F3. Bulk Student Import (CSV/Excel)
**Current state:** `SystemRoutes.js` references a `bulkUpload` function but it's not implemented. Students must be added one-by-one.
**Proposed:** Admin uploads a CSV or Excel file with student data (RegNo, Name, Email, Department, Courses, etc.). Backend parses, validates, hashes passwords, and creates records in batch.
**Effort:** 2 days
**Files affected:** New controller + service, `routes/studentRoutes.js`

---

#### F4. Real-Time Push Notifications
**Current state:** No notification system. Students don't know when their eligibility status changes.
**Proposed:** Use Expo Push Notifications to notify students when:
- Fees are cleared → "You can now register units"
- Evaluations completed → "1 step remaining for exam card"
- Exam card generated → "Your exam card is ready to download"
- Exam card expiring soon → "Card expires in 3 days"
**Effort:** 2-3 days
**Files affected:** New notification service, student controller updates, mobile app notification handler

---

#### F5. Exam Session Management
**Current state:** Invigilators manually type the unit code and name when setting up a scan session. No scheduling or pre-configuration.
**Proposed:** Admin creates exam sessions (unit, date, time, venue, assigned invigilator). Invigilator opens the app and selects from scheduled sessions. System auto-populates unit details and restricts verification to students registered for that unit.
**Effort:** 3-4 days
**Files affected:** New `ExamSession` model, new controller/service/routes, invigilator mobile screens

---

#### F6. Offline Sync for Invigilator
**Current state:** SQLite stores attendance locally but there is no sync-back mechanism. Records captured offline are never uploaded to the server.
**Proposed:** When connectivity returns, the app automatically syncs local SQLite attendance records to the backend MongoDB. Include conflict resolution for duplicate entries.
**Effort:** 2-3 days
**Files affected:** Mobile sync service, new backend sync endpoint, `attendance_records` table updates

---

### 🟠 Medium Impact

#### F7. Student Profile Photo
**Current state:** No photo field. Invigilators cannot visually confirm identity during verification.
**Proposed:** Students upload a photo during registration (or admin bulk-uploads from university records). Photo displayed on verification screen alongside student details. Stored in cloud storage or as base64.
**Effort:** 2 days
**Files affected:** `Student.js` model, student profile screen, invigilator verification screen, image upload endpoint

---

#### F8. Exam Timetable Auto-Population
**Current state:** Invigilators manually enter which unit is being examined. No timetable awareness.
**Proposed:** Admin uploads the exam timetable (CSV or manual entry). When an invigilator opens the scan screen, the system auto-suggests the current exam based on date/time/venue.
**Effort:** 2-3 days
**Files affected:** New `ExamTimetable` model, admin endpoints, invigilator scan screen

---

#### F9. Analytics & Reporting Dashboard
**Current state:** Only basic attendance PDFs. No trend analysis or institutional reporting.
**Proposed:** Add analytics for:
- Attendance trends across semesters
- Eligibility rates by department/faculty
- Peak verification times
- Invigilator activity logs
- Fee clearance completion rates
Accessible from the admin dashboard.
**Effort:** 1 week
**Files affected:** New analytics service, aggregation pipelines, dashboard frontend

---

#### F10. Multi-Semester & Academic Year Support
**Current state:** System handles one semester at a time with no archival.
**Proposed:** Each exam card, evaluation, and attendance record is tagged with semester + academic year. Students can view historical exam cards. Admin can filter and report by any period.
**Effort:** 2-3 days
**Files affected:** Model updates, query filters, mobile UI for semester switching

---

#### F11. Exam Card Revocation
**Current state:** Exam cards can be deleted but there's no admin-initiated revocation (e.g., if a student is caught cheating or fees bounce).
**Proposed:** Admin can revoke a student's exam card with a reason. Revoked cards show as invalid during invigilator verification scan. Student is notified.
**Effort:** 1-2 days
**Files affected:** `ExamCard.js` model (add `revokedAt`, `revokedBy`, `revocationReason`), admin endpoint, verification logic update

---

### 🟡 Nice-to-Have

#### F12. Biometric Authentication
**Proposed:** Add fingerprint / Face ID login for the mobile app using Expo LocalAuthentication API. Secondary authentication, not replacement for password.
**Effort:** 1 day

#### F13. Dark Mode
**Proposed:** Add a dark theme toggle for the mobile app. Already partially supported through React Native theming.
**Effort:** 1-2 days

#### F14. GPS Geofencing for Exam Venues
**Proposed:** Define exam venue GPS boundaries. During verification, confirm that the invigilator is physically at the correct venue. Flag out-of-boundary verifications.
**Effort:** 2-3 days

#### F15. Student Appeals Workflow
**Proposed:** If a student disagrees with their eligibility status (e.g., believes fees were paid). Submit an appeal through the app → reviewed by admin → approved/rejected with comments.
**Effort:** 3-4 days

#### F16. SMS Fallback Notifications
**Proposed:** For students without consistent internet, send critical notifications (exam card ready, card expiring) via SMS using Twilio or Africa's Talking API.
**Effort:** 1-2 days

#### F17. Accessibility Improvements
**Proposed:** Screen reader support, high contrast mode, larger touch targets for accessibility compliance.
**Effort:** 2-3 days

---

## SECTION 5: IMPLEMENTATION PRIORITY MATRIX

| Priority | Feature | Impact | Effort | Recommended Phase |
|----------|---------|--------|--------|-------------------|
| 🔴 | F1: Real QR Code | High | 1 day | **Next sprint** |
| 🔴 | F3: Bulk Student Import | High | 2 days | **Next sprint** |
| 🔴 | F6: Offline Sync | High | 2-3 days | **Next sprint** |
| 🔴 | F4: Push Notifications | High | 2-3 days | **Next sprint** |
| 🔴 | F5: Exam Session Mgmt | High | 3-4 days | Sprint 2 |
| 🔴 | F2: Admin Dashboard | Very High | 1-2 weeks | Sprint 2-3 |
| 🟠 | F7: Student Photo | Medium | 2 days | Sprint 2 |
| 🟠 | F8: Timetable Auto-Pop | Medium | 2-3 days | Sprint 2 |
| 🟠 | F11: Card Revocation | Medium | 1-2 days | Sprint 2 |
| 🟠 | F10: Multi-Semester | Medium | 2-3 days | Sprint 3 |
| 🟠 | F9: Analytics Dashboard | Medium | 1 week | Sprint 3 |
| 🟡 | F12: Biometric Auth | Low | 1 day | Sprint 3 |
| 🟡 | F13: Dark Mode | Low | 1-2 days | Sprint 3 |
| 🟡 | F14: GPS Geofencing | Low | 2-3 days | Future |
| 🟡 | F15: Student Appeals | Low | 3-4 days | Future |
| 🟡 | F16: SMS Fallback | Low | 1-2 days | Future |
| 🟡 | F17: Accessibility | Low | 2-3 days | Future |

---

## SECTION 6: ARCHITECTURE TARGETS

### Current Architecture (Prototype)
```
[Mobile App] → [Single Node.js Process] → [Single MongoDB Instance]
                                        → [Local Filesystem (PDFs)]
```

### Target Production Architecture (4,000+ Users)
```
                        ┌──────────────┐
                        │    Nginx     │  TLS, rate limiting, static cache
                        └──────┬───────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
           ┌─────┴─────┐ ┌────┴────┐ ┌─────┴─────┐
           │  Node #1   │ │ Node #2 │ │  Node #3   │  PM2 cluster
           └─────┬─────┘ └────┬────┘ └─────┬─────┘
                 │             │             │
           ┌─────┴─────────────┴─────────────┴─────┐
           │         MongoDB Replica Set (3 nodes)  │
           └────────────────────┬───────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
          ┌──────┴──────┐ ┌────┴────┐ ┌──────┴──────┐
          │    Redis     │ │  S3/GCS │ │  Bull Queue  │
          │  (cache +    │ │  (PDFs) │ │ (PDF workers)│
          │  sessions)   │ │         │ │              │
          └─────────────┘ └─────────┘ └──────────────┘
```

---

*Document generated: April 6, 2026*
*Author: EVS Development Team*
*System: Exam Administration Verification System v1.0*
