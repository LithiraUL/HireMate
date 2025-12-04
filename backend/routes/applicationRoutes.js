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
      job: jobId,
      candidate: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id
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
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title description employmentType workMode salaryRange location status')
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

// @route   GET /api/applications/employer/applicants
// @desc    Get all unique candidates who applied to employer's jobs
// @access  Private (Employer only)
router.get('/employer/applicants', protect, authorize('employer'), async (req, res) => {
  try {
    const { status, skills, minAge, maxAge, employmentType, workMode } = req.query;

    // Get all jobs posted by this employer
    const employerJobs = await Job.find({ employer: req.user.id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        applicants: []
      });
    }

    // Build application filter
    const appFilter = { job: { $in: jobIds } };
    if (status) {
      appFilter.status = status;
    }

    // Get all applications for employer's jobs
    const applications = await Application.find(appFilter)
      .populate({
        path: 'candidate',
        select: 'name email age skills cvUrl githubUrl linkedinUrl jobPreferences'
      })
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    // Extract unique candidates with their application info
    const candidateMap = new Map();
    
    applications.forEach(app => {
      if (app.candidate) {
        const candidateId = app.candidate._id.toString();
        if (!candidateMap.has(candidateId)) {
          candidateMap.set(candidateId, {
            ...app.candidate.toObject(),
            applications: [],
            latestApplicationStatus: app.status,
            latestApplicationDate: app.createdAt
          });
        }
        candidateMap.get(candidateId).applications.push({
          _id: app._id,
          job: app.job,
          status: app.status,
          appliedAt: app.createdAt
        });
      }
    });

    let applicants = Array.from(candidateMap.values());

    // Apply additional filters
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      applicants = applicants.filter(candidate => 
        candidate.skills && candidate.skills.some(skill => 
          skillsArray.some(filterSkill => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    if (minAge) {
      applicants = applicants.filter(c => c.age && c.age >= parseInt(minAge));
    }

    if (maxAge) {
      applicants = applicants.filter(c => c.age && c.age <= parseInt(maxAge));
    }

    if (employmentType) {
      applicants = applicants.filter(c => 
        c.jobPreferences?.employmentType === employmentType ||
        c.jobPreferences?.employmentType === 'both'
      );
    }

    if (workMode) {
      applicants = applicants.filter(c => 
        c.jobPreferences?.workMode === workMode ||
        c.jobPreferences?.workMode === 'any'
      );
    }

    res.status(200).json({
      success: true,
      count: applicants.length,
      applicants
    });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applicants'
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
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email age skills cvUrl githubUrl linkedinUrl jobPreferences')
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

    const application = await Application.findById(req.params.id)
      .populate('job', 'employer');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the employer who owns the job
    if (application.job.employer.toString() !== req.user.id) {
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
      .populate('job')
      .populate('candidate', 'name email age skills cvUrl githubUrl linkedinUrl jobPreferences');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isCandidate = req.user.id === application.candidate._id.toString();
    const isEmployer = application.job.employer && req.user.id === application.job.employer.toString();

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
