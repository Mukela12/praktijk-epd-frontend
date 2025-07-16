import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { authApi } from '@/services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const EmailVerificationPendingPage: React.FC = () => {
  console.log('=== EMAIL VERIFICATION PENDING PAGE RENDER ===');
  
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state (passed from registration or login)
  const email = (location.state as any)?.email || '';
  const fromLogin = location.state?.fromLogin || false;
  
  console.log('Location state:', location.state);
  console.log('Email from state:', email);
  console.log('From login attempt:', fromLogin);
  console.log('Current pathname:', location.pathname);
  
  // If no email is provided, redirect to register page after initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      if (!email && !isResending) {
        console.log('No email found in state, redirecting to register');
        navigate('/auth/register', { replace: true });
      }
    }, 200); // Give time for navigation state to settle
    
    return () => clearTimeout(timer);
  }, [email, navigate, isResending]);

  // Handle cooldown timer
  useEffect(() => {
    const savedCooldown = localStorage.getItem('resendEmailCooldown');
    if (savedCooldown) {
      const remainingTime = parseInt(savedCooldown) - Date.now();
      if (remainingTime > 0) {
        setResendCooldown(Math.ceil(remainingTime / 1000));
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
        if (resendCooldown === 1) {
          localStorage.removeItem('resendEmailCooldown');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center">
          <LoadingSpinner size="large" text="Loading..." />
        </div>
      </div>
    );
  }

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await authApi.resendVerificationEmail(email);
      
      if (response.success) {
        // Set cooldown (30 seconds to match API rate limit)
        const cooldownTime = Date.now() + 30000;
        localStorage.setItem('resendEmailCooldown', cooldownTime.toString());
        setResendCooldown(30);
        
        setEmailSent(true);
        toast.success('Verification email resent successfully! Please check your inbox.');
        
        // Reset email sent indicator after 3 seconds
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        toast.error(response.message || 'Failed to resend verification email.');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || 'Too many resend attempts. Please wait before trying again.';
        toast.error(message);
        
        // Set a longer cooldown for rate limit errors
        const cooldownTime = Date.now() + 30000; // 30 seconds
        localStorage.setItem('resendEmailCooldown', cooldownTime.toString());
        setResendCooldown(30);
      } else if (error.response?.status === 404) {
        toast.error('Email not found. Please register again.');
      } else if (error.response?.status === 400) {
        toast.error('Email is already verified.');
      } else {
        const message = error.response?.data?.message || 'Failed to resend verification email. Please try again later.';
        toast.error(message);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className={`relative w-20 h-20 ${emailSent ? 'bg-green-100' : 'bg-blue-100'} rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500`}>
          {emailSent ? (
            <CheckCircleIcon className="w-10 h-10 text-green-600 animate-bounce" />
          ) : (
            <EnvelopeIcon className="w-10 h-10 text-blue-600" />
          )}
          <div className={`absolute -inset-1 ${emailSent ? 'bg-green-400' : 'bg-blue-400'} rounded-3xl blur opacity-25 transition-all duration-500`}></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {fromLogin ? 'Email Verification Required' : 'Check Your Email'}
        </h1>
        <p className="text-gray-600 text-lg">
          {fromLogin 
            ? 'Please verify your email address to continue' 
            : 'We\'ve sent a verification link to your email'
          }
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="space-y-6">
          {/* Email Display */}
          {email && (
            <div className={`${fromLogin ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'} rounded-xl p-4 text-center ${fromLogin ? 'border' : ''}`}>
              {fromLogin && (
                <p className="text-sm text-yellow-800 mb-2 font-medium">
                  Login blocked - Email verification required
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                {fromLogin ? 'Please check your email:' : 'Verification email sent to:'}
              </p>
              <p className="font-semibold text-gray-900">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check your inbox</h3>
                <p className="text-sm text-gray-600">
                  Look for an email from PraktijkEPD with the subject "Verify your email address"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Click the verification link</h3>
                <p className="text-sm text-gray-600">
                  The link will verify your email and activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sign in to your account</h3>
                <p className="text-sm text-gray-600">
                  After verification, you'll be able to access your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Resend Email Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                resendCooldown > 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isResending ? (
                <LoadingSpinner size="small" />
              ) : resendCooldown > 0 ? (
                <>
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Resend available in {resendCooldown}s
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
              <span className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></span>
              Can't find the email?
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Add noreply@praktijkepd.nl to your contacts</li>
              <li>• Wait a few minutes and check again</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-4">
        <div>
          <Link
            to="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Already verified? Sign in
          </Link>
        </div>
        
        <div className="text-sm text-gray-500">
          Wrong email? 
          <Link
            to="/auth/register"
            className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Register again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;