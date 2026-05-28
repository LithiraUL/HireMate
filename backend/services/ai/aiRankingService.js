const { isAIAvailable, disableAITemporarily } = require('./aiCircuitBreaker');
const { logToDB } = require('../../utils/logger');
const { executeOllamaRequest, ollamaModel, ollamaUrl } = require('./ollamaHelper');

/**
 * Clean and truncate candidate CV text to a maximum of 1500 characters,
 * removing excessive whitespace.
 */
const cleanAndTruncateCv = (cvText) => {
  if (!cvText) return '';
  // Remove excessive whitespace, repeated lines, tabs
  let clean = cvText.replace(/\s+/g, ' ').trim();
  if (clean.length > 1500) {
    clean = clean.substring(0, 1500) + '... [TRUNCATED]';
  }
  return clean;
};

/**
 * Clean and truncate job description/details to a maximum of 1000 characters,
 * prioritizing only the required skills, responsibilities, and qualifications.
 */
const cleanAndTruncateJob = (job) => {
  if (!job) return '';
  const title = job.title || 'N/A';
  const skillsStr = Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '';
  const respStr = Array.isArray(job.responsibilities) ? job.responsibilities.join('. ') : '';
  const qualStr = Array.isArray(job.qualifications) ? job.qualifications.join('. ') : '';
  
  let formatted = `Role: ${title}\nRequired Skills: ${skillsStr}\nResponsibilities: ${respStr}\nQualifications: ${qualStr}`;
  if (formatted.length > 1000) {
    formatted = formatted.substring(0, 1000) + '... [TRUNCATED]';
  }
  return formatted;
};

/**
 * Pure LLM-based candidate ranking service using local Ollama (Llama model).
 * Evaluates a candidate against a job based on skills and experience match.
 * 
 * @param {Object} candidateProfile - The profile of the candidate.
 * @param {string} extractedCvText - Raw text content parsed from the CV/resume.
 * @param {Object} jobDetails - The details of the target job position.
 * @returns {Promise<Object>} A strict JSON structure containing matching insights.
 */
const rankCandidateWithAI = async (candidateProfile, extractedCvText, jobDetails) => {
  // Safe default fallback object in case of failure or disabled state
  const defaultResponse = {
    score: 0,
    strengths: [],
    weaknesses: [],
    summary: "AI candidate evaluation is currently unavailable. Using default compatibility fallback.",
    recommendation: "Weak Match"
  };

  // 1. Check Circuit Breaker Status
  if (!isAIAvailable()) {
    console.warn('[AI RANKING SERVICE] Circuit breaker active. Skipping Ollama call and returning safe fallback.');
    return defaultResponse;
  }

  console.log('[AI RANKING SERVICE] Initializing candidate evaluation...');
  console.log(`[AI RANKING SERVICE] Candidate Name: ${candidateProfile?.name || 'N/A'}`);
  console.log(`[AI RANKING SERVICE] Job Position: ${jobDetails?.title || 'N/A'}`);

  // 2. Perform prompt length and context payload optimizations
  const cleanCv = cleanAndTruncateCv(extractedCvText);
  const cleanJob = cleanAndTruncateJob(jobDetails);

  // 3. Construct minimized prompts
  const systemPrompt = `Score this candidate from 0-100 for the given job role based on skills and experience match. Return ONLY a JSON object:
{
  "score": number,
  "summary": "short summary"
}`;

  const userPrompt = `Evaluate candidate for job.
[Candidate Data]: ${JSON.stringify({ name: candidateProfile?.name, skills: candidateProfile?.skills, experienceYears: candidateProfile?.experienceYears, educationLevel: candidateProfile?.educationLevel }, null, 1)}
[CV Text]: ${cleanCv}
[Job Role]: ${cleanJob}`;

  const finalPromptLength = systemPrompt.length + userPrompt.length;
  const estimatedTokens = Math.round(finalPromptLength / 4);

  console.log(`[AI RANKING SERVICE] Final Prompt Character Count: ${finalPromptLength}`);
  console.log(`[AI RANKING SERVICE] Estimated Token Count: ~${estimatedTokens}`);

  // 4. Send API Call with custom timeout via Ollama helper
  await logToDB('info', 'AI_RANKING_SERVICE', `Initiating candidate ranking via local Ollama model: ${ollamaModel}`);

  console.log(`[AI RANKING SERVICE] Target Endpoint: ${ollamaUrl}`);
  console.log(`[AI RANKING SERVICE] Target Model: ${ollamaModel}`);

  try {
    const parsedResult = await executeOllamaRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // formatJson
      0.2,  // temperature
      'AI_TIMEOUT_RANKING'
    );

    // Double check properties are standardized and fit the expected API responses
    const finalResult = {
      score: typeof parsedResult.score === 'number' ? parsedResult.score : 0,
      strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
      weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [],
      summary: typeof parsedResult.summary === 'string' ? parsedResult.summary : '',
      recommendation: (parsedResult.score >= 80 ? 'Strong Match' : (parsedResult.score >= 50 ? 'Moderate Match' : 'Weak Match'))
    };

    console.log('[AI RANKING SERVICE] Evaluation Result Verified:', {
      score: finalResult.score,
      recommendation: finalResult.recommendation,
      strengthsCount: finalResult.strengths.length,
      weaknessesCount: finalResult.weaknesses.length
    });

    await logToDB('info', 'AI_RANKING_SERVICE', 'Candidate evaluation successfully calculated and finalized');

    return finalResult;

  } catch (error) {
    console.error('[AI RANKING SERVICE ERROR] Failed to rank candidate after all steps:', error.message);

    await logToDB('error', 'AI_RANKING_SERVICE', 'DeepSeek candidate ranking failed', error.message);

    // Activate circuit breaker only if it's not a model warmup timeout
    if (error.isWarmup) {
      console.log('[AI RANKING SERVICE] Skipped circuit breaker activation: Local Ollama model may still be warming up.');
    } else {
      disableAITemporarily();
    }

    return defaultResponse;
  }
};

module.exports = {
  rankCandidateWithAI
};
