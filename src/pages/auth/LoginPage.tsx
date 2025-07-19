import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth, useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoginFormData, AuthenticationState } from '@/types/auth';
import { UserRole } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberDevice: z.boolean().optional().default(false),
  twoFactorCode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), 'Two-factor code must be 6 digits'),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, authenticationState, pendingNavigation, error, user, isLoading, requiresTwoFactor } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';
  const message = (location.state as any)?.message;

  // Handle navigation based on authentication state
  useEffect(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation, { replace: true });
    }
  }, [pendingNavigation, navigate]);

  // Handle different authentication states
  useEffect(() => {
    switch (authenticationState) {
      case AuthenticationState.REQUIRES_2FA_SETUP:
        navigate('/auth/2fa', { 
          state: { from: location.state?.from || { pathname: '/' } },
          replace: true 
        });
        break;
      case AuthenticationState.REQUIRES_2FA_VERIFICATION:
        navigate('/auth/2fa', { 
          state: { from: location.state?.from || { pathname: '/' } },
          replace: true 
        });
        break;
      case AuthenticationState.AUTHENTICATED_COMPLETE:
        // Will be handled by pendingNavigation effect
        break;
      default:
        break;
    }
  }, [authenticationState, navigate, location.state]);
  

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberDevice: false,
      twoFactorCode: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login({
      email: data.email,
      password: data.password,
      rememberDevice: data.rememberDevice,
      twoFactorCode: data.twoFactorCode,
    });

    // Handle email verification case
    if (result === 'email_not_verified') {
      navigate('/auth/email-verification-pending', {
        state: { email: data.email, fromLogin: true },
        replace: true
      });
    }
    
    // All other cases (success, 2FA, etc.) are handled by the useEffect hooks
    // that listen to the authentication state changes
  };

  const emailValue = watch('email');
  const passwordValue = watch('password');

  return (
    <PageTransition>
      <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('twofa.welcomeBack')}
        </h1>
        <p className="text-gray-600">
          {t('twofa.signInAccount')}
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('twofa.emailAddress')}
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-gray-50 focus:bg-white hover:border-gray-300'
                }`}
                placeholder="your.email@praktijkepd.nl"
              />
              {emailValue && !errors.email && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('twofa.password')}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-gray-50 focus:bg-white hover:border-gray-300'
                }`}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
              {passwordValue && !errors.password && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Two-Factor Code Field (shown when required) */}
          {requiresTwoFactor && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Two-Factor Authentication Code
              </label>
              <input
                {...register('twoFactorCode')}
                type="text"
                id="twoFactorCode"
                maxLength={6}
                className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center tracking-widest ${
                  errors.twoFactorCode 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                placeholder="000000"
                autoComplete="one-time-code"
              />
              {errors.twoFactorCode && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.twoFactorCode.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-500" />
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          )}

          {/* Remember Device */}
          <div className="flex items-center justify-between">
            <label htmlFor="rememberDevice" className="flex items-center cursor-pointer">
              <input
                {...register('rememberDevice')}
                type="checkbox"
                id="rememberDevice"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
              />
              <span className="ml-3 text-sm text-gray-700 select-none">
                {t('twofa.rememberDevice')}
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <p className="text-sm text-red-700 font-medium">{errors.root.message}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">{t('twofa.signing')}</span>
              </div>
            ) : (
              t('twofa.signIn')
            )}
          </button>
        </form>
      </div>

      {/* Links */}
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
          >
            {t('twofa.forgotPassword')}
          </Link>
        </div>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 mb-3 text-sm">
            {t('twofa.alreadyAccount')}
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 text-sm"
          >
            {t('twofa.createAccount')}
          </Link>
        </div>
      </div>

      </div>
    </PageTransition>
  );
};

export default LoginPage;