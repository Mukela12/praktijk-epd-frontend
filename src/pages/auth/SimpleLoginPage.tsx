import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { useSimpleAuth } from '@/store/simpleAuthStore';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

const SimpleLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, needs2FA, login, loginWith2FA } = useSimpleAuth();
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !needs2FA) {
      const dashboardRoute = authService.getDashboardRoute(user.role);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, needs2FA, navigate]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 2FA form
  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  // Handle login submit
  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    const result = await login(data.email, data.password);
    
    if (!result.success && !result.needs2FA) {
      setError(result.error || 'Login failed');
    }
  };

  // Handle 2FA submit
  const handle2FA = async (data: TwoFactorFormData) => {
    setError(null);
    const result = await loginWith2FA(data.code);
    
    if (result.success) {
      // Navigation will be handled by useEffect
    } else {
      setError(result.error || '2FA verification failed');
      twoFactorForm.reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {needs2FA ? 'Two-Factor Authentication' : 'Sign in to your account'}
          </h2>
          {needs2FA && (
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!needs2FA ? (
            // Login Form
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    autoComplete="current-password"
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Sign in'}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          ) : (
            // 2FA Form
            <form onSubmit={twoFactorForm.handleSubmit(handle2FA)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    {...twoFactorForm.register('code')}
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="appearance-none block w-full px-3 py-3 text-center text-lg font-mono border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="000000"
                  />
                </div>
                {twoFactorForm.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {twoFactorForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => {
                  useSimpleAuth.getState().clearError();
                  setError(null);
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;