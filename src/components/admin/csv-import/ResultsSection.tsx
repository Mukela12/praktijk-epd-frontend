import React from 'react';
import { CSVImportProgress, ImportType } from './types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { PremiumCard, PremiumButton } from '@/components/layout/PremiumLayout';

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
    <div className="space-y-6">
      {/* Success/Completion Icon */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          isFullSuccess ? 'bg-green-100' : hasErrors ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          {isFullSuccess ? (
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          ) : hasErrors ? (
            <InformationCircleIcon className="w-10 h-10 text-amber-600" />
          ) : (
            <CheckCircleIcon className="w-10 h-10 text-blue-600" />
          )}
        </div>

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
      </div>

      {/* Final Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{progress.totalRows}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Successfully Imported</p>
              <p className="text-xl font-bold text-gray-900">{progress.successfulRows}</p>
              <p className="text-xs text-green-600">{successRate}% success rate</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              hasErrors ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <span className="text-lg">{hasErrors ? '❌' : '✅'}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Failed Imports</p>
              <p className="text-xl font-bold text-gray-900">{progress.failedRows}</p>
              {!hasErrors && (
                <p className="text-xs text-gray-600">Perfect import!</p>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Success Details */}
      {progress.successfulRows > 0 && (
        <PremiumCard className="p-4 bg-green-50 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Import Summary
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <div>✅ {progress.successfulRows} {type} accounts created</div>
            <div>📧 Welcome emails sent to new users</div>
            <div>🔐 Secure passwords generated automatically</div>
            <div>👥 Users can now access their accounts</div>
          </div>
        </PremiumCard>
      )}

      {/* Error Summary */}
      {hasErrors && progress.errors && progress.errors.length > 0 && (
        <PremiumCard className="p-4 bg-red-50 border border-red-200">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            Import Errors Summary
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

          {/* Detailed Errors */}
          <details className="text-left">
            <summary className="cursor-pointer text-red-800 hover:text-red-900 mb-2">
              View Error Details ({progress.errors.length} total)
            </summary>
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-red-100 rounded-lg custom-scrollbar">
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
        </PremiumCard>
      )}

      {/* Recommendations */}
      {hasErrors && (
        <PremiumCard className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Check the error details above to identify common issues</div>
            <div>• Verify email addresses are unique and properly formatted</div>
            <div>• Ensure required fields (Name, Email) are filled in</div>
            <div>• Use DD-MM-YYYY format for dates</div>
            <div>• You can re-import the failed rows after fixing the issues</div>
          </div>
        </PremiumCard>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <PremiumButton
          onClick={onComplete}
          variant="primary"
        >
          {isFullSuccess ? '🎉 View Imported ' : '✅ Continue to '}
          {type === 'clients' ? 'Clients' : 'Therapists'}
        </PremiumButton>
        
        {hasErrors && (
          <PremiumButton
            onClick={() => window.location.reload()}
            variant="secondary"
          >
            🔄 Import More Data
          </PremiumButton>
        )}
      </div>
    </div>
  );
};