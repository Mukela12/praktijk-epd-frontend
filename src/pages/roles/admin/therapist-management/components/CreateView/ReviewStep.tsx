import React from 'react';
import { 
  UserIcon, 
  BriefcaseIcon, 
  CurrencyEuroIcon,
  CalendarDaysIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface ReviewStepProps {
  formData: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const formatAvailability = () => {
    if (!formData.availability) return 'Not set';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const availableDays = days.filter(day => formData.availability[day]?.enabled);
    
    if (availableDays.length === 0) return 'No availability set';
    if (availableDays.length === 7) return 'Available all week';
    if (availableDays.length === 5 && !formData.availability.saturday?.enabled && !formData.availability.sunday?.enabled) {
      return 'Weekdays only';
    }
    
    return `${availableDays.length} days per week`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please review all information before creating the therapist account.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.first_name} {formData.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {formData.gender || 'Not specified'}
            </dd>
          </div>
          {formData.street_address && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.street_address}<br />
                {formData.postal_code} {formData.city}<br />
                {formData.country || 'Netherlands'}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Professional Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h4 className="text-md font-medium text-gray-900">Professional Information</h4>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">License Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.license_number || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.years_of_experience || 0} years
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Specializations</dt>
            <dd className="mt-1">
              {formData.specializations.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.specializations.map((spec: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {spec}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-900">None specified</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Languages</dt>
            <dd className="mt-1">
              {formData.languages.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.languages.map((lang: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-900">None specified</span>
              )}
            </dd>
          </div>
          {formData.qualifications.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Qualifications</dt>
              <dd className="mt-1">
                <ul className="list-disc list-inside space-y-1">
                  {formData.qualifications.map((qual: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-900">{qual}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Service Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h4 className="text-md font-medium text-gray-900">Service Settings</h4>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              €{formData.hourly_rate || 0} per session
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Session Duration</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.session_duration} minutes
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Break Between Sessions</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.break_between_sessions} minutes
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Maximum Clients</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.max_clients} clients
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Types</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex gap-2">
                {formData.online_therapy && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    Online
                  </span>
                )}
                {formData.in_person_therapy && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                    In-Person
                  </span>
                )}
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Availability</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatAvailability()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Confirmation Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <p className="text-sm text-green-800">
              All information looks good! Click "Create Therapist" to complete the registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;