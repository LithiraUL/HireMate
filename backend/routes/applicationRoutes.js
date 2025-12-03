const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Candidate only)
router.post('/', protect, authorize('candidate'), async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      employerId: job.employerId
    });

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting application'
    });
  }
});

// @route   GET /api/applications/candidate/my-applications
// @desc    Get all applications by logged-in candidate
// @access  Private (Candidate only)
router.get('/candidate/my-applications', protect, authorize('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate('jobId', 'title description employmentType workMode salaryRange location status')
      .populate('employerId', 'companyName contactNo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Employer - job owner only)
router.get('/job/:jobId', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email age skills cvUrl githubUrl linkedinUrl jobPreferences')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer only)
router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the employer
    if (application.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'name email age skills cvUrl githubUrl linkedinUrl jobPreferences')
      .populate('employerId', 'companyName companyAddress contactNo');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isCandidate = req.user.id === application.candidateId._id.toString();
    const isEmployer = req.user.id === application.employerId._id.toString();

    if (!isCandidate && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application'
    });
  }
});

module.exports = router;
