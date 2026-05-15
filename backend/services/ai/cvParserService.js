const axios = require('axios');
const { isAIAvailable, disableAITemporarily } = require('./aiCircuitBreaker');
const { logToDB } = require('../../utils/logger');

/**
 * AI Service for parsing candidate CVs and Resumes.
 * 
 * @param {string} cvText - The raw text extracted from a CV/Resume.
 * @returns {Promise<Object>} The parsed data structured as requested.
 */
const parseCV = async (cvText) => {
  if (!cvText) {
    throw new Error('CV text is required for parsing');
  }

  const prompt = `
Analyze the following CV text.

Extract:
- technical skills
- years of experience
- highest education level
- short professional summary

Return ONLY valid JSON.

Format:
{
  "skills": [],
  "experienceYears": 0,
  "educationLevel": "",
  "summary": ""
}

CV Text:
"""
${cvText}
"""
  `;

  try {
    if (!isAIAvailable()) {
      throw new Error('AI processing is temporarily disabled due to stability issues.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables');
    }

    logToDB('info', 'AI_CV_PARSER', 'Initiating Gemini API call for CV extraction');

    // Using Gemini 1.5 Flash for fast, structured text extraction
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1 // Low temperature for consistent extraction
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000 // 12 second timeout for parsing larger CVs
      }
    );

    const aiResponseText = response.data.candidates[0].content.parts[0].text;
    
    // Parse and sanitize the response to guarantee schema alignment
    const parsedData = JSON.parse(aiResponseText);
    
    logToDB('info', 'AI_CV_PARSER', 'CV extraction successful');

    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experienceYears: typeof parsedData.experienceYears === 'number' ? parsedData.experienceYears : 0,
      educationLevel: parsedData.educationLevel || '',
      summary: parsedData.summary || ''
    };

  } catch (error) {
    const errorMsg = error?.response?.data || error.message;
    console.error('[AI SERVICE ERROR] Parsing CV:', errorMsg);
    
    logToDB('error', 'AI_CV_PARSER', 'Gemini CV Extraction Failed', errorMsg);
    
    // Disable AI layer temporarily to prevent cascading failures
    disableAITemporarily();
    
    // Return empty/fallback schema rather than crashing the upload pipeline
    return {
      skills: [],
      experienceYears: 0,
      educationLevel: '',
      summary: ''
    };
  }
};

module.exports = {
  parseCV
};
