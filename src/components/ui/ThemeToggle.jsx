import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";
import { createPortal } from "react-dom";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isNight = theme === themes.NIGHT_REFLECTION;

  return createPortal(
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={toggleTheme}
      className="
        fixed
        top-6
        right-8
        z-[99999]
        w-[82px]
        h-[38px]
        rounded-full
        bg-black/20
        backdrop-blur-xl
        border
        border-white/20
        shadow-xl
        overflow-hidden
      "
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
          top-1
          left-0
          w-8
          h-8
          rounded-full
          bg-white
          shadow-md
        "
      />

      {/* Icons */}
      <div className="relative z-10 flex h-full items-center justify-between px-3">
        <Sun
          size={16}
          className={
            !isNight
              ? "text-[#F59E0B]"
              : "text-white/50"
          }
        />

        <Moon
          size={16}
          className={
            isNight
              ? "text-[#1E293B]"
              : "text-white/50"
          }
        />
      </div>
    </motion.button>,
    document.body
  );
};