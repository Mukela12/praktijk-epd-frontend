// Main intake form wizard component
// Comprehensive 7-section form with 66 fields matching backend structure

import React from 'react';
import { useIntakeForm } from '../hooks/useIntakeForm';
import { FormField } from './FormField';
import { ProgressIndicator } from './ProgressIndicator';
import { SectionNavigation } from './SectionNavigation';
import { SaveStatus } from './SaveStatus';

interface IntakeFormWizardProps {
  clientId?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export const IntakeFormWizard: React.FC<IntakeFormWizardProps> = ({
  clientId,
  onComplete,
  onCancel
}) => {
  const {
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
    progress,
    validation,
    updateFormData,
    saveDraft,
    submitForm,
    goToSection,
    goToNextSection,
    goToPreviousSection,
    shouldShowField,
    isLastSection,
    canSubmit,
    canProceedToNext,
    canGoBack,
    savingStatus
  } = useIntakeForm(clientId);

  const handleFieldChange = (fieldName: string, value: any) => {
    updateFormData(fieldName, value);
  };

  const handleSaveDraft = async () => {
    const success = await saveDraft();
    if (success) {
      // Show success feedback
      console.log('Draft saved successfully');
    }
  };

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      onComplete();
    }
  };

  const handleSectionComplete = () => {
    // Auto-save when moving between sections
    if (hasUnsavedChanges) {
      saveDraft();
    }
    
    if (isLastSection) {
      handleSubmit();
    } else {
      goToNextSection();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Intake Form...</h2>
          <p className="text-gray-500">Please wait while we prepare your form.</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-green-50 rounded-lg border border-green-200">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Intake Form Completed!</h2>
          <p className="text-green-700 mb-6">
            Thank you for completing your intake form. You can now book appointments with our therapists.
          </p>
          <button
            onClick={onComplete}
            className="btn-premium-primary"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!formStructure || !currentSectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Form Loading Error</h2>
          <p>Unable to load the intake form. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Client Intake Form</h1>
          <p className="text-gray-600">
            Please take your time to fill out this form completely. Your information helps us provide you with the best possible care.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          progress={progress}
          sections={formStructure.sections}
          currentSection={currentSection}
          onSectionClick={goToSection}
        />

        {/* Save Status */}
        <SaveStatus
          status={savingStatus}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentSectionData.title}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Section {currentSection + 1} of {formStructure.sections.length}
              </span>
            </div>
            {currentSectionData.description && (
              <p className="text-gray-600">{currentSectionData.description}</p>
            )}
          </div>

          {/* Section Fields */}
          <div className="space-y-6">
            {currentSectionData.fields
              .filter(field => shouldShowField(field))
              .map(field => (
                <FormField
                  key={field.name}
                  field={field}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={(value) => handleFieldChange(field.name, value)}
                  error={validation.errors[field.name]}
                />
              ))}
          </div>

          {/* Required Fields Notice */}
          <div className="mt-8 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are required. 
              Your progress is automatically saved every 30 seconds.
            </p>
          </div>
        </div>

        {/* Section Navigation */}
        <SectionNavigation
          currentSection={currentSection}
          totalSections={formStructure.sections.length}
          canGoBack={canGoBack}
          canProceedToNext={canProceedToNext}
          isLastSection={isLastSection}
          canSubmit={canSubmit}
          isSaving={isSaving}
          onPrevious={goToPreviousSection}
          onNext={goToNextSection}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSectionComplete}
          onCancel={onCancel}
        />

        {/* Form Progress Summary */}
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Form Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progress.percentageComplete}%</div>
              <div className="text-sm text-blue-800">Complete</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{progress.filledFields}</div>
              <div className="text-sm text-green-800">Fields Filled</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{progress.requiredFieldsFilled}</div>
              <div className="text-sm text-yellow-800">Required Fields</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{currentSection + 1}</div>
              <div className="text-sm text-purple-800">Current Section</div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Contact our support team or save your progress and continue later.
            Your information is securely stored and only accessible to your healthcare providers.
          </p>
        </div>
      </div>
    </div>
  );
};