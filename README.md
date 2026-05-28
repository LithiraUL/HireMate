# HireMate - Recruitment Management System

> **Modern, AI-Powered Recruitment Platform for SMEs in Sri Lanka** 🇱🇰

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-blue)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)](https://expressjs.com)

---

## 🎯 Project Overview

HireMate is a comprehensive recruitment management system designed for Small and Medium Enterprises (SMEs). It streamlines the entire hiring process from job posting to interview scheduling with role-based access control.

### ✨ Key Features

- 🔐 **Role-Based Authentication** (Candidate, Employer, Admin)
- 🔒 **Secure Password Recovery** (Cryptographically hashed token-based Forgot/Reset recovery flows)
- 🛡️ **API Abuse Prevention** (Rate-limiting protection on auth endpoints using express-rate-limit)
- 🤖 **AI-Driven Recruitment Engine** (Local Ollama Llama 3.2:3b model integration)
- 📝 **Smart CV Parsing** (Automated skill, experience & education extraction via local Ollama)
- 🎯 **Intelligent Match Scoring** (Multi-vector candidate/job compatibility algorithm)
- 🧠 **AI HR Summaries** (Natural language candidate ranking explanations)
- 📄 **CV Upload & Management** (Cloudinary integration)
- 📧 **Automated Email Notifications** (NodeMailer with HTML templates)
- 📊 **Analytics Dashboard** (Hiring trends, time-to-hire metrics)
- 👥 **Talent Discovery** (Search & invite candidates directly)
- 📅 **Interview Scheduling** (Confirm/decline functionality)
- 📱 **Fully Responsive Design** (Mobile-first approach)
- 🚀 **Real-Time Application Tracking** with status updates
- 🎯 **Direct Job Invitations** (Email with specific job links)

---

## 📁 Project Structure

```
HireMate/
├── frontend/                    # Next.js 14 frontend (✅ Complete)
│   ├── app/                    # App router pages
│   │   ├── candidate/         # Candidate portal (4 pages)
│   │   │   ├── dashboard/    # Application tracking & interviews
│   │   │   ├── jobs/         # Browse & apply for jobs
│   │   │   ├── applications/ # Application history
│   │   │   └── profile/      # CV & profile management
│   │   │
│   │   ├── employer/          # Employer portal (5 pages)
│   │   │   ├── dashboard/    # Overview & recent applications
│   │   │   ├── jobs/         # Manage job postings & applicants
│   │   │   ├── post-job/     # Create new job posting
│   │   │   ├── candidates/   # Talent discovery & invitations
│   │   │   └── analytics/    # Hiring trends & metrics
│   │   │
│   │   ├── admin/             # Admin portal (4 pages)
│   │   │   ├── dashboard/    # System stats & activity
│   │   │   ├── users/        # User management
│   │   │   ├── jobs/         # Job moderation
│   │   │   └── logs/         # System logs
│   │   │
│   │   ├── login/             # Authentication
│   │   ├── register/          # User registration
│   │   ├── forgot-password/   # Submit email for reset link
│   │   ├── reset-password/    # Reset password with secure token
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact form
│   │   ├── faq/               # FAQ page
│   │   ├── privacy/           # Privacy policy
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # Reusable components
│   │   ├── JobCard.tsx       # Job listing card
│   │   ├── Modal.tsx         # Modal dialog
│   │   ├── Loading.tsx       # Loading spinner
│   │   └── Navbar.tsx        # Navigation bar
│   │
│   ├── context/               # React context
│   │   └── AuthContext.tsx   # Authentication state
│   │
│   ├── lib/                   # API services
│   │   ├── api.ts            # Axios instance
│   │   ├── authService.ts    # Auth APIs
│   │   ├── jobService.ts     # Job APIs
│   │   ├── applicationService.ts
│   │   ├── interviewService.ts
│   │   ├── analyticsService.ts
│   │   ├── adminService.ts
│   │   └── userService.ts    # User search APIs
│   │
│   └── types/                 # TypeScript definitions
│       └── index.ts          # Global type definitions
│
├── backend/                   # Express.js backend (✅ Complete)
│   ├── models/               # Mongoose schemas
│   │   ├── User.js          # User model (extended with verification & reset tokens)
│   │   ├── Job.js           # Job posting model
│   │   ├── Application.js   # Job application model
│   │   ├── Interview.js     # Interview scheduling model
│   │   └── SystemLog.js     # System logs schema
│   │
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js    # Auth, register, forgot/reset routes, rate limiting
│   │   ├── userRoutes.js    # User profile & search
│   │   ├── jobRoutes.js     # Job CRUD & invitations
│   │   ├── applicationRoutes.js # Applications & status
│   │   ├── interviewRoutes.js   # Interview scheduling
│   │   ├── analyticsRoutes.js   # Hiring analytics
│   │   └── adminRoutes.js   # Admin operations
│   │
│   ├── services/             # Business Logic
│   │   ├── ai/              # AI Services (Local Ollama, Circuit Breaker)
│   │   ├── compatibilityEngine.js # Multi-vector scoring algorithm
│   │   └── evidenceValidator.js # Validation engine
│   │
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT authentication & authorization
│   │
│   ├── config/               # Configuration
│   │   ├── db.js            # MongoDB connection
│   │   └── nodemailer.js    # Email templates & sender
│   │
│   ├── .env                  # Environment variables
│   └── server.js            # Express server entry
│
├── COMPLETION_AND_STRUCTURE_REPORT.md # 📖 System Architecture, File Structure, & Phase Reports
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account
- **Local Ollama** (with `llama3.2:3b` pulled and running locally)

### 1. Backend Setup

```powershell
cd backend
npm install

# Configure .env file with MongoDB, JWT, Cloudinary, Gmail credentials, and local OLLAMA_URL
npm run dev
```

Backend runs on: **http://localhost:5000**

### 2. Frontend Setup

```powershell
cd frontend
npm install

# Configure .env.local with API URL
npm run dev
```

Frontend runs on: **http://localhost:3001**

---

## 👥 User Roles

| Role | Features |
|------|----------|
| **Candidate** | Browse jobs, apply with CV, track applications, manage interviews, update profile |
| **Employer** | Post jobs, search candidates, send invitations, review applications, schedule interviews, view analytics |
| **Admin** | User management, job moderation, system monitoring, activity logs, system statistics |

---

## 🏗️ Architecture

✅ **Fully follows the 3-layer architecture:**
- **Presentation Layer**: Next.js 14 (Candidate, Employer, Admin portals)
- **Application Layer**: Express.js (Auth, Job, Application, Interview, Admin services)
- **Database Layer**: MongoDB (User, Job, Application, Interview collections)



---

## 🔧 Technology Stack

**Frontend**: Next.js 14 • TypeScript • Tailwind CSS • Axios • Recharts (Analytics)  
**Backend**: Node.js • Express • MongoDB • Mongoose • JWT • express-rate-limit  
**AI Services**: Local Ollama (Llama 3.2:3b) • pdf-parse  
**Integrations**: Cloudinary (CV Storage) • NodeMailer (Gmail SMTP)  
**DevOps**: Git • GitHub  

---

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Frontend - Candidate Portal | ✅ Complete (4 pages: Dashboard, Jobs, Applications, Profile) |
| Frontend - Employer Portal | ✅ Complete (5 pages: Dashboard, Jobs, Post Job, Candidates, Analytics) |
| Frontend - Admin Portal | ✅ Complete (4 pages: Dashboard, Users, Jobs, Logs) |
| Frontend - Public Pages | ✅ Complete (Landing, Login, Register, Forgot Password, Reset Password, About, Contact, FAQ, Privacy) |
| Backend - Auth & User Services | ✅ Complete (Login, Register, Profile, Search, rate limiters) |
| Backend - Job & Application Services | ✅ Complete (CRUD, Invitations, Status Management) |
| Backend - Interview Service | ✅ Complete (Scheduling, Confirmation, Email Notifications) |
| Backend - Analytics Service | ✅ Complete (Hiring Trends, Time-to-Hire, Demographics) |
| Backend - Admin Service | ✅ Complete (User Management, Job Moderation, System Stats, Logs) |
| Backend - AI Services (Phase 2) | ✅ Complete (Local Ollama CV Parsing, Compatibility Scoring, Circuit Breaker) |
| Security Features | ✅ Complete (Cryptographic Forgot/Reset Password flows, automatic expired token cleanup, express-rate-limit) |
| Email Notifications | ✅ Complete (Interview Invites, Status Updates, Job Invitations, Password Reset emails) |
| CV Upload (Cloudinary) | ✅ Complete (Image & PDF support with AI text extraction) |
| Salary Management | ✅ Complete (Min/Max range with currency) |
| Post-Login Redirect | ✅ Complete (Role-based routing, preserved URLs) |

**Total**: 13 pages + 7 public pages, 45+ API endpoints, AI integrated, production-ready! 🚀

---

## 📖 Documentation


- **[COMPLETION_AND_STRUCTURE_REPORT.md](./COMPLETION_AND_STRUCTURE_REPORT.md)** - 📁 Unified report detailing modular file structure, Phase 1 milestone logs, and Phase 2 local Ollama AI integration.
- **[frontend/README.md](./frontend/README.md)** - Frontend client setup, styling guides, and dynamic route instructions.
- **[backend/README.md](./backend/README.md)** - Backend Express API routes, environment setups, and rate-limiting configurations.

---

## 🎓 Academic Project

**Course**: IS 3920 - Individual Project on Business Solutions  
**Student**: Liyanagunawardhana L.U.  
**University**: University of Moratuwa  
**GitHub**: [@LithiraUL](https://github.com/LithiraUL)

---

## 📜 License

Copyright © 2025 Lithira Liyanaunawardhana - University of Moratuwa. All Rights Reserved.

This project is proprietary software developed for academic purposes. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited. See the [LICENSE](./LICENSE) file for details.

---

**Built for efficient recruitment management**
