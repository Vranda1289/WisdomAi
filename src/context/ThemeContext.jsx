import { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../constants/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('wisdom_theme');
    return savedTheme || themes.WINTER_MORNING;
  });

  useEffect(() => {
    localStorage.setItem('wisdom_theme', theme);
    // Apply theme class to document body for CSS variables
    if (theme === themes.NIGHT_REFLECTION) {
      document.body.classList.add('theme-night_reflection');
    } else {
      document.body.classList.remove('theme-night_reflection');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === themes.WINTER_MORNING
        ? themes.NIGHT_REFLECTION
        : themes.WINTER_MORNING
    );
  };

  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
