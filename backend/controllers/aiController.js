const User = require('../models/User');
const { parseCV } = require('../services/ai/cvParserService');
const { extractTextFromUrl } = require('../utils/cvTextExtractor');

/**
 * Controller to trigger AI processing on an existing CV URL.
 * Flow: Receive CV URL -> Download -> Extract Text -> Send to AI -> Store Result
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const processCV = async (req, res) => {
  try {
    const { cvUrl, userId } = req.body;

    // Use provided userId or fallback to the currently authenticated user
    const targetUserId = userId || req.user.id;

    if (!cvUrl) {
      return res.status(400).json({
        success: false,
        message: 'cvUrl is required to process the CV'
      });
    }

    console.log(`Extracting text from CV: ${cvUrl}`);
    const cvText = await extractTextFromUrl(cvUrl);

    if (!cvText || cvText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Extracted text is too short or completely empty. Cannot process with AI.'
      });
    }

    console.log('Sending extracted text to AI Service...');

    // 3. Send text to AI
    const aiData = await parseCV(cvText);

    // 4. Store structured result in User model
    const updatedUser = await User.findByIdAndUpdate(targetUserId, {
      extractedSkills: aiData.skills || [],
      experienceYears: aiData.experienceYears || 0,
      educationLevel: aiData.educationLevel || '',
      aiSummary: aiData.summary || ''
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found to update profile data.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'CV processed successfully by AI',
      data: {
        extractedSkills: updatedUser.extractedSkills,
        experienceYears: updatedUser.experienceYears,
        educationLevel: updatedUser.educationLevel,
        aiSummary: updatedUser.aiSummary
      }
    });

  } catch (error) {
    console.error('Error in processCV:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process CV with AI',
      error: error.message
    });
  }
};

module.exports = {
  processCV
};
