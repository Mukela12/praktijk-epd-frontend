import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

interface TwoFactorSetupStepProps {
  onComplete: () => Promise<void>;
  onSkip?: () => Promise<void>;
}

const TwoFactorSetupStep: React.FC<TwoFactorSetupStepProps> = ({
  onComplete,
  onSkip
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // For now, we'll redirect to the existing 2FA setup page
  // In a full implementation, you would integrate the 2FA setup directly here

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      // Navigate to the existing 2FA setup page
      navigate('/auth/2fa', { 
        state: { 
          fromOnboarding: true,
          returnTo: '/onboarding'
        }
      });
    } catch (error) {
      console.error('Error navigating to 2FA setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (onSkip) {
      setIsLoading(true);
      try {
        await onSkip();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="heading-primary text-gray-900 mb-2">
          Secure Your Account with 2FA
        </h2>
        <p className="text-body text-gray-600">
          Add an extra layer of security to protect your account and patient data
        </p>
      </div>

      {/* Content */}
      <div className="card-premium p-8">
        {/* Benefits */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Enable Two-Factor Authentication?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Enhanced Security</p>
                <p className="text-sm text-gray-600">Protect your account from unauthorized access</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">HIPAA Compliance</p>
                <p className="text-sm text-gray-600">Meet healthcare data protection requirements</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Patient Trust</p>
                <p className="text-sm text-gray-600">Show your commitment to protecting patient information</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <p className="text-sm text-gray-700">
                Download an authenticator app like Google Authenticator or Authy
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <p className="text-sm text-gray-700">
                Scan the QR code with your authenticator app
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </div>
              <p className="text-sm text-gray-700">
                Enter the 6-digit code from your app to verify
              </p>
            </div>
          </div>
        </div>

        {/* App recommendations */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">Recommended Authenticator Apps:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg flex items-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700">Google Authenticator</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg flex items-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700">Microsoft Authenticator</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg flex items-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700">Authy</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg flex items-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700">1Password</span>
            </div>
          </div>
        </div>

        {/* Warning for therapists */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important for Healthcare Professionals</p>
              <p className="text-sm text-amber-700 mt-1">
                Two-factor authentication is highly recommended for all healthcare providers to ensure 
                the security of patient data and maintain compliance with privacy regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSetup2FA}
            disabled={isLoading}
            className="btn-premium-primary w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Loading...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Set Up Two-Factor Authentication
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          {onSkip && (
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="btn-premium-ghost w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for Now
            </button>
          )}
        </div>

        {/* Note about skipping */}
        {onSkip && (
          <p className="text-xs text-gray-500 text-center mt-4">
            You can always enable 2FA later from your account settings
          </p>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetupStep;