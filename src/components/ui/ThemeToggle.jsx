import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.04 }}
      onClick={toggleTheme}
      className={`
        relative
        w-[76px]
        h-[34px]
        rounded-full
        backdrop-blur-xl
        border
        shadow-sm
        overflow-hidden
        flex-shrink-0
        transition-colors
        duration-500
        ${isNight ? 'bg-white/10 border-white/20' : 'bg-black/10 border-[#2E1C12]/20'}
        ${className}
      `}
      aria-label="Toggle light and dark theme"
      title={isNight ? "Switch to Winter Morning" : "Switch to Night Reflection"}
    >
      {/* Sliding Circle */}
      <motion.div
        initial={false}
        animate={{
          x: isNight ? 42 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 30,
        }}
        className="
          absolute
          top-[3px]
          left-0
          w-7
          h-7
          rounded-full
          bg-white
          shadow-md
        "
      />

      {/* Icons */}
      <div className="relative z-10 flex h-full items-center justify-between px-2.5">
        <Sun
          size={14}
          className={
            !isNight
              ? "text-[#F59E0B]"
              : "text-white/40"
          }
        />

        <Moon
          size={14}
          className={
            isNight
              ? "text-[#1E293B]"
              : "text-[#3D2A1D]/40"
          }
        />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;