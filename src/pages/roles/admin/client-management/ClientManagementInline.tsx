import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDate } from '@/utils/dateFormatters';

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_status: 'active' | 'inactive' | 'pending';
  client_status: 'active' | 'new' | 'inactive';
  date_of_birth?: string;
  gender?: string;
  insurance_company?: string;
  insurance_number?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  therapy_goals?: string;
  intake_completed: boolean;
  intake_date?: string;
  assigned_therapist_id?: string;
  therapist_first_name?: string;
  therapist_last_name?: string;
  total_appointments?: string;
  completed_appointments?: string;
  created_at: string;
  updated_at: string;
}

interface Therapist {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  specializations: string[];
}

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const ClientManagementInline: React.FC = () => {
  const { success, error: errorAlert, warning, info } = useAlert();
  
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTherapist, setFilterTherapist] = useState<string>('all');
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    insurance_company: '',
    insurance_number: '',
    street_address: '',
    postal_code: '',
    city: '',
    country: 'Netherlands',
    therapy_goals: '',
    assigned_therapist_id: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsRes, therapistsRes] = await Promise.all([
        realApiService.admin.getClients(),
        realApiService.admin.getTherapists()
      ]);
      
      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data.clients || []);
      }
      
      if (therapistsRes.success && therapistsRes.data) {
        setTherapists(therapistsRes.data.therapists || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      errorAlert('Failed to load clients data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create new client
  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        warning('Please fill in all required fields');
        return;
      }

      const response = await realApiService.admin.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.first_name,
        lastName: formData.last_name,
        role: 'client',
        phone: formData.phone || undefined
      });

      if (response.success) {
        success('Client created successfully');
        setViewMode('list');
        resetForm();
        loadData();
      }
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to create client');
    }
  };

  // Update client
  const handleUpdate = async () => {
    if (!selectedClient) return;

    try {
      const updates = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        insurance_company: formData.insurance_company,
        insurance_number: formData.insurance_number,
        street_address: formData.street_address,
        postal_code: formData.postal_code,
        city: formData.city,
        country: formData.country,
        therapy_goals: formData.therapy_goals,
        assigned_therapist_id: formData.assigned_therapist_id || null
      };

      const response = await realApiService.admin.updateUser(selectedClient.id, updates);

      if (response.success) {
        success('Client updated successfully');
        setViewMode('list');
        setSelectedClient(null);
        resetForm();
        loadData();
      }
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to update client');
    }
  };

  // Delete client
  const handleDelete = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: Backend might not have delete endpoint, showing as example
      info('Delete functionality needs to be implemented in the backend');
      // await realApiService.admin.deleteClient(clientId);
      // success('Client deleted successfully');
      // loadData();
    } catch (error: any) {
      errorAlert('Failed to delete client');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      insurance_company: '',
      insurance_number: '',
      street_address: '',
      postal_code: '',
      city: '',
      country: 'Netherlands',
      therapy_goals: '',
      assigned_therapist_id: ''
    });
  };

  // Edit client
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      email: client.email,
      password: '', // Don't populate password
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone || '',
      date_of_birth: client.date_of_birth || '',
      gender: client.gender || '',
      insurance_company: client.insurance_company || '',
      insurance_number: client.insurance_number || '',
      street_address: client.street_address || '',
      postal_code: client.postal_code || '',
      city: client.city || '',
      country: client.country || 'Netherlands',
      therapy_goals: client.therapy_goals || '',
      assigned_therapist_id: client.assigned_therapist_id || ''
    });
    setViewMode('edit');
  };

  // View client details
  const handleView = (client: Client) => {
    setSelectedClient(client);
    setViewMode('view');
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || client.client_status === filterStatus;
    const matchesTherapist = filterTherapist === 'all' || 
      (filterTherapist === 'unassigned' ? !client.assigned_therapist_id : client.assigned_therapist_id === filterTherapist);
    
    return matchesSearch && matchesStatus && matchesTherapist;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewMode !== 'list' && (
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedClient(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <UsersIcon className="w-8 h-8 mr-3" />
                {viewMode === 'list' ? 'Client Management' : 
                 viewMode === 'create' ? 'Add New Client' :
                 viewMode === 'edit' ? 'Edit Client' : 'Client Details'}
              </h1>
              <p className="text-blue-100 mt-1">
                {viewMode === 'list' ? `${clients.length} total clients` : 
                 viewMode === 'create' ? 'Create a new client account' :
                 viewMode === 'edit' ? 'Update client information' : 'View client information'}
              </p>
            </div>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setViewMode('create');
                resetForm();
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Client</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterTherapist}
                onChange={(e) => setFilterTherapist(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Therapists</option>
                <option value="unassigned">Unassigned</option>
                {therapists.map(therapist => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.first_name} {therapist.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.client_status === 'active').length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.client_status === 'new').length}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => !c.assigned_therapist_id).length}
                  </p>
                </div>
                <UserGroupIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Clients List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' || filterTherapist !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first client'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            type="client"
                            status={client.client_status}
                            size="sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {client.therapist_first_name && client.therapist_last_name
                              ? `${client.therapist_first_name} ${client.therapist_last_name}`
                              : 'Unassigned'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {client.phone && (
                              <a href={`tel:${client.phone}`} className="text-gray-500 hover:text-gray-700">
                                <PhoneIcon className="w-4 h-4" />
                              </a>
                            )}
                            <a href={`mailto:${client.email}`} className="text-gray-500 hover:text-gray-700">
                              <EnvelopeIcon className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {client.completed_appointments || 0} / {client.total_appointments || 0}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(client)}
                              className="text-gray-600 hover:text-gray-900"
                              title="View"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : viewMode === 'view' && selectedClient ? (
        // View Client Details
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Full Name</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.first_name} {selectedClient.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedClient.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.phone || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Date of Birth</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.date_of_birth ? formatDate(selectedClient.date_of_birth) : 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Gender</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.gender || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Street Address</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.street_address || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Postal Code</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.postal_code || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">City</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.city || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Country</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.country || 'Netherlands'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Insurance Company</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.insurance_company || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Insurance Number</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.insurance_number || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <StatusBadge
                        type="client"
                        status={selectedClient.client_status}
                        size="sm"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Assigned Therapist</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.therapist_first_name && selectedClient.therapist_last_name
                        ? `${selectedClient.therapist_first_name} ${selectedClient.therapist_last_name}`
                        : 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Intake Status</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.intake_completed ? (
                        <span className="text-green-600">Completed</span>
                      ) : (
                        <span className="text-orange-600">Pending</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Sessions</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.completed_appointments || 0} completed / {selectedClient.total_appointments || 0} total
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Therapy Goals</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedClient.therapy_goals || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Account Status</dt>
                    <dd>
                      <StatusBadge
                        type="general"
                        status={selectedClient.user_status}
                        size="sm"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(selectedClient.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(selectedClient.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedClient(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(selectedClient)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Client
            </button>
          </div>
        </div>
      ) : (
        // Create/Edit Form
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={viewMode === 'edit'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>
                {viewMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Treatment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
                  <input
                    type="text"
                    name="insurance_company"
                    value={formData.insurance_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                  <input
                    type="text"
                    name="insurance_number"
                    value={formData.insurance_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Therapist</label>
                  <select
                    name="assigned_therapist_id"
                    value={formData.assigned_therapist_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No therapist assigned</option>
                    {therapists.map(therapist => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.first_name} {therapist.last_name} - {therapist.specializations.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Goals</label>
                  <textarea
                    name="therapy_goals"
                    value={formData.therapy_goals}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the client's therapy goals..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedClient(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={viewMode === 'create' ? handleCreate : handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {viewMode === 'create' ? 'Create Client' : 'Update Client'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientManagementInline;