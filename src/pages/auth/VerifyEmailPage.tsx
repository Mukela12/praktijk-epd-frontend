import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/services/api';
import { useTranslation } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useNavigateWithTransition } from '@/hooks/useNavigateWithTransition';

const VerifyEmailPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigateWithTransition();
  
  // Use refs to track state across renders
  const verificationInProgress = useRef(false);
  const verificationCompleted = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const verifyEmail = async () => {
      // Skip if verification is already in progress or completed
      if (verificationInProgress.current || verificationCompleted.current) {
        return;
      }

      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token');
        return;
      }

      // Mark as in progress
      verificationInProgress.current = true;

      try {
        const response = await authApi.verifyEmail(token);
        
        // Only update state if component is still mounted
        if (!mountedRef.current) return;
        
        verificationCompleted.current = true;
        
        if (response.success) {
          setVerificationStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            if (mountedRef.current) {
              navigate('/auth/login', {
                state: { message: 'Email verified successfully! You can now login.' }
              });
            }
          }, 3000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.message || 'Email verification failed');
        }
      } catch (error: any) {
        // Only handle error if component is still mounted
        if (!mountedRef.current) return;
        
        verificationCompleted.current = true;
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        
        // Handle specific error cases
        if (error.response?.status === 429) {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
        } else if (error.response?.status === 400) {
          setErrorMessage('This verification link has already been used or is invalid.');
        } else {
          setErrorMessage(
            error.response?.data?.message || 
            'Email verification failed. The link may be invalid or expired.'
          );
        }
      } finally {
        verificationInProgress.current = false;
      }
    };

    verifyEmail();

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [token, navigate]);

  const resendVerification = async () => {
    // This would need to be implemented in the backend
    // For now, just redirect to login
    navigate('/auth/login');
  };

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <EnvelopeIcon className="w-10 h-10 text-blue-600" />
            <div className="absolute -inset-1 bg-blue-400 rounded-3xl blur opacity-25 animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Verifying Your Email
          </h1>
          <p className="text-gray-600 text-lg">
            Please wait while we verify your email address...
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <LoadingSpinner size="large" />
          <p className="text-sm text-gray-500 text-center mt-4">
            This should only take a moment
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
            <div className="absolute -inset-1 bg-green-400 rounded-3xl blur opacity-25"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Email Verified Successfully!
          </h1>
          <p className="text-gray-600 text-lg">
            Your email address has been verified
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Account Activated</h3>
              <p className="text-sm text-gray-600">
                Your PraktijkEPD account is now active and ready to use. You can access all features once you sign in.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 flex items-center justify-center">
                <span className="animate-pulse mr-2">●</span>
                Redirecting to login page in a few seconds...
              </p>
            </div>

            <Link
              to="/auth/login"
              className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group"
            >
              Continue to Login
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-sm text-gray-500">
              Ready to get started? Sign in to access your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div className="relative w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <XCircleIcon className="w-10 h-10 text-red-600" />
          <div className="absolute -inset-1 bg-red-400 rounded-3xl blur opacity-25"></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Verification Failed
        </h1>
        <p className="text-gray-600 text-lg">
          We couldn't verify your email address
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 mr-2" />
              {errorMessage}
            </h3>
            <p className="text-sm text-red-700">
              The verification link may be invalid, expired, or has already been used.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              What can you do?
            </h4>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Check if you clicked the correct verification link
              </li>
              <li className="flex items-start">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Verification links expire after 24 hours
              </li>
              <li className="flex items-start">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Each link can only be used once
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={resendVerification}
              className="flex items-center justify-center w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
              Request New Verification Email
            </button>
            
            <Link
              to="/auth/login"
              className="block w-full text-center py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Login
            </Link>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <a
              href="mailto:support@praktijkepd.nl"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;