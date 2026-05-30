const { normalizeSkillsArray } = require('../utils/skillNormalizer');
const { rankCandidateWithAI } = require('./ai/aiRankingService');
const { extractTextFromUrl } = require('../utils/cvTextExtractor');

/**
 * Calculates the percentage of overlap between candidate skills and job required skills.
 * 
 * @param {string[]} candidateSkills - Array of skills the candidate has.
 * @param {string[]} jobRequiredSkills - Array of skills required for the job.
 * @returns {number} The match percentage (0-100).
 */
const calculateSkillOverlap = (candidateSkills = [], jobRequiredSkills = []) => {
  // If no skills are required, it's considered a 100% match for skills
  if (!jobRequiredSkills || jobRequiredSkills.length === 0) {
    return 100;
  }

  // Normalize both arrays to handle case differences and aliases
  const normalizedCandidateSkills = normalizeSkillsArray(candidateSkills);
  const normalizedJobSkills = normalizeSkillsArray(jobRequiredSkills);

  let matchCount = 0;
  
  // Count how many required skills the candidate has
  normalizedJobSkills.forEach(skill => {
    if (normalizedCandidateSkills.includes(skill)) {
      matchCount++;
    }
  });

  // Calculate and return the percentage
  return Math.round((matchCount / normalizedJobSkills.length) * 100);
};

/**
 * Calculates preference match score based on employment type and work mode.
 * 
 * @param {Object} job - The job object containing employmentType and workMode.
 * @param {Object} candidate - The candidate object containing jobPreferences.
 * @returns {number} Score: 100 (both match), 50 (one matches), or 0 (none match).
 */
const calculatePreferenceOverlap = (job, candidate) => {
  if (!job || !candidate || !candidate.jobPreferences) return 0;

  const jobEmploymentType = job.employmentType;
  const jobWorkMode = job.workMode;

  const candidateEmploymentType = candidate.jobPreferences.employmentType;
  const candidateWorkMode = candidate.jobPreferences.workMode;

  let matches = 0;

  // Check employment type match
  // A match occurs if values are identical, if candidate accepts 'both', or if criteria is missing
  if (
    !jobEmploymentType || 
    !candidateEmploymentType || 
    candidateEmploymentType === 'both' || 
    jobEmploymentType === candidateEmploymentType
  ) {
    matches++;
  }

  // Check work mode match
  // A match occurs if values are identical, if candidate accepts 'any', or if criteria is missing
  if (
    !jobWorkMode || 
    !candidateWorkMode || 
    candidateWorkMode === 'any' || 
    jobWorkMode === candidateWorkMode
  ) {
    matches++;
  }

  if (matches === 2) return 100;
  if (matches === 1) return 50;
  return 0;
};

/**
 * Calculates age match score.
 * 
 * @param {Object} job - The job object containing ageRange.
 * @param {Object} candidate - The candidate object containing age.
 * @returns {number} Score: 100 (within range or no range specified), 0 (outside range).
 */
const calculateAgeOverlap = (job, candidate) => {
  // If the job has no age range restrictions, return 100
  if (!job || !job.ageRange || (!job.ageRange.min && !job.ageRange.max)) {
    return 100;
  }

  // If job has an age requirement but candidate has no age, it's not a match
  if (!candidate || !candidate.age) {
    return 0;
  }

  const age = candidate.age;
  const min = job.ageRange.min || 0;
  const max = job.ageRange.max || Infinity;

  if (age >= min && age <= max) {
    return 100;
  }

  return 0;
};

/**
 * Calculates experience match score based on years of experience.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @returns {number} Score: 0-100.
 */
const calculateExperienceOverlap = (job, candidate) => {
  const required = job.experienceRequired || 0;
  if (required === 0) return 100;

  const actual = candidate.experienceYears || 0;
  if (actual >= required) return 100;

  return Math.round((actual / required) * 100);
};

/**
 * Calculates education match score.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @returns {number} Score: 0-100.
 */
const calculateEducationOverlap = (job, candidate) => {
  // If the job does not explicitly require an education level, we grant full score
  if (!job.educationRequired) return 100;
  if (!candidate.educationLevel) return 0;
  
  const req = job.educationRequired.toLowerCase();
  const actual = candidate.educationLevel.toLowerCase();
  
  if (actual.includes(req) || req.includes(actual)) {
    return 100;
  }
  return 50; // Partial match if they have an education but it's not a direct substring match
};

/**
 * Calculates the overall compatibility score between a job and a candidate using a fallback algorithm.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @param {Object} [weights] - Optional dynamic weights.
 * @returns {number} The final compatibility score (0-100).
 */
const calculateCompatibilityOld = (job, candidate, weights = null) => {
  if (!job || !candidate) return 0;

  // Merge raw profile skills and AI extracted skills
  const combinedSkills = [...new Set([...(candidate.skills || []), ...(candidate.extractedSkills || [])])];

  // 1. Calculate individual scores
  const skillScore = calculateSkillOverlap(combinedSkills, job.requiredSkills);
  const experienceScore = calculateExperienceOverlap(job, candidate);
  const educationScore = calculateEducationOverlap(job, candidate);
  const preferenceScore = calculatePreferenceOverlap(job, candidate);
  const ageScore = calculateAgeOverlap(job, candidate);

  // 2. Resolve weights: default to 40/25/15/10/10, dynamic override, auto-normalize if total !== 100
  let w = {
    skills: 40,
    experience: 25,
    preferences: 15,
    education: 10,
    age: 10
  };

  if (weights && typeof weights === 'object') {
    w = {
      skills: typeof weights.skills === 'number' ? weights.skills : 40,
      experience: typeof weights.experience === 'number' ? weights.experience : 25,
      preferences: typeof weights.preferences === 'number' ? weights.preferences : 15,
      education: typeof weights.education === 'number' ? weights.education : 10,
      age: typeof weights.age === 'number' ? weights.age : 10
    };

    const total = w.skills + w.experience + w.preferences + w.education + w.age;
    if (total !== 100 && total > 0) {
      w.skills = (w.skills / total) * 100;
      w.experience = (w.experience / total) * 100;
      w.preferences = (w.preferences / total) * 100;
      w.education = (w.education / total) * 100;
      w.age = (w.age / total) * 100;
    }
  }

  // 3. Apply weights (divided by 100)
  const finalScore = 
    (skillScore * (w.skills / 100)) + 
    (experienceScore * (w.experience / 100)) + 
    (educationScore * (w.education / 100)) + 
    (preferenceScore * (w.preferences / 100)) + 
    (ageScore * (w.age / 100));

  return Math.round(finalScore);
};

/**
 * Helper to compute and return a standard fallback evaluation response.
 */
const useFallbackScoring = (job, candidate, weights = null) => {
  const fallbackScore = calculateCompatibilityOld(job, candidate, weights);
  const recommendation = fallbackScore >= 80 ? 'Strong Match' : (fallbackScore >= 50 ? 'Moderate Match' : 'Weak Match');
  
  return {
    score: fallbackScore,
    strengths: ["Standard profile match evaluated by fallback engine."],
    weaknesses: [],
    summary: `AI service is currently offline. Compatibility score calculated via secondary fallback algorithm: ${fallbackScore}%.`,
    recommendation: recommendation
  };
};

/**
 * Calculates the overall compatibility between a job and a candidate using AI ranking.
 * If the AI ranking service is unavailable, it automatically drops back to the traditional weighted scoring model.
 * 
 * @param {Object} job - The job object.
 * @param {Object} candidate - The candidate object.
 * @param {Object} [weights] - Optional dynamic weights.
 * @returns {Promise<Object>} An object containing the score, strengths, weaknesses, summary, and recommendation.
 */
const calculateCompatibility = async (job, candidate, weights = null) => {
  if (!job || !candidate) {
    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      summary: "Missing job or candidate profile information.",
      recommendation: "Weak Match"
    };
  }

  try {
    // 1. Extract CV Text from URL if available
    let cvText = '';
    if (candidate.cvUrl) {
      try {
        console.log(`[COMPATIBILITY ENGINE] Extracting text for candidate: ${candidate.name || 'N/A'} from CV URL: ${candidate.cvUrl}`);
        cvText = await extractTextFromUrl(candidate.cvUrl);
      } catch (extractionError) {
        console.error('[COMPATIBILITY ENGINE] CV Extraction failed:', extractionError.message);
      }
    }

    // 2. Call AI Ranking Service
    const aiResult = await rankCandidateWithAI(candidate, cvText, job);

    // 3. Validate AI outcome, drop to traditional model if fallback response detected
    if (!aiResult || aiResult.score === 0 || aiResult.summary.includes('unavailable')) {
      console.log('[COMPATIBILITY ENGINE] AI evaluation was unavailable or returned default score. Activating traditional fallback scoring...');
      return useFallbackScoring(job, candidate, weights);
    }

    console.log(`[COMPATIBILITY ENGINE] DeepSeek AI evaluation succeeded for ${candidate.name || 'candidate'}. Score: ${aiResult.score}`);
    return aiResult;

  } catch (error) {
    console.error('[COMPATIBILITY ENGINE] Error during AI ranking execution. Falling back to traditional scoring:', error.message);
    return useFallbackScoring(job, candidate, weights);
  }
};

module.exports = {
  calculateSkillOverlap,
  calculatePreferenceOverlap,
  calculateAgeOverlap,
  calculateExperienceOverlap,
  calculateEducationOverlap,
  calculateCompatibilityOld,
  calculateCompatibility
};
