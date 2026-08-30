import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ChatHeader } from './ChatHeader';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to group message versions for regeneration
const groupMessages = (rawMessages) => {
  const grouped = [];
  
  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i];
    
    if (msg.role === 'user') {
      const lastGrouped = grouped[grouped.length - 1]; // Previous assistant message
      const prevUserGrouped = grouped[grouped.length - 2]; // Preceding user message
      
      // If this user message is consecutive and identical to the previous user message, it's a regeneration
      if (prevUserGrouped && prevUserGrouped.role === 'user' && prevUserGrouped.content === msg.content) {
        const nextMsg = rawMessages[i + 1];
        if (nextMsg && nextMsg.role === 'assistant') {
          if (lastGrouped && lastGrouped.role === 'assistant') {
            if (!lastGrouped.versions) {
              lastGrouped.versions = [lastGrouped.content];
            }
            lastGrouped.versions.push(nextMsg.content);
            if (nextMsg.animateTyping) {
              lastGrouped.animateTyping = true;
            }
            i++; // Skip the next assistant message
            continue;
          }
        }
      }
    }
    
    if (msg.role === 'assistant') {
      grouped.push({
        ...msg,
        versions: [msg.content]
      });
    } else {
      grouped.push({
        ...msg
      });
    }
  }
  
  return grouped;
};

export const ChatLayout = () => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Separate loading states for skeletons vs typing indicators
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await api.get('/api/chat');
        const data = res.data.data;

        const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
        const conversationsWithCustomTitles = data.map(c => {
          if (customTitles[c._id]) {
            return { ...c, title: customTitles[c._id] };
          }
          return c;
        });
        setConversations(conversationsWithCustomTitles);

        if (data && data.length > 0) {
          const savedId = localStorage.getItem('wisdom_current_conversation_id');
          let selectedConv = data.find(c => c._id === savedId);
          if (!selectedConv) {
            selectedConv = data[0]; // fallback to the most recently updated
          }
          // Fetch full conversation history
          const convRes = await api.get(`/api/chat/${selectedConv._id}`);
          let fullConv = convRes.data.data;
          if (customTitles[fullConv._id]) {
            fullConv = { ...fullConv, title: customTitles[fullConv._id] };
          }
          setCurrentConversation(fullConv);
          setMessages(fullConv.messages || []);
          localStorage.setItem('wisdom_current_conversation_id', selectedConv._id);
        } else {
          setCurrentConversation(null);
          setMessages([]);
          localStorage.removeItem('wisdom_current_conversation_id');
        }
      } catch (error) {
        console.error('Error fetching conversations on load:', error);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleSelectConversation = async (conversationId) => {
    setIsTyping(false);
    setIsHistoryLoading(true);
    try {
      const res = await api.get(`/api/chat/${conversationId}`);
      let conv = res.data.data;
      const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
      if (customTitles[conv._id]) {
        conv = { ...conv, title: customTitles[conv._id] };
      }
      setCurrentConversation(conv);
      setMessages(conv.messages || []);
      localStorage.setItem('wisdom_current_conversation_id', conversationId);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleNewConversation = () => {
    setIsTyping(false);
    setCurrentConversation(null);
    setMessages([]);
    localStorage.removeItem('wisdom_current_conversation_id');
  };

  const handleRenameConversation = (id, newTitle) => {
    setConversations(prev => prev.map(c => {
      if (c._id === id) {
        return { ...c, title: newTitle };
      }
      return c;
    }));
    if (currentConversation?._id === id) {
      setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.delete(`/api/chat/${conversationId}`);
      
      const remaining = conversations.filter(c => c._id !== conversationId);
      setConversations(remaining);

      // Clean up custom title in local storage
      const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
      if (customTitles[conversationId]) {
        delete customTitles[conversationId];
        localStorage.setItem('wisdom_custom_titles', JSON.stringify(customTitles));
      }

      if (currentConversation?._id === conversationId) {
        if (remaining.length > 0) {
          const nextConv = remaining[0];
          const convRes = await api.get(`/api/chat/${nextConv._id}`);
          let fullConv = convRes.data.data;
          if (customTitles[fullConv._id]) {
            fullConv = { ...fullConv, title: customTitles[fullConv._id] };
          }
          setCurrentConversation(fullConv);
          setMessages(fullConv.messages || []);
          localStorage.setItem('wisdom_current_conversation_id', nextConv._id);
        } else {
          setCurrentConversation(null);
          setMessages([]);
          localStorage.removeItem('wisdom_current_conversation_id');
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Elegant local & stored title generator from first message
  const generateAiTitle = (conversationId, firstUserMessage) => {
    try {
      const words = firstUserMessage.trim().split(/\s+/).slice(0, 5).join(' ');
      const cleanTitle = words.length > 35 ? words.slice(0, 32) + '...' : words;
      const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
      if (!customTitles[conversationId]) {
        customTitles[conversationId] = formattedTitle;
        localStorage.setItem('wisdom_custom_titles', JSON.stringify(customTitles));

        setConversations(prev => prev.map(c => {
          if (c._id === conversationId) {
            return { ...c, title: formattedTitle };
          }
          return c;
        }));

        if (currentConversation?._id === conversationId) {
          setCurrentConversation(prev => prev ? { ...prev, title: formattedTitle } : null);
        }
      }
    } catch (err) {
      console.error('Failed to generate conversation title:', err);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // 1. Create the optimistic user message object with unique temporary ID
    const tempId = 'temp_' + Date.now();
    const optimisticUserMsg = {
      _id: tempId,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString()
    };

    // 2. Append to local messages state immediately
    setMessages(prev => [...prev, optimisticUserMsg]);
    setLoading(true);

    try {
      let conversation = currentConversation;
      let isNew = false;
      if (!conversation) {
        isNew = true;
        const createRes = await api.post('/api/chat/new');
        conversation = createRes.data.data;
        setCurrentConversation(conversation);
        localStorage.setItem('wisdom_current_conversation_id', conversation._id);
      }

      const messageRes = await api.post(`/api/chat/${conversation._id}/message`, {
        content: messageText
      });

      const updatedConversation = messageRes.data.data;
      const customTitles = JSON.parse(localStorage.getItem('wisdom_custom_titles') || '{}');
      let conv = updatedConversation;
      if (customTitles[conv._id]) {
        conv = { ...conv, title: customTitles[conv._id] };
      }

      const latestMessages = conv.messages || [];
      if (latestMessages.length > 0) {
        const lastMsg = latestMessages[latestMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          setIsTyping(true);
          const formattedMessages = [
            ...latestMessages.slice(0, -1),
            { ...lastMsg, animateTyping: true }
          ];
          setMessages(formattedMessages);
        } else {
          setMessages(latestMessages);
        }
      } else {
        setMessages(latestMessages);
      }

      setCurrentConversation(conv);

      if (isNew) {
        setConversations(prev => [conv, ...prev]);
        generateAiTitle(conv._id, messageText);
      } else {
        setConversations(prev => {
          const filtered = prev.filter(c => c._id !== conv._id);
          return [conv, ...filtered];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // APPLICATION-LAYER error notice — NOT generated by the AI model.
      // The AI must never claim to have personal reasons for a failure.
      const statusCode = error?.response?.status;
      const uiErrorText = statusCode === 503
        ? "Something interrupted our conversation — the AI couldn't respond right now. Please try again in a moment."
        : "Something went wrong sending your message. Please try again.";
      const errorMsg = {
        role: 'assistant',
        content: uiErrorText,
        isError: true,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Find the last user message to resend
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const grouped = groupMessages(messages);

  return (
    <div className={`h-screen w-full flex overflow-hidden transition-colors duration-700 ${isNight ? 'bg-[#0B1120] text-white' : 'bg-[#FCF8F2] text-[#2F2018]'}`}>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full flex-shrink-0 min-h-0">
        <Sidebar 
          conversations={conversations}
          currentConversationId={currentConversation?._id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          isHistoryLoading={isHistoryLoading}
        />
      </div>

      {/* Sliding Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 h-full flex-shrink-0"
            >
              <Sidebar 
                conversations={conversations}
                currentConversationId={currentConversation?._id}
                onSelectConversation={(id) => {
                  handleSelectConversation(id);
                  setIsSidebarOpen(false);
                }}
                onNewConversation={() => {
                  handleNewConversation();
                  setIsSidebarOpen(false);
                }}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                isHistoryLoading={isHistoryLoading}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Area Main Container */}
      <main className="flex-1 min-w-0 h-full flex flex-col min-h-0 overflow-hidden relative">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
        <ChatArea 
          messages={grouped}
          loading={loading}
          isTyping={isTyping}
          isHistoryLoading={isHistoryLoading}
          onSend={handleSendMessage}
          onRegenerate={handleRegenerate}
          onTypingComplete={() => setIsTyping(false)}
        />
      </main>
    </div>
  );
};
export default ChatLayout;
