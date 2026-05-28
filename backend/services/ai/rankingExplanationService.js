const { isAIAvailable, disableAITemporarily } = require('./aiCircuitBreaker');
const { logToDB } = require('../../utils/logger');
const { executeOllamaRequest, ollamaModel } = require('./ollamaHelper');

/**
 * AI Service for generating human-readable explanations for candidate rankings using local Ollama.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @param {Object} scoreBreakdown - The detailed breakdown of scores.
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

  const fallbackText = "AI ranking temporarily unavailable. Manual evaluation is recommended.";

  try {
    if (!isAIAvailable()) {
      return fallbackText;
    }

    logToDB('info', 'AI_RANKING_EXPLANATION', `Initiating ranking explanation via local Ollama model: ${ollamaModel}`);

    const cleanContent = await executeOllamaRequest(
      [
        {
          role: 'user',
          content: prompt
        }
      ],
      false, // formatJson
      0.3,   // temperature
      'AI_TIMEOUT_RANKING'
    );

    logToDB('info', 'AI_RANKING_EXPLANATION', 'Ranking explanation generated successfully');

    return cleanContent.replace(/`/g, '').trim();

  } catch (error) {
    console.error('[AI SERVICE ERROR] Generating ranking explanation:', error.message);
    
    logToDB('error', 'AI_RANKING_EXPLANATION', 'Local Ollama Ranking Explanation Failed', error.message);
    
    // Disable AI temporarily only if it's not a model warmup timeout
    if (error.isWarmup) {
      console.log('[AI RANKING EXPLANATION] Skipped circuit breaker activation: Local Ollama model may still be warming up.');
    } else {
      disableAITemporarily();
    }
    
    return fallbackText;
  }
};

module.exports = {
  generateRankingExplanation
};
