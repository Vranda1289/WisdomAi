import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion } from 'framer-motion';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isNight ? 'bg-[#121620]' : 'bg-[#FDFBF7]'}`}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={`w-8 h-8 border-2 border-t-transparent rounded-full ${isNight ? 'border-white/20 border-t-white' : 'border-[#3D2A1D]/20 border-t-[#3D2A1D]'}`}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
