import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useTherapistContext } from '../shared/TherapistContext';
import ListHeader from './ListHeader';
import TherapistFilters from './TherapistFilters';
import BulkActions from './BulkActions';
import TherapistCard from './TherapistCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumTable, PremiumButton, PremiumEmptyState } from '@/components/layout/PremiumLayout';

const TherapistList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    therapists, 
    loading, 
    selectedIds,
    selectAll,
    loadTherapists,
    toggleSelectAll,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    filters
  } = useTherapistContext();

  useEffect(() => {
    loadTherapists();
  }, [loadTherapists]);

  const handleCreateNew = () => {
    navigate('/admin/therapists/new');
  };

  const handleViewTherapist = (id: string) => {
    navigate(`/admin/therapists/${id}`);
  };

  const handleEditTherapist = (id: string) => {
    navigate(`/admin/therapists/${id}/edit`);
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTherapists = therapists.slice(startIndex, endIndex);
  const totalPages = Math.ceil(therapists.length / pageSize);

  if (loading && therapists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapist Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your therapy team, assignments, and availability
          </p>
        </div>
        <PremiumButton
          onClick={handleCreateNew}
          variant="danger"
          icon={PlusIcon}
        >
          Add Therapist
        </PremiumButton>
      </div>

      {/* Search and Stats Header */}
      <ListHeader />

      {/* Filters */}
      <TherapistFilters />

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && <BulkActions />}

      {/* Therapist List */}
      {therapists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <PremiumEmptyState
            icon={UsersIcon}
            title={filters.search || filters.status.length > 0 || filters.specializations.length > 0 
              ? "No therapists found" 
              : "No therapists yet"}
            description={filters.search || filters.status.length > 0 || filters.specializations.length > 0
              ? "Try adjusting your filters to see more results"
              : "Get started by adding your first therapist to the system"}
            action={!(filters.search || filters.status.length > 0 || filters.specializations.length > 0) ? {
              label: "Add Your First Therapist",
              onClick: handleCreateNew
            } : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specializations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTherapists.map(therapist => (
                <TherapistCard 
                  key={therapist.id} 
                  therapist={therapist}
                  onView={handleViewTherapist}
                  onEdit={handleEditTherapist}
                />
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, therapists.length)}</span> of{' '}
                    <span className="font-medium">{therapists.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TherapistList;