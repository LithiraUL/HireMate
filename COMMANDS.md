# HireMate - Developer Commands Reference

Quick reference for common development tasks.

## 📦 Installation

```powershell
# Install all dependencies
npm install

# Or use yarn
yarn install
```

## 🚀 Running the Application

```powershell
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run on different port
npm run dev -- -p 3001
```

## 🔍 Code Quality

```powershell
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

## 🧹 Cleanup

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Clear all caches and rebuild
Remove-Item -Recurse -Force .next, node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

## 🛠️ Troubleshooting

```powershell
# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000

# Kill process on port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0
```

## 📝 Git Commands

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Complete HireMate frontend implementation"

# Add remote repository
git remote add origin <your-repo-url>

# Push to GitHub
git push -u origin main
```

## 🌐 Deployment

### Deploy to Vercel

```powershell
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Environment Variables for Deployment

Add these in your hosting platform:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## 🔧 Development Tips

### View Build Output

```powershell
npm run build
```

Analyze the output for:
- Page sizes
- Build warnings
- Static vs Dynamic pages

### Check TypeScript Errors

```powershell
# Run TypeScript compiler
npx tsc --noEmit
```

### Analyze Bundle Size

```powershell
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js and run
ANALYZE=true npm run build
```

## 📊 Useful Commands

```powershell
# Count lines of code
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css | Get-Content | Measure-Object -Line

# Find specific text in files
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String -Pattern "YOUR_SEARCH_TERM"

# List all routes
Get-ChildItem -Path app -Recurse -Include page.tsx | Select-Object FullName
```

## 🧪 Testing URLs

After starting the dev server, test these URLs:

### Public Pages
- `http://localhost:3000` - Landing page
- `http://localhost:3000/login` - Login
- `http://localhost:3000/register` - Registration

### Candidate Portal
- `http://localhost:3000/candidate/dashboard`
- `http://localhost:3000/candidate/profile`
- `http://localhost:3000/candidate/jobs`
- `http://localhost:3000/candidate/applications`

### Employer Portal
- `http://localhost:3000/employer/dashboard`
- `http://localhost:3000/employer/post-job`
- `http://localhost:3000/employer/jobs`
- `http://localhost:3000/employer/candidates`

## 🔐 Environment Setup

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.hiremate.lk/api
```

## 📱 Testing Responsive Design

### Browser DevTools (F12)
1. Toggle Device Toolbar (Ctrl+Shift+M)
2. Test these sizes:
   - Mobile: 375px (iPhone SE)
   - Tablet: 768px (iPad)
   - Desktop: 1920px (Full HD)

### PowerShell Browser Launch

```powershell
# Open in default browser
Start-Process "http://localhost:3000"

# Open in Chrome
Start-Process chrome "http://localhost:3000"

# Open in Edge
Start-Process msedge "http://localhost:3000"
```

## 🎨 Tailwind CSS

### View Tailwind Configuration

```powershell
# Generate full config file
npx tailwindcss init --full
```

### Purge Unused CSS

Already configured in `tailwind.config.js`:
```javascript
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

## 🚨 Common Error Fixes

### Error: Cannot find module

```powershell
npm install
```

### Error: Port already in use

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
npm run dev
```

### Error: TypeScript errors

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Error: Styles not updating

```powershell
Remove-Item -Recurse -Force .next
# Then restart dev server
```

## 📦 Package Management

```powershell
# Check for outdated packages
npm outdated

# Update all packages (use with caution)
npm update

# Install specific version
npm install package@version

# Remove package
npm uninstall package-name
```

## 🔄 Quick Reset

If everything breaks, run this:

```powershell
# Complete reset
Remove-Item -Recurse -Force .next, node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

## 📈 Performance Optimization

```powershell
# Build and analyze
npm run build

# Check for unused dependencies
npx depcheck

# Optimize images (when you add images)
# Images in public/ folder are automatically optimized by Next.js
```

## 🎯 Quick Project Stats

```powershell
# Count files
(Get-ChildItem -Recurse -File | Measure-Object).Count

# Count TypeScript files
(Get-ChildItem -Recurse -Include *.tsx,*.ts | Measure-Object).Count

# Count lines in TypeScript files
(Get-ChildItem -Recurse -Include *.tsx,*.ts | Get-Content | Measure-Object -Line).Lines
```

## 💾 Backup Project

```powershell
# Create backup
$date = Get-Date -Format "yyyy-MM-dd"
Compress-Archive -Path . -DestinationPath "../HireMate-Backup-$date.zip"
```

## 🌟 Final Checklist Before Deployment

- [ ] Run `npm run build` successfully
- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Responsive design verified
- [ ] Cross-browser tested
- [ ] Git repository committed
- [ ] README updated
- [ ] Backend API connected

---

**Happy Coding! 🚀**

For more details, see:
- `README.md` - Project overview
- `GETTING_STARTED.md` - Setup guide
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
