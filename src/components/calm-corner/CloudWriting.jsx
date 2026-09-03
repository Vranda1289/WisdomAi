import { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Send } from 'lucide-react';

export default function CloudWriting() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [text, setText] = useState('');
  const [clouds, setClouds] = useState([
    {
      id: 'initial-1',
      text: 'Taking a quiet breath...',
      x: 35,
      y: 30,
      scale: 1,
      depth: 1,
      isDrifting: false
    }
  ]);
  const [selectedCloudId, setSelectedCloudId] = useState(null);
  const containerRef = useRef(null);

  const handleCreateCloud = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    // Randomize initial position and depth layer
    const newCloud = {
      id: 'cloud-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      text: text.trim(),
      x: Math.random() * 40 + 20, // 20% to 60%
      y: Math.random() * 25 + 35, // 35% to 60%
      scale: Math.random() * 0.25 + 0.9,
      depth: Math.random() > 0.5 ? 2 : 1,
      isDrifting: false
    };

    setClouds(prev => [...prev, newCloud]);
    setSelectedCloudId(newCloud.id);
    setText('');
  };

  const handleLetDrift = (cloudId) => {
    setClouds(prev => prev.map(c => {
      if (c.id === cloudId) {
        return { ...c, isDrifting: true };
      }
      return c;
    }));

    // Remove from state after dissolution animation completes
    setTimeout(() => {
      setClouds(prev => prev.filter(c => c.id !== cloudId));
      if (selectedCloudId === cloudId) {
        setSelectedCloudId(null);
      }
    }, 2800);
  };

  const handleClearAll = () => {
    setClouds(prev => prev.map(c => ({ ...c, isDrifting: true })));
    setTimeout(() => {
      setClouds([]);
      setSelectedCloudId(null);
    }, 2500);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none"
    >
      {/* Atmospheric Sky Backdrop */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isNight 
          ? 'bg-gradient-to-b from-[#080d1a] via-[#0f172a] to-[#1e293b]' 
          : 'bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-[#fcf8f2]'
      }`} />

      {/* Atmospheric Night Stars / Day Sunrays */}
      {isNight ? (
        <div className="absolute inset-0 opacity-45 pointer-events-none z-0">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: (i % 3 === 0 ? 3 : 2) + 'px',
                height: (i % 3 === 0 ? 3 : 2) + 'px',
                top: ((i * 37) % 90) + '%',
                left: ((i * 53) % 95) + '%',
                animationDuration: (2.5 + (i % 3)) + 's'
              }}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-radial-at-tr from-amber-200/25 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {/* Top Ambient Bar */}
      <div className="w-full max-w-lg flex items-center justify-between px-6 pt-4 z-20">
        <div className="flex items-center gap-2">
          <span className={`text-[11.5px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border backdrop-blur-md ${
            isNight ? 'bg-white/5 border-white/10 text-sky-200/80' : 'bg-white/80 border-[#2E1C12]/10 text-[#8E4B31]'
          }`}>
            {clouds.filter(c => !c.isDrifting).length} Thought{clouds.filter(c => !c.isDrifting).length === 1 ? '' : 's'} in Sky
          </span>
        </div>

        {clouds.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-md transition-all flex items-center gap-1.5 ${
              isNight 
                ? 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10' 
                : 'bg-white/70 border-[#2E1C12]/10 text-[#3D2A1D]/75 hover:text-[#2F2018] hover:bg-white'
            }`}
            title="Release all thoughts"
          >
            <Wind size={13} />
            <span>Release All</span>
          </button>
        )}
      </div>

      {/* Interactive Sky Floating Clouds Container */}
      <div className="flex-1 w-full relative z-10 overflow-hidden cursor-default">
        <AnimatePresence>
          {clouds.map((cloud) => {
            const isSelected = selectedCloudId === cloud.id;

            return (
              <motion.div
                key={cloud.id}
                drag={!cloud.isDrifting}
                dragConstraints={containerRef}
                dragElastic={0.1}
                dragMomentum={false}
                initial={{ 
                  scale: 0.6, 
                  opacity: 0, 
                  y: '80vh',
                  x: `${cloud.x}vw`
                }}
                animate={
                  cloud.isDrifting 
                    ? {
                        y: '-40vh',
                        opacity: 0,
                        scale: cloud.scale * 0.4,
                        transition: { duration: 2.8, ease: 'easeInOut' }
                      }
                    : {
                        y: `${cloud.y}vh`,
                        x: `${cloud.x}vw`,
                        opacity: 1,
                        scale: isSelected ? cloud.scale * 1.06 : cloud.scale,
                        transition: { type: 'spring', damping: 20, stiffness: 90 }
                      }
                }
                exit={{ opacity: 0, scale: 0.3 }}
                onClick={() => setSelectedCloudId(cloud.id)}
                className={`absolute cursor-grab active:cursor-grabbing select-none group touch-none ${
                  cloud.depth === 2 ? 'z-20' : 'z-10'
                }`}
                style={{ width: '230px' }}
              >
                {/* Cloud Body Shape */}
                <div className="relative flex items-center justify-center p-5 text-center">
                  
                  {/* Subtle Selected Aura Glow */}
                  {isSelected && !cloud.isDrifting && (
                    <motion.div
                      layoutId="cloudSelectedGlow"
                      className={`absolute -inset-2 rounded-full blur-md ${
                        isNight ? 'bg-sky-400/20' : 'bg-amber-300/30'
                      }`}
                    />
                  )}

                  {/* SVG Cloud Background */}
                  <svg
                    className={`absolute inset-0 w-full h-full filter drop-shadow-md transition-all duration-300 ${
                      isNight 
                        ? (isSelected ? 'text-slate-800/95' : 'text-slate-800/85') 
                        : (isSelected ? 'text-white' : 'text-white/95')
                    }`}
                    viewBox="0 0 100 65"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 18,42 
                         A 14,14 0 0,1 46,26 
                         A 17,17 0 0,1 82,34 
                         A 13,13 0 0,1 82,54 
                         L 18,54 
                         A 13,13 0 0,1 18,42 Z"
                      fill="currentColor"
                      stroke={
                        isSelected 
                          ? (isNight ? 'rgba(186, 230, 253, 0.5)' : 'rgba(166, 93, 64, 0.4)')
                          : (isNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(230, 201, 168, 0.4)')
                      }
                      strokeWidth={isSelected ? "1.2" : "0.7"}
                    />
                  </svg>

                  {/* Cloud Thought Content */}
                  <div className="relative z-10 px-3 py-2 flex flex-col items-center">
                    <p className={`font-body text-[13px] leading-relaxed max-w-[170px] break-words font-medium ${
                      isNight ? 'text-sky-100' : 'text-[#3D2A1D]'
                    }`}>
                      {cloud.text}
                    </p>

                    {/* Interactive Action Pill on Selected Cloud */}
                    {isSelected && !cloud.isDrifting && (
                      <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLetDrift(cloud.id);
                        }}
                        className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-sm transition-all flex items-center gap-1 active:scale-95 ${
                          isNight
                            ? 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-400/40 text-sky-200'
                            : 'bg-[#A65D40]/15 hover:bg-[#A65D40]/25 border-[#A65D40]/30 text-[#8E4B31]'
                        }`}
                      >
                        <Wind size={11} />
                        <span>Let it drift</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {clouds.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <p className={`text-sm font-heading italic ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
              The sky is open and clear. Write a thought below to let it exist and float freely.
            </p>
          </div>
        )}
      </div>

      {/* Input Form at Bottom */}
      <div className="w-full max-w-lg px-6 pb-6 z-20">
        <form onSubmit={handleCreateCloud} className="flex gap-2">
          <input
            type="text"
            maxLength={75}
            placeholder="Type a thought to release into the sky..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`flex-grow px-4 py-3 rounded-2xl text-xs outline-none border transition-all shadow-md focus-visible:ring-2 focus-visible:ring-accent ${
              isNight
                ? 'bg-slate-900/90 border-white/10 text-white placeholder:text-white/30 focus:border-accent'
                : 'bg-white/95 border-[#2E1C12]/15 text-[#3D2A1D] placeholder:text-[#3D2A1D]/45 focus:border-[#4F6F52]'
            }`}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
              !text.trim()
                ? 'opacity-50 cursor-not-allowed bg-stone-300 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                : (isNight
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
                    : 'bg-[#4F6F52] hover:bg-[#435f46] text-white shadow-[#4F6F52]/20')
            }`}
          >
            <span>Release</span>
            <Send size={13} />
          </button>
        </form>

        <p className={`text-center mt-2.5 text-[11px] font-light ${isNight ? 'text-white/35' : 'text-[#3D2A1D]/50'}`}>
          Drag clouds freely · Tap to select · Tap "Let it drift" to watch it dissolve
        </p>
      </div>
    </div>
  );
}
