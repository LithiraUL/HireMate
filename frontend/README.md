# HireMate - Recruitment Management System

AI-powered recruitment management system for SMEs in Sri Lanka. A comprehensive platform that streamlines hiring processes with intelligent candidate matching, CV validation, and automated workflows.

## 🚀 Features

### For Candidates
- ✅ Create professional profiles and upload CVs (PDF/DOC/Image via Cloudinary)
- ✅ Browse and search available jobs with advanced filtering
- ✅ Apply for jobs with one click
- ✅ Track application status in real-time (pending, reviewed, shortlisted, rejected)
- ✅ Manage interview invitations (confirm/decline with email notifications)
- ✅ Set job preferences (full-time/part-time, onsite/remote/hybrid)
- ✅ Receive personalized job invitations from employers
- ✅ Direct job access via email links with auto-login redirect

### For Employers
- ✅ Post jobs with detailed requirements (title, description, skills, salary range)
- ✅ Search and filter ALL candidates by skills, age, experience
- ✅ Send personalized job invitations with custom messages
- ✅ Schedule interviews with automated email notifications
- ✅ Track applications and manage hiring pipeline with status updates
- ✅ Access analytics dashboard (hiring trends, time-to-hire, demographics)
- ✅ Differentiated job management vs talent discovery pages

### For Administrators
- ✅ Manage all users (candidates, employers, admins)
- ✅ Monitor system activity and recent activity logs
- ✅ Moderate job postings and applications
- ✅ View comprehensive platform statistics (users, jobs, applications, interviews)
- ✅ System-wide monitoring and analytics

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **React Icons** - Icon library (Feather Icons)
- **Recharts** - Analytics charts and data visualization
- **React Hook Form** - Form management (planned)

### Backend (✅ Complete & Integrated)
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB Atlas** - Cloud database with Mongoose ODM
- **Cloudinary** - File storage (CVs, images)
- **NodeMailer** - Email service with HTML templates (Gmail SMTP)
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### AI Layer (Phase 2 - Planned)
- **Python** with **FastAPI**
- **Google Gemini API** - CV validation
- **DeepSeek API** - Code repository analysis
- **Hugging Face Transformers** - NLP models

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```powershell
   cd C:\Users\DELL\Desktop
   git clone <your-repo-url> HireMate
   cd HireMate
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure environment variables**
   
   Edit `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run the development server**
   ```powershell
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
HireMate/
├── app/                          # Next.js App Router pages
│   ├── candidate/               # Candidate portal (4 pages)
│   │   ├── dashboard/          # Dashboard with interviews & applications
│   │   ├── jobs/               # Browse & apply for jobs
│   │   ├── applications/       # Application history
│   │   └── profile/            # Profile & CV management
│   ├── employer/                # Employer portal (5 pages)
│   │   ├── dashboard/          # Overview & recent applications
│   │   ├── post-job/           # Create job postings
│   │   ├── jobs/               # Manage jobs & applicants
│   │   ├── candidates/         # Talent discovery & invitations
│   │   └── analytics/          # Hiring trends & metrics
│   ├── admin/                   # Admin portal (4 pages) ✅
│   │   ├── dashboard/          # System stats & activity
│   │   ├── users/              # User management
│   │   ├── jobs/               # Job moderation
│   │   └── logs/               # System logs
│   ├── login/                   # Login with role-based redirect
│   ├── register/                # Registration page
│   ├── about/                   # About page
│   ├── contact/                 # Contact form
│   ├── faq/                     # FAQ page
│   ├── privacy/                 # Privacy policy
│   ├── layout.tsx              # Root layout with Navbar
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                  # Reusable React components
│   ├── Navbar.tsx              # Navigation bar
│   ├── Footer.tsx              # Footer
│   ├── JobCard.tsx             # Job card component
│   ├── CandidateCard.tsx       # Candidate card
│   ├── Modal.tsx               # Modal dialog
│   └── Loading.tsx             # Loading spinner
├── context/                     # React Context providers
│   └── AuthContext.tsx         # Authentication context
├── lib/                         # Utility functions and services
│   ├── api.ts                  # Axios instance
│   ├── authService.ts          # Auth API calls
│   ├── jobService.ts           # Job API calls
│   ├── candidateService.ts     # Candidate API calls
│   ├── applicationService.ts   # Application API calls
│   └── interviewService.ts     # Interview API calls
├── types/                       # TypeScript type definitions
│   └── index.ts                # All type definitions
├── public/                      # Static assets
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Used for CTAs, links, success states, and primary actions
- **Secondary**: Gray - Neutral actions and decline states
- **Warning**: Yellow - Pending/review status
- **Danger**: Red - Errors/rejections
- **Info**: Light blue backgrounds for informational content

### Components
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-danger`
- **Inputs**: `.input-field`
- **Cards**: `.card`
- **Badges**: `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

## 🔐 Authentication Flow

1. User registers as **Candidate**, **Employer**, or **Admin**
2. JWT token generated upon successful login
3. Token stored in `localStorage`
4. Token sent with every API request via Axios interceptor
5. Protected routes redirect to login if unauthenticated

## 📱 Key User Flows

### Candidate Flow
1. Register → Create Profile → Upload CV
2. Browse Jobs → Apply for Job
3. Track Application Status → Receive Interview Invitation
4. Confirm/Decline Interview

### Employer Flow
1. Register → Complete Company Profile
2. Post Job → Review Applications
3. Filter Candidates → View AI Rankings (Phase 2)
4. Schedule Interview → Send Email Invitation

## 🚧 Development Roadmap

### Phase 1 ✅ COMPLETE
- [x] Project setup and configuration
- [x] Authentication system with JWT
- [x] Candidate portal (4 pages: dashboard, jobs, applications, profile)
- [x] Employer portal (5 pages: dashboard, jobs, post-job, candidates, analytics)
- [x] Admin portal (4 pages: dashboard, users, jobs, logs)
- [x] Interview scheduling with email automation (NodeMailer)
- [x] CV upload with Cloudinary integration
- [x] Analytics dashboard (hiring trends, time-to-hire, demographics)
- [x] Advanced search and filtering
- [x] Talent discovery and job invitations
- [x] Post-login redirect with preserved URLs
- [x] Salary range management (min/max)
- [x] Reusable components library

### Phase 2 (Upcoming)
- [ ] AI Ranking Engine integration
- [ ] CV Validation Engine (GitHub/LinkedIn analysis)
- [ ] Skill matching algorithms
- [ ] Automated candidate ranking

### Phase 3 (Future)
- [ ] Real-time notifications with WebSockets
- [ ] Chat/messaging system
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Video interview integration

## 🧪 Testing

```powershell
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## 📝 API Integration

The frontend is designed to work with a REST API backend. Update `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend server.

### Expected API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

**Jobs**
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

**Applications**
- `POST /api/applications` - Apply for job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for job
- `PUT /api/applications/:id` - Update application status

**Candidates**
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates/filter` - Filter candidates
- `POST /api/candidates/upload-cv` - Upload CV

## 🤝 Contributing

This is an academic project for IS 3920 - Individual Project on Business Solutions at the University of Moratuwa.

## 👨‍💻 Author

**Liyanagunawardhana L.U.**
- Student, Department of Interdisciplinary Studies
- Faculty of Information Technology
- University of Moratuwa

**Supervisors:**
- Ms. Wijetunge W.A.S.N. (Senior Lecturer)
- Mr. Avarjana Panditha (Doctoral Researcher - La Trobe University)

## 📄 License

This project is part of an academic submission. All rights reserved.

## 📞 Support

For issues and questions related to this project, please contact through the university portal.

---

**Note**: This is the frontend implementation. Backend API and AI services need to be developed separately according to the SRS specifications.
