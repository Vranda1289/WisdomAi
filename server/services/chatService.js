import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { generateResponse } from './geminiService.js';
import { preparePrompt } from './wisdomEngine/engine.js';
import { formatResponse } from './wisdomEngine/formatter.js';
import {
  detectAndUpdateRelationship,
  detectCurrentTone,
  generateAdaptivePromptDecorator
} from './wisdomEngine/adaptiveRelationshipLayer.js';
import * as memoryService from './memoryService.js';
import { extractMemory } from './memoryExtractor.js';


/**
 * Create a new empty conversation for a user
 * @param {string} userId 
 * @returns {Promise<Document>}
 */
export const createConversation = async (userId) => {
  const conversation = new Conversation({
    user: userId,
    messages: []
  });
  return await conversation.save();
};

/**
 * Get all conversations for a user, sorted by updatedAt descending
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getConversationsByUserId = async (userId) => {
  return await Conversation.find({ user: userId }).sort({ updatedAt: -1 });
};

/**
 * Get a single conversation by id, verifying owner
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<Document>}
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }
  if (conversation.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to access this conversation');
    error.statusCode = 403;
    throw error;
  }
  return conversation;
};

/**
 * Add a message to a conversation and get assistant response
 * @param {string} conversationId 
 * @param {string} userId 
 * @param {string} content 
 * @returns {Promise<Document>}
 */
export const addMessageToConversation = async (conversationId, userId, content) => {
  const conversation = await getConversationById(conversationId, userId);

  // Add user message
  conversation.messages.push({
    role: 'user',
    content: content,
    createdAt: new Date()
  });

  // Load user for adaptive relationship layer
  let user = null;
  let adaptiveDecorator = '';
  try {
    user = await User.findById(userId);
    if (user) {
      // 1. Detect and update relationship preferences / vocabulary / emoji mirroring
      await detectAndUpdateRelationship(user, content, conversation.messages);

      // 2. Detect emotional tone of the current message
      const tone = detectCurrentTone(content);

      // 3. Generate the custom system prompt decoration based on user profile + tone
      adaptiveDecorator = generateAdaptivePromptDecorator(user, tone);
    }
  } catch (err) {
    console.error('Failed to process adaptive relationship layer preferences:', err);
  }

  // Load relevant memories to inject into wisdom engine
  let personalMemories = [];
  try {
    const relevantMemories = await memoryService.findRelevantMemories(userId, content);
    personalMemories = relevantMemories.map(m => m.content);
  } catch (err) {
    console.error('Failed to retrieve relevant memories:', err);
  }

  let assistantReply;
  try {
    // Generate context-aware prompt using Wisdom Engine
    const { systemPrompt, userMessage } = preparePrompt(
      conversation.messages,
      { 
        personalMemories,
        relationshipMode: user?.adaptiveRelationship?.relationshipMode || 'Calm Guide'
      },
      adaptiveDecorator
    );
    const rawReply = await generateResponse(userMessage, systemPrompt);
    assistantReply = formatResponse(rawReply);
  } catch (error) {
    console.error('Gemini integration failed, falling back to placeholder response:', error);
    assistantReply = "🌿 I'm taking a deep breath for a moment. So many people are talking to me right now that I'm a little overwhelmed. Could you try again in a few seconds?";
  }

  // Add assistant message
  conversation.messages.push({
    role: 'assistant',
    content: assistantReply,
    createdAt: new Date()
  });

  const savedConversation = await conversation.save();

  // Non-blocking background memory extraction and storage
  extractAndSaveMemoryBackground(userId, content).catch(err => {
    console.error('Error in background memory extraction:', err);
  });

  return savedConversation;
};

/**
 * Asynchronously extracts and saves a memory from a user message.
 * @param {string} userId
 * @param {string} content
 */
const extractAndSaveMemoryBackground = async (userId, content) => {
  try {
    const candidate = await extractMemory(content);
    if (candidate && candidate.shouldRemember) {
      await memoryService.saveMemory(userId, candidate, content);
    }
  } catch (err) {
    console.error('Failed to extract/save memory in background:', err);
  }
};


/**
 * Delete a conversation
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId, userId) => {
  const conversation = await getConversationById(conversationId, userId);
  await Conversation.deleteOne({ _id: conversation._id });
};

