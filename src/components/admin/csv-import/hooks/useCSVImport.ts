import { useState, useCallback } from 'react';
import { adminApi } from '@/services/endpoints';
import { 
  CSVImportProgress, 
  CSVImportResponse, 
  ImportStatus, 
  ImportType,
  CSVPreviewData,
  ColumnMapping,
  DUTCH_FIELD_MAPPINGS,
  DUTCH_FIELD_ALTERNATIVES
} from '../types';

export const useCSVImport = () => {
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState<CSVImportProgress | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);

  // Parse CSV file and extract preview data
  const parseCSVFile = useCallback((file: File): Promise<CSVPreviewData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1, Math.min(6, lines.length)) // Show first 5 rows
            .map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));

          resolve({
            headers,
            rows,
            totalRows: lines.length - 1
          });
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // Auto-detect column mappings based on Dutch field names
  const autoDetectMappings = useCallback((headers: string[]): ColumnMapping => {
    const mappings: ColumnMapping = {};
    
    headers.forEach(header => {
      const normalizedHeader = header.trim();
      
      // Direct mapping check
      if (DUTCH_FIELD_MAPPINGS[normalizedHeader]) {
        mappings[normalizedHeader] = DUTCH_FIELD_MAPPINGS[normalizedHeader];
        return;
      }

      // Alternative names check
      for (const [dbField, alternatives] of Object.entries(DUTCH_FIELD_ALTERNATIVES)) {
        if (alternatives.some(alt => 
          alt.toLowerCase() === normalizedHeader.toLowerCase() ||
          normalizedHeader.toLowerCase().includes(alt.toLowerCase())
        )) {
          mappings[normalizedHeader] = dbField;
          return;
        }
      }
    });

    return mappings;
  }, []);

  // Load and preview CSV file
  const loadCSVPreview = useCallback(async (file: File) => {
    try {
      setError(null);
      setImportStatus('uploading');
      
      const previewData = await parseCSVFile(file);
      setCsvPreview(previewData);
      
      // Auto-detect column mappings
      const autoMappings = autoDetectMappings(previewData.headers);
      setColumnMapping(autoMappings);
      
      setImportStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CSV preview');
      setImportStatus('error');
    }
  }, [parseCSVFile, autoDetectMappings]);

  // Upload CSV file and start import process
  const uploadCSV = useCallback(async (file: File, type: ImportType, customMapping?: ColumnMapping) => {
    setImportStatus('uploading');
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    // Include custom column mappings if provided
    if (customMapping && Object.keys(customMapping).length > 0) {
      formData.append('columnMapping', JSON.stringify(customMapping));
    }

    try {
      const result = await adminApi.importCSV(formData);
      
      if (result.success && result.data) {
        setImportStatus('processing');
        pollProgress(result.data.importId, type);
      } else {
        setError(result.message || 'Upload failed');
        setImportStatus('error');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setImportStatus('error');
    }
  }, []);

  // Poll progress updates from backend
  const pollProgress = useCallback(async (importId: string, type: ImportType) => {
    const poll = async () => {
      try {
        const result = await adminApi.getImportProgress(importId);
        
        if (result.success && result.data) {
          const progressData = result.data;
          setProgress(progressData);
          
          if (progressData.status === 'completed') {
            setImportStatus('completed');
          } else if (progressData.status === 'failed') {
            setImportStatus('error');
            setError('Import process failed');
          } else {
            // Continue polling every second
            setTimeout(poll, 1000);
          }
        } else {
          throw new Error('Failed to fetch progress');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch progress');
        setImportStatus('error');
      }
    };
    
    poll();
  }, []);

  // Update column mapping
  const updateColumnMapping = useCallback((csvColumn: string, dbField: string | null) => {
    setColumnMapping(prev => {
      if (dbField === null) {
        const { [csvColumn]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [csvColumn]: dbField };
    });
  }, []);

  // Reset import state
  const resetImport = useCallback(() => {
    setImportStatus('idle');
    setProgress(null);
    setCsvPreview(null);
    setColumnMapping({});
    setError(null);
  }, []);

  // Calculate progress percentage
  const progressPercentage = progress && progress.totalRows > 0 
    ? Math.round((progress.processedRows / progress.totalRows) * 100)
    : 0;

  return {
    // State
    importStatus,
    progress,
    csvPreview,
    columnMapping,
    error,
    progressPercentage,
    
    // Actions
    loadCSVPreview,
    uploadCSV,
    updateColumnMapping,
    resetImport,
    
    // Computed
    isProcessing: importStatus === 'processing' || importStatus === 'uploading',
    isCompleted: importStatus === 'completed',
    hasError: importStatus === 'error' || error !== null,
    canUpload: csvPreview !== null && Object.keys(columnMapping).length > 0
  };
};