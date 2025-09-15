import React, { useState } from 'react';
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTherapistContext } from '../shared/TherapistContext';

const TherapistFilters: React.FC = () => {
  const { therapists, filters, updateFilters } = useTherapistContext();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique specializations from all therapists
  const allSpecializations = Array.from(
    new Set(therapists.flatMap(t => t.specializations || []))
  ).sort();

  const handleStatusChange = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatuses });
  };

  const handleSpecializationChange = (spec: string) => {
    const newSpecs = filters.specializations.includes(spec)
      ? filters.specializations.filter(s => s !== spec)
      : [...filters.specializations, spec];
    updateFilters({ specializations: newSpecs });
  };

  const clearAllFilters = () => {
    updateFilters({
      search: '',
      status: [],
      specializations: [],
      acceptingClients: null,
      clientCount: null,
      rating: null
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status.length > 0 ||
    filters.specializations.length > 0 ||
    filters.acceptingClients !== null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                Active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Status:</span>
            <div className="flex gap-2">
              {['active', 'inactive', 'pending'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Accepting Clients Filter */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => updateFilters({ 
                acceptingClients: filters.acceptingClients === true ? null : true 
              })}
              className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg border transition-colors ${
                filters.acceptingClients === true
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                filters.acceptingClients === true ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              Accepting New Clients
            </button>
          </div>

          {/* Show Advanced Filters */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            Advanced
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${
              showAdvanced ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {/* Specializations */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {allSpecializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => handleSpecializationChange(spec)}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                      filters.specializations.includes(spec)
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Count Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Min Clients
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.clientCount?.min || ''}
                  onChange={(e) => updateFilters({
                    clientCount: {
                      min: Number(e.target.value) || 0,
                      max: filters.clientCount?.max || 100
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Max Clients
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.clientCount?.max || ''}
                  onChange={(e) => updateFilters({
                    clientCount: {
                      min: filters.clientCount?.min || 0,
                      max: Number(e.target.value) || 100
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Rating Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Min Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating?.min || ''}
                  onChange={(e) => updateFilters({
                    rating: {
                      min: Number(e.target.value) || 0,
                      max: filters.rating?.max || 5
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Max Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating?.max || ''}
                  onChange={(e) => updateFilters({
                    rating: {
                      min: filters.rating?.min || 0,
                      max: Number(e.target.value) || 5
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistFilters;