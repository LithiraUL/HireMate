/**
 * Shared state for AI Service Circuit Breaker
 * Prevents continuous API calls during outages or rate-limits.
 */

let aiDisabledUntil = 0;
const DISABLE_DURATION_MS = 1 * 60 * 1000; // 1 minute

const isAIAvailable = () => {
  return Date.now() > aiDisabledUntil;
};

const disableAITemporarily = () => {
  const resumeTime = new Date(Date.now() + DISABLE_DURATION_MS);
  aiDisabledUntil = resumeTime.getTime();
  console.warn(`[CIRCUIT BREAKER] AI services temporarily disabled until ${resumeTime.toISOString()} due to API failures.`);
};

module.exports = {
  isAIAvailable,
  disableAITemporarily
};
