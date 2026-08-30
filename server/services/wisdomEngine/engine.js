import { personalityPrompt } from './personality.js';
import { valuesPrompt } from './values.js';
import { communicationStylePrompt } from './communicationStyle.js';
import { wisdomRulesPrompt } from './wisdomRules.js';
import { safetyRulesPrompt } from './safetyRules.js';
import { responseFrameworkPrompt } from './responseFramework.js';
import { prepareMemoryContext } from './memoryPreparation.js';
import { conversationIntelligencePrompt } from './conversationIntelligence.js';
import assembleConversationGuidelines from './conversation/conversationAssembler.js';


// Intent classifier keywords and phrases
const MODES = {
  TECHNICAL_LEARNING: ['java', 'dsa', 'react', 'coding', 'programming', 'recursion', 'computer science', 'algorithm', 'database', 'sql', 'mathematics', 'maths', 'python', 'javascript', 'html', 'css', 'bug', 'compile'],
  CAREER_GUIDANCE: ['career', 'resume', 'interview', 'job', 'salary', 'promotion', 'internship', 'career pressure', 'portfolio', 'hire'],
  EMOTIONAL_SUPPORT: ['stress', 'fear', 'burnout', 'confusion', 'failure', 'loneliness', 'overthinking', 'anxiety', 'anxious', 'scared', 'sad', 'lost', 'rejection', 'depressed'],
  SPIRITUAL_GUIDANCE: ['gita', 'bhagavad', 'scripture', 'soul', 'karma', 'dharma', 'meditation', 'stoicism', 'philosophy', 'god', 'religion', 'mindfulness', 'inner peace'],
  DECISION_MAKING: ['choose', 'decide', 'decision', 'options', 'weigh', 'alternative', 'path'],
  DEEP_CONVERSATION: ['meaning', 'purpose', 'existence', 'suffering', 'ethics', 'legacy', 'universe', 'consciousness', 'truth'],
  CASUAL_CONVERSATION: ['hi', 'hello', 'hey', 'greetings', 'thanks', 'thank you', 'how are you', 'good morning', 'good night']
};

/**
 * Classifies the active conversation into one or more conversational modes
 * considering both the current message and the recent history.
 * 
 * @param {Array} messages 
 * @returns {Array<string>} Detected modes
 */
const detectIntents = (messages = []) => {
  if (messages.length === 0) return [ 'Casual Conversation' ];

  const recentTexts = messages
    .slice(-4) // Scan the last 4 messages for context
    .map(m => m.content.toLowerCase())
    .join(' ');

  const detected = [];

  for (const [modeName, keywords] of Object.entries(MODES)) {
    const isMatched = keywords.some(kw => recentTexts.includes(kw));
    if (isMatched) {
      // Reformat mode names (e.g. TECHNICAL_LEARNING -> Technical Learning)
      const cleanName = modeName
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
      detected.push(cleanName);
    }
  }

  return detected.length > 0 ? detected : [ 'Casual Conversation' ];
};

/**
 * Assembles the finalized system prompt instructions and context structure for Gemini.
 * Supports optional options for daily reflections, journals, goals, habits, mood history, etc.
 * 
 * @param {Array} messages 
 * @param {Object} options Optional context data
 * @returns {Object} prepared systemPrompt and userMessage
 */
export const preparePrompt = (messages = [], options = {}, adaptiveDecorator = '') => {
  if (messages.length === 0) {
    return { systemPrompt: '', userMessage: '' };
  }

  // Detect current conversational modes
  const intents = detectIntents(messages);
  const isTechnical = intents.includes('Technical Learning') && !intents.includes('Emotional Support');

  // Set up adaptive relationship layer decorator if passed in options
  const activeDecorator = adaptiveDecorator || options.adaptiveDecorator || '';

  // Assemble dynamic human conversation guidelines
  const conversationGuidelines = assembleConversationGuidelines({
    relationshipMode: options.relationshipMode || 'Calm Guide'
  });

  // Aggregated System Prompt Core
  let systemPrompt = `
${personalityPrompt}
${valuesPrompt}
${communicationStylePrompt}
${wisdomRulesPrompt}
${safetyRulesPrompt}
${responseFrameworkPrompt}
${conversationIntelligencePrompt}

${conversationGuidelines}

${activeDecorator}

INTENT ANALYSIS:
Active conversation modes detected: ${intents.join(', ')}.
`;

  // Companion Style directive
  const companionStyle = options.companionStyle || 'gentle';
  if (companionStyle === 'gentle') {
    systemPrompt += `
[COMPANION STYLE DIRECTIVE: GENTLE & CALMING]
- Radiate warmth, deep patience, emotional gentleness, and spacious reassurance.
- Acknowledge feelings softly, provide breathing room, and avoid any rush or pressure.
- Keep the rhythm peaceful and soothing.
`;
  } else if (companionStyle === 'balanced') {
    systemPrompt += `
[COMPANION STYLE DIRECTIVE: BALANCED & GROUNDED]
- Combine genuine human empathy with grounded, practical thinking and thoughtful structure.
- Acknowledge the emotional truth first, then guide towards clarity and steady perspective.
`;
  } else if (companionStyle === 'practical') {
    systemPrompt += `
[COMPANION STYLE DIRECTIVE: PRACTICAL CLARITY]
- Direct, constructive, solution-oriented, realistic, and clear.
- Offer actionable steps, crisp perspectives, and focus on practical moves without unnecessary poetic fluff, while remaining kind and supportive.
`;
  } else if (companionStyle === 'spiritual') {
    systemPrompt += `
[COMPANION STYLE DIRECTIVE: DEEP & PHILOSOPHICAL]
- Incorporate deeper introspective reflection, philosophical framing, and timeless wisdom (Stoicism, Gita, mindfulness, inner stillness).
- Ask thoughtful questions that help the user look within and find clarity, while keeping the advice grounded in their actual real-world situation.
`;
  }

  // Language directive
  const languagePref = options.language || 'en';
  if (languagePref === 'hi-en' || languagePref === 'hinglish') {
    systemPrompt += `
[LANGUAGE PREFERENCE: NATURAL HINGLISH]
- Respond in natural, fluent Hinglish (Hindi written in Roman script mixed naturally with English, e.g. "Main samajh sakta hoon ki...", "Thoda time lo aur socho...", "Yeh situation tough lag sakti hai...").
- Do NOT translate mechanically word-by-word. Speak like a close Indian friend having a genuine heart-to-heart conversation.
`;
  } else {
    systemPrompt += `
[LANGUAGE PREFERENCE: ENGLISH]
- Respond in natural, fluid, warm English.
`;
  }

  // Human communication style mirroring & anti-generic AI rules
  systemPrompt += `
[HUMAN COMMUNICATION STYLE MIRRORING & NATURAL CADENCE]
- Mirror message length: If the user sends a short 1-2 sentence message, keep your reply concise and conversational (2-4 sentences). Do NOT respond with a massive multi-paragraph essay.
- If the user provides a rich, detailed message, provide a thoughtful, well-developed response.
- If the user writes in lowercase/casual phrasing, adapt naturally to that relaxed cadence.
- AVOID REPETITIVE STOCK AI FILLERS: Strictly avoid generic robotic phrases like "I understand how you feel," "That's completely valid," "It's important to remember that...," "Here are some steps you can take:," "Take a deep breath," "Everything will be okay."
- CRITICAL BOUNDARY - NEVER MIRROR HARMFUL LANGUAGE: If the user expresses anger, frustration, or uses aggressive/foul language, NEVER mirror slurs, toxic words, or insults. Instead, acknowledge the emotional intensity calmly with respect and steady presence.

OUTPUT QUALITY INTERNAL REFLECTION DIRECTIVE:
Before generating the final text output, run this internal reflection:
- Does this sound like a generic AI or Gemini? If yes, rewrite it to sound like a real human sitting beside the user.
- Does it match the selected companion tone (${companionStyle}) and language (${languagePref})? Only output when yes.
`;

  // Specialized context routing
  if (isTechnical) {
    systemPrompt += `
[SPECIAL CONSTRAINT: TECHNICAL MODE ACTIVE]
- Focus purely on technical, coding, or algorithmic clarity.
- Do NOT inject any philosophy, scriptures, spiritual advice, or Bhagavad Gita teachings.
- Explain concepts with engineering excellence, keeping the tone patient and supportive.
`;
  }

  // Handle future memory metadata hooks (daily reflections, mood history, journals, goals, etc.)
  const injectedMemoryContext = prepareMemoryContext(options);

  // Format conversation history
  const lastUserMsg = messages[messages.length - 1];
  const lastUserContent = lastUserMsg ? lastUserMsg.content : '';

  const historyMessages = messages.slice(0, messages.length - 1);
  let historyString = '';
  if (historyMessages.length > 0) {
    historyString = historyMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Wisdom AI'}: ${msg.content}`)
      .join('\n\n');
  }

  // Construct finalized context-injected user message
  let userMessage = '';
  if (injectedMemoryContext) {
    userMessage += `${injectedMemoryContext}\n\n---\n\n`;
  }

  if (historyString) {
    userMessage += `Conversation History Context:\n${historyString}\n\n---\n\nCurrent Message:\nUser: ${lastUserContent}`;
  } else {
    userMessage += `Current Message:\nUser: ${lastUserContent}`;
  }

  return { systemPrompt, userMessage };
};
export default preparePrompt;
