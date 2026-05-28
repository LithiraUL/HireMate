/**
 * Parses CV text to extract GitHub profiles, repositories, and portfolio/project links using regex.
 * 
 * @param {string} text - The raw text of the CV.
 * @returns {Object} An object containing parsed githubRepos, githubProfiles, and portfolios.
 */
const extractLinks = (text) => {
  if (!text) return { githubRepos: [], githubProfiles: [], portfolios: [] };

  // Match all HTTP/HTTPS links
  const urlRegex = /https?:\/\/[^\s"'<>\(\)]+/gi;
  const urls = text.match(urlRegex) || [];

  const githubRepos = [];
  const githubProfiles = [];
  const portfolios = [];

  const seen = new Set();

  urls.forEach(url => {
    // Clean trailing punctuation like periods or parentheses
    let cleanUrl = url.trim().replace(/[.,;:!)]$/, '');
    
    // Prevent duplicate processing
    const lowerUrl = cleanUrl.toLowerCase();
    if (seen.has(lowerUrl)) return;
    seen.add(lowerUrl);

    if (lowerUrl.includes('github.com')) {
      // Check if it matches github repo pattern: github.com/owner/repo
      const repoMatch = cleanUrl.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
      if (repoMatch) {
        const owner = repoMatch[1];
        const repo = repoMatch[2];
        const systemWords = ['features', 'pricing', 'about', 'join', 'contact', 'explore', 'orgs', 'marketplace', 'trending', 'settings', 'notifications', 'sponsors'];
        
        if (!systemWords.includes(owner.toLowerCase()) && !systemWords.includes(repo.toLowerCase())) {
          githubRepos.push({
            url: cleanUrl,
            owner,
            repo
          });
        }
      } else {
        // Check if it matches github profile: github.com/username
        const profileMatch = cleanUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
        if (profileMatch) {
          const username = profileMatch[1];
          const systemWords = ['features', 'pricing', 'about', 'join', 'contact', 'explore', 'orgs', 'marketplace', 'trending', 'settings', 'notifications', 'sponsors'];
          if (!systemWords.includes(username.toLowerCase())) {
            githubProfiles.push({
              url: cleanUrl,
              username
            });
          }
        }
      }
    } else {
      // Portfolio links (exclude known social media to reduce noise)
      const ignoredDomains = ['linkedin.com', 'twitter.com', 'facebook.com', 'instagram.com', 'youtube.com', 'medium.com', 'stackoverflow.com', 'npmtrends.com', 'yarnpkg.com', 'npmjs.com'];
      const hasIgnored = ignoredDomains.some(domain => lowerUrl.includes(domain));
      if (!hasIgnored) {
        portfolios.push(cleanUrl);
      }
    }
  });

  return {
    githubRepos,
    githubProfiles,
    portfolios
  };
};

module.exports = {
  extractLinks
};
