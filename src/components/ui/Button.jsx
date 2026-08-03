import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-md font-body transition-all duration-slowest ease-breathe flex items-center justify-center";
  
  const variants = {
    primary: "bg-primary text-background hover:bg-secondary shadow-soft",
    secondary: "bg-surface text-primary hover:bg-accent border border-accent",
    ghost: "bg-transparent text-primary hover:text-secondary",
  };

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
      whileTap={{ y: 0 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};
