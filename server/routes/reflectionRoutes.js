import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateReflectionDashboard, getFastReflectionStats } from '../services/reflectionService.js';

const router = express.Router();

// Apply protect middleware
router.use(protect);

// @desc    Get fast synchronous reflection stats (days together, streak, conversations)
// @route   GET /api/reflection/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getFastReflectionStats(req.user._id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reflection dashboard data
// @route   GET /api/reflection/dashboard
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await generateReflectionDashboard(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Reflection dashboard retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
});

export default router;
