import { motion } from 'framer-motion';
import { copy } from '../constants/copy';
import { settings } from '../constants/settings';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';

export const Settings = () => {
  const { theme, setSpecificTheme } = useTheme();

  return (
    <div className="flex-grow flex flex-col max-w-2xl mx-auto w-full pt-12 pb-24">
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-4xl font-heading mb-16 text-center"
      >
        Your Sanctuary
      </motion.h1>

      <div className="space-y-16">
        {/* Space / Theme Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.2, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-heading mb-6 text-secondary">✨ Your Space</h2>
          <div className="flex flex-col gap-4">
            {settings.spaces.map((space) => (
              <button
                key={space.id}
                onClick={() => setSpecificTheme(space.id)}
                className={`p-6 rounded-lg border transition-all duration-slow text-left flex items-center justify-between
                  ${theme === space.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-secondary/20 hover:border-secondary/50 text-secondary'
                  }`}
              >
                <span className="text-lg">{space.label}</span>
                {theme === space.id && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Language Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.4, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-heading mb-6 text-secondary">🌍 Conversation Language</h2>
          <div className="flex flex-wrap gap-4">
            {settings.languages.map((lang) => (
              <Button
                key={lang.id}
                variant={lang.id === 'en' ? 'primary' : 'secondary'}
                className="flex-1 min-w-[150px]"
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* Conversation Style Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-heading mb-6 text-secondary">🤍 Conversation Style</h2>
          <div className="grid grid-cols-2 gap-4">
            {settings.conversationStyles.map((style) => (
              <Button
                key={style.id}
                variant={style.id === 'gentle' ? 'primary' : 'secondary'}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};
