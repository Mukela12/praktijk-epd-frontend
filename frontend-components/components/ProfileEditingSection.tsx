// Profile editing component for admin and self-editing
// Supports editing client and therapist profiles with proper permissions

import React, { useState, useEffect } from 'react';

interface ProfileField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'number';
  required?: boolean;
  editable?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  category?: string;
}

interface ProfileEditingProps {
  userId?: string; // For admin editing other users
  userType: 'client' | 'therapist';
  isAdmin?: boolean;
  onSaveComplete?: () => void;
  onCancel?: () => void;
}

// Profile field definitions
const CLIENT_PROFILE_FIELDS: ProfileField[] = [
  // User table fields
  { name: 'firstName', label: 'First Name', type: 'text', required: true, editable: true, category: 'Basic Information' },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true, editable: true, category: 'Basic Information' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, editable: true, category: 'Basic Information' },
  { name: 'phone', label: 'Phone Number', type: 'phone', editable: true, category: 'Basic Information' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other', 'prefer_not_to_say'], editable: true, category: 'Basic Information' },
  
  // Client profile fields
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', editable: true, category: 'Personal Details' },
  { name: 'bsn', label: 'BSN (Social Security Number)', type: 'text', editable: true, category: 'Personal Details', description: '9-digit Dutch social security number' },
  { name: 'initials', label: 'Initials', type: 'text', editable: true, category: 'Personal Details' },
  { name: 'namePrefix', label: 'Name Prefix', type: 'text', editable: true, category: 'Personal Details', placeholder: 'van, de, etc.' },
  { name: 'salutation', label: 'Salutation', type: 'select', options: ['mr', 'mrs', 'ms', 'dr', 'prof'], editable: true, category: 'Personal Details' },
  { name: 'mobilePhone', label: 'Mobile Phone', type: 'phone', editable: true, category: 'Contact Information' },
  
  // Address fields
  { name: 'streetName', label: 'Street Name', type: 'text', editable: true, category: 'Address' },
  { name: 'houseNumber', label: 'House Number', type: 'text', editable: true, category: 'Address' },
  { name: 'postalCode', label: 'Postal Code', type: 'text', editable: true, category: 'Address' },
  { name: 'city', label: 'City', type: 'text', editable: true, category: 'Address' },
  { name: 'country', label: 'Country', type: 'text', editable: true, category: 'Address' },
  
  // Mailing address
  { name: 'mailingStreet', label: 'Mailing Street', type: 'text', editable: true, category: 'Mailing Address', description: 'If different from home address' },
  { name: 'mailingHouseNumber', label: 'Mailing House Number', type: 'text', editable: true, category: 'Mailing Address' },
  { name: 'mailingPostalCode', label: 'Mailing Postal Code', type: 'text', editable: true, category: 'Mailing Address' },
  { name: 'mailingCity', label: 'Mailing City', type: 'text', editable: true, category: 'Mailing Address' },
  
  // Insurance and medical
  { name: 'insuranceNumber', label: 'Insurance Number', type: 'text', editable: true, category: 'Insurance & Medical' },
  { name: 'insuranceCompany', label: 'Insurance Company', type: 'text', editable: true, category: 'Insurance & Medical' },
  { name: 'generalPractitionerName', label: 'General Practitioner', type: 'text', editable: true, category: 'Insurance & Medical' },
  
  // Financial
  { name: 'bankAccountIban', label: 'Bank Account (IBAN)', type: 'text', editable: true, category: 'Financial Information' },
  { name: 'clientNumber', label: 'Client Number', type: 'text', editable: true, category: 'Administrative' },
  
  // Additional
  { name: 'additionalEmails', label: 'Additional Emails', type: 'textarea', editable: true, category: 'Contact Information', description: 'Separate multiple emails with commas' },
  { name: 'youthBsn', label: 'Youth BSN', type: 'text', editable: true, category: 'Family Information', description: 'For minors' },
  { name: 'guardianName', label: 'Guardian Name', type: 'text', editable: true, category: 'Family Information' }
];

const THERAPIST_PROFILE_FIELDS: ProfileField[] = [
  // User table fields
  { name: 'firstName', label: 'First Name', type: 'text', required: true, editable: true, category: 'Basic Information' },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true, editable: true, category: 'Basic Information' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, editable: true, category: 'Basic Information' },
  { name: 'phone', label: 'Phone Number', type: 'phone', editable: true, category: 'Basic Information' },
  
  // Therapist profile fields
  { name: 'licenseNumber', label: 'License Number', type: 'text', editable: true, category: 'Professional Information' },
  { name: 'specializations', label: 'Specializations', type: 'textarea', editable: true, category: 'Professional Information', description: 'List your areas of expertise' },
  { name: 'bio', label: 'Biography', type: 'textarea', editable: true, category: 'Professional Information', description: 'Professional background and approach' },
  { name: 'hourlyRate', label: 'Hourly Rate (€)', type: 'number', editable: true, category: 'Professional Information' },
  { name: 'yearsOfExperience', label: 'Years of Experience', type: 'number', editable: true, category: 'Professional Information' },
  { name: 'education', label: 'Education', type: 'textarea', editable: true, category: 'Professional Information' },
  { name: 'certifications', label: 'Certifications', type: 'textarea', editable: true, category: 'Professional Information' }
];

const API_BASE_URL = 'https://praktijk-epd-backend-production.up.railway.app';

export const ProfileEditingSection: React.FC<ProfileEditingProps> = ({
  userId,
  userType,
  isAdmin = false,
  onSaveComplete,
  onCancel
}) => {
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const profileFields = userType === 'client' ? CLIENT_PROFILE_FIELDS : THERAPIST_PROFILE_FIELDS;
  const categories = Array.from(new Set(profileFields.map(f => f.category).filter(Boolean)));

  // Get auth token
  const getAuthToken = () => localStorage.getItem('authToken') || '';

  // Load profile data
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = isAdmin && userId 
        ? `/api/admin/users/${userId}`
        : userType === 'client' 
          ? '/api/client/profile'
          : '/api/therapist/profile';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setProfileData(result.data);
        setActiveCategory(categories[0] || '');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile data
  const saveProfileData = async () => {
    try {
      setSaving(true);
      setError(null);

      const endpoint = isAdmin && userId 
        ? `/api/admin/users/${userId}`
        : userType === 'client' 
          ? '/api/client/profile'
          : '/api/therapist/profile';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHasUnsavedChanges(false);
        if (onSaveComplete) {
          onSaveComplete();
        }
        return true;
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update field value
  const updateFieldValue = (fieldName: string, value: any) => {
    setProfileData(prev => ({ ...prev, [fieldName]: value }));
    setHasUnsavedChanges(true);
  };

  // Get field value
  const getFieldValue = (fieldName: string) => {
    return profileData[fieldName] || '';
  };

  // Render form field
  const renderField = (field: ProfileField) => {
    const value = getFieldValue(field.name);
    const fieldId = `field-${field.name}`;

    const baseInputClasses = `
      w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none transition-colors duration-200
    `;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            id={fieldId}
            type={field.type}
            value={value}
            onChange={(e) => updateFieldValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled={!field.editable}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => updateFieldValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClasses} resize-y`}
            disabled={!field.editable}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={value}
            onChange={(e) => updateFieldValue(field.name, e.target.value)}
            className={baseInputClasses}
            disabled={!field.editable}
          >
            <option value="">Please select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            id={fieldId}
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(field.name, e.target.value)}
            className={baseInputClasses}
            disabled={!field.editable}
          />
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => updateFieldValue(field.name, parseInt(e.target.value) || 0)}
            className={baseInputClasses}
            disabled={!field.editable}
            min="0"
            step={field.name === 'hourlyRate' ? '0.01' : '1'}
          />
        );

      default:
        return null;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadProfileData();
  }, [userId, userType, isAdmin]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Loading Profile...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              👤 {isAdmin ? 'Edit User' : 'Edit'} Profile
            </h3>
            <p className="text-gray-600 mt-1">
              {userType === 'client' ? 'Client' : 'Therapist'} information
              {isAdmin && ' (Admin View)'}
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <span>📝</span>
              <span className="text-sm font-medium">Unsaved Changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      {categories.length > 1 && (
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                  ${activeCategory === category
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="p-6">
        <div className="space-y-6">
          {profileFields
            .filter(field => !activeCategory || field.category === activeCategory)
            .map(field => (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={`field-${field.name}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {!field.editable && (
                    <span className="text-gray-400 ml-2 text-xs">(Read-only)</span>
                  )}
                </label>

                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}

                {renderField(field)}
              </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t bg-gray-50 flex justify-between">
        <div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
            disabled={isSaving}
          >
            Reset Changes
          </button>
          
          <button
            onClick={saveProfileData}
            disabled={!hasUnsavedChanges || isSaving}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200
              ${hasUnsavedChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                💾 Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Instructions */}
      <div className="px-6 pb-4 text-xs text-gray-500">
        <p>💡 Click "Save Changes" to update your profile information securely.</p>
      </div>
    </div>
  );
};