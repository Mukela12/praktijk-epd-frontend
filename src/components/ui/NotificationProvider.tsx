import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  action?: NotificationAction;
  timestamp: Date;
  isVisible: boolean;
  isStacked?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isVisible'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const NotificationComponent: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
  onToggleStack?: (id: string) => void;
  stackCount?: number;
  isTopOfStack?: boolean;
}> = ({ notification, onRemove, onToggleStack, stackCount = 0, isTopOfStack = false }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const typeConfig = {
    success: {
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-600',
      icon: CheckCircleIcon,
      accentColor: 'bg-emerald-500'
    },
    error: {
      gradient: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
      icon: XCircleIcon,
      accentColor: 'bg-red-500'
    },
    warning: {
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
      icon: ExclamationTriangleIcon,
      accentColor: 'bg-amber-500'
    },
    info: {
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
      icon: InformationCircleIcon,
      accentColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[notification.type];
  const IconComponent = config.icon;

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  }, [notification.id, onRemove]);

  useEffect(() => {
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      // Progress bar animation
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, notification.duration! - elapsed);
        const progressPercent = (remaining / notification.duration!) * 100;
        setProgress(progressPercent);
        
        if (remaining > 0) {
          progressRef.current = setTimeout(updateProgress, 50);
        }
      };
      updateProgress();

      // Auto remove timeout
      timeoutRef.current = setTimeout(handleRemove, notification.duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [notification.duration, notification.persistent, handleRemove]);


  return (
    <div
      className={`
        relative w-full max-w-sm transition-all duration-300 ease-out transform
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
        ${notification.isStacked && !isTopOfStack ? 'scale-95 -translate-y-2' : ''}
      `}
      style={{
        zIndex: isTopOfStack ? 50 : 40 - stackCount,
        marginTop: notification.isStacked && !isTopOfStack ? '-8px' : '0'
      }}
    >
      {/* Main notification */}
      <div
        className={`
          relative overflow-hidden rounded-xl border backdrop-blur-xl
          ${config.bgColor} ${config.borderColor}
          shadow-lg hover:shadow-xl transition-all duration-200
          group cursor-pointer
        `}
        onClick={() => onToggleStack?.(notification.id)}
      >
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
        
        {/* Progress bar */}
        {!notification.persistent && notification.duration && (
          <div className="absolute top-1 left-0 right-0 h-0.5 bg-gray-200">
            <div 
              className={`h-full transition-all duration-50 linear ${config.accentColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 p-1 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {notification.title && (
                    <p className={`text-sm font-semibold ${config.textColor} mb-1`}>
                      {notification.title}
                    </p>
                  )}
                  <p className={`text-sm ${config.textColor} ${!notification.title ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  {notification.description && (
                    <p className={`text-xs ${config.textColor} opacity-75 mt-1`}>
                      {notification.description}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className={`
                    flex-shrink-0 ml-2 p-1 rounded-md transition-colors duration-200
                    hover:bg-white hover:bg-opacity-50 ${config.textColor} opacity-60 hover:opacity-100
                  `}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Action button */}
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.action!.onClick();
                      handleRemove();
                    }}
                    className={`
                      inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                      transition-all duration-200 transform hover:scale-105
                      ${notification.action.variant === 'secondary'
                        ? `bg-white bg-opacity-60 ${config.textColor} hover:bg-opacity-80`
                        : `bg-gradient-to-r ${config.gradient} text-white hover:shadow-md`
                      }
                    `}
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}

              {/* Footer with stack indicator */}
              {stackCount > 0 && (
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-200 border-opacity-30">
                  <div className="flex items-center space-x-1 text-xs opacity-60">
                    <span className="font-medium">+{stackCount}</span>
                    {notification.isStacked ? (
                      <ChevronUpIcon className="h-3 w-3" />
                    ) : (
                      <ChevronDownIcon className="h-3 w-3" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC<{
  notifications: Notification[];
  onRemove: (id: string) => void;
  onToggleStack: (id: string) => void;
}> = ({ notifications, onRemove, onToggleStack }) => {
  if (notifications.length === 0) return null;

  // Group notifications by type for stacking
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const key = `${notification.type}-${notification.title || notification.message}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const stackedGroups = Object.values(groupedNotifications).map(group => {
    const [primary, ...stacked] = group.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return {
      primary: { ...primary, isStacked: stacked.length > 0 },
      stacked: stacked.length,
      stackedItems: stacked
    };
  });

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {stackedGroups.map(({ primary, stacked, stackedItems }) => (
        <div key={primary.id} className="relative">
          <NotificationComponent
            notification={primary}
            onRemove={onRemove}
            onToggleStack={onToggleStack}
            stackCount={stacked}
            isTopOfStack={true}
          />
          {primary.isStacked && stackedItems.map((item, index) => (
            <div
              key={item.id}
              className="absolute top-0 left-0 w-full transition-all duration-200"
              style={{
                transform: `translateY(${(index + 1) * 4}px) scale(${1 - (index + 1) * 0.02})`,
                zIndex: 40 - index,
                opacity: 0.8 - (index * 0.2)
              }}
            >
              <NotificationComponent
                notification={{ ...item, isStacked: true }}
                onRemove={onRemove}
                isTopOfStack={false}
              />
            </div>
          ))}
        </div>
      ))}
    </div>,
    document.body
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isVisible'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      ...notificationData,
      id,
      timestamp: new Date(),
      isVisible: true,
      duration: notificationData.duration ?? 5000
    };

    setNotifications(prev => [notification, ...prev]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleStack = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, isStacked: !n.isStacked } : n
      )
    );
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
        onToggleStack={toggleStack}
      />
    </NotificationContext.Provider>
  );
};