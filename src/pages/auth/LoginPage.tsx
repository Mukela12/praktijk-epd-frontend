import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoginFormData, AuthenticationState } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import AuthErrorMessage from '@/components/auth/AuthErrorMessage';
import { useAuthError } from '@/hooks/useAuthError';

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
  const { login, authenticationState, pendingNavigation, isLoading, requiresTwoFactor } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, handleAuthError, clearError } = useAuthError();

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
    try {
      clearError(); // Clear any previous errors
      
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
    } catch (err) {
      handleAuthError(err, 'login');
    }
  };

  const emailValue = watch('email');
  const passwordValue = watch('password');

  return (
    <PageTransition>
      <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fadeInUp">
        <div className="relative inline-flex items-center justify-center mb-6">
          <img 
            src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154310/Logo_van_PraktijkEPD-3_3_xyr2pg.png"
            alt="PraktijkEPD Logo"
            className="h-24 w-auto"
          />
        </div>
        <h1 className="heading-primary text-gray-900 mb-2">
          {t('twofa.welcomeBack')}
        </h1>
        <p className="text-body text-gray-600">
          {t('twofa.signInAccount')}
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-6 card-premium bg-green-50 border-green-200 p-4 flex items-start animate-slideIn">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="card-premium p-8 animate-fadeInUp">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="label-premium">
              {t('twofa.emailAddress')}
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                onFocus={clearError}
                className={`input-premium ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : ''
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
              <p className="form-error flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="label-premium">
              {t('twofa.password')}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                onFocus={clearError}
                className={`input-premium pr-12 ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : ''
                }`}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 focus-visible-premium"
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
              <p className="form-error flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Two-Factor Code Field (shown when required) */}
          {requiresTwoFactor && (
            <div className="card-premium bg-blue-50 border-blue-200 p-4">
              <label htmlFor="twoFactorCode" className="label-premium">
                {t('twofa.twoFactorCode')}
              </label>
              <input
                {...register('twoFactorCode')}
                type="text"
                id="twoFactorCode"
                maxLength={6}
                className={`input-premium text-center tracking-widest ${
                  errors.twoFactorCode 
                    ? 'border-red-300 bg-red-50' 
                    : ''
                }`}
                placeholder="000000"
                autoComplete="one-time-code"
              />
              {errors.twoFactorCode && (
                <p className="form-error flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.twoFactorCode.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-500" />
                {t('twofa.enterCode')}
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
          <AuthErrorMessage error={error} onDismiss={clearError} />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn-premium-primary w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
      <div className="mt-6 space-y-4 animate-fadeInUp">
        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="text-gradient-primary hover:underline font-medium transition-all text-sm"
          >
            {t('twofa.forgotPassword')}
          </Link>
        </div>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-body-sm text-gray-600 mb-3">
            {t('twofa.alreadyAccount')}
          </p>
          <Link
            to="/auth/register"
            className="btn-premium-secondary inline-flex items-center justify-center"
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