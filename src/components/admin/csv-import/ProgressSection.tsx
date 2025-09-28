import React from 'react';
import { CSVImportProgress } from './types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PremiumCard } from '@/components/layout/PremiumLayout';

interface ProgressSectionProps {
  progress: CSVImportProgress;
  percentage: number;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  progress,
  percentage
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <ClockIcon className="w-5 h-5" />;
      case 'completed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'failed': return <XCircleIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processing CSV Import...';
      case 'completed': return 'Import Completed Successfully!';
      case 'failed': return 'Import Failed';
      default: return 'Import Status Unknown';
    }
  };

  const statusColor = getStatusColor(progress.status);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${statusColor}-100 mb-4`}>
          <div className={`text-${statusColor}-600`}>
            {getStatusIcon(progress.status)}
          </div>
        </div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          {getStatusText(progress.status)}
        </h4>
        {progress.status === 'processing' && (
          <p className="text-gray-600">
            Processing row {progress.processedRows} of {progress.totalRows}...
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out bg-${statusColor}-500 relative overflow-hidden`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {progress.status === 'processing' && (
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{progress.totalRows} rows</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Rows</p>
              <p className="text-xl font-bold text-gray-900">{progress.totalRows}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Processed</p>
              <p className="text-xl font-bold text-gray-900">{progress.processedRows}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Successful</p>
              <p className="text-xl font-bold text-gray-900">{progress.successfulRows}</p>
              {progress.successfulRows > 0 && progress.totalRows > 0 && (
                <p className="text-xs text-green-600">
                  {Math.round((progress.successfulRows / progress.totalRows) * 100)}% success
                </p>
              )}
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">❌</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Failed</p>
              <p className="text-xl font-bold text-gray-900">{progress.failedRows}</p>
              {progress.failedRows > 0 && progress.totalRows > 0 && (
                <p className="text-xs text-red-600">
                  {Math.round((progress.failedRows / progress.totalRows) * 100)}% failed
                </p>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Error Details */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            Import Errors ({progress.errors.length})
          </h5>
          <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
            {progress.errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm p-2 bg-red-100 rounded-lg border-l-4 border-red-400">
                <div className="font-medium text-red-800">
                  Row {error.row}
                  {error.field && ` - Field: ${error.field}`}
                </div>
                <div className="text-red-700 mt-1">{error.error}</div>
              </div>
            ))}
            {progress.errors.length > 10 && (
              <div className="text-sm text-red-600 text-center py-2">
                ... and {progress.errors.length - 10} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Status */}
      {progress.status === 'processing' && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-700">
              Import in progress... Please keep this page open
            </span>
          </div>
        </div>
      )}
    </div>
  );
};