// Save status component for intake form
// Shows current save state and auto-save status

import React from 'react';

interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'unsaved';
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  status,
  lastSaved,
  hasUnsavedChanges
}) => {
  const getStatusIcon = (): string => {
    switch (status) {
      case 'saving': return '⏳';
      case 'saved': return '✅';
      case 'unsaved': return '📝';
      default: return '💾';
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'saving': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'saved': return 'text-green-600 bg-green-50 border-green-200';
      case 'unsaved': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'saving': return 'Saving your progress...';
      case 'saved': return 'All changes saved';
      case 'unsaved': return 'You have unsaved changes';
      default: return 'Ready';
    }
  };

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 30) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Don't show if idle and no last saved time
  if (status === 'idle' && !lastSaved && !hasUnsavedChanges) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-300
        ${getStatusColor()}
      `}>
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <span className="font-medium">{getStatusText()}</span>
          {lastSaved && (
            <span className="ml-2 text-xs opacity-75">
              • Last saved {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>
        
        {/* Animated spinner for saving state */}
        {status === 'saving' && (
          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full ml-2" />
        )}
      </div>

      {/* Auto-save notice */}
      {(status === 'unsaved' || hasUnsavedChanges) && (
        <p className="text-xs text-gray-500 mt-2 ml-1">
          💡 Changes are automatically saved every 30 seconds
        </p>
      )}

      {/* Success feedback */}
      {status === 'saved' && (
        <p className="text-xs text-green-600 mt-2 ml-1">
          ✨ Your progress has been securely saved
        </p>
      )}
    </div>
  );
};