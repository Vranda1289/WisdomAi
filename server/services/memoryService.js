import Memory from '../models/Memory.js';
import { extractMemory } from './memoryExtractor.js';
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
 * Calculates local Jaccard similarity between two strings based on token overlap.
 */
const getJaccardSimilarity = (str1, str2) => {
  const clean = str => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const words1 = new Set(clean(str1));
  const words2 = new Set(clean(str2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

/**
 * Double-checks semantic duplicate status of two memories using Gemini.
 */
const checkDuplicateWithGemini = async (existingMemoryContent, candidateMemoryContent) => {
  try {
    const ai = getAiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

    const systemPrompt = `You are a semantic memory deduplication helper for Wisdom AI.
Determine if the two statements refer to the same personal memory, preference, habit, career goal, or life event, such that they should be considered the same memory or one updates/reinforces the other.
Provide a JSON response containing:
1. "isMatch": true if they are semantically duplicate or one updates the other, false otherwise.
2. "mergedContent": if isMatch is true, provide the best consolidated phrasing for the memory (usually the candidate/newer information, or a merge of both), otherwise return empty string.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        isMatch: {
          type: 'BOOLEAN',
          description: 'True if Statement A and Statement B refer to the same concept/fact and should be merged/updated.'
        },
        mergedContent: {
          type: 'STRING',
          description: 'The updated or consolidated statement of the memory.'
        }
      },
      required: ['isMatch', 'mergedContent']
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Statement A: "${existingMemoryContent}"\nStatement B: "${candidateMemoryContent}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1
      }
    });

    if (!response || !response.text) return { isMatch: false, mergedContent: '' };
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error checking duplicate with Gemini:', error);
    return { isMatch: false, mergedContent: '' };
  }
};

/**
 * Detects if a candidate memory matches an existing memory for the user.
 * @param {string} userId 
 * @param {Object} candidateMemory 
 * @returns {Promise<Object|null>} The duplicate Memory document or null
 */
export const detectDuplicateMemory = async (userId, candidateMemory) => {
  const existing = await Memory.find({
    user: userId,
    category: candidateMemory.category,
    status: 'active'
  });

  for (const memory of existing) {
    const similarity = getJaccardSimilarity(memory.content, candidateMemory.content);
    
    // Very high local similarity -> direct duplicate match
    if (similarity >= 0.75) {
      return { memory, mergedContent: candidateMemory.content };
    }

    // Uncertain similarity -> Use Gemini for final decision
    if (similarity >= 0.3) {
      const result = await checkDuplicateWithGemini(memory.content, candidateMemory.content);
      if (result.isMatch) {
        return { memory, mergedContent: result.mergedContent || candidateMemory.content };
      }
    }
  }

  return null;
};

/**
 * Saves a new memory or updates a duplicate memory.
 * @param {string} userId 
 * @param {Object} candidateMemory 
 * @param {string} sourceMessage 
 * @returns {Promise<Document>} The saved/updated Memory document
 */
export const saveMemory = async (userId, candidateMemory, sourceMessage) => {
  const duplicateResult = await detectDuplicateMemory(userId, candidateMemory);

  if (duplicateResult) {
    const { memory, mergedContent } = duplicateResult;
    memory.mentionCount += 1;
    memory.content = mergedContent;
    memory.sourceMessage = sourceMessage;
    memory.lastReferenced = new Date();
    // Reinforcing memory can also increment confidence slightly if not already maximum (e.g. capped at 5)
    memory.confidence = Math.min((memory.confidence || 1) + 0.5, 5);
    return await memory.save();
  }

  const memory = new Memory({
    user: userId,
    category: candidateMemory.category,
    content: candidateMemory.content,
    importance: candidateMemory.importance,
    confidence: candidateMemory.confidence || 1,
    sourceMessage,
    whyRemembered: candidateMemory.whyRemembered,
    expiresAt: candidateMemory.expiresAt,
    status: 'active',
    lastReferenced: new Date()
  });

  return await memory.save();
};

/**
 * Updates an existing memory.
 */
export const updateMemory = async (memoryId, updates) => {
  return await Memory.findByIdAndUpdate(memoryId, updates, { new: true });
};

/**
 * Deletes an existing memory.
 */
export const deleteMemory = async (memoryId) => {
  return await Memory.findByIdAndDelete(memoryId);
};

/**
 * Gets all memories for a user.
 */
export const getUserMemories = async (userId) => {
  return await Memory.find({ user: userId }).sort({ lastReferenced: -1 });
};

/**
 * Retrieves relevant memories, filters expired ones, and sorts them.
 * Updates `lastReferenced` for retrieved memories.
 * @param {string} userId 
 * @param {string} currentMessage 
 * @returns {Promise<Array>} The top sorted memories
 */
export const findRelevantMemories = async (userId, currentMessage) => {
  const now = new Date();
  
  // Fetch active, non-expired memories
  const memories = await Memory.find({
    user: userId,
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  });

  if (memories.length === 0) {
    return [];
  }

  const importanceWeights = { high: 3, medium: 2, low: 1 };
  
  // Sort according to lastReferenced, importance, updatedAt, mentionCount
  memories.sort((a, b) => {
    const refDiff = new Date(b.lastReferenced) - new Date(a.lastReferenced);
    if (refDiff !== 0) return refDiff;

    const impDiff = importanceWeights[b.importance] - importanceWeights[a.importance];
    if (impDiff !== 0) return impDiff;

    const updDiff = new Date(b.updatedAt) - new Date(a.updatedAt);
    if (updDiff !== 0) return updDiff;

    return b.mentionCount - a.mentionCount;
  });

  // Limit to top 10 relevant memories
  const relevant = memories.slice(0, 10);

  if (relevant.length > 0) {
    const ids = relevant.map(m => m._id);
    await Memory.updateMany(
      { _id: { $in: ids } },
      { $set: { lastReferenced: new Date() } }
    );
  }

  return relevant;
};
