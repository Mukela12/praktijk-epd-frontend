// Progress tracking component for CSV import
// Shows real-time progress updates during import process

import React from 'react';
import { CSVImportProgress } from '../types/csv-import.types';

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
      case 'processing': return '⏳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '📊';
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

  return (
    <div className="mb-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getStatusIcon(progress.status)}</div>
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
            className={`
              h-3 rounded-full transition-all duration-500 ease-out
              ${progress.status === 'processing' ? 'bg-blue-500' : 
                progress.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
            `}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {/* Animated shimmer effect for processing */}
            {progress.status === 'processing' && (
              <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{progress.totalRows} rows</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-700">{progress.totalRows}</div>
          <div className="text-sm text-gray-600 mt-1">📊 Total Rows</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{progress.processedRows}</div>
          <div className="text-sm text-blue-800 mt-1">⏳ Processed</div>
          {progress.status === 'processing' && (
            <div className="mt-1">
              <div className="w-full bg-blue-200 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{progress.successfulRows}</div>
          <div className="text-sm text-green-800 mt-1">✅ Successful</div>
          {progress.successfulRows > 0 && (
            <div className="text-xs text-green-600 mt-1">
              {progress.totalRows > 0 ? Math.round((progress.successfulRows / progress.totalRows) * 100) : 0}% success
            </div>
          )}
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{progress.failedRows}</div>
          <div className="text-sm text-red-800 mt-1">❌ Failed</div>
          {progress.failedRows > 0 && (
            <div className="text-xs text-red-600 mt-1">
              {progress.totalRows > 0 ? Math.round((progress.failedRows / progress.totalRows) * 100) : 0}% failed
            </div>
          )}
        </div>
      </div>

      {/* Error Details (if any) */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            ⚠️ Import Errors ({progress.errors.length})
          </h5>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {progress.errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm p-2 bg-red-100 rounded border-l-4 border-red-400">
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

      {/* Real-time Status Updates */}
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