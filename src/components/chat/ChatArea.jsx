import { useRef, useEffect, useState } from 'react';
import { EmptyState } from './EmptyState';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export const ChatArea = ({ 
  messages = [], 
  loading = false, 
  isTyping = false, 
  isHistoryLoading = false, 
  onSend, 
  onRegenerate,
  onTypingComplete 
}) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const hasMessages = messages.length > 0 || isHistoryLoading;

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const threshold = 100;
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    isNearBottomRef.current = isNear;
  };

  // Smart height change trigger for typing effect
  const handleHeightChange = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    if (isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isLastMessageUser = messages.length > 0 && messages[messages.length - 1].role === 'user';

    if (isLastMessageUser || isNearBottomRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, loading, isHistoryLoading]);

  const renderSkeletons = () => {
    return (
      <div className="space-y-8 mt-8">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex w-full ${n % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
            <div className={`h-16 rounded-2xl w-2/3 max-w-md ${
              n % 2 === 0
                ? (isNight ? 'bg-[#5C4A3A]/40' : 'bg-[#8C5A3C]/20')
                : (isNight ? 'bg-[#2D3748]/30 border border-white/5' : 'bg-white/40 border border-black/5')
            }`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        data-lenis-prevent
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-8"
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
              <EmptyState 
                hasMessages={hasMessages} 
                onSelectSuggestion={(prompt) => setInputText(prompt)}
              />
              
              {isHistoryLoading ? (
                renderSkeletons()
              ) : (
                hasMessages && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col mt-8"
                  >
                    {messages.map((msg, idx) => (
                      <MessageBubble 
                        key={msg._id || `msg_${idx}_${msg.role}_${msg.createdAt || ''}`}
                        message={msg}
                        index={idx}
                        onRegenerate={onRegenerate}
                        onHeightChange={handleHeightChange}
                        onTypingComplete={idx === messages.length - 1 ? onTypingComplete : undefined}
                      />
                    ))}
                    <AnimatePresence>
                      {loading && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-4"
                        >
                          <TypingIndicator />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pb-6 flex-shrink-0">
        <MessageInput 
          value={inputText}
          onChange={setInputText}
          onSend={onSend} 
          disabled={loading || isTyping || isHistoryLoading} 
        />
      </div>
    </div>
  );
};
export default ChatArea;
