import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { copy } from "../constants/copy";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { themes } from "../constants/themes";
import heroWarm from "../assets/images/hero-warm.png";
import heroNight from "../assets/images/hero-dark.jpg";

export const LandingPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const navigate = useNavigate();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const handlePrimaryAction = () => {
    if (user) {
      navigate('/chat');
    } else {
      openModal('register');
    }
  };

  const handleSecondaryAction = () => {
    if (user) {
      navigate('/reflection');
    } else {
      openModal('login');
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Atmospheric Background Images */}
      <AnimatePresence>
        <motion.img
          key={theme}
          src={isNight ? heroNight : heroWarm}
          alt="Wisdom AI Atmospheric Sanctuary"
          draggable={false}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: 1,
            scale: [1.05, 1.08, 1.05],
            x: [0, -6, 0],
            y: [0, -4, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 30, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 30, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 30, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 w-full h-full object-cover object-[74%_center]"
        />
      </AnimatePresence>

      {/* Warm Daylight Atmospheric Overlays */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 bg-gradient-to-r from-[#FCF8F2]/90 via-[#FCF8F2]/65 to-transparent pointer-events-none ${
          isNight ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 bg-radial-at-tl from-amber-200/20 via-transparent to-transparent pointer-events-none ${
          isNight ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Deep Night Atmospheric Overlays */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 bg-gradient-to-r from-[#0B1120]/95 via-[#0B1120]/75 to-black/30 pointer-events-none ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 bg-radial-at-tr from-blue-900/15 via-transparent to-black/40 pointer-events-none ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtle Environmental Vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-black/15 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex items-center h-screen">
        <div className="max-w-7xl mx-auto w-full px-8 md:px-20">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className={`font-heading text-5xl md:text-7xl leading-[1.05] tracking-tight transition-colors duration-700 ${
                isNight ? 'text-[#F3F4F6]' : 'text-[#2F2018]'
              }`}
            >
              Wisdom begins
              <br />
              with being heard.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`mt-8 max-w-lg text-[20px] leading-9 transition-colors duration-700 ${
                isNight ? 'text-[#D1D5DB]' : 'text-[#4A392E]'
              }`}
            >
              {copy.landing.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex flex-wrap gap-5"
            >
              <Button
                onClick={handlePrimaryAction}
                className={`
                  rounded-full
                  px-8
                  py-3.5
                  shadow-lg
                  transition-all
                  duration-700
                  ${isNight
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                    : 'bg-[#A65D40] hover:bg-[#8E4B31] text-white'}
                `}
              >
                {user ? "Continue Conversation" : copy.landing.buttons.primary}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSecondaryAction}
                className={`
                  rounded-full
                  border
                  backdrop-blur-md
                  px-8
                  py-3.5
                  transition-all
                  duration-700
                  ${isNight
                    ? 'border-white/30 text-white/90 bg-white/10 hover:bg-white/20'
                    : 'border-[#A65D40] text-[#5A3C2E] bg-white/20 hover:bg-white/35'}
                `}
              >
                {user ? "View Reflection" : copy.landing.buttons.secondary}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;