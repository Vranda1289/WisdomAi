import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthButton } from '../components/auth/AuthButton';
import { AuthFooter } from '../components/auth/AuthFooter';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../constants/themes';
import { Link } from 'react-router-dom';

export const Login = () => {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  return (
    <AuthLayout>
      <AuthCard 
        title="Welcome Back" 
        subtitle="Continue your journey toward inner peace."
      >
        <AuthInput type="email" placeholder="Email" />
        <AuthInput type="password" placeholder="Password" />
        
        <div className="flex justify-end mb-8 -mt-2">
          <Link to="#" className={`text-sm font-medium transition-colors duration-300 ${isNight ? 'text-blue-300/80 hover:text-blue-300' : 'text-[#A65D40]/80 hover:text-[#A65D40]'}`}>
            Forgot Password?
          </Link>
        </div>

        <AuthButton>Sign In</AuthButton>

        <AuthFooter 
          text="Don't have an account?" 
          linkText="Create one" 
          to="/register" 
        />
      </AuthCard>
    </AuthLayout>
  );
};
