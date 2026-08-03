import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { Link } from 'react-router-dom';

export const AuthFooter = ({ text, linkText, to }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <div className={`mt-8 text-center transition-colors duration-700 ${isNight ? 'text-white/60' : 'text-[#4A392E]/70'}`}>
      <span>{text} </span>
      <Link 
        to={to} 
        className={`font-semibold transition-colors duration-300 ${isNight ? 'text-blue-300 hover:text-blue-200' : 'text-[#A65D40] hover:text-[#8E4B31]'}`}
      >
        {linkText}
      </Link>
    </div>
  );
};
