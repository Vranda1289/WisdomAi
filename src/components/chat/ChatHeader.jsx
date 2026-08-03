import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export const ChatHeader = ({ onToggleSidebar }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <header className={`h-16 flex items-center justify-between px-6 md:hidden border-b transition-colors duration-700 ${
      isNight ? 'bg-[#121620]/60 border-white/5' : 'bg-[#FDFBF7]/60 border-black/5'
    }`}>
      <button
        onClick={onToggleSidebar}
        className={`p-2 -ml-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isNight ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/5 text-[#3D2A1D]/80'
        }`}
        aria-label="Toggle Sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Link 
        to="/" 
        className="font-heading text-xl font-bold tracking-wider text-current focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
        aria-label="Go to Home"
      >
        Wisdom AI
      </Link>

      <div className="w-9" /> {/* spacer to align title to center */}
    </header>
  );
};
