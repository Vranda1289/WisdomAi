import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion } from 'framer-motion';
import { useTypingEffect } from '../../hooks/useTypingEffect';

// Lazy load the Markdown Renderer
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

export const MessageBubble = ({ message, index, onTypingComplete, onRegenerate, onHeightChange }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const isUser = message.role === 'user';

  const delay = isUser ? 0 : 0.05;

  // Track active version for assistant messages (defaults to last version)
  const [currentVersion, setCurrentVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (message.versions) {
      setCurrentVersion(message.versions.length - 1);
    }
  }, [message.versions?.length]);

  const activeText = message.versions ? message.versions[currentVersion] : message.content;

  const { displayText, isCompleted } = useTypingEffect(
    activeText,
    message.animateTyping === true && (!message.versions || currentVersion === message.versions.length - 1),
    15, // speed
    onTypingComplete
  );

  useEffect(() => {
    if (message.animateTyping === true && !isCompleted && onHeightChange) {
      onHeightChange();
    }
  }, [displayText, isCompleted, onHeightChange]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevVersion = (e) => {
    e.stopPropagation();
    if (currentVersion > 0) {
      setCurrentVersion(prev => prev - 1);
    }
  };

  const handleNextVersion = (e) => {
    e.stopPropagation();
    if (message.versions && currentVersion < message.versions.length - 1) {
      setCurrentVersion(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
      className={`group w-full flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6`}
    >
      <div className={`relative max-w-[85%] md:max-w-[78%] transition-all duration-300`}>
        {/* Main Message Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl text-[15px] leading-[1.6] shadow-soft ${
            isUser
              ? (isNight ? 'bg-[#5C4A3A] text-[#F8F5F2] rounded-tr-sm' : 'bg-[#8C5A3C] text-white rounded-tr-sm')
              : (isNight ? 'bg-[#2D3748]/50 backdrop-blur-md text-white/90 border border-white/10 rounded-tl-sm' : 'bg-white/70 backdrop-blur-md text-[#2F2018] rounded-tl-sm border border-white/40')
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-body text-[14.5px] select-text">{message.content}</div>
          ) : (
            <div className="relative">
              <Suspense fallback={
                <div className="animate-pulse space-y-2 py-2">
                  <div className="h-4 bg-current/10 rounded w-3/4"></div>
                  <div className="h-4 bg-current/10 rounded w-5/6"></div>
                  <div className="h-4 bg-current/10 rounded w-2/3"></div>
                </div>
              }>
                <MarkdownRenderer content={displayText} />
              </Suspense>
              {!isCompleted && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Hover Toolbar & Pagination for Assistant Messages */}
        {!isUser && isCompleted && (
          <div className="flex items-center justify-between mt-1.5 px-1 text-xs select-none min-h-[24px]">
            {/* Version Pagination (ChatGPT style) */}
            {message.versions && message.versions.length > 1 ? (
              <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 border ${
                isNight ? 'bg-[#1E2530]/60 border-white/10 text-white/60' : 'bg-white/60 border-black/5 text-[#3D2A1D]/60'
              }`}>
                <button
                  onClick={handlePrevVersion}
                  disabled={currentVersion === 0}
                  className="hover:text-accent disabled:opacity-30 disabled:hover:text-current transition-colors p-0.5 focus:outline-none"
                  aria-label="Previous version"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span className="text-[10px] font-medium tracking-wider">
                  {currentVersion + 1} / {message.versions.length}
                </span>
                <button
                  onClick={handleNextVersion}
                  disabled={currentVersion === message.versions.length - 1}
                  className="hover:text-accent disabled:opacity-30 disabled:hover:text-current transition-colors p-0.5 focus:outline-none"
                  aria-label="Next version"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            ) : (
              <div />
            )}

            {/* Subtle Hover Toolbar */}
            <div className={`opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex items-center gap-3 rounded-lg px-2 py-0.5 ${
              isNight ? 'text-white/50' : 'text-[#3D2A1D]/50'
            }`}>
              <button
                onClick={handleCopy}
                className="hover:text-accent transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
                aria-label="Copy entire response"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span className="text-green-500 font-medium">✓ Copied</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copy Response</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRegenerate) onRegenerate(index);
                }}
                className="hover:text-accent transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
                aria-label="Regenerate response"
                title="Regenerate"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
