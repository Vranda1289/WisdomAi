import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, BookOpen, Clock, Activity, Heart, 
  Brain, GraduationCap, Compass, MessageSquare, Flame, Quote
} from 'lucide-react';

export const ReflectionDashboard = () => {
  const { theme } = useTheme();
  const isNight = theme === themeConstants.NIGHT_REFLECTION;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Progressive loading states
  const [stats, setStats] = useState(() => {
    const days = user?.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))) : 1;
    return {
      daysGrowing: days,
      totalConversations: 0,
      currentStreak: 1,
      longestStreak: 1,
      hoursReflecting: 0.1,
      userName: user?.name || 'Friend'
    };
  });
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Load conversations list for Sidebar
  useEffect(() => {
    const loadConversations = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await api.get('/api/chat');
        setConversations(res.data.data || []);
      } catch (err) {
        console.error('Failed to load conversations in dashboard:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadConversations();
  }, []);

  // 1. Fast synchronous stats load (<100ms)
  useEffect(() => {
    const fetchFastStats = async () => {
      try {
        const res = await api.get('/api/reflection/stats');
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch fast reflection stats:', err);
      }
    };
    fetchFastStats();
  }, []);

  // 2. Progressive background insights load
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingInsights(true);
      try {
        const res = await api.get('/api/reflection/dashboard');
        setDashboardData(res.data?.data);
        if (res.data?.data?.stats) {
          setStats(prev => ({ ...prev, ...res.data.data.stats }));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard insights:', err);
      } finally {
        setLoadingInsights(false);
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

  const getThemeIcon = (themeName) => {
    const lower = themeName.toLowerCase();
    if (lower.includes('placement') || lower.includes('career')) return <GraduationCap size={16} />;
    if (lower.includes('study') || lower.includes('learning') || lower.includes('coding')) return <BookOpen size={16} />;
    if (lower.includes('relationship') || lower.includes('family')) return <Heart size={16} />;
    if (lower.includes('self') || lower.includes('growth') || lower.includes('confidence')) return <Compass size={16} />;
    if (lower.includes('anxiety') || lower.includes('fear') || lower.includes('stress')) return <Brain size={16} />;
    return <Activity size={16} />;
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
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

      {/* Dashboard Main Scrollable Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto relative scroll-smooth p-4 md:p-8" data-lenis-prevent>
        
        {/* Header */}
        <header className="px-2 py-3 mb-6 flex items-center justify-between border-b md:border-none border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'}`}
              aria-label="Open sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="font-heading text-xl font-bold tracking-wide flex items-center gap-2">
              <span>🌿</span> Sanctuary of Reflections
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/journal')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium border transition-colors flex items-center gap-1.5 ${
                isNight ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white' : 'border-stone-200 bg-white hover:bg-stone-50 text-[#3D2A1D]'
              }`}
            >
              <BookOpen size={13} /> Journal
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto w-full space-y-10 pb-36">
          
          {/* 1. Hero Journey Card (Loaded Immediately) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-6 ${
              isNight 
                ? 'bg-gradient-to-br from-[#1E2530]/60 to-[#2A2F45]/30 border-white/10 shadow-glass' 
                : 'bg-gradient-to-br from-amber-50/70 to-orange-100/40 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            <span className="text-5xl select-none flex-shrink-0">🌿</span>
            <div className="flex-grow text-center md:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-2xl md:text-3xl font-heading font-medium">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good Morning';
                    if (hour < 17) return 'Good Afternoon';
                    return 'Good Evening';
                  })()}, {user?.name || stats.userName || 'Friend'}. 🌿
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => navigate('/chat')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isNight ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-stone-50 text-[#3D2A1D] border-stone-200 shadow-xs'
                    }`}
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={() => navigate('/journal')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                      isNight ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                    }`}
                  >
                    Open Journal
                  </button>
                </div>
              </div>
              <p className={`text-[15px] leading-relaxed max-w-2xl font-light ${isNight ? 'text-white/90' : 'text-[#3D2A1D]/90'}`}>
                It's good to see you again. Over the past <strong className="font-semibold text-accent">{stats.daysGrowing} days</strong>, we've walked together through quiet thoughts, questions, and personal growth. Thank you for letting me share your journey.
              </p>
            </div>
          </motion.div>

          {/* 2. Journey Snapshot (Fast Real Stats) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Conversations Shared", value: stats.totalConversations, icon: <MessageSquare size={16} className="text-[#d87d56]" /> },
              { label: "Days Walked Together", value: stats.daysGrowing, icon: <Calendar size={16} className="text-[#5ea28d]" /> },
              { label: "Consistency", value: `${stats.currentStreak} days`, icon: <Flame size={16} className="text-orange-500" /> },
              { label: "Moments Shared", value: `${stats.hoursReflecting} hrs`, icon: <Clock size={16} className="text-purple-400" /> }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[105px] ${
                  isNight ? 'bg-[#1E2530]/40 border-white/5 shadow-glass' : 'bg-white/70 border-[#2E1C12]/5 shadow-soft'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/45'}`}>
                    {item.label}
                  </span>
                  {item.icon}
                </div>
                <span className="text-2xl font-semibold tracking-tight">{item.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Progressive AI Sections */}
          {loadingInsights && !dashboardData ? (
            /* Progressive Shimmer Section */
            <div className="space-y-8 animate-pulse">
              <div className={`p-8 rounded-3xl border ${isNight ? 'bg-white/5 border-white/5' : 'bg-white/60 border-black/5'} space-y-4`}>
                <div className="h-4 w-40 rounded bg-current/10" />
                <div className="h-3 w-full rounded bg-current/5" />
                <div className="h-3 w-5/6 rounded bg-current/5" />
                <div className="h-3 w-4/6 rounded bg-current/5" />
                <span className={`text-xs block font-light mt-4 ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                  🌿 Wisdom is quietly reading through your recent thoughts...
                </span>
              </div>
            </div>
          ) : dashboardData?.isEmpty ? (
            /* Gentle New User Mirror State */
            <div className={`p-10 rounded-3xl border text-center space-y-6 ${
              isNight ? 'bg-[#1E2530]/40 border-white/5' : 'bg-white/70 border-[#2E1C12]/10 shadow-soft'
            }`}>
              <span className="text-4xl block">🌱</span>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-heading text-xl font-medium">Your Sanctuary is Blossoming</h3>
                <p className={`text-sm leading-relaxed font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
                  As we share more conversations, this sanctuary will become your personal mirror of milestones, weekly insights, and growth.
                </p>
              </div>
              <button
                onClick={handleNewConversation}
                className={`px-8 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-md ${
                  isNight ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                }`}
              >
                Begin a Conversation
              </button>
            </div>
          ) : (
            /* Full Loaded Dashboard Content */
            <div className="space-y-10">
              
              {/* 3. This Week */}
              {dashboardData?.thisWeek && dashboardData.thisWeek.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-6 md:p-8 rounded-3xl border ${
                    isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                  }`}
                >
                  <h3 className="text-lg font-heading mb-5 flex items-center gap-2 font-semibold">
                    <span>🌱</span> This Week
                  </h3>
                  <div className="space-y-3.5">
                    {dashboardData.thisWeek.map((observation, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className="text-base select-none mt-0.5">🌱</span>
                        <p className={`text-[14.5px] leading-relaxed ${isNight ? 'text-white/85' : 'text-[#3D2A1D]/85'}`}>
                          {observation}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. Reflection Letter: "One thing I've noticed..." */}
              {dashboardData?.reflection && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-8 md:p-10 rounded-3xl border relative overflow-hidden font-body ${
                    isNight 
                      ? 'bg-gradient-to-br from-[#1b2130] to-[#121620] border-white/5 shadow-glass' 
                      : 'bg-gradient-to-br from-[#FCFBF8] to-[#F5EFE6] border-[#2E1C12]/15 shadow-soft'
                  }`}
                >
                  <h3 className="text-base font-medium mb-4 text-accent font-heading">
                    One thing I've noticed...
                  </h3>
                  <p className={`text-[15px] leading-[1.8] whitespace-pre-line ${
                    isNight ? 'text-white/90 font-light' : 'text-[#3D2A1D]/90'
                  }`}>
                    {dashboardData.reflection}
                  </p>
                </motion.div>
              )}

              {/* 5 & 6. Emotional Landscape & Themes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 5. Emotional Landscape */}
                {dashboardData?.emotionTrend && dashboardData.emotionTrend.length > 0 && (
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between ${
                      isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                    }`}
                  >
                    <h3 className="text-lg font-heading mb-6 flex items-center gap-2 font-semibold">
                      <span>🎭</span> Emotional Landscape
                    </h3>
                    <div className="space-y-4">
                      {dashboardData.emotionTrend.map((emotion, idx) => {
                        const colors = [
                          'from-[#5ea28d] to-[#5ea28d]/60',
                          'from-[#d87d56] to-[#d87d56]/60',
                          'from-[#6b92a4] to-[#6b92a4]/60',
                          'from-amber-400 to-amber-400/60',
                          'from-purple-500 to-purple-500/60'
                        ];
                        const selectedColor = colors[idx % colors.length];

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{emotion.name}</span>
                              <span className={`${isNight ? 'text-white/60' : 'text-[#3D2A1D]/60'}`}>{emotion.percentage}%</span>
                            </div>
                            <div className={`h-2.5 w-full rounded-full ${isNight ? 'bg-white/5' : 'bg-black/5'} overflow-hidden`}>
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${emotion.percentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className={`h-full rounded-full bg-gradient-to-r ${selectedColor}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 6. Conversation Themes */}
                {dashboardData?.themes && dashboardData.themes.length > 0 && (
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between ${
                      isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                    }`}
                  >
                    <h3 className="text-lg font-heading mb-6 flex items-center gap-2 font-semibold">
                      <span>💼</span> Conversation Themes
                    </h3>
                    <div className="space-y-3">
                      {dashboardData.themes.map((themeItem, idx) => (
                        <div 
                          key={idx}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                            isNight ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-2 rounded-xl ${isNight ? 'bg-white/10' : 'bg-white'}`}>
                              {getThemeIcon(themeItem.name)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold">{themeItem.name}</span>
                          </div>
                          <span className={`text-[11px] px-2.5 py-1 rounded-full ${isNight ? 'bg-white/10 text-white/70' : 'bg-[#3D2A1D]/10 text-[#3D2A1D]/80'}`}>
                            {themeItem.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 7. Growth Timeline */}
              {dashboardData?.timeline && dashboardData.timeline.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-6 md:p-8 rounded-3xl border ${
                    isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                  }`}
                >
                  <h3 className="text-lg font-heading mb-8 flex items-center gap-2 font-semibold">
                    <span>🌱</span> Growth Timeline
                  </h3>
                  
                  <div className="relative pl-6 border-l border-accent/30 space-y-8 ml-3">
                    {dashboardData.timeline.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="relative"
                      >
                        <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-current shadow-sm" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent block mb-1">
                          {item.month}
                        </span>
                        <p className={`text-[14.5px] leading-relaxed ${isNight ? 'text-white/80 font-light' : 'text-[#3D2A1D]/80'}`}>
                          {item.milestone}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 8. Gentle Focus */}
              {dashboardData?.focusAreas && dashboardData.focusAreas.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-6 md:p-8 rounded-3xl border ${
                    isNight ? 'bg-[#1E2530]/30 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
                  }`}
                >
                  <h3 className="text-lg font-heading mb-4 flex items-center gap-2 font-semibold">
                    <span>🕯️</span> Maybe this deserves a little more attention...
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.focusAreas.map((focus, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex items-center gap-3 ${
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
              )}

              {/* 9. Today's Wisdom Quote */}
              {dashboardData?.todaysWisdom && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-8 md:p-10 rounded-3xl border flex flex-col items-center text-center relative overflow-hidden ${
                    isNight 
                      ? 'bg-[#1E2530]/40 border-white/5 shadow-glass' 
                      : 'bg-white/90 border-[#2E1C12]/10 shadow-soft'
                  }`}
                >
                  <span className="text-xs uppercase tracking-widest text-accent font-bold mb-4 flex items-center gap-1.5">
                    <Quote size={12} /> Today's Wisdom
                  </span>
                  <p className={`font-heading text-lg md:text-xl leading-relaxed mb-4 max-w-xl ${isNight ? 'text-white/95 font-light' : 'text-[#3D2A1D]'}`}>
                    "{dashboardData.todaysWisdom.quote}"
                  </p>
                  <span className={`text-xs italic ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                    — {dashboardData.todaysWisdom.source}
                  </span>
                </motion.div>
              )}

              {/* 10. Letters to Yourself */}
              {dashboardData?.letterToSelf && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className={`p-8 md:p-10 rounded-3xl border font-body relative overflow-hidden ${
                    isNight 
                      ? 'bg-gradient-to-br from-[#1A2035] to-[#0A0D1A] border-white/5 shadow-glass' 
                      : 'bg-gradient-to-br from-[#FCFBF6] to-[#F2EAE0] border-[#2E1C12]/15 shadow-soft'
                  }`}
                >
                  <div className="absolute top-4 right-6 text-3xl opacity-10 select-none">✉</div>
                  <p className={`text-[14.5px] leading-[1.8] whitespace-pre-line ${
                    isNight ? 'text-white/85 font-light' : 'text-[#3D2A1D]/85'
                  }`}>
                    {dashboardData.letterToSelf}
                  </p>
                </motion.div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ReflectionDashboard;
