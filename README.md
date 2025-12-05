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
- 📝 **Smart Job Posting & Browsing** with advanced filtering
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
│   │   ├── User.js          # User model (candidate/employer/admin)
│   │   ├── Job.js           # Job posting model
│   │   ├── Application.js   # Job application model
│   │   └── Interview.js     # Interview scheduling model
│   │
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js    # Auth & registration
│   │   ├── userRoutes.js    # User profile & search
│   │   ├── jobRoutes.js     # Job CRUD & invitations
│   │   ├── applicationRoutes.js # Applications & status
│   │   ├── interviewRoutes.js   # Interview scheduling
│   │   ├── analyticsRoutes.js   # Hiring analytics
│   │   └── adminRoutes.js   # Admin operations
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
├── SYSTEM_COMPLETE.md        # 📖 Full documentation
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account

### 1. Backend Setup

```powershell
cd backend
npm install

# Configure .env file with MongoDB, JWT, Cloudinary, Gmail credentials
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
**Backend**: Node.js • Express • MongoDB • Mongoose • JWT  
**Integrations**: Cloudinary (CV Storage) • NodeMailer (Gmail SMTP)  
**DevOps**: Git • GitHub  

---

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Frontend - Candidate Portal | ✅ Complete (4 pages: Dashboard, Jobs, Applications, Profile) |
| Frontend - Employer Portal | ✅ Complete (5 pages: Dashboard, Jobs, Post Job, Candidates, Analytics) |
| Frontend - Admin Portal | ✅ Complete (4 pages: Dashboard, Users, Jobs, Logs) |
| Frontend - Public Pages | ✅ Complete (Landing, Login, Register, About, Contact, FAQ, Privacy) |
| Backend - Auth & User Services | ✅ Complete (Login, Register, Profile, Search) |
| Backend - Job & Application Services | ✅ Complete (CRUD, Invitations, Status Management) |
| Backend - Interview Service | ✅ Complete (Scheduling, Confirmation, Email Notifications) |
| Backend - Analytics Service | ✅ Complete (Hiring Trends, Time-to-Hire, Demographics) |
| Backend - Admin Service | ✅ Complete (User Management, Job Moderation, System Stats, Logs) |
| Email Notifications | ✅ Complete (Interview Invites, Status Updates, Job Invitations) |
| CV Upload (Cloudinary) | ✅ Complete (Image & PDF support) |
| Salary Management | ✅ Complete (Min/Max range with currency) |
| Post-Login Redirect | ✅ Complete (Role-based routing, preserved URLs) |

**Total**: 13 pages + 7 public pages, 40+ API endpoints, production-ready! 🚀

---

## 📖 Documentation


- **[frontend/README.md](./frontend/README.md)** - Frontend guide
- **[backend/README.md](./backend/README.md)** - API documentation

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

**Built with ❤️ for efficient recruitment management**
