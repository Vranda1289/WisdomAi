import { useState } from 'react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { useAuthModal } from '../../context/AuthModalContext';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
  const { switchView, closeModal } = useAuthModal();
  const { theme } = useTheme();
  const { register } = useAuth();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (!formData.name) newErrors.name = 'Full name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    const pass = formData.password;
    if (!pass) {
      newErrors.password = 'Password is required';
    } else if (pass.length < 8) {
      newErrors.password = 'Minimum 8 characters';
    } else if (!/[A-Z]/.test(pass)) {
      newErrors.password = 'Must contain one uppercase letter';
    } else if (!/[a-z]/.test(pass)) {
      newErrors.password = 'Must contain one lowercase letter';
    } else if (!/[0-9]/.test(pass)) {
      newErrors.password = 'Must contain one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      newErrors.password = 'Must contain one special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({ name: formData.name, email: formData.email, password: formData.password });
      setSuccess('Account created successfully! Welcome.');
      setTimeout(() => {
        closeModal();
        navigate('/chat');
      }, 1500);
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <h2 className={`font-heading text-4xl mb-2 transition-colors duration-700 ${isNight ? 'text-white' : 'text-[#2F2018]'}`}>
          Create Account
        </h2>
        <p className={`text-base transition-colors duration-700 ${isNight ? 'text-blue-100/70' : 'text-[#4A392E]/70'}`}>
          Begin your journey with Wisdom AI.
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

      <AuthInput type="text" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Full Name" disabled={isLoading || success} />
      <AuthInput type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Email" disabled={isLoading || success} />
      <AuthInput type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="Password" disabled={isLoading || success} />
      <AuthInput type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm Password" disabled={isLoading || success} />

      <div className="mt-6">
        <AuthButton type="submit" isLoading={isLoading} disabled={!!success}>Create Account</AuthButton>
      </div>

      <div className={`mt-6 text-center transition-colors duration-700 ${isNight ? 'text-white/60' : 'text-[#4A392E]/70'}`}>
        <span>Already have an account? </span>
        <button 
          type="button"
          onClick={() => switchView('login')}
          className={`font-semibold transition-colors duration-300 ${isNight ? 'text-blue-300 hover:text-blue-200' : 'text-[#A65D40] hover:text-[#8E4B31]'}`}
        >
          Sign In
        </button>
      </div>
    </form>
  );
};
