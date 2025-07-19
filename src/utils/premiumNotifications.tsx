import { useNotifications, NotificationAction } from '@/components/ui/NotificationProvider';

export interface PremiumNotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  action?: NotificationAction;
}

// Hook to access premium notifications
export const usePremiumNotifications = () => {
  const { addNotification, removeNotification, clearAll } = useNotifications();

  const success = (message: string, options?: PremiumNotificationOptions) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  };

  const error = (message: string, options?: PremiumNotificationOptions) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  };

  const warning = (message: string, options?: PremiumNotificationOptions) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  };

  const info = (message: string, options?: PremiumNotificationOptions) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  };

  // Authentication specific notifications
  const auth = {
    loginSuccess: (userName?: string) => {
      return success(
        userName ? `Welcome back, ${userName}!` : 'Login successful!',
        {
          title: 'Authentication Success',
          description: 'You have been successfully authenticated',
          duration: 4000,
        }
      );
    },

    loginFailed: (reason?: string) => {
      return error(
        reason || 'Invalid credentials. Please try again.',
        {
          title: 'Login Failed',
          description: 'Check your email and password and try again',
          duration: 6000,
        }
      );
    },

    registrationSuccess: () => {
      return success(
        'Account created successfully!',
        {
          title: 'Registration Complete',
          description: 'Please check your email to verify your account',
          duration: 8000,
        }
      );
    },

    emailVerificationRequired: () => {
      return warning(
        'Please verify your email address to continue',
        {
          title: 'Email Verification Required',
          description: 'Check your inbox for a verification link',
          duration: 8000,
          action: {
            label: 'Resend Email',
            onClick: () => {
              // This can be connected to resend email functionality
              console.log('Resending verification email...');
            }
          }
        }
      );
    },

    twoFactorRequired: () => {
      return info(
        'Two-factor authentication is required for your role',
        {
          title: '2FA Setup Required',
          description: 'Enhanced security is required for staff accounts',
          duration: 6000,
        }
      );
    },

    twoFactorSuccess: () => {
      return success(
        'Two-factor authentication enabled successfully!',
        {
          title: 'Security Enhanced',
          description: 'Your account is now protected with 2FA',
          duration: 5000,
        }
      );
    },

    sessionExpired: () => {
      return warning(
        'Your session has expired for security reasons',
        {
          title: 'Session Expired',
          description: 'Please log in again to continue',
          duration: 6000,
        }
      );
    },
  };

  // System notifications
  const system = {
    maintenanceMode: () => {
      return warning(
        'System maintenance is currently in progress',
        {
          title: 'Maintenance Notice',
          description: 'Some features may be temporarily unavailable',
          duration: 10000,
          persistent: true,
        }
      );
    },

    networkError: (retry?: () => void) => {
      return error(
        'Connection lost. Please check your internet connection.',
        {
          title: 'Network Error',
          description: 'Unable to connect to the server',
          action: retry ? {
            label: 'Retry',
            onClick: retry,
            variant: 'secondary'
          } : undefined,
          duration: 8000,
        }
      );
    },

    updateAvailable: (onUpdate?: () => void) => {
      return info(
        'A new version of the application is available',
        {
          title: 'Update Available',
          description: 'Click to refresh and get the latest features',
          action: onUpdate ? {
            label: 'Update Now',
            onClick: onUpdate,
          } : undefined,
          persistent: true,
        }
      );
    },

    backupCompleted: () => {
      return success(
        'System backup completed successfully',
        {
          title: 'Backup Complete',
          description: 'Your data has been safely backed up',
          duration: 4000,
        }
      );
    },
  };

  // Data operations
  const data = {
    saveSuccess: (item?: string) => {
      return success(
        `${item || 'Data'} saved successfully!`,
        {
          title: 'Save Complete',
          duration: 3000,
        }
      );
    },

    saveError: (item?: string, retry?: () => void) => {
      return error(
        `Failed to save ${item || 'data'}. Please try again.`,
        {
          title: 'Save Failed',
          description: 'There was an error saving your changes',
          action: retry ? {
            label: 'Retry',
            onClick: retry,
            variant: 'secondary'
          } : undefined,
          duration: 6000,
        }
      );
    },

    deleteSuccess: (item?: string) => {
      return success(
        `${item || 'Item'} deleted successfully!`,
        {
          title: 'Delete Complete',
          duration: 3000,
        }
      );
    },

    deleteError: (item?: string) => {
      return error(
        `Failed to delete ${item || 'item'}. Please try again.`,
        {
          title: 'Delete Failed',
          description: 'The operation could not be completed',
          duration: 5000,
        }
      );
    },

    uploadProgress: (progress: number) => {
      return info(
        `Upload in progress: ${progress}%`,
        {
          title: 'Uploading...',
          description: 'Please wait while your file is being uploaded',
          persistent: progress < 100,
          duration: progress === 100 ? 2000 : undefined,
        }
      );
    },

    importComplete: (count: number) => {
      return success(
        `Successfully imported ${count} ${count === 1 ? 'record' : 'records'}`,
        {
          title: 'Import Complete',
          description: 'All data has been processed and saved',
          duration: 5000,
        }
      );
    },
  };

  // Appointment notifications
  const appointments = {
    scheduled: (time: string, clientName?: string) => {
      return success(
        `Appointment scheduled for ${time}`,
        {
          title: 'Appointment Confirmed',
          description: clientName ? `Meeting with ${clientName}` : undefined,
          duration: 5000,
        }
      );
    },

    cancelled: (reason?: string) => {
      return warning(
        'Appointment has been cancelled',
        {
          title: 'Appointment Cancelled',
          description: reason || 'The appointment has been removed from your schedule',
          duration: 5000,
        }
      );
    },

    reminder: (time: string, clientName?: string) => {
      return info(
        `Upcoming appointment in 15 minutes`,
        {
          title: 'Appointment Reminder',
          description: `${time}${clientName ? ` with ${clientName}` : ''}`,
          duration: 8000,
          persistent: true,
        }
      );
    },
  };

  return {
    success,
    error,
    warning,
    info,
    auth,
    system,
    data,
    appointments,
    remove: removeNotification,
    clearAll,
  };
};

// Standalone notifications class for use without hooks
export class PremiumNotifications {
  private static addNotification: (notification: any) => string;
  private static removeNotification: (id: string) => void;
  private static clearAll: () => void;

  static init(notificationMethods: {
    addNotification: (notification: any) => string;
    removeNotification: (id: string) => void;
    clearAll: () => void;
  }) {
    this.addNotification = notificationMethods.addNotification;
    this.removeNotification = notificationMethods.removeNotification;
    this.clearAll = notificationMethods.clearAll;
  }

  static success(message: string, options?: PremiumNotificationOptions) {
    return this.addNotification({
      type: 'success',
      message,
      ...options
    });
  }

  static error(message: string, options?: PremiumNotificationOptions) {
    return this.addNotification({
      type: 'error',
      message,
      ...options
    });
  }

  static warning(message: string, options?: PremiumNotificationOptions) {
    return this.addNotification({
      type: 'warning',
      message,
      ...options
    });
  }

  static info(message: string, options?: PremiumNotificationOptions) {
    return this.addNotification({
      type: 'info',
      message,
      ...options
    });
  }

  static auth = {
    loginSuccess: (userName?: string) => {
      return PremiumNotifications.success(
        userName ? `Welcome back, ${userName}!` : 'Login successful!',
        {
          title: 'Authentication Success',
          description: 'You have been successfully authenticated',
          duration: 4000,
        }
      );
    },

    loginFailed: (reason?: string) => {
      return PremiumNotifications.error(
        reason || 'Invalid credentials. Please try again.',
        {
          title: 'Login Failed',
          description: 'Check your email and password and try again',
          duration: 6000,
        }
      );
    },

    twoFactorSuccess: () => {
      return PremiumNotifications.success(
        'Two-factor authentication enabled successfully!',
        {
          title: 'Security Enhanced',
          description: 'Your account is now protected with 2FA',
          duration: 5000,
        }
      );
    },

    twoFactorRequired: () => {
      return PremiumNotifications.info(
        'Two-factor authentication is required for your role',
        {
          title: '2FA Setup Required',
          description: 'Enhanced security is required for staff accounts',
          duration: 6000,
        }
      );
    },
  };

  static remove = (id: string) => this.removeNotification(id);
  static clear = () => this.clearAll();
}

export default PremiumNotifications;