const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true
  },
  context: {
    type: String,
    required: true // e.g., 'AI_CV_PARSER', 'AI_RANKING_EXPLANATION'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed 
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// TTL index to automatically clean up logs after 30 days
systemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
