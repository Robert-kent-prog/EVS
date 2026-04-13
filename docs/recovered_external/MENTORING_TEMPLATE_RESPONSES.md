# SEKU Innovation Challenge Mentoring Template Responses

This document is a filled response draft for:

- `Mentoring Template for student the innovation Challnege.docx`

It is written specifically for the **Exam Administration Verification System (EVAS)** and can be copied into the mentor template, adjusted with real mentor details, and discussed during mentoring sessions.

## 1. Basic Project Information

**Innovation Title:**  
Exam Administration Verification System: Secure Digital Exam Card Generation and Real-Time Exam Attendance Verification Platform for Universities

**Student Innovator(s):**  
Robert Muendo, Daniel Nzioka

**Registration Number(s):**  
G127/2341/2021, G126/2037/2022

**School / Department / Programme:**  
School of Science and Computing / Computing-related programmes / BSc Information Technology and BSc Computer Science

**Mentor Name:**  
Prof. Selpher Cheloti

**Mentor Expertise Area:**

**Phone / Email:**

**Challenge Year / Cohort:**  
2026 SEKU Innovation Challenge

**Project Category:**  
ICT / AI

## 2. Innovation Summary

**Problem being solved:**  
to eliminate or reduce the problem of missing marks which has been rampant a cross universities .
ensure that student evaluate lecturers .current student have not been evaluating lecturers ,by use of this system evaluating of lecturer will be a key to eligibilityof sitting for having exam card .

**Who is affected by the problem?**  
Students, invigilators, parents, the examinations office, the finance office, academic departments, the ICT directorate, and quality assurance teams are all affected by delays, inconsistent eligibility enforcement, and weak attendance traceability.

**Proposed solution:**  
EVAS is a mobile-centered platform that allows students to log in, check eligibility, complete lecturer evaluations, manage attendance readiness, and generate secure digital exam cards, while invigilators use the system to verify students in real time and generate formal attendance reports.

**Unique value proposition:**  
EVAS does not only scan an exam card. It unifies eligibility checks, digital exam card generation, verification at the exam venue, attendance capture, and PDF report generation into one continuous workflow.

**Why this idea matters at SEKU / in Kenya / beyond:**  
At SEKU, the system can eliminate/reduce the problem of missing marks and ensuree student evaluate lecturers

## 5. Problem Validation Section

### A. Problem Statement

**State the problem in one clear sentence:**  
Manual and fragmented university exam verification processes cause delays, weak policy enforcement, attendance reconciliation challenges, and poor auditability during examinations.

#

**Evidence summary:**  
The project is grounded in direct observation of manual examination workflows, where invigilators physically inspect exam cards and mark attendance manually under time pressure. These workflows create long queues and inconsistent decisions at exam venues. Interviews and informal stakeholder feedback indicate that attendance sheets are cumbersome to reconcile after exams and are prone to loss or confusion. Literature on QR- and code-based attendance systems also supports the claim that digital verification reduces processing time and improves traceability. The problem is therefore validated through both field observation and secondary evidence.

### C. Target Users / Beneficiaries

| User group          | Need / pain point                                                             | How severe is the problem? |
| ------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| Students            | Need quick, fair, and transparent confirmation of exam eligibility and access | High                       |
| Invigilators        | Need a fast, reliable way to verify students and record attendance            | High                       |
| Examinations Office | Needs accurate, auditable attendance and eligibility records                  | High                       |
| Finance Office      | Needs fee-clearance rules reflected consistently in exam access               | Medium to High             |
| ICT Directorate     | Needs a maintainable digital platform that can be supported institutionally   | Medium                     |

## 6. Solution Design Section

### A. Proposed Innovation

**Describe how the solution works:**  
The student logs into the mobile application and the system checks attendance status, fee clearance, registered units, and lecturer evaluation completion. If the student qualifies, the system allows student to generate a secure digital exam card that can be previewed and exported as a PDF. During exams, the invigilator logs into a separate module, selects the active unit, scans the student exam card, verifies the student in context, records attendance, and later generates a formal exam attendance report PDF.

### B. Key Features

- role-based login for students and invigilators
- eligibility-driven exam card generation
- lecturer evaluation workflow
- class attendance readiness and session tracking
- secure digital exam card preview and PDF output
- invigilator verification and attendance capture
- report generation with printable PDF outputs
- protected backend routes and validated request flows

### C. Innovation Level

**How is it different from what already exists?**  
Many existing systems handle only one part of the problem, such as attendance scanning or student portals. EVAS is different because it connects policy enforcement, exam card generation, real-time verification, and reporting in one platform. Its innovation lies in workflow integration rather than a single isolated feature.

### D. Alternatives / Competitors

| Existing solution                             | Limitation                                         | Your advantage                                                            |
| --------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Manual paper exam cards and attendance sheets | Slow, inconsistent, weakly auditable               | EVAS digitizes verification and reporting                                 |
| Generic QR attendance systems                 | Usually do not enforce full exam eligibility rules | EVAS integrates attendance with fees, evaluations, and unit registration  |
| Standard student portals                      | Often stop at registration and fee access          | EVAS covers actual exam-day verification and reporting                    |
| Standalone barcode check tools                | Limited reporting and no integrated card lifecycle | EVAS supports generation, verification, attendance capture, and reporting |

**Mentor Comments:**

## 7. Prototype Development Plan

### A. Prototype Type

- [x] Mobile app

**Recommended note:**  
The current prototype is primarily a mobile application with backend support and generated PDF outputs.

### B. Prototype Goal

**What must the prototype prove?**  
The prototype must prove that a student can move from eligibility assessment to exam card generation, and that an invigilator can then verify that student and generate a usable attendance report within the same integrated system.

### C. Minimum Viable Prototype (MVP)

### D. Materials / Tools / Software Needed

| Item                   | Needed for what?                                  | Available? | Source                    |
| ---------------------- | ------------------------------------------------- | ---------- | ------------------------- |
| Laptop(s)              | design, coding, testing, PDF generation           | Yes        | Student-owned             |
| Android phone(s)       | mobile testing and live demo                      | Yes        | Student-owned / borrowed  |
| React Native + Expo    | mobile app development                            | Yes        | Open-source               |
| Node.js + Express      | backend logic                                     | Yes        | Open-source               |
| MongoDB                | server-side data storage                          | Yes        | Local / development setup |
| SQLite                 | local/offline attendance storage where applicable | Yes        | Expo SQLite               |
| PDF generation library | exam card and report output                       | Yes        | Project dependency        |
| Wi-Fi / LAN connection | local network testing                             | Yes        | Local network             |
| Cloud/VPS hosting      | production-style deployment                       | No         | Future funding need       |

### E. Development Timeline

| Activity           | Responsible person    | Start date | End date   | Status      |
| ------------------ | --------------------- | ---------- | ---------- | ----------- |
| Problem validation | Team                  | 2026-01-06 | 2026-01-17 | Completed   |
| Concept refinement | Team + mentor         | 2026-01-18 | 2026-01-31 | Completed   |
| Prototype design   | Team                  | 2026-02-01 | 2026-02-14 | Completed   |
| Prototype build    | Team                  | 2026-02-15 | 2026-03-20 | Completed   |
| Testing            | Team + selected users | 2026-03-21 | 2026-04-05 | In progress |
| Improvements       | Team                  | 2026-03-25 | 2026-04-15 | In progress |
| Pitch preparation  | Team + mentor         | 2026-04-01 | 2026-04-20 | In progress |

**Mentor Comments (draft suggestion):**  
The build phase is strong. The biggest current need is disciplined user validation and packaging the prototype into a clean challenge demonstration.

## 8. User Testing and Validation

### A. Testing Plan

**Who will test the prototype?**  
Selected students, peer reviewers, potential invigilator users, project mentor, and academic stakeholders.

**How many users / testers?**  
8 to 12 testers for early validation, including at least 5 students and 2 to 3 invigilator-side reviewers.

**Where will testing be done?**  
Within a university environment or simulated exam workflow using Android phones and a local development backend.

### B. What Will Be Tested?

- [x] Usefulness
- [x] Ease of use
- [x] Accuracy
- [x] Speed
- [ ] Safety
- [x] Reliability
- [x] Attractiveness / design
- [x] Cost practicality
- [ ] Other

### C. Test Results Summary

| Test area                    | Feedback received                                   | Action to improve                                                        |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Student dashboard clarity    | Users needed clearer eligibility explanations       | Added explicit eligibility specifications and clearer dashboard guidance |
| Lecturer evaluation workflow | Form flow needed better separation between units    | Reset per-unit evaluation state and improved evaluation navigation       |
| Attendance module            | Users needed clearer attendance ticking per session | Improved session-based attendance table interaction and tick behavior    |
| Exam card actions            | Users wanted preview and share support              | Added preview flow and streamlined exam card actions                     |
| Invigilator reports          | Report output needed a more professional appearance | Improved report styling, PDF structure, and presentation formatting      |
| Connectivity configuration   | Local backend IP changes caused instability         | Centralized API configuration and improved host detection                |

### D. Key Lessons from Testing

- users understand the system faster when the workflow follows the real exam process
- eligibility rules must be explained clearly, not only enforced
- demo reliability is just as important as feature completeness
- report output quality strongly influences perceived professionalism
- small UX issues can block confidence even when core logic works

**Mentor Comments (draft suggestion):**  
The prototype shows meaningful iteration from feedback. The next step is to formalize more user-test evidence in a concise table for judges.

## 9. Feasibility and Sustainability

### A. Technical Feasibility

**Can the solution be built and used realistically?**  
Yes. The system has already been implemented as a working mobile and backend prototype using mature technologies. The core workflows for student access, exam card generation, invigilator verification, and report generation are technically feasible using standard Android devices and institutional ICT support.

### B. Financial Feasibility

**Estimated development cost:**  
KES 60,000 to 90,000 equivalent, considering devices, connectivity, testing, printing, and incidental development costs.

**Estimated cost per unit / user / deployment:**  
Pilot deployment could be kept relatively low if the institution uses existing ICT infrastructure, with operational deployment estimated at approximately KES 20,000 to 50,000 per pilot phase, excluding larger hosting and institutional rollout costs.

### C. Operational Feasibility

**Who will run or maintain the innovation?**  
The most suitable institutional owners are the Directorate of ICT and the Examinations Office, supported by departmental and finance data inputs where required.

### D. Sustainability / Business Model

- [ ] Sale of product
- [ ] Subscription
- [ ] Licensing
- [x] Institutional adoption
- [x] Grant / donor support
- [ ] Social enterprise
- [ ] Freemium / digital service
- [ ] Other

**Explain briefly:**  
The most realistic model is institutional adoption by universities, beginning with a pilot supported by innovation funds, grants, or internal university support. Long term, the system could be licensed or adapted for wider academic use.

**Mentor Comments (draft suggestion):**  
The strongest sustainability path is B2I, meaning institution-to-institution adoption, not direct consumer sales.

## 10. Ethics, Safety, and Risk Review

### A. Ethical Considerations

Does the project involve:

- [x] Human participants
- [ ] Patient / health data
- [x] Personal data
- [ ] AI decision-making
- [ ] Environmental risk
- [ ] Biological / chemical materials
- [ ] Vulnerable groups
- [ ] None

### B. Key Risks

| Risk                                               | Likelihood | Impact | Mitigation                                                                                          |
| -------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------- |
| Exposure of student personal data                  | Medium     | High   | Apply access control, validate inputs, minimize exposed fields, and use secure deployment practices |
| Network failure during demonstration or pilot      | High       | Medium | Prepare screenshot backup, local network checks, and limited offline support where possible         |
| Incorrect eligibility data or stale records        | Medium     | High   | Revalidate before card generation, improve data refresh, and maintain clear update workflows        |
| User resistance or low adoption                    | Medium     | Medium | Use simple UI, demonstrate clear value, and train invigilators/students through guided onboarding   |
| Poor hosting sustainability due to limited funding | High       | Medium | Start with controlled institutional pilot and use local infrastructure before full deployment       |

### C. Compliance Needs

- [x] Informed consent
- [x] Data protection
- [ ] Laboratory safety
- [x] Institutional approval
- [x] IP / originality check
- [ ] Other

**Mentor Comments (draft suggestion):**  
The team should present the project as a controlled academic prototype with careful handling of demo data and clear consent where human testing is involved.

## 12. Mentor Scoring Guide for Internal Review

This section should ultimately be filled by the mentor. The following is a **draft self-assessment / brainstorming version**.

| Criterion                    | Score | Comments                                                                                                    |
| ---------------------------- | ----: | ----------------------------------------------------------------------------------------------------------- |
| Problem clarity              |  9/10 | The problem is real, institutional, and easy to explain                                                     |
| Research / evidence          |  8/10 | Good observation and literature support; more direct user evidence would strengthen it                      |
| Innovation / originality     | 13/15 | Strong workflow integration, though the concept should be framed carefully against generic attendance tools |
| Prototype quality            | 13/15 | Functional prototype exists with multiple complete flows and PDFs                                           |
| Feasibility                  |  8/10 | Technically feasible; deployment cost and infrastructure remain constraints                                 |
| User validation              |  8/10 | Good iterative improvements, but formalized user testing can still be strengthened                          |
| Impact potential             |  9/10 | High institutional value in examination integrity and efficiency                                            |
| Sustainability / scalability |  8/10 | Clear institutional adoption path, but funding/deployment strategy is still developing                      |
| Presentation readiness       |  8/10 | Strong potential; needs polished screenshots, demo flow, and final narrative                                |
| Team commitment              |  9/10 | Demonstrated through sustained implementation and iteration                                                 |

**Total:**  
93/100 if judged generously, or approximately 86 to 90/100 under stricter internal review.

**Recommended official internal position:**

- [ ] Ready for submission
- [x] Needs minor improvements
- [ ] Needs major improvements before submission

**Why “Needs minor improvements” is the best honest position:**  
The prototype is strong, but it benefits from final user-testing evidence, refined slides, polished screenshots, and a stable demonstration workflow.

## 13. Meeting Log

| Date       | Issues discussed                        | Decisions made                                                               | Action points                                 | Deadline   |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| 2026-02-05 | Problem clarity and exam workflow scope | Keep focus on end-to-end exam verification, not generic attendance only      | refine problem statement and user journey     | 2026-02-10 |
| 2026-02-20 | Solution architecture and feature scope | prioritize student module, exam cards, and invigilator verification          | complete MVP flow definitions                 | 2026-02-25 |
| 2026-03-05 | Prototype progress and UI gaps          | improve dashboard clarity and eligibility explanations                       | revise student dashboard and exam card flow   | 2026-03-12 |
| 2026-03-25 | Reporting and verification readiness    | strengthen report PDF quality and session flow                               | improve invigilator reports and testing notes | 2026-04-02 |
| 2026-04-08 | Innovation challenge preparation        | prepare screenshots, slide deck, pitch script, and mentor template responses | assemble complete presentation pack           | 2026-04-15 |

## 14. Final Mentor Report

This section should ultimately be endorsed by the mentor. The following is a **draft version** for discussion.

**Prototype stage reached:**

- [ ] Idea only
- [ ] Concept refined
- [ ] Early prototype
- [x] Functional prototype
- [x] Tested prototype
- [ ] Pitch-ready prototype

**Biggest strengths of the innovation:**

- addresses a real institutional problem
- integrates multiple exam processes into one system
- already has a working mobile-centered prototype
- demonstrates exam card generation, verification, and reporting
- shows continuous iteration based on testing and feedback

**Biggest gaps still remaining:**

- stronger formal user validation evidence
- final challenge presentation polish
- deployment and hosting sustainability planning
- final backup demonstration package with screenshots and recorded flow

**Mentor’s final comments (draft suggestion):**  
This is a strong innovation with clear institutional relevance and a practical prototype. The team has moved beyond concept stage into functional implementation, which is a major strength. The main work remaining is not core invention, but validation packaging, pitch clarity, and demonstration reliability. With minor improvements, the innovation can be presented competitively.

**Mentor Signature:**  
To be filled

**Date:**  
To be filled

**Student Innovator Signature:**  
To be filled

**Date:**  
To be filled

## Direct Answers to the Short Mentor Reminder Questions

### 1. What exact problem are you solving?

We are solving the problem of slow, manual, and weakly traceable examination verification and attendance handling in universities.

### 2. Who needs this most?

Students, invigilators, and the examinations office need it most, because they directly experience delays, confusion, and administrative burden during examination periods.

### 3. Why is your solution better?

It is better because it combines eligibility enforcement, digital exam cards, real-time verification, attendance capture, and report generation in one platform instead of handling them separately.

### 4. Can you show it works?

Yes. The current prototype supports student login, eligibility checks, lecturer evaluations, attendance interaction, exam card preview/PDF, invigilator verification, and report generation.

### 5. What evidence supports it?

The evidence comes from observed institutional workflows, stakeholder feedback, literature on digital attendance and verification systems, and the working prototype itself.

### 6. Can it realistically be adopted or scaled?

Yes, especially through institutional adoption starting with a controlled pilot using existing ICT infrastructure before wider rollout.

## Brainstorming Notes for Mentor Discussion

Use these points during mentoring conversations:

- Should the challenge framing emphasize “exam integrity” or “administrative efficiency” more strongly?
- What minimum user-testing evidence will judges find credible?
- Which screenshots best prove the prototype is real and functional?
- Should the business model be described as institutional licensing or university adoption first?
- Which metrics should be emphasized most during judging: speed, traceability, fraud reduction, or policy enforcement?
- Would the mentor prefer the prototype to be positioned as a SEKU solution first or a wider university platform from the start?
