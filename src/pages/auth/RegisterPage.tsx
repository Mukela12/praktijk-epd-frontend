import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { RegisterFormData, UserRole, LanguageCode } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useNavigateWithTransition } from '@/hooks/useNavigateWithTransition';
import PageTransition from '@/components/ui/PageTransition';
import AuthErrorMessage from '@/components/auth/AuthErrorMessage';
import { useAuthError } from '@/hooks/useAuthError';

// Forbidden passwords (should match backend)
const forbiddenPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'admin', 'user', 'test', 'praktijk', 'epd'
];

// Validation schema
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .refine(password => {
      const lowercasePassword = password.toLowerCase();
      return !forbiddenPasswords.some(forbidden => lowercasePassword.includes(forbidden));
    }, 'Password contains common or forbidden words'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name can only contain letters, spaces, apostrophes, and hyphens'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name can only contain letters, spaces, apostrophes, and hyphens'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(val), 'Please enter a valid phone number'),
  role: z.nativeEnum(UserRole),
  preferredLanguage: z.nativeEnum(LanguageCode),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigateWithTransition();
  const { error, handleAuthError, clearError } = useAuthError();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: UserRole.CLIENT,
      preferredLanguage: LanguageCode.EN,
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError(); // Clear any previous errors
      
      // Extract acceptTerms from data but don't send it to backend
      const { acceptTerms, ...registrationData } = data;
      
      // Clean up phone field - if empty, don't send it
      const cleanedData = {
        email: registrationData.email,
        password: registrationData.password,
        confirmPassword: registrationData.confirmPassword,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        ...(registrationData.phone && { phone: registrationData.phone }),
        role: registrationData.role,
        preferredLanguage: registrationData.preferredLanguage,
      };
      
      const success = await registerUser(cleanedData);

      if (success) {
        navigate('/auth/email-verification-pending', {
          state: { 
            email: registrationData.email,
            role: registrationData.role,
            will_need_2fa: ['admin', 'therapist', 'bookkeeper', 'assistant', 'substitute'].includes(registrationData.role)
          },
          replace: true
        });
      } else {
        // Error is handled in the catch block
      }
    } catch (err) {
      handleAuthError(err, 'register');
    }
  };

  const passwordValue = watch('password');

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordValue || '');

  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-yellow-300', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <PageTransition>
      <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fadeInUp">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 gradient-medical rounded-2xl flex items-center justify-center shadow-premium">
            <UserPlusIcon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-2 gradient-medical rounded-2xl blur-xl opacity-25 animate-pulse"></div>
        </div>
        <h1 className="heading-primary text-gray-900 mb-2">
          {t('auth.register')}
        </h1>
        <p className="text-body text-gray-600">
          {t('twofa.createAccountSubtitle')}
        </p>
      </div>

      {/* Registration Form */}
      <div className="card-premium p-8 animate-fadeInUp">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label-premium">
              {t('auth.firstName')}
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              autoComplete="given-name"
              className={`input-premium ${
                errors.firstName ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="form-error flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.firstName.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="label-premium">
              {t('auth.lastName')}
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              autoComplete="family-name"
              className={`input-premium ${
                errors.lastName ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="form-error flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.lastName.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="label-premium">
            {t('auth.email')}
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={`select-premium ${
              errors.email ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.email.message?.toString()}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="label-premium">
            {t('auth.phone')} <span className="text-gray-400">(optional)</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            autoComplete="tel"
            className={`select-premium ${
              errors.phone ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="+31 6 12345678"
          />
          {errors.phone && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.phone.message?.toString()}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="label-premium">
            {t('auth.role')}
          </label>
          <select
            {...register('role')}
            id="role"
            className={`select-premium ${
              errors.role ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            <option value={UserRole.CLIENT}>{t('role.client')}</option>
            <option value={UserRole.THERAPIST}>{t('role.therapist')}</option>
            <option value={UserRole.ASSISTANT}>{t('role.assistant')}</option>
            <option value={UserRole.BOOKKEEPER}>{t('role.bookkeeper')}</option>
          </select>
          {errors.role && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.role.message?.toString()}
            </p>
          )}
        </div>

        {/* Language Selection */}
        <div>
          <label htmlFor="preferredLanguage" className="label-premium">
            {t('twofa.preferredLanguage')}
          </label>
          <select
            {...register('preferredLanguage')}
            id="preferredLanguage"
            className={`select-premium ${
              errors.preferredLanguage ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            <option value={LanguageCode.EN}>🇺🇸 English</option>
            <option value={LanguageCode.NL}>🇳🇱 Nederlands</option>
          </select>
          {errors.preferredLanguage && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.preferredLanguage.message?.toString()}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="label-premium">
            {t('auth.password')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              className={`input-premium pr-12 ${
                errors.password ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible-premium"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="mt-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Password strength: {strengthLabels[passwordStrength - 1] || 'Too short'}
              </p>
            </div>
          )}

          {errors.password && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.password.message?.toString()}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="label-premium">
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              className={`input-premium pr-12 ${
                errors.confirmPassword ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible-premium"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.confirmPassword.message?.toString()}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            {...register('acceptTerms')}
            type="checkbox"
            id="acceptTerms"
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
          />
          <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
            {t('auth.acceptTerms')}
            <Link to="/terms" target="_blank" className="text-green-600 hover:text-green-700 hover:underline ml-1">
              terms and conditions
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="form-error flex items-center">
            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
            {errors.acceptTerms.message?.toString()}
          </p>
        )}

        {/* Error Message */}
        <AuthErrorMessage error={error} onDismiss={clearError} />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="btn-premium-success w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting || isLoading ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            t('auth.register')
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-body-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-gradient-primary hover:underline font-medium"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </form>
      </div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;