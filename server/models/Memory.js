import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
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
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  confidence: {
    type: Number,
    default: 1
  },
  sourceMessage: {
    type: String,
    required: true
  },
  mentionCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active',
    index: true
  },
  lastReferenced: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date
  },
  whyRemembered: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Explicit definition of indexes
memorySchema.index({ updatedAt: -1 });

const Memory = mongoose.model('Memory', memorySchema);
export default Memory;
