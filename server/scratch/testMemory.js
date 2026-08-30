import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Memory from '../models/Memory.js';
import { extractMemory } from '../services/memoryExtractor.js';
import * as memoryService from '../services/memoryService.js';
import { addMessageToConversation, createConversation } from '../services/chatService.js';

dotenv.config();

const runTests = async () => {
  console.log('--- Starting Memory System Tests ---');
  await connectDB();

  // Create a dummy user
  const testEmail = `test_memory_user_${Date.now()}@example.com`;
  const dummyUser = await User.create({
    name: 'Memory Test User',
    email: testEmail,
    password: 'password123',
    theme: 'winter_morning',
    language: 'english'
  });
  console.log(`Created test user: ${dummyUser._id}`);

  try {
    // 1. Verify Memory Extraction
    console.log('\nTesting Memory Extraction...');
    const message1 = "I want to become a backend engineer.";
    const extracted1 = await extractMemory(message1);
    console.log('Extracted Memory 1:', extracted1);
    if (!extracted1.shouldRemember || extracted1.category !== 'career') {
      throw new Error('Assertion failed: Memory 1 should be remembered under category "career"');
    }

    const message2 = "Today I ate pizza for lunch.";
    const extracted2 = await extractMemory(message2);
    console.log('Extracted Memory 2 (mundane):', extracted2);
    if (extracted2.shouldRemember) {
      throw new Error('Assertion failed: Mundane tasks should not be remembered');
    }

    // 2. Verify Save & Duplicate updates / mentionCount
    console.log('\nTesting Save Memory & Duplicate Detection...');
    // Save first memory
    const saved1 = await memoryService.saveMemory(dummyUser._id, extracted1, message1);
    console.log('Saved Memory 1:', saved1);

    // Save duplicate with identical Jaccard similarity
    console.log('Saving identical memory to verify local bypass & duplicate update...');
    const savedDuplicateJaccard = await memoryService.saveMemory(dummyUser._id, extracted1, message1);
    console.log('Saved duplicate (Jaccard match):', savedDuplicateJaccard);
    if (savedDuplicateJaccard._id.toString() !== saved1._id.toString() || savedDuplicateJaccard.mentionCount !== 2) {
      throw new Error('Assertion failed: Duplicate Jaccard match should have merged/updated same memory and incremented mentionCount');
    }

    // Save semantically similar memory to trigger Gemini deduplication
    console.log('Saving semantically similar memory ("I want to work as a backend developer")...');
    const message3 = "I want to work as a backend developer.";
    const extracted3 = await extractMemory(message3);
    const savedDuplicateGemini = await memoryService.saveMemory(dummyUser._id, extracted3, message3);
    console.log('Saved duplicate (Gemini match):', savedDuplicateGemini);
    if (savedDuplicateGemini._id.toString() !== saved1._id.toString() || savedDuplicateGemini.mentionCount !== 3) {
      throw new Error('Assertion failed: Duplicate Gemini match should have merged/updated same memory');
    }

    // 3. Verify Temporary memory expiry
    console.log('\nTesting Temporary Memory Expiry...');
    const tempMemoryData = {
      shouldRemember: true,
      category: 'other',
      importance: 'low',
      content: 'I am going on a temporary trip today.',
      whyRemembered: 'Temporary event',
      expiresAt: new Date(Date.now() - 1000) // already expired 1 second ago
    };
    const savedTemp = await memoryService.saveMemory(dummyUser._id, tempMemoryData, 'I am going on a temporary trip today.');
    console.log('Saved Temporary (Expired) Memory:', savedTemp);

    // Retrieve memories - the expired one should NOT be returned
    const relevantMemories = await memoryService.findRelevantMemories(dummyUser._id, 'Hello there');
    console.log('Retrieved relevant memories (excluding expired):', relevantMemories);
    const hasTemp = relevantMemories.some(m => m._id.toString() === savedTemp._id.toString());
    if (hasTemp) {
      throw new Error('Assertion failed: Expired memory should not be returned');
    }

    // 4. Verify Chat Service Integration
    console.log('\nTesting Chat Integration (non-blocking extraction)...');
    const conversation = await createConversation(dummyUser._id);
    console.log('Created conversation:', conversation._id);

    // Add a message that should trigger memory saving
    console.log('Sending message: "I love Java."');
    const updatedConversation = await addMessageToConversation(conversation._id, dummyUser._id, "I love Java.");
    console.log('Assistant response received successfully');

    // Wait a brief moment to allow background memory extraction to run
    console.log('Waiting 3 seconds for background memory extraction...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify memory was saved
    const memoriesAfterChat = await Memory.find({ user: dummyUser._id, content: /Java/i });
    console.log('Java memories found in DB:', memoriesAfterChat);
    if (memoriesAfterChat.length === 0) {
      throw new Error('Assertion failed: Memory about Java should have been saved in the background');
    }

    console.log('\nAll Tests Passed Successfully! ✓');
  } catch (error) {
    console.error('\nTest Suite Failed! ✗', error);
  } finally {
    // Clean up
    console.log('\nCleaning up database records...');
    try {
      await Memory.deleteMany({ user: dummyUser._id });
      await User.deleteOne({ _id: dummyUser._id });
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

runTests();
