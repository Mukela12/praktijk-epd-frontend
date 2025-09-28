// File upload component for CSV import
// Supports drag-and-drop and file picker functionality

import React, { useRef, RefObject } from 'react';

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
      alert('Please select a CSV file');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    } else if (file) {
      alert('Please select a CSV file');
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
        <h4 className="text-lg font-semibold mb-3">📄 Selected File</h4>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3">📁 Select CSV File</h4>
      
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
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="space-y-4">
          <div className="text-4xl">
            {isLoading ? (
              <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto" />
            ) : isDragOver ? (
              '📥'
            ) : (
              '📁'
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
              className="btn-premium-primary"
              disabled={isLoading}
            >
              📂 Browse Files
            </button>
          )}
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">📋 CSV File Requirements:</h5>
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