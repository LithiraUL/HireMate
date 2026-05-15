const SystemLog = require('../models/SystemLog');

/**
 * Asynchronously logs system events and errors into the MongoDB database.
 * Designed to "fire and forget" so it doesn't block critical request paths.
 * 
 * @param {string} level - 'info', 'warning', 'error', 'critical'
 * @param {string} context - The subsystem generating the log (e.g. 'AI_CV_PARSER')
 * @param {string} message - A brief description of the event
 * @param {any} details - Optional detailed JSON/Error stack trace
 */
const logToDB = async (level, context, message, details = null) => {
  try {
    const logEntry = new SystemLog({
      level,
      context,
      message,
      details
    });
    
    // Save without awaiting, we just catch silent background errors
    logEntry.save().catch(err => {
      console.error(`[CRITICAL] MongoDB Logger Failed to Save:`, err.message);
    });
  } catch (error) {
    console.error(`[CRITICAL] MongoDB Logger Initialization Failed:`, error.message);
  }
};

module.exports = {
  logToDB
};
