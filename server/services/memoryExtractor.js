import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

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
 * Extracts memory information from a user message using Gemini with structured output.
 * @param {string} userMessage 
 * @returns {Promise<Object>} The extracted memory structure
 */
export const extractMemory = async (userMessage) => {
  try {
    const ai = getAiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const systemPrompt = `You are the memory extraction module of Wisdom AI. Your job is to analyze the user's message and determine if it contains meaningful long-term personal information to remember.
    
We only remember information that is useful for building a long-term understanding of the user.
Do NOT remember trivia queries, generic questions, short-term mundane logs (e.g. eating pizza, brushing teeth), or standard greetings/pleasantries.
If multiple candidate memories exist in the message, extract only the single most meaningful one.

Ensure you return a structured JSON response conforming strictly to the requested schema.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        shouldRemember: {
          type: 'BOOLEAN',
          description: 'True if the message contains meaningful long-term personal information. False otherwise.'
        },
        category: {
          type: 'STRING',
          enum: [
            'preference',
            'favorite',
            'goal',
            'career',
            'relationship',
            'personal',
            'personality',
            'identity',
            'habit',
            'study',
            'health',
            'milestone',
            'other'
          ],
          description: 'The category that best fits this memory.'
        },
        importance: {
          type: 'STRING',
          enum: ['low', 'medium', 'high'],
          description: 'Importance rating. Low for simple preferences/favorites. Medium for habits/goals/studies. High for life events, relationships, major fears, dreams, career milestones.'
        },
        content: {
          type: 'STRING',
          description: 'The core memory statement formulated clearly in the first-person (e.g., "I love Java", "My grandfather passed away", "I get anxious before interviews").'
        },
        whyRemembered: {
          type: 'STRING',
          description: 'A brief 2-5 word explanation of why this was remembered.'
        },
        expiresAt: {
          type: 'STRING',
          description: 'ISO 8601 DateTime string if this memory is temporary (e.g., exam date, upcoming trip date, etc.), otherwise return an empty string or omit.'
        }
      },
      required: ['shouldRemember', 'category', 'importance', 'content', 'whyRemembered']
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Message: "${userMessage}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1
      }
    });

    if (!response || !response.text) {
      throw new Error('No response returned from Gemini API');
    }

    const data = JSON.parse(response.text);
    return {
      shouldRemember: !!data.shouldRemember,
      category: data.category || 'other',
      importance: data.importance || 'low',
      content: data.content || '',
      whyRemembered: data.whyRemembered || '',
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    };
  } catch (error) {
    console.error('Error in extractMemory:', error);
    // Return safe fallback
    return {
      shouldRemember: false,
      category: 'other',
      importance: 'low',
      content: '',
      whyRemembered: '',
      expiresAt: null
    };
  }
};
