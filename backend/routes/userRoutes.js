const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = req.user.role === 'candidate' 
      ? ['name', 'age', 'skills', 'githubUrl', 'linkedinUrl', 'portfolioUrl', 'jobPreferences', 'cvUrl']
      : ['name', 'companyName', 'companyAddress', 'contactNo'];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
});

// @route   POST /api/users/upload-cv
// @desc    Upload CV to Cloudinary
// @access  Private (Candidate only)
router.post('/upload-cv', protect, authorize('candidate'), upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'File upload service is not configured. Please contact administrator.'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'hiremate/cvs',
          resource_type: req.file.mimetype === 'application/pdf' || 
                        req.file.mimetype.includes('document') ? 'raw' : 'auto',
          public_id: `cv_${req.user.id}_${Date.now()}`,
          access_mode: 'public'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Update user CV URL
    await User.findByIdAndUpdate(req.user.id, {
      cvUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: 'CV uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading CV'
    });
  }
});

// @route   GET /api/users/search
// @desc    Advanced candidate search (for employers)
// @access  Private (Employer only)
router.get('/search', protect, authorize('employer'), async (req, res) => {
  try {
    const {
      skills,
      minAge,
      maxAge,
      employmentType,
      workMode,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { role: 'candidate', isActive: true };

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArray };
    }

    // Filter by age range
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    // Filter by employment type
    if (employmentType) {
      filter['jobPreferences.employmentType'] = { $in: [employmentType, 'both'] };
    }

    // Filter by work mode
    if (workMode) {
      filter['jobPreferences.workMode'] = { $in: [workMode, 'any'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const candidates = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: candidates.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      candidates
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching candidates'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

module.exports = router;
