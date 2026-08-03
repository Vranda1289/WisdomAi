import { motion, AnimatePresence } from 'framer-motion';
import { useAuthModal } from '../../context/AuthModalContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { useEffect } from 'react';

export const AuthModal = () => {
  const { isOpen, closeModal, view } = useAuthModal();
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0"
            style={{ 
              background: 'rgba(0,0,0,0.35)', 
              backdropFilter: 'blur(12px)' 
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className={`
              relative w-full max-w-[460px] p-8 md:p-10
              rounded-[28px] shadow-2xl
              transition-all duration-700
              ${isNight 
                ? 'bg-white/10 border border-white/10 shadow-black/50 text-white backdrop-blur-2xl' 
                : 'bg-white/70 border border-[#A65D40]/10 shadow-[#A65D40]/10 text-[#2F2018] backdrop-blur-2xl'}
            `}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: view === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: view === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {view === 'login' ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
