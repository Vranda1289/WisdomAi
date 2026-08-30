import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settings } from '../constants/settings';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themes } from '../constants/themes';
import { Check, Sparkles, Globe, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { theme, setSpecificTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return user?.language || localStorage.getItem('wisdom_pref_language') || 'en';
  });

  const [selectedStyle, setSelectedStyle] = useState(() => {
    return user?.companionStyle || localStorage.getItem('wisdom_pref_style') || 'gentle';
  });

  const [savedNotice, setSavedNotice] = useState('');

  const showSavedNotice = (text) => {
    setSavedNotice(text);
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleLanguageChange = async (langId) => {
    setSelectedLanguage(langId);
    localStorage.setItem('wisdom_pref_language', langId);
    showSavedNotice('Language preference saved.');
    if (user) {
      try {
        await api.put('/api/auth/preferences', { language: langId });
      } catch (err) {
        console.error('Failed to sync language preference to server:', err);
      }
    }
  };

  const handleStyleChange = async (styleId) => {
    setSelectedStyle(styleId);
    localStorage.setItem('wisdom_pref_style', styleId);
    showSavedNotice('Companion tone updated.');
    if (user) {
      try {
        await api.put('/api/auth/preferences', { companionStyle: styleId });
      } catch (err) {
        console.error('Failed to sync companion style to server:', err);
      }
    }
  };

  const handleThemeChange = async (spaceId) => {
    setSpecificTheme(spaceId);
    showSavedNotice('Sanctuary space updated.');
    if (user) {
      try {
        await api.put('/api/auth/preferences', { theme: spaceId });
      } catch (err) {
        console.error('Failed to sync theme preference to server:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wisdom_current_conversation_id');
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen pt-28 pb-24 px-6 transition-colors duration-700 ${
      isNight ? 'bg-[#0B1120] text-white' : 'bg-[#FCF8F2] text-[#2F2018]'
    }`}>
      <div className="max-w-3xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-4xl md:text-5xl font-heading font-medium tracking-tight"
          >
            Sanctuary Preferences
          </motion.h1>
          <p className={`text-sm max-w-md mx-auto ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
            Tune your surroundings and conversations to bring the deepest peace to your journey.
          </p>
        </div>

        {/* Feedback Notice */}
        <AnimatePresence>
          {savedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-2xl text-xs font-medium text-center border flex items-center justify-center gap-2 ${
                isNight ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <Check size={14} /> {savedNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Account Card */}
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className={`p-6 md:p-8 rounded-3xl border ${
              isNight ? 'bg-[#151a26]/60 border-white/10 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-heading font-bold text-2xl border ${
                  isNight ? 'bg-white/10 text-white border-white/20' : 'bg-[#FAF7F2] text-[#A65D40] border-[#A65D40]/20'
                }`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold">{user.name}</h3>
                  <p className={`text-xs ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>{user.email}</p>
                  <span className={`text-[11px] mt-1 inline-block ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                    Member of Wisdom AI Sanctuary
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-medium border transition-colors ${
                  isNight
                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </motion.section>
        )}

        <div className="space-y-10">
          
          {/* Space / Theme Selection */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`p-6 md:p-8 rounded-3xl border ${
              isNight ? 'bg-[#151a26]/60 border-white/10 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={16} className={isNight ? 'text-accent' : 'text-[#A65D40]'} />
              Sanctuary Space & Atmosphere
            </h2>
            <p className={`text-xs mb-6 ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
              Choose the lighting and visual atmosphere for your moments of reflection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settings.spaces.map((space) => {
                const isSelected = theme === space.id;
                return (
                  <button
                    key={space.id}
                    onClick={() => handleThemeChange(space.id)}
                    className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      isSelected 
                        ? (isNight ? 'border-accent bg-white/10 ring-2 ring-accent/30' : 'border-[#A65D40] bg-[#A65D40]/5 ring-2 ring-[#A65D40]/20')
                        : (isNight ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{space.id === 'winter_morning' ? '☀️' : '🌙'}</span>
                      <div>
                        <span className="text-sm font-medium block">{space.label}</span>
                        <span className={`text-[11px] ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                          {space.id === 'winter_morning' ? 'Warm, gentle daylight' : 'Deep, peaceful night'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className={`w-3 h-3 rounded-full ${isNight ? 'bg-accent' : 'bg-[#A65D40]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Conversation Style Selection */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`p-6 md:p-8 rounded-3xl border ${
              isNight ? 'bg-[#151a26]/60 border-white/10 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
              <Heart size={16} className={isNight ? 'text-accent' : 'text-[#A65D40]'} />
              Wisdom's Companion Tone
            </h2>
            <p className={`text-xs mb-6 ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
              How would you like Wisdom AI to respond and walk beside you?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'gentle', title: 'Gentle & Calming', desc: 'Warm, compassionate presence with breathing room.' },
                { id: 'balanced', title: 'Balanced & Grounded', desc: 'Gentle empathy paired with thoughtful structure.' },
                { id: 'practical', title: 'Practical Clarity', desc: 'Clear, constructive perspectives for real-life decisions.' },
                { id: 'spiritual', title: 'Deep & Philosophical', desc: 'Timeless reflections inspired by ancient philosophy and stillness.' },
              ].map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(style.id)}
                    className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? (isNight ? 'border-accent bg-white/10 ring-2 ring-accent/30' : 'border-[#A65D40] bg-[#A65D40]/5 ring-2 ring-[#A65D40]/20')
                        : (isNight ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5')
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-semibold">{style.title}</span>
                      {isSelected && (
                        <Check size={14} className={isNight ? 'text-accent' : 'text-[#A65D40]'} />
                      )}
                    </div>
                    <span className={`text-xs ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
                      {style.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Language Selection */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className={`p-6 md:p-8 rounded-3xl border ${
              isNight ? 'bg-[#151a26]/60 border-white/10 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
              <Globe size={16} className={isNight ? 'text-accent' : 'text-[#A65D40]'} />
              Language Preference
            </h2>
            <p className={`text-xs mb-6 ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
              Select your preferred language or cultural cadence for conversations.
            </p>

            <div className="flex flex-wrap gap-4">
              {settings.languages.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex-1 min-w-[140px] px-6 py-3.5 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? (isNight ? 'bg-white text-black border-white shadow-md' : 'bg-[#A65D40] text-white border-[#A65D40] shadow-sm')
                        : (isNight ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-black/10 bg-white text-[#3D2A1D] hover:bg-black/5')
                    }`}
                  >
                    {isSelected && <Check size={13} />}
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default Settings;
