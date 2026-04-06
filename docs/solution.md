What's genuinely strong about EVS
You've picked a real problem. Every Kenyan university (and many across East Africa) still does physical card inspection and paper attendance sheets during exams. I've seen your codebase — this isn't a toy demo. You have:

A working eligibility pipeline with 4 enforceable rules
Barcode-based verification flow with manual fallback
Offline-first attendance capture (SQLite)
PDF generation for both exam cards and attendance reports
Role-based architecture (student vs invigilator)
That's a genuinely complete workflow. For a 4th year project, this is strong work.

Commercial viability — honest assessment
Yes, this can make money, but here's the realistic path:

Approach	Pros	Cons
SaaS for universities (subscription per institution)	Recurring revenue, scalable	Long sales cycles, universities are slow to adopt, need trust
Pilot at SEKU first	Proof of concept, testimonials, iterate with real users	Free/low-cost initially
Expand to other Kenyan universities	70+ universities = large addressable market	Each may want customization
My recommendation: Pilot it at SEKU for free next exam season. Get real data, real feedback, real testimonials. Then approach 2-3 other universities with evidence that it works. Universities pay for things that reduce liability and audit risk — your verification logs and PDF reports are exactly that.

The iOS question
This is important. You're using React Native with Expo — which is actually great news. Your app is not Android-only by architecture. Here's the situation:

Platform	Current Status	What's needed
Android	✅ Working	Continue as-is
iOS	⚠️ Code is cross-platform, but no iOS build configured	Need a Mac for iOS builds, Apple Developer Account ($99/year), TestFlight for testing
Your React Native code will run on iOS with minimal changes — mostly UI tweaks (status bar handling, safe area insets, and navigation gestures). The camera scanning, SQLite, and PDF features all work cross-platform through Expo.

Practical options for iOS without a Mac:

EAS Build (Expo Application Services) — Build iOS apps in Expo's cloud. No Mac required. Free tier available.
Focus on Android first for the pilot — most Kenyan university students use Android (80%+ market share in Kenya). iOS can come in Phase 2.
What would make this project stand out in your defense
The security fixes we just applied — shows you understand production concerns, not just "it works on my laptop"
The real QR code — if the barcode actually scans, your demo will be impressive
Load capacity awareness — mention in your defense that you analyzed for 4,000+ concurrent users and made specific architectural decisions (connection pooling, indexing, compression). Supervisors love that.
The roadmap — shows you're thinking beyond the prototype
One honest concern
Your project documentation says the system is "prototype suitable for pilot deployment." After the Phase 1 fixes we just applied, that's actually true now. Before today, it wasn't — the unprotected routes meant anyone could create admin accounts. If your supervisor or external examiner tests the API directly, the fixes we applied today would save you from an embarrassing demonstration.

Bottom line: You've built something real and useful. Polish it (QR code, clean demo flow), defend it well, and then seriously pursue the commercial angle after graduation. The Kenyan edtech market is growing and universities are under increasing pressure to digitize — your timing is good.