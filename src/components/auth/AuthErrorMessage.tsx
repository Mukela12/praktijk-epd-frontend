import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

export interface AuthError {
  type: 'login' | 'register' | 'verification' | 'general';
  code?: string;
  message: string;
  field?: string;
  details?: string[];
}

interface AuthErrorMessageProps {
  error: AuthError | null;
  onDismiss?: () => void;
  variant?: 'inline' | 'floating';
}

// Common error messages mapping
const errorMessages: Record<string, { title: string; description: string; suggestions?: string[] }> = {
  // Login errors
  'invalid_credentials': {
    title: 'Invalid Login Credentials',
    description: 'The email or password you entered is incorrect.',
    suggestions: [
      'Check your email address for typos',
      'Ensure Caps Lock is off when entering your password',
      'Try resetting your password if you\'ve forgotten it'
    ]
  },
  'email_not_verified': {
    title: 'Email Not Verified',
    description: 'Please verify your email address before logging in.',
    suggestions: [
      'Check your inbox for the verification email',
      'Check your spam folder',
      'Request a new verification email'
    ]
  },
  'account_locked': {
    title: 'Account Temporarily Locked',
    description: 'Too many failed login attempts. Your account has been locked for security.',
    suggestions: [
      'Wait 15 minutes before trying again',
      'Contact support if you need immediate assistance',
      'Reset your password if you\'ve forgotten it'
    ]
  },
  'account_suspended': {
    title: 'Account Suspended',
    description: 'Your account has been suspended. Please contact support.',
    suggestions: [
      'Contact your administrator',
      'Check your email for more information'
    ]
  },
  'two_factor_required': {
    title: 'Two-Factor Authentication Required',
    description: 'Please enter your 6-digit authentication code.',
    suggestions: [
      'Open your authenticator app',
      'Enter the 6-digit code shown',
      'Use a backup code if needed'
    ]
  },
  'invalid_two_factor': {
    title: 'Invalid Authentication Code',
    description: 'The code you entered is incorrect or has expired.',
    suggestions: [
      'Make sure you\'re using the current code',
      'Check that your device time is synchronized',
      'Try the next code if this one just expired'
    ]
  },
  
  // Registration errors
  'email_already_exists': {
    title: 'Email Already Registered',
    description: 'An account with this email address already exists.',
    suggestions: [
      'Try logging in instead',
      'Use a different email address',
      'Reset your password if you\'ve forgotten it'
    ]
  },
  'weak_password': {
    title: 'Password Too Weak',
    description: 'Your password doesn\'t meet our security requirements.',
    suggestions: [
      'Use at least 8 characters',
      'Include uppercase and lowercase letters',
      'Add numbers and special characters',
      'Avoid common words or patterns'
    ]
  },
  'registration_disabled': {
    title: 'Registration Temporarily Disabled',
    description: 'New registrations are currently not allowed.',
    suggestions: [
      'Contact your administrator for an invitation',
      'Try again later'
    ]
  },
  'invalid_email_format': {
    title: 'Invalid Email Format',
    description: 'Please enter a valid email address.',
    suggestions: [
      'Check for typos in your email',
      'Ensure it follows the format: name@domain.com'
    ]
  },
  
  // General errors
  'network_error': {
    title: 'Connection Problem',
    description: 'Unable to connect to our servers.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ]
  },
  'server_error': {
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again.',
    suggestions: [
      'Wait a moment and try again',
      'Contact support if this continues'
    ]
  },
  'session_expired': {
    title: 'Session Expired',
    description: 'Your session has expired for security reasons.',
    suggestions: [
      'Log in again to continue',
      'This happens after extended inactivity'
    ]
  }
};

const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ 
  error, 
  onDismiss,
  variant = 'inline' 
}) => {
  if (!error) return null;

  const errorConfig = errorMessages[error.code || ''] || {
    title: error.type === 'login' ? 'Login Failed' : 'Registration Failed',
    description: error.message,
    suggestions: error.details
  };

  const containerClasses = variant === 'floating' 
    ? 'fixed top-4 right-4 max-w-md z-50'
    : 'w-full';

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={containerClasses}
        >
          <div className="bg-gradient-to-r from-red-50 to-red-50/80 border-2 border-red-200/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  {errorConfig.title}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {errorConfig.description}
                </p>
                
                {errorConfig.suggestions && errorConfig.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-3"
                  >
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Suggestions:
                    </p>
                    <ul className="space-y-1">
                      {errorConfig.suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start text-xs text-red-600"
                        >
                          <CheckCircleIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0 text-red-400" />
                          <span>{suggestion}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-red-500" />
                </button>
              )}
            </div>
            
            {/* Premium gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-400/20 blur-xl -z-10 animate-pulse-soft" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthErrorMessage;