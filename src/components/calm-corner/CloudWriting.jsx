import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion, AnimatePresence } from 'framer-motion';

export default function CloudWriting() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [text, setText] = useState('');
  const [clouds, setClouds] = useState([]);

  // Clean up expired clouds periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setClouds(prev => prev.filter(c => c.expiry > Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newCloud = {
      id: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      // Custom starting horizontal point, speed, and size
      x: Math.random() * 60 + 10, // 10% to 70% left position
      speed: Math.random() * 12 + 10, // Float duration in seconds
      scale: Math.random() * 0.2 + 0.9, // 0.9 to 1.1 scale
      expiry: Date.now() + 18000 // 18 seconds lifespan
    };

    setClouds(prev => [...prev, newCloud]);
    setText('');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Sky Backdrop Overlay */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isNight 
          ? 'bg-gradient-to-b from-[#0a0d1a] via-[#101426] to-[#1a1f3c]' 
          : 'bg-gradient-to-b from-[#e3f2fd] via-[#bbdefb] to-[#e8f5e9]'
      }`} />

      {/* Starry Night particles if dark theme */}
      {isNight && (
        <div className="absolute inset-0 opacity-40 z-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%'
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Clouds Area */}
      <div className="flex-1 w-full relative z-10 pointer-events-none">
        <AnimatePresence>
          {clouds.map((cloud) => (
            <motion.div
              key={cloud.id}
              initial={{ y: '100vh', x: `${cloud.x}vw`, opacity: 0, scale: 0.7 }}
              animate={{ 
                y: '-20vh', 
                opacity: [0, 0.85, 0.85, 0],
                scale: cloud.scale,
                transition: { duration: cloud.speed, ease: 'linear' }
              }}
              exit={{ opacity: 0 }}
              className="absolute flex flex-col items-center justify-center pointer-events-none"
              style={{ width: '220px' }}
            >
              {/* Cloud visual container */}
              <div className="relative flex items-center justify-center p-6 text-center">
                {/* SVG Cloud Background shape */}
                <svg
                  className={`absolute inset-0 w-full h-full filter drop-shadow-md opacity-90 ${
                    isNight ? 'text-slate-700/85' : 'text-white/95'
                  }`}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 20,40 
                       A 15,15 0 0,1 50,30 
                       A 18,18 0 0,1 85,42 
                       A 12,12 0 0,1 80,68 
                       L 20,68 
                       A 12,12 0 0,1 20,40 Z"
                    fill="currentColor"
                  />
                </svg>

                {/* Cloud Writing Text */}
                <p className={`relative z-10 font-body text-[13px] leading-relaxed max-w-[170px] break-words font-medium px-2 py-4 ${
                  isNight ? 'text-blue-100' : 'text-slate-700'
                }`}>
                  {cloud.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form area bottom */}
      <div className="w-full max-w-md px-6 pb-8 z-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            maxLength={60}
            placeholder="Type a thought you want to release..."
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
            className={`px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 ${
              isNight
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-[#4F6F52] hover:bg-[#4F6F52]/90 text-white'
            }`}
          >
            Release
          </button>
        </form>
        <p className={`text-center mt-3 text-[11px] italic ${isNight ? 'text-white/20' : 'text-[#3D2A1D]/35'}`}>
          Let it exist for a moment, then watch it dissolve.
        </p>
      </div>
    </div>
  );
}
