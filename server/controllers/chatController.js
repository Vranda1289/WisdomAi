import * as chatService from '../services/chatService.js';

// @desc    Create a new empty conversation
// @route   POST /api/chat/new
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.createConversation(req.user._id);
    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations of the authenticated user
// @route   GET /api/chat
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversationsByUserId(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single conversation with all messages
// @route   GET /api/chat/:conversationId
// @access  Private
export const getConversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await chatService.getConversationById(conversationId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: conversation
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Add user message and generate placeholder reply
// @route   POST /api/chat/:conversationId/message
// @access  Private
export const addMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const conversation = await chatService.addMessageToConversation(conversationId, req.user._id, content);
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: conversation
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/:conversationId
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    await chatService.deleteConversation(conversationId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
