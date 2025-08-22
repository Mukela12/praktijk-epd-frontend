import React from 'react';
import { 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon,
  WifiIcon,
  ServerIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface ErrorStateProps {
  error?: Error | string | null;
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info' | 'network' | 'server' | 'permission';
  onRetry?: () => void;
  showDetails?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title,
  message,
  type = 'error',
  onRetry,
  showDetails = process.env.NODE_ENV === 'development',
  actions,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />;
      case 'info':
        return <ExclamationCircleIcon className="h-12 w-12 text-blue-500" />;
      case 'network':
        return <WifiIcon className="h-12 w-12 text-gray-500" />;
      case 'server':
        return <ServerIcon className="h-12 w-12 text-red-500" />;
      case 'permission':
        return <LockClosedIcon className="h-12 w-12 text-red-500" />;
      default:
        return <XCircleIcon className="h-12 w-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'network':
        return 'Network Error';
      case 'server':
        return 'Server Error';
      case 'permission':
        return 'Permission Denied';
      default:
        return 'Something went wrong';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'server':
        return 'Our servers are experiencing issues. Please try again later.';
      case 'permission':
        return 'You do not have permission to access this resource.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getTitle()}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {getMessage()}
        </p>

        {showDetails && errorMessage && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-xs font-mono text-red-700 break-words">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Try Again
            </button>
          )}
          
          {actions}
        </div>
      </div>
    </div>
  );
};

// Specialized error components
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    type="network"
    title="Connection Problem"
    message="We're having trouble connecting to our servers. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const PermissionError: React.FC<{ message?: string }> = ({ message }) => (
  <ErrorState
    type="permission"
    title="Access Denied"
    message={message || "You don't have permission to view this content. Please contact your administrator if you believe this is an error."}
  />
);

export const EmptyState: React.FC<{
  icon?: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, message, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="text-center max-w-md">
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {message && (
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  </div>
);

export default ErrorState;