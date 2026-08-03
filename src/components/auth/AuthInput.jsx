import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthInput = ({ type, placeholder, name, value, onChange, error, disabled }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <div className="mb-5 relative">
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-5 py-4 rounded-xl
          outline-none transition-all duration-300
          ${isNight 
            ? 'bg-black/20 text-white placeholder:text-white/40 border focus:bg-black/40' 
            : 'bg-white/50 text-[#2F2018] placeholder:text-[#2F2018]/40 border focus:bg-white'}
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
            : isNight 
              ? 'border-white/10 focus:border-blue-400/50 focus:shadow-[0_0_15px_rgba(96,165,250,0.15)]' 
              : 'border-[#A65D40]/20 focus:border-[#A65D40]/50 focus:shadow-[0_0_15px_rgba(166,93,64,0.1)]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-xs mt-2 pl-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
