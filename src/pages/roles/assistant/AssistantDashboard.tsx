import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useDashboard, useClients, useAppointments, useInvoices } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric, PremiumListItem } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { realApiService } from '@/services/realApi';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  assigned_by: string;
  category: 'scheduling' | 'invoicing' | 'communication' | 'administration';
}

interface ClientContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  last_contact: string;
  reason: string;
  status: 'pending' | 'contacted' | 'resolved';
  priority: 'urgent' | 'high' | 'normal';
}

const AssistantDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { getStats, isLoading: statsLoading } = useDashboard();
  const { getAll: getClients, isLoading: clientsLoading } = useClients();
  const { getAll: getAppointments, isLoading: appointmentsLoading } = useAppointments();
  const { getAll: getInvoices, isLoading: invoicesLoading } = useInvoices();
  const { success, error, info } = useAlert();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'contacts' | 'scheduling'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for assistant tasks
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Follow up on missed appointments',
      description: 'Contact 3 clients who missed their appointments this week',
      priority: 'urgent',
      status: 'pending',
      due_date: '2024-08-02',
      assigned_by: 'Dr. Sarah Wilson',
      category: 'communication'
    },
    {
      id: '2',
      title: 'Process insurance claims',
      description: 'Submit insurance claims for completed sessions from last week',
      priority: 'high',
      status: 'in_progress',
      due_date: '2024-08-03',
      assigned_by: 'Admin',
      category: 'invoicing'
    },
    {
      id: '3',
      title: 'Schedule intake appointments',
      description: 'Schedule intake appointments for 5 new clients from waiting list',
      priority: 'high',
      status: 'pending',
      due_date: '2024-08-05',
      assigned_by: 'Practice Manager',
      category: 'scheduling'
    },
    {
      id: '4',
      title: 'Update client contact information',
      description: 'Verify and update contact details for clients who moved',
      priority: 'normal',
      status: 'completed',
      due_date: '2024-08-01',
      assigned_by: 'Dr. Mark Johnson',
      category: 'administration'
    }
  ];

  const mockClientContacts: ClientContact[] = [
    {
      id: '1',
      name: 'Maria Jansen',
      phone: '+31 6 12345678',
      email: 'maria.jansen@email.com',
      last_contact: '2024-07-30',
      reason: 'Missed appointment - needs rescheduling',
      status: 'pending',
      priority: 'urgent'
    },
    {
      id: '2',
      name: 'Peter de Vries',
      phone: '+31 6 87654321',
      email: 'peter.devries@email.com',
      last_contact: '2024-07-29',
      reason: 'Insurance verification required',
      status: 'contacted',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Lisa van Berg',
      phone: '+31 6 11223344',
      email: 'lisa.vanberg@email.com',
      last_contact: '2024-07-28',
      reason: 'Appointment confirmation',
      status: 'resolved',
      priority: 'normal'
    }
  ];

  // Load data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get dashboard data from real API
        const dashboardResponse = await realApiService.assistant.getDashboard();
        
        if (dashboardResponse.success && dashboardResponse.data) {
          const dashboardData = dashboardResponse.data;
          
          // Extract metrics from dashboard response
          const assistantStats = {
            totalClients: dashboardData.metrics?.totalClients || dashboardData.totalClients || 0,
            todayAppointments: dashboardData.metrics?.todayAppointments || dashboardData.todaysAppointments || 0,
            pendingTasks: dashboardData.metrics?.pendingTasks || dashboardData.pendingTasks || mockTasks.filter(task => task.status === 'pending').length,
            pendingContacts: dashboardData.metrics?.pendingContacts || dashboardData.pendingContacts || mockClientContacts.filter(contact => contact.status === 'pending').length,
            completedTasks: dashboardData.metrics?.completedTasks || dashboardData.completedTasks || mockTasks.filter(task => task.status === 'completed').length,
            upcomingAppointments: dashboardData.upcomingAppointments || [],
            recentActivity: dashboardData.recentActivity || []
          };
          
          setDashboardStats(assistantStats);
          
          // Use real tasks if available, otherwise mock data
          if (dashboardData.tasks && Array.isArray(dashboardData.tasks)) {
            setTasks(dashboardData.tasks);
          } else {
            setTasks(mockTasks);
          }
          
          // Use real client contacts if available, otherwise mock data
          if (dashboardData.clientContacts && Array.isArray(dashboardData.clientContacts)) {
            setClientContacts(dashboardData.clientContacts);
          } else {
            setClientContacts(mockClientContacts);
          }
        } else {
          // Fallback to mock data
          setDashboardStats({
            totalClients: 0,
            todayAppointments: 0,
            pendingTasks: mockTasks.filter(task => task.status === 'pending').length,
            pendingContacts: mockClientContacts.filter(contact => contact.status === 'pending').length,
            completedTasks: mockTasks.filter(task => task.status === 'completed').length
          });
          setTasks(mockTasks);
          setClientContacts(mockClientContacts);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        // Fallback to mock data on error
        setDashboardStats({
          totalClients: 0,
          todayAppointments: 0,
          pendingTasks: mockTasks.filter(task => task.status === 'pending').length,
          pendingContacts: mockClientContacts.filter(contact => contact.status === 'pending').length,
          completedTasks: mockTasks.filter(task => task.status === 'completed').length
        });
        setTasks(mockTasks);
        setClientContacts(mockClientContacts);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle task status update
  const handleTaskUpdate = (taskId: string, newStatus: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus as any } : task
      )
    );
    success(`${t('assistant.dashboard.taskMarkedAs')} ${newStatus}`);
  };

  // Handle contact status update
  const handleContactUpdate = (contactId: string, newStatus: string) => {
    setClientContacts(prev =>
      prev.map(contact =>
        contact.id === contactId ? { ...contact, status: newStatus as any } : contact
      )
    );
    success(`${t('assistant.dashboard.contactStatusUpdated')} ${newStatus}`);
  };

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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scheduling': return CalendarIcon;
      case 'invoicing': return CurrencyDollarIcon;
      case 'communication': return ChatBubbleLeftRightIcon;
      case 'administration': return ClipboardDocumentListIcon;
      default: return DocumentTextIcon;
    }
  };

  // Filter tasks and contacts
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredContacts = clientContacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ClipboardDocumentListIcon className="w-8 h-8 mr-3" />
              {t('assistant.dashboard.title')}
            </h1>
            <p className="text-yellow-100 mt-1">{t('assistant.dashboard.welcome')}</p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={PlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              New Task
            </PremiumButton>
            <PremiumButton
              variant="outline"
              icon={PhoneIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Contact Client
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title={t('assistant.dashboard.pendingTasks')}
          value={dashboardStats?.pendingTasks || 0}
          change={{ value: t('assistant.dashboard.highPriority'), type: dashboardStats?.pendingTasks > 5 ? 'negative' : 'neutral' }}
          icon={ExclamationTriangleIcon}
          iconColor="text-red-600"
          isLoading={!dashboardStats}
        />
        <PremiumMetric
          title={t('assistant.dashboard.clientContacts')}
          value={dashboardStats?.pendingContacts || 0}
          change={{ value: t('assistant.dashboard.needFollowUp'), type: 'neutral' }}
          icon={PhoneIcon}
          iconColor="text-blue-600"
          isLoading={!dashboardStats}
        />
        <PremiumMetric
          title={t('assistant.dashboard.todayAppointments')}
          value={dashboardStats?.todayAppointments || 0}
          change={{ value: t('assistant.dashboard.scheduled'), type: 'positive' }}
          icon={CalendarIcon}
          iconColor="text-green-600"
          isLoading={!dashboardStats}
        />
        <PremiumMetric
          title={t('assistant.dashboard.completedTasks')}
          value={dashboardStats?.completedTasks || 0}
          change={{ value: t('assistant.dashboard.thisWeek'), type: 'positive' }}
          icon={CheckCircleIcon}
          iconColor="text-purple-600"
          isLoading={!dashboardStats}
        />
      </div>

      {/* Tab Navigation */}
      <PremiumCard>
        <div className="flex flex-wrap items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: t('assistant.dashboard.overview'), icon: ClipboardDocumentListIcon },
            { id: 'tasks', label: t('assistant.dashboard.tasks'), icon: CheckCircleIcon },
            { id: 'contacts', label: t('assistant.dashboard.clientContacts'), icon: PhoneIcon },
            { id: 'scheduling', label: t('assistant.dashboard.scheduling'), icon: CalendarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Tasks */}
          <PremiumCard border="danger">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                Urgent Tasks
              </h3>
              <PremiumButton size="sm" variant="outline" icon={EyeIcon}>
                View All
              </PremiumButton>
            </div>
            
            <div className="space-y-3">
              {tasks.filter(task => task.priority === 'urgent').slice(0, 3).map((task) => (
                <PremiumListItem
                  key={task.id}
                  priority="urgent"
                  status={{ status: task.status, type: task.status as any }}
                  actions={
                    <div className="flex space-x-2">
                      <PremiumButton
                        size="sm"
                        variant="success"
                        icon={CheckCircleIcon}
                        onClick={() => handleTaskUpdate(task.id, 'completed')}
                      >
                        Complete
                      </PremiumButton>
                    </div>
                  }
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By: {task.assigned_by}</span>
                    </div>
                  </div>
                </PremiumListItem>
              ))}
            </div>
          </PremiumCard>

          {/* Client Contacts */}
          <PremiumCard border="primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-blue-600" />
                Priority Contacts
              </h3>
              <PremiumButton size="sm" variant="outline" icon={EyeIcon}>
                View All
              </PremiumButton>
            </div>
            
            <div className="space-y-3">
              {clientContacts.filter(contact => contact.status === 'pending').slice(0, 3).map((contact) => (
                <PremiumListItem
                  key={contact.id}
                  avatar={{ initials: contact.name.split(' ').map(n => n[0]).join(''), color: 'bg-blue-500' }}
                  priority={contact.priority as any}
                  status={{ status: contact.status, type: contact.status === 'pending' ? 'pending' : contact.status === 'resolved' ? 'paid' : 'active' }}
                  actions={
                    <div className="flex space-x-2">
                      <PremiumButton
                        size="sm"
                        variant="primary"
                        icon={PhoneIcon}
                        onClick={() => info(`Calling ${contact.name}...`)}
                      >
                        Call
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={EnvelopeIcon}
                        onClick={() => info(`Sending email to ${contact.name}...`)}
                      >
                        Email
                      </PremiumButton>
                    </div>
                  }
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last contact: {new Date(contact.last_contact).toLocaleDateString()}
                    </p>
                  </div>
                </PremiumListItem>
              ))}
            </div>
          </PremiumCard>

          {/* Quick Actions */}
          <PremiumCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: CalendarIcon, label: 'Schedule Appointment', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
                { icon: DocumentTextIcon, label: 'Create Invoice', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
                { icon: ChatBubbleLeftRightIcon, label: 'Send Message', color: 'bg-purple-100 text-purple-600 hover:bg-purple-200' },
                { icon: UserPlusIcon, label: 'Add Client', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' }
              ].map((action, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg transition-all ${action.color} group`}
                  onClick={() => info(`${action.label} feature coming soon`)}
                >
                  <action.icon className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Filters */}
          <PremiumCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <PremiumButton icon={PlusIcon} variant="primary">
                Add Task
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Tasks List */}
          <PremiumCard>
            {filteredTasks.length === 0 ? (
              <PremiumEmptyState
                icon={ClipboardDocumentListIcon}
                title="No Tasks Found"
                description="No tasks match your current filters."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setFilterStatus('all');
                    setSearchTerm('');
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  return (
                    <PremiumListItem
                      key={task.id}
                      priority={task.priority as any}
                      status={{ status: task.status, type: task.status as any }}
                      actions={
                        <div className="flex space-x-2">
                          {task.status === 'pending' && (
                            <PremiumButton
                              size="sm"
                              variant="primary"
                              onClick={() => handleTaskUpdate(task.id, 'in_progress')}
                            >
                              Start
                            </PremiumButton>
                          )}
                          {task.status === 'in_progress' && (
                            <PremiumButton
                              size="sm"
                              variant="success"
                              icon={CheckCircleIcon}
                              onClick={() => handleTaskUpdate(task.id, 'completed')}
                            >
                              Complete
                            </PremiumButton>
                          )}
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            icon={PencilIcon}
                          >
                            Edit
                          </PremiumButton>
                        </div>
                      }
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            <span>Assigned by: {task.assigned_by}</span>
                            <span className="capitalize bg-gray-100 px-2 py-1 rounded">{task.category}</span>
                            <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </PremiumListItem>
                  );
                })}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          {/* Filters */}
          <PremiumCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <PremiumButton icon={ArrowPathIcon} variant="secondary">
                Refresh
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Contacts List */}
          <PremiumCard>
            {filteredContacts.length === 0 ? (
              <PremiumEmptyState
                icon={PhoneIcon}
                title="No Contacts Found"
                description="No client contacts match your current filters."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setFilterStatus('all');
                    setSearchTerm('');
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <PremiumListItem
                    key={contact.id}
                    avatar={{ initials: contact.name.split(' ').map(n => n[0]).join(''), color: 'bg-orange-500' }}
                    priority={contact.priority as any}
                    status={{ 
                      status: contact.status, 
                      type: contact.status === 'pending' ? 'pending' : 
                           contact.status === 'resolved' ? 'paid' : 'active' 
                    }}
                    actions={
                      <div className="flex space-x-2">
                        <PremiumButton
                          size="sm"
                          variant="primary"
                          icon={PhoneIcon}
                          onClick={() => info(`Calling ${contact.name} at ${contact.phone}...`)}
                        >
                          Call
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={EnvelopeIcon}
                          onClick={() => info(`Sending email to ${contact.email}...`)}
                        >
                          Email
                        </PremiumButton>
                        {contact.status === 'pending' && (
                          <PremiumButton
                            size="sm"
                            variant="success"
                            onClick={() => handleContactUpdate(contact.id, 'resolved')}
                          >
                            Resolve
                          </PremiumButton>
                        )}
                      </div>
                    }
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.reason}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{contact.phone}</span>
                        <span>{contact.email}</span>
                        <span>Last contact: {new Date(contact.last_contact).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </PremiumListItem>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {activeTab === 'scheduling' && (
        <PremiumCard>
          <PremiumEmptyState
            icon={CalendarIcon}
            title="Scheduling Management"
            description="Advanced scheduling tools for managing appointments, availability, and client bookings."
            action={{
              label: 'Open Calendar',
              onClick: () => info('Calendar integration coming soon')
            }}
          />
        </PremiumCard>
      )}
    </div>
  );
};

export default AssistantDashboard;