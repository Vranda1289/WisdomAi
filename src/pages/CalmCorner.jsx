import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the eight experiences
const BubblePop = React.lazy(() => import('../components/calm-corner/BubblePop'));
const LeafCatch = React.lazy(() => import('../components/calm-corner/LeafCatch'));
const RippleTouch = React.lazy(() => import('../components/calm-corner/RippleTouch'));
const ZenGarden = React.lazy(() => import('../components/calm-corner/ZenGarden'));
const CloudWriting = React.lazy(() => import('../components/calm-corner/CloudWriting'));
const ColorCalm = React.lazy(() => import('../components/calm-corner/ColorCalm'));
const StarCatcher = React.lazy(() => import('../components/calm-corner/StarCatcher'));
const PeacefulPuzzle = React.lazy(() => import('../components/calm-corner/PeacefulPuzzle'));

const CATEGORIES = [
  {
    id: 'release',
    name: '⚡ Release',
    description: 'Let a little energy move.',
    color: 'from-amber-500/10 to-orange-500/10 border-orange-500/20',
    experiences: [
      { id: 'bubble-pop', name: '🫧 Bubble Pop', desc: 'Instant distraction and gentle release.', component: BubblePop },
      { id: 'leaf-catch', name: '🍃 Leaf Catch', desc: 'Swaying leaves to catch as they fall.', component: LeafCatch }
    ]
  },
  {
    id: 'relax',
    name: '🌊 Relax',
    description: 'Nothing needs your attention for a moment.',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    experiences: [
      { id: 'ripple-touch', name: '🌊 Ripple Touch', desc: 'Soft water ripples from your fingertips.', component: RippleTouch },
      { id: 'zen-garden', name: '🧹 Zen Sand Garden', desc: 'Mindful tracing of patterns in soft sand.', component: ZenGarden }
    ]
  },
  {
    id: 'express',
    name: '✨ Express',
    description: 'Give the thought somewhere to go.',
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    experiences: [
      { id: 'cloud-writing', name: '☁️ Cloud Writing', desc: 'Let thoughts rise and dissolve in the sky.', component: CloudWriting },
      { id: 'color-calm', name: '🎨 Color & Calm', desc: 'Abstract shapes and mandalas to paint.', component: ColorCalm }
    ]
  },
  {
    id: 'focus',
    name: '🧩 Focus',
    description: 'A gentle place for your attention to rest.',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
    experiences: [
      { id: 'peaceful-puzzle', name: '🧩 Peaceful Puzzle', desc: 'Assemble beautiful natural scenes at your own pace.', component: PeacefulPuzzle },
      { id: 'star-catcher', name: '⭐ Star Catcher', desc: 'Sparkle the sky and form constellations.', component: StarCatcher }
    ]
  }
];

export const CalmCorner = () => {
  const { theme } = useTheme();
  const isNight = theme === themeConstants.NIGHT_REFLECTION;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // Load conversations list for Sidebar
  useEffect(() => {
    const loadConversations = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await api.get('/api/chat');
        setConversations(res.data.data || []);
      } catch (err) {
        console.error('Failed to load conversations in calm corner:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadConversations();
  }, []);

  const handleSelectConversation = (conversationId) => {
    localStorage.setItem('wisdom_current_conversation_id', conversationId);
    navigate('/chat');
  };

  const handleNewConversation = () => {
    localStorage.removeItem('wisdom_current_conversation_id');
    navigate('/chat');
  };

  const handleSelectExperience = (exp) => {
    setSelectedExperience(exp);
  };

  const handleBackToLanding = () => {
    setSelectedExperience(null);
  };

  const ActiveComponent = selectedExperience?.component;

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

      {/* Main Sanctuary Panel */}
      <main className="flex-1 min-w-0 h-full overflow-hidden relative flex flex-col p-4 md:p-8">
        
        {/* Header */}
        <header className="px-2 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'}`}
              aria-label="Open sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="font-heading text-xl font-bold tracking-wide flex items-center gap-2">
              <span>🌿</span> Calm Corner
            </h1>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-grow min-h-0 relative mt-4">
          <AnimatePresence mode="wait">
            {!selectedExperience ? (
              /* LANDING SCREEN */
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-start space-y-8 pb-10"
              >
                {/* Quiet Welcome */}
                <div className="text-center max-w-lg space-y-3 mt-4 px-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-medium tracking-wide">
                    Take a Moment, {user?.name || 'Friend'}.
                  </h2>
                  <p className={`text-[13.5px] leading-relaxed font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'}`}>
                    Sometimes the best thing to do with a thought is not to solve it. 
                    There's nothing to achieve here. Just choose a space to take a break.
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                  {CATEGORIES.map((category) => (
                    <motion.div
                      key={category.id}
                      className={`p-6 rounded-3xl border bg-gradient-to-br flex flex-col justify-between ${
                        isNight 
                          ? 'bg-[#1E2530]/35 border-white/5 shadow-glass' 
                          : 'bg-white/90 border-[#2E1C12]/10 shadow-soft'
                      }`}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div className="space-y-2 mb-6">
                        <h3 className="text-lg font-heading font-semibold tracking-wide">
                          {category.name}
                        </h3>
                        <p className={`text-xs leading-relaxed font-light ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                          {category.description}
                        </p>
                      </div>

                      {/* Experiences inside category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.experiences.map((exp) => (
                          <button
                            key={exp.id}
                            onClick={() => handleSelectExperience(exp)}
                            className={`p-3.5 rounded-2xl text-left border transition-all duration-300 active:scale-97 group ${
                              isNight 
                                ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' 
                                : 'bg-black/5 border-black/5 hover:bg-[#A65D40]/5 hover:border-[#A65D40]/10'
                            }`}
                          >
                            <h4 className={`text-xs font-bold tracking-wide transition-colors ${
                              isNight ? 'text-white/90 group-hover:text-white' : 'text-[#3D2A1D]/90 group-hover:text-[#A65D40]'
                            }`}>
                              {exp.name}
                            </h4>
                            <p className={`text-[10px] mt-1 font-light leading-normal transition-opacity ${
                              isNight ? 'text-white/40 group-hover:text-white/60' : 'text-[#3D2A1D]/45 group-hover:text-[#3D2A1D]/60'
                            }`}>
                              {exp.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* EXPERIENCE PLAYING SCREEN */
              <motion.div
                key="experience"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col justify-between items-center"
              >
                {/* Experience header controls */}
                <div className="w-full flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 flex-shrink-0 z-10">
                  <button
                    onClick={handleBackToLanding}
                    className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
                      isNight
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                        : 'bg-white/90 border-[#2E1C12]/10 hover:bg-[#F5F0E6] text-[#3D2A1D]'
                    }`}
                  >
                    <span>←</span>
                    <span>Back to Calm Corner</span>
                  </button>

                  <div className="text-right">
                    <h3 className="font-heading text-sm font-bold tracking-wide">
                      {selectedExperience.name}
                    </h3>
                  </div>
                </div>

                {/* Centered Interactive Container */}
                <div className={`w-full flex-grow min-h-0 rounded-3xl border overflow-hidden mt-4 shadow-inner relative flex flex-col justify-between ${
                  isNight
                    ? 'bg-[#121620]/60 border-white/5'
                    : 'bg-[#FAF6ED]/70 border-[#2E1C12]/10'
                }`}>
                  <Suspense 
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                          className={`w-6 h-6 border-2 border-t-transparent rounded-full ${
                            isNight ? 'border-white/20 border-t-white' : 'border-[#3D2A1D]/20 border-t-[#3D2A1D]'
                          }`}
                        />
                      </div>
                    }
                  >
                    {ActiveComponent && <ActiveComponent />}
                  </Suspense>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default CalmCorner;
