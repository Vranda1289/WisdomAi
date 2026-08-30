import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, BookOpen, Clock, Activity, Heart, 
  Brain, GraduationCap, Award, Compass, MessageSquare, Flame, Quote
} from 'lucide-react';

export const ReflectionDashboard = () => {
  const { theme } = useTheme();
  const isNight = theme === themeConstants.NIGHT_REFLECTION;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Load conversations list for Sidebar functionality
  useEffect(() => {
    const loadConversations = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await api.get('/api/chat');
        setConversations(res.data.data);
      } catch (err) {
        console.error('Failed to load conversations in dashboard:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadConversations();
  }, []);

  // Load reflection data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/reflection/dashboard');
        setDashboardData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSelectConversation = (conversationId) => {
    localStorage.setItem('wisdom_current_conversation_id', conversationId);
    navigate('/chat');
  };

  const handleNewConversation = () => {
    localStorage.removeItem('wisdom_current_conversation_id');
    navigate('/chat');
  };

  // Get nice icon for themes
  const getThemeIcon = (themeName) => {
    const lower = themeName.toLowerCase();
    if (lower.includes('placement') || lower.includes('career')) return <GraduationCap size={16} />;
    if (lower.includes('study') || lower.includes('learning') || lower.includes('coding')) return <BookOpen size={16} />;
    if (lower.includes('relationship') || lower.includes('family')) return <Heart size={16} />;
    if (lower.includes('self') || lower.includes('growth') || lower.includes('confidence')) return <Compass size={16} />;
    if (lower.includes('anxiety') || lower.includes('fear') || lower.includes('stress')) return <Brain size={16} />;
    return <Activity size={16} />;
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: 'easeOut' } }
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden transition-colors duration-700 ${isNight ? 'bg-[#0B1120] text-white' : 'bg-[#FCF8F2] text-[#2F2018]'}`}>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full flex-shrink-0 min-h-0">
        <Sidebar 
          conversations={conversations}
          currentConversationId={null}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isHistoryLoading={isHistoryLoading}
        />
      </div>

      {/* Sliding Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 h-full flex-shrink-0"
            >
              <Sidebar 
                conversations={conversations}
                currentConversationId={null}
                onSelectConversation={(id) => {
                  handleSelectConversation(id);
                  setIsSidebarOpen(false);
                }}
                onNewConversation={() => {
                  handleNewConversation();
                  setIsSidebarOpen(false);
                }}
                isHistoryLoading={isHistoryLoading}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Main Content */}
      <main className="flex-1 min-w-0 h-full flex flex-col min-h-0 overflow-y-auto relative pr-1">
        {/* Header with Mobile toggle */}
        <header className="px-6 py-4 flex items-center justify-between border-b md:border-none border-neutral-200/10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="font-heading text-lg font-medium tracking-wide">Sanctuary of Reflections</span>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="text-center font-heading text-md text-accent flex flex-col items-center gap-3"
            >
              <span className="text-3xl">🌿</span>
              <span className="font-light">Wisdom is looking back at your journey...</span>
            </motion.div>
          </div>
        ) : dashboardData?.isEmpty ? (
          /* Empty State */
          <div className="flex-grow flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className={`max-w-md w-full p-8 rounded-2xl border text-center ${
                isNight 
                  ? 'bg-[#1E2530]/40 border-white/5 shadow-glass backdrop-blur-md' 
                  : 'bg-white/70 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <span className="text-4xl block mb-6">🌿</span>
              <h2 className={`font-heading text-lg leading-relaxed mb-8 ${isNight ? 'text-white/95' : 'text-[#3D2A1D]'}`}>
                Your journey begins with a single conversation.<br /><br />
                <span className="text-sm font-light opacity-80">
                  When we spend more time together, this page will slowly become your mirror.
                </span>
              </h2>
              <button 
                onClick={handleNewConversation}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isNight 
                    ? 'bg-white text-black hover:bg-neutral-200' 
                    : 'bg-[#3D2A1D] text-white hover:bg-[#2A1D14]'
                }`}
              >
                Begin Conversation
              </button>
            </motion.div>
          </div>
        ) : (
          /* Reflection Dashboard Content */
          <div className="p-6 space-y-12 max-w-4xl mx-auto w-full pb-32">
            
            {/* 1. Hero Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-6 ${
                isNight 
                  ? 'bg-gradient-to-br from-[#1E2530]/50 to-[#2A2F45]/20 border-white/10 shadow-glass' 
                  : 'bg-gradient-to-br from-amber-50/50 to-orange-100/30 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <span className="text-5xl select-none">🌿</span>
              <div className="flex-grow text-center md:text-left space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-2xl font-heading font-medium">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour < 12) return 'Good Morning';
                      if (hour < 17) return 'Good Afternoon';
                      return 'Good Evening';
                    })()}, {user?.name || 'Friend'}. 🌿
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={() => navigate('/chat')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isNight ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-stone-50 text-[#3D2A1D] border-stone-200 shadow-xs'
                      }`}
                    >
                      Continue Chat
                    </button>
                    <button
                      onClick={() => navigate('/journal')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                        isNight ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                      }`}
                    >
                      Open Journal
                    </button>
                  </div>
                </div>
                <p className={`text-[15px] leading-relaxed max-w-2xl font-light ${isNight ? 'text-white/90' : 'text-[#3D2A1D]/90'}`}>
                  It's good to see you again. Over the past <strong className="font-semibold text-accent">{dashboardData.stats.daysGrowing} days</strong>, we've shared conversations about fear, hope, relationships, career, and growth. Thank you for letting me walk a small part of your journey.
                </p>
              </div>
            </motion.div>

            {/* 2. Journey Snapshot */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { label: "Conversations Shared", value: dashboardData.stats.totalConversations, icon: <MessageSquare size={16} className="text-[#d87d56]" /> },
                { label: "Days We've Walked Together", value: dashboardData.stats.daysGrowing, icon: <Calendar size={16} className="text-[#5ea28d]" /> },
                { label: "Consistency", value: `${dashboardData.stats.currentStreak} days`, icon: <Flame size={16} className="text-orange-500" /> },
                { label: "Moments Shared", value: `${dashboardData.stats.hoursReflecting} hrs`, icon: <Clock size={16} className="text-purple-400" /> }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex flex-col justify-between min-h-[96px] ${
                    isNight ? 'bg-[#1E2530]/40 border-white/5 shadow-glass' : 'bg-white/60 border-[#2E1C12]/5 shadow-soft'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/45'}`}>{stat.label}</span>
                    {stat.icon}
                  </div>
                  <span className="text-xl font-semibold tracking-tight">{stat.value}</span>
                </div>
              ))}
            </motion.div>

            {/* 3. This Week */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-6 rounded-2xl border ${
                isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <h3 className="text-lg font-heading mb-6 flex items-center gap-2">
                <span>🌱</span> This Week
              </h3>
              <div className="space-y-4">
                {dashboardData.thisWeek?.map((observation, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="text-base select-none">🌱</span>
                    <p className={`text-[14px] leading-relaxed ${isNight ? 'text-white/85' : 'text-[#3D2A1D]/85'}`}>
                      {observation}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 4. Reflection Letter */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-8 rounded-2xl border relative overflow-hidden font-body ${
                isNight 
                  ? 'bg-gradient-to-br from-[#1b2130] to-[#121620] border-white/5 shadow-glass' 
                  : 'bg-gradient-to-br from-[#FCFBF8] to-[#F5EFE6] border-[#2E1C12]/15 shadow-soft'
              }`}
            >
              <h3 className="text-md font-medium mb-6 text-accent font-heading">
                One thing I've noticed...
              </h3>
              <p className={`text-[15px] leading-relaxed whitespace-pre-line ${
                isNight ? 'text-white/90 font-light' : 'text-[#3D2A1D]/90'
              }`}>
                {dashboardData.reflection}
              </p>
            </motion.div>

            {/* 5 & 6. Emotional Landscape & Themes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 5. Emotional Landscape */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                }`}
              >
                <h3 className="text-lg font-heading mb-6 flex items-center gap-2">
                  <span>🎭</span> Emotional Landscape
                </h3>
                <div className="space-y-4">
                  {dashboardData.emotionTrend.map((emotion, idx) => {
                    const colors = [
                      'from-[#5ea28d]/80 to-[#5ea28d]/40',
                      'from-[#d87d56]/80 to-[#d87d56]/40',
                      'from-[#6b92a4]/80 to-[#6b92a4]/40',
                      'from-amber-400/80 to-amber-400/40',
                      'from-purple-500/80 to-purple-500/40'
                    ];
                    const selectedColor = colors[idx % colors.length];

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{emotion.name}</span>
                          <span className={`${isNight ? 'text-white/60' : 'text-[#3D2A1D]/60'}`}>{emotion.percentage}%</span>
                        </div>
                        <div className={`h-2 w-full rounded-full ${isNight ? 'bg-white/5' : 'bg-black/5'} overflow-hidden`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${emotion.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${selectedColor}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* 6. Conversation Themes */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                }`}
              >
                <h3 className="text-lg font-heading mb-6 flex items-center gap-2">
                  <span>💼</span> Conversation Themes
                </h3>
                <div className="space-y-3">
                  {dashboardData.themes.map((theme, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isNight ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${isNight ? 'bg-white/10' : 'bg-black/5'}`}>
                          {getThemeIcon(theme.name)}
                        </span>
                        <span className="text-[13px] font-semibold">{theme.name}</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${isNight ? 'bg-white/10 text-white/60' : 'bg-[#3D2A1D]/10 text-[#3D2A1D]/60'}`}>
                        {theme.count} times
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 7. Growth Timeline */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-6 rounded-2xl border ${
                isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <h3 className="text-lg font-heading mb-8 flex items-center gap-2">
                <span>🌱</span> Growth Timeline
              </h3>
              
              <div className="relative pl-6 border-l border-accent/25 space-y-8 ml-2">
                {dashboardData.timeline.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="relative"
                  >
                    <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-current flex items-center justify-center shadow" />
                    
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent block mb-1">
                      {item.month}
                    </span>
                    <p className={`text-[14px] leading-relaxed ${isNight ? 'text-white/80 font-light' : 'text-[#3D2A1D]/80'}`}>
                      {item.milestone}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 8. Gentle Focus */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-6 rounded-2xl border ${
                isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <h3 className="text-lg font-heading mb-4 flex items-center gap-2">
                <span>🕯️</span> Maybe this deserves a little more attention...
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.focusAreas.map((focus, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      isNight ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                    }`}
                  >
                    <span className="text-[#d87d56] text-sm">✦</span>
                    <p className={`text-[13.5px] font-medium ${isNight ? 'text-white/95' : 'text-[#3D2A1D]/95'}`}>
                      {focus}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 9. Today's Wisdom */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-8 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
                isNight 
                  ? 'bg-[#1E2530]/40 border-white/5 shadow-glass' 
                  : 'bg-white/90 border-[#2E1C12]/10 shadow-soft'
              }`}
            >
              <span className="text-xs uppercase tracking-widest text-accent font-bold mb-4 flex items-center gap-1.5">
                <Quote size={12} /> Today's Wisdom
              </span>
              <p className={`font-heading text-lg md:text-xl leading-relaxed mb-4 max-w-xl ${isNight ? 'text-white/95 font-light' : 'text-[#3D2A1D]'}`}>
                "{dashboardData.todaysWisdom?.quote}"
              </p>
              <span className={`text-[11px] italic ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                — {dashboardData.todaysWisdom?.source}
              </span>
            </motion.div>

            {/* 10. Letters to Yourself */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`p-8 rounded-2xl border font-body relative overflow-hidden ${
                isNight 
                  ? 'bg-gradient-to-br from-[#1A2035] to-[#0A0D1A] border-white/5 shadow-glass' 
                  : 'bg-gradient-to-br from-[#FCFBF6] to-[#F2EAE0] border-[#2E1C12]/15 shadow-soft'
              }`}
            >
              <div className="absolute top-4 right-6 text-3xl opacity-10 select-none">✉</div>
              <p className={`text-[14px] leading-relaxed whitespace-pre-line ${
                isNight ? 'text-white/85 font-light' : 'text-[#3D2A1D]/85'
              }`}>
                {dashboardData.letterToSelf}
              </p>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
};
export default ReflectionDashboard;
