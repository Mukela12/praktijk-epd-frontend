import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  KeyIcon, 
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { TwoFactorFormData, TwoFactorSetup } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Validation schema
const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(8, 'Code must be 6-8 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
});

// Backup code validation schema
const backupCodeSchema = z.object({
  code: z
    .string()
    .min(8, 'Backup code must be at least 8 characters')
    .max(12, 'Backup code must be at most 12 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Backup code must contain only letters and numbers'),
});

const TwoFactorPage: React.FC = () => {
  const [mode, setMode] = useState<'verify' | 'setup'>('verify');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [qrCodeError, setQrCodeError] = useState(false);
  
  const { 
    setup2FA, 
    verify2FA, 
    requiresTwoFactor, 
    twoFactorSetupRequired, 
    isLoading 
  } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  // Backup code form
  const backupCodeForm = useForm<{ code: string }>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  // Watch for code input changes to clear errors
  const watchedCode = watch('code');
  const watchedBackupCode = backupCodeForm.watch('code');

  // Determine mode based on auth state
  useEffect(() => {
    if (twoFactorSetupRequired) {
      setMode('setup');
      initializeSetup();
    } else if (requiresTwoFactor) {
      setMode('verify');
    } else {
      // User shouldn't be here, redirect to dashboard
      navigate(from, { replace: true });
    }
  }, [twoFactorSetupRequired, requiresTwoFactor, from, navigate]);

  const initializeSetup = async () => {
    if (setupData) return; // Already initialized
    
    setIsLoadingSetup(true);
    setSetupError(null);
    
    try {
      const data = await setup2FA();
      if (data) {
        setSetupData(data);
        setRetryCount(0);
      } else {
        setSetupError('Failed to initialize 2FA setup. Please try again.');
      }
    } catch (error: any) {
      console.error('2FA setup error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initialize 2FA setup. Please try again.';
      setSetupError(errorMessage);
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const retrySetup = async () => {
    setRetryCount(prev => prev + 1);
    await initializeSetup();
  };

  const onSubmit = async (data: TwoFactorFormData) => {
    try {
      const success = await verify2FA(
        data.code, 
        mode === 'setup' ? setupData?.secret : undefined
      );

      if (success) {
        if (mode === 'setup') {
          setShowBackupCodes(true);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid code. Please try again.';
      setError('code', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  const onBackupCodeSubmit = async (data: { code: string }) => {
    try {
      const success = await verify2FA(data.code);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Backup code verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid backup code. Please try again.';
      backupCodeForm.setError('code', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (watchedCode && errors.code) {
      setError('code', { type: 'manual', message: '' });
    }
  }, [watchedCode, errors.code, setError]);

  // Clear backup code errors when user starts typing
  useEffect(() => {
    if (watchedBackupCode && backupCodeForm.formState.errors.code) {
      backupCodeForm.setError('code', { type: 'manual', message: '' });
    }
  }, [watchedBackupCode, backupCodeForm.formState.errors.code, backupCodeForm.setError]);

  const copyBackupCodes = async () => {
    if (setupData?.backupCodes) {
      try {
        await navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      } catch (error) {
        console.error('Failed to copy backup codes:', error);
      }
    }
  };

  const completeSetup = () => {
    navigate(from, { replace: true });
  };

  // Show backup codes after successful setup
  if (showBackupCodes && setupData) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <KeyIcon className="w-10 h-10 text-green-600" />
            <div className="absolute -inset-1 bg-green-400 rounded-3xl blur opacity-25"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Save Your Backup Codes
          </h1>
          <p className="text-gray-600 text-lg">
            Store these codes safely - they're your backup access keys
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Backup Codes */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Backup Codes</h3>
              <button
                onClick={copyBackupCodes}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                {copiedCodes ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Important Security Information
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Each backup code can only be used once</li>
              <li>• Store these codes in a password manager or safe location</li>
              <li>• Don't share these codes with anyone</li>
              <li>• You can generate new codes from your security settings</li>
            </ul>
          </div>

            {/* Complete Setup */}
            <button
              onClick={completeSetup}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Complete Setup & Continue
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Setup mode
  if (mode === 'setup') {
    if (isLoadingSetup) {
      return (
        <div className="w-full max-w-md mx-auto text-center">
          <LoadingSpinner size="large" text="Setting up two-factor authentication..." />
        </div>
      );
    }

    if (setupError) {
      return (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Setup Failed
            </h1>
            <p className="text-gray-600">
              There was an error initializing two-factor authentication.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{setupError}</p>
                </div>
              </div>
            </div>

            <button
              onClick={retrySetup}
              disabled={isLoadingSetup}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoadingSetup ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Retry Setup {retryCount > 0 && `(${retryCount})`}
                </>
              )}
            </button>

            <button
              onClick={() => navigate(from, { replace: true })}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (!setupData) {
      return (
        <div className="w-full max-w-md mx-auto text-center">
          <LoadingSpinner size="large" text="Setting up two-factor authentication..." />
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <QrCodeIcon className="w-10 h-10 text-blue-600" />
            <div className="absolute -inset-1 bg-blue-400 rounded-3xl blur opacity-25"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Setup Two-Factor Authentication
          </h1>
          <p className="text-gray-600 text-lg">
            Secure your account with an authenticator app
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 1: Scan QR Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Use your authenticator app to scan this QR code
              </p>
            </div>
            
            {!qrCodeError ? (
              <img 
                src={setupData.qrCodeUrl} 
                alt="2FA QR Code" 
                className="mx-auto mb-4 w-48 h-48 bg-gray-50 rounded-lg"
                onError={() => setQrCodeError(true)}
              />
            ) : (
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR code failed to load</p>
                  <button
                    onClick={() => {
                      setQrCodeError(false);
                      retrySetup();
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900">Supported Apps</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Google Authenticator, Authy, Microsoft Authenticator, or any TOTP app
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Entry */}
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Can't scan? Enter code manually
            </summary>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600 mb-2">Secret Key:</p>
                <code className="text-sm font-mono break-all bg-gray-100 p-2 rounded block">
                  {setupData.secret}
                </code>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(setupData.secret);
                      // Could add toast notification here
                    } catch (error) {
                      console.error('Failed to copy secret key:', error);
                    }
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Copy secret key
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Manual setup:</strong> Add a new account in your authenticator app, 
                  choose "Enter setup key manually", and paste the secret key above.
                </p>
              </div>
            </div>
          </details>

          {/* Verification Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="font-semibold">Step 2:</span> {t('twofa.enterCode')}
              </label>
              <input
                {...register('code')}
                type="text"
                id="code"
                maxLength={8}
                autoComplete="one-time-code"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center font-mono text-lg ${
                  errors.code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="123456"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.code.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Verify and Enable 2FA
                </>
              )}
            </button>
          </form>
          </div>
        </div>
      </div>
    );
  }

  // Verify mode
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('twofa.verify')}
        </h1>
        <p className="text-gray-600">
          {showBackupCodeInput ? 'Enter a backup code' : t('twofa.enterCode')}
        </p>
      </div>

      {!showBackupCodeInput ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.twoFactorCode')}
            </label>
            <input
              {...register('code')}
              type="text"
              id="code"
              maxLength={8}
              autoComplete="one-time-code"
              autoFocus
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center font-mono text-lg ${
                errors.code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="123456"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {errors.code.message}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
          >
            {isSubmitting || isLoading ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Verify Code
              </>
            )}
          </button>

          {/* Backup Code Option */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                reset();
                setShowBackupCodeInput(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Use backup code instead
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={backupCodeForm.handleSubmit(onBackupCodeSubmit)} className="space-y-6">
          <div>
            <label htmlFor="backup-code" className="block text-sm font-medium text-gray-700 mb-2">
              Backup Code
            </label>
            <input
              {...backupCodeForm.register('code')}
              type="text"
              id="backup-code"
              maxLength={12}
              autoComplete="one-time-code"
              autoFocus
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center font-mono text-lg ${
                backupCodeForm.formState.errors.code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="ABC123DEF456"
            />
            {backupCodeForm.formState.errors.code && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {backupCodeForm.formState.errors.code.message}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              Enter one of your backup codes
            </p>
          </div>

          <button
            type="submit"
            disabled={backupCodeForm.formState.isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
          >
            {backupCodeForm.formState.isSubmitting ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Verify Backup Code
              </>
            )}
          </button>

          {/* Back to TOTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                backupCodeForm.reset();
                setShowBackupCodeInput(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Use authenticator app instead
            </button>
          </div>
        </form>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          Need help?
        </h4>
        {!showBackupCodeInput ? (
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Open your authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>• Find the PraktijkEPD entry</li>
            <li>• Enter the 6-digit code displayed</li>
            <li>• The code changes every 30 seconds</li>
          </ul>
        ) : (
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Each backup code can only be used once</li>
            <li>• Backup codes are case-insensitive</li>
            <li>• You received these codes when you set up 2FA</li>
            <li>• Contact support if you've lost your backup codes</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default TwoFactorPage;