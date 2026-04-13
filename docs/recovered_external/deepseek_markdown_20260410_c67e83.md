# Exam Administration Verification System (EVAS)
## Secure Digital Exam Card Generation and Real-Time Exam Attendance Verification Platform

**Presented by:**  
Robert Muendo (G127/2341/2021)  
Daniel Nzioka (G126/2037/2022)

**Supervisor:** Prof. Selpher Cheloti

**Event:** SEKU Innovation Challenge 2026

---

## Background & Context

- **Current Reality in Universities:**
  - Manual verification of exam cards is slow and creates congestion.
  - Attendance handling is fragmented and paper-based.
  - Post-exam reporting is difficult to audit, leading to disputes over missing marks.
- **The Consequence:**
  - Wasted examination time.
  - Inconsistent enforcement of fee and evaluation policies.
  - High administrative burden on invigilators and the Examinations Office.

---

## Problem Statement

**Core Problem:**  
Manual and fragmented university exam verification processes cause administrative delays, inconsistent enforcement of academic policies, and reconciliation challenges regarding **missing marks**.

**Specific Pain Points:**
- **Congestion:** Long queues at exam venues due to manual card checks.
- **Missing Marks:** Disputes arising from lost or illegible paper attendance sheets.
- **Compliance Gap:** No current mechanism to ensure students evaluate lecturers *before* sitting for exams.
- **Weak Traceability:** Poor audit trail for who sat for which exam and when.

---

## Project Objectives

This project aims to develop a mobile platform that will:

1. **Automate Eligibility Verification:** Instantly check fee clearance, unit registration, and **lecturer evaluation completion**.
2. **Generate Secure Digital Exam Cards:** Provide students with a verifiable QR-coded card accessible via mobile.
3. **Streamline Invigilator Workflow:** Enable real-time scanning and attendance capture at the exam venue.
4. **Generate Formal Reports:** Automatically create professional, auditable PDF attendance reports.

---

## System Users & Stakeholders

| User Group | Primary Role in EVAS |
| :--- | :--- |
| **Students** | View eligibility, complete evaluations, generate exam card. |
| **Invigilators** | Scan and verify students, record digital attendance. |
| **Examinations Office** | Access real-time attendance data and auditable reports. |
| **ICT Directorate** | Manage system deployment, security, and maintenance. |
| **Finance Office** | Receive consistent, automated fee-clearance enforcement. |

---

## System Architecture Overview

- **Mobile App (Frontend):** React Native (Cross-platform)
- **Backend API:** Node.js + Express
- **Database Layer:** MongoDB (Cloud-ready)
- **Reporting Engine:** PDF Generation Library

*(Visual: Diagram showing Student App ↔ API Server ↔ Database and Invigilator App ↔ API Server ↔ Report Generator)*

---

## Student Workflow Module

This is the core user journey for a student before exam day.

1. **Login:** Secure authentication using student credentials.
2. **Dashboard:** Real-time overview of eligibility status.
3. **Lecturer Evaluation:** Mandatory step; system prevents exam card generation until completed.
4. **Attendance Tracking:** Monitor class attendance eligibility.
5. **Exam Card Generation:** One-tap generation of secure digital card (with QR code) once all criteria are met.

---

## Invigilator Workflow Module

This is the workflow on exam day to ensure smooth verification.

1. **Login:** Invigilator-specific secure access.
2. **Unit Selection:** Choose the active examination unit.
3. **Scan & Verification:** Use device camera to scan student QR code; system displays **VALID/INVALID** status instantly.
4. **Attendance Capture:** System automatically timestamps and records attendance.
5. **Reports Page:** Generate and export formal attendance sheets in PDF format immediately after the exam.

---

## Prototype Demo: Student Login & Dashboard

**Screen 1: Login** – Simple, university-branded entry point.  
**Screen 2: Dashboard** – Displays student info and clear visual indicators for Eligibility Status.

![Student Login](docs/media/demo/01-login-student.png)

![Student Dashboard](docs/media/demo/02-student-dashboard.png)

---

## Prototype Demo: Lecturer Evaluation

A critical compliance step. Students must complete a brief evaluation per registered unit. The system tracks completion status and locks the exam card until this is **100% complete**.

![Lecturer Evaluations](docs/media/demo/03-lecturer-evaluations.png)

---

## Prototype Demo: Attendance & Eligibility Check

**Left:** Overview of class attendance sessions.  
**Right:** Detailed breakdown of **why** a student is eligible (Fees Paid, Units Registered, Evaluations Done). This transparency reduces confusion.

| Attendance Tab | Eligibility Check |
| :---: | :---: |
| ![Attendance Tab](docs/media/demo/05-attendance-tab.png) | ![Eligibility Check](docs/media/demo/06-eligibility-check.png) |

---

## Prototype Demo: Exam Card Generation

**Left:** Digital exam card with student photo, name, and unique **QR Code**.  
**Right:** Professional, printable PDF format of the same card for offline backup or printing.

| Exam Card Preview | Exam Card PDF |
| :---: | :---: |
| ![Exam Card Preview](docs/media/demo/08-exam-card-preview.png) | ![Exam Card PDF](docs/media/demo/09-exam-card-pdf.png) |

---

## Prototype Demo: Invigilator Verification

**Left:** Camera interface within the app. Point at the student's exam card QR code.  
**Right:** Instant feedback screen showing student name, photo, unit, and a **GREEN "VALID"** indicator.

| Scan Screen | Verification Result |
| :---: | :---: |
| ![Scan Screen](docs/media/demo/11-scan-screen.png) | ![Verification Result](docs/media/demo/12-verification-result.png) |

---

## Prototype Demo: Reporting & Audit Trail

**Left:** List of past exam sessions available for report generation.  
**Right:** The final output – a formal attendance list with timestamps, ready for submission to the Examinations Office. **This eliminates missing marks disputes.**

| Reports Page | Report PDF |
| :---: | :---: |
| ![Reports Page](docs/media/demo/13-reports-page.png) | ![Report PDF](docs/media/demo/14-report-pdf.png) |

---

## Security & Performance Features

To ensure institutional trust, the system architecture includes:

- **Route Protection:** Secure API endpoints requiring authentication tokens.
- **Rate Limiting:** Prevention of brute-force attacks and server overload.
- **Input Validation:** Sanitization of all user inputs to prevent injection attacks.
- **Structured Logging:** Detailed logs for monitoring and debugging.
- **Smoke-Tested Endpoints:** Ensuring core features (Login, Scan, Report) are stable under load.

---

## Key Benefits & Impact

| Before EVAS | After EVAS |
| :--- | :--- |
| Slow, manual verification | **Faster** digital scanning |
| Missing marks due to lost paper | **Integrity** of digital timestamps |
| Weak policy enforcement | **Improved** compliance traceability |
| High administrative burden | **Reduced** manual reconciliation work |
| No feedback loop on lecturers | **Mandatory** evaluation completion |

---

## Conclusion & Summary

- **Innovation:** EVAS unifies eligibility, verification, and reporting into a single mobile ecosystem.
- **Impact:** Eliminates missing marks, enforces lecturer evaluation, and saves invigilator time.
- **Scalability:** Designed for adoption at SEKU and replicable across Kenyan universities.

**Closing Statement:**  
*"Transforming Examination Administration from a Paper Burden to a Digital Asset."*

---

## Questions & Discussion

**Contact Information:**  
- Robert Muendo: [Email Placeholder]  
- Daniel Nzioka: [Email Placeholder]  

**Supervisor:** Prof. Selpher Cheloti  

![EVAS Exam Card](docs/media/demo/08-exam-card-preview.png)