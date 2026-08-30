import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { copy } from '../../constants/copy';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { themes } from '../../constants/themes';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Menu, X, MessageSquare, Compass, BookOpen, Settings, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { theme } = useTheme();
  const { openModal } = useAuthModal();
  const { user, logout } = useAuth();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    localStorage.removeItem('wisdom_current_conversation_id');
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: copy.navigation.home, path: '/' },
    { name: copy.navigation.wisdom, path: '/reflection' },
    { name: copy.navigation.journal, path: '/journal' },
    { name: copy.navigation.about, path: '/settings' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-5 backdrop-blur-[8px]"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo Left */}
        <div className="flex items-center gap-3">
          <Link 
            to={user ? "/chat" : "/"} 
            className={`text-2xl font-heading tracking-wider font-bold transition-colors duration-700 flex items-center gap-2 ${
              isNight ? 'text-white' : 'text-[#3D2A1D]'
            }`}
          >
            <span className="text-xl">🌿</span>
            <span>Wisdom AI</span>
          </Link>
        </div>

        {/* Navigation Center (Desktop) */}
        <div className={`hidden md:flex items-center space-x-10 text-sm font-medium transition-colors duration-700 ${
          isNight ? 'text-white/80' : 'text-[#2E1C12]/90'
        }`}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all duration-300 relative py-1 ${
                  isActive
                    ? (isNight ? 'text-white font-semibold' : 'text-[#A65D40] font-semibold')
                    : (isNight ? 'hover:text-[#8EC5FF] text-white/70' : 'hover:text-[#A65D40] text-[#3D2A1D]/80')
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full ${
                      isNight ? 'bg-white' : 'bg-[#A65D40]'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Theme Toggle + Profile / Sign In + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-base cursor-pointer shadow-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isNight 
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-[#FDFBF7] text-[#3D2A1D] border border-[#3D2A1D]/20 hover:bg-[#F5F0E6]'
                }`}
                aria-label="User Profile menu"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl border z-50 ${
                      isNight 
                        ? 'bg-[#151a26]/95 border-white/10 text-white shadow-black/80' 
                        : 'bg-white/95 border-[#2E1C12]/10 text-[#3D2A1D] shadow-gray-300/60'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
                      <p className="text-xs font-semibold truncate">{user.name}</p>
                      <p className={`text-[11px] truncate ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>{user.email}</p>
                    </div>

                    <div className="py-2">
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/chat'); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <MessageSquare size={14} className="text-accent" />
                        <span>Continue Conversation</span>
                      </button>
                      
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/reflection'); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <Compass size={14} className="text-emerald-500" />
                        <span>Reflection & Growth</span>
                      </button>

                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/journal'); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <BookOpen size={14} className="text-amber-500" />
                        <span>Sanctuary Journal</span>
                      </button>

                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <Settings size={14} className="text-stone-400" />
                        <span>Sanctuary Settings</span>
                      </button>

                      <div className={`my-1.5 border-t ${isNight ? 'border-white/10' : 'border-[#2E1C12]/10'}`}></div>
                      
                      <button 
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => openModal('login')}
                className={`px-6 py-2 rounded-full border text-xs font-medium transition-all duration-300 ${
                  isNight
                    ? 'border-white/20 text-white bg-white/10 hover:bg-white/20'
                    : 'border-[#2E1C12]/20 text-[#3D2A1D] hover:bg-[#A65D40] hover:text-white hover:border-[#A65D40]'
                }`}
              >
                {copy.navigation.signIn}
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-colors ${
              isNight
                ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                : 'border-black/10 bg-black/5 text-[#3D2A1D] hover:bg-black/10'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden mt-4 rounded-2xl p-5 border overflow-hidden backdrop-blur-2xl ${
              isNight
                ? 'bg-[#151a26]/95 border-white/10 text-white'
                : 'bg-white/95 border-[#2E1C12]/10 text-[#3D2A1D]'
            }`}
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? (isNight ? 'bg-white/15 text-white' : 'bg-[#A65D40] text-white')
                      : (isNight ? 'hover:bg-white/5 text-white/80' : 'hover:bg-black/5 text-[#3D2A1D]')
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {!user && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openModal('login');
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                      isNight
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-[#A65D40] bg-[#A65D40] text-white'
                    }`}
                  >
                    {copy.navigation.signIn}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
