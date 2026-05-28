require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const User = require('./models/User');
const { rankCandidateWithAI } = require('./services/ai/aiRankingService');
const { extractTextFromUrl } = require('./utils/cvTextExtractor');

async function reEvaluateApplications() {
  console.log('Starting re-evaluation of applications that have fallback AI data...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Find applications that were saved with fallback evaluation text
    const fallbackApps = await Application.find({
      $or: [
        { aiSummary: /offline/i },
        { aiSummary: /fallback/i },
        { aiSummary: /unavailable/i },
        { aiSummary: /failed/i }
      ]
    });

    console.log(`Found ${fallbackApps.length} applications with fallback AI data.`);

    for (const app of fallbackApps) {
      console.log(`\nRe-evaluating Application ID: ${app._id}`);
      
      const candidate = await User.findById(app.candidate);
      const job = await Job.findById(app.job);

      if (!candidate || !job) {
        console.warn(`⚠️ Candidate or Job not found for Application ${app._id}. Skipping.`);
        continue;
      }

      console.log(`Candidate: ${candidate.name} | Job: ${job.title}`);

      // Extract CV text if a CV exists
      let cvText = '';
      if (candidate.cvUrl) {
        try {
          console.log(`[RE-EVALUATION] Extracting CV text from: ${candidate.cvUrl}`);
          cvText = await extractTextFromUrl(candidate.cvUrl);
        } catch (extractErr) {
          console.error('[RE-EVALUATION] CV Text extraction failed:', extractErr.message);
        }
      }

      console.log('[RE-EVALUATION] Calling DeepSeek AI for fresh screening...');
      const aiResult = await rankCandidateWithAI(candidate, cvText, job);

      if (aiResult && aiResult.score > 0 && !aiResult.summary.includes('unavailable')) {
        app.aiMatchScore = aiResult.score;
        app.aiScore = aiResult.score;
        app.aiSummary = aiResult.summary;
        app.aiStrengths = aiResult.strengths;
        app.aiWeaknesses = aiResult.weaknesses;
        app.aiRecommendation = aiResult.recommendation;

        await app.save();
        console.log(`✅ Successfully updated Application ${app._id} with fresh AI evaluation! Score: ${aiResult.score}%`);
      } else {
        console.error(`❌ Fresh evaluation for Application ${app._id} returned default or failed.`);
      }
    }

    console.log('\n🎉 Re-evaluation process completed!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during re-evaluation:', error.message);
  }
}

reEvaluateApplications();
