import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthButton } from '../components/auth/AuthButton';
import { AuthFooter } from '../components/auth/AuthFooter';

export const Register = () => {
  return (
    <AuthLayout>
      <AuthCard 
        title="Create Account" 
        subtitle="Begin your journey with Wisdom AI."
      >
        <AuthInput type="text" placeholder="Full Name" />
        <AuthInput type="email" placeholder="Email" />
        <AuthInput type="password" placeholder="Password" />
        <AuthInput type="password" placeholder="Confirm Password" />

        <div className="mt-4">
          <AuthButton>Create Account</AuthButton>
        </div>

        <AuthFooter 
          text="Already have an account?" 
          linkText="Sign In" 
          to="/login" 
        />
      </AuthCard>
    </AuthLayout>
  );
};
