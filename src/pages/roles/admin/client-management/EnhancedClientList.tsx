import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import DataTable from '@/components/table/DataTable';
import { StatusIndicator } from '@/components/ui';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { TableColumn, TableAction } from '@/components/table/DataTable';
import type { FilterConfig } from '@/components/search/SearchFilter';

// Client interface
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: 'new' | 'viewed' | 'scheduled' | 'starting' | 'active' | 'discontinued' | 'completed' | 'archived';
  therapistId?: string;
  therapistName?: string;
  registrationDate: string;
  lastAppointment?: string;
  nextAppointment?: string;
  totalSessions: number;
  therapyType: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  notes?: string;
  city?: string;
  insuranceProvider?: string;
  isMinor: boolean;
}

const EnhancedClientList: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (clientsResponse.success && clientsResponse.data) {
          // Transform API data to match our interface
          const transformedClients = clientsResponse.data.map((client: any) => ({
            id: client.id,
            firstName: client.first_name || client.firstName || '',
            lastName: client.last_name || client.lastName || '',
            email: client.email || '',
            phone: client.phone || '',
            dateOfBirth: client.date_of_birth || client.dateOfBirth || '',
            status: client.status || 'new',
            therapistId: client.therapist_id || client.therapistId,
            therapistName: client.therapist_name || client.therapistName || 'Unassigned',
            registrationDate: client.registration_date || client.registrationDate || new Date().toISOString(),
            lastAppointment: client.last_appointment || client.lastAppointment,
            nextAppointment: client.next_appointment || client.nextAppointment,
            totalSessions: client.total_sessions || client.totalSessions || 0,
            therapyType: client.therapy_type || client.therapyType || 'General',
            urgency: client.urgency || client.priority || 'normal',
            notes: client.notes || '',
            city: client.city || '',
            insuranceProvider: client.insurance_provider || client.insuranceProvider || '',
            isMinor: client.is_minor || client.isMinor || false
          }));
          setClients(transformedClients);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Table columns configuration
  const columns: TableColumn<Client>[] = [
    {
      key: 'firstName',
      title: 'Name',
      sortable: true,
      searchable: true,
      render: (_, client) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {client.firstName} {client.lastName}
              {client.isMinor && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Minor
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{client.email}</div>
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
      key: 'therapistName',
      title: 'Therapist',
      sortable: true,
      render: (_, client) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {client.therapistName || 'Unassigned'}
          </div>
          <div className="text-gray-500">{client.therapyType}</div>
        </div>
      )
    },
    {
      key: 'urgency',
      title: 'Priority',
      sortable: true,
      width: '100px',
      render: (_, client) => (
        <StatusIndicator
          type="priority"
          status={client.urgency}
          size="sm"
        />
      )
    },
    {
      key: 'totalSessions',
      title: 'Sessions',
      sortable: true,
      width: '80px',
      className: 'text-center',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value || 0}</span>
      )
    },
    {
      key: 'nextAppointment',
      title: 'Next Appointment',
      sortable: true,
      width: '140px',
      render: (value) => value ? (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-500">Not scheduled</span>
      )
    },
    {
      key: 'registrationDate',
      title: 'Registered',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
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
        // Navigate to client profile
      },
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Edit Client',
      icon: PencilIcon,
      onClick: (client) => {
        // Navigate to edit form
      },
      variant: 'secondary'
    },
    {
      key: 'contact',
      label: 'Send Message',
      icon: EnvelopeIcon,
      onClick: (client) => {
        // Open messaging modal
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
      icon: UserIcon
    },
    {
      key: 'urgency',
      label: 'Priority Level',
      type: 'status',
      statusType: 'priority',
      icon: CalendarIcon
    },
    {
      key: 'therapistId',
      label: 'Assigned Therapist',
      type: 'select',
      icon: UserIcon,
      options: [
        { value: '', label: 'Unassigned', count: clients.filter(c => !c.therapistId).length },
        ...therapists.map(t => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`,
          count: clients.filter(c => c.therapistId === t.id).length
        }))
      ]
    },
    {
      key: 'therapyType',
      label: 'Therapy Type',
      type: 'multiselect',
      options: Array.from(new Set(clients.map(c => c.therapyType))).map(type => ({
        value: type,
        label: type,
        count: clients.filter(c => c.therapyType === type).length
      }))
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      type: 'date-range',
      icon: CalendarIcon
    },
    {
      key: 'isMinor',
      label: 'Minor Clients Only',
      type: 'toggle'
    }
  ];

  // Custom filter functions
  const customFilters = {
    therapistId: (client: Client, value: string) => {
      if (value === '') return !client.therapistId; // Unassigned
      return client.therapistId === value;
    },
    therapyType: (client: Client, values: string[]) => {
      return values.includes(client.therapyType);
    },
    registrationDate: (client: Client, range: { start: string; end: string }) => {
      if (!range.start && !range.end) return true;
      const clientDate = new Date(client.registrationDate);
      const startDate = range.start ? new Date(range.start) : new Date(0);
      const endDate = range.end ? new Date(range.end) : new Date();
      return clientDate >= startDate && clientDate <= endDate;
    },
    isMinor: (client: Client, value: boolean) => {
      return !value || client.isMinor;
    }
  };

  // Handle bulk actions
  const handleBulkExport = () => {
    if (selectedClients.length === 0) return;
  };

  const handleBulkAssign = () => {
    if (selectedClients.length === 0) return;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-primary">Client Management</h1>
          <p className="text-body-sm text-gray-600 mt-1">
            Manage all clients with comprehensive search and filtering capabilities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedClients.length > 0 && (
            <>
              <button
                onClick={handleBulkExport}
                className="btn-secondary flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export ({selectedClients.length})</span>
              </button>
              <button
                onClick={handleBulkAssign}
                className="btn-secondary flex items-center space-x-2"
              >
                <UserIcon className="h-4 w-4" />
                <span>Assign Therapist</span>
              </button>
            </>
          )}
          <button className="btn-primary flex items-center space-x-2">
            <UserPlusIcon className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Enhanced data table */}
      <DataTable
        data={clients}
        columns={columns}
        actions={actions}
        searchConfig={{
          placeholder: "Search clients by name, email, or phone...",
          searchFields: ['firstName', 'lastName', 'email', 'phone'],
          filters: filterConfig,
          customFilters
        }}
        pagination={{
          pageSize: 25,
          showPagination: true,
          showPageSizeOptions: true
        }}
        sorting={{
          defaultSort: 'registrationDate',
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

      {/* Summary statistics */}
      {clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-compact">
            <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
          <div className="card-compact">
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Clients</div>
          </div>
          <div className="card-compact">
            <div className="text-2xl font-bold text-orange-600">
              {clients.filter(c => !c.therapistId).length}
            </div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </div>
          <div className="card-compact">
            <div className="text-2xl font-bold text-red-600">
              {clients.filter(c => ['high', 'urgent', 'critical'].includes(c.urgency)).length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedClientList;