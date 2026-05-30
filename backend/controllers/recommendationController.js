const Job = require('../models/Job');
const User = require('../models/User');
const { 
  calculateCompatibility,
  calculateCompatibilityOld,
  calculateSkillOverlap,
  calculatePreferenceOverlap,
  calculateAgeOverlap,
  calculateExperienceOverlap,
  calculateEducationOverlap
} = require('../services/compatibilityEngine');
const { generateRankingExplanation } = require('../services/ai/rankingExplanationService');
/**
 * Get ranked list of candidates for a specific job based on compatibility score.
 * 
 * @param {Object} req - Express request object containing jobId in params.
 * @param {Object} res - Express response object.
 */
const getCompatibleCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.body.page || req.query.page, 10) || 1;
    const limit = parseInt(req.body.limit || req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Retrieve dynamic weights from request body
    const weights = req.body.weights || null;

    // 1. Fetch job from DB
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify user is an employer and owns the job
    if (req.user.role !== 'employer' || job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access recommendations for this job'
      });
    }

    // 2. Fetch candidates using pagination
    // Using .select('-password') to ensure passwords are never fetched or returned
    const filter = { role: 'candidate', isActive: true };
    const candidates = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments(filter);

    // 3. Loop through candidates and calculate base compatibility scores using traditional mathematical scoring
    const scoredCandidates = candidates.map((candidate) => {
      const combinedSkills = [...new Set([...(candidate.skills || []), ...(candidate.extractedSkills || [])])];
      
      const baseScore = calculateCompatibilityOld(job, candidate, weights);
      
      const breakdown = {
        skillScore: calculateSkillOverlap(combinedSkills, job.requiredSkills),
        experienceScore: calculateExperienceOverlap(job, candidate),
        educationScore: calculateEducationOverlap(job, candidate),
        preferenceScore: calculatePreferenceOverlap(job, candidate),
        ageScore: calculateAgeOverlap(job, candidate),
        finalScore: baseScore
      };
      
      return {
        ...candidate.toObject(),
        compatibilityScore: baseScore,
        _breakdown: breakdown
      };
    });

    // 4. Sort descending (highest score first)
    scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // 5. Tiered Evaluation: sequentially calculate premium AI screening for ONLY the top 5 candidates
    // to completely prevent concurrent local inference congestion and optimize page load speeds!
    const topCandidates = scoredCandidates.slice(0, 5);
    const remainingCandidates = scoredCandidates.slice(5);

    console.log(`[RECOMMENDATION PROCESS] Running premium sequential AI screening for top ${topCandidates.length} candidate(s)...`);

    const totalStartTime = Date.now();
    const finalizedTopCandidates = [];

    for (const candidate of topCandidates) {
      const candStartTime = Date.now();
      let aiResult;
      try {
        // Calls the local Ollama screening engine (which has fallback logic built-in)
        aiResult = await calculateCompatibility(job, candidate, weights);
      } catch (err) {
        console.error(`[RECOMMENDATION PROCESS] AI screening failed for candidate ${candidate.name}:`, err.message);
        aiResult = {
          score: candidate.compatibilityScore,
          strengths: ["Standard match evaluated by fallback engine."],
          weaknesses: [],
          summary: "Detailed AI screening was unavailable at this time.",
          recommendation: candidate.compatibilityScore >= 80 ? 'Strong Match' : (candidate.compatibilityScore >= 50 ? 'Moderate Match' : 'Weak Match')
        };
      }

      const candDuration = Date.now() - candStartTime;
      console.log(`[RECOMMENDATION PROCESS] Candidate ${candidate.name || 'N/A'} screened in ${candDuration}ms.`);

      finalizedTopCandidates.push({
        ...candidate,
        compatibilityScore: aiResult.score,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        summary: aiResult.summary,
        recommendation: aiResult.recommendation,
        aiExplanation: aiResult.summary
      });
    }

    const totalDuration = Date.now() - totalStartTime;
    console.log(`[RECOMMENDATION PROCESS] Total sequential AI screening completed in ${totalDuration}ms.`);

    if (totalDuration > 180000) {
      console.warn(`[RECOMMENDATION PROCESS WARNING] Sequential screening duration (${totalDuration}ms) exceeded 3 minutes!`);
    }

    // Populate fallback details for remaining pool candidates
    const finalizedRemainingCandidates = remainingCandidates.map((candidate) => {
      const rec = candidate.compatibilityScore >= 80 ? 'Strong Match' : (candidate.compatibilityScore >= 50 ? 'Moderate Match' : 'Weak Match');
      return {
        ...candidate,
        strengths: ["Profile matched via traditional search filters."],
        weaknesses: [],
        summary: "Profile details are available on candidate card.",
        recommendation: rec,
        aiExplanation: `Traditional overlap score: ${candidate.compatibilityScore}%. Detailed AI screening is reserved for top 5 matching candidates.`
      };
    });

    const combinedFinalized = [...finalizedTopCandidates, ...finalizedRemainingCandidates];

    // Re-sort the combined list based on finalized compatibility scores (AI or traditional fallback)
    combinedFinalized.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Assign absolute ranks
    const finalizedCandidates = combinedFinalized.map((candidate, index) => {
      const rank = skip + index + 1;
      delete candidate._breakdown; // Remove temporary breakdown data
      return {
        ...candidate,
        rank
      };
    });

    // 6. Return ranked and paginated list
    res.status(200).json({
      success: true,
      count: scoredCandidates.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      job: {
        id: job._id,
        title: job.title
      },
      candidates: finalizedCandidates
    });

  } catch (error) {
    console.error('Error generating candidate recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations. Please try again later.'
    });
  }
};

module.exports = {
  getCompatibleCandidates
};
