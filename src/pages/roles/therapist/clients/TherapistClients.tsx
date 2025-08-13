import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useClients } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumListItem } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  status: 'active' | 'inactive' | 'waiting' | 'completed';
  last_session?: string;
  next_appointment?: string;
  sessions_completed: number;
  total_sessions: number;
  diagnosis?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  notes?: string;
}

const TherapistClients: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { getAll: getClients, isLoading } = useClients();
  const { success, info, warning } = useAlert();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'last_session' | 'next_appointment' | 'priority'>('name');
  const [showAddClient, setShowAddClient] = useState(false);

  // Mock client data with realistic information
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Maria Jansen',
      email: 'maria.jansen@email.com',
      phone: '+31 6 12345678',
      date_of_birth: '1985-03-15',
      status: 'active',
      last_session: '2024-07-30',
      next_appointment: '2024-08-02T14:00:00',
      sessions_completed: 8,
      total_sessions: 12,
      diagnosis: 'Anxiety Disorder',
      priority: 'normal',
      notes: 'Making good progress with CBT techniques'
    },
    {
      id: '2',
      name: 'Peter de Vries',
      email: 'peter.devries@email.com',
      phone: '+31 6 87654321',
      date_of_birth: '1978-11-22',
      status: 'active',
      last_session: '2024-07-28',
      next_appointment: '2024-08-05T10:30:00',
      sessions_completed: 15,
      total_sessions: 20,
      diagnosis: 'Depression, PTSD',
      priority: 'high',
      notes: 'Requires careful monitoring, trauma-focused therapy'
    },
    {
      id: '3',
      name: 'Lisa van Berg',
      email: 'lisa.vanberg@email.com',
      phone: '+31 6 11223344',
      date_of_birth: '1992-07-08',
      status: 'active',
      last_session: '2024-07-31',
      next_appointment: '2024-08-03T16:00:00',
      sessions_completed: 3,
      total_sessions: 10,
      diagnosis: 'Social Anxiety',
      priority: 'normal',
      notes: 'New client, building therapeutic rapport'
    },
    {
      id: '4',
      name: 'Jan Bakker',
      email: 'jan.bakker@email.com',
      phone: '+31 6 55667788',
      date_of_birth: '1970-12-03',
      status: 'completed',
      last_session: '2024-07-25',
      sessions_completed: 16,
      total_sessions: 16,
      diagnosis: 'Burnout Recovery',
      priority: 'low',
      notes: 'Successfully completed treatment program'
    },
    {
      id: '5',
      name: 'Sophie Hendricks',
      email: 'sophie.hendricks@email.com',
      phone: '+31 6 99887766',
      date_of_birth: '1995-05-18',
      status: 'waiting',
      sessions_completed: 0,
      total_sessions: 0,
      diagnosis: 'Initial Assessment Pending',
      priority: 'urgent',
      notes: 'Urgent referral from GP, needs immediate attention'
    }
  ];

  // Load clients data
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        if (Array.isArray(data) && data.length > 0) {
          // Map API data to client format
          const mappedClients = data.map(client => ({
            id: client.id || client.client_id,
            name: client.name || client.first_name + ' ' + client.last_name,
            email: client.email,
            phone: client.phone,
            date_of_birth: client.date_of_birth,
            status: client.status || 'active',
            last_session: client.last_session_date,
            next_appointment: client.next_appointment_date,
            sessions_completed: client.sessions_completed || 0,
            total_sessions: client.total_sessions || 10,
            diagnosis: client.diagnosis,
            priority: client.priority || 'normal',
            notes: client.notes
          }));
          setClients(mappedClients);
        } else {
          setClients(mockClients);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
        setClients(mockClients);
      }
    };

    loadClients();
  }, []); // Remove getClients dependency to prevent infinite loop

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (client.diagnosis && client.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || client.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'last_session':
          return new Date(b.last_session || 0).getTime() - new Date(a.last_session || 0).getTime();
        case 'next_appointment':
          return new Date(a.next_appointment || '9999-12-31').getTime() - new Date(b.next_appointment || '9999-12-31').getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Handle client actions
  const handleClientAction = (clientId: string, action: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      switch (action) {
        case 'view':
          info(`Viewing details for ${client.name}`);
          break;
        case 'message':
          info(`Opening message thread with ${client.name}`);
          break;
        case 'schedule':
          success(`Opening scheduler for ${client.name}`);
          break;
        case 'notes':
          info(`Opening session notes for ${client.name}`);
          break;
        case 'call':
          info(`Calling ${client.name} at ${client.phone}`);
          break;
        case 'email':
          info(`Sending email to ${client.email}`);
          break;
      }
    }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <UsersIcon className="w-8 h-8 mr-3" />
              My Clients
            </h1>
            <p className="text-green-100 mt-1">
              Manage your client relationships and track therapy progress
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={PlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowAddClient(true)}
            >
              Add Client
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <PremiumCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Active Clients</p>
              <p className="text-2xl font-bold text-blue-900">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-600 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-900">
                {clients.filter(c => c.priority === 'urgent' || c.priority === 'high').length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">This Week</p>
              <p className="text-2xl font-bold text-green-900">
                {clients.filter(c => 
                  c.next_appointment && 
                  new Date(c.next_appointment) >= new Date() && 
                  new Date(c.next_appointment) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Completed</p>
              <p className="text-2xl font-bold text-purple-900">
                {clients.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters and Search */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="name">Name</option>
              <option value="last_session">Last Session</option>
              <option value="next_appointment">Next Appointment</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Clients List */}
      <PremiumCard>
        {filteredAndSortedClients.length === 0 ? (
          <PremiumEmptyState
            icon={UsersIcon}
            title="No Clients Found"
            description="No clients match your current filters or search criteria."
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAndSortedClients.map((client) => (
              <PremiumListItem
                key={client.id}
                avatar={{ 
                  initials: client.name.split(' ').map(n => n[0]).join(''), 
                  color: 'bg-green-500' 
                }}
                priority={client.priority as any}
                status={{ 
                  status: client.status, 
                  type: client.status === 'active' ? 'active' : 
                        client.status === 'completed' ? 'paid' : 
                        client.status === 'waiting' ? 'pending' : 'discontinued' 
                }}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <PremiumButton
                      size="sm"
                      variant="primary"
                      icon={EyeIcon}
                      onClick={() => handleClientAction(client.id, 'view')}
                    >
                      View
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      icon={ChatBubbleLeftRightIcon}
                      onClick={() => handleClientAction(client.id, 'message')}
                    >
                      Message
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      icon={CalendarIcon}
                      onClick={() => handleClientAction(client.id, 'schedule')}
                    >
                      Schedule
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      icon={DocumentTextIcon}
                      onClick={() => handleClientAction(client.id, 'notes')}
                    >
                      Notes
                    </PremiumButton>
                  </div>
                }
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      {client.phone && (
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {client.sessions_completed}/{client.total_sessions || 'Unlimited'} sessions
                      </div>
                      <div className="text-xs text-gray-500">
                        {client.total_sessions && 
                          `${Math.round((client.sessions_completed / client.total_sessions) * 100)}% complete`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {client.diagnosis && (
                    <div className="mt-2 flex items-center space-x-2">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{client.diagnosis}</span>
                    </div>
                  )}
                  
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {client.last_session && (
                      <span>Last session: {new Date(client.last_session).toLocaleDateString()}</span>
                    )}
                    {client.next_appointment && (
                      <span>Next: {new Date(client.next_appointment).toLocaleDateString()} at {new Date(client.next_appointment).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(client.priority)}`}>
                      {client.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  {client.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <strong>Notes:</strong> {client.notes}
                    </div>
                  )}
                </div>
              </PremiumListItem>
            ))}
          </div>
        )}
      </PremiumCard>

      {/* Add Client Modal (placeholder) */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
            <p className="text-gray-600 mb-4">
              This feature would integrate with the client management system to add new clients.
            </p>
            <div className="flex space-x-3">
              <PremiumButton 
                variant="primary" 
                onClick={() => {
                  setShowAddClient(false);
                  info('Add client feature requires backend API endpoint');
                }}
              >
                Save
              </PremiumButton>
              <PremiumButton 
                variant="outline" 
                onClick={() => setShowAddClient(false)}
              >
                Cancel
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistClients;