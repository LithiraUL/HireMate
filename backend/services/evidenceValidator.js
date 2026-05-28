const axios = require('axios');
const { extractLinks } = require('../utils/cvLinkExtractor');
const { validateEvidenceWithAI } = require('./ai/evidenceAIService');

/**
 * Validates a candidate portfolio URL by verifying HTTP status and inspecting content body.
 * 
 * @param {string} url - The portfolio link to validate.
 * @returns {Promise<boolean>} True if URL is valid and contains meaningful content, false otherwise.
 */
const validatePortfolio = async (url) => {
  if (!url) return false;
  
  try {
    console.log(`[EVIDENCE VALIDATOR] Fetching portfolio content: ${url}`);
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn(`[EVIDENCE VALIDATOR] Portfolio URL returned status ${response.status}: ${url}`);
      return false;
    }

    const html = (response.data || '').toString();
    
    // 1. Check length (must be non-empty and at least 200 characters to exclude raw blank spaces)
    if (html.trim().length < 200) {
      console.warn(`[EVIDENCE VALIDATOR] Portfolio response body is too short: ${html.trim().length} characters.`);
      return false;
    }

    // 2. Check for meaningful HTML elements (headings, paragraphs, structures)
    const hasMeaningfulElements = /<h[1-6]|<p\b|<div\b|<section\b/i.test(html);
    if (!hasMeaningfulElements) {
      console.warn(`[EVIDENCE VALIDATOR] Portfolio response lacks common semantic HTML tags.`);
      return false;
    }

    // 3. Reject known placeholder templates and generic server defaults
    const boilerplatePhrases = [
      'welcome to nginx',
      'iis windows server',
      'apache2 ubuntu default page',
      'under construction',
      'site default',
      'create react app boilerplate',
      'index.html default template',
      'domain registered',
      'parking page'
    ];
    
    const lowerHtml = html.toLowerCase();
    const isBoilerplate = boilerplatePhrases.some(phrase => lowerHtml.includes(phrase));
    if (isBoilerplate) {
      console.warn(`[EVIDENCE VALIDATOR] Portfolio rejected as standard placeholder default page.`);
      return false;
    }

    console.log(`[EVIDENCE VALIDATOR] Portfolio validation succeeded for: ${url}`);
    return true;
  } catch (error) {
    console.warn(`[EVIDENCE VALIDATOR] Portfolio validation failed for ${url}:`, error.message);
    return false;
  }
};

/**
 * Validates a GitHub repository using the GitHub API.
 * 
 * @param {string} owner - The repo owner.
 * @param {string} repo - The repo name.
 * @returns {Promise<Object>} Object containing repo metadata and structure details.
 */
const validateGitHubRepo = async (owner, repo) => {
  const headers = {
    'User-Agent': 'HireMate-App',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const result = {
    repoName: `${owner}/${repo}`,
    stars: 0,
    forks: 0,
    language: 'Unknown',
    lastCommitDaysAgo: 365,
    hasReadme: false,
    hasConfig: false,
    exists: false
  };

  try {
    console.log(`[EVIDENCE VALIDATOR] Querying GitHub API for repository: ${owner}/${repo}`);
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers, timeout: 5000 });
    
    if (repoResponse.status === 200) {
      const data = repoResponse.data;
      result.exists = true;
      result.stars = data.stargazers_count || 0;
      result.forks = data.forks_count || 0;
      result.language = data.language || 'Unknown';
      
      if (data.pushed_at) {
        const pushedDate = new Date(data.pushed_at);
        const diffTime = Math.abs(new Date() - pushedDate);
        result.lastCommitDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    // Query repo root contents to check for README.md and standard config/dependency files
    console.log(`[EVIDENCE VALIDATOR] Querying repository root contents for structure checks: ${owner}/${repo}`);
    const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers, timeout: 5000 });
    
    if (contentsResponse.status === 200 && Array.isArray(contentsResponse.data)) {
      const files = contentsResponse.data;
      
      // Check for README
      result.hasReadme = files.some(file => /^readme(?:\.md)?$/i.test(file.name));
      
      // Check for standard configuration files mapping quality profiles
      const configFiles = [
        'package.json',
        'requirements.txt',
        'go.mod',
        'pom.xml',
        'cargo.toml',
        'gemfile',
        'composer.json',
        'build.gradle',
        'makefile',
        'dockerfile'
      ];
      
      result.hasConfig = files.some(file => configFiles.includes(file.name.toLowerCase()));
    }
  } catch (error) {
    console.warn(`[EVIDENCE VALIDATOR] GitHub API request failed for ${owner}/${repo}:`, error.message);
  }

  return result;
};

/**
 * Map dynamic score directly to the single source of truth badge levels.
 */
const getBadgeLevel = (score) => {
  if (score >= 80) return 'Strong Evidence Profile';
  if (score >= 60) return 'Moderate Evidence Profile';
  if (score >= 40) return 'Weak Evidence Profile';
  return 'Insufficient Evidence Profile';
};

/**
 * Runs the hybrid CV Evidence Validation pipeline on candidate CV text.
 * 
 * @param {Object} user - The candidate's Mongoose model instance.
 * @param {string} cvText - The extracted text content of the candidate's CV.
 * @returns {Promise<Object>} Object containing the calculated score, badge, and full report.
 */
const runEvidenceValidation = async (user, cvText) => {
  console.log(`[EVIDENCE VALIDATOR] Starting hybrid CV validation pipeline for candidate: ${user.name}`);

  // 1. Link parsing
  const links = extractLinks(cvText);
  console.log(`[EVIDENCE VALIDATOR] Extracted links:`, {
    reposCount: links.githubRepos.length,
    profilesCount: links.githubProfiles.length,
    portfoliosCount: links.portfolios.length
  });

  // 2. Deterministic Validation
  const repoReports = [];
  for (const repo of links.githubRepos.slice(0, 3)) { // Limit to top 3 repositories for validation speed
    const repoReport = await validateGitHubRepo(repo.owner, repo.repo);
    if (repoReport.exists) {
      repoReports.push(repoReport);
    }
  }

  let portfolioValid = false;
  let validatedPortfolioUrl = '';
  
  if (links.portfolios.length > 0) {
    validatedPortfolioUrl = links.portfolios[0]; // Validate primary portfolio url
    portfolioValid = await validatePortfolio(validatedPortfolioUrl);
  }

  // 3. AI Relevance scoring using local Ollama
  // Define job target role (infer from candidate skills or default)
  const candidateSkillsText = (user.skills && user.skills.length > 0) 
    ? user.skills.join(', ') 
    : 'Software Developer';
  const targetRole = user.aiSummary ? user.aiSummary.slice(0, 100) : candidateSkillsText;

  const aiResult = await validateEvidenceWithAI(targetRole, repoReports);
  console.log(`[EVIDENCE VALIDATOR] Ollama evaluation score: ${aiResult.evidenceScore}%`);

  // 4. Cumulative score calculation
  // Category A: GitHub Activity (40%)
  let githubActivityBase = 0;
  if (repoReports.length > 0) {
    // Average repository metrics across checked items
    let totalStars = 0;
    let totalForks = 0;
    let recencyScore = 0;
    
    repoReports.forEach(r => {
      totalStars += r.stars;
      totalForks += r.forks;
      
      if (r.lastCommitDaysAgo <= 30) recencyScore += 20;
      else if (r.lastCommitDaysAgo <= 90) recencyScore += 15;
      else if (r.lastCommitDaysAgo <= 180) recencyScore += 10;
      else recencyScore += 5;
    });

    const avgStars = totalStars / repoReports.length;
    const avgForks = totalForks / repoReports.length;
    const avgRecency = recencyScore / repoReports.length; // Out of 20

    const starPoints = Math.min(10, avgStars); // 1 pt per star up to 10
    const forkPoints = Math.min(10, avgForks * 2); // 2 pts per fork up to 10
    const rawActivityScore = starPoints + forkPoints + avgRecency; // Max 40 points
    
    githubActivityBase = Math.round((rawActivityScore / 40) * 100);
  }

  // Category B: Repository Structure & Quality (25%)
  let githubQualityBase = 0;
  if (repoReports.length > 0) {
    let readmeScore = 0;
    let configScore = 0;

    repoReports.forEach(r => {
      if (r.hasReadme) readmeScore += 15;
      if (r.hasConfig) configScore += 10;
    });

    const avgReadme = readmeScore / repoReports.length; // Out of 15
    const avgConfig = configScore / repoReports.length; // Out of 10
    const rawQualityScore = avgReadme + avgConfig; // Max 25 points

    githubQualityBase = Math.round((rawQualityScore / 25) * 100);
  }

  // Category C: AI Relevance assessment (25%)
  const aiRelevanceScore = aiResult.evidenceScore;

  // Category D: Portfolio Validity (10%)
  const portfolioScore = portfolioValid ? 100 : 0;

  // Combine and normalize score based on portfolio existence
  let finalScore = 0;
  const hasPortfolioLink = links.portfolios.length > 0;

  if (hasPortfolioLink) {
    // Normal calculation including portfolio weight (10%)
    finalScore = Math.round(
      (githubActivityBase * 0.40) +
      (githubQualityBase * 0.25) +
      (aiRelevanceScore * 0.25) +
      (portfolioScore * 0.10)
    );
  } else {
    // No portfolio URL is provided, distribute weight proportionally by dividing sum of the rest by 0.90
    const rawSum = 
      (githubActivityBase * 0.40) +
      (githubQualityBase * 0.25) +
      (aiRelevanceScore * 0.25);
    finalScore = Math.round(rawSum / 0.90);
  }

  finalScore = Math.max(0, Math.min(100, finalScore));
  let badgeLevel = getBadgeLevel(finalScore);

  // 5. Apply Admin Overrides (if set in database profile)
  let overrode = false;
  if (typeof user.adminOverrideEvidenceScore === 'number') {
    finalScore = user.adminOverrideEvidenceScore;
    badgeLevel = getBadgeLevel(finalScore);
    overrode = true;
    console.log(`[EVIDENCE VALIDATOR] Admin Override applied for Score: ${finalScore}%`);
  }
  if (user.adminOverrideEvidenceBadge) {
    badgeLevel = user.adminOverrideEvidenceBadge;
    overrode = true;
    console.log(`[EVIDENCE VALIDATOR] Admin Override applied for Badge: ${badgeLevel}`);
  }

  const validationReport = {
    evaluatedAt: new Date(),
    overrode,
    linksExtracted: {
      githubRepos: links.githubRepos.map(r => r.url),
      githubProfiles: links.githubProfiles.map(p => p.url),
      portfolios: links.portfolios
    },
    githubDetails: repoReports,
    portfolioDetails: {
      url: validatedPortfolioUrl,
      isValid: portfolioValid
    },
    scoresBreakdown: {
      githubActivity: githubActivityBase,
      githubQuality: githubQualityBase,
      aiRelevance: aiRelevanceScore,
      portfolioScore: hasPortfolioLink ? portfolioScore : null
    },
    aiSummary: aiResult.summary
  };

  console.log(`[EVIDENCE VALIDATOR] Cumulative score: ${finalScore}%, Badge Assigned: "${badgeLevel}"`);

  return {
    evidenceScore: finalScore,
    evidenceBadge: badgeLevel,
    validationReport
  };
};

module.exports = {
  validatePortfolio,
  validateGitHubRepo,
  runEvidenceValidation,
  getBadgeLevel
};
