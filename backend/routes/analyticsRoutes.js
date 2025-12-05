const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Get hiring trends (applications over time)
// @route   GET /api/analytics/hiring-trends
// @access  Private (employer, admin)
router.get('/hiring-trends', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    console.log('Hiring trends endpoint hit by:', req.user.email, 'role:', req.user.role);
    const { period = '6months' } = req.query;
    
    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get applications grouped by month
    const applications = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $unwind: '$jobData'
      },
      ...(req.user.role === 'employer' 
        ? [{ $match: { 'jobData.employer': req.user._id } }]
        : []
      ),
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
          shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for frontend
    const trends = applications.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total,
      reviewed: item.reviewed,
      shortlisted: item.shortlisted,
      rejected: item.rejected
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching hiring trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get time-to-hire metrics
// @route   GET /api/analytics/time-to-hire
// @access  Private (employer, admin)
router.get('/time-to-hire', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    console.log('Time-to-hire endpoint hit by:', req.user.email, 'role:', req.user.role);
    const jobs = await Job.find(
      req.user.role === 'employer' 
        ? { employer: req.user._id, status: 'closed' }
        : { status: 'closed' }
    ).select('title createdAt updatedAt');

    const applications = await Application.find({
      job: { $in: jobs.map(j => j._id) },
      status: 'shortlisted'
    }).populate('job', 'title createdAt');

    // Calculate average time-to-hire for each job
    const metrics = jobs.map(job => {
      const jobApplications = applications.filter(
        app => app.job._id.toString() === job._id.toString()
      );

      if (jobApplications.length === 0) {
        return null;
      }

      const avgDays = jobApplications.reduce((sum, app) => {
        const days = Math.floor(
          (new Date(app.createdAt) - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / jobApplications.length;

      return {
        jobTitle: job.title,
        applicants: jobApplications.length,
        avgDays: Math.round(avgDays),
        postedDate: job.createdAt
      };
    }).filter(Boolean);

    // Calculate overall average
    const overallAvg = metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.avgDays, 0) / metrics.length)
      : 0;

    res.json({
      overallAverage: overallAvg,
      jobMetrics: metrics
    });
  } catch (error) {
    console.error('Error fetching time-to-hire:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get applicant demographics
// @route   GET /api/analytics/demographics
// @access  Private (employer, admin)
router.get('/demographics', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    console.log('Demographics endpoint hit by:', req.user.email, 'role:', req.user.role);
    // Get all applications for this employer
    const query = req.user.role === 'employer'
      ? [
          {
            $lookup: {
              from: 'jobs',
              localField: 'job',
              foreignField: '_id',
              as: 'jobData'
            }
          },
          {
            $unwind: '$jobData'
          },
          {
            $match: { 'jobData.employer': req.user._id }
          }
        ]
      : [];

    const applications = await Application.aggregate([
      ...query,
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidateData'
        }
      },
      {
        $unwind: '$candidateData'
      },
      {
        $project: {
          age: '$candidateData.age',
          skills: '$candidateData.skills',
          experience: '$candidateData.experience'
        }
      }
    ]);

    // Age distribution
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };

    applications.forEach(app => {
      const age = app.age;
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age > 55) ageGroups['55+']++;
    });

    // Skills distribution (top 10)
    const skillsCount = {};
    applications.forEach(app => {
      if (app.skills && Array.isArray(app.skills)) {
        app.skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Experience distribution
    const experienceLevels = {
      'Entry (0-2 years)': 0,
      'Mid (3-5 years)': 0,
      'Senior (6-10 years)': 0,
      'Expert (10+ years)': 0
    };

    applications.forEach(app => {
      const exp = app.experience || 0;
      if (exp >= 0 && exp <= 2) experienceLevels['Entry (0-2 years)']++;
      else if (exp >= 3 && exp <= 5) experienceLevels['Mid (3-5 years)']++;
      else if (exp >= 6 && exp <= 10) experienceLevels['Senior (6-10 years)']++;
      else if (exp > 10) experienceLevels['Expert (10+ years)']++;
    });

    res.json({
      totalApplicants: applications.length,
      ageDistribution: Object.entries(ageGroups).map(([range, count]) => ({ range, count })),
      topSkills,
      experienceDistribution: Object.entries(experienceLevels).map(([level, count]) => ({ level, count }))
    });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
