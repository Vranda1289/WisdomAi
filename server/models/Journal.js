import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Reflections for Today',
    },
    content: {
      type: String,
      required: [true, 'Journal content cannot be empty'],
      trim: true,
    },
    mood: {
      type: String,
      enum: ['calm', 'reflective', 'hopeful', 'heavy', 'grateful', 'seeking-clarity', 'peaceful'],
      default: 'reflective',
    },
    prompt: {
      type: String,
      trim: true,
      default: '',
    },
    aiEcho: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Journal = mongoose.model('Journal', journalSchema);

export default Journal;
