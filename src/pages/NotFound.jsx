import { motion } from 'framer-motion';
import { copy } from '../constants/copy';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="max-w-md"
      >
        <p className="text-2xl font-heading text-secondary mb-12">
          {copy.errors.notFound.message}
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          {copy.errors.notFound.button}
        </Button>
      </motion.div>
    </div>
  );
};
