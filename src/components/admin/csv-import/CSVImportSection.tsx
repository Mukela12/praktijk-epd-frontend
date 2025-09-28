import React, { useState, useRef } from 'react';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PremiumCard, PremiumButton } from '@/components/layout/PremiumLayout';
import { useCSVImport } from './hooks/useCSVImport';
import { ImportType } from './types';
import { FileUploadSection } from './FileUploadSection';
import { ColumnMappingSection } from './ColumnMappingSection';
import { ProgressSection } from './ProgressSection';
import { ResultsSection } from './ResultsSection';

interface CSVImportSectionProps {
  type: ImportType;
  onImportComplete: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

export const CSVImportSection: React.FC<CSVImportSectionProps> = ({ 
  type, 
  onImportComplete,
  onCancel,
  isOpen = false
}) => {
  const {
    importStatus,
    progress,
    csvPreview,
    columnMapping,
    error,
    progressPercentage,
    loadCSVPreview,
    uploadCSV,
    updateColumnMapping,
    resetImport,
    isProcessing,
    isCompleted,
    hasError,
    canUpload
  } = useCSVImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImportSection, setShowImportSection] = useState(isOpen);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await loadCSVPreview(file);
  };

  const handleStartImport = async () => {
    if (!selectedFile || !canUpload) return;
    
    try {
      await uploadCSV(selectedFile, type, columnMapping, skipDuplicates);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleComplete = () => {
    onImportComplete();
    resetImport();
    setSelectedFile(null);
    setShowImportSection(false);
  };

  const handleCancel = () => {
    resetImport();
    setSelectedFile(null);
    setShowImportSection(false);
    if (onCancel) onCancel();
  };

  // If import section is not shown, display the trigger button
  if (!showImportSection) {
    return (
      <PremiumButton
        onClick={() => setShowImportSection(true)}
        variant="secondary"
        icon={DocumentArrowUpIcon}
      >
        Import from CSV
      </PremiumButton>
    );
  }

  return (
    <div className="space-y-6">
      <PremiumCard>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DocumentArrowUpIcon className="w-6 h-6 text-gray-600" />
              Import {type === 'clients' ? 'Clients' : 'Therapists'} from CSV
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload a CSV file to bulk import {type}. Dutch column names are automatically detected.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {hasError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-800">Import Error</h4>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={resetImport}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {isCompleted && progress && (
            <ResultsSection 
              progress={progress}
              type={type}
              onComplete={handleComplete}
            />
          )}

          {/* Progress Display */}
          {isProcessing && progress && (
            <ProgressSection 
              progress={progress}
              percentage={progressPercentage}
            />
          )}

          {/* Import Configuration (when not processing) */}
          {!isProcessing && !isCompleted && (
            <>
              {/* Step 1: File Upload */}
              <FileUploadSection
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                fileInputRef={fileInputRef}
                isLoading={importStatus === 'uploading'}
              />

              {/* Step 2: Column Mapping (shown after file is loaded) */}
              {csvPreview && (
                <ColumnMappingSection
                  csvPreview={csvPreview}
                  columnMapping={columnMapping}
                  onMappingChange={updateColumnMapping}
                  type={type}
                />
              )}

              {/* Step 3: Import Options & Actions */}
              {csvPreview && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {/* Import Options */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Import Options</h4>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Skip duplicate emails (recommended)</span>
                      <span className="text-gray-500">
                        - Skip {type} with existing email addresses instead of failing the import
                      </span>
                    </label>
                  </div>

                  {/* Summary & Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Ready to import {csvPreview.totalRows} {type} with {Object.keys(columnMapping).length} mapped fields
                    </div>
                    
                    <div className="flex gap-3">
                      <PremiumButton
                        onClick={handleCancel}
                        variant="secondary"
                        disabled={isProcessing}
                      >
                        Cancel
                      </PremiumButton>
                      <PremiumButton
                        onClick={handleStartImport}
                        disabled={!canUpload || isProcessing}
                        variant="primary"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Starting Import...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🚀</span>
                            Start Import
                          </>
                        )}
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};