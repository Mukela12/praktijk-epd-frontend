import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Client } from '@/types/entities';
import { formatDate } from '@/utils/dateFormatters';

// Client status badge component
const ClientStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Active'
    },
    inactive: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: 'Inactive'
    },
    'on-hold': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'On Hold'
    },
    completed: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Completed'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Progress indicator component
const ProgressIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  const getColor = () => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{progress}%</span>
    </div>
  );
};

// Client card component
interface ClientCardProps {
  client: Client;
  onSelect: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onSelect }) => {
  const sessionCount = 0; // TODO: Get from API
  const lastSessionDate = null; // TODO: Get from API
  const daysSinceLastSession = null; // TODO: Calculate when lastSessionDate is available

  return (
    <div 
      onClick={onSelect}
      className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-green-600/20 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {client.first_name} {client.last_name}
            </h3>
            <p className="text-sm text-gray-600">{client.email}</p>
          </div>
        </div>
        <ClientStatusBadge status={client.status} />
      </div>

      <div className="space-y-3">
        {/* Therapy Goals */}
        {/* TODO: Add therapy goals when available in API */}

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {sessionCount} sessions
            </span>
          </div>
          
          {lastSessionDate && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {daysSinceLastSession === 0 ? 'Today' : 
                 daysSinceLastSession === 1 ? 'Yesterday' :
                 `${daysSinceLastSession} days ago`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {/* TODO: Add progress tracking when available in API */}
      </div>

      <button className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-green-600/5 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 group">
        View Details
        <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

// Stats overview component
const StatsOverview: React.FC<{ clients: Client[] }> = ({ clients }) => {
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalSessions = 0; // TODO: Calculate from API data
  const avgProgress = 0; // TODO: Calculate from API data

  const stats = [
    {
      label: 'Total Clients',
      value: clients.length,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Clients',
      value: activeClients,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Total Sessions',
      value: totalSessions,
      icon: ClockIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Avg. Progress',
      value: `${Math.round(avgProgress)}%`,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

const ProfessionalTherapistClients: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, filterStatus, clients]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getClients();
      
      if (response.success) {
        setClients((response.data || []) as unknown as Client[]);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 500) {
        // Backend routing issue
        setError('Server error. Please try again later.');
        setClients([]);
      } else if (error?.response?.status === 404) {
        // No clients found
        setClients([]);
        setError(null);
      } else if (error?.response?.status === 403) {
        setError('You do not have permission to view clients.');
      } else {
        setError('Failed to load clients. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }

    setFilteredClients(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading clients..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Clients</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadClients}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
            <p className="text-gray-600 mt-1">Manage and track your client sessions</p>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview clients={clients} />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button
                onClick={loadClients}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onSelect={() => navigate(`/therapist/clients/${client.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserGroupIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm || filterStatus !== 'all' ? 'No clients found' : 'No Clients Assigned Yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t been assigned any clients yet. The administrator will assign clients to you based on your specializations and availability. You will receive a notification when a client is assigned to you.'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <ExclamationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">How Client Assignment Works</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Clients request appointments through the platform</li>
                        <li>• The administrator reviews their needs and preferences</li>
                        <li>• You\'ll be matched based on your specializations</li>
                        <li>• Both you and the client receive notifications when assigned</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/therapist/profile')}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Update Your Profile
                  </button>
                  <button
                    onClick={() => navigate('/therapist/availability')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Set Your Availability
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistClients;