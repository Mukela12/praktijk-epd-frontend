// Custom React hook for intake form functionality
// Integrates with comprehensive backend API for 66-field intake form

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IntakeFormStructure,
  IntakeFormData,
  IntakeFormValidation,
  IntakeFormProgress,
  IntakeFormResponse,
  IntakeStatusResponse,
  DEFAULT_INTAKE_FORM_STRUCTURE
} from '../types/intake-form.types';

const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useIntakeForm = (clientId?: string) => {
  const [formStructure, setFormStructure] = useState<IntakeFormStructure | null>(null);
  const [formData, setFormData] = useState<IntakeFormData>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const hasLoadedRef = useRef(false);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('authToken') || '';

  // Load form structure from backend
  const loadFormStructure = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/intake/form`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load form structure');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setFormStructure(result.data);
      } else {
        // Fallback to default structure
        setFormStructure(DEFAULT_INTAKE_FORM_STRUCTURE);
      }
    } catch (error) {
      console.warn('Using default form structure due to API error:', error);
      setFormStructure(DEFAULT_INTAKE_FORM_STRUCTURE);
    }
  }, []);

  // Load existing form data
  const loadExistingData = useCallback(async () => {
    if (!clientId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/intake/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result: IntakeFormResponse = await response.json();
        
        if (result.success && result.data) {
          setFormData(result.data);
          setIsCompleted(result.completed || false);
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Failed to load existing form data:', error);
    }
  }, [clientId]);

  // Save form data (draft or final)
  const saveFormData = useCallback(async (data: IntakeFormData, isComplete: boolean = false): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/intake/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            ...data,
            lastSaved: new Date().toISOString(),
            isComplete
          },
          isComplete
        })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result: IntakeFormResponse = await response.json();
      
      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        if (isComplete) {
          setIsCompleted(true);
        }
        return true;
      } else {
        setError(result.message || 'Save failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges && Object.keys(formData).length > 0) {
        saveFormData(formData, false); // Save as draft
      }
    }, AUTO_SAVE_INTERVAL);
  }, [hasUnsavedChanges, formData, saveFormData]);

  // Update form data
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      setHasUnsavedChanges(true);
      return newData;
    });
  }, []);

  // Update multiple fields at once
  const updateMultipleFields = useCallback((updates: Partial<IntakeFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      setHasUnsavedChanges(true);
      return newData;
    });
  }, []);

  // Manual save
  const saveDraft = useCallback(async (): Promise<boolean> => {
    return await saveFormData(formData, false);
  }, [formData, saveFormData]);

  // Submit form
  const submitForm = useCallback(async (): Promise<boolean> => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      setError(`Please fill in required fields: ${validation.missingRequired.join(', ')}`);
      return false;
    }

    return await saveFormData(formData, true);
  }, [formData, saveFormData]);

  // Form validation
  const validateForm = useCallback((): IntakeFormValidation => {
    if (!formStructure) {
      return { isValid: false, errors: {}, missingRequired: [] };
    }

    const errors: Record<string, string> = {};
    const missingRequired: string[] = [];

    formStructure.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          const value = formData[field.name as keyof IntakeFormData];
          
          if (value === undefined || value === null || value === '') {
            missingRequired.push(field.label);
            errors[field.name] = `${field.label} is required`;
          }
        }
      });
    });

    return {
      isValid: missingRequired.length === 0,
      errors,
      missingRequired
    };
  }, [formStructure, formData]);

  // Calculate progress
  const calculateProgress = useCallback((): IntakeFormProgress => {
    if (!formStructure) {
      return {
        currentSection,
        totalSections: 0,
        filledFields: 0,
        totalFields: 0,
        requiredFieldsFilled: 0,
        totalRequiredFields: 0,
        percentageComplete: 0,
        canProceed: false
      };
    }

    let filledFields = 0;
    let requiredFieldsFilled = 0;
    let totalRequiredFields = 0;

    formStructure.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.name as keyof IntakeFormData];
        
        if (field.required) {
          totalRequiredFields++;
          if (value !== undefined && value !== null && value !== '') {
            requiredFieldsFilled++;
          }
        }

        if (value !== undefined && value !== null && value !== '') {
          filledFields++;
        }
      });
    });

    const percentageComplete = Math.round(
      (filledFields / formStructure.totalFields) * 100
    );

    return {
      currentSection,
      totalSections: formStructure.sections.length,
      filledFields,
      totalFields: formStructure.totalFields,
      requiredFieldsFilled,
      totalRequiredFields,
      percentageComplete,
      canProceed: requiredFieldsFilled === totalRequiredFields
    };
  }, [formStructure, formData, currentSection]);

  // Navigation
  const goToSection = useCallback((sectionIndex: number) => {
    if (formStructure && sectionIndex >= 0 && sectionIndex < formStructure.sections.length) {
      setCurrentSection(sectionIndex);
    }
  }, [formStructure]);

  const goToNextSection = useCallback(() => {
    if (formStructure && currentSection < formStructure.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  }, [formStructure, currentSection]);

  const goToPreviousSection = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  // Check if field should be shown (conditional logic)
  const shouldShowField = useCallback((field: any): boolean => {
    if (!field.conditional) return true;

    const dependencyValue = formData[field.conditional.dependsOn as keyof IntakeFormData];
    
    if (typeof field.conditional.value === 'function') {
      return field.conditional.value(dependencyValue);
    }
    
    return dependencyValue === field.conditional.value;
  }, [formData]);

  // Initialize form
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setIsLoading(true);
      
      Promise.all([
        loadFormStructure(),
        loadExistingData()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [loadFormStructure, loadExistingData]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      scheduleAutoSave();
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, scheduleAutoSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const progress = calculateProgress();
  const validation = validateForm();
  const currentSectionData = formStructure?.sections[currentSection];

  return {
    // State
    formStructure,
    formData,
    currentSection,
    currentSectionData,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error,
    isCompleted,
    
    // Progress & Validation
    progress,
    validation,
    
    // Actions
    updateFormData,
    updateMultipleFields,
    saveDraft,
    submitForm,
    goToSection,
    goToNextSection,
    goToPreviousSection,
    shouldShowField,
    
    // Computed
    isLastSection: currentSection === (formStructure?.sections.length ?? 0) - 1,
    canSubmit: validation.isValid && !isSaving,
    canProceedToNext: currentSection < (formStructure?.sections.length ?? 0) - 1,
    canGoBack: currentSection > 0,
    savingStatus: isSaving ? 'saving' : lastSaved ? 'saved' : hasUnsavedChanges ? 'unsaved' : 'idle'
  };
};