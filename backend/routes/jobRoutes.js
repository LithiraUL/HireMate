const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail, jobInvitationEmail } = require('../config/nodemailer');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Employer only)
router.post('/', protect, authorize('employer'), async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      experienceRequired,
      jobType,
      employmentType,
      workMode,
      salaryRange,
      location,
      ageRange
    } = req.body;

    const job = await Job.create({
      employer: req.user.id,
      companyName: req.user.companyName,
      title,
      description,
      requiredSkills,
      experienceRequired,
      employmentType: employmentType || jobType,
      workMode,
      salaryRange,
      location,
      ageRange
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating job'
    });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      employmentType,
      workMode,
      skills,
      minExperience,
      maxExperience,
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};

    if (employmentType) filter.employmentType = employmentType;
    if (workMode) filter.workMode = workMode;
    if (status) filter.status = status;
    else filter.status = 'open'; // Default to open jobs

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.requiredSkills = { $in: skillsArray };
    }

    if (minExperience || maxExperience) {
      filter.experienceRequired = {};
      if (minExperience) filter.experienceRequired.$gte = parseInt(minExperience);
      if (maxExperience) filter.experienceRequired.$lte = parseInt(maxExperience);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(filter)
      .populate('employer', 'companyName companyAddress contactNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get all jobs posted by the logged-in employer
// @access  Private (Employer only)
router.get('/employer/my-jobs', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'companyName companyAddress contactNo email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Employer - job owner only)
router.put('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Employer - job owner only)
router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

// @route   POST /api/jobs/:jobId/invite
// @desc    Send job invitation to a candidate
// @access  Private (Employer only)
router.post('/:jobId/invite', protect, authorize('employer'), async (req, res) => {
  try {
    const { candidateId, positionTitle, message } = req.body;

    if (!candidateId || !positionTitle) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID and position title are required'
      });
    }

    // Get job details
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify employer owns the job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send invitations for this job'
      });
    }

    // Get candidate details
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get employer details
    const employer = await User.findById(req.user.id);

    // Prepare email content with specific job link
    const jobDetails = {
      title: positionTitle,
      message: message || '',
      applicationLink: `${process.env.FRONTEND_URL}/candidate/jobs?highlight=${job._id}`
    };

    const emailHtml = jobInvitationEmail(
      candidate.name,
      employer.name,
      employer.companyName,
      jobDetails
    );

    // Send email
    await sendEmail({
      to: candidate.email,
      subject: `${employer.companyName} invites you to apply: ${positionTitle}`,
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending invitation'
    });
  }
});

module.exports = router;
