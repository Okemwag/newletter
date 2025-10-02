import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout/AuthLayout';
import { LoginForm } from '../components/LoginForm/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/auth.types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError('');
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Access your newsletter dashboard"
    >
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </AuthLayout>
  );
}
