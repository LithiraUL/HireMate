# HireMate - System Architecture, File Structure, and Phase Completion Report

This document serves as the unified technical record, architectural overview, file structure guide, and phase completion report for the **HireMate** recruitment management platform.

---

## 📋 Table of Contents
1. [🎉 Overall Status & Executive Summary](#1-overall-status--executive-summary)
2. [✅ Phase 1 Completion Report](#2-phase-1-completion-report)
    - [Interview Scheduling System (FR-5.x)](#interview-scheduling-system-fr-5x)
    - [Analytics Dashboard](#analytics-dashboard)
    - [Refinements & Bug Fixes](#refinements--bug-fixes)
    - [Phase 1 Feature Breakdown](#phase-1-feature-breakdown)
    - [Technology Stack](#technology-stack)
3. [🚀 Phase 2 Completion Report: Local AI Recruitment Engine](#3-phase-2-completion-report-local-ai-recruitment-engine)
    - [Unified Local Ollama Helper](#unified-local-ollama-helper)
    - [Optimized AI CV Parsing](#optimized-ai-cv-parsing)
    - [Minimized AI Candidate Evaluation](#minimized-ai-candidate-evaluation)
    - [Sequential Evaluation Pipeline](#sequential-evaluation-pipeline)
    - [UI & Recommendations Integration](#ui--recommendations-integration)
4. [📁 Complete File Structure & Architecture](#4-complete-file-structure--architecture)
    - [Visual Directory Tree](#visual-directory-tree)
    - [Directory Purpose & Routing Guide](#directory-purpose--routing-guide)
    - [Protected Routes](#protected-routes)
    - [Data Flow & Extensibility](#data-flow--extensibility)
5. [📈 Implementation Metrics & Support](#5-implementation-metrics--support)

---

## 1. 🎉 Overall Status & Executive Summary

* **Phase 1 Status**: 100% Complete
* **Phase 2 Status**: 100% Complete & Optimized
* **System Integration**: Fully Local AI and Database Services
* **Codebase Quality**: Production-Ready ⭐⭐⭐⭐⭐

HireMate is an enterprise-ready, modular recruitment platform tailored for SMEs and modern hiring environments. It combines high-performance styling, secure authentication, dynamic portal dashboards (Candidates, Employers, and Admins), and a fully **local Ollama-driven AI compatibility engine** to guarantee data privacy, minimize external SaaS dependency, and eliminate operational overhead.

---

## 2. ✅ Phase 1 Completion Report

All Phase 1 functional requirements from the SRS document have been successfully implemented, verified, and refined.

### 📌 Interview Scheduling System (FR-5.x)

#### Backend Architecture
* **File**: `backend/routes/interviewRoutes.js`
* **Core Endpoints**:
  * `POST /api/interviews/schedule` - Schedule a new interview.
  * `GET /api/interviews/job/:jobId` - Query all scheduled interviews for a specific position.
  * `GET /api/interviews/my` - Fetch the candidate's personal interview list.
* **Key Features**:
  * Dual-party notification system powered by NodeMailer (Gmail SMTP).
  * Robust schema tracking interview details (date, time, virtual meeting link, custom employer notes).
  * Status transition handling: `scheduled` → `confirmed` → `completed`/`cancelled`.

#### Frontend Interfaces
* **Employer Management Portal** (`frontend/app/employer/jobs/page.tsx`):
  * Dynamic "Schedule Interview" action triggers directly from candidate lists.
  * Interactive scheduling modal incorporating smart date pickers (prevents selecting past dates), input-validated meeting URLs (Zoom/Google Meet/Teams), and clear error messages.
* **Candidate Portal Dashboard** (`frontend/app/candidate/dashboard/page.tsx`):
  * Intuitive display summarizing upcoming interviews sorted chronologically (earliest first).
  * Access to virtual meeting links (opening securely in a new tab) and customized notes.
  * Real-time metrics counters showing the number of scheduled interviews.

---

### 📊 Analytics Dashboard

#### Backend Aggregation Services
* **File**: `backend/routes/analyticsRoutes.js`
* **Core Endpoints**:
  * `GET /api/analytics/hiring-trends?period=6months` - Generates chronological application states over time.
  * `GET /api/analytics/time-to-hire` - Shortlist delay tracking.
  * `GET /api/analytics/demographics` - Aggregates demographic metrics for applicants.
* **Features**:
  * **Hiring Trends**: Groups historical applications monthly. Isolates employer-specific roles and filters by 1-month, 3-month, 6-month, or 1-year windows.
  * **Time-to-Hire Calculations**: Tracks average days elapsed from initial job posting to shortlist transition.
  * **Applicant Demographics**: Breaks down applicant groups by age (18-25, 26-35, 36-45, 46-55, 55+), experience (Entry 0-2y, Mid 3-5y, Senior 6-10y, Expert 10+y), and extracts top 10 skills.

#### Visual Analytics UI
* **File**: `frontend/app/employer/analytics/page.tsx`
* **Responsive Visualizations** (leveraging the **Recharts** rendering library):
  * **Hiring Trends Chart**: Stacked line chart showing applications over time with status breakdown.
  * **Age Distribution**: Color-coded, interactive pie chart.
  * **Experience Levels**: Standardized bar chart.
  * **Top Skills**: Horizontal ranking bar chart representing common applicant skills.
  * **Time-to-Hire Table**: Metric overview detailing time averages across distinct roles.

---

### 🔧 Refinements & Bug Fixes

#### Document Handling & Proxy System
* Fixed Cloudinary 401 Unauthorized errors on PDF CV rendering by implementing a backend proxy route (`GET /api/admin/proxy-document`).
* Configured all pdf uploads to use `resource_type: 'raw'` in Cloudinary settings, bypassing typical delivery restrictions.
* Integrated strict cascading deletion: rejecting an employer fully wipes out all DB records and associated legal document attachments from Cloudinary.

#### Form Validations & State Handling
* Rebuilt registration and login screens with comprehensive live input field checks (triggers on `blur` and `change`) with responsive CSS states.
* Implemented strong password complexity rules.
* Resolved `candidateService.updateProfile` context session destruction; profile changes now update the global `AuthContext` state cleanly.

#### Skill Normalization System
* Created `backend/utils/skillNormalizer.js` to process skill strings automatically.
* Maps common aliases (e.g., `js` → `JavaScript`, `reactjs` → `React`) and enforces Title Case formatting.
* Attached the normalizer as a setter in the Mongoose schemas (`User.js` candidate skills, `Job.js` required skills), ensuring search indexes remain aligned.

#### UI/UX Enhancements
* Re-spaced elements on the Employer's candidate search page to avoid overlapping visual elements.
* Enhanced the email verification link endpoint (`/verify-company/:token`) to render user-friendly, responsive HTML templates instead of raw JSON strings when links have expired.

---

### 🔒 Phase 1 Feature Breakdown

1. **User Authentication (FR-1.x)**: Secure registration, login, role selection, JWT session management, Mongoose profile structures, and bcrypt encryption.
2. **Job Posting (FR-2.x)**: Full CRUD job operations, required details (skills, salary range, work mode), and employer dashboard views.
3. **Application Tracking (FR-3.x)**: Apply using cover letter + PDF CV, update application status (pending → reviewed → shortlisted → rejected), and real-time candidate notifications.
4. **Advanced Search (FR-4.x)**: Fast, dynamic filtering of jobs and candidates by multiple parameters without reloading pages.
5. **Interview Scheduling (FR-5.x)**: Schedule virtual meetings, dispatch candidate invitations with notes, and display dashboard schedules.
6. **Analytics Portal**: Graphical graphs mapping trends, time-to-hire, and demographics.
7. **Admin Control (FR-8.x)**: CRUD users, view system activity logs, delete postings, and check stats.
8. **Contact & Help**: Integrated dual-notification mail forms, about, FAQ, and privacy pages.

---

### 📦 Technology Stack

* **Frontend Framework**: Next.js 14.2.33 (App Router) with TypeScript 5.3
* **Styling System**: Tailwind CSS + Custom Utility Modules (`globals.css`)
* **HTTP Library**: Axios with interceptor token injection
* **Charts Library**: Recharts
* **Backend Runtime**: Node.js + Express 4.22.1
* **Database System**: MongoDB Atlas + Mongoose 8.20.1
* **Cryptography**: JWT (jsonwebtoken) + bcryptjs (10 rounds)
* **API Integrations**: NodeMailer (Gmail SMTP) + Cloudinary SDK

---

## 3. 🚀 Phase 2 Completion Report: Local AI Recruitment Engine

To maintain extreme candidate data privacy, minimize subscription licensing costs, and eliminate SaaS availability risks, the entire AI evaluation tier is run **100% locally** using **Ollama** executing the optimized **`llama3.2:3b`** model.

### 🔌 Unified Local Ollama Helper
* **Location**: `backend/services/ai/ollamaHelper.js`
* Communicates directly with the local `/api/generate` endpoint of Ollama via lightweight, raw HTTP POST requests (`stream: false`).
* Avoids heavy library dependencies, preventing infinite request stream hangs.
* Standardizes warmup failures: during the initial model load, the helper intercepts timeout errors, identifies them as `isWarmup: true`, and safely alerts calling services to proceed with graceful overlap fallbacks without locking the main thread.
* Implements configurable operation timeouts:
  * Default fallback timeout: `120000ms` (2 minutes).
  * `AI_TIMEOUT_RANKING` for candidate match screening.
  * `AI_TIMEOUT_PARSING` for resume parsing.

### 📄 Optimized AI CV Parsing
* **Location**: `backend/services/ai/cvParserService.js`
* Extracts clean raw resume text from PDF CVs uploaded to Cloudinary using `pdf-parse`.
* Queries local Ollama with structured prompts to return clean JSON fields.
* Auto-maps parsed attributes (`extractedSkills`, `experienceYears`, `educationLevel`, `aiSummary`) directly to the candidate's `User` record inside MongoDB.

### 🧠 Minimized AI Candidate Evaluation
* **Location**: `backend/services/ai/aiRankingService.js`
* To prevent local Llama models from timing out under high loads, we implemented **radical prompt context truncation**:
  * Candidate resumes are compressed to their first `1500` characters, focusing exclusively on core skills, professional experience, and academic history.
  * Job post details are trimmed to the first `1000` characters.
  * Enforces prompt sizes strictly **under 3,000 characters** (approx. 700 tokens).
* Prompt structures are simplified to request only a direct score and short summary:
  ```json
  {
    "score": number,
    "summary": "short summary"
  }
  ```
* Provides character and token size logging inside backend consoles.

### 🔄 Sequential Evaluation Pipeline
* **Location**: `backend/controllers/recommendationController.js`
* Standardizes a **sequential loop evaluation model** (`for...of` loops) instead of executing parallel AI promises, preventing race conditions or CPU spikes on local machines.
* **Instant Fallback Recovery**: If the local AI service times out or fails, the engine catches the error, computes a rapid mathematical skill-overlap score fallback, and immediately proceeds to screen the next candidate.

### 📊 UI & Recommendations Integration
* **Location**: `frontend/app/employer/candidates/page.tsx`
* Employers can select a job role and view all applicants instantly ranked by compatibility scores.
* Matches are rendered with custom HSL brand progress indicators and theme-aligned badge indicators rather than default generic layouts.

---

## 4. 📁 Complete File Structure & Architecture

### 📊 Visual Directory Tree

```
HireMate/
│
├── 📁 backend/                               # Node.js Express Server
│   ├── 📁 config/                            # Configurations
│   │   ├── 📄 cloudinary.js                  # Cloudinary setup
│   │   └── 📄 nodemailer.js                  # Email setup
│   ├── 📁 controllers/                       # API Controllers
│   │   └── 📄 aiController.js                # Manual CV reprocessing
│   ├── 📁 middleware/                        # Express middlewares
│   │   └── 📄 auth.js                        # JWT & RBAC middleware
│   ├── 📁 models/                            # Mongoose Schemas
│   │   ├── 📄 Application.js
│   │   ├── 📄 Interview.js
│   │   ├── 📄 Job.js
│   │   ├── 📄 SystemLog.js                   # AI & Error logging
│   │   └── 📄 User.js                        # Extended with verification and reset tokens
│   ├── 📁 routes/                            # API Routes
│   │   ├── 📄 adminRoutes.js
│   │   ├── 📄 analyticsRoutes.js
│   │   ├── 📄 applicationRoutes.js
│   │   ├── 📄 authRoutes.js                  # Setup with rate limiting & forgot password
│   │   ├── 📄 contactRoutes.js
│   │   ├── 📄 interviewRoutes.js
│   │   ├── 📄 jobRoutes.js
│   │   └── 📄 userRoutes.js
│   ├── 📁 services/                          # Business Logic
│   │   ├── 📁 ai/                            # Local AI Services
│   │   │   ├── 📄 aiCircuitBreaker.js        # Global Ollama kill-switch
│   │   │   ├── 📄 aiRankingService.js        # Minimized AI evaluation screening
│   │   │   ├── 📄 cvParserService.js         # CV parsing with local Ollama
│   │   │   ├── 📄 evidenceAIService.js       # AI extractions for validation
│   │   │   ├── 📄 rankingExplanationService.js # AI HR summaries via Ollama
│   │   │   ├── 📄 ollamaHelper.js            # Axios Ollama HTTP helper
│   │   │   └── 📄 skillExtractionService.js  # Skill normalization AI wrapper
│   │   ├── 📄 compatibilityEngine.js         # Master scoring algorithm
│   │   └── 📄 evidenceValidator.js           # Multi-criteria validation engine
│   ├── 📁 utils/                             # Utilities
│   │   ├── 📄 cvTextExtractor.js             # Cloudinary & PDF text decoder
│   │   ├── 📄 logger.js                      # MongoDB fire-and-forget logger
│   │   └── 📄 skillNormalizer.js             # Skill string normalizer
│   ├── 📄 package.json                       # Dependencies & scripts
│   └── 📄 server.js                          # Express app entry point
│
├── 📁 frontend/                              # Next.js Frontend Application
│   ├── 📁 app/                               # Next.js App Router
│   │   ├── 📁 candidate/                     # Candidate Portal
│   │   │   ├── 📁 applications/              # Application tracking
│   │   │   │   └── 📄 page.tsx               # Applications list with status filters
│   │   │   ├── 📁 dashboard/                 # Candidate home
│   │   │   │   └── 📄 page.tsx               # Stats, quick actions, interviews display
│   │   │   ├── 📁 jobs/                      # Job browsing
│   │   │   │   └── 📄 page.tsx               # Job search, filters, apply
│   │   │   └── 📁 profile/                   # Profile management
│   │   │       └── 📄 page.tsx               # Edit profile, CV upload, skills
│   │   │
│   │   ├── 📁 employer/                      # Employer Portal
│   │   │   ├── 📁 analytics/                 # Analytics Dashboard
│   │   │   │   └── 📄 page.tsx               # Hiring trends, time-to-hire, demographics
│   │   │   ├── 📁 candidates/                # Candidate discovery
│   │   │   │   └── 📄 page.tsx               # Search, filter, view candidates
│   │   │   ├── 📁 dashboard/                 # Employer home
│   │   │   │   └── 📄 page.tsx               # Metrics, recent jobs, applications
│   │   │   ├── 📁 jobs/                      # Job management
│   │   │   │   └── 📄 page.tsx               # View jobs, apps, schedule interviews
│   │   │   └── 📁 post-job/                  # Create job posting
│   │   │       └── 📄 page.tsx               # Job form with skills management
│   │   │
│   │   ├── 📁 admin/                         # Admin Portal
│   │   │   ├── 📁 dashboard/                 # Admin home
│   │   │   │   └── 📄 page.tsx               # System statistics and activity
│   │   │   ├── 📁 users/                     # User management
│   │   │   │   └── 📄 page.tsx               # CRUD operations for users
│   │   │   ├── 📁 jobs/                      # Job management
│   │   │   │   └── 📄 page.tsx               # View and manage all jobs
│   │   │   └── 📁 logs/                      # System logs
│   │   │       └── 📄 page.tsx               # Activity monitoring
│   │   │
│   │   ├── 📁 about/                         # About page
│   │   │   └── 📄 page.tsx                   # Mission, vision, features
│   │   ├── 📁 contact/                       # Contact page
│   │   │   └── 📄 page.tsx                   # Contact form with email backend
│   │   ├── 📁 faq/                           # FAQ page
│   │   │   └── 📄 page.tsx                   # Frequently asked questions
│   │   ├── 📁 privacy/                       # Privacy Policy page
│   │   │   └── 📄 page.tsx                   # Privacy policy and terms
│   │   ├── 📁 forgot-password/               # Forgot password screen
│   │   │   └── 📄 page.tsx                   # Submit email reset form
│   │   ├── 📁 reset-password/                # Dynamic reset password directory
│   │   │   └── 📁 [token]/                   # Parameterized token directory
│   │   │       └── 📄 page.tsx               # Reset password input form
│   │   │
│   │   ├── 📁 login/                         # Authentication
│   │   │   └── 📄 page.tsx                   # Login form
│   │   ├── 📁 register/                      # User registration
│   │   │   └── 📄 page.tsx                   # Dynamic registration form
│   │   ├── 📄 layout.tsx                     # Root layout (Navbar, Footer, AuthProvider)
│   │   ├── 📄 page.tsx                       # Landing page (Hero, features, CTA)
│   │   └── 📄 globals.css                    # Global styles & utility classes
│   │
│   ├── 📁 components/                        # Reusable Components
│   │   ├── 📄 CandidateCard.tsx              # Candidate profile card
│   │   ├── 📄 Footer.tsx                     # Application footer
│   │   ├── 📄 JobCard.tsx                    # Job posting card
│   │   ├── 📄 Loading.tsx                    # Loading spinner component
│   │   ├── 📄 Modal.tsx                      # Reusable modal dialog
│   │   └── 📄 Navbar.tsx                     # Navigation bar with role-based links
│   │
│   ├── 📁 context/                           # State Management
│   │   └── 📄 AuthContext.tsx                # Authentication context & hooks
│   │
│   ├── 📁 lib/                               # Services & Utilities
│   │   ├── 📄 api.ts                         # Axios instance with interceptors
│   │   ├── 📄 adminService.ts                # Admin API calls
│   │   ├── 📄 analyticsService.ts            # Analytics API calls
│   │   ├── 📄 applicationService.ts          # Application API calls
│   │   ├── 📄 authService.ts                 # Extended with forgot/reset API methods
│   │   ├── 📄 interviewService.ts            # Interview API calls
│   │   ├── 📄 jobService.ts                  # Job posting API calls
│   │   └── 📄 userService.ts                 # User profile API calls
│   │
│   ├── 📁 types/                             # TypeScript Definitions
│   │   └── 📄 index.ts                       # All type definitions & interfaces
│   │
│   └── 📁 public/                            # Static Assets
```

---

### 📂 Directory Purpose & Routing Guide

#### `/app` - Next.js Application Routes
All pages and layouts following Next.js App Router structure.

* **Candidate Portal routes**:
  * `/candidate/dashboard` - Quick metrics, interview schedules, calendar reminders.
  * `/candidate/profile` - Edit CV, upload skills, and manage contact numbers.
  * `/candidate/jobs` - View available positions, search, and apply.
  * `/candidate/applications` - View cover letters and application statuses.
* **Employer Portal routes**:
  * `/employer/dashboard` - Detailed view of job postings, candidates, and metric summaries.
  * `/employer/post-job` - Job generation form including required criteria and skill tagging.
  * `/employer/jobs` - Manage applications, shortlisted entries, and schedule interviews.
  * `/employer/candidates` - Browse applicant profiles, filter by criteria, and review AI scoring.
* **Authentication & General pages**:
  * `/login` - Credential entry with rate-limiting.
  * `/register` - Dynamic registration for job seekers and employers.
  * `/forgot-password` - Request a password reset token.
  * `/reset-password/[token]` - Dynamic route to specify a complex new password.
  * `/` - Site home page introducing features, stats, and portal entry points.

#### `/components` - Reusable UI Blocks
* `Navbar.tsx` - Role-based header that switches menus based on candidate, employer, or admin logins.
* `Footer.tsx` - Base template containing quick links, about, FAQ, and privacy.
* `JobCard.tsx` - Reusable visual card detailing salary, location, required experience, and tags.
* `CandidateCard.tsx` - Displays candidates with age, parsed details, and AI recommendations.

#### `/lib` - Frontend Services
All network requests are isolated into specialized services interacting with the backend API:
* `api.ts` - Central Axios configuration injecting JWT tokens inside Request headers and catching `401 Unauthorized` logouts inside Response interceptors.
* `authService.ts` - Login, registration, token request, and token reset APIs.
* `jobService.ts` - Full CRUD job management.
* `applicationService.ts` - Operations for reviewing and submitting job applications.
* `interviewService.ts` - Handles interview scheduling metrics.

---

### 🔐 Protected Routes

HireMate utilizes client-side guards and server-side verification middleware to safeguard private portals:

1. **Candidate Protected:** `/candidate/*` - Requires `role === 'candidate'`.
2. **Employer Protected:** `/employer/*` - Requires `role === 'employer'`.
3. **Admin Protected:** `/admin/*` - Requires `role === 'admin'`.
4. **Public Routes:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password/*`, `/about`, `/contact`, `/faq`, `/privacy`.

---

### 🔄 Data Flow & Extensibility

```
Client User Interface (Next.js)
      ↓ (Triggers click / submit)
Service Class Methods (lib/service.ts)
      ↓ (Dispatches Axios HTTP requests)
Global Axios API Interceptor (lib/api.ts) ── [Injects Bearer Token]
      ↓ (Transmits over HTTP/HTTPS)
Express Server API Routes (backend/routes/*)
      ↓ (Enforces protect & RBAC middlewares)
Express Controller Actions (backend/controllers/*)
      ↓ (Requests Ollama AI / validates schemas)
Mongoose Schema Data Layer (backend/models/*) ── [Auto-hashes/normalizes skills]
      ↓ (Executes MongoDB CRUD operations)
MongoDB Database
```

#### How to Extend
* **To add a new portal page**: Create a dynamic folder and `page.tsx` under `frontend/app/`.
* **To add a new reusable UI widget**: Add a `.tsx` file under `frontend/components/`.
* **To expand type models**: Add interfaces directly to `frontend/types/index.ts`.
* **To add a new backend endpoint**: Write an endpoint in `backend/routes/` and register it inside `backend/server.js`.

---

## 5. 📈 Implementation Metrics & Support

### Implementation Metrics
* **Total Production Code Files**: 60+
* **Total Platform Endpoints**: 42+
* **Total Next.js App Routes**: 27
* **Codebase Size**: ~8,000+ lines
* **Phase 1 Completion**: 100%
* **Phase 2 Completion**: 100%

### Technical Support Contacts
* **Primary Developer Email**: [poseidon2002nov@gmail.com](mailto:poseidon2002nov@gmail.com)
* **Mobile Contact**: +94 71 278 1444
* **Distribution Terms**: All Rights Reserved (Proprietary License)
