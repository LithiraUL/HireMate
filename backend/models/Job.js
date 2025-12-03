const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experienceRequired: {
    type: Number,
    default: 0,
    min: 0
  },
  ageRange: {
    min: {
      type: Number,
      default: 18
    },
    max: {
      type: Number,
      default: 65
    }
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  salaryRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'on-hold'],
    default: 'open'
  },
  deadline: {
    type: Date
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

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
