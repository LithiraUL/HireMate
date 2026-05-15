const axios = require('axios');
const { isAIAvailable, disableAITemporarily } = require('./aiCircuitBreaker');
const { logToDB } = require('../../utils/logger');

/**
 * AI Service for generating human-readable explanations for candidate rankings.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @param {Object} scoreBreakdown - The detailed breakdown of scores { finalScore, skillScore, experienceScore, educationScore, preferenceScore, ageScore }
 * @returns {Promise<string>} A short, professional explanation of the candidate's fit.
 */
const generateRankingExplanation = async (job, candidate, scoreBreakdown) => {
  if (!job || !candidate || !scoreBreakdown) {
    throw new Error('Missing required data to generate explanation');
  }

  const prompt = `
    You are an expert HR assistant evaluating a candidate for a job.
    Write a brief, professional summary (maximum 2-3 sentences) explaining why this candidate received a final compatibility score of ${scoreBreakdown.finalScore}%.
    
    Context Data:
    - Job Title: ${job.title}
    - Candidate Name: ${candidate.name}
    - Skill Match Score: ${scoreBreakdown.skillScore}%
    - Experience Match Score: ${scoreBreakdown.experienceScore}%
    - Education Match Score: ${scoreBreakdown.educationScore}%
    - Preference Match Score: ${scoreBreakdown.preferenceScore}%
    
    Rules:
    - Translate the raw numbers into qualitative assessments (e.g., "strong alignment in skills", "lacks the required experience").
    - Do NOT explicitly state the raw percentages in your response.
    - Keep it strictly professional, concise, and objective.
    - Output ONLY the raw text explanation. No markdown, no JSON, no conversational filler.
  `;

  try {
    if (!isAIAvailable()) {
      return "AI ranking temporarily unavailable. Manual evaluation is recommended.";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return "AI ranking temporarily unavailable. Manual evaluation is recommended.";
    }

    logToDB('info', 'AI_RANKING_EXPLANATION', 'Initiating Gemini API call for ranking explanation');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Low variance for professional, factual tone
          maxOutputTokens: 150
        }
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000 // 8 second timeout to prevent stalling
      }
    );

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error('AI returned an empty response');
    }
    
    logToDB('info', 'AI_RANKING_EXPLANATION', 'Ranking explanation generated successfully');

    // Clean and sanitize the response so we don't expose raw AI artifacts
    return aiText.replace(/`/g, '').trim();

  } catch (error) {
    const errorMsg = error?.response?.data || error.message;
    console.error('[AI SERVICE ERROR] Generating ranking explanation:', errorMsg);
    
    logToDB('error', 'AI_RANKING_EXPLANATION', 'Gemini Ranking Explanation Failed', errorMsg);
    
    // Disable AI layer temporarily to prevent cascading failures
    disableAITemporarily();
    
    return "AI ranking temporarily unavailable. Manual evaluation is recommended.";
  }
};

module.exports = {
  generateRankingExplanation
};
