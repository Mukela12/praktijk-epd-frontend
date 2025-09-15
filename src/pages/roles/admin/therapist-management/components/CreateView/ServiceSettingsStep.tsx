import React from 'react';
import { 
  CurrencyEuroIcon, 
  ClockIcon,
  VideoCameraIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface ServiceSettingsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const ServiceSettingsStep: React.FC<ServiceSettingsStepProps> = ({ formData, updateFormData }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const initializeAvailability = () => {
    if (!formData.availability) {
      const defaultAvailability: any = {};
      weekDays.forEach(day => {
        defaultAvailability[day.toLowerCase()] = {
          enabled: day !== 'Saturday' && day !== 'Sunday',
          start: '09:00',
          end: '17:00'
        };
      });
      updateFormData({ availability: defaultAvailability });
    }
  };

  React.useEffect(() => {
    initializeAvailability();
  }, []);

  const updateAvailability = (day: string, field: string, value: any) => {
    const updatedAvailability = {
      ...formData.availability,
      [day]: {
        ...formData.availability[day],
        [field]: value
      }
    };
    updateFormData({ availability: updatedAvailability });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure rates, session settings, and availability.
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
              value={formData.hourly_rate || ''}
              onChange={(e) => updateFormData({ hourly_rate: parseFloat(e.target.value) })}
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
              onChange={(e) => updateFormData({ session_duration: parseInt(e.target.value) })}
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
              onChange={(e) => updateFormData({ break_between_sessions: parseInt(e.target.value) })}
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
              onChange={(e) => updateFormData({ max_clients: parseInt(e.target.value) })}
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
              onChange={(e) => updateFormData({ online_therapy: e.target.checked })}
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
              onChange={(e) => updateFormData({ in_person_therapy: e.target.checked })}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-3 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-700">In-Person Therapy</span>
            </span>
          </label>
        </div>
      </div>

      {/* Weekly Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Weekly Availability
        </label>
        <div className="space-y-2">
          {weekDays.map(day => {
            const dayKey = day.toLowerCase();
            const availability = formData.availability?.[dayKey] || { enabled: false, start: '09:00', end: '17:00' };
            
            return (
              <div key={day} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={availability.enabled}
                  onChange={(e) => updateAvailability(dayKey, 'enabled', e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="time"
                    value={availability.start}
                    onChange={(e) => updateAvailability(dayKey, 'start', e.target.value)}
                    disabled={!availability.enabled}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={availability.end}
                    onChange={(e) => updateAvailability(dayKey, 'end', e.target.value)}
                    disabled={!availability.enabled}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceSettingsStep;