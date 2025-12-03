# HireMate Backend API

RESTful API for the HireMate recruitment management system built with Node.js, Express, and MongoDB.

## Features

-  User authentication with JWT
-  Role-based access control (Candidate, Employer, Admin)
-  Job posting and management
-  Application tracking
-  Interview scheduling with email notifications
-  CV upload with Cloudinary
-  Advanced candidate search
-  Email notifications with NodeMailer

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcryptjs
- **File Storage:** Cloudinary
- **Email Service:** NodeMailer (Gmail SMTP)
- **File Upload:** Multer

## Project Structure

```
backend/
 models/
    User.js           # User schema (candidates & employers)
    Job.js            # Job posting schema
    Application.js    # Application schema
    Interview.js      # Interview scheduling schema
 routes/
    authRoutes.js     # Authentication endpoints
    userRoutes.js     # User profile & CV upload
    jobRoutes.js      # Job CRUD operations
    applicationRoutes.js  # Application management
    interviewRoutes.js    # Interview scheduling
 middleware/
    auth.js           # JWT protection & authorization
 config/
    cloudinary.js     # Cloudinary configuration
    nodemailer.js     # Email service & templates
 server.js             # Express app entry point
 .env                  # Environment variables
 package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your credentials:

```env
# MongoDB (choose one):
MONGODB_URI=mongodb://localhost:27017/hiremate
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hiremate

# JWT Secret (generate a random string)
JWT_SECRET=your_strong_random_secret_key

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP (get app password from https://myaccount.google.com/apppasswords)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database will be created automatically on first connection

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist your IP address (0.0.0.0/0 for development)
5. Get connection string and update `.env`

### 4. Cloudinary Setup

1. Create free account at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Update `.env` file

### 5. Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this password in `.env` (not your regular Gmail password)

### 6. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `POST /api/users/upload-cv` - Upload CV (candidate only)
- `GET /api/users/search` - Search candidates (employer only)
- `GET /api/users/:id` - Get user by ID (protected)

### Jobs
- `POST /api/jobs` - Create job posting (employer only)
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Apply for job (candidate only)
- `GET /api/applications/candidate/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get job applicants (employer only)
- `PUT /api/applications/:id/status` - Update application status (employer only)
- `GET /api/applications/:id` - Get application details

### Interviews
- `POST /api/interviews` - Schedule interview (employer only)
- `GET /api/interviews/candidate` - Get candidate's interviews
- `GET /api/interviews/employer` - Get employer's interviews
- `PUT /api/interviews/:id/status` - Update interview status
- `GET /api/interviews/:id` - Get interview details
- `DELETE /api/interviews/:id` - Cancel interview (employer only)

## Testing the API

Use tools like Postman or Thunder Client:

1. **Register a candidate:**
```json
POST http://localhost:5000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "candidate",
  "age": 25,
  "skills": ["JavaScript", "React", "Node.js"]
}
```

2. **Login:**
```json
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```
Copy the `token` from response.

3. **Create job (as employer):**
```json
POST http://localhost:5000/api/jobs
Headers: { "Authorization": "Bearer <your_token>" }
{
  "title": "Frontend Developer",
  "company": "Tech Corp",
  "description": "Looking for React developer",
  "requiredSkills": ["React", "JavaScript"],
  "location": "Colombo",
  "workMode": "hybrid",
  "employmentType": "full-time",
  "salary": { "min": 50000, "max": 80000 }
}
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRE` | JWT expiration (e.g., "30d") | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `EMAIL_USER` | Gmail address | Yes |
| `EMAIL_PASSWORD` | Gmail app password | Yes |

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Success responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

## Security Features

- Password hashing with bcryptjs
- JWT authentication
- Role-based authorization
- CORS protection
- Environment variable protection
- File upload validation (size & type)
- Input sanitization

## Troubleshooting

**MongoDB connection error:**
- Check if MongoDB is running (local)
- Verify connection string (Atlas)
- Check firewall/network settings

**Email not sending:**
- Verify Gmail app password (not regular password)
- Check 2FA is enabled on Google account
- Verify EMAIL_USER and EMAIL_PASSWORD in .env

**Cloudinary upload fails:**
- Verify credentials in .env
- Check file size (max 10MB)
- Ensure file type is supported (PDF, DOC, DOCX, images)

**JWT errors:**
- Ensure JWT_SECRET is set in .env
- Check token format in Authorization header: `Bearer <token>`

## Next Steps

1. Configure all environment variables in `.env`
2. Start the backend server: `npm run dev`
3. Test endpoints using Postman
4. Connect frontend to backend API
5. Update frontend API URLs to `http://localhost:5000/api`

## Support

For issues or questions, refer to the main project documentation or create an issue in the GitHub repository.
