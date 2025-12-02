# HireMate - Recruitment Management System

AI-powered recruitment management system for SMEs in Sri Lanka. A comprehensive platform that streamlines hiring processes with intelligent candidate matching, CV validation, and automated workflows.

## 🚀 Features

### For Candidates
- ✅ Create professional profiles and upload CVs (PDF/DOC/Image)
- ✅ Browse and search available jobs
- ✅ Apply for jobs with one click
- ✅ Track application status in real-time
- ✅ Manage interview invitations
- ✅ Set job preferences (full-time/part-time, onsite/remote/hybrid)
- ✅ Link GitHub and LinkedIn profiles for skill validation

### For Employers
- ✅ Post jobs with detailed requirements
- ✅ Search and filter candidates by skills, age, and preferences
- ✅ View AI-ranked candidate recommendations
- ✅ Schedule interviews with automated email notifications
- ✅ Track applications and manage hiring pipeline
- ✅ Access analytics dashboard

### For Administrators
- ✅ Manage all users (candidates, employers)
- ✅ Monitor system activity and logs
- ✅ Remove fraudulent accounts
- ✅ View platform statistics

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Icons** - Icon library
- **date-fns** - Date utilities

### Backend (To be integrated)
- **Node.js** with **Express.js**
- **MongoDB Atlas** - Database
- **Cloudinary** - File storage (CVs, images)
- **NodeMailer** - Email service
- **JWT** - Authentication

### AI Layer (Phase 2)
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
│   ├── candidate/               # Candidate portal pages
│   │   ├── dashboard/          # Candidate dashboard
│   │   ├── jobs/               # Browse jobs
│   │   ├── applications/       # View applications
│   │   └── profile/            # Profile management
│   ├── employer/                # Employer portal pages
│   │   ├── dashboard/          # Employer dashboard
│   │   ├── post-job/           # Create job postings
│   │   ├── jobs/               # Manage jobs
│   │   └── candidates/         # Search candidates
│   ├── admin/                   # Admin portal (to be implemented)
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── layout.tsx              # Root layout
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
- **Primary**: Blue (#0ea5e9) - Used for CTAs, links, and primary actions
- **Secondary**: Purple (#d946ef) - Accent color
- **Success**: Green - Positive actions/status
- **Warning**: Yellow - Pending/review status
- **Danger**: Red - Errors/rejections

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

### Phase 1 (Current) ✅
- [x] Project setup and configuration
- [x] Authentication system
- [x] Candidate portal (dashboard, profile, job browsing, applications)
- [x] Employer portal (dashboard, job posting, candidate search)
- [x] Reusable components library

### Phase 2 (Upcoming)
- [ ] Admin portal implementation
- [ ] AI Ranking Engine integration
- [ ] CV Validation Engine (GitHub/LinkedIn analysis)
- [ ] Interview scheduling with email automation
- [ ] Analytics dashboard
- [ ] Advanced search and filtering

### Phase 3 (Future)
- [ ] Real-time notifications
- [ ] Chat/messaging system
- [ ] Mobile app (React Native)
- [ ] Multi-language support

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
