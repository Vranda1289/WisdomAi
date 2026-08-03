import { useState } from 'react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { useAuthModal } from '../../context/AuthModalContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const { switchView, closeModal } = useAuthModal();
  const { theme } = useTheme();
  const { login } = useAuth();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccess('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      setSuccess('Successfully signed in!');
      setTimeout(() => {
        closeModal();
        navigate('/chat');
      }, 1000);
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 text-center">
        <h2 className={`font-heading text-4xl mb-2 transition-colors duration-700 ${isNight ? 'text-white' : 'text-[#2F2018]'}`}>
          Welcome Back
        </h2>
        <p className={`text-base transition-colors duration-700 ${isNight ? 'text-blue-100/70' : 'text-[#4A392E]/70'}`}>
          Continue your journey toward inner peace.
        </p>
      </div>

      <AnimatePresence>
        {globalError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {globalError}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthInput 
        type="email" 
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Email" 
        disabled={isLoading || success}
      />
      <AuthInput 
        type="password" 
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Password" 
        disabled={isLoading || success}
      />
      
      <div className="flex justify-end mb-6 -mt-2">
        <button type="button" className={`text-sm font-medium transition-colors duration-300 ${isNight ? 'text-blue-300/80 hover:text-blue-300' : 'text-[#A65D40]/80 hover:text-[#A65D40]'}`}>
          Forgot Password?
        </button>
      </div>

      <AuthButton type="submit" isLoading={isLoading} disabled={!!success}>
        Sign In
      </AuthButton>

      <div className={`mt-8 text-center transition-colors duration-700 ${isNight ? 'text-white/60' : 'text-[#4A392E]/70'}`}>
        <span>Don't have an account? </span>
        <button 
          type="button"
          onClick={() => switchView('register')}
          className={`font-semibold transition-colors duration-300 ${isNight ? 'text-blue-300 hover:text-blue-200' : 'text-[#A65D40] hover:text-[#8E4B31]'}`}
        >
          Create one
        </button>
      </div>
    </form>
  );
};
