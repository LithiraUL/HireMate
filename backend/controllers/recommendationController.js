const Job = require('../models/Job');
const User = require('../models/User');
const { 
  calculateCompatibility,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

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

    // 3. Loop through candidates, calculate scores, and store in array
    const scoredCandidates = candidates.map(candidate => {
      const combinedSkills = [...new Set([...(candidate.skills || []), ...(candidate.extractedSkills || [])])];
      
      const breakdown = {
        skillScore: calculateSkillOverlap(combinedSkills, job.requiredSkills),
        experienceScore: calculateExperienceOverlap(job, candidate),
        educationScore: calculateEducationOverlap(job, candidate),
        preferenceScore: calculatePreferenceOverlap(job, candidate),
        ageScore: calculateAgeOverlap(job, candidate),
        finalScore: calculateCompatibility(job, candidate)
      };
      
      return {
        ...candidate.toObject(),
        compatibilityScore: breakdown.finalScore,
        _breakdown: breakdown
      };
    });

    // 4. Sort descending (highest score first)
    scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // 5. Generate AI explanations and assign absolute ranks
    const finalizedCandidates = await Promise.all(
      scoredCandidates.map(async (candidate, index) => {
        const rank = skip + index + 1;
        const explanation = await generateRankingExplanation(job, candidate, candidate._breakdown);
        
        // Remove temporary breakdown data
        delete candidate._breakdown;
        
        return {
          ...candidate,
          rank,
          aiExplanation: explanation
        };
      })
    );

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
