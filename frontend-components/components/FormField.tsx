// Dynamic form field component for intake form
// Handles all field types with validation and proper styling

import React from 'react';
import { IntakeFormField } from '../types/intake-form.types';

interface FormFieldProps {
  field: IntakeFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  const fieldId = `field-${field.name}`;
  const hasError = !!error;

  const getSelectOptionLabel = (optionValue: string): string => {
    const labelMap: Record<string, string> = {
      // Education levels
      'primary_education': 'Primary Education',
      'secondary_education': 'Secondary Education',
      'vocational_training': 'Vocational Training',
      'higher_education': 'Higher Education',
      'university': 'University',
      'postgraduate': 'Postgraduate',
      
      // Relationship status
      'single': 'Single',
      'in_relationship': 'In a Relationship',
      'married': 'Married',
      'divorced': 'Divorced',
      'widowed': 'Widowed',
      'separated': 'Separated',
      
      // Complaint severity
      'light': 'Light',
      'mild': 'Mild', 
      'serious': 'Serious',
      'very_serious': 'Very Serious',
      
      // Consultation preference
      'in_person': 'In Person',
      'online': 'Online',
      'both': 'Both (In Person & Online)'
    };

    return labelMap[optionValue] || optionValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderField = () => {
    const baseInputClasses = `
      w-full p-3 border rounded-lg transition-colors duration-200
      ${hasError 
        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      focus:ring-2 focus:ring-opacity-50 focus:outline-none
    `;

    switch (field.type) {
      case 'text':
        return (
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClasses} resize-y min-h-[100px]`}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Please select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {getSelectOptionLabel(option)}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="space-y-3">
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldId}
                  checked={value === true}
                  onChange={() => onChange(true)}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldId}
                  checked={value === false}
                  onChange={() => onChange(false)}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            min="0"
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <label 
        htmlFor={fieldId}
        className={`
          block text-sm font-medium
          ${hasError ? 'text-red-700' : 'text-gray-700'}
        `}
      >
        {field.label}
        {field.required && (
          <span className="text-red-500 ml-1" title="Required field">*</span>
        )}
      </label>

      {/* Field Description */}
      {field.description && (
        <p className="text-xs text-gray-500 mt-1 mb-2">
          {field.description}
        </p>
      )}

      {/* Field Input */}
      <div className="relative">
        {renderField()}
        
        {/* Field Icons */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-red-500 text-sm">⚠️</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Field Help Text */}
      {!hasError && field.placeholder && field.type !== 'text' && field.type !== 'textarea' && (
        <p className="text-xs text-gray-500">
          {field.placeholder}
        </p>
      )}

      {/* Special field guidance */}
      {field.name === 'bsn' && (
        <p className="text-xs text-blue-600">
          💡 Your BSN (Burgerservicenummer) is a 9-digit number on your ID card
        </p>
      )}
      
      {field.name === 'currentComplaints' && (
        <p className="text-xs text-blue-600">
          💡 Please describe your concerns in detail - this helps us understand how to best help you
        </p>
      )}
      
      {field.name === 'therapyGoals' && (
        <p className="text-xs text-blue-600">
          💡 Think about what you'd like to be different in your life after therapy
        </p>
      )}

      {field.name === 'insuranceAcknowledgment' && (
        <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          ℹ️ Most health insurance policies in the Netherlands cover psychological care. 
          We'll help you understand your coverage and any potential costs.
        </p>
      )}
    </div>
  );
};