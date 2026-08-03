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
  try {
    const ai = getAiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

    let contents = userMessage;
    if (systemPrompt) {
      contents = `${systemPrompt}\n\n${userMessage}`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
    });

    if (!response || !response.text) {
      throw new Error('No text returned from Gemini API');
    }

    return response.text;
  } catch (error) {
    // Mask error details to avoid leakage in logs
    const apiKey = process.env.GEMINI_API_KEY || '';
    const safeErrorMessage = error.message ? error.message.replace(apiKey, '[MASKED_KEY]') : 'Unknown API Error';
    console.error('Gemini API Error:', safeErrorMessage);
    throw new Error(safeErrorMessage);
  }
};
