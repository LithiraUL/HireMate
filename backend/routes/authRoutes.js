const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { sendEmail, passwordResetEmail } = require('../config/nodemailer');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per window
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 forgot password requests per window
  message: {
    success: false,
    message: 'Too many password reset requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', upload.array('legalDocuments', 5), async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyAddress, contactNo, officialEmailDomain } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role: role || 'candidate'
    };

    // Add employer-specific fields
    if (role === 'employer') {
      if (!companyName || !companyAddress || !contactNo || !officialEmailDomain) {
        return res.status(400).json({
          success: false,
          message: 'Company details and official email domain are required for employers'
        });
      }
      userData.companyName = companyName;
      userData.companyAddress = companyAddress;
      userData.contactNo = contactNo;
      userData.officialEmailDomain = officialEmailDomain;
      userData.approvalStatus = 'pending';
      userData.isActive = false; // Cannot login until approved and verified

      // Handle document uploads
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'hiremate/company_docs',
                resource_type: 'raw'  // raw = publicly accessible; exempt from Cloudinary PDF delivery restriction
              },
              (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url, publicId: result.public_id });
              }
            );
            uploadStream.end(file.buffer);
          });
        });
        
        userData.legalDocuments = await Promise.all(uploadPromises);
      }
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: role === 'employer' ? 'Registration submitted successfully. Pending admin approval.' : 'User registered successfully',
        token: role === 'employer' ? null : token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...(user.role === 'employer' && {
            companyName: user.companyName,
            companyAddress: user.companyAddress,
            contactNo: user.contactNo,
            approvalStatus: user.approvalStatus
          })
        }
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      if (user.role === 'employer' && user.approvalStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your company registration is pending admin review. You will receive an email once approved.'
        });
      }
      if (user.role === 'employer' && user.approvalStatus === 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Please click the verification link sent to your official email to activate your account.'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'employer' && {
          companyName: user.companyName,
          companyAddress: user.companyAddress,
          contactNo: user.contactNo
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// @route   GET /api/auth/verify-company/:token
// @desc    Verify company email via link
// @access  Public
router.get('/verify-company/:token', async (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      role: 'employer'
    });

    if (!user) {
      // Check if a company with this token was already verified (token cleared)
      // We can't know which company it was, so just send a friendly HTML page
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification - HireMate</title>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="4;url=${FRONTEND}/login">
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f9ff; }
            .card { background: white; border-radius: 12px; padding: 2.5rem 3rem; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            h2 { color: #1e40af; margin: 0 0 0.75rem; }
            p { color: #6b7280; line-height: 1.6; }
            a { color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">ℹ️</div>
            <h2>Link Already Used</h2>
            <p>This verification link has already been used or has expired.</p>
            <p>If your account is already active, you can <a href="${FRONTEND}/login">log in here</a>.</p>
            <p style="font-size:0.85rem; color:#9ca3af">Redirecting in 4 seconds…</p>
          </div>
        </body>
        </html>
      `);
    }

    // Activate the account
    user.isActive = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to login with success flag
    return res.redirect(`${FRONTEND}/login?verified=true`);

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error - HireMate</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff1f2; }
          .card { background: white; border-radius: 12px; padding: 2.5rem 3rem; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; }
          h2 { color: #dc2626; }
          p { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size:3rem">⚠️</div>
          <h2>Something went wrong</h2>
          <p>We couldn't process your verification. Please contact support.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token and send email
// @access  Public
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email });

    // Mitigate email enumeration: return generic success regardless of user existence
    const genericResponse = {
      success: true,
      message: 'If an account exists, a reset link has been sent.'
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to database
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration to 15 minutes
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send reset email
    const emailHtml = passwordResetEmail(user.name, resetUrl);
    await sendEmail({
      to: user.email,
      subject: 'HireMate Password Reset Request',
      html: emailHtml
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const rawToken = req.params.token;
    if (!rawToken) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is required'
      });
    }

    // Hash incoming token to match with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Find user with matching token
    const user = await User.findOne({
      passwordResetToken: hashedToken
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Check if token has expired
    if (user.passwordResetExpires < Date.now()) {
      // Automatically clear expired reset token and save
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // This will trigger pre('save') bcrypt hashing middleware

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully reset.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;
