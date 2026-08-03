import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export const AuthCard = ({ children, title, subtitle }) => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <div className={`
      relative z-10
      rounded-3xl p-10 sm:p-12
      backdrop-blur-xl
      shadow-2xl
      transition-all duration-700
      ${isNight 
        ? 'bg-white/5 border border-white/10 shadow-black/50 text-white' 
        : 'bg-white/60 border border-[#A65D40]/10 shadow-[#A65D40]/10 text-[#2F2018]'}
    `}>
      <div className="mb-10 text-center">
        <h2 className={`font-heading text-4xl mb-3 transition-colors duration-700 ${isNight ? 'text-white' : 'text-[#2F2018]'}`}>
          {title}
        </h2>
        <p className={`text-lg transition-colors duration-700 ${isNight ? 'text-blue-100/70' : 'text-[#4A392E]/70'}`}>
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
};
