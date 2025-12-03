const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    const totalInterviews = await Interview.countDocuments();
    const upcomingInterviews = await Interview.countDocuments({
      date: { $gte: new Date() },
      status: 'scheduled'
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        totalInterviews,
        upcomingInterviews
      }
    });
  } catch (error) {
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
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt role');
    
    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ postedAt: -1 })
      .limit(5)
      .populate('postedBy', 'name companyName')
      .select('title postedAt postedBy');
    
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
      .populate('job', 'title')
      .select('job createdAt');

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
        timestamp: job.postedAt,
        user: job.postedBy.companyName || job.postedBy.name
      });
    });
    
    recentApplications.forEach(app => {
      activities.push({
        id: `app-${app._id}`,
        type: 'application_submitted',
        message: `Application submitted for ${app.job.title}`,
        timestamp: app.appliedAt,
        user: app.candidate.name
      });
    });
    
    recentInterviews.forEach(interview => {
      activities.push({
        id: `interview-${interview._id}`,
        type: 'interview_scheduled',
        message: `Interview scheduled for ${interview.job.title}`,
        timestamp: interview.createdAt
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
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
      .populate('postedBy', 'name email companyName')
      .sort({ postedAt: -1 });
    
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
    
    job.status = job.status === 'active' ? 'inactive' : 'active';
    await job.save();
    
    res.status(200).json({
      success: true,
      message: `Job ${job.status === 'active' ? 'activated' : 'deactivated'} successfully`,
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

module.exports = router;
