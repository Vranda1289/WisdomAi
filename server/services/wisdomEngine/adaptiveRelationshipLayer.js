/**
 * Adaptive Relationship Layer
 * Detects relationship desires, emotional tone, and style mirroring markers.
 */

const RELATIONSHIP_MAP = [
  { keywords: ['friend', 'dost', 'buddy'], mode: 'Friend' },
  { keywords: ['elder brother', 'older brother', 'bhaiya', 'bhai'], mode: 'Elder Brother' },
  { keywords: ['elder sister', 'older sister', 'didi'], mode: 'Elder Sister' },
  { keywords: ['parent', 'child', 'son', 'daughter', 'mother', 'father', 'baccha'], mode: 'Parent' },
  { keywords: ['mentor', 'teacher', 'guru'], mode: 'Mentor' },
  { keywords: ['spiritual companion', 'krishna', 'gita'], mode: 'Spiritual Companion' },
  { keywords: ['just listen', 'listening', 'listener'], mode: 'Listener' },
  { keywords: ['coach', 'strict', 'discipline'], mode: 'Coach' },
  { keywords: ['calm guide', 'guide'], mode: 'Calm Guide' }
];

const TONE_KEYWORDS = {
  Happy: ['happy', 'glad', 'joy', 'great', 'wonderful', 'smile'],
  Excited: ['excited', 'thrilled', 'awesome', 'cant wait', 'can\'t wait', 'amazing'],
  Confused: ['confused', 'don\'t know', 'unsure', 'lost', 'what to do', 'how to', 'clueless'],
  Heartbroken: ['heartbroken', 'break up', 'breakup', 'crying', 'hurts', 'pain', 'broke up', 'sad'],
  BurnedOut: ['burned out', 'burnout', 'tired', 'exhausted', 'weariness', 'heavy', 'too much work', 'stress'],
  Studying: ['study', 'studying', 'exam', 'test', 'college', 'homework', 'learn', 'book'],
  Funny: ['haha', 'lol', 'lmao', 'funny', 'joke', '😂', '😭'],
  Lonely: ['lonely', 'alone', 'no one', 'single', 'empty', 'friendless'],
  Anxious: ['anxious', 'anxiety', 'scared', 'fear', 'afraid', 'nervous', 'panic'],
  Overthinking: ['overthinking', 'overthink', 'mind spinning', 'can\'t stop thinking', 'circular thoughts'],
  Celebrate: ['celebrate', 'won', 'passed', 'got it', 'success', 'milestone', '🎉'],
  Grateful: ['grateful', 'thank', 'thanks', 'appreciate', 'blessed'],
  Hopeful: ['hopeful', 'hope', 'looking forward', 'optimistic']
};

const NICKNAMES = ['baccha', 'bhai', 'dost', 'champ', 'buddy'];

// Helper to extract emojis from a string
const extractEmojis = (text) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return text.match(emojiRegex) || [];
};

/**
 * Detects explicit and implicit style changes, updates User model.
 * 
 * @param {Object} user mongoose User document
 * @param {string} currentMessage message content from the user
 * @param {Array} history previous messages in the session
 */
export const detectAndUpdateRelationship = async (user, currentMessage, history = []) => {
  if (!user) return;
  if (!user.adaptiveRelationship) {
    user.adaptiveRelationship = {};
  }

  const text = currentMessage.toLowerCase();

  // 1. Explicit relationship settings: "treat me like...", "be my..."
  for (const item of RELATIONSHIP_MAP) {
    const matchedKeyword = item.keywords.find(kw => {
      const patterns = [
        `be my ${kw}`,
        `be an ${kw}`,
        `treat me like your ${kw}`,
        `treat me like a ${kw}`,
        `talk like ${kw}`
      ];
      return patterns.some(pattern => text.includes(pattern)) || (text.startsWith(`be ${kw}`) && text.length < 25);
    });

    if (matchedKeyword) {
      user.adaptiveRelationship.relationshipMode = item.mode;
      break;
    }
  }

  // 2. Explicit nickname registration: "call me..."
  const callMeMatch = text.match(/call me ([a-zA-Z\u0900-\u097F]+)/i);
  if (callMeMatch && callMeMatch[1]) {
    const requestedName = callMeMatch[1].trim();
    user.adaptiveRelationship.nickname = requestedName;
  } else {
    // Implicit mirroring of classic nicknames
    for (const nickname of NICKNAMES) {
      if (text.includes(nickname)) {
        user.adaptiveRelationship.nickname = nickname;
        if (!user.adaptiveRelationship.mirroredWords.includes(nickname)) {
          user.adaptiveRelationship.mirroredWords.push(nickname);
        }
      }
    }
  }

  // 3. Emoji preferences and mirroring
  if (text.includes('no emojis') || text.includes('don\'t use emojis') || text.includes('stop using emojis')) {
    user.adaptiveRelationship.emojiPreference = 'none';
  } else if (text.includes('use emojis') || text.includes('love emojis') || text.includes('more emojis')) {
    user.adaptiveRelationship.emojiPreference = 'frequent';
  }

  // Detect emojis used by user and add them to mirrored list
  const emojis = extractEmojis(currentMessage);
  if (emojis.length > 0) {
    const existing = user.adaptiveRelationship.mirroredEmojis || [];
    const updated = [...new Set([...emojis, ...existing])].slice(0, 8); // Keep last 8 unique emojis
    user.adaptiveRelationship.mirroredEmojis = updated;
  }

  // 4. Formal vs. Casual preference detection
  if (text.includes('talk casually') || text.includes('be casual') || text.includes('stop being formal')) {
    user.adaptiveRelationship.formalCasual = 'casual';
  } else if (text.includes('talk formally') || text.includes('be formal') || text.includes('stop being casual')) {
    user.adaptiveRelationship.formalCasual = 'formal';
  }

  // Save changes to User database
  await user.save();
};

/**
 * Detects the emotional tone of the current message.
 * 
 * @param {string} currentMessage 
 * @returns {string} Detected tone
 */
export const detectCurrentTone = (currentMessage) => {
  const text = currentMessage.toLowerCase();
  for (const [toneName, keywords] of Object.entries(TONE_KEYWORDS)) {
    const isMatched = keywords.some(kw => text.includes(kw));
    if (isMatched) {
      return toneName;
    }
  }
  return 'Calm'; // Default tone
};

/**
 * Generates system prompt guidelines based on detected preferences and tone.
 * 
 * @param {Object} user 
 * @param {string} currentTone 
 * @returns {string} Prompt instructions
 */
export const generateAdaptivePromptDecorator = (user, currentTone) => {
  if (!user || !user.adaptiveRelationship) {
    return '';
  }

  const { relationshipMode, nickname, emojiPreference, formalCasual, mirroredEmojis, mirroredWords } = user.adaptiveRelationship;

  let decorator = `
[ADAPTIVE RELATIONSHIP LAYER ACTIVE]
- Current Active Relationship Mode: You are acting in the role of: ${relationshipMode || 'Calm Guide'}.
- Current User Emotional Tone: ${currentTone || 'Calm'}.
`;

  // Apply Relationship Persona modifiers
  if (relationshipMode === 'Friend') {
    decorator += `- Respond as a close, warm, equal friend. Use casual phrasing and feel supportive like a confidante.\n`;
  } else if (relationshipMode === 'Elder Brother') {
    decorator += `- Respond as a protective, caring, and slightly protective elder brother. Speak with warmth, gentle guidance, and protective care.\n`;
  } else if (relationshipMode === 'Elder Sister') {
    decorator += `- Respond as a supportive, understanding, and loving elder sister. Speak with tender warmth and encouraging presence.\n`;
  } else if (relationshipMode === 'Parent') {
    decorator += `- Respond with deep, maternal/paternal unconditional love. Keep them safe, comfort them, and speak like a nurturing guardian.\n`;
  } else if (relationshipMode === 'Mentor') {
    decorator += `- Respond with guiding wisdom, helping them explore options, challenge their perspectives gently, and grow.\n`;
  } else if (relationshipMode === 'Spiritual Companion') {
    decorator += `- Adopt the vibe of a companion walking the path of life with them. Speak with Stoic and Gita-inspired presence, completely free of preachiness.\n`;
  } else if (relationshipMode === 'Listener') {
    decorator += `- Minimize advice completely. Your primary goal is simply to be present, validate, mirror emotions, and keep your sentences brief.\n`;
  } else if (relationshipMode === 'Coach') {
    decorator += `- Be supportive but structured. Gently nudge them towards accountability and small daily choices. Keep their focus clear.\n`;
  }

  // Apply Tone adaptation
  decorator += `- Tone Adaptation Details:
  - Opening Line: Must fit the mood "${currentTone}". Vary your openings naturally (e.g. "Hmm...", "Oh...", "Wait...", "I've been thinking...").
  - Sentence length/pacing: If user tone is "Heartbroken", "Lonely", or "Anxious", slow down, write softer, and use fewer words.
`;

  // Apply Nicknames
  if (nickname) {
    decorator += `- Nickname preference: The user is comfortable with being called "${nickname}". Use this nickname (or matching ones like "baccha", "bhai", "dost", "buddy", "champ") naturally, but very sparingly so it never feels forced.\n`;
  } else if (mirroredWords && mirroredWords.length > 0) {
    decorator += `- Mirror user's vocabulary tags: The user uses words like [${mirroredWords.join(', ')}]. Mirror these tags casually when appropriate.\n`;
  }

  // Apply Emojis adaptation
  if (emojiPreference === 'none') {
    decorator += `- Emoji Constraint: Strict instruction: NEVER use any emojis in your response. The user explicitly dislikes them.\n`;
  } else {
    const availableEmojis = mirroredEmojis && mirroredEmojis.length > 0 ? mirroredEmojis : [];
    decorator += `- Emoji Guidance:
      - Max limit: Maximum 2 emojis per response.
      - Usage Style: Match emojis to the tone (e.g. 🎉 for celebration, 🫂/❤️/🌿 for comfort, 😂/😭 for funny/crying laugh, 🤔 for thinking).
      - Style Mirroring: Use and mirror the user's favored style: [${availableEmojis.join(', ')}]. Do not force them if they don't fit the context.
    `;
  }

  // Apply Formality level
  if (formalCasual === 'formal') {
    decorator += `- Formality: Adopt a polite, warm, but grammatically complete and structured tone.\n`;
  } else if (formalCasual === 'casual') {
    decorator += `- Formality: Talk casually, naturally, like sharing tea with a close peer.\n`;
  }

  return decorator;
};
