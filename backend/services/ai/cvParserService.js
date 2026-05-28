const { isAIAvailable, disableAITemporarily } = require('./aiCircuitBreaker');
const { logToDB } = require('../../utils/logger');
const { executeOllamaRequest, ollamaModel } = require('./ollamaHelper');

/**
 * AI Service for parsing candidate CVs and Resumes using local Ollama.
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

Return ONLY a valid JSON object matching this format:
{
  "skills": ["string"],
  "experienceYears": 0,
  "educationLevel": "string",
  "summary": "string"
}

Strict Rules:
- The return value MUST be pure parseable JSON. Do not include conversational intro/outro or markdown wrappers.

CV Text:
"""
${cvText}
"""
  `;

  // Default fallback schema
  const fallbackResponse = {
    skills: [],
    experienceYears: 0,
    educationLevel: '',
    summary: ''
  };

  try {
    if (!isAIAvailable()) {
      console.warn('[AI CV PARSER] Circuit breaker is active. Returning fallback schema.');
      return fallbackResponse;
    }

    logToDB('info', 'AI_CV_PARSER', `Initiating CV extraction via local Ollama model: ${ollamaModel}`);

    const parsedData = await executeOllamaRequest(
      [
        {
          role: 'user',
          content: prompt
        }
      ],
      true, // formatJson
      0.1,  // temperature
      'AI_TIMEOUT_PARSING'
    );
    
    logToDB('info', 'AI_CV_PARSER', 'CV extraction successful');

    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experienceYears: typeof parsedData.experienceYears === 'number' ? parsedData.experienceYears : 0,
      educationLevel: parsedData.educationLevel || '',
      summary: parsedData.summary || ''
    };

  } catch (error) {
    console.error('[AI SERVICE ERROR] Parsing CV:', error.message);
    
    logToDB('error', 'AI_CV_PARSER', 'Local Ollama CV Extraction Failed', error.message);
    
    // Disable AI temporarily only if it's not a model warmup timeout
    if (error.isWarmup) {
      console.log('[AI CV PARSER] Skipped circuit breaker activation: Local Ollama model may still be warming up.');
    } else {
      disableAITemporarily();
    }
    
    return fallbackResponse;
  }
};

module.exports = {
  parseCV
};
