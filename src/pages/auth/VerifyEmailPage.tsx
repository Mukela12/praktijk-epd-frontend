import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/services/api';
import { useTranslation } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const VerifyEmailPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token');
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        
        if (response.success) {
          setVerificationStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth/login', {
              state: { message: 'Email verified successfully! You can now login.' }
            });
          }, 3000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.message || 'Email verification failed');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(
          error.response?.data?.message || 
          'Email verification failed. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const resendVerification = async () => {
    // This would need to be implemented in the backend
    // For now, just redirect to login
    navigate('/auth/login');
  };

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Verifying Your Email
        </h1>
        <LoadingSpinner size="large" text="Please wait while we verify your email address..." />
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Email Verified Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your email address has been verified. You can now access all features of your PraktijkEPD account.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            Redirecting to login page in a few seconds...
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/auth/login"
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue to Login
          </Link>
          <p className="text-sm text-gray-600">
            Ready to get started? Log in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <XMarkIcon className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Email Verification Failed
      </h1>
      <p className="text-gray-600 mb-6">
        {errorMessage}
      </p>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          What can you do?
        </h3>
        <ul className="text-sm text-red-700 space-y-1 text-left">
          <li>• Check if you used the correct verification link</li>
          <li>• Make sure the link hasn't expired</li>
          <li>• Request a new verification email</li>
          <li>• Contact support if the problem persists</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={resendVerification}
          className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request New Verification Email
        </button>
        <Link
          to="/auth/login"
          className="block w-full text-gray-600 hover:text-gray-900 text-sm"
        >
          Back to Login
        </Link>
        <Link
          to="/contact"
          className="block w-full text-blue-600 hover:text-blue-700 text-sm"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;