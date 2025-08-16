import React, { useEffect, useState } from 'react';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Network Status Notification */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isOnline ? 'translate-y-0' : 'translate-y-0'
        }`}>
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
            isOnline 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {isOnline ? (
              <>
                <WifiIcon className="w-5 h-5" />
                <span className="font-medium">Back online</span>
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">No internet connection</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm font-medium text-yellow-800">
                  You're offline. Some features may be unavailable.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkErrorHandler;