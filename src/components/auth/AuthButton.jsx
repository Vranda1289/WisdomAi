import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const AuthButton = ({ children, onClick, isLoading, disabled, type = 'button' }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      whileHover={isLoading || disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={isLoading || disabled ? {} : { scale: 0.98 }}
      className={`
        w-full py-4 mt-2 rounded-xl font-medium text-lg flex items-center justify-center
        transition-all duration-500
        ${isNight 
          ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
          : 'bg-[#A65D40] hover:bg-[#8E4B31] text-white shadow-lg hover:shadow-xl shadow-[#A65D40]/30'}
        ${(isLoading || disabled) ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : children}
    </motion.button>
  );
};
