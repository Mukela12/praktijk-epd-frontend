import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportNotificationProps {
  show: boolean;
  type: 'generating' | 'success' | 'error' | 'preview';
  title: string;
  message?: string;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ReportNotification: React.FC<ReportNotificationProps> = ({
  show,
  type,
  title,
  message,
  onClose,
  action
}) => {
  useEffect(() => {
    if (show && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'generating':
        return <ClockIcon className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XMarkIcon className="w-6 h-6 text-red-500" />;
      case 'preview':
        return <DocumentArrowDownIcon className="w-6 h-6 text-purple-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'generating':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'preview':
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className={`rounded-lg shadow-lg border p-4 ${getBgColor()}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                {message && (
                  <p className="mt-1 text-sm text-gray-600">{message}</p>
                )}
                {action && (
                  <button
                    onClick={action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {action.label}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            {type === 'generating' && (
              <div className="mt-3">
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportNotification;