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

OUTPUT QUALITY INTERNAL REFLECTION DIRECTIVE:
Before generating the final text output, run this internal reflection:
- Does this text sound like a generic AI or Gemini? If yes, rewrite it to sound human, natural, and grounded.
- Does this sound like a warm, wise, tea-sharing guide sitting next to the user? Only produce the output when the answer is yes.
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
