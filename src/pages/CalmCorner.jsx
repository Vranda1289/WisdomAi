import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';

// Lazy load the eight experiences
const BubblePop = React.lazy(() => import('../components/calm-corner/BubblePop'));
const LeafCatch = React.lazy(() => import('../components/calm-corner/LeafCatch'));
const RippleTouch = React.lazy(() => import('../components/calm-corner/RippleTouch'));
const ZenGarden = React.lazy(() => import('../components/calm-corner/ZenGarden'));
const CloudWriting = React.lazy(() => import('../components/calm-corner/CloudWriting'));
const ColorCalm = React.lazy(() => import('../components/calm-corner/ColorCalm'));
const StarCatcher = React.lazy(() => import('../components/calm-corner/StarCatcher'));
const PeacefulPuzzle = React.lazy(() => import('../components/calm-corner/PeacefulPuzzle'));

/* =========================================================================
   LIGHTWEIGHT ANIMATED VISUAL PREVIEWS (Category Card Previews)
   Low overhead, pure canvas / SVG / CSS micro-animations
   ========================================================================= */

// 1. Release Preview: Floating micro-bubbles & drifting leaf
const ReleasePreview = ({ isHovered, isNight }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const width = canvas.width = 240;
    const height = canvas.height = 110;

    const bubbles = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 8 + 6,
      speedY: Math.random() * 0.4 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.01,
    }));

    let leaf = {
      x: width * 0.7,
      y: 10,
      rotation: 0.2,
      speedY: 0.3,
      speedX: 0.2,
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw bubbles
      bubbles.forEach(b => {
        b.y -= isHovered ? b.speedY * 1.6 : b.speedY;
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
          grad.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
          grad.addColorStop(1, 'rgba(125, 211, 252, 0.1)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
          grad.addColorStop(1, 'rgba(230, 180, 140, 0.25)');
        }
        ctx.fillStyle = grad;
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.arc(currentX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw gentle drifting leaf
      leaf.y += isHovered ? leaf.speedY * 1.4 : leaf.speedY;
      leaf.x += Math.sin(leaf.y * 0.05) * 0.5;
      leaf.rotation += 0.008;

      if (leaf.y > height + 15) {
        leaf.y = -10;
        leaf.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = isNight ? 'rgba(167, 243, 208, 0.5)' : 'rgba(176, 141, 87, 0.55)';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.quadraticCurveTo(5, -2, 0, 8);
      ctx.quadraticCurveTo(-5, -2, 0, -8);
      ctx.fill();
      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isNight]);

  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  );
};

// 2. Relax Preview: Expanding ripples & serene ambient waves
const RelaxPreview = ({ isHovered, isNight }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const width = canvas.width = 240;
    const height = canvas.height = 110;

    let ripples = [
      { r: 10, alpha: 0.8, max: 55 },
      { r: 28, alpha: 0.5, max: 55 },
      { r: 46, alpha: 0.2, max: 55 }
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Water center ripples
      const cx = width / 2;
      const cy = height / 2;

      ripples.forEach(rp => {
        rp.r += isHovered ? 0.6 : 0.35;
        if (rp.r > rp.max) {
          rp.r = 4;
          rp.alpha = 0.8;
        } else {
          rp.alpha = 0.8 * (1 - rp.r / rp.max);
        }

        ctx.beginPath();
        ctx.strokeStyle = isNight 
          ? `rgba(147, 197, 253, ${rp.alpha * 0.7})` 
          : `rgba(166, 93, 64, ${rp.alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Flowing sand pattern lines below
      ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      for (let y = height - 20; y < height; y += 7) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.quadraticCurveTo(cx, y - 5, width - 10, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isNight]);

  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  );
};

// 3. Express Preview: Drifting soft cloud and shifting pastel aura
const ExpressPreview = ({ isHovered, isNight }) => {
  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      {/* Soft shifting background glow */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.12, 1] : [1, 1.05, 1],
          opacity: isNight ? [0.2, 0.35, 0.2] : [0.35, 0.55, 0.35]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-2xl blur-xl ${
          isNight 
            ? 'bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-blue-500/30' 
            : 'bg-gradient-to-r from-rose-300/40 via-amber-200/40 to-teal-200/40'
        }`}
      />

      {/* Drifting Cloud SVG */}
      <motion.div
        animate={{
          x: [-18, 18, -18],
          y: [-2, 2, -2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-24 opacity-85 drop-shadow-sm"
      >
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path
            d="M 20,40 A 15,15 0 0,1 50,25 A 18,18 0 0,1 85,35 A 12,12 0 0,1 80,52 L 20,52 A 12,12 0 0,1 20,40 Z"
            fill={isNight ? 'rgba(226, 232, 240, 0.3)' : 'rgba(255, 255, 255, 0.85)'}
            stroke={isNight ? 'rgba(255, 255, 255, 0.2)' : 'rgba(230, 201, 168, 0.4)'}
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>
    </div>
  );
};

// 4. Focus Preview: Twinkling constellation & floating geometric puzzle
const FocusPreview = ({ isHovered, isNight }) => {
  const stars = [
    { x: 30, y: 35, s: 2.5 },
    { x: 75, y: 25, s: 3 },
    { x: 120, y: 55, s: 2 },
    { x: 165, y: 30, s: 3.5 },
    { x: 210, y: 65, s: 2.5 }
  ];

  return (
    <div className="w-full h-24 rounded-2xl overflow-hidden relative flex items-center justify-center pointer-events-none">
      {/* Constellation SVG */}
      <svg viewBox="0 0 240 100" className="w-full h-full opacity-80">
        {/* Constellation Lines */}
        <polyline
          points="30,35 75,25 120,55 165,30 210,65"
          fill="none"
          stroke={isNight ? 'rgba(253, 230, 138, 0.25)' : 'rgba(79, 111, 82, 0.25)'}
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* Stars */}
        {stars.map((st, i) => (
          <motion.circle
            key={i}
            cx={st.x}
            cy={st.y}
            r={st.s}
            fill={isNight ? '#FEF3C7' : '#4F6F52'}
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

        {/* Subtle geometric puzzle silhouette drifting in background */}
        <rect
          x="105"
          y="35"
          width="28"
          height="28"
          rx="6"
          fill={isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(79, 111, 82, 0.08)'}
          stroke={isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(79, 111, 82, 0.15)'}
          strokeWidth="0.8"
          transform="rotate(12 119 49)"
        />
      </svg>
    </div>
  );
};

/* =========================================================================
   CATEGORY DEFINITIONS
   ========================================================================= */

const CATEGORIES = [
  {
    id: 'release',
    name: '⚡ Release',
    title: 'Release',
    subtitle: 'Let a little energy move.',
    accent: 'amber',
    previewComponent: ReleasePreview,
    experiences: [
      { 
        id: 'bubble-pop', 
        name: '🫧 Bubble Pop', 
        tagline: 'Instant distraction & gentle release',
        desc: 'Pop floating translucent bubbles at your own pace and let your attention wander freely.', 
        component: BubblePop 
      },
      { 
        id: 'leaf-catch', 
        name: '🍃 Leaf Catch', 
        tagline: 'Swaying leaves to catch as they fall',
        desc: 'Follow the natural drift of falling autumn leaves and gather them gently in the breeze.', 
        component: LeafCatch 
      }
    ]
  },
  {
    id: 'relax',
    name: '🌊 Relax',
    title: 'Relax',
    subtitle: 'Nothing needs your attention for a moment.',
    accent: 'blue',
    previewComponent: RelaxPreview,
    experiences: [
      { 
        id: 'ripple-touch', 
        name: '🌊 Ripple Touch', 
        tagline: 'Soft water ripples from your fingertips',
        desc: 'Touch the still water surface and watch soothing concentric waves slowly disperse.', 
        component: RippleTouch 
      },
      { 
        id: 'zen-garden', 
        name: '🧹 Zen Sand Garden', 
        tagline: 'Mindful tracing of patterns in soft sand',
        desc: 'Rake quiet paths and meditative ripples through calm, textured sanctuary sand.', 
        component: ZenGarden 
      }
    ]
  },
  {
    id: 'express',
    name: '✨ Express',
    title: 'Express',
    subtitle: 'Give the thought somewhere to go.',
    accent: 'purple',
    previewComponent: ExpressPreview,
    experiences: [
      { 
        id: 'cloud-writing', 
        name: '☁️ Cloud Writing', 
        tagline: 'Let thoughts rise and dissolve in the sky',
        desc: 'Write down whatever is weighing on your mind, release it into a cloud, and watch it fade away.', 
        component: CloudWriting 
      },
      { 
        id: 'color-calm', 
        name: '🎨 Color & Calm', 
        tagline: 'Abstract shapes and mandalas to paint',
        desc: 'Color intricate botanical leaves and harmonious mandalas with a gentle, soothing palette.', 
        component: ColorCalm 
      }
    ]
  },
  {
    id: 'focus',
    name: '🧩 Focus',
    title: 'Focus',
    subtitle: 'A gentle place for your attention to rest.',
    accent: 'emerald',
    previewComponent: FocusPreview,
    experiences: [
      { 
        id: 'peaceful-puzzle', 
        name: '🧩 Peaceful Puzzle', 
        tagline: 'Assemble beautiful natural scenes without rush',
        desc: 'Swap pieces of scenic landscape illustrations without timers, pressure, or scores.', 
        component: PeacefulPuzzle 
      },
      { 
        id: 'star-catcher', 
        name: '⭐ Star Catcher', 
        tagline: 'Sparkle the sky and form constellations',
        desc: 'Collect glowing stars across the night sky to connect tranquil constellation patterns.', 
        component: StarCatcher 
      }
    ]
  }
];

/* =========================================================================
   CATEGORY DOOR CARD COMPONENT
   ========================================================================= */

const CategoryCard = ({ category, onSelect, isNight }) => {
  const [isHovered, setIsHovered] = useState(false);
  const PreviewComponent = category.previewComponent;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
      whileTap={{ scale: 0.985 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(category)}
      className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
        isNight 
          ? 'bg-[#151a26]/70 hover:bg-[#182030]/90 border-white/10 hover:border-white/20 shadow-lg shadow-black/40' 
          : 'bg-white/85 hover:bg-white border-[#2E1C12]/10 hover:border-[#A65D40]/30 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Preview Area with Ambient Animation */}
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
          {category.name}
        </h3>
        <p className={`text-xs font-light leading-relaxed ${
          isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'
        }`}>
          {category.subtitle}
        </p>
      </div>

      {/* Action Footer */}
      <div className={`mt-5 pt-3.5 border-t flex items-center justify-between transition-colors ${
        isNight ? 'border-white/[0.08]' : 'border-[#2E1C12]/[0.06]'
      }`}>
        <span className={`text-[11.5px] font-medium tracking-wide transition-colors ${
          isNight ? 'text-white/50 group-hover:text-white/80' : 'text-[#3D2A1D]/60 group-hover:text-[#8E4B31]'
        }`}>
          2 experiences
        </span>
        <div className={`flex items-center gap-1 text-[11.5px] font-semibold transition-all transform group-hover:translate-x-1 ${
          isNight ? 'text-sky-300' : 'text-[#8E4B31]'
        }`}>
          <span>Explore</span>
          <ArrowRight size={13} />
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
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  const handleSelectExperience = (exp) => {
    setSelectedExperience(exp);
  };

  const handleBackToLanding = () => {
    setSelectedExperience(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedExperience(null);
  };

  // Quick escape direct launcher
  const launchQuickEscape = (expId) => {
    for (const cat of CATEGORIES) {
      const found = cat.experiences.find(e => e.id === expId);
      if (found) {
        setSelectedCategory(cat);
        setSelectedExperience(found);
        break;
      }
    }
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

      {/* Main Sanctuary Panel */}
      <main className="flex-1 min-w-0 h-full overflow-hidden relative flex flex-col p-4 md:p-8">
        
        {/* Header */}
        <header className="px-2 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'
              }`}
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
            
            {/* VIEW 1: CALM CORNER HERO & 4 INTERACTIVE CATEGORY DOORS */}
            {!selectedCategory && !selectedExperience && (
              <motion.div
                key="doors-entry"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-start space-y-7 pb-10 px-2"
              >
                {/* Hero Moment */}
                <div className="text-center max-w-xl space-y-2.5 mt-2 px-4">
                  <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-tight">
                    Calm Corner
                  </h2>
                  <p className={`text-base font-heading italic ${
                    isNight ? 'text-white/80' : 'text-[#5A3C2E]'
                  }`}>
                    A little space to pause{user?.name ? `, ${user.name}` : ''}. What do you feel like doing right now?
                  </p>
                  <p className={`text-[13px] leading-relaxed font-light ${
                    isNight ? 'text-white/55' : 'text-[#3D2A1D]/70'
                  }`}>
                    Nothing to achieve. Nothing to get right. Just choose something that feels good.
                  </p>
                </div>

                {/* Quick Escape Shortcut Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 px-4">
                  <span className={`text-[11.5px] uppercase tracking-wider font-semibold mr-1 ${
                    isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'
                  }`}>
                    Need something quick?
                  </span>
                  
                  <button
                    onClick={() => launchQuickEscape('bubble-pop')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-2 ${
                      isNight
                        ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white/90'
                        : 'bg-white/80 hover:bg-white border-[#2E1C12]/10 text-[#2F2018] shadow-xs'
                    }`}
                  >
                    <span>🫧 Bubble Pop</span>
                    <span className={`text-[10px] ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/45'}`}>· 2 min reset</span>
                  </button>

                  <button
                    onClick={() => launchQuickEscape('ripple-touch')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-2 ${
                      isNight
                        ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white/90'
                        : 'bg-white/80 hover:bg-white border-[#2E1C12]/10 text-[#2F2018] shadow-xs'
                    }`}
                  >
                    <span>🌊 Ripple Touch</span>
                    <span className={`text-[10px] ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/45'}`}>· Just breathe & interact</span>
                  </button>
                </div>

                {/* 4 Interactive Category Door Cards */}
                <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5 px-2">
                  {CATEGORIES.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onSelect={handleSelectCategory}
                      isNight={isNight}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 2: CATEGORY EXPERIENCES SELECTION */}
            {selectedCategory && !selectedExperience && (
              <motion.div
                key="category-detail"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-start space-y-7 pb-10 px-2"
              >
                {/* Back to all categories bar */}
                <div className="w-full max-w-3xl flex items-center justify-between px-2 pt-2">
                  <button
                    onClick={handleBackToCategories}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all border ${
                      isNight
                        ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10'
                        : 'bg-white/90 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    <ChevronLeft size={14} />
                    <span>All Calm Spaces</span>
                  </button>

                  <span className={`text-xs uppercase tracking-wider font-semibold ${
                    isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'
                  }`}>
                    {selectedCategory.title} Mood
                  </span>
                </div>

                {/* Mood Header */}
                <div className="text-center max-w-lg space-y-2 px-4">
                  <h2 className="text-3xl font-heading font-medium tracking-tight">
                    {selectedCategory.name}
                  </h2>
                  <p className={`text-sm ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'}`}>
                    {selectedCategory.subtitle}
                  </p>
                </div>

                {/* The 2 Experiences inside this Mood */}
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
                  {selectedCategory.experiences.map((exp) => (
                    <motion.div
                      key={exp.id}
                      whileHover={{ y: -3 }}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                        isNight
                          ? 'bg-[#151a26]/80 border-white/10 shadow-lg shadow-black/30'
                          : 'bg-white/90 border-[#2E1C12]/10 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-xl font-semibold">
                            {exp.name}
                          </h3>
                        </div>
                        <p className={`text-xs font-medium ${
                          isNight ? 'text-sky-300' : 'text-[#8E4B31]'
                        }`}>
                          {exp.tagline}
                        </p>
                        <p className={`text-[12.5px] leading-relaxed font-light ${
                          isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'
                        }`}>
                          {exp.desc}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectExperience(exp)}
                        className={`mt-6 w-full py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 ${
                          isNight
                            ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10'
                            : 'bg-[#4F6F52] text-white hover:bg-[#435f46] shadow-[#4F6F52]/20'
                        }`}
                      >
                        <span>Begin Experience</span>
                        <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <p className={`text-center text-[11px] italic pt-2 ${
                  isNight ? 'text-white/30' : 'text-[#3D2A1D]/40'
                }`}>
                  Take all the time you need. No scores, no timers.
                </p>
              </motion.div>
            )}

            {/* VIEW 3: ACTIVE EXPERIENCE SCREEN */}
            {selectedExperience && (
              <motion.div
                key="active-experience"
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
                    className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
                      isNight
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                        : 'bg-white/90 border-[#2E1C12]/10 hover:bg-[#F5F0E6] text-[#3D2A1D]'
                    }`}
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Calm Corner</span>
                  </button>

                  <div className="text-right flex items-center gap-2">
                    <span className="font-heading text-sm font-bold tracking-wide">
                      {selectedExperience.name}
                    </span>
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

