import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { generateReflectionDashboard } from '../services/reflectionService.js';

dotenv.config();

const runTests = async () => {
  console.log('--- Starting Reflection Dashboard Tests ---');
  await connectDB();

  // Create temporary user
  const tempEmail = `reflection_test_user_${Date.now()}@example.com`;
  const dummyUser = await User.create({
    name: 'Reflection Test User',
    email: tempEmail,
    password: 'password123',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // registered 5 days ago
  });
  console.log(`Created test user: ${dummyUser._id}`);

  try {
    // 1. Verify Empty State (0 conversations)
    console.log('\nTesting empty state (zero conversations)...');
    const emptyDashboard = await generateReflectionDashboard(dummyUser._id);
    console.log('Empty Dashboard Result:', emptyDashboard);
    if (!emptyDashboard.isEmpty || emptyDashboard.stats.totalConversations !== 0) {
      throw new Error('Assertion failed: Dashboard should report isEmpty when having 0 conversations');
    }

    // 2. Add Conversations to trigger full analysis
    console.log('\nPopulating test conversation history...');
    
    // Conversation 1
    const conv1 = await Conversation.create({
      user: dummyUser._id,
      title: 'Placements Prep',
      messages: [
        { role: 'user', content: 'My placements are next month and I feel nervous.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'It is natural to feel nervous. Let us break down your preparation goals.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ]
    });

    // Conversation 2
    const conv2 = await Conversation.create({
      user: dummyUser._id,
      title: 'Coding Habits',
      messages: [
        { role: 'user', content: 'I have been practicing coding every single day for the past two weeks. I want to build consistency.', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Consistency is a quiet kind of victory. Solved any interesting challenges today?', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { role: 'user', content: 'Yes, solved 5 recursion problems. Felt determined.', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Fantastic job. Keep taking small steps.', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]
    });

    // 3. Generate reflection
    console.log('\nGenerating reflection dashboard...');
    const startTime = Date.now();
    const dashboard = await generateReflectionDashboard(dummyUser._id);
    const duration1 = Date.now() - startTime;
    console.log(`Generated in ${duration1}ms. Dashboard:`, JSON.stringify(dashboard, null, 2));

    if (dashboard.isEmpty) {
      throw new Error('Assertion failed: Dashboard should not be empty now');
    }
    if (dashboard.timeline.length === 0 || dashboard.themes.length === 0 || dashboard.emotionTrend.length === 0) {
      throw new Error('Assertion failed: Missing timeline, themes, or emotion trends');
    }

    // 4. Test Caching Logic (Second call should be near-instant and match first)
    console.log('\nTesting cache retrieval (should be extremely fast)...');
    const startTime2 = Date.now();
    const cachedDashboard = await generateReflectionDashboard(dummyUser._id);
    const duration2 = Date.now() - startTime2;
    console.log(`Cached read took: ${duration2}ms`);
    if (duration2 > 450) {
      throw new Error('Assertion failed: Cached retrieval took too long, cache may not be functioning');
    }
    if (cachedDashboard.reflection !== dashboard.reflection) {
      throw new Error('Assertion failed: Cached content mismatch');
    }

    // 5. Test Cache Invalidation on Change
    console.log('\nModifying conversation to trigger cache invalidation...');
    conv2.messages.push({
      role: 'user',
      content: 'I slept late yesterday and feel a bit overwhelmed today.',
      createdAt: new Date()
    });
    await conv2.save();

    console.log('Retrieving dashboard again (should call Gemini again and invalidate cache)...');
    const startTime3 = Date.now();
    const invalidatedDashboard = await generateReflectionDashboard(dummyUser._id);
    const duration3 = Date.now() - startTime3;
    console.log(`Regenerated in ${duration3}ms`);
    if (duration3 < 500) {
      console.warn('Warning: Regeneration was extremely fast; check if cache was correctly invalidated.');
    }

    console.log('\nAll Reflection Dashboard Tests Passed Successfully! ✓');
  } catch (error) {
    console.error('\nTest Suite Failed! ✗', error);
  } finally {
    // Clean up
    console.log('\nCleaning up database records...');
    await Conversation.deleteMany({ user: dummyUser._id });
    await User.deleteOne({ _id: dummyUser._id });
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

runTests();
