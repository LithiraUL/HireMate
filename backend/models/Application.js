const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  coverLetter: {
    type: String
  },
  aiMatchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Index for filtering
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ candidate: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
