// Results display component for completed CSV import
// Shows final import statistics and completion actions

import React from 'react';
import { CSVImportProgress, ImportType } from '../types/csv-import.types';

interface ResultsSectionProps {
  progress: CSVImportProgress;
  type: ImportType;
  onComplete: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  progress,
  type,
  onComplete
}) => {
  const successRate = progress.totalRows > 0 
    ? Math.round((progress.successfulRows / progress.totalRows) * 100)
    : 0;
  
  const hasErrors = progress.failedRows > 0;
  const isFullSuccess = progress.failedRows === 0 && progress.successfulRows > 0;

  return (
    <div className="text-center">
      {/* Success/Completion Icon */}
      <div className="text-6xl mb-4">
        {isFullSuccess ? '🎉' : hasErrors ? '⚠️' : '✅'}
      </div>

      {/* Main Result Message */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {isFullSuccess 
          ? `Import Completed Successfully!`
          : hasErrors 
            ? `Import Completed with ${progress.failedRows} Error${progress.failedRows !== 1 ? 's' : ''}`
            : 'Import Completed'
        }
      </h3>

      <p className="text-gray-600 mb-6">
        {isFullSuccess 
          ? `All ${progress.successfulRows} ${type} have been successfully imported and accounts created.`
          : hasErrors
            ? `${progress.successfulRows} ${type} imported successfully, ${progress.failedRows} failed.`
            : `Import process completed.`
        }
      </p>

      {/* Final Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{progress.totalRows}</div>
          <div className="text-sm text-blue-800 mt-1">📊 Total Records</div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">{progress.successfulRows}</div>
          <div className="text-sm text-green-800 mt-1">✅ Successfully Imported</div>
          <div className="text-xs text-green-600 mt-1">{successRate}% success rate</div>
        </div>
        
        <div className={`p-4 rounded-lg border ${hasErrors ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-3xl font-bold ${hasErrors ? 'text-red-600' : 'text-gray-600'}`}>
            {progress.failedRows}
          </div>
          <div className={`text-sm mt-1 ${hasErrors ? 'text-red-800' : 'text-gray-800'}`}>
            {hasErrors ? '❌' : '✅'} Failed Imports
          </div>
          {!hasErrors && (
            <div className="text-xs text-green-600 mt-1">Perfect import!</div>
          )}
        </div>
      </div>

      {/* Success Details */}
      {progress.successfulRows > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center justify-center gap-2">
            🎯 Import Summary
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <div>✅ {progress.successfulRows} {type} accounts created</div>
            <div>📧 Welcome emails sent to new users</div>
            <div>🔐 Secure passwords generated automatically</div>
            <div>👥 Users can now access their accounts</div>
          </div>
        </div>
      )}

      {/* Error Summary */}
      {hasErrors && progress.errors && progress.errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center justify-center gap-2">
            ⚠️ Import Errors Summary
          </h4>
          
          {/* Error Categories */}
          <div className="text-sm space-y-2 mb-4">
            {(() => {
              const errorCategories = progress.errors.reduce((acc, error) => {
                const category = error.error.includes('email') ? 'Email Issues' :
                                error.error.includes('required') ? 'Missing Required Fields' :
                                error.error.includes('BSN') ? 'BSN Validation' :
                                error.error.includes('date') ? 'Date Format' : 'Other';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return Object.entries(errorCategories).map(([category, count]) => (
                <div key={category} className="flex justify-between text-red-700">
                  <span>• {category}:</span>
                  <span className="font-medium">{count} error{count !== 1 ? 's' : ''}</span>
                </div>
              ));
            })()}
          </div>

          {/* Detailed Errors (first 5) */}
          <details className="text-left">
            <summary className="cursor-pointer text-red-800 hover:text-red-900 mb-2">
              View Error Details ({progress.errors.length} total)
            </summary>
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-red-100 rounded border">
              {progress.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-xs p-2 bg-white rounded">
                  <div className="font-medium text-red-800">
                    Row {error.row}
                    {error.field && ` - ${error.field}`}
                  </div>
                  <div className="text-red-700 mt-1">{error.error}</div>
                </div>
              ))}
              {progress.errors.length > 5 && (
                <div className="text-xs text-red-600 text-center py-2">
                  ... and {progress.errors.length - 5} more errors
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Recommendations */}
      {hasErrors && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Check the error details above to identify common issues</div>
            <div>• Verify email addresses are unique and properly formatted</div>
            <div>• Ensure required fields (Name, Email) are filled in</div>
            <div>• Use DD-MM-YYYY format for dates</div>
            <div>• You can re-import the failed rows after fixing the issues</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onComplete}
          className="btn-premium-primary px-6 py-3"
        >
          {isFullSuccess ? '🎉 View Imported ' : '✅ Continue to '}
          {type === 'clients' ? 'Clients' : 'Therapists'}
        </button>
        
        {hasErrors && (
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary px-6 py-3"
          >
            🔄 Import More Data
          </button>
        )}
      </div>

      {/* Success Celebration */}
      {isFullSuccess && (
        <div className="mt-6 text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full">
            <span className="text-green-600 text-sm font-medium">
              🚀 Ready for {type === 'clients' ? 'client' : 'therapist'} management!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};