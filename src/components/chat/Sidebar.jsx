import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({
  conversations = [],
  currentConversationId = null,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  isHistoryLoading = false,
  onClose
}) => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const navigate = useNavigate();

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    if (activeMenuId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeMenuId]);

  const handleLogout = () => {
    localStorage.removeItem('wisdom_current_conversation_id');
    logout();
    navigate('/');
  };

  const groupConversationsByDate = (convs) => {
    const today = [];
    const yesterday = [];
    const previous7Days = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfSevenDaysAgo = new Date(startOfToday);
    startOfSevenDaysAgo.setDate(startOfSevenDaysAgo.getDate() - 7);

    convs.forEach(conv => {
      const updatedDate = new Date(conv.updatedAt || conv.createdAt);
      if (updatedDate >= startOfToday) {
        today.push(conv);
      } else if (updatedDate >= startOfYesterday) {
        yesterday.push(conv);
      } else if (updatedDate >= startOfSevenDaysAgo) {
        previous7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return { today, yesterday, previous7Days, older };
  };

  const getConversationTitle = (conv) => {
    const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
    if (customTitles[conv._id]) {
      return customTitles[conv._id];
    }
    if (conv.title && conv.title !== 'New Conversation') {
      return conv.title;
    }
    if (conv.messages && conv.messages.length > 0) {
      const firstUserMsg = conv.messages.find(m => m.role === 'user');
      if (firstUserMsg && firstUserMsg.content) {
        return firstUserMsg.content;
      }
    }
    return conv.title || 'New Conversation';
  };

  const handleSaveRename = (id) => {
    if (!editTitle.trim()) {
      setEditingConversationId(null);
      return;
    }
    const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
    customTitles[id] = editTitle.trim();
    localStorage.setItem('wisdom_custom_titles', JSON.stringify(customTitles));
    
    if (onRenameConversation) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingConversationId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter conversations instantly in client
  const filteredConversations = conversations.filter(conv => {
    const title = getConversationTitle(conv).toLowerCase();
    const firstUserMsg = conv.messages?.find(m => m.role === 'user')?.content?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || firstUserMsg.includes(query);
  });

  const grouped = groupConversationsByDate(filteredConversations);

  const renderConvItem = (conv) => {
    const isActive = conv._id === currentConversationId;
    const title = getConversationTitle(conv);
    return (
      <div
        key={conv._id}
        onClick={() => onSelectConversation(conv._id)}
        className={`group relative z-0 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-between focus-within:ring-2 focus-within:ring-accent/50 focus-within:outline-none ${
          isActive
            ? (isNight ? 'bg-surface/40 text-white font-medium shadow-soft' : 'bg-surface/60 text-[#2F2018] font-medium shadow-soft')
            : (isNight ? 'text-white/70 hover:bg-surface/20 hover:text-white' : 'text-[#3D2A1D]/80 hover:bg-surface/30 hover:text-[#3D2A1D]')
        }`}
      >
        {/* Subtle left accent bar */}
        {isActive && (
          <motion.div
            layoutId="activeAccentBar"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-accent"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Smooth background layout slide */}
        {isActive && (
          <motion.div
            layoutId="activeConversationBg"
            className={`absolute inset-0 rounded-lg -z-10 ${
              isNight ? 'bg-surface/40' : 'bg-surface/60'
            }`}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {editingConversationId === conv._id ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv._id);
              if (e.key === 'Escape') setEditingConversationId(null);
            }}
            onBlur={() => handleSaveRename(conv._id)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-accent ${
              isNight 
                ? 'bg-slate-800 border-white/20 text-white focus:border-accent' 
                : 'bg-white border-[#3D2A1D]/20 text-[#3D2A1D] focus:border-secondary'
            }`}
          />
        ) : (
          <div className="flex-1 min-w-0 pr-2">
            <span className="font-body text-[14px] leading-snug break-words line-clamp-2 block">
              {title}
            </span>
            <span className={`text-[11px] mt-1 block font-light ${isActive ? (isNight ? 'text-white/60' : 'text-[#3D2A1D]/60') : (isNight ? 'text-white/40' : 'text-[#3D2A1D]/45')}`}>
              {formatDate(conv.updatedAt || conv.createdAt)}
            </span>
          </div>
        )}

        {editingConversationId !== conv._id && (
          <div className="flex-shrink-0 relative z-10 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === conv._id ? null : conv._id);
              }}
              className={`p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-surface/80 transition-all ${
                isActive ? 'text-current' : (isNight ? 'text-white/50 hover:text-white' : 'text-[#3D2A1D]/50 hover:text-[#3D2A1D]')
              }`}
              aria-label="Conversation actions"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>

            <AnimatePresence>
              {activeMenuId === conv._id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 mt-1 w-44 rounded-lg shadow-lg py-1 z-50 border ${
                    isNight 
                      ? 'bg-[#1E2530] border-white/10 text-white' 
                      : 'bg-white border-[#2E1C12]/10 text-[#3D2A1D]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setEditingConversationId(conv._id);
                      setEditTitle(title);
                      setActiveMenuId(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 ${
                      isNight ? 'hover:bg-white/5' : 'hover:bg-[#3D2A1D]/5'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteConversation) {
                        onDeleteConversation(conv._id);
                      }
                      setActiveMenuId(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-red-500 ${
                      isNight ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  const renderSkeletons = () => {
    return (
      <div className="space-y-4 px-2 py-4">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="flex flex-col gap-2 animate-pulse">
            <div className={`h-4 w-3/4 rounded-md ${isNight ? 'bg-white/10' : 'bg-black/5'}`} />
            <div className={`h-3 w-1/2 rounded-md ${isNight ? 'bg-white/5' : 'bg-black/5'}`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className={`w-[260px] h-full flex flex-col min-h-0 overflow-hidden p-4 border-r transition-colors duration-700 ${isNight ? 'bg-[#121620]/80 border-white/10 text-white/90' : 'bg-[#FDFBF7]/80 border-[#2E1C12]/10 text-[#3D2A1D]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-2 px-2">
        <span className="font-heading text-lg font-bold tracking-wide">Wisdom AI</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate('/')} 
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${isNight ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-[#3D2A1D]/10 text-[#3D2A1D]/70 hover:text-[#3D2A1D]'}`} 
            title="Return Home"
            aria-label="Return home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className={`p-1.5 rounded-lg transition-colors md:hidden focus-visible:ring-2 focus-visible:ring-accent ${isNight ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-[#3D2A1D]/10 text-[#3D2A1D]/70 hover:text-[#3D2A1D]'}`} 
              title="Close Sidebar"
              aria-label="Close sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Conversations Input */}
      <div className="px-1 mb-4 relative">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none border transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
            isNight 
              ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent' 
              : 'bg-black/5 border-[#2E1C12]/10 text-[#3D2A1D] placeholder:text-[#3D2A1D]/40 focus:border-secondary'
          }`}
          aria-label="Search conversations"
        />
        <svg className={`absolute left-4 top-2.5 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/45'}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>

      {/* New Conversation Button */}
      <div className="mb-4">
        <button 
          onClick={onNewConversation}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent ${isNight ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#3D2A1D]/10 hover:bg-[#3D2A1D]/5 text-[#3D2A1D]'}`}
          aria-label="Start a new conversation"
        >
          <span className="text-base select-none">🌿</span>
          <span className="font-semibold text-xs tracking-wide">New Conversation</span>
        </button>
      </div>

      {/* Conversations List */}
      <div 
        data-lenis-prevent
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-1 space-y-5"
      >
        {isHistoryLoading ? (
          renderSkeletons()
        ) : (
          <>
            {grouped.today.length > 0 && (
              <div>
                <h3 className={`text-[10px] uppercase font-bold tracking-wider mb-2 px-2 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/35'}`}>Today</h3>
                <div className="space-y-1">
                  {grouped.today.map(conv => renderConvItem(conv))}
                </div>
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div>
                <h3 className={`text-[10px] uppercase font-bold tracking-wider mb-2 px-2 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/35'}`}>Yesterday</h3>
                <div className="space-y-1">
                  {grouped.yesterday.map(conv => renderConvItem(conv))}
                </div>
              </div>
            )}

            {grouped.previous7Days.length > 0 && (
              <div>
                <h3 className={`text-[10px] uppercase font-bold tracking-wider mb-2 px-2 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/35'}`}>Previous 7 Days</h3>
                <div className="space-y-1">
                  {grouped.previous7Days.map(conv => renderConvItem(conv))}
                </div>
              </div>
            )}

            {grouped.older.length > 0 && (
              <div>
                <h3 className={`text-[10px] uppercase font-bold tracking-wider mb-2 px-2 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/35'}`}>Older</h3>
                <div className="space-y-1">
                  {grouped.older.map(conv => renderConvItem(conv))}
                </div>
              </div>
            )}

            {filteredConversations.length === 0 && (
              <div className={`px-4 py-8 text-center text-xs ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/45'}`}>
                {searchQuery ? 'No matching conversations' : 'No conversations yet.'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`pt-3 border-t mt-3 space-y-1 ${isNight ? 'border-white/10' : 'border-[#2E1C12]/10'}`}>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent ${isNight ? 'hover:bg-white/10 text-white/80' : 'hover:bg-[#3D2A1D]/5 text-[#3D2A1D]/80'}`}
          aria-label="Settings"
        >
          <span className="text-sm select-none">⚙</span> Settings
        </button>
        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent ${isNight ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
          aria-label="Logout"
        >
          <span className="text-sm select-none">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};
