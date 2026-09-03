import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu } from 'lucide-react';

// Lazy load the five standalone experiences
const BubblePop = React.lazy(() => import('../components/calm-corner/BubblePop'));
const CloudWriting = React.lazy(() => import('../components/calm-corner/CloudWriting'));
const ColorCalm = React.lazy(() => import('../components/calm-corner/ColorCalm'));
const StarCatcher = React.lazy(() => import('../components/calm-corner/StarCatcher'));
const PeacefulPuzzle = React.lazy(() => import('../components/calm-corner/PeacefulPuzzle'));

/* =========================================================================
   LIGHTWEIGHT ANIMATED VISUAL PREVIEWS (Card Previews)
   Low overhead, pure canvas / SVG / CSS micro-animations
   ========================================================================= */

// 1. Bubble Pop Preview: Floating micro-bubbles & soft glassy reflections
const BubblePopPreview = ({ isHovered, isNight }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let isRunning = true;

    const width = canvas.width = 240;
    const height = canvas.height = 110;

    const bubbles = Array.from({ length: 7 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 9 + 7,
      speedY: Math.random() * 0.45 + 0.25,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.015,
    }));

    const draw = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      bubbles.forEach(b => {
        b.y -= isHovered ? b.speedY * 1.8 : b.speedY;
        b.wobble += b.wobbleSpeed;
        const currentX = b.x + Math.sin(b.wobble) * 4;

        if (b.y < -b.radius) {
          b.y = height + b.radius;
          b.x = Math.random() * width;
        }

        ctx.beginPath();
        const grad = ctx.createRadialGradient(
          currentX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
          currentX, b.y, b.radius
        );
        if (isNight) {
          grad.addColorStop(0, 'rgba(186, 230, 253, 0.5)');
          grad.addColorStop(0.7, 'rgba(125, 211, 252, 0.15)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
          grad.addColorStop(0.7, 'rgba(230, 180, 140, 0.25)');
          grad.addColorStop(1, 'rgba(166, 93, 64, 0.3)');
        }
        ctx.fillStyle = grad;
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.arc(currentX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
    };
  }, [isHovered, isNight]);

  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
    </div>
  );
};

// 2. Cloud Writing Preview: Floating cloud with drifting thought text
const CloudWritingPreview = ({ isHovered, isNight }) => {
  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      {/* Ambient background glow */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isNight ? [0.2, 0.35, 0.2] : [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-2xl blur-xl ${
          isNight 
            ? 'bg-gradient-to-r from-sky-600/30 via-indigo-500/20 to-blue-500/30' 
            : 'bg-gradient-to-r from-sky-200/40 via-amber-100/40 to-emerald-100/40'
        }`}
      />

      {/* Floating Cloud */}
      <motion.div
        animate={{
          x: [-12, 12, -12],
          y: [-3, 3, -3]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-24 flex flex-col items-center justify-center opacity-90 drop-shadow-sm"
      >
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path
            d="M 20,40 A 15,15 0 0,1 50,25 A 18,18 0 0,1 85,35 A 12,12 0 0,1 80,52 L 20,52 A 12,12 0 0,1 20,40 Z"
            fill={isNight ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)'}
            stroke={isNight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(166, 93, 64, 0.3)'}
            strokeWidth="1"
          />
        </svg>
        <span className={`absolute text-[8px] font-medium tracking-wide ${
          isNight ? 'text-sky-200' : 'text-[#5A3C2E]'
        }`}>
          breathe...
        </span>
      </motion.div>
    </div>
  );
};

// 3. Color & Calm Preview: Miniature shifting mandala with soothing color palette
const ColorCalmPreview = ({ isHovered, isNight }) => {
  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <motion.div
        animate={{ rotate: isHovered ? 360 : [0, 90, 180, 270, 360] }}
        transition={{ duration: isHovered ? 12 : 24, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 relative flex items-center justify-center opacity-85"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="14" fill={isNight ? '#38BDF8' : '#4F6F52'} opacity="0.8" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.path
              key={i}
              d="M 50,50 C 40,25 60,25 50,50 Z"
              transform={`rotate(${angle} 50 50)`}
              fill={
                i % 3 === 0 
                  ? (isNight ? '#818CF8' : '#D4A373') 
                  : (i % 3 === 1 ? (isNight ? '#C084FC' : '#E8A7A1') : (isNight ? '#34D399' : '#8A9A5B'))
              }
              opacity="0.85"
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
};

// 4. Star Catcher Preview: Twinkling constellation & drifting stars
const StarCatcherPreview = ({ isHovered, isNight }) => {
  const stars = [
    { x: 30, y: 35, s: 2.5 },
    { x: 75, y: 25, s: 3 },
    { x: 120, y: 55, s: 2 },
    { x: 165, y: 30, s: 3.5 },
    { x: 210, y: 65, s: 2.5 }
  ];

  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <svg viewBox="0 0 240 100" className="w-full h-full opacity-85">
        {/* Constellation Lines */}
        <polyline
          points="30,35 75,25 120,55 165,30 210,65"
          fill="none"
          stroke={isNight ? 'rgba(253, 230, 138, 0.35)' : 'rgba(166, 93, 64, 0.35)'}
          strokeWidth="1.2"
          strokeDasharray="3,3"
        />

        {/* Stars */}
        {stars.map((st, i) => (
          <motion.circle
            key={i}
            cx={st.x}
            cy={st.y}
            r={st.s}
            fill={isNight ? '#FEF3C7' : '#D97706'}
            animate={{
              opacity: isHovered ? [0.4, 1, 0.4] : [0.3, 0.85, 0.3],
              scale: isHovered ? [0.9, 1.3, 0.9] : [1, 1.1, 1]
            }}
            transition={{
              duration: 2.2 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// 5. Peaceful Puzzle Preview: Assembling puzzle piece silhouettes
const PeacefulPuzzlePreview = ({ isHovered, isNight }) => {
  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <div className="w-16 h-16 grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-dashed border-black/10 dark:border-white/10 opacity-80">
        {[0, 1, 2, 3].map((idx) => (
          <motion.div
            key={idx}
            animate={{
              y: isHovered ? [0, -2, 0] : [0, 0, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, delay: idx * 0.25, repeat: Infinity }}
            className={`rounded-lg flex items-center justify-center text-[10px] font-bold ${
              idx === 0 ? (isNight ? 'bg-sky-500/30 text-sky-200' : 'bg-[#4F6F52]/20 text-[#4F6F52]') :
              idx === 1 ? (isNight ? 'bg-indigo-500/30 text-indigo-200' : 'bg-[#D4A373]/30 text-[#8B5A2B]') :
              idx === 2 ? (isNight ? 'bg-purple-500/30 text-purple-200' : 'bg-[#E8A7A1]/30 text-[#8E4B31]') :
              (isNight ? 'bg-amber-500/30 text-amber-200' : 'bg-[#8A9A5B]/30 text-[#2D5A27]')
            }`}
          >
            {idx + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   THE 5 STANDALONE EXPERIENCES
   ========================================================================= */

const EXPERIENCES = [
  {
    id: 'bubble-pop',
    name: '🫧 Bubble Pop',
    tagline: 'Pop a few bubbles and let your attention wander.',
    actionLabel: 'Play →',
    previewComponent: BubblePopPreview,
    component: BubblePop
  },
  {
    id: 'cloud-writing',
    name: '☁️ Cloud Writing',
    tagline: 'Give a thought somewhere to go.',
    actionLabel: 'Open →',
    previewComponent: CloudWritingPreview,
    component: CloudWriting
  },
  {
    id: 'color-calm',
    name: '🎨 Color & Calm',
    tagline: 'Create something beautiful, one color at a time.',
    actionLabel: 'Create →',
    previewComponent: ColorCalmPreview,
    component: ColorCalm
  },
  {
    id: 'star-catcher',
    name: '⭐ Star Catcher',
    tagline: 'Collect a little light at your own pace.',
    actionLabel: 'Explore →',
    previewComponent: StarCatcherPreview,
    component: StarCatcher
  },
  {
    id: 'peaceful-puzzle',
    name: '🧩 Peaceful Puzzle',
    tagline: 'Give your mind something gentle to focus on.',
    actionLabel: 'Play →',
    previewComponent: PeacefulPuzzlePreview,
    component: PeacefulPuzzle
  }
];

/* =========================================================================
   EXPERIENCE CARD COMPONENT
   ========================================================================= */

const ExperienceCard = ({ experience, onSelect, isNight }) => {
  const [isHovered, setIsHovered] = useState(false);
  const PreviewComponent = experience.previewComponent;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
      whileTap={{ scale: 0.985 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(experience)}
      className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
        isNight 
          ? 'bg-[#151a26]/75 hover:bg-[#182030]/90 border-white/10 hover:border-white/20 shadow-lg shadow-black/40' 
          : 'bg-white/85 hover:bg-white border-[#2E1C12]/10 hover:border-[#A65D40]/30 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Animated Preview Area */}
      <div className={`rounded-2xl p-2 mb-4 border transition-colors ${
        isNight 
          ? 'bg-white/[0.03] border-white/[0.06] group-hover:border-white/[0.12]' 
          : 'bg-[#2E1C12]/[0.02] border-[#2E1C12]/[0.05] group-hover:border-[#A65D40]/15'
      }`}>
        <PreviewComponent isHovered={isHovered} isNight={isNight} />
      </div>

      {/* Card Content */}
      <div className="space-y-1.5 px-1 flex-1">
        <h3 className={`font-heading text-lg font-semibold tracking-wide transition-colors ${
          isNight 
            ? 'text-white group-hover:text-sky-200' 
            : 'text-[#2F2018] group-hover:text-[#8E4B31]'
        }`}>
          {experience.name}
        </h3>
        <p className={`text-xs font-light leading-relaxed ${
          isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'
        }`}>
          {experience.tagline}
        </p>
      </div>

      {/* Action Footer */}
      <div className={`mt-5 pt-3.5 border-t flex items-center justify-end transition-colors ${
        isNight ? 'border-white/[0.08]' : 'border-[#2E1C12]/[0.06]'
      }`}>
        <div className={`flex items-center gap-1 text-xs font-semibold transition-all transform group-hover:translate-x-1 ${
          isNight ? 'text-sky-300' : 'text-[#8E4B31]'
        }`}>
          <span>{experience.actionLabel}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================================
   MAIN CALM CORNER COMPONENT
   ========================================================================= */

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
    <div className={`h-screen w-full flex overflow-hidden transition-colors duration-700 ${
      isNight ? 'bg-[#0B1120] text-white' : 'bg-[#FCF8F2] text-[#2F2018]'
    }`}>
      
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

      {/* Main Sanctuary Panel with proper natural scrolling */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <header className="px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/5 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'
              }`}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-heading text-lg md:text-xl font-bold tracking-wide flex items-center gap-2">
              <span>🌿</span> Calm Corner
            </h1>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto relative p-4 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: 5 STANDALONE EXPERIENCES GRID */}
            {!selectedExperience && (
              <motion.div
                key="landing-5-cards"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-7 pb-12"
              >
                {/* Hero Header */}
                <div className="text-center max-w-xl space-y-2 px-4">
                  <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-tight">
                    🌿 Calm Corner
                  </h2>
                  <p className={`text-base font-heading italic ${
                    isNight ? 'text-white/80' : 'text-[#5A3C2E]'
                  }`}>
                    A little space to pause{user?.name ? `, ${user.name}` : ''}.
                  </p>
                  <p className={`text-xs md:text-[13px] leading-relaxed font-light ${
                    isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'
                  }`}>
                    Nothing to achieve. Nothing to get right. Just choose something that feels right for you.
                  </p>
                </div>

                {/* 5 Standalone Experience Cards Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-2">
                  {EXPERIENCES.map((exp, idx) => (
                    <div 
                      key={exp.id}
                      className={idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""}
                    >
                      <ExperienceCard
                        experience={exp}
                        onSelect={handleSelectExperience}
                        isNight={isNight}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 2: ACTIVE INTERACTIVE EXPERIENCE SCREEN */}
            {selectedExperience && (
              <motion.div
                key="active-experience"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-4xl mx-auto h-full min-h-[520px] flex flex-col justify-between"
              >
                {/* Experience header controls */}
                <div className="w-full flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 flex-shrink-0 z-10">
                  <button
                    onClick={handleBackToLanding}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
                      isNight
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white'
                        : 'bg-white/90 border-[#2E1C12]/10 hover:bg-[#F5F0E6] text-[#3D2A1D]'
                    }`}
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Calm Corner</span>
                  </button>

                  <span className="font-heading text-sm font-bold tracking-wide">
                    {selectedExperience.name}
                  </span>
                </div>

                {/* Centered Interactive Container */}
                <div className={`w-full flex-1 min-h-[460px] rounded-3xl border overflow-hidden mt-4 shadow-inner relative flex flex-col justify-between ${
                  isNight
                    ? 'bg-[#121620]/75 border-white/10'
                    : 'bg-[#FAF6ED]/80 border-[#2E1C12]/10'
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
