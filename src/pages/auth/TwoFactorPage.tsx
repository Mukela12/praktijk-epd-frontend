import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth, useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { TwoFactorFormData, TwoFactorSetup, AuthenticationState } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

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
    complete2FALogin,
    authenticationState,
    pendingNavigation,
    user,
    navigation,
    setAuthenticationState
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

  // Determine mode based on auth state - simplified without dependencies
  useEffect(() => {
    const currentAuthState = useAuthStore.getState().authenticationState;
    
    switch (currentAuthState) {
      case AuthenticationState.REQUIRES_2FA_SETUP:
        setMode('setup');
        initializeSetup();
        break;
      case AuthenticationState.REQUIRES_2FA_VERIFICATION:
        setMode('verify');
        break;
      case AuthenticationState.AUTHENTICATED_COMPLETE:
        // Don't navigate here - let the auth flow complete naturally
        console.log('[TwoFactorPage] Already authenticated, should not be on this page');
        break;
      case AuthenticationState.IDLE:
      case AuthenticationState.ERROR:
        // Auth state was cleared - redirect to login
        navigate('/auth/login', { replace: true });
        break;
      default:
        // For any other state, check if we should be on this page
        console.log('[TwoFactorPage] Unexpected auth state:', currentAuthState);
        break;
    }
  }, []); // Empty dependency array - only run once on mount

  // Removed pendingNavigation useEffect - navigation is handled after 2FA completion

  const initializeSetup = async () => {
    if (setupData) {
      return; // Already initialized
    }
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
      if (mode === 'setup') {
        // For setup mode, use the verify2FA function
        const success = await verify2FA(data.code, setupData?.secret);
        if (success) {
          setShowBackupCodes(true);
          
          // Check if auth state was updated and force navigation if needed
          const currentState = useAuthStore.getState();
          
          if (currentState.authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE && currentState.user?.role) {
            // Don't navigate immediately, let user see backup codes first
          }
        }
      } else {
        // For verification mode during login, complete the 2FA login
        const success = await complete2FALogin(data.code);
        
        if (success) {
          console.log('[TwoFactorPage] 2FA verification successful');
          
          // Force a complete page reload to ensure all state is refreshed
          // This breaks out of any React Router loops and ensures clean navigation
          setTimeout(() => {
            const currentState = useAuthStore.getState();
            if (currentState.user?.role) {
              const dashboardPath = navigation.getDashboardPath(currentState.user.role);
              console.log('[TwoFactorPage] Forcing navigation to:', dashboardPath);
              window.location.replace(dashboardPath);
            } else {
              // Fallback - refresh the page to reinitialize auth state
              // No user data, refreshing page
              window.location.reload();
            }
          }, 100);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid code. Please try again.';
      setError('code', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  const onBackupCodeSubmit = async (data: { code: string }) => {
    try {
      if (mode === 'setup') {
        // For setup mode, this shouldn't happen
        return;
      } else {
        // For verification mode during login, complete the 2FA login with backup code
        const success = await complete2FALogin(data.code);
        
        if (success) {
          // Navigation will be handled by the auth state change useEffect
        }
      }
    } catch (error: any) {
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
        // Failed to copy backup codes
      }
    }
  };

  const completeSetup = () => {
    // Force navigation to ensure we get the latest auth state
    const currentState = useAuthStore.getState();
    
    if (currentState.authenticationState === AuthenticationState.AUTHENTICATED_COMPLETE && currentState.user?.role) {
      const dashboardPath = navigation.getDashboardPath(currentState.user.role);
      navigate(dashboardPath, { replace: true });
    } else if (currentState.pendingNavigation) {
      navigate(currentState.pendingNavigation, { replace: true });
    } else if (user) {
      // Fallback to user prop if state isn't updated yet
      const dashboardPath = navigation.getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  // Show backup codes after successful setup
  if (showBackupCodes && setupData) {
    return (
      <PageTransition>
        <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <KeyIcon className="w-8 h-8 text-green-600" />
            <div className="absolute -inset-1 bg-green-400 rounded-2xl blur opacity-25"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('twofa.saveBackupCodesTitle')}
          </h1>
          <p className="text-gray-600">
            Store these codes safely - they're your backup access keys
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="space-y-5">
            {/* Backup Codes */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
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
              {t('twofa.completeSetup')}
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        </div>
      </PageTransition>
    );
  }

  // Setup mode
  if (mode === 'setup') {
    if (isLoadingSetup) {
      return (
        <PageTransition>
          <div className="w-full max-w-md mx-auto text-center">
            <LoadingSpinner size="large" text="Setting up two-factor authentication..." />
          </div>
        </PageTransition>
      );
    }

    if (setupError) {
      return (
        <PageTransition>
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
        </PageTransition>
      );
    }

    if (!setupData) {
      return (
        <PageTransition>
          <div className="w-full max-w-md mx-auto text-center">
            <LoadingSpinner size="large" text="Setting up two-factor authentication..." />
          </div>
        </PageTransition>
      );
    }

    return (
      <PageTransition>
        <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCodeIcon className="w-8 h-8 text-blue-600" />
            <div className="absolute -inset-1 bg-blue-400 rounded-2xl blur opacity-25"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('twofa.setup')}
          </h1>
          <p className="text-gray-600">
            Secure your account with an authenticator app
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="space-y-5">
            {/* QR Code */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('twofa.step1')}
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
                  <p className="text-sm text-gray-500">{t('twofa.qrFailed')}</p>
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
                      // Failed to copy secret key
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
                <span className="font-semibold">{t('twofa.step2')}</span> {t('twofa.enterCode')}
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
                {t('twofa.enterCode')}
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
                  {t('twofa.verifyEnable')}
                </>
              )}
            </button>
          </form>
          </div>
        </div>
        </div>
      </PageTransition>
    );
  }

  // Verify mode
  return (
    <PageTransition>
      <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <ShieldCheckIcon className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t('twofa.verify')}
        </h1>
        <p className="text-gray-600 text-sm">
          {showBackupCodeInput ? 'Enter a backup code' : t('twofa.enterCode')}
        </p>
      </div>

      {!showBackupCodeInput ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('auth.twoFactorCode')}
            </label>
            <input
              {...register('code')}
              type="text"
              id="code"
              maxLength={8}
              autoComplete="one-time-code"
              autoFocus
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-mono ${
                errors.code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 bg-gray-50 focus:bg-white'
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
              {t('twofa.enterCode')}
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
                {t('twofa.verifyCode')}
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
              {t('twofa.useBackupCode')}
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
                {t('twofa.verifyBackupCode')}
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
              {t('twofa.useAuthenticator')}
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
    </PageTransition>
  );
};

export default TwoFactorPage;