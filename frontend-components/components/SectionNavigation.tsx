// Navigation component for intake form sections
// Handles section navigation, saving, and form submission

import React from 'react';

interface SectionNavigationProps {
  currentSection: number;
  totalSections: number;
  canGoBack: boolean;
  canProceedToNext: boolean;
  isLastSection: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  currentSection,
  totalSections,
  canGoBack,
  canProceedToNext,
  isLastSection,
  canSubmit,
  isSaving,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-lg border p-6 sticky bottom-0 shadow-lg">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Left side - Back button */}
        <div className="flex gap-3">
          {canGoBack && (
            <button
              onClick={onPrevious}
              disabled={isSaving}
              className="btn-secondary flex items-center gap-2"
            >
              ← Previous Section
            </button>
          )}
        </div>

        {/* Middle - Section indicator (mobile) */}
        <div className="sm:hidden text-center">
          <p className="text-sm text-gray-600">
            Section {currentSection + 1} of {totalSections}
          </p>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex gap-3 items-center">
          {/* Cancel button (if provided) */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}

          {/* Save Draft button */}
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="btn-secondary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                💾 Save Draft
              </>
            )}
          </button>

          {/* Next/Submit button */}
          {isLastSection ? (
            <button
              onClick={onSubmit}
              disabled={!canSubmit || isSaving}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${canSubmit && !isSaving
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  ✅ Complete Intake Form
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceedToNext || isSaving}
              className={`
                btn-premium-primary flex items-center gap-2
                ${!canProceedToNext || isSaving ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  Next Section →
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator for desktop */}
      <div className="hidden sm:block mt-4 pt-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Section {currentSection + 1} of {totalSections}</span>
          <span>
            {isLastSection 
              ? 'Ready to submit your intake form'
              : `${totalSections - currentSection - 1} section${totalSections - currentSection - 1 !== 1 ? 's' : ''} remaining`
            }
          </span>
        </div>
        
        {/* Mini progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Helpful hints */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>💡</span>
            <span>Your progress is automatically saved every 30 seconds</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔒</span>
            <span>Your information is securely encrypted and private</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📱</span>
            <span>You can continue on any device</span>
          </div>
        </div>
      </div>

      {/* Submission requirements (last section) */}
      {isLastSection && (
        <div className="mt-4 pt-4 border-t">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Before submitting:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Please review your answers in all sections</li>
              <li>• Ensure all required fields (*) are completed</li>
              <li>• Your intake form will be securely submitted to your therapist</li>
              <li>• You'll be able to book appointments after submission</li>
            </ul>
          </div>
        </div>
      )}

      {/* Validation errors (if any) */}
      {!canSubmit && isLastSection && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-500">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Required fields missing</p>
              <p className="text-xs text-amber-700 mt-1">
                Please go back and fill in all required fields (marked with *) before submitting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};