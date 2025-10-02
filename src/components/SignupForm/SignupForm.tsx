import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SignupData, UserRole } from '../../types/auth.types';

interface SignupFormProps {
  onSubmit: (data: SignupData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  newsletterName?: string;
}

export function SignupForm({ onSubmit, loading = false, error }: SignupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole | '',
    newsletterName: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    if (formData.role === UserRole.CREATOR && !formData.newsletterName) {
      errors.newsletterName = 'Newsletter name is required for creators';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    await onSubmit(signupData as SignupData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`mt-1 appearance-none block w-full px-3 py-2 border ${
              validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            disabled={loading}
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`mt-1 appearance-none block w-full px-3 py-2 border ${
              validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            disabled={loading}
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            validationErrors.email ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          disabled={loading}
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          I want to
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border ${
            validationErrors.role ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          disabled={loading}
        >
          <option value="">Select your role</option>
          <option value={UserRole.CREATOR}>Create and publish newsletters</option>
          <option value={UserRole.SUBSCRIBER}>Subscribe to newsletters</option>
        </select>
        {validationErrors.role && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
        )}
      </div>

      {formData.role === UserRole.CREATOR && (
        <div>
          <label htmlFor="newsletterName" className="block text-sm font-medium text-gray-700">
            Newsletter name
          </label>
          <input
            id="newsletterName"
            type="text"
            value={formData.newsletterName}
            onChange={(e) => handleChange('newsletterName', e.target.value)}
            className={`mt-1 appearance-none block w-full px-3 py-2 border ${
              validationErrors.newsletterName ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            disabled={loading}
            placeholder="My Awesome Newsletter"
          />
          {validationErrors.newsletterName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.newsletterName}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            validationErrors.password ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          disabled={loading}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          disabled={loading}
        />
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </div>

      <div className="text-sm text-center">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </div>
    </form>
  );
}
