import React from 'react';
import { 
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  ClipboardDocumentListIcon,
  CurrencyEuroIcon,
  HomeIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Therapist } from '../shared/therapistTypes';
import { formatDate } from '@/utils/dateFormatters';

interface OverviewTabProps {
  therapist: Therapist;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ therapist }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Professional Information</h3>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">License Number</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.license_number || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Years of Experience</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.years_of_experience || 0} years
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Specializations</dt>
            <dd className="mt-1">
              <div className="flex flex-wrap gap-1">
                {therapist.specializations?.length > 0 ? (
                  therapist.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">None specified</span>
                )}
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Languages</dt>
            <dd className="mt-1">
              <div className="flex flex-wrap gap-1">
                {therapist.languages?.length > 0 ? (
                  therapist.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* Service Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Service Information</h3>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Hourly Rate</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              €{therapist.hourly_rate || therapist.consultation_rate || 0} per session
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Session Duration</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.session_duration || 60} minutes
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Break Between Sessions</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.break_between_sessions || 15} minutes
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Service Types</dt>
            <dd className="mt-1 flex items-center gap-2">
              {therapist.online_therapy && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  Online
                </span>
              )}
              {therapist.in_person_therapy && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                  In-Person
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Client Capacity</dt>
            <dd className="mt-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {therapist.client_count || 0} / {therapist.max_clients || 20}
                </span>
                <div className="ml-3 flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((therapist.client_count || 0) / (therapist.max_clients || 20)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* Location & Credentials */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <HomeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Location & Credentials</h3>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Address</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.street_address ? (
                <>
                  {therapist.street_address}<br />
                  {therapist.postal_code} {therapist.city}<br />
                  {therapist.country || 'Netherlands'}
                </>
              ) : (
                'Not provided'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">KVK Number</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.kvk_number || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">BIG Number</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {therapist.big_number || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(therapist.created_at)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Professional Bio</h3>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          {therapist.bio || (
            <p className="text-gray-500 italic">No bio provided</p>
          )}
        </div>
      </div>

      {/* Qualifications */}
      {therapist.qualifications && therapist.qualifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Qualifications</h3>
          </div>
          <ul className="space-y-2">
            {therapist.qualifications.map((qual, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-green-400">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <span className="ml-3 text-sm text-gray-700">{qual}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;