import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { useRealApi } from '@/hooks/useRealApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate, formatFullDate } from '@/utils/dateFormatters';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ClientDetail from './ClientDetail';
import ClientEdit from './ClientEdit';
import CreateClient from './CreateClient';
import { CSVImportSection } from '@/components/admin/csv-import';

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  last_login?: string;
  client_status?: 'new' | 'active' | 'inactive' | 'completed';
  assigned_therapist?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  total_appointments?: number | string;
  completed_appointments?: number | string;
  upcoming_appointments?: number | string;
  last_appointment_date?: string;
  next_appointment_date?: string;
  unpaid_invoices?: number | string;
  total_unpaid_amount?: number | string;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  assignedClients: number;
  intakeCompletedClients: number;
  byStatus: Record<string, number>;
}

const AllClients: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getAdminClients, getAdminClientStats, deleteUser, updateUser, getAdminDashboard } = useRealApi();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // View state management
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit' | 'create' | 'csv-import'>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load clients and stats
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load clients
      const clientsResponse = await getAdminClients({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        therapistId: selectedTherapist !== 'all' ? selectedTherapist : undefined,
        sortBy,
        sortOrder
      });

      console.log('Clients response:', clientsResponse);
      
      if (clientsResponse) {
        const clientList = clientsResponse.clients || clientsResponse || [];
        setClients(clientList);
        const total = (clientsResponse as any).total || clientsResponse.pagination?.total || clientList.length || 0;
        setTotalPages(Math.ceil(total / 20));
      }

      // Load stats from dashboard data
      try {
        const dashboardResponse = await getAdminDashboard();
        console.log('Dashboard response:', dashboardResponse);
        if (dashboardResponse && dashboardResponse.clientStats) {
          setStats(dashboardResponse.clientStats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Continue without stats
      }
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedStatus, selectedTherapist, sortBy, sortOrder]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const handleSelectClient = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!window.confirm(`Are you sure you want to delete ${client.first_name} ${client.last_name}?`)) {
      return;
    }

    try {
      const response = await deleteUser(client.id);
      if (response.success) {
        toast.success('Client deleted successfully');
        loadClients();
      } else {
        toast.error(response.message || 'Failed to delete client');
      }
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const handleActivateClient = async (client: Client) => {
    try {
      const response = await updateUser(client.id, { user_status: 'active' });
      if (response.success) {
        toast.success('Client activated successfully');
        loadClients();
      }
    } catch (error) {
      toast.error('Failed to activate client');
    }
  };

  const handleDeactivateClient = async (client: Client) => {
    try {
      const response = await updateUser(client.id, { user_status: 'inactive' });
      if (response.success) {
        toast.success('Client deactivated successfully');
        loadClients();
      }
    } catch (error) {
      toast.error('Failed to deactivate client');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        bg: 'bg-emerald-50 border-emerald-200', 
        text: 'text-emerald-700',
        icon: '✓',
        label: 'Active'
      },
      inactive: { 
        bg: 'bg-gray-50 border-gray-200', 
        text: 'text-gray-700',
        icon: '○',
        label: 'Inactive'
      },
      pending: { 
        bg: 'bg-amber-50 border-amber-200', 
        text: 'text-amber-700',
        icon: '⏳',
        label: 'Pending'
      },
      new: { 
        bg: 'bg-blue-50 border-blue-200', 
        text: 'text-blue-700',
        icon: '★',
        label: 'New'
      },
      completed: { 
        bg: 'bg-purple-50 border-purple-200', 
        text: 'text-purple-700',
        icon: '✓',
        label: 'Completed'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
        <span className="mr-1.5">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle view changes
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setViewMode('detail');
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClient(null);
    loadClients(); // Refresh list after edit
  };

  const handleCSVImportComplete = () => {
    setViewMode('list');
    loadClients(); // Refresh list after CSV import
  };

  // Render detail view
  if (viewMode === 'detail' && selectedClient) {
    return (
      <PageTransition>
        <ClientDetail 
          clientId={selectedClient.id}
          onBack={handleBackToList}
          onEdit={() => handleEditClient(selectedClient)}
        />
      </PageTransition>
    );
  }

  // Render edit view
  if (viewMode === 'edit' && selectedClient) {
    return (
      <PageTransition>
        <ClientEdit
          client={selectedClient}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      </PageTransition>
    );
  }

  // Render create view
  if (viewMode === 'create') {
    return (
      <PageTransition>
        <CreateClient
          onBack={handleBackToList}
          onSuccess={handleBackToList}
        />
      </PageTransition>
    );
  }

  // Render CSV import view
  if (viewMode === 'csv-import') {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Clients from CSV</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload a CSV file to bulk import client accounts
              </p>
            </div>
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Client List
            </button>
          </div>

          {/* CSV Import Component */}
          <CSVImportSection
            type="clients"
            onImportComplete={handleCSVImportComplete}
            onCancel={handleBackToList}
            isOpen={true}
          />
        </div>
      </PageTransition>
    );
  }

  // Render list view
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <UserGroupIcon className="w-10 h-10 mr-3" />
                  Client Management
                </h1>
                <p className="mt-2 text-blue-100">
                  Comprehensive overview and management of all clients
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('csv-import')}
                  className="inline-flex items-center px-5 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20"
                >
                  <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                  Import from CSV
                </button>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center px-5 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md"
                >
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add New Client
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Total Clients</p>
                    <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Active Clients</p>
                    <p className="text-3xl font-bold text-white">{stats.activeClients}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Assigned</p>
                    <p className="text-3xl font-bold text-white">{stats.assignedClients}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Intake Done</p>
                    <p className="text-3xl font-bold text-white">{stats.intakeCompletedClients}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-gray-500" />
              Search & Filter
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[140px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">✅ Active</option>
                  <option value="inactive">⛔ Inactive</option>
                  <option value="pending">⏳ Pending</option>
                </select>

                <select
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[160px]"
                >
                  <option value="all">All Therapists</option>
                  <option value="assigned">With Therapist</option>
                  <option value="unassigned">Without Therapist</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-3 border rounded-lg transition-all font-medium ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className={`w-5 h-5 mr-2 ${showFilters ? 'text-blue-600' : 'text-gray-500'}`} />
                  Advanced
                </button>

                <button
                  onClick={loadClients}
                  className="inline-flex items-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  title="Refresh"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Advanced filters - expandable section */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Intake Status
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500">
                      <option value="">All</option>
                      <option value="completed">✅ Completed</option>
                      <option value="pending">⏳ Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Registration Period
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500">
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="created_at">Registration Date</option>
                      <option value="last_name">Last Name</option>
                      <option value="last_login">Last Activity</option>
                      <option value="total_appointments">Total Sessions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DESC">↓ Descending</option>
                      <option value="ASC">↑ Ascending</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                      setSelectedTherapist('all');
                      setSortBy('created_at');
                      setSortOrder('DESC');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      setShowFilters(false);
                      loadClients();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Client List ({clients.length} {clients.length === 1 ? 'client' : 'clients'})
            </h3>
            {selectedClients.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedClients.length} selected
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === clients.length && clients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('first_name')}
                  >
                    <div className="flex items-center group">
                      Name
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'first_name' ? (
                          sortOrder === 'ASC' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
                        ) : <ArrowUpIcon className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortBy === 'created_at' && (
                        sortOrder === 'ASC' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <UserGroupIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No clients found</p>
                        <p className="text-sm text-gray-500 mb-6">
                          {searchQuery || selectedStatus !== 'all' 
                            ? 'Try adjusting your search criteria' 
                            : 'Get started by adding your first client'}
                        </p>
                        {(!searchQuery && selectedStatus === 'all') && (
                          <button
                            onClick={() => setViewMode('create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <UserPlusIcon className="w-5 h-5 mr-2" />
                            Add First Client
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : clients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-blue-50/50 transition-all duration-200">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${
                          index % 4 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          index % 4 === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          index % 4 === 2 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          'bg-gradient-to-br from-orange-500 to-orange-600'
                        }`}>
                          {client.first_name?.[0]?.toUpperCase()}{client.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {client.first_name} {client.last_name}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {client.phone && (
                          <div className="flex items-center text-gray-500">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {client.phone}
                          </div>
                        )}
                        <div className="flex items-center text-gray-500">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {client.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(client.user_status)}
                    </td>
                    <td className="px-6 py-4">
                      {client.assigned_therapist ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {client.assigned_therapist.first_name} {client.assigned_therapist.last_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No therapist assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-600">
                            {client.total_appointments || 0} total
                          </span>
                        </div>
                        {client.upcoming_appointments && Number(client.upcoming_appointments) > 0 && (
                          <div className="flex items-center text-blue-600">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>{client.upcoming_appointments} upcoming</span>
                          </div>
                        )}
                        {client.unpaid_invoices && Number(client.unpaid_invoices) > 0 && (
                          <div className="flex items-center text-red-600">
                            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                            <span>{client.unpaid_invoices} unpaid</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </Menu.Button>
                        
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleViewClient(client)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full`}
                                  >
                                    <EyeIcon className="w-4 h-4 mr-3" />
                                    View Details
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEditClient(client)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full`}
                                  >
                                    <PencilIcon className="w-4 h-4 mr-3" />
                                    Edit Client
                                  </button>
                                )}
                              </Menu.Item>
                              
                              <div className="h-px bg-gray-200 my-1" />
                              
                              {client.user_status === 'active' ? (
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleDeactivateClient(client)}
                                      className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full`}
                                    >
                                      <XCircleIcon className="w-4 h-4 mr-3" />
                                      Deactivate
                                    </button>
                                  )}
                                </Menu.Item>
                              ) : (
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleActivateClient(client)}
                                      className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full`}
                                    >
                                      <CheckCircleIcon className="w-4 h-4 mr-3" />
                                      Activate
                                    </button>
                                  )}
                                </Menu.Item>
                              )}
                              
                              <div className="h-px bg-gray-200 my-1" />
                              
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDeleteClient(client)}
                                    className={`${active ? 'bg-red-50' : ''} flex items-center px-4 py-2 text-sm text-red-600 w-full`}
                                  >
                                    <TrashIcon className="w-4 h-4 mr-3" />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * 20) + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">{Math.min(currentPage * 20, stats?.totalClients || clients.length)}</span> of{' '}
                    <span className="font-semibold text-gray-900">{stats?.totalClients || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AllClients;