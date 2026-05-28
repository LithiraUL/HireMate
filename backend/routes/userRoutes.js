const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { parseCV } = require('../services/ai/cvParserService');
const { extractTextFromBuffer } = require('../utils/cvTextExtractor');
const crypto = require('crypto');
const { runEvidenceValidation } = require('../services/evidenceValidator');

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

    if (updates.skills) {
      const { normalizeSkillsArray } = require('../utils/skillNormalizer');
      updates.skills = normalizeSkillsArray(updates.skills);
    }

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

    // Extract text from the uploaded file buffer
    let cvText = '';
    try {
      cvText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } catch (parseError) {
      console.error('Error extracting text from CV:', parseError);
    }

    let aiUpdates = {};
    if (cvText && cvText.trim().length > 50) {
      try {
        console.log('Sending CV text to AI service for structured extraction...');
        const aiData = await parseCV(cvText);
        aiUpdates = {
          extractedSkills: aiData.skills || [],
          experienceYears: aiData.experienceYears || 0,
          educationLevel: aiData.educationLevel || '',
          aiSummary: aiData.summary || ''
        };
      } catch (aiError) {
        console.error('AI CV Parsing failed:', aiError.message);
      }
    }

    // Hash-based detection to run the Evidence Validation pipeline
    const newCvHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const existingUser = await User.findById(req.user.id);
    
    let evidenceUpdates = {};
    if (!existingUser.cvHash || existingUser.cvHash !== newCvHash) {
      console.log('[USER ROUTES] CV Hash changed or first upload. Triggering evidence validation pipeline...');
      try {
        // Build mock skills if they are not saved in database yet, so that validator knows candidate's focus
        const tempSkills = aiUpdates.extractedSkills && aiUpdates.extractedSkills.length > 0 
          ? aiUpdates.extractedSkills 
          : (existingUser.skills || []);
        
        const tempUser = {
          ...existingUser.toObject(),
          skills: tempSkills,
          aiSummary: aiUpdates.aiSummary || existingUser.aiSummary
        };
        
        const evidenceResult = await runEvidenceValidation(tempUser, cvText);
        
        evidenceUpdates = {
          cvHash: newCvHash,
          evidenceScore: evidenceResult.evidenceScore,
          evidenceBadge: evidenceResult.evidenceBadge,
          validationReport: evidenceResult.validationReport
        };
      } catch (evidenceError) {
        console.error('[USER ROUTES] CV Evidence Validation pipeline failed:', evidenceError.message);
      }
    } else {
      console.log('[USER ROUTES] CV Hash is unchanged. Skipping evidence validation pipeline.');
    }

    // Update user CV URL, successfully extracted AI data, and evidence validation stats
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      cvUrl: result.secure_url,
      cvPublicId: result.public_id,
      ...aiUpdates,
      ...evidenceUpdates
    }, { new: true });

    res.status(200).json({
      success: true,
      message: 'CV uploaded successfully. ' + (Object.keys(aiUpdates).length > 0 ? 'AI successfully extracted candidate profile data.' : 'AI parsing skipped or failed.'),
      url: result.secure_url,
      aiData: aiUpdates,
      evidenceData: {
        evidenceScore: updatedUser.evidenceScore,
        evidenceBadge: updatedUser.evidenceBadge
      }
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
      const { normalizeSkillsArray } = require('../utils/skillNormalizer');
      const skillsArray = normalizeSkillsArray(skills.split(','));
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

    // Lazy load and heal evidence badge fields for pre-existing candidates
    const { extractTextFromUrl } = require('../utils/cvTextExtractor');
    const processedCandidates = await Promise.all(
      candidates.map(async (c) => {
        if (c.role === 'candidate' && !c.evidenceBadge) {
          try {
            if (c.cvUrl) {
              console.log(`[USER ROUTES] Lazy-seeding evidence calculations for existing candidate: ${c.name}`);
              const cvText = await extractTextFromUrl(c.cvUrl);
              const evidence = await runEvidenceValidation(c, cvText);
              
              c.evidenceScore = evidence.evidenceScore;
              c.evidenceBadge = evidence.evidenceBadge;
              c.validationReport = evidence.validationReport;
              
              await User.findByIdAndUpdate(c._id, {
                evidenceScore: evidence.evidenceScore,
                evidenceBadge: evidence.evidenceBadge,
                validationReport: evidence.validationReport
              });
            } else {
              c.evidenceScore = 0;
              c.evidenceBadge = 'Insufficient Evidence Profile';
              await User.findByIdAndUpdate(c._id, {
                evidenceScore: 0,
                evidenceBadge: 'Insufficient Evidence Profile'
              });
            }
          } catch (lazyErr) {
            console.error(`[USER ROUTES] Lazy evidence seeding failed for candidate ${c.name}:`, lazyErr.message);
            // Fallback default so it doesn't crash search results
            c.evidenceScore = 0;
            c.evidenceBadge = 'Insufficient Evidence Profile';
          }
        }
        return c;
      })
    );

    res.status(200).json({
      success: true,
      count: processedCandidates.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      candidates: processedCandidates
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
    let user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Lazy load and heal evidence badge for pre-existing profile details view
    if (user.role === 'candidate' && !user.evidenceBadge) {
      try {
        const { extractTextFromUrl } = require('../utils/cvTextExtractor');
        if (user.cvUrl) {
          console.log(`[USER ROUTES] Lazy-seeding profile evidence for candidate: ${user.name}`);
          const cvText = await extractTextFromUrl(user.cvUrl);
          const evidence = await runEvidenceValidation(user, cvText);
          
          user = await User.findByIdAndUpdate(user._id, {
            evidenceScore: evidence.evidenceScore,
            evidenceBadge: evidence.evidenceBadge,
            validationReport: evidence.validationReport
          }, { new: true }).select('-password');
        } else {
          user = await User.findByIdAndUpdate(user._id, {
            evidenceScore: 0,
            evidenceBadge: 'Insufficient Evidence Profile'
          }, { new: true }).select('-password');
        }
      } catch (lazyErr) {
        console.error(`[USER ROUTES] Lazy profile details evidence seeding failed for: ${user.name}:`, lazyErr.message);
      }
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
