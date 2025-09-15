import React, { useState } from 'react';
import { 
  CurrencyEuroIcon, 
  ClockIcon,
  VideoCameraIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Therapist } from '../shared/therapistTypes';

interface ServiceSettingsFormProps {
  therapist: Therapist;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

const ServiceSettingsForm: React.FC<ServiceSettingsFormProps> = ({ therapist, onSubmit, isSaving }) => {
  const [formData, setFormData] = useState({
    hourly_rate: therapist.hourly_rate || therapist.consultation_rate || 0,
    session_duration: therapist.session_duration || 60,
    break_between_sessions: therapist.break_between_sessions || 15,
    online_therapy: therapist.online_therapy || false,
    in_person_therapy: therapist.in_person_therapy || false,
    max_clients: therapist.max_clients || 20
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure rates, session settings, and service availability.
        </p>
      </div>

      {/* Rates and Session Settings */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
            Hourly Rate
          </label>
          <div className="mt-1 relative">
            <input
              type="number"
              id="hourly_rate"
              value={formData.hourly_rate}
              onChange={(e) => updateFormData('hourly_rate', parseFloat(e.target.value) || 0)}
              placeholder="120"
              min="0"
              step="5"
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <CurrencyEuroIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Per session rate in euros</p>
        </div>

        <div>
          <label htmlFor="session_duration" className="block text-sm font-medium text-gray-700">
            Session Duration
          </label>
          <div className="mt-1 relative">
            <select
              id="session_duration"
              value={formData.session_duration}
              onChange={(e) => updateFormData('session_duration', parseInt(e.target.value))}
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
            <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="break_between_sessions" className="block text-sm font-medium text-gray-700">
            Break Between Sessions
          </label>
          <div className="mt-1 relative">
            <select
              id="break_between_sessions"
              value={formData.break_between_sessions}
              onChange={(e) => updateFormData('break_between_sessions', parseInt(e.target.value))}
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="0">No break</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
            <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="max_clients" className="block text-sm font-medium text-gray-700">
            Maximum Clients
          </label>
          <div className="mt-1 relative">
            <input
              type="number"
              id="max_clients"
              value={formData.max_clients}
              onChange={(e) => updateFormData('max_clients', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <UserGroupIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Total client capacity</p>
        </div>
      </div>

      {/* Service Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Service Types
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.online_therapy}
              onChange={(e) => updateFormData('online_therapy', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-3 flex items-center">
              <VideoCameraIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-700">Online Therapy</span>
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.in_person_therapy}
              onChange={(e) => updateFormData('in_person_therapy', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-3 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-700">In-Person Therapy</span>
            </span>
          </label>
        </div>
      </div>

      {/* Current Statistics */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Current Statistics</h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Active Clients</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {therapist.client_count || 0}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Capacity</dt>
            <dd className="mt-1">
              <div className="flex items-center">
                <span className="text-2xl font-semibold text-gray-900">
                  {Math.round(((therapist.client_count || 0) / formData.max_clients) * 100)}%
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${((therapist.client_count || 0) / formData.max_clients) * 100}%`
                  }}
                />
              </div>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Estimated Monthly Revenue</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              €{((therapist.client_count || 0) * formData.hourly_rate * 4).toFixed(0)}
            </dd>
          </div>
        </dl>
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

export default ServiceSettingsForm;