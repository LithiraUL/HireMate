const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail, interviewInvitationEmail, interviewStatusEmail } = require('../config/nodemailer');

// @route   POST /api/interviews
// @desc    Schedule an interview (Employer only)
// @access  Private (Employer)
router.post('/', protect, authorize('employer'), async (req, res) => {
  try {
    const { applicationId, date, time, mode, meetingLink, location, notes } = req.body;

    // Validate required fields
    if (!applicationId || !date || !time || !mode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide applicationId, date, time, and mode'
      });
    }

    // Validate mode-specific fields
    if (mode === 'online' && !meetingLink) {
      return res.status(400).json({
        success: false,
        message: 'Meeting link is required for online interviews'
      });
    }

    if (mode === 'onsite' && !location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for onsite interviews'
      });
    }

    // Get application and verify ownership
    const application = await Application.findById(applicationId)
      .populate({
        path: 'job',
        select: 'title employer status location'
      })
      .populate({
        path: 'candidate',
        select: 'name email'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify employer owns the job
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interview for this application'
      });
    }

    // Check if interview already exists
    const existingInterview = await Interview.findOne({ applicationId });
    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: 'Interview already scheduled for this application'
      });
    }

    // Create interview
    const interview = await Interview.create({
      applicationId,
      jobId: application.job._id,
      candidateId: application.candidate._id,
      employerId: req.user.id,
      date,
      time,
      mode,
      meetingLink,
      location,
      notes,
      status: 'scheduled'
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'interview_scheduled'
    });

    // Send email notification to candidate
    const employer = await User.findById(req.user.id);
    const emailHtml = interviewInvitationEmail(
      application.candidate.name,
      employer.name,
      employer.companyName,
      {
        date,
        time,
        mode,
        meetingLink,
        location,
        notes
      }
    );

    await sendEmail({
      to: application.candidate.email,
      subject: `Interview Invitation from ${employer.companyName}`,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error scheduling interview'
    });
  }
});

// @route   GET /api/interviews/candidate
// @desc    Get candidate's interviews
// @access  Private (Candidate)
router.get('/candidate', protect, authorize('candidate'), async (req, res) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user.id })
      .populate('jobId')
      .populate('employerId', 'name companyName email contactNo')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    console.error('Get candidate interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews'
    });
  }
});

// @route   GET /api/interviews/employer
// @desc    Get employer's scheduled interviews
// @access  Private (Employer)
router.get('/employer', protect, authorize('employer'), async (req, res) => {
  try {
    const interviews = await Interview.find({ employerId: req.user.id })
      .populate('jobId')
      .populate('candidateId', 'name email skills age')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    console.error('Get employer interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews'
    });
  }
});

// @route   PUT /api/interviews/:id/status
// @desc    Update interview status (confirm/decline)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'declined', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('employerId');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check authorization
    const isCandidate = req.user.id === interview.candidateId._id.toString();
    const isEmployer = req.user.id === interview.employerId._id.toString();

    if (!isCandidate && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview'
      });
    }

    // Candidates can only confirm/decline, employers can cancel
    if (isCandidate && !['confirmed', 'declined'].includes(status)) {
      return res.status(403).json({
        success: false,
        message: 'Candidates can only confirm or decline interviews'
      });
    }

    interview.status = status;
    await interview.save();

    // Send email notification
    if (isCandidate && ['confirmed', 'declined'].includes(status)) {
      const emailHtml = interviewStatusEmail(
        interview.employerId.name,
        interview.candidateId.name,
        status,
        {
          date: interview.date,
          time: interview.time
        }
      );

      await sendEmail({
        to: interview.employerId.email,
        subject: `Interview ${status === 'confirmed' ? 'Confirmed' : 'Declined'} - ${interview.candidateId.name}`,
        html: emailHtml
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview status updated successfully',
      interview
    });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating interview status'
    });
  }
});

// @route   GET /api/interviews/:id
// @desc    Get interview by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'name email skills age cvUrl')
      .populate('employerId', 'name companyName email contactNo');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check authorization
    const isCandidate = req.user.id === interview.candidateId._id.toString();
    const isEmployer = req.user.id === interview.employerId._id.toString();

    if (!isCandidate && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this interview'
      });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview'
    });
  }
});

// @route   DELETE /api/interviews/:id
// @desc    Delete/cancel interview
// @access  Private (Employer only)
router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Verify employer owns this interview
    if (interview.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this interview'
      });
    }

    await interview.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully'
    });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling interview'
    });
  }
});

module.exports = router;
