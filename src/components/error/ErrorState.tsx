import React from 'react';
import { ExclamationCircleIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  error: string | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onDismiss,
  title = 'Something went wrong',
  description = 'An error occurred while processing your request.',
  showDetails = process.env.NODE_ENV === 'development',
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error || 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{description}</p>
            {showDetails && errorMessage && (
              <div className="mt-3">
                <details className="bg-red-100 rounded p-3">
                  <summary className="cursor-pointer font-medium text-red-800 hover:text-red-900">
                    Error Details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <p className="font-mono text-xs text-red-700">{errorMessage}</p>
                    {errorStack && (
                      <pre className="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
                        {errorStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;