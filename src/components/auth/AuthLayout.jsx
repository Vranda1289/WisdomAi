import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { ThemeToggle } from '../ui/ThemeToggle';
import heroWarm from '../../assets/images/hero-warm.png';
import heroNight from '../../assets/images/hero-dark.jpg';

export const AuthLayout = ({ children }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="flex h-screen w-full overflow-hidden relative"
    >
      <ThemeToggle />
      
      {/* LEFT SIDE - Background */}
      <div className="hidden lg:block lg:w-1/2 relative h-full overflow-hidden">
        <AnimatePresence>
          <motion.img
            key={theme}
            src={isNight ? heroNight : heroWarm}
            alt="Wisdom AI Background"
            draggable={false}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-[74%_center]"
          />
        </AnimatePresence>
        
        {/* Overlays matching Landing Page slightly adjusted for auth */}
        <div className={`absolute inset-0 z-10 transition-opacity duration-700 bg-gradient-to-r from-[#FCF8F2]/40 to-transparent ${isNight ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`absolute inset-0 z-10 transition-opacity duration-700 bg-gradient-to-r from-[#0B1120]/60 to-transparent ${isNight ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* RIGHT SIDE - Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 transition-colors duration-700 relative z-20 ${isNight ? 'bg-[#0B1120]' : 'bg-[#FCF8F2]'}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
      
      {/* Mobile background */}
      <div className="block lg:hidden absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence>
          <motion.img
            key={theme}
            src={isNight ? heroNight : heroWarm}
            alt="Wisdom AI Background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isNight ? 'opacity-20' : 'opacity-30'}`}
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
