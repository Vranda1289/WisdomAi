import { openingGuidelines } from './openings.js';
import { emojiGuidelines } from './emojiRules.js';
import { relationshipGuidelines } from './relationshipModes.js';
import { rhythmGuidelines } from './conversationRhythm.js';
import { followUpGuidelines } from './followUps.js';
import { closingGuidelines } from './closing.js';
import { humorGuidelines } from './humor.js';
import { emotionalProgressionGuidelines } from './emotionalProgression.js';
import { personalityConsistencyGuidelines } from './personalityConsistency.js';

/**
 * Assembles all conversational directives into a single instructional system block.
 * @param {Object} options Configuration options (relationshipMode, currentEmotion, etc.)
 * @returns {string} The compiled conversational system instructions
 */
export const assembleConversationGuidelines = (options = {}) => {
  const { relationshipMode = 'Calm Guide' } = options;

  let assembled = `
=========================================
HUMAN CONVERSATION LAYER GUIDELINES
=========================================

${personalityConsistencyGuidelines}

${emotionalProgressionGuidelines}

${openingGuidelines}

${emojiGuidelines}

${rhythmGuidelines}

${followUpGuidelines}

${closingGuidelines}

${humorGuidelines}

${relationshipGuidelines}

ACTIVE RELATIONSHIP CONSTRAINT:
- The user has chosen the relationship mode: "${relationshipMode}". You must speak and act according to this chosen relationship mode context while maintaining the core Wisdom AI personality.
`;

  return assembled;
};

export default assembleConversationGuidelines;
