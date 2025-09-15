import React from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  UsersIcon,
  CheckCircleIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTherapistContext } from '../shared/TherapistContext';
import { PremiumCard, PremiumMetric } from '@/components/layout/PremiumLayout';

const ListHeader: React.FC = () => {
  const { 
    therapists, 
    filters, 
    updateFilters,
    pageSize,
    setPageSize,
    exportTherapists
  } = useTherapistContext();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const clearSearch = () => {
    updateFilters({ search: '' });
  };

  // Calculate stats
  const activeCount = therapists.filter(t => t.user_status === 'active').length;
  const acceptingCount = therapists.filter(t => t.accepting_new_clients).length;
  const avgRating = therapists.reduce((sum, t) => sum + (t.rating || 0), 0) / therapists.length || 0;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumMetric
          title="Total Therapists"
          value={therapists.length}
          icon={UsersIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Active"
          value={activeCount}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
          change={{
            value: `${Math.round((activeCount / therapists.length) * 100)}%`,
            type: activeCount > therapists.length * 0.8 ? 'positive' : 'neutral'
          }}
        />
        <PremiumMetric
          title="Accepting Clients"
          value={acceptingCount}
          icon={UserGroupIcon}
          iconColor="text-indigo-600"
          change={{
            value: `${Math.round((acceptingCount / therapists.length) * 100)}%`,
            type: acceptingCount > therapists.length * 0.5 ? 'positive' : 'neutral'
          }}
        />
        <PremiumMetric
          title="Average Rating"
          value={avgRating.toFixed(1)}
          icon={StarIcon}
          iconColor="text-yellow-600"
          change={{
            value: `★`,
            type: avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative'
          }}
        />
      </div>

      {/* Search and Controls */}
      <PremiumCard hover={false}>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email, specialization..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
                {filters.search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => exportTherapists(therapists.map(t => t.id))}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Export CSV
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Import
              </button>
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default ListHeader;