import express from 'express';
import { registerUser, loginUser, getCurrentUser, updatePreferences } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/preferences', protect, updatePreferences);

export default router;
