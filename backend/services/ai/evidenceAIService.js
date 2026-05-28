const { executeOllamaRequest } = require('./ollamaHelper');

/**
 * Validates candidate project evidence relevance and credibility using structured metadata.
 * 
 * @param {string} jobRole - The candidate's target job role.
 * @param {Array<Object>} repoMetadataList - List of repository structured metadata.
 * @returns {Promise<Object>} Object containing evidenceScore (0-100) and summary.
 */
const validateEvidenceWithAI = async (jobRole, repoMetadataList = []) => {
  try {
    if (!repoMetadataList || repoMetadataList.length === 0) {
      return {
        evidenceScore: 0,
        summary: 'No GitHub repositories were extracted for AI project relevance validation.'
      };
    }

    const formattedRepos = repoMetadataList.map(repo => {
      return `- Repo Name: ${repo.repoName}\n  Language: ${repo.language || 'Unknown'}\n  Stars: ${repo.stars}\n  Forks: ${repo.forks}\n  Last Commit: ${repo.lastCommitDaysAgo} days ago\n  Has Readme: ${repo.hasReadme}`;
    }).join('\n\n');

    const prompt = `Score this candidate's project evidence from 0-100 for the target job role: "${jobRole || 'Software Engineer'}" based strictly on the provided GitHub repositories metadata below. Do NOT perform full candidate ranking, evaluate only project credibility and relevance based on this metadata.

Input:
- Target Job Role: ${jobRole || 'Software Engineer'}
- Project Metadata:
${formattedRepos}

Return ONLY a JSON object:
{
  "evidenceScore": number,
  "summary": "short explanation of project credibility and relevance based on metadata"
}`;

    console.log(`[EVIDENCE AI SERVICE] Calling local Ollama model to evaluate ${repoMetadataList.length} repositories...`);
    const result = await executeOllamaRequest(prompt, true, 0.2, 'AI_TIMEOUT_PARSING');
    
    // Validate output structure
    if (result && typeof result.evidenceScore === 'number') {
      const score = Math.max(0, Math.min(100, Math.round(result.evidenceScore)));
      return {
        evidenceScore: score,
        summary: result.summary || 'AI project metadata evaluation completed.'
      };
    }

    throw new Error('LLM failed to return a structured JSON response matching the expected fields.');
  } catch (error) {
    console.error('[EVIDENCE AI SERVICE] Ollama evaluation failed:', error.message);
    return {
      evidenceScore: 50, // Moderate fallback score if Ollama is warming up or unavailable
      summary: `AI metadata validation failed or timed out (${error.message}). Reverted to baseline fallback relevance score.`
    };
  }
};

module.exports = {
  validateEvidenceWithAI
};
