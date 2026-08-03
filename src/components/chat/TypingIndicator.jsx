import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export const TypingIndicator = () => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 px-5 py-3.5 w-fit rounded-2xl rounded-tl-sm backdrop-blur-md border shadow-soft select-none ${
        isNight 
          ? 'bg-[#2D3748]/50 border-white/10 text-white/70' 
          : 'bg-white/70 border-white/40 text-[#2F2018]/70'
      }`}
    >
      <span className="text-[13.5px] font-body font-medium tracking-wide">
        Wisdom AI is reflecting
      </span>
      <span className="flex items-center gap-1.5 ml-1 mt-1">
        <motion.span 
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} 
          transition={{ duration: 1.2, repeat: Infinity, delay: 0, ease: "easeInOut" }} 
          className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-white/70' : 'bg-[#3D2A1D]/70'}`} 
        />
        <motion.span 
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} 
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3, ease: "easeInOut" }} 
          className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-white/70' : 'bg-[#3D2A1D]/70'}`} 
        />
        <motion.span 
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} 
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.6, ease: "easeInOut" }} 
          className={`w-1.5 h-1.5 rounded-full ${isNight ? 'bg-white/70' : 'bg-[#3D2A1D]/70'}`} 
        />
      </span>
    </motion.div>
  );
};
