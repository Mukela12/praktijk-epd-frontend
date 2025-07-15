import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/services/api';
import { useTranslation } from '@/contexts/LanguageContext';
import { ForgotPasswordFormData } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPasswordPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authApi.forgotPassword(data);
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError('root', {
          type: 'manual',
          message: response.message || 'Failed to send reset email. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to send reset email. Please try again.',
      });
    }
  };

  const resendEmail = async () => {
    const email = getValues('email');
    if (email) {
      try {
        await authApi.forgotPassword({ email });
      } catch (error) {
        console.error('Resend error:', error);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to{' '}
          <span className="font-medium text-gray-900">{getValues('email')}</span>
        </p>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              What's next?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new password</li>
              <li>• Sign in with your new password</li>
            </ul>
          </div>

          {/* Resend Button */}
          <button
            onClick={resendEmail}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Didn't receive the email? Click to resend
          </button>

          {/* Back to Login */}
          <Link
            to="/auth/login"
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.forgotPassword')}
        </h1>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.email')}
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            autoFocus
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.email.message?.toString()}
            </p>
          )}
        </div>

        {/* Error Message */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.root.message?.toString()}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            to="/auth/login"
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </form>

      {/* Security Note */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          Security Note
        </h4>
        <p className="text-xs text-gray-600">
          For security reasons, we'll send an email regardless of whether the email address is registered with us. 
          If you don't receive an email, please check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;