import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

const getAiClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not defined.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// In-memory cache for dashboard data
const dashboardCache = new Map();

const getConversationHash = async (userId) => {
  const conversations = await Conversation.find({ user: userId }).select('updatedAt messages');
  if (!conversations || conversations.length === 0) return 'empty';
  return conversations
    .map(c => `${c._id}_${c.updatedAt.getTime()}_${c.messages.length}`)
    .sort()
    .join('|');
};

const computeStreakStats = (conversations) => {
  const dates = new Set();
  let totalMessages = 0;
  
  conversations.forEach(c => {
    c.messages.forEach(m => {
      totalMessages += 1;
      const dateStr = new Date(m.createdAt).toDateString();
      dates.add(dateStr);
    });
  });

  const sortedDates = Array.from(dates).map(d => new Date(d)).sort((a, b) => b - a);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  if (sortedDates.length > 0) {
    const today = new Date(new Date().toDateString());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecent = sortedDates[0];
    const isActive = mostRecent >= yesterday;
    
    if (isActive) {
      currentStreak = 1;
      tempStreak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const diffTime = sortedDates[i] - sortedDates[i + 1];
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, sortedDates.length > 0 ? 1 : 0);
  
  return {
    totalConversations: conversations.length,
    currentStreak,
    longestStreak,
    totalMessages,
    hoursReflecting: parseFloat((totalMessages * 0.05).toFixed(1))
  };
};

/**
 * Curated list of wisdom quotes to fallback or dynamically inject
 */
const WISDOM_QUOTES = [
  { quote: "Peace doesn't arrive when life becomes quiet. It arrives when the mind stops fighting every passing thought.", source: "Inspired by the Bhagavad Gita" },
  { quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", source: "Inspired by Marcus Aurelius (Stoicism)" },
  { quote: "The journey of a thousand miles begins with a single step. Be patient with your current pace.", source: "Inspired by Lao Tzu" },
  { quote: "Difficulties strengthen the mind, as labor does the body. Every friction is an invitation to grow.", source: "Inspired by Seneca" },
  { quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", source: "Inspired by Buddha" }
];

/**
 * Fast synchronous calculation of user stats without waiting for AI generation
 */
export const getFastReflectionStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const conversations = await Conversation.find({ user: userId }).select('updatedAt createdAt messages');
  const stats = computeStreakStats(conversations);
  const daysGrowing = Math.max(1, Math.ceil((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)));

  return {
    daysGrowing,
    totalConversations: conversations.length,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    hoursReflecting: stats.hoursReflecting,
    userName: user.name
  };
};

export const generateReflectionDashboard = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const conversations = await Conversation.find({ user: userId }).sort({ updatedAt: -1 });

  // Check cache
  const stateHash = await getConversationHash(userId);
  const cached = dashboardCache.get(userId.toString());
  if (cached && cached.hash === stateHash) {
    return cached.data;
  }

  const stats = computeStreakStats(conversations);
  const daysGrowing = Math.max(1, Math.ceil((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)));

  if (conversations.length < 2 || stats.totalMessages < 3) {
    const emptyState = {
      isEmpty: true,
      stats: {
        daysGrowing,
        totalConversations: conversations.length,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        hoursReflecting: stats.hoursReflecting
      }
    };
    dashboardCache.set(userId.toString(), { hash: stateHash, data: emptyState });
    return emptyState;
  }

  let historyText = '';
  conversations.slice(0, 15).forEach((conv, idx) => {
    historyText += `\n\n--- Conversation ${idx + 1} (${conv.title}) ---\n`;
    conv.messages.forEach(msg => {
      historyText += `${msg.role === 'user' ? 'User' : 'Wisdom AI'}: ${msg.content}\n`;
    });
  });

  try {
    const ai = getAiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const systemPrompt = `You are the Growth & Reflection Analyst for Wisdom AI.
Your job is to analyze the user's conversation history and generate a warm, beautiful, encouraging, and deeply personal reflection journal.

CRITICAL WRITING RULES:
- Never say "You are..." (e.g. "You are anxious"). Instead, say "I've noticed..." (e.g. "I've noticed a quiet focus returning when you talk about...").
- Do NOT diagnose or write clinical mental health summaries. Avoid charts, labels, or clinical summaries that resemble diagnostic panels.
- Do NOT exaggerate. Always sound humble, peaceful, hopeful, and authentic.
- Every sentence should read like it was handwritten in a personal growth journal by a guide who truly knows the user.

Generate a JSON response containing:
1. "reflection": A short diary-style reflection (2-3 short paragraphs) on their emotional state and progress under the title "One thing I've noticed...".
2. "thisWeek": Array of 2-4 bullet points reflecting on observations from this week (e.g., "You reached out even on difficult days", "You asked thoughtful questions instead of searching for quick motivation"). These should feel like observations—not achievements.
3. "timeline": A chronological array of milestones representing emotional growth (3 to 5 growth markers, sorted chronologically with month name and description). Focus on emotional growth rather than numbers.
4. "themes": Array of key themes and their frequency (choose from Placements, Learning, Relationships, Personal Growth, Career, Self Understanding, or others).
5. "emotionTrend": Emotion percentages for: Hopeful, Curious, Calm, Nervous, Proud, Grateful, Confused, Determined, Overwhelmed, Lonely (percentages must sum to 100).
6. "wins": Array of 2-4 small achievements or validations.
7. "focusAreas": Array of 1-3 focus areas under the theme of "Maybe this deserves a little more attention..." (e.g., "Sleep", "Confidence", "Overthinking", "Consistency"). No negative language.
8. "letterToSelf": A warm, encouraging note addressed to the user. Address the user by name (e.g., "Dear ${user.name}, ..."). Summarize their recent shift (e.g., from fear to curiosity) and express pride in how they keep showing up. Signed "— Wisdom".
9. "todaysWisdom": An object containing a single elegant quote and its source suitable for the user's current situation (inspired by Bhagavad Gita, Stoicism, or other philosophies).`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        reflection: { type: 'STRING' },
        thisWeek: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        },
        timeline: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              month: { type: 'STRING' },
              milestone: { type: 'STRING' }
            },
            required: ['month', 'milestone']
          }
        },
        themes: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              count: { type: 'INTEGER' }
            },
            required: ['name', 'count']
          }
        },
        emotionTrend: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              percentage: { type: 'INTEGER' }
            },
            required: ['name', 'percentage']
          }
        },
        wins: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        },
        focusAreas: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        },
        letterToSelf: { type: 'STRING' },
        todaysWisdom: {
          type: 'OBJECT',
          properties: {
            quote: { type: 'STRING' },
            source: { type: 'STRING' }
          },
          required: ['quote', 'source']
        }
      },
      required: ['reflection', 'thisWeek', 'timeline', 'themes', 'emotionTrend', 'wins', 'focusAreas', 'letterToSelf', 'todaysWisdom']
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `User Profile name: ${user.name}\nConversation History:\n${historyText}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    if (!response || !response.text) {
      throw new Error('No response returned from Gemini API');
    }

    const data = JSON.parse(response.text);

    const fullDashboardData = {
      isEmpty: false,
      reflection: data.reflection,
      thisWeek: data.thisWeek,
      timeline: data.timeline,
      themes: data.themes,
      emotionTrend: data.emotionTrend,
      wins: data.wins,
      focusAreas: data.focusAreas,
      letterToSelf: data.letterToSelf,
      todaysWisdom: data.todaysWisdom,
      stats: {
        daysGrowing,
        totalConversations: conversations.length,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        hoursReflecting: stats.hoursReflecting
      }
    };

    dashboardCache.set(userId.toString(), { hash: stateHash, data: fullDashboardData });
    return fullDashboardData;

  } catch (error) {
    console.error('Error in generateReflectionDashboard:', error);
    // Dynamic fallback matching WISDOM_QUOTES
    const randomQuote = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
    return {
      isEmpty: false,
      reflection: "🌿 I've noticed you've been putting in persistent efforts recently. Let's keep exploring your journey together.",
      thisWeek: ["You kept showing up even on difficult days."],
      timeline: [{ month: "Current", milestone: "Continued speaking with Wisdom AI." }],
      themes: [{ name: "Self Growth", count: 1 }],
      emotionTrend: [{ name: "Hopeful", percentage: 100 }],
      wins: ["You kept showing up."],
      focusAreas: ["Continue reflecting daily."],
      letterToSelf: `Dear ${user.name},\n\nI've noticed a quiet focus settling into your thoughts. We are making progress day by day.\n\n— Wisdom`,
      todaysWisdom: randomQuote,
      stats: {
        daysGrowing,
        totalConversations: conversations.length,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        hoursReflecting: stats.hoursReflecting
      }
    };
  }
};
