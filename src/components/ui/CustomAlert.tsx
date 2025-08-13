import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-800',
    actionColor: 'text-green-700 hover:text-green-900',
    closeColor: 'text-green-600 hover:text-green-800'
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-800',
    actionColor: 'text-red-700 hover:text-red-900',
    closeColor: 'text-red-600 hover:text-red-800'
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-800',
    actionColor: 'text-amber-700 hover:text-amber-900',
    closeColor: 'text-amber-600 hover:text-amber-800'
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-800',
    actionColor: 'text-blue-700 hover:text-blue-900',
    closeColor: 'text-blue-600 hover:text-blue-800'
  }
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const styles = alertStyles[type];
  const Icon = styles.icon;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`rounded-xl shadow-lg border ${styles.bg} ${styles.border} p-4 mb-4`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${styles.iconColor}`} aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${styles.messageColor}`}>{message}</p>
              {action && (
                <div className="mt-3">
                  <button
                    onClick={action.onClick}
                    className={`text-sm font-medium ${styles.actionColor} transition-colors`}
                  >
                    {action.label} →
                  </button>
                </div>
              )}
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={handleClose}
                className={`inline-flex rounded-md ${styles.closeColor} hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Alert Container Component
interface AlertContainerProps {
  children: React.ReactNode;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

// Alert Hook
interface AlertOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let alertId = 0;
const alerts = new Map<number, (alert: any) => void>();

export const useAlert = () => {
  const [activeAlerts, setActiveAlerts] = useState<Array<{
    id: number;
    type: AlertType;
    title?: string;
    message: string;
    duration?: number;
    action?: AlertOptions['action'];
  }>>([]);

  useEffect(() => {
    const updateAlerts = (alert: any) => {
      setActiveAlerts(prev => [...prev, alert]);
    };

    const id = alertId++;
    alerts.set(id, updateAlerts);

    return () => {
      alerts.delete(id);
    };
  }, []);

  const showAlert = (type: AlertType, message: string, options?: AlertOptions) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      ...options
    };

    alerts.forEach(updateFn => updateFn(alert));

    if (options?.duration !== 0) {
      setTimeout(() => {
        removeAlert(alert.id);
      }, options?.duration || 5000);
    }
  };

  const removeAlert = (id: number) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const success = (message: string, options?: AlertOptions) => 
    showAlert('success', message, options);
    
  const error = (message: string, options?: AlertOptions) => 
    showAlert('error', message, options);
    
  const warning = (message: string, options?: AlertOptions) => 
    showAlert('warning', message, options);
    
  const info = (message: string, options?: AlertOptions) => 
    showAlert('info', message, options);

  return {
    alerts: activeAlerts,
    success,
    error,
    warning,
    info,
    removeAlert
  };
};

// Global Alert Provider
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { alerts, removeAlert } = useAlert();

  return (
    <>
      {children}
      <AlertContainer>
        {alerts.map(alert => (
          <CustomAlert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            duration={alert.duration}
            action={alert.action}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </AlertContainer>
    </>
  );
};