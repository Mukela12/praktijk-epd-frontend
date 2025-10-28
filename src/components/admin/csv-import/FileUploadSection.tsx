import React, { RefObject } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PremiumCard } from '@/components/layout/PremiumLayout';
import notifications from '@/utils/notifications';

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  isLoading?: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  onFileSelect,
  fileInputRef,
  isLoading = false
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    } else if (file) {
      notifications.error('Please select a CSV file', {
        title: 'Invalid File Type',
        description: 'Only CSV files are supported'
      });
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    } else if (file) {
      notifications.error('Please select a CSV file', {
        title: 'Invalid File Type',
        description: 'Only CSV files are supported'
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (selectedFile) {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Selected File</h4>
        <PremiumCard className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-10 h-10 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {formatFileSize(selectedFile.size)} • CSV File
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-green-600 hover:text-green-800 underline"
              disabled={isLoading}
            >
              Change File
            </button>
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Select CSV File</h4>
      
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileInput}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          upload-area premium-border rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragOver 
            ? 'border-primary-light bg-primary-light/5 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {isLoading ? (
              <div className="animate-spin w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full" />
            ) : (
              <CloudArrowUpIcon className={`w-16 h-16 ${isDragOver ? 'text-primary' : 'text-gray-400'} transition-colors`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isLoading ? 'Processing file...' :
               isDragOver ? 'Drop your CSV file here' :
               'Click to select or drag & drop your CSV file'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports Dutch column names • Max file size: 10MB
            </p>
          </div>

          {!isLoading && (
            <button
              type="button"
              className="btn-premium-secondary"
              disabled={isLoading}
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <h5 className="font-medium text-blue-800 mb-2">CSV File Requirements:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• First row must contain column headers</li>
          <li>• Dutch column names are automatically detected</li>
          <li>• Required fields: First Name, Last Name, Email</li>
          <li>• Email addresses must be unique</li>
          <li>• Dates should be in DD-MM-YYYY format</li>
        </ul>
      </div>
    </div>
  );
};