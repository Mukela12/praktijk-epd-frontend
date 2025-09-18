import React from 'react';
import { useClientContext } from '../shared/ClientContext';
import { PremiumCard } from '@/components/layout/PremiumLayout';

const ClientFilters: React.FC = () => {
  const { filters, setFilters, therapists } = useClientContext();

  const handleStatusChange = (status: string) => {
    const currentStatuses = filters.status;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ status: newStatuses });
  };

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <PremiumCard className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option.value)}
                    onChange={() => handleStatusChange(option.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Therapist Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Therapist
            </label>
            <select
              value={filters.therapist}
              onChange={(e) => setFilters({ therapist: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Therapists</option>
              <option value="unassigned">Unassigned</option>
              {therapists.map(therapist => (
                <option key={therapist.id} value={therapist.id}>
                  Dr. {therapist.first_name} {therapist.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Intake Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intake Status
            </label>
            <select
              value={filters.intakeCompleted}
              onChange={(e) => setFilters({ intakeCompleted: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Appointments Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointments
            </label>
            <select
              value={filters.hasUpcomingAppointments}
              onChange={(e) => setFilters({ hasUpcomingAppointments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="yes">Has Upcoming</option>
              <option value="no">No Upcoming</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status.length > 0 || filters.therapist !== 'all' || filters.intakeCompleted !== 'all' || filters.hasUpcomingAppointments !== 'all') && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters.status.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  {status}
                  <span className="ml-1">&times;</span>
                </button>
              ))}
              {filters.therapist !== 'all' && (
                <button
                  onClick={() => setFilters({ therapist: 'all' })}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Therapist filter
                  <span className="ml-1">&times;</span>
                </button>
              )}
              {filters.intakeCompleted !== 'all' && (
                <button
                  onClick={() => setFilters({ intakeCompleted: 'all' })}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Intake filter
                  <span className="ml-1">&times;</span>
                </button>
              )}
              {filters.hasUpcomingAppointments !== 'all' && (
                <button
                  onClick={() => setFilters({ hasUpcomingAppointments: 'all' })}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Appointment filter
                  <span className="ml-1">&times;</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setFilters({ 
                status: [], 
                therapist: 'all', 
                intakeCompleted: 'all',
                hasUpcomingAppointments: 'all'
              })}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </PremiumCard>
  );
};

export default ClientFilters;