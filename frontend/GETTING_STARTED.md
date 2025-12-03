# HireMate Frontend - Quick Start Guide

## 🎯 Overview

This is the complete frontend implementation for the HireMate Recruitment Management System. The application is built with Next.js 14, TypeScript, and Tailwind CSS.

## ✅ What's Included

### Completed Features

#### Authentication System
- ✅ Login page with email/password
- ✅ Registration page for candidates and employers
- ✅ JWT token management
- ✅ Protected routes with role-based access
- ✅ AuthContext for global state management

#### Candidate Portal
- ✅ Dashboard with statistics and quick actions
- ✅ Profile management (personal info, skills, CV upload, job preferences)
- ✅ Job browsing with search and filters
- ✅ Job application tracking
- ✅ Application status monitoring

#### Employer Portal
- ✅ Dashboard with hiring metrics
- ✅ Job posting form with skill management
- ✅ Job listings management
- ✅ Candidate search with advanced filtering
- ✅ Application review and status updates
- ✅ Candidate profile viewing

#### Shared Components
- ✅ Responsive Navbar with role-based navigation
- ✅ Footer with links
- ✅ JobCard component
- ✅ CandidateCard component
- ✅ Modal component
- ✅ Loading spinner

#### API Integration Layer
- ✅ Axios instance with interceptors
- ✅ Authentication service
- ✅ Job service
- ✅ Candidate service
- ✅ Application service
- ✅ Interview service

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** version 18.0 or higher
- **npm** or **yarn** package manager
- A code editor (VS Code recommended)
- Git (optional, for version control)

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

Open PowerShell and navigate to your project:

```powershell
cd C:\Users\DELL\Desktop\HireMate
```

### Step 2: Install Dependencies

Install all required npm packages:

```powershell
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- React Icons
- date-fns
- And all other dependencies

**Expected Duration**: 2-5 minutes depending on internet speed

### Step 3: Verify Installation

Check if installation was successful:

```powershell
npm list next react react-dom
```

You should see the installed versions without errors.

## 🔧 Configuration

### Environment Variables

The `.env.local` file is already created with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**To change the API endpoint:**
1. Open `.env.local` in your editor
2. Update `NEXT_PUBLIC_API_URL` to point to your backend server
3. Save the file
4. Restart the development server

## 🏃 Running the Application

### Development Mode

Start the development server:

```powershell
npm run dev
```

The application will start at: **http://localhost:3000**

You should see:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

### Production Build

To build for production:

```powershell
npm run build
npm run start
```

## 🧭 Application Navigation

### Landing Page
- URL: `http://localhost:3000`
- Features hero section, feature highlights, and CTAs

### Authentication Pages

**Login**
- URL: `http://localhost:3000/login`
- Fields: Email, Password
- Redirects to dashboard based on user role

**Register**
- URL: `http://localhost:3000/register`
- Toggle between Candidate and Employer registration
- Employer fields include company information

### Candidate Portal

**Dashboard**
- URL: `http://localhost:3000/candidate/dashboard`
- Shows application statistics and quick actions

**Profile**
- URL: `http://localhost:3000/candidate/profile`
- Upload CV (PDF/DOC/Image)
- Manage skills
- Add GitHub/LinkedIn links
- Set job preferences

**Browse Jobs**
- URL: `http://localhost:3000/candidate/jobs`
- Search and filter jobs
- View job details
- Apply for jobs

**My Applications**
- URL: `http://localhost:3000/candidate/applications`
- Track application status
- Filter by status (pending, reviewed, shortlisted, rejected)

### Employer Portal

**Dashboard**
- URL: `http://localhost:3000/employer/dashboard`
- View hiring metrics
- Recent applications

**Post Job**
- URL: `http://localhost:3000/employer/post-job`
- Create new job posting
- Add required skills
- Set job type and work mode

**My Jobs**
- URL: `http://localhost:3000/employer/jobs`
- View all posted jobs
- Review applications
- Update application status
- Delete jobs

**Find Candidates**
- URL: `http://localhost:3000/employer/candidates`
- Search candidates by name/skills
- Filter by age, employment type, work mode
- View candidate profiles

## 🧪 Testing the Application

### Test User Scenarios

Since the backend is not yet connected, you can:

1. **Test the UI/UX**:
   - Navigate through all pages
   - Test responsive design (resize browser)
   - Check form validations

2. **Test Authentication Flow** (when backend is ready):
   - Register as candidate
   - Register as employer
   - Login with credentials
   - Verify role-based redirects

3. **Test Candidate Features**:
   - Complete profile
   - Upload CV
   - Browse jobs
   - Apply for jobs

4. **Test Employer Features**:
   - Post a job
   - Search candidates
   - Review applications

## 🔌 Backend Integration

### What You Need

The frontend expects a REST API with these endpoints:

**Base URL**: `http://localhost:5000/api` (configurable)

#### Authentication Endpoints
```
POST /auth/register
POST /auth/login
GET /auth/me
PUT /auth/profile
```

#### Job Endpoints
```
GET /jobs
GET /jobs/:id
POST /jobs
PUT /jobs/:id
DELETE /jobs/:id
GET /jobs/my-jobs
```

#### Application Endpoints
```
POST /applications
GET /applications/my-applications
GET /applications/job/:jobId
PUT /applications/:id
```

#### Candidate Endpoints
```
GET /candidates
POST /candidates/filter
GET /candidates/:id
POST /candidates/upload-cv
PUT /candidates/profile
```

### Integration Steps

1. Start your backend server on port 5000 (or update `.env.local`)
2. Ensure CORS is configured to allow `http://localhost:3000`
3. Implement the required endpoints
4. Test API calls using browser DevTools Network tab

## 🛠️ Common Issues & Solutions

### Issue: Port 3000 already in use

**Solution**:
```powershell
# Kill process on port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Module not found errors

**Solution**:
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: TypeScript errors

**Solution**:
```powershell
# Rebuild TypeScript
npm run build
```

### Issue: Styles not loading

**Solution**:
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Issue: API calls failing

**Check**:
1. Backend server is running
2. `.env.local` has correct API URL
3. CORS is configured on backend
4. Network tab in browser DevTools for error details

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Test on different screen sizes using browser DevTools (F12 → Toggle Device Toolbar).

## 🎨 Customization

### Change Color Theme

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Change these values
    500: '#YOUR_COLOR',
    600: '#YOUR_COLOR',
    700: '#YOUR_COLOR',
  },
}
```

### Update Company Branding

1. Replace logo in `components/Navbar.tsx`
2. Update footer in `components/Footer.tsx`
3. Change `title` and `description` in `app/layout.tsx`

## 📊 Project Statistics

- **Total Files**: 40+
- **Total Lines of Code**: ~6000+
- **Components**: 15+
- **Pages**: 12+
- **Services**: 5

## 🚦 Next Steps

### Immediate Tasks
1. ✅ Frontend is complete and ready
2. ⏳ Develop backend API (Node.js + Express + MongoDB)
3. ⏳ Implement CV upload to Cloudinary
4. ⏳ Set up authentication with JWT
5. ⏳ Connect all API endpoints

### Phase 2 (AI Features)
6. ⏳ Develop AI Ranking Engine
7. ⏳ Implement CV Validation Engine
8. ⏳ Integrate Gemini and DeepSeek APIs
9. ⏳ Add analytics dashboard

### Phase 3 (Advanced Features)
10. ⏳ Admin portal
11. ⏳ Interview scheduling with email automation
12. ⏳ Real-time notifications
13. ⏳ Advanced analytics

## 📞 Support

For technical issues:
1. Check this guide first
2. Review the main README.md
3. Check browser console for errors
4. Review Network tab for API issues

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Created for**: IS 3920 - Individual Project on Business Solutions  
**University**: University of Moratuwa  
**Student**: Liyanagunawardhana L.U.  
**Date**: December 2025
