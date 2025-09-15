import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Therapist } from '../shared/therapistTypes';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';

interface ProfileHeaderProps {
  therapist: Therapist;
  onEdit: () => void;
  onDelete: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ therapist, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            {/* Profile Info */}
            <div className="flex items-center">
              <ProfilePhotoUpload
                userId={therapist.id}
                currentPhotoUrl={therapist.profile_photo_url}
                size="large"
                editable={false}
              />
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {therapist.first_name} {therapist.last_name}
                </h1>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {therapist.email}
                  </div>
                  {therapist.phone && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <PhoneIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {therapist.phone}
                    </div>
                  )}
                  {therapist.city && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {therapist.city}, {therapist.country || 'Netherlands'}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center space-x-4">
                  <StatusBadge
                    type="user"
                    status={therapist.user_status}
                    size="md"
                  />
                  {therapist.years_of_experience && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      <BriefcaseIcon className="w-4 h-4 mr-1.5" />
                      {therapist.years_of_experience} years experience
                    </span>
                  )}
                  {therapist.rating && (
                    <div className="inline-flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                      <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-semibold text-gray-700">
                        {therapist.rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({therapist.total_reviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Edit
              </button>
            </span>

            <span className="hidden sm:block ml-3">
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5 text-red-500" />
                Delete
              </button>
            </span>

            {/* Mobile Actions */}
            <span className="sm:hidden">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </button>
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Active Clients</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                {therapist.client_count || 0}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  / {therapist.max_clients || 20}
                </span>
              </div>
            </dd>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                €{therapist.hourly_rate || therapist.consultation_rate || 0}
              </div>
            </dd>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Specializations</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {therapist.specializations?.length || 0}
            </dd>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Availability</dt>
            <dd className="mt-1">
              {therapist.accepting_new_clients ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Accepting Clients
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Not Accepting
                </span>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;