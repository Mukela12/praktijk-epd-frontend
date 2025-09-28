import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useClientContext } from '../shared/ClientContext';
import ListHeader from './ListHeader';
import ClientFilters from './ClientFilters';
import BulkActions from './BulkActions';
import ClientCard from './ClientCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumButton, PremiumEmptyState, PremiumCard } from '@/components/layout/PremiumLayout';
import { CSVImportSection } from '@/components/admin/csv-import';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [showCSVImport, setShowCSVImport] = useState(false);
  
  const { 
    clients, 
    loading, 
    statistics,
    selectedIds,
    selectAll,
    loadClients,
    loadTherapists,
    toggleSelectAll,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    filters
  } = useClientContext();

  useEffect(() => {
    loadClients();
    loadTherapists();
  }, [loadClients, loadTherapists]);

  const handleCreateNew = () => {
    navigate('/admin/clients/new');
  };

  const handleViewClient = (id: string) => {
    navigate(`/admin/clients/${id}`);
  };

  const handleEditClient = (id: string) => {
    navigate(`/admin/clients/${id}/edit`);
  };

  const handleCSVImportComplete = () => {
    setShowCSVImport(false);
    loadClients(); // Refresh the client list
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show CSV import view if active
  if (showCSVImport) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Clients from CSV</h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload a CSV file to bulk import client accounts
            </p>
          </div>
          <PremiumButton
            onClick={() => setShowCSVImport(false)}
            variant="secondary"
          >
            ← Back to Client List
          </PremiumButton>
        </div>

        {/* CSV Import Component */}
        <CSVImportSection
          type="clients"
          onImportComplete={handleCSVImportComplete}
          onCancel={() => setShowCSVImport(false)}
          isOpen={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage client profiles, assignments, and therapy progress
          </p>
        </div>
        <div className="flex gap-3">
          <PremiumButton
            onClick={() => setShowCSVImport(true)}
            variant="secondary"
            icon={DocumentArrowUpIcon}
          >
            Import from CSV
          </PremiumButton>
          <PremiumButton
            onClick={handleCreateNew}
            variant="danger"
            icon={PlusIcon}
          >
            Add Client
          </PremiumButton>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total</p>
                <p className="text-xl font-bold text-gray-900">{statistics.totalClients}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Active</p>
                <p className="text-xl font-bold text-gray-900">{statistics.activeClients}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Assigned</p>
                <p className="text-xl font-bold text-gray-900">{statistics.assignedClients}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Unassigned</p>
                <p className="text-xl font-bold text-gray-900">{statistics.unassignedClients}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Intake Done</p>
                <p className="text-xl font-bold text-gray-900">{statistics.intakeCompleted}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Scheduled</p>
                <p className="text-xl font-bold text-gray-900">{statistics.clientsWithUpcomingAppointments}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Inactive</p>
                <p className="text-xl font-bold text-gray-900">{statistics.inactiveClients}</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Search and Filters */}
      <ListHeader />
      <ClientFilters />

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && <BulkActions />}

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <PremiumEmptyState
            icon={UsersIcon}
            title={filters.search || filters.status.length > 0 || filters.therapist !== 'all'
              ? "No clients found" 
              : "No clients yet"}
            description={filters.search || filters.status.length > 0 || filters.therapist !== 'all'
              ? "Try adjusting your filters to see more results"
              : "Get started by adding your first client to the system"}
            action={!(filters.search || filters.status.length > 0 || filters.therapist !== 'all') ? {
              label: "Add Your First Client",
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
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intake
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map(client => (
                <ClientCard 
                  key={client.id} 
                  client={client}
                  onView={handleViewClient}
                  onEdit={handleEditClient}
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
                    Showing <span className="font-medium">{startIndex}</span> to{' '}
                    <span className="font-medium">{endIndex}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
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
                    {/* Page numbers - show limited range */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage - 2 + i;
                      if (page < 1 || page > totalPages) return null;
                      return (
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
                      );
                    }).filter(Boolean)}
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

export default ClientList;