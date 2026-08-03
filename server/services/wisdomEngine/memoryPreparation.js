/**
 * Prepares the architectural context blocks for future extension of persistent memory modules
 * (e.g. preferences, summaries, reflections, journal entries, goals, mood logs).
 * 
 * All inputs are optional, ensuring full plug-and-play capability.
 * Currently, returns a formatted context string if any metadata is supplied.
 * 
 * @param {Object} options
 * @returns {string} Formatted context blocks for the prompt
 */
export const prepareMemoryContext = (options = {}) => {
  const {
    preferences = null,
    recurringTopics = [],
    summaries = [],
    dailyReflections = null,
    journalEntries = [],
    moodHistory = [],
    goals = [],
    habits = [],
    personalMemories = []
  } = options;

  const contextBlocks = [];

  if (preferences) {
    contextBlocks.push(`[CONTEXT: User Preferences]\n${typeof preferences === 'string' ? preferences : JSON.stringify(preferences)}`);
  }

  if (recurringTopics && recurringTopics.length > 0) {
    contextBlocks.push(`[CONTEXT: Recurring Topics]\n${recurringTopics.map(t => `- ${t}`).join('\n')}`);
  }

  if (summaries && summaries.length > 0) {
    contextBlocks.push(`[CONTEXT: Past Session Summaries]\n${summaries.map(s => `- ${s}`).join('\n')}`);
  }

  if (dailyReflections) {
    contextBlocks.push(`[CONTEXT: Daily Reflections]\n${dailyReflections}`);
  }

  if (journalEntries && journalEntries.length > 0) {
    contextBlocks.push(`[CONTEXT: Recent Journal Insights]\n${journalEntries.map(j => `- ${j}`).join('\n')}`);
  }

  if (moodHistory && moodHistory.length > 0) {
    contextBlocks.push(`[CONTEXT: Mood Trend Logs]\n${moodHistory.map(m => `- ${m}`).join('\n')}`);
  }

  if (goals && goals.length > 0) {
    contextBlocks.push(`[CONTEXT: Focus Goals]\n${goals.map(g => `- ${g}`).join('\n')}`);
  }

  if (habits && habits.length > 0) {
    contextBlocks.push(`[CONTEXT: Habit Tracking]\n${habits.map(h => `- ${h}`).join('\n')}`);
  }

  if (personalMemories && personalMemories.length > 0) {
    contextBlocks.push(`[CONTEXT: Shared Personal Memories]\n${personalMemories.map(m => `- ${m}`).join('\n')}`);
  }

  return contextBlocks.join('\n\n');
};
