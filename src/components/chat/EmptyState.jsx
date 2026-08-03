import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion, AnimatePresence } from 'framer-motion';

export const EmptyState = ({ hasMessages, onSelectSuggestion }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';

  const suggestions = [
    { label: '🌿 Anxiety', prompt: "I've been feeling anxious lately and need some guidance on finding calm..." },
    { label: '📖 Bhagavad Gita', prompt: "What does the Bhagavad Gita teach about handling stress and duty?" },
    { label: '💼 Career', prompt: "I'm feeling uncertain about my career path. How can I gain clarity?" },
    { label: '❤️ Relationships', prompt: "How can I practice mindful listening and empathy in my relationships?" }
  ];

  if (hasMessages) {
    return (
      <motion.div
        layout
        className={`w-full flex flex-col items-center py-4 border-b ${
          isNight ? 'border-white/5 text-white/40' : 'border-[#2E1C12]/5 text-[#3D2A1D]/50'
        }`}
      >
        <motion.h2
          layout
          className={`font-heading text-lg md:text-xl mb-0.5 font-semibold ${
            isNight ? 'text-white/60' : 'text-[#2F2018]/70'
          }`}
        >
          Conversing with Wisdom AI 🌿
        </motion.h2>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto py-12 md:py-16">
      {/* Floating Meditating Lotus Illustration */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8 relative select-none"
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className={isNight ? 'text-accent' : 'text-secondary'}>
          {/* Subtle Outer Glow */}
          <circle cx="50" cy="50" r="40" className={`${isNight ? 'fill-accent/5' : 'fill-secondary/5'} animate-pulse`} />
          {/* Lotus Flower Path */}
          <path
            d="M50 25 C55 40, 65 45, 50 75 C35 45, 45 40, 50 25 Z"
            className={isNight ? 'fill-[#F6E05E]/20 stroke-[#F6E05E]' : 'fill-[#B08D57]/20 stroke-[#B08D57]'}
            strokeWidth="2"
          />
          <path
            d="M50 35 C62 45, 70 55, 50 75 C30 55, 38 45, 50 35 Z"
            className={isNight ? 'fill-[#F6E05E]/10 stroke-[#F6E05E]/80' : 'fill-[#B08D57]/10 stroke-[#B08D57]/80'}
            strokeWidth="1.5"
          />
          <path
            d="M50 45 C70 52, 75 62, 50 75 C25 62, 30 52, 50 45 Z"
            className={isNight ? 'fill-[#F6E05E]/5 stroke-[#F6E05E]/60' : 'fill-[#B08D57]/5 stroke-[#B08D57]/60'}
            strokeWidth="1.5"
          />
          <circle cx="50" cy="74" r="3" className={isNight ? 'fill-[#F6E05E]' : 'fill-[#B08D57]'} />
        </svg>
      </motion.div>

      {/* Heading & Subtitle */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`font-heading text-3xl md:text-4xl font-semibold mb-3 ${
          isNight ? 'text-white' : 'text-[#2F2018]'
        }`}
      >
        What's on your mind today?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`text-base md:text-lg mb-10 max-w-md ${
          isNight ? 'text-white/60' : 'text-[#4A392E]/70'
        }`}
      >
        I'm here to listen without judgement.
      </motion.p>

      {/* Suggestion Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
      >
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion && onSelectSuggestion(item.prompt)}
            className={`p-4 rounded-xl text-left border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent ${
              isNight
                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/90 shadow-soft'
                : 'bg-white/80 border-[#2E1C12]/10 hover:bg-white hover:border-[#2E1C12]/20 text-[#3D2A1D] shadow-soft'
            }`}
          >
            <div className="font-semibold text-sm mb-1">{item.label}</div>
            <div className={`text-xs line-clamp-2 ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
              {item.prompt}
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
