import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { copy } from '../../constants/copy';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { themes } from '../../constants/themes';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Menu, X, Settings as SettingsIcon, LogOut, User } from 'lucide-react';

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

  // Settings is removed from the primary nav items as per requirement 1 & 2
  const navLinks = [
    { name: copy.navigation.home, path: '/' },
    { name: copy.navigation.wisdom, path: '/reflection' },
    { name: copy.navigation.journal, path: '/journal' },
    { name: copy.navigation.calmCorner, path: '/calm-corner' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-3.5 transition-colors duration-700 backdrop-blur-xl border-b ${
        isNight
          ? 'bg-[#0B1120]/40 border-white/[0.06] text-white'
          : 'bg-[#FCF8F2]/60 border-[#2E1C12]/[0.05] text-[#2F2018]'
      }`}
    >
      <div className="max-w-[1500px] mx-auto flex items-center justify-between">
        
        {/* Brand Logo Left */}
        <div className="flex items-center gap-3">
          <Link 
            to={user ? "/chat" : "/"} 
            className={`font-heading tracking-[0.03em] font-semibold text-2xl transition-all duration-300 flex items-center gap-2.5 group ${
              isNight ? 'text-white hover:text-blue-200' : 'text-[#3D2A1D] hover:text-[#A65D40]'
            }`}
          >
            <span className="text-xl transition-transform duration-300 group-hover:scale-105 select-none">🌿</span>
            <span>Wisdom AI</span>
          </Link>
        </div>

        {/* Navigation Center (Desktop) - Refined Capsule */}
        <div className="hidden md:flex items-center">
          <div className={`flex items-center gap-1 p-1 rounded-full border transition-all duration-500 ${
            isNight 
              ? 'bg-white/[0.03] border-white/[0.06] shadow-sm' 
              : 'bg-[#2E1C12]/[0.03] border-[#2E1C12]/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
          }`}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-1.5 rounded-full text-[13px] tracking-[0.01em] transition-all duration-300 select-none ${
                    isActive
                      ? (isNight ? 'text-white font-semibold' : 'text-[#8E4B31] font-semibold')
                      : (isNight ? 'text-white/65 hover:text-white hover:bg-white/[0.05]' : 'text-[#3D2A1D]/75 hover:text-[#2F2018] hover:bg-black/[0.03]')
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute inset-0 rounded-full ${
                        isNight 
                          ? 'bg-white/[0.12] border border-white/[0.18] shadow-sm' 
                          : 'bg-white border border-[#A65D40]/20 shadow-[0_2px_8px_rgba(166,93,64,0.08)]'
                      }`}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Theme Toggle + Profile / Sign In + Mobile Hamburger */}
        <div className="flex items-center gap-3.5">
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isNight 
                    ? 'bg-gradient-to-br from-white/15 to-white/5 text-white border border-white/20 hover:border-white/30 shadow-md backdrop-blur-md' 
                    : 'bg-gradient-to-br from-white to-[#FAF6ED] text-[#8E4B31] border border-[#A65D40]/25 hover:border-[#A65D40]/40 shadow-sm'
                }`}
                aria-label="User Profile menu"
                title="Account & Settings"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className={`absolute right-0 mt-2.5 w-60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl border z-50 ${
                      isNight 
                        ? 'bg-[#121724]/95 border-white/10 text-white shadow-black/80' 
                        : 'bg-[#FCF8F2]/95 border-[#2E1C12]/10 text-[#3D2A1D] shadow-xl'
                    }`}
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs ${
                        isNight ? 'bg-white/10 text-white border border-white/15' : 'bg-[#A65D40]/10 text-[#8E4B31] border border-[#A65D40]/20'
                      }`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight">{user.name}</p>
                        <p className={`text-[11px] truncate mt-0.5 ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>{user.email}</p>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {/* Profile / Continue Chat */}
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/chat'); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10 text-white/90' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <User size={14} className="text-accent opacity-80" />
                        <span>Sanctuary Chat</span>
                      </button>

                      {/* Settings */}
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
                          isNight ? 'hover:bg-white/10 text-white/90' : 'hover:bg-[#A65D40]/10 text-[#2E1C12]'
                        }`}
                      >
                        <SettingsIcon size={14} className="text-stone-400" />
                        <span>Settings</span>
                      </button>

                      <div className={`my-1 border-t ${isNight ? 'border-white/10' : 'border-[#2E1C12]/10'}`}></div>
                      
                      {/* Explicit Logout Click */}
                      <button 
                        onClick={handleLogout}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
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
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => openModal('login')}
                className={`px-5 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 shadow-sm ${
                  isNight
                    ? 'border-white/20 text-white bg-white/10 hover:bg-white/20 hover:border-white/30'
                    : 'border-[#2E1C12]/20 text-[#3D2A1D] bg-white/60 hover:bg-[#A65D40] hover:text-white hover:border-[#A65D40]'
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
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
            transition={{ duration: 0.25 }}
            className={`md:hidden mt-3 rounded-2xl p-4 border overflow-hidden backdrop-blur-2xl ${
              isNight
                ? 'bg-[#121724]/95 border-white/10 text-white'
                : 'bg-[#FCF8F2]/95 border-[#2E1C12]/10 text-[#3D2A1D]'
            }`}
          >
            <div className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    location.pathname === link.path
                      ? (isNight ? 'bg-white/15 text-white font-semibold' : 'bg-[#A65D40] text-white font-semibold')
                      : (isNight ? 'hover:bg-white/5 text-white/80' : 'hover:bg-black/5 text-[#3D2A1D]')
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-2 mt-1 border-t border-black/10 dark:border-white/10 flex flex-col space-y-1">
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
                      isNight ? 'hover:bg-white/5 text-white/80' : 'hover:bg-black/5 text-[#3D2A1D]'
                    }`}
                  >
                    <SettingsIcon size={14} className="text-stone-400" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
                      isNight ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
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
