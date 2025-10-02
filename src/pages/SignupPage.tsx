import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout/AuthLayout';
import { SignupForm } from '../components/SignupForm/SignupForm';
import { useAuth } from '../contexts/AuthContext';
import { SignupData } from '../types/auth.types';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSignup = async (data: SignupData) => {
    setLoading(true);
    setError('');
    
    try {
      await signup(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your newsletter journey today"
    >
      <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
    </AuthLayout>
  );
}
