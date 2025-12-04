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
- 📝 **Smart Job Posting & Browsing**
- 📄 **CV Upload & Management** (Cloudinary)
- 📧 **Automated Email Notifications** (NodeMailer)
- 📊 **Comprehensive Admin Dashboard**
- 📱 **Fully Responsive Design**
- 🚀 **Real-Time Application Tracking**

---

## 📁 Project Structure

```
HireMate/
├── frontend/                 # Next.js 14 frontend (✅ Complete)
│   ├── app/                 # App router pages
│   │   ├── candidate/      # Candidate portal (4 pages)
│   │   ├── employer/       # Employer portal (4 pages)
│   │   └── admin/          # Admin portal (4 pages) ⭐ NEW
│   ├── components/         # Reusable components
│   ├── lib/                # API services
│   └── types/              # TypeScript definitions
│
├── backend/                # Express.js backend (✅ Complete)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & validation
│   └── server.js          # Express server
│
├── SYSTEM_COMPLETE.md     # 📖 Full documentation
└── README.md              # This file
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
| **Candidate** | Browse jobs, apply, track applications, manage CV |
| **Employer** | Post jobs, search candidates, review applications, schedule interviews |
| **Admin** | User management, job moderation, system monitoring, logs |

---

## 🏗️ Architecture

✅ **Fully follows the 3-layer architecture:**
- **Presentation Layer**: Next.js 14 (Candidate, Employer, Admin portals)
- **Application Layer**: Express.js (Auth, Job, Application, Interview, Admin services)
- **Database Layer**: MongoDB (User, Job, Application, Interview collections)

**📖 See [SYSTEM_COMPLETE.md](./SYSTEM_COMPLETE.md) for complete architecture details**

---

## 🔧 Technology Stack

**Frontend**: Next.js 14 • TypeScript • Tailwind CSS • Axios • React Hook Form  
**Backend**: Node.js • Express • MongoDB • JWT • Cloudinary • NodeMailer  

---

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Frontend - Candidate Portal | ✅ Complete (4 pages) |
| Frontend - Employer Portal | ✅ Complete (4 pages) |
| Frontend - Admin Portal | ✅ Complete (4 pages) |
| Backend - Auth & Job Services | ✅ Complete |
| Backend - Application & Interview | ✅ Complete |
| Backend - Admin Service | ✅ Complete |
| Email Notifications | ✅ Complete |
| CV Upload (Cloudinary) | ✅ Complete |

**Total**: 16 pages, 40+ API endpoints, production-ready! 🚀

---

## 📖 Documentation

- **[SYSTEM_COMPLETE.md](./SYSTEM_COMPLETE.md)** - Complete system documentation
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
