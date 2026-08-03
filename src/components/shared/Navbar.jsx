import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { copy } from '../../constants/copy';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { themes } from '../../constants/themes';


export const Navbar = () => {
  const { theme } = useTheme();
  const { openModal } = useAuthModal();
  const { user, logout } = useAuth();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 px-10 py-6 backdrop-blur-[2px]"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo Left */}
        <div className="w-[200px]">
          <Link to={user ? "/chat" : "/"} className={`text-2xl font-heading tracking-wider font-bold transition-colors duration-700 ${isNight ? 'text-white' : 'text-[#3D2A1D]'}`}>
            Wisdom AI
          </Link>
        </div>

        {/* Navigation Center */}
        <div className={`hidden md:flex items-center space-x-12 text-sm font-medium transition-colors duration-700 ${isNight ? 'text-white/80' : 'text-[#2E1C12]/90'}`}>
          <Link to="/" className={`transition-colors duration-700 ${isNight ? 'hover:text-[#8EC5FF]' : 'hover:text-[#a94b30]'}`}>
            {copy.navigation.home}
          </Link>
          <Link to="/wisdom" className={`transition-colors duration-700 ${isNight ? 'hover:text-[#8EC5FF]' : 'hover:text-[#a94b30]'}`}>
            {copy.navigation.wisdom}
          </Link>
          <span className={`cursor-not-allowed transition-colors duration-700 ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
            {copy.navigation.journal}
          </span>
          <Link to="/about" className={`transition-colors duration-700 ${isNight ? 'hover:text-[#8EC5FF]' : 'hover:text-[#a94b30]'}`}>
            {copy.navigation.about}
          </Link>
        </div>

        {/* Sign In Right */}
        <div className="w-[200px] flex justify-end pr-[90px]">
          {user ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer shadow-md transition-colors duration-300 ${
                  isNight 
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-[#FDFBF7] text-[#3D2A1D] border border-[#3D2A1D]/20 hover:bg-[#F5F0E6]'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </motion.div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-3 w-[220px] rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl border ${
                      isNight 
                        ? 'bg-[#1a1f2e]/80 border-white/10 text-white/90 shadow-black/50' 
                        : 'bg-white/80 border-[#2E1C12]/10 text-[#3D2A1D] shadow-gray-200/50'
                    }`}
                  >
                    <div className="py-2">
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/chat'); }}
                        className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#a94b30]/10'
                        }`}
                      >
                        💬 Continue Chat
                      </button>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#a94b30]/10'
                        }`}
                      >
                        👤 Profile
                      </button>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#a94b30]/10'
                        }`}
                      >
                        ⚙ Settings
                      </button>
                      <div className={`my-1.5 border-t ${isNight ? 'border-white/10' : 'border-[#2E1C12]/10'}`}></div>
                      <button 
                        onClick={handleLogout}
                        className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                          isNight ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openModal('login')}
              className={`hidden md:block px-6 py-2.5 rounded-full border transition-all duration-700 ${
                isNight
                  ? 'border-white/20 text-white bg-white/10 hover:bg-white/20'
                  : 'border-[#2E1C12]/20 text-[#3D2A1D] hover:bg-[#a94b30] hover:text-white hover:border-[#a94b30]'
              }`}
            >
              {copy.navigation.signIn}
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
