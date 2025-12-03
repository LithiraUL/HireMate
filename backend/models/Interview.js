const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide interview date']
  },
  time: {
    type: String,
    required: [true, 'Please provide interview time']
  },
  meetingLink: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'declined', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
