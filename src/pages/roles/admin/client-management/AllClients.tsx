import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserPlusIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { realApiService } from "@/services/realApi";
import { DataTable, StatusIndicator } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';
import type { TableColumn, TableAction, FilterConfig } from '@/components/ui';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  assigned_therapist_id?: string;
  insurance_company?: string;
  total_sessions?: number;
  remaining_sessions?: number;
  last_appointment?: string;
  registration_date?: string;
  therapy_type?: string;
  city?: string;
  urgency?: string;
}

const AllClients: React.FC = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (clientsResponse.success && clientsResponse.data) {
          // Ensure the data matches our Client interface
          const clientsData = Array.isArray(clientsResponse.data) 
            ? clientsResponse.data 
            : (clientsResponse.data as any).clients || [];
          setClients(clientsData);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Table columns configuration
  const columns: TableColumn<Client>[] = [
    {
      key: 'first_name',
      title: 'Client',
      sortable: true,
      searchable: true,
      render: (_, client) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {client.first_name?.[0]}{client.last_name?.[0]}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {client.first_name} {client.last_name}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              {client.email}
            </div>
            {client.phone && (
              <div className="text-sm text-gray-500 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                {client.phone}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (_, client) => (
        <StatusIndicator
          type="client"
          status={client.status}
          size="sm"
        />
      )
    },
    {
      key: 'assigned_therapist_id',
      title: 'Therapist',
      sortable: true,
      render: (_, client) => {
        const therapist = therapists.find(t => t.id === client.assigned_therapist_id);
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {therapist ? `${therapist.first_name} ${therapist.last_name}` : 'Unassigned'}
            </div>
            <div className="text-gray-500">{client.therapy_type || 'Not specified'}</div>
          </div>
        );
      }
    },
    {
      key: 'insurance_company',
      title: 'Insurance',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm text-gray-900">{value || 'N/A'}</span>
      )
    },
    {
      key: 'total_sessions',
      title: 'Sessions',
      sortable: true,
      width: '100px',
      className: 'text-center',
      render: (_, client) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{client.total_sessions || 0}</div>
          <div className="text-gray-500">{client.remaining_sessions || 0} left</div>
        </div>
      )
    },
    {
      key: 'last_appointment',
      title: 'Last Appointment',
      sortable: true,
      width: '140px',
      render: (value) => value ? (
        <div className="flex items-center text-sm text-gray-900">
          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : (
        <span className="text-sm text-gray-500">No appointments</span>
      )
    },
    {
      key: 'registration_date',
      title: 'Registered',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  // Table actions
  const actions: TableAction<Client>[] = [
    {
      key: 'view',
      label: 'View Profile',
      icon: EyeIcon,
      onClick: (client) => {
        console.log('View client:', client.id);
      },
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Edit Client',
      icon: PencilIcon,
      onClick: (client) => {
        console.log('Edit client:', client.id);
      },
      variant: 'secondary'
    },
    {
      key: 'contact',
      label: 'Send Message',
      icon: EnvelopeIcon,
      onClick: (client) => {
        console.log('Contact client:', client.id);
      },
      variant: 'secondary'
    }
  ];

  // Filter configuration
  const filterConfig: FilterConfig[] = [
    {
      key: 'status',
      label: 'Client Status',
      type: 'status',
      statusType: 'client',
      icon: UsersIcon
    },
    {
      key: 'assigned_therapist_id',
      label: 'Assigned Therapist',
      type: 'select',
      icon: UsersIcon,
      options: [
        { value: '', label: 'Unassigned', count: clients.filter(c => !c.assigned_therapist_id).length },
        ...therapists.map(t => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`,
          count: clients.filter(c => c.assigned_therapist_id === t.id).length
        }))
      ]
    },
    {
      key: 'insurance_company',
      label: 'Insurance Company',
      type: 'multiselect',
      options: Array.from(new Set(clients.map(c => c.insurance_company).filter(Boolean))).map(company => ({
        value: company!,
        label: company!,
        count: clients.filter(c => c.insurance_company === company).length
      }))
    },
    {
      key: 'therapy_type',
      label: 'Therapy Type',
      type: 'multiselect',
      options: Array.from(new Set(clients.map(c => c.therapy_type).filter(Boolean))).map(type => ({
        value: type!,
        label: type!,
        count: clients.filter(c => c.therapy_type === type).length
      }))
    },
    {
      key: 'registration_date',
      label: 'Registration Date',
      type: 'date-range',
      icon: CalendarIcon
    }
  ];

  // Custom filter functions
  const customFilters = {
    assigned_therapist_id: (client: Client, value: string) => {
      if (value === '') return !client.assigned_therapist_id;
      return client.assigned_therapist_id === value;
    },
    insurance_company: (client: Client, values: string[]) => {
      return values.includes(client.insurance_company || '');
    },
    therapy_type: (client: Client, values: string[]) => {
      return values.includes(client.therapy_type || '');
    },
    registration_date: (client: Client, range: { start: string; end: string }) => {
      if (!range.start && !range.end) return true;
      if (!client.registration_date) return false;
      const clientDate = new Date(client.registration_date);
      const startDate = range.start ? new Date(range.start) : new Date(0);
      const endDate = range.end ? new Date(range.end) : new Date();
      return clientDate >= startDate && clientDate <= endDate;
    }
  };

  // Handle bulk actions
  const handleBulkExport = () => {
    if (selectedClients.length === 0) return;
    console.log('Export clients:', selectedClients.map(c => c.id));
  };

  const handleBulkAssign = () => {
    if (selectedClients.length === 0) return;
    console.log('Bulk assign clients:', selectedClients.map(c => c.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Client Management</h1>
            <p className="text-blue-100 mt-1">
              Manage all clients with comprehensive search and filtering
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedClients.length > 0 && (
              <>
                <button
                  onClick={handleBulkExport}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Export ({selectedClients.length})</span>
                </button>
                <button
                  onClick={handleBulkAssign}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <UsersIcon className="h-4 w-4" />
                  <span>Assign</span>
                </button>
              </>
            )}
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <UserPlusIcon className="h-4 w-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.filter(c => c.status === 'new').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clients.filter(c => !c.assigned_therapist_id).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced data table */}
      <DataTable
        data={clients}
        columns={columns}
        actions={actions}
        searchConfig={{
          placeholder: "Search clients by name, email, or phone...",
          searchFields: ['first_name', 'last_name', 'email', 'phone'],
          filters: filterConfig,
          customFilters
        }}
        pagination={{
          pageSize: 25,
          showPagination: true,
          showPageSizeOptions: true
        }}
        sorting={{
          defaultSort: 'registration_date',
          defaultDirection: 'desc'
        }}
        selection={{
          enabled: true,
          onSelectionChange: setSelectedClients
        }}
        emptyState={{
          title: 'No clients found',
          description: 'Get started by adding your first client or adjust your search criteria.',
          action: (
            <button className="btn-primary flex items-center space-x-2">
              <UserPlusIcon className="h-4 w-4" />
              <span>Add First Client</span>
            </button>
          )
        }}
        className="bg-white rounded-lg shadow-sm"
      />
    </div>
  );
};

export default AllClients;