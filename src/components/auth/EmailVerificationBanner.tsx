import React, { useState } from 'react';
import { EnvelopeIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/services/api';
import { useTranslation } from '@/contexts/LanguageContext';
import { toast } from 'react-hot-toast';

interface EmailVerificationBannerProps {
  email: string;
  isVerified: boolean;
  onVerified?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  email, 
  isVerified, 
  onVerified 
}) => {
  const { t } = useTranslation();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Don't show banner if email is already verified
  if (isVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await authApi.resendVerificationEmail(email);
      if (response.success) {
        toast.success(t('auth.verificationEmailSent') || 'Verification email sent! Please check your inbox.');
        
        // Set cooldown period (60 seconds)
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error(t('auth.tooManyAttempts') || 'Too many attempts. Please wait before trying again.');
        setResendCooldown(30);
      } else {
        toast.error(t('auth.resendFailed') || 'Failed to resend email. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            {t('auth.emailNotVerified') || 'Email Not Verified'}
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            {t('auth.verificationEmailSentTo') || 'We sent a verification email to'} <strong>{email}</strong>. 
            {t('auth.checkInboxAndSpam') || ' Please check your inbox and spam folder.'}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 mr-1.5" />
              {resendCooldown > 0 
                ? `${t('auth.resendIn') || 'Resend in'} ${resendCooldown}s` 
                : isResending 
                  ? t('auth.sending') || 'Sending...' 
                  : t('auth.resendEmail') || 'Resend Email'}
            </button>
            
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-amber-700 bg-transparent hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              {showTroubleshooting ? t('auth.hideTips') || 'Hide Tips' : t('auth.notReceivingEmail') || 'Not receiving emails?'}
            </button>
          </div>

          {showTroubleshooting && (
            <div className="mt-4 p-3 bg-white rounded-md border border-amber-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {t('auth.troubleshootingTips') || 'Troubleshooting Tips'}:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t('auth.checkSpamFolder') || 'Check your spam/junk folder'}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t('auth.addToContacts') || 'Add noreply@praktijkepd.nl to your contacts'}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t('auth.checkAllMail') || 'In Gmail, check "All Mail" folder'}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t('auth.waitFewMinutes') || 'Wait a few minutes - emails can be delayed'}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t('auth.tryAlternativeEmail') || 'Try registering with a different email provider'}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                {t('auth.stillHavingIssues') || 'Still having issues?'} 
                <a href="mailto:support@praktijkepd.nl" className="text-blue-600 hover:text-blue-700 ml-1">
                  {t('auth.contactSupport') || 'Contact support'}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;