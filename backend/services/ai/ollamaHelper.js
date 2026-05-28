const axios = require('axios');

// Initialize Ollama configuration
const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';

console.log('Using local Ollama AI provider via Axios');

/**
 * Strips reasoning tokens (<think>...</think>) from Ollama DeepSeek outputs.
 * @param {string} content - Raw content from LLM.
 * @returns {string} Cleaned content.
 */
const stripThinkingBlock = (content) => {
  if (!content) return '';
  let clean = content.trim();
  if (clean.includes('</think>')) {
    clean = clean.split('</think>').pop().trim();
  }
  return clean;
};

/**
 * Parses and sanitizes JSON content with safeguards against markdown wrappers.
 * @param {string} rawContent - Raw text to parse.
 * @returns {Object} Parsed JSON object.
 */
const safeParseJson = (rawContent) => {
  let cleanContent = stripThinkingBlock(rawContent);
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleanContent);
};

/**
 * Centralized runner for local Ollama chat evaluations using Axios.
 * Implements timeout, thought block stripping, and optional JSON parsing.
 * 
 * @param {Array<Object>|string} messages - Array of message objects [{role, content}] or prompt string.
 * @param {boolean} formatJson - Whether strict JSON format is requested.
 * @param {number} temperature - Generation temperature.
 * @param {string} timeoutKey - Environmental timeout configuration target.
 * @returns {Promise<string|Object>} Clean string or parsed JSON object depending on formatJson.
 */
const executeOllamaRequest = async (messages, formatJson = false, temperature = 0.2, timeoutKey = 'AI_TIMEOUT_RANKING') => {
  let timeout = 120000; // Default timeout fallback to 120000ms (2 minutes)

  if (timeoutKey === 'AI_TIMEOUT_PARSING') {
    timeout = parseInt(process.env.AI_TIMEOUT_PARSING, 10) || 120000;
  } else if (timeoutKey === 'AI_TIMEOUT_RANKING') {
    timeout = parseInt(process.env.AI_TIMEOUT_RANKING, 10) || 120000;
  } else if (process.env.AI_TIMEOUT) {
    timeout = parseInt(process.env.AI_TIMEOUT, 10) || 120000;
  }

  // Convert messages to single structured prompt string for /api/generate
  let promptString = '';
  if (Array.isArray(messages)) {
    promptString = messages.map(m => {
      if (m.role === 'system') {
        return `Instruction:\n${m.content}`;
      }
      return `Input:\n${m.content}`;
    }).join('\n\n');
  } else if (typeof messages === 'string') {
    promptString = messages;
  }

  const payload = {
    model: ollamaModel,
    prompt: promptString,
    stream: false,
    options: {
      temperature: temperature,
      num_predict: 150 // Set output token limit to around 100-150 max
    }
  };

  const url = `${ollamaUrl}/api/generate`;

  const requestStartTime = new Date().toISOString();
  console.log(`[OLLAMA HELPER] Request start time: ${requestStartTime}`);
  console.log(`[OLLAMA HELPER] Target URL: ${url}`);
  console.log(`[OLLAMA HELPER] Model: ${ollamaModel}`);
  console.log(`[OLLAMA HELPER] Timeout Configured: ${timeout}ms`);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: timeout
    });

    const requestEndTime = new Date().toISOString();
    console.log(`[OLLAMA HELPER] Request end time: ${requestEndTime}`);
    console.log(`[OLLAMA HELPER] Response status: ${response.status}`);
    
    const responseBodyString = JSON.stringify(response.data || {});
    console.log(`[OLLAMA HELPER] Response body length: ${responseBodyString.length}`);

    const rawContent = response.data?.response;
    if (!rawContent) {
      throw new Error('Empty response field received from local Ollama generate API.');
    }

    if (formatJson) {
      return safeParseJson(rawContent);
    } else {
      return stripThinkingBlock(rawContent);
    }

  } catch (error) {
    const requestEndTime = new Date().toISOString();
    console.error(`[OLLAMA HELPER] Request failed at: ${requestEndTime}`);
    console.error(`[OLLAMA HELPER] Error Code: ${error.code || 'N/A'}`);
    console.error(`[OLLAMA HELPER] Error Message: ${error.message}`);
    
    // Attach isWarmup if timeout occurred
    if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
      error.isWarmup = true;
      console.warn('[OLLAMA HELPER] Local Ollama model may still be warming up');
    }

    throw error;
  }
};

/**
 * Standalone test function to send prompt "hello" and log raw Ollama response.
 */
const testOllamaConnection = async () => {
  console.log('[OLLAMA TEST] Running standalone testOllamaConnection...');
  try {
    const url = `${ollamaUrl}/api/generate`;
    const payload = {
      model: ollamaModel,
      prompt: 'hello',
      stream: false
    };

    console.log(`[OLLAMA TEST] Target URL: ${url}`);
    console.log(`[OLLAMA TEST] Payload:`, JSON.stringify(payload));

    const startTime = new Date().toISOString();
    console.log(`[OLLAMA TEST] Request start time: ${startTime}`);

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000
    });

    const endTime = new Date().toISOString();
    console.log(`[OLLAMA TEST] Request end time: ${endTime}`);
    console.log(`[OLLAMA TEST] Response status: ${response.status}`);
    console.log(`[OLLAMA TEST] Response body length: ${JSON.stringify(response.data || {}).length}`);
    console.log(`[OLLAMA TEST] Raw Ollama response field:`, response.data?.response);
  } catch (error) {
    console.error(`[OLLAMA TEST] Connection Failed:`, error.code || 'N/A', error.message);
  }
};

// Auto-run test if executed directly
if (require.main === module) {
  testOllamaConnection();
}

module.exports = {
  ollamaModel,
  ollamaUrl,
  stripThinkingBlock,
  safeParseJson,
  executeOllamaRequest,
  testOllamaConnection
};
