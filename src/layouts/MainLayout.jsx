import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { AuthModal } from '../components/auth/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Animations Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 transition-opacity duration-slowest">
        {/* We will add breathing gradients/particles here later */}
      </div>

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          className="flex-grow z-10"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <AuthModal />
    </div>
  );
};
