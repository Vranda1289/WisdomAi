import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createConversation,
  getConversations,
  getConversationById,
  addMessage,
  deleteConversation
} from '../controllers/chatController.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.post('/new', createConversation);
router.get('/', getConversations);
router.get('/:conversationId', getConversationById);
router.post('/:conversationId/message', addMessage);
router.delete('/:conversationId', deleteConversation);

export default router;
