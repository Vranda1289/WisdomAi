import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

/**
 * Lazily initialize and return the GoogleGenAI instance
 * to avoid issues with ES module hoisting where process.env is read before dotenv.config() runs.
 */
const getAiClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not defined.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Sends the user's message to Gemini and returns only the generated text.
 * Prepends the system prompt if provided.
 * @param {string} userMessage 
 * @param {string} systemPrompt 
 * @returns {Promise<string>}
 */
export const generateResponse = async (userMessage, systemPrompt = '') => {
  const modelsToTry = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ].filter(Boolean);

  // Remove duplicates while preserving priority
  const candidateModels = Array.from(new Set(modelsToTry));

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const ai = getAiClient();

      let contents = userMessage;
      if (systemPrompt) {
        contents = `${systemPrompt}\n\n${userMessage}`;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Gemini generation with model ${modelName} failed, trying fallback if available...`);
    }
  }

  // Mask error details to avoid leakage in logs
  const apiKey = process.env.GEMINI_API_KEY || '';
  const safeErrorMessage = lastError?.message ? lastError.message.replace(apiKey, '[MASKED_KEY]') : 'Unknown API Error';
  console.error('All Gemini model candidates failed:', safeErrorMessage);
  throw new Error(safeErrorMessage);
};
