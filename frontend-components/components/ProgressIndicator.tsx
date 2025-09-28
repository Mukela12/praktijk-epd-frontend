// Progress indicator component for intake form wizard
// Shows section progress and allows navigation between completed sections

import React from 'react';
import { IntakeFormSection, IntakeFormProgress } from '../types/intake-form.types';

interface ProgressIndicatorProps {
  progress: IntakeFormProgress;
  sections: IntakeFormSection[];
  currentSection: number;
  onSectionClick: (sectionIndex: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  sections,
  currentSection,
  onSectionClick
}) => {
  const getSectionIcon = (sectionId: string): string => {
    const iconMap: Record<string, string> = {
      'personal_info': '👤',
      'referral_info': '🔗',
      'health_history': '🏥',
      'therapy_history': '📚',
      'current_situation': '🎯',
      'therapy_goals': '🌟',
      'additional_info': '📋'
    };
    return iconMap[sectionId] || '📄';
  };

  const getSectionStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentSection) return 'completed';
    if (index === currentSection) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white border-green-500';
      case 'current': return 'bg-blue-500 text-white border-blue-500';
      case 'pending': return 'bg-gray-200 text-gray-600 border-gray-300';
      default: return 'bg-gray-200 text-gray-600 border-gray-300';
    }
  };

  const canNavigateToSection = (index: number): boolean => {
    // Can navigate to completed sections and current section
    return index <= currentSection;
  };

  return (
    <div className="mb-8">
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Form Progress</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {progress.percentageComplete}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percentageComplete}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {progress.filledFields} of {progress.totalFields} fields completed
          </span>
          <span>
            {progress.requiredFieldsFilled} of {progress.totalRequiredFields} required fields
          </span>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-sm font-medium text-gray-600 mb-4">Sections</h4>
        
        {/* Desktop view - horizontal layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => {
              const status = getSectionStatus(index);
              const isClickable = canNavigateToSection(index);
              
              return (
                <div key={section.id} className="flex items-center flex-1">
                  {/* Section Circle */}
                  <button
                    onClick={() => isClickable && onSectionClick(index)}
                    disabled={!isClickable}
                    className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200
                      ${getStatusColor(status)}
                      ${isClickable 
                        ? 'cursor-pointer hover:scale-105 hover:shadow-md' 
                        : 'cursor-not-allowed opacity-50'
                      }
                    `}
                    title={isClickable ? `Go to ${section.title}` : `Complete previous sections first`}
                  >
                    {status === 'completed' ? '✓' : getSectionIcon(section.id)}
                  </button>
                  
                  {/* Section Label */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className={`
                      text-xs font-medium truncate
                      ${status === 'current' ? 'text-blue-600' : 
                        status === 'completed' ? 'text-green-600' : 'text-gray-500'}
                    `}>
                      {section.title}
                    </p>
                    {status === 'current' && (
                      <p className="text-xs text-gray-500">Current section</p>
                    )}
                  </div>
                  
                  {/* Connector Line */}
                  {index < sections.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4
                      ${index < currentSection ? 'bg-green-300' : 'bg-gray-200'}
                      transition-colors duration-300
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile view - compact layout */}
        <div className="md:hidden">
          <div className="grid grid-cols-7 gap-2">
            {sections.map((section, index) => {
              const status = getSectionStatus(index);
              const isClickable = canNavigateToSection(index);
              
              return (
                <button
                  key={section.id}
                  onClick={() => isClickable && onSectionClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-200
                    ${getStatusColor(status)}
                    ${isClickable 
                      ? 'cursor-pointer hover:scale-105' 
                      : 'cursor-not-allowed opacity-50'
                    }
                  `}
                  title={section.title}
                >
                  {status === 'completed' ? '✓' : index + 1}
                </button>
              );
            })}
          </div>
          
          {/* Current section name for mobile */}
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-blue-600">
              {sections[currentSection]?.title}
            </p>
            <p className="text-xs text-gray-500">
              Section {currentSection + 1} of {sections.length}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xl font-bold text-blue-600">{currentSection + 1}</div>
          <div className="text-xs text-blue-800">Current Section</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xl font-bold text-green-600">{currentSection}</div>
          <div className="text-xs text-green-800">Completed</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="text-xl font-bold text-yellow-600">{progress.filledFields}</div>
          <div className="text-xs text-yellow-800">Fields Filled</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="text-xl font-bold text-purple-600">{progress.requiredFieldsFilled}</div>
          <div className="text-xs text-purple-800">Required Done</div>
        </div>
      </div>

      {/* Completion Status */}
      {progress.percentageComplete === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-500 text-xl">🎉</span>
            <span className="text-green-800 font-medium">
              All sections completed! Ready to submit your intake form.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};