import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { generateResponse } from '../services/geminiService.js';
import { preparePrompt } from '../services/wisdomEngine/engine.js';
import mongoose from 'mongoose';

dotenv.config();

const testPrompts = [
  { label: 'Emotional Rejection', text: 'I failed my interview.' },
  { label: 'Future Stress/Goal', text: 'My placements are next month.' },
  { label: 'Academic Procrastination (Friend)', text: 'Bhai padhai nahi ho rahi.', mode: 'Close Friend' },
  { label: 'Happy/Achievement', text: 'I got selected!' },
  { label: 'Deep Grief/Loss', text: 'My girlfriend left me.' },
  { label: 'Technical request', text: 'Teach me Java HashMap.' }
];

const runTests = async () => {
  console.log('--- Starting Human Conversation Layer Verification ---');
  await connectDB();

  // Create temporary user
  const tempEmail = `conv_test_user_${Date.now()}@example.com`;
  const tempUser = await User.create({
    name: 'Conversation Test User',
    email: tempEmail,
    password: 'password123',
    adaptiveRelationship: {
      relationshipMode: 'Calm Guide'
    }
  });

  try {
    for (const prompt of testPrompts) {
      console.log(`\n========================================`);
      console.log(`TEST CASE: ${prompt.label}`);
      console.log(`User says: "${prompt.text}"`);
      if (prompt.mode) {
        console.log(`Relationship Mode: ${prompt.mode}`);
      }
      console.log(`========================================`);

      // Mock conversation messages
      const messages = [{ role: 'user', content: prompt.text }];
      
      // Call preparePrompt passing the relationshipMode
      const relationshipMode = prompt.mode || tempUser.adaptiveRelationship.relationshipMode;
      const { systemPrompt, userMessage } = preparePrompt(
        messages,
        { relationshipMode }
      );

      // Generate response using Gemini
      console.log('Generating response from Gemini...');
      const response = await generateResponse(userMessage, systemPrompt);
      console.log(`\nWisdom AI:\n${response}`);
    }
  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    // Clean up
    console.log('\nCleaning up database records...');
    await User.deleteOne({ _id: tempUser._id });
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

runTests();
