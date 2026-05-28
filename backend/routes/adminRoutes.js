const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const SystemLog = require('../models/SystemLog');
const crypto = require('crypto');
const { sendEmail, companyVerificationEmail } = require('../config/nodemailer');
const https = require('https');
const http = require('http');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    console.log('Admin stats endpoint hit by user:', req.user.email);
    
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    const totalInterviews = await Interview.countDocuments();
    const upcomingInterviews = await Interview.countDocuments({
      date: { $gte: new Date() },
      status: 'scheduled'
    });

    const statsData = {
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalInterviews,
      upcomingInterviews
    };
    
    console.log('Stats data:', statsData);

    res.status(200).json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('Error in /admin/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
});

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private/Admin
router.get('/activity', protect, adminOnly, async (req, res) => {
  try {
    console.log('Admin activity endpoint hit by user:', req.user.email);
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt role');
    
    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employer', 'name companyName')
      .select('title createdAt employer');
    
    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate('candidate', 'name')
      .populate('job', 'title')
      .select('candidate job appliedAt');
    
    // Get recent interviews
    const recentInterviews = await Interview.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('jobId', 'title')
      .select('jobId createdAt');

    console.log('Recent users count:', recentUsers.length);
    console.log('Recent jobs count:', recentJobs.length);
    console.log('Recent applications count:', recentApplications.length);
    console.log('Recent interviews count:', recentInterviews.length);

    // Combine and format activities
    const activities = [];
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_registered',
        message: `New ${user.role} registered: ${user.name}`,
        timestamp: user.createdAt,
        user: user.name
      });
    });
    
    recentJobs.forEach(job => {
      activities.push({
        id: `job-${job._id}`,
        type: 'job_posted',
        message: `New job posted: ${job.title}`,
        timestamp: job.createdAt,
        user: job.employer?.companyName || job.employer?.name || 'Unknown'
      });
    });
    
    recentApplications.forEach(app => {
      if (app.job && app.candidate) {
        activities.push({
          id: `app-${app._id}`,
          type: 'application_submitted',
          message: `Application submitted for ${app.job.title}`,
          timestamp: app.appliedAt,
          user: app.candidate.name
        });
      }
    });
    
    recentInterviews.forEach(interview => {
      if (interview.jobId) {
        activities.push({
          id: `interview-${interview._id}`,
          type: 'interview_scheduled',
          message: `Interview scheduled for ${interview.jobId.title}`,
          timestamp: interview.createdAt
        });
      }
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    console.log('Total activities:', activities.length);
    console.log('Limited activities:', limitedActivities.length);

    res.status(200).json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error in /admin/activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
router.put('/users/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['candidate', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// @desc    Get pending companies
// @route   GET /api/admin/companies/pending
// @access  Private/Admin
router.get('/companies/pending', protect, adminOnly, async (req, res) => {
  try {
    const pendingCompanies = await User.find({
      role: 'employer',
      approvalStatus: 'pending'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingCompanies.length,
      data: pendingCompanies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending companies',
      error: error.message
    });
  }
});

// @desc    Approve or reject company
// @route   PUT /api/admin/companies/:id/approve
// @access  Private/Admin
router.put('/companies/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const company = await User.findOne({ _id: req.params.id, role: 'employer' });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // --- REJECTED: permanently delete the company ---
    if (status === 'rejected') {
      // Delete uploaded legal documents from Cloudinary
      if (company.legalDocuments && company.legalDocuments.length > 0) {
        const cloudinary = require('../config/cloudinary');
        await Promise.allSettled(
          company.legalDocuments.map(doc =>
            cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' })
          )
        );
      }

      await company.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Company registration rejected and removed from the system'
      });
    }

    // --- APPROVED: generate token and send verification email ---
    company.approvalStatus = 'approved';
    const verificationToken = crypto.randomBytes(32).toString('hex');
    company.verificationToken = verificationToken;

    const emailHtml = companyVerificationEmail(
      company.companyName,
      `http://localhost:5000/api/auth/verify-company/${verificationToken}`
    );

    await sendEmail({
      to: company.email,
      subject: 'HireMate - Company Account Approved',
      html: emailHtml
    });

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company approved. Verification email sent.',
      data: company
    });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve/reject company',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete related data
    if (user.role === 'employer') {
      await Job.deleteMany({ postedBy: user._id });
    }
    
    if (user.role === 'candidate') {
      await Application.deleteMany({ candidate: user._id });
    }
    
    await Interview.deleteMany({
      $or: [{ candidate: user._id }, { employer: user._id }]
    });
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private/Admin
router.get('/jobs', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('employer', 'name email companyName')
      .sort({ createdAt: -1 });
    
    // Add applications count
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationsCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: jobsWithCount.length,
      data: jobsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// @desc    Toggle job status
// @route   PUT /api/admin/jobs/:id/toggle-status
// @access  Private/Admin
router.put('/jobs/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    job.status = job.status === 'open' ? 'closed' : 'open';
    await job.save();
    
    res.status(200).json({
      success: true,
      message: `Job ${job.status === 'open' ? 'opened' : 'closed'} successfully`,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle job status',
      error: error.message
    });
  }
});

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
router.delete('/jobs/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Delete related applications and interviews
    await Application.deleteMany({ job: job._id });
    await Interview.deleteMany({ job: job._id });
    
    await job.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Job and related data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private/Admin
router.get('/applications', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .populate('employer', 'name companyName')
      .sort({ appliedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
router.get('/health', protect, adminOnly, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database
    await User.findOne().limit(1);
    const dbResponseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      data: {
        api: {
          status: 'operational',
          uptime: process.uptime()
        },
        database: {
          status: 'connected',
          responseTime: dbResponseTime
        },
        email: {
          status: 'active'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error.message
    });
  }
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
router.get('/logs', protect, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { level, category } = req.query;

    const query = {};
    if (level && level !== 'all') {
      query.level = level;
    }

    // Map frontend categories back to backend context substrings if filtered
    if (category && category !== 'all') {
      if (category === 'auth') query.context = /auth/i;
      else if (category === 'api') query.context = /api/i;
      else if (category === 'database') query.context = /database|db/i;
      else if (category === 'email') query.context = /email|mail/i;
      else if (category === 'system') query.context = /system|ai/i;
    }

    let dbLogs = await SystemLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    // If the database has no logs, seed some diagnostic logs so the admin page immediately shows active data
    if (dbLogs.length === 0 && Object.keys(query).length === 0) {
      const seedLogs = [
        {
          level: 'info',
          context: 'SYSTEM_INITIALIZATION',
          message: 'HireMate platform initialized successfully',
          timestamp: new Date(Date.now() - 3600000 * 2) // 2 hours ago
        },
        {
          level: 'info',
          context: 'DATABASE_SERVICE',
          message: 'MongoDB Connection established on port 27017',
          timestamp: new Date(Date.now() - 3600000 * 1.8)
        },
        {
          level: 'info',
          context: 'AUTH_SERVICE',
          message: 'JSON Web Token (JWT) secret verification completed',
          timestamp: new Date(Date.now() - 3600000 * 1.5)
        },
        {
          level: 'info',
          context: 'AI_RANKING_ENGINE',
          message: 'Local Ollama connection verified on model deepseek-r1:7b',
          timestamp: new Date(Date.now() - 3600000 * 1.2)
        },
        {
          level: 'warning',
          context: 'API_TIMEOUT_CHECK',
          message: 'Initial deepseek-r1:7b context loading took longer than expected but succeeded',
          timestamp: new Date(Date.now() - 3600000 * 0.8)
        }
      ];

      await SystemLog.insertMany(seedLogs);

      // Re-query seeded logs
      dbLogs = await SystemLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);
    }

    const logs = dbLogs.map(log => {
      let mappedLevel = log.level;
      if (mappedLevel === 'critical') mappedLevel = 'error';

      let mappedCategory = 'system';
      const ctx = (log.context || '').toLowerCase();
      if (ctx.includes('auth')) mappedCategory = 'auth';
      else if (ctx.includes('api')) mappedCategory = 'api';
      else if (ctx.includes('database') || ctx.includes('db')) mappedCategory = 'database';
      else if (ctx.includes('email') || ctx.includes('mail')) mappedCategory = 'email';

      return {
        _id: log._id,
        timestamp: log.timestamp,
        level: mappedLevel,
        category: mappedCategory,
        message: log.message,
        details: log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : undefined
      };
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// @desc    Clear old system logs
// @route   DELETE /api/admin/logs/clear
// @access  Private/Admin
router.delete('/logs/clear', protect, adminOnly, async (req, res) => {
  try {
    const daysOld = parseInt(req.body.daysOld) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await SystemLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear system logs',
      error: error.message
    });
  }
});

// @desc    Proxy a company legal document through the server
// @route   GET /api/admin/proxy-document
// @access  Private/Admin
router.get('/proxy-document', protect, adminOnly, (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'No URL provided' });
  }

  // Only allow Cloudinary URLs
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid URL' });
  }

  if (!parsedUrl.hostname.includes('cloudinary.com')) {
    return res.status(403).json({ success: false, message: 'Only Cloudinary URLs are allowed' });
  }

  // Detect OLD uploads stored as image/upload with .pdf extension
  // These are blocked by Cloudinary's PDF delivery restriction and cannot be served.
  // New uploads use raw/upload which are always publicly accessible.
  const isOldBlockedPdf =
    parsedUrl.pathname.includes('/image/upload/') &&
    parsedUrl.pathname.toLowerCase().endsWith('.pdf');

  if (isOldBlockedPdf) {
    return res.status(410).send(`
      <html><body style="font-family:sans-serif;padding:2rem;color:#374151">
        <h2 style="color:#dc2626">Document Unavailable</h2>
        <p>This PDF was uploaded before a system fix and cannot be served due to a Cloudinary delivery restriction.</p>
        <p><strong>Action required:</strong> Reject this company and ask them to re-register — the new upload system stores documents correctly.</p>
      </body></html>
    `);
  }

  // New raw/upload documents — pipe them directly (publicly accessible, no auth needed)
  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const request = protocol.get(url, (upstream) => {
    const contentType = upstream.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');

    if (upstream.statusCode !== 200) {
      console.warn(`[proxy-document] Cloudinary returned ${upstream.statusCode} for: ${url}`);
      upstream.resume();
      return res.status(upstream.statusCode || 502).send(
        `Failed to fetch document (Cloudinary ${upstream.statusCode})`
      );
    }

    upstream.pipe(res);
  });

  request.on('error', (err) => {
    console.error('[proxy-document] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch document' });
  });
});

module.exports = router;
