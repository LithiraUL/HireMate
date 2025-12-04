# Quick Setup Guide for HireMate Backend

## Prerequisites Checklist

- [ ] Node.js installed (v16 or higher)
- [ ] npm installed
- [ ] MongoDB installed (local) OR MongoDB Atlas account
- [ ] Cloudinary account created
- [ ] Gmail account with 2FA enabled

## Step-by-Step Setup

### 1. Install Dependencies (Already Done )

```bash
cd C:\Users\DELL\Desktop\HireMate\backend
npm install
```

### 2. Configure MongoDB

#### Option A: MongoDB Atlas (Recommended for beginners)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free Tier)
4. Click "Connect"  "Connect your application"
5. Copy the connection string
6. Open `.env` file and replace:
   ```
   
   ```

#### Option B: Local MongoDB

1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Keep default `.env` setting:
   ```
   
   ```

### 3. Generate JWT Secret

Generate a secure random string:

```bash
# PowerShell command to generate random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Update in `.env`:
```

```

### 4. Setup Cloudinary

1. Go to https://cloudinary.com/users/register/free
2. Create free account
3. After login, go to Dashboard
4. Copy these three values:
   - Cloud Name
   - API Key
   - API Secret

Update in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Setup Gmail SMTP

1. Enable 2-Factor Authentication:
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password

Update in `.env`:
```
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  (16 chars from Google)
```

### 6. Verify .env Configuration

Your `.env` should look like this (with real values):

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hiremate
JWT_SECRET=aB3xK9mP2nQ8rT5vY7wZ1cD4eF6gH0iJ
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijk-lmnopqr
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 7. Start the Backend Server

```bash
npm run dev
```

Expected output:
```
 Server running on port 5000
 Environment: development
 MongoDB connected successfully
```

### 8. Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "HireMate API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Common Setup Issues

###  MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- MongoDB Atlas: Check IP whitelist (add 0.0.0.0/0 for development)
- MongoDB Atlas: Verify username/password in connection string
- Local MongoDB: Ensure MongoDB service is running

###  Email Not Sending

**Error:** `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solutions:**
- Use App Password, NOT your regular Gmail password
- Ensure 2FA is enabled on your Google account
- Check EMAIL_USER matches the Gmail account

###  Cloudinary Upload Fails

**Error:** `Must supply cloud_name`

**Solutions:**
- Verify CLOUDINARY_CLOUD_NAME is set correctly
- Check API Key and API Secret match your dashboard
- Ensure no extra spaces in .env values

## Next Steps After Setup

1.  Backend server running on port 5000
2.  Test endpoints with Postman/Thunder Client
3.  Connect frontend to backend (update API URLs)
4.  Test registration and login flow
5.  Test CV upload functionality
6.  Test email notifications

## Testing Checklist

- [ ] Health endpoint responds: `GET http://localhost:5000/api/health`
- [ ] Register candidate: `POST http://localhost:5000/api/auth/register`
- [ ] Register employer: `POST http://localhost:5000/api/auth/register`
- [ ] Login: `POST http://localhost:5000/api/auth/login`
- [ ] Create job (employer): `POST http://localhost:5000/api/jobs`
- [ ] Get jobs: `GET http://localhost:5000/api/jobs`
- [ ] Apply to job (candidate): `POST http://localhost:5000/api/applications`
- [ ] Upload CV: `POST http://localhost:5000/api/users/upload-cv`

## Support Resources

- MongoDB Atlas Tutorial: https://docs.atlas.mongodb.com/getting-started/
- Cloudinary Docs: https://cloudinary.com/documentation
- NodeMailer Guide: https://nodemailer.com/about/
- JWT.io Debugger: https://jwt.io/

## Environment Status

Check this list to ensure everything is configured:

- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] `.env` file exists with all variables filled
- [ ] MongoDB connection string configured
- [ ] JWT_SECRET generated and set
- [ ] Cloudinary credentials added
- [ ] Gmail App Password added
- [ ] Server starts without errors
- [ ] Health endpoint accessible
