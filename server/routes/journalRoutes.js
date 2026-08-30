import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
  generateEchoForEntry,
} from '../controllers/journalController.js';

const router = express.Router();

// Apply auth middleware to all journal routes
router.use(protect);

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .get(getJournalById)
  .put(updateJournal)
  .delete(deleteJournal);

router.route('/:id/echo')
  .post(generateEchoForEntry);

export default router;
