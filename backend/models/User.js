const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'employer', 'admin'],
    default: 'candidate'
  },
  // Candidate-specific fields
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  skills: [{
    type: String,
    trim: true
  }],
  cvUrl: {
    type: String
  },
  cvPublicId: {
    type: String
  },
  githubUrl: {
    type: String
  },
  linkedinUrl: {
    type: String
  },
  jobPreferences: {
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'both'],
      default: 'both'
    },
    workMode: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid', 'any'],
      default: 'any'
    }
  },
  // Employer-specific fields
  companyName: {
    type: String,
    trim: true
  },
  companyAddress: {
    type: String,
    trim: true
  },
  contactNo: {
    type: String,
    trim: true
  },
  // Common fields
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
