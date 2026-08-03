import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion } from 'framer-motion';

export const MessageInput = ({ onSend, disabled, value, onChange }) => {
  const [localText, setLocalText] = useState('');
  const text = onChange ? value : localText;
  const setText = onChange ? onChange : setLocalText;

  const textareaRef = useRef(null);
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  // Auto-resize textarea when text content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const handleSend = () => {
    if (text.trim() && onSend && !disabled) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 md:px-8 max-w-4xl mx-auto w-full transition-colors duration-700">
      <div className={`relative flex items-end p-2 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/50 ${
        isNight ? 'bg-[#1a1f2e]/80 border-white/10 shadow-black/50' : 'bg-white/90 border-[#2E1C12]/10 shadow-gray-200/50'
      } ${disabled ? 'opacity-60' : ''}`}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Wisdom AI is reflecting..." : "Share what's on your mind..."}
          aria-label="Message text"
          className={`flex-1 max-h-[200px] min-h-[44px] p-3 mx-2 bg-transparent resize-none outline-none text-[15px] leading-relaxed transition-colors duration-700 focus:outline-none ${
            isNight ? 'text-white placeholder:text-white/30' : 'text-[#3D2A1D] placeholder:text-[#3D2A1D]/40'
          }`}
          rows={1}
        />
        <motion.button
          whileHover={text.trim() && !disabled ? { scale: 1.05 } : {}}
          whileTap={text.trim() && !disabled ? { scale: 0.95 } : {}}
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          title="Send"
          className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl mb-1 mr-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            disabled || !text.trim() 
              ? (isNight ? 'bg-white/5 text-white/20' : 'bg-[#3D2A1D]/5 text-[#3D2A1D]/20') 
              : (isNight ? 'bg-white text-[#121620]' : 'bg-[#3D2A1D] text-white')
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};
