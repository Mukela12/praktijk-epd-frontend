import React from 'react';
import { toast, ToastOptions } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export interface NotificationOptions extends Partial<ToastOptions> {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Custom toast component for more professional notifications
const createCustomToast = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info',
  options?: NotificationOptions
) => {
  const baseStyle = {
    minWidth: '300px',
    maxWidth: '500px',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const typeConfig = {
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      iconColor: '#fff'
    },
    error: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      iconColor: '#fff'
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#fff',
      iconColor: '#fff'
    },
    info: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      iconColor: '#fff'
    }
  };

  const config = typeConfig[type];

  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={{
          ...baseStyle,
          ...config,
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === 'success' && <CheckCircleIcon className="h-6 w-6" style={{ color: config.iconColor }} />}
              {type === 'error' && <XCircleIcon className="h-6 w-6" style={{ color: config.iconColor }} />}
              {type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6" style={{ color: config.iconColor }} />}
              {type === 'info' && <InformationCircleIcon className="h-6 w-6" style={{ color: config.iconColor }} />}
            </div>
            <div className="ml-3 flex-1">
              {options?.title && (
                <p className="text-sm font-medium" style={{ color: config.color }}>
                  {options.title}
                </p>
              )}
              <p className={`text-sm ${options?.title ? 'text-opacity-90' : 'font-medium'}`} style={{ color: config.color }}>
                {message}
              </p>
              {options?.description && (
                <p className="mt-1 text-sm text-opacity-75" style={{ color: config.color }}>
                  {options.description}
                </p>
              )}
              {options?.action && (
                <div className="mt-3">
                  <button
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-medium px-3 py-1 rounded-md transition-all duration-200"
                    onClick={() => {
                      options.action?.onClick();
                      toast.dismiss(t.id);
                    }}
                  >
                    {options.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-white border-opacity-20">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-25"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    {
      duration: options?.duration || 4000,
      position: 'top-right',
      ...options,
    }
  );
};

// Professional notification API
export const notifications = {
  success: (message: string, options?: NotificationOptions) => {
    return createCustomToast(message, 'success', options);
  },
  
  error: (message: string, options?: NotificationOptions) => {
    return createCustomToast(message, 'error', options);
  },
  
  warning: (message: string, options?: NotificationOptions) => {
    return createCustomToast(message, 'warning', options);
  },
  
  info: (message: string, options?: NotificationOptions) => {
    return createCustomToast(message, 'info', options);
  },
  
  // Authentication specific notifications
  auth: {
    loginSuccess: (userName?: string) => {
      return notifications.success(
        userName ? `Welcome back, ${userName}!` : 'Login successful!',
        {
          title: 'Authentication Success',
          duration: 3000,
        }
      );
    },
    
    loginFailed: (reason?: string) => {
      return notifications.error(
        reason || 'Invalid credentials. Please try again.',
        {
          title: 'Login Failed',
          description: 'Check your email and password',
          duration: 5000,
        }
      );
    },
    
    registrationSuccess: () => {
      return notifications.success(
        'Account created successfully!',
        {
          title: 'Registration Complete',
          description: 'Please check your email to verify your account',
          duration: 6000,
        }
      );
    },
    
    emailVerificationRequired: () => {
      return notifications.warning(
        'Please verify your email address to continue',
        {
          title: 'Email Verification Required',
          description: 'Check your inbox for a verification link',
          duration: 6000,
        }
      );
    },
    
    twoFactorRequired: () => {
      return notifications.info(
        'Two-factor authentication is required',
        {
          title: '2FA Setup Required',
          description: 'Enhanced security for your account',
          duration: 5000,
        }
      );
    },
    
    twoFactorSuccess: () => {
      return notifications.success(
        'Two-factor authentication enabled successfully!',
        {
          title: 'Security Enhanced',
          description: 'Your account is now more secure',
          duration: 4000,
        }
      );
    },
  },
  
  // System notifications
  system: {
    maintenanceMode: () => {
      return notifications.warning(
        'System maintenance in progress',
        {
          title: 'Maintenance Notice',
          description: 'Some features may be temporarily unavailable',
          duration: 8000,
        }
      );
    },
    
    networkError: (retry?: () => void) => {
      return notifications.error(
        'Connection lost. Please check your internet.',
        {
          title: 'Network Error',
          action: retry ? {
            label: 'Retry',
            onClick: retry,
          } : undefined,
          duration: 6000,
        }
      );
    },
    
    sessionExpired: () => {
      return notifications.warning(
        'Your session has expired. Please login again.',
        {
          title: 'Session Expired',
          duration: 5000,
        }
      );
    },
  },
  
  // Data operations
  data: {
    saveSuccess: (item?: string) => {
      return notifications.success(
        `${item || 'Data'} saved successfully!`,
        {
          duration: 3000,
        }
      );
    },
    
    saveError: (item?: string) => {
      return notifications.error(
        `Failed to save ${item || 'data'}. Please try again.`,
        {
          title: 'Save Failed',
          duration: 4000,
        }
      );
    },
    
    deleteSuccess: (item?: string) => {
      return notifications.success(
        `${item || 'Item'} deleted successfully!`,
        {
          duration: 3000,
        }
      );
    },
    
    deleteError: (item?: string) => {
      return notifications.error(
        `Failed to delete ${item || 'item'}. Please try again.`,
        {
          title: 'Delete Failed',
          duration: 4000,
        }
      );
    },
  },
  
  // Utility functions
  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },
  
  dismissAll: () => {
    return toast.dismiss();
  },
  
  promise: <T,>(
    promise: Promise<T>,
    loading: string,
    success: string | ((data: T) => string),
    error: string | ((err: any) => string)
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Export default for backward compatibility
export default notifications;