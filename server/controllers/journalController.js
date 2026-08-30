import Journal from '../models/Journal.js';
import { generateResponse } from '../services/geminiService.js';

/**
 * Generate a gentle, poetic reflection note from Wisdom AI for a journal entry.
 */
const createAiEcho = async (content, mood, promptText = '') => {
  try {
    const systemPrompt = `You are Wisdom AI, an empathetic, peaceful companion.
A user has written an entry in their private reflection journal.
Your task is to write a short "Wisdom's Gentle Echo" (2 to 4 sentences).
Guidelines:
- Never judge, lecture, or diagnose.
- Validate their feeling gently with warmth, presence, and perspective.
- Draw from timeless, serene wisdom (like gentle stoicism, mindful presence, or inner stillness).
- Keep it concise, compassionate, and beautiful.
- Address them softly without sounding clinical or robotic.
CRITICAL — NEVER fabricate internal AI states: Never claim to breathe, feel tired, be overwhelmed, have other users, have server problems, or invent any personal excuse. You feel human through how you communicate, not by falsely claiming human biology.`;

    const userMessage = `User's Journal Entry:
Mood: ${mood || 'reflective'}
${promptText ? `Reflective Prompt: "${promptText}"\n` : ''}Content:
"${content}"

Write a warm, gentle 2-4 sentence reflection for this journal entry.`;

    const echo = await generateResponse(userMessage, systemPrompt);
    return echo.trim();
  } catch (err) {
    console.error('Failed to generate AI Echo for journal:', err);
    return "🌿 Thank you for giving words to what you feel today. Giving shape to your thoughts is the first step toward lightness and clarity.";
  }
};

// @desc    Get all journal entries for logged-in user
// @route   GET /api/journal
// @access  Private
export const getJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Journal entries retrieved successfully',
      data: journals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
// @access  Private
export const getJournalById = async (req, res, next) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!journal) {
      res.status(404);
      throw new Error('Journal entry not found');
    }
    res.status(200).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new journal entry (Instant save + async AI echo)
// @route   POST /api/journal
// @access  Private
export const createJournal = async (req, res, next) => {
  try {
    const { title, content, mood, prompt, withAiEcho } = req.body;

    if (!content || !content.trim()) {
      res.status(400);
      throw new Error('Journal content is required');
    }

    // 1. Immediately save the journal to database
    const journal = await Journal.create({
      user: req.user._id,
      title: title && title.trim() ? title.trim() : 'Reflections for Today',
      content: content.trim(),
      mood: mood || 'reflective',
      prompt: prompt || '',
      aiEcho: '',
    });

    // 2. Return response immediately so user is never blocked
    res.status(201).json({
      success: true,
      message: 'Journal entry saved successfully',
      data: journal,
    });

    // 3. Asynchronously generate AI Echo in background if requested
    if (withAiEcho) {
      createAiEcho(content, mood, prompt)
        .then(async (echo) => {
          if (echo) {
            await Journal.findByIdAndUpdate(journal._id, { aiEcho: echo });
          }
        })
        .catch((err) => {
          console.error('Async AI Echo generation failed:', err);
        });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Private
export const updateJournal = async (req, res, next) => {
  try {
    const { title, content, mood, prompt } = req.body;

    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!journal) {
      res.status(404);
      throw new Error('Journal entry not found');
    }

    if (title !== undefined) journal.title = title;
    if (content !== undefined) journal.content = content;
    if (mood !== undefined) journal.mood = mood;
    if (prompt !== undefined) journal.prompt = prompt;

    const updatedJournal = await journal.save();

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      data: updatedJournal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
// @access  Private
export const deleteJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!journal) {
      res.status(404);
      throw new Error('Journal entry not found');
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate or regenerate AI Wisdom Echo for an existing journal entry
// @route   POST /api/journal/:id/echo
// @access  Private
export const generateEchoForEntry = async (req, res, next) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!journal) {
      res.status(404);
      throw new Error('Journal entry not found');
    }

    const aiEcho = await createAiEcho(journal.content, journal.mood, journal.prompt);
    journal.aiEcho = aiEcho;
    await journal.save();

    res.status(200).json({
      success: true,
      message: 'Wisdom echo generated successfully',
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};
