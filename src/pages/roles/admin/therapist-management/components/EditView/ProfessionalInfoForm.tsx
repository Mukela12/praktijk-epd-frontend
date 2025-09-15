import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  BriefcaseIcon, 
  LanguageIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { Therapist } from '../shared/therapistTypes';

interface ProfessionalInfoFormProps {
  therapist: Therapist;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({ therapist, onSubmit, isSaving }) => {
  const [formData, setFormData] = useState({
    license_number: therapist.license_number || '',
    years_of_experience: therapist.years_of_experience || 0,
    specializations: therapist.specializations || [],
    languages: therapist.languages || [],
    bio: therapist.bio || '',
    qualifications: therapist.qualifications || [],
    kvk_number: therapist.kvk_number || '',
    big_number: therapist.big_number || '',
    street_address: therapist.street_address || '',
    city: therapist.city || '',
    postal_code: therapist.postal_code || '',
    country: therapist.country || 'Netherlands'
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newQualification, setNewQualification] = useState('');

  const commonSpecializations = [
    'CBT (Cognitive Behavioral Therapy)',
    'EMDR',
    'Trauma Therapy',
    'Anxiety Disorders',
    'Depression',
    'Couples Therapy',
    'Family Therapy',
    'Child Psychology',
    'Addiction Counseling',
    'Grief Counseling'
  ];

  const commonLanguages = [
    'Dutch',
    'English',
    'German',
    'French',
    'Spanish',
    'Arabic',
    'Turkish',
    'Polish'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialization = () => {
    if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
      updateFormData('specializations', [...formData.specializations, newSpecialization]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    updateFormData('specializations', formData.specializations.filter((s: string) => s !== spec));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      updateFormData('languages', [...formData.languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    updateFormData('languages', formData.languages.filter((l: string) => l !== lang));
  };

  const addQualification = () => {
    if (newQualification && !formData.qualifications.includes(newQualification)) {
      updateFormData('qualifications', [...formData.qualifications, newQualification]);
      setNewQualification('');
    }
  };

  const removeQualification = (qual: string) => {
    updateFormData('qualifications', formData.qualifications.filter((q: string) => q !== qual));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Update professional qualifications, expertise, and business information.
        </p>
      </div>

      {/* License and Experience */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="license_number"
              value={formData.license_number}
              onChange={(e) => updateFormData('license_number', e.target.value)}
              placeholder="NL123456"
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <DocumentTextIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <div className="mt-1 relative">
            <input
              type="number"
              id="years_of_experience"
              value={formData.years_of_experience}
              onChange={(e) => updateFormData('years_of_experience', parseInt(e.target.value) || 0)}
              min="0"
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <BriefcaseIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Business Numbers */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="kvk_number" className="block text-sm font-medium text-gray-700">
            KVK Number
          </label>
          <input
            type="text"
            id="kvk_number"
            value={formData.kvk_number}
            onChange={(e) => updateFormData('kvk_number', e.target.value)}
            placeholder="12345678"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="big_number" className="block text-sm font-medium text-gray-700">
            BIG Number
          </label>
          <input
            type="text"
            id="big_number"
            value={formData.big_number}
            onChange={(e) => updateFormData('big_number', e.target.value)}
            placeholder="BIG123456"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Specializations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AcademicCapIcon className="inline-block w-5 h-5 mr-1" />
          Specializations
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select or type a specialization</option>
              {commonSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSpecialization}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specializations.map((spec: string) => (
              <span
                key={spec}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => removeSpecialization(spec)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LanguageIcon className="inline-block w-5 h-5 mr-1" />
          Languages
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select a language</option>
              {commonLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLanguage}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang: string) => (
              <span
                key={lang}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
              >
                {lang}
                <button
                  type="button"
                  onClick={() => removeLanguage(lang)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Professional Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => updateFormData('bio', e.target.value)}
          placeholder="Write a brief professional bio..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Address Information */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <HomeIcon className="w-5 h-5 mr-2" />
          Practice Address
        </h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="street_address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street_address"
              value={formData.street_address}
              onChange={(e) => updateFormData('street_address', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => updateFormData('postal_code', e.target.value)}
              placeholder="1234 AB"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => updateFormData('country', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfessionalInfoForm;