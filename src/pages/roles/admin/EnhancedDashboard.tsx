import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { 
  useDashboard, 
  useWaitingList, 
  useClients, 
  useTherapists,
  useAppointments,
  useInvoices
} from '@/hooks/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Dashboard card component for reusability
interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  iconColor: string;
  isLoading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline justify-between">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="small" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {change && (
                  <div className={`flex items-center text-sm font-medium ${
                    changeType === 'positive' ? 'text-green-600' : 
                    changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {changeType === 'positive' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                    {changeType === 'negative' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                    {change}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Priority indicator component
const PriorityIndicator: React.FC<{ priority: string }> = ({ priority }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border border-red-200',
    high: 'bg-orange-100 text-orange-800 border border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    low: 'bg-green-100 text-green-800 border border-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors] || colors.medium}`}>
      {priority}
    </span>
  );
};

const EnhancedAdminDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // API hooks - use admin-specific dashboard API
  const { getStats, getFinancialOverview, isLoading: statsLoading } = useDashboard();
  const { getAll: getWaitingList, isLoading: waitingListLoading } = useWaitingList();
  const { getAll: getClients, isLoading: clientsLoading } = useClients();
  const { getAll: getTherapists, isLoading: therapistsLoading } = useTherapists();
  const { getAll: getAppointments, isLoading: appointmentsLoading } = useAppointments();
  const { getAll: getInvoices, isLoading: invoicesLoading } = useInvoices();

  // State management
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load data from real API endpoints in parallel
        const [statsData, financialData, waitingListData, clientsData, therapistsData, appointmentsData, invoicesData] = await Promise.all([
          getStats().catch(() => null),
          getFinancialOverview().catch(() => null),
          getWaitingList().catch(() => []),
          getClients().catch(() => []),
          getTherapists().catch(() => []),
          getAppointments().catch(() => []),
          getInvoices().catch(() => [])
        ]);

        // Combine stats and financial data safely
        const combinedStats = {
          ...(statsData && typeof statsData === 'object' ? statsData : {}),
          ...(financialData && typeof financialData === 'object' ? financialData : {}),
          // Set defaults if API data is missing
          activeClients: (statsData as any)?.activeClients ?? (Array.isArray(clientsData) ? clientsData.length : 0),
          totalSessions: (statsData as any)?.totalSessions ?? 0,
          monthlyRevenue: (financialData as any)?.monthlyRevenue ?? (statsData as any)?.monthlyRevenue ?? 0,
          waitingListCount: (statsData as any)?.waitingListCount ?? (Array.isArray(waitingListData) ? waitingListData.length : 0),
          therapistCount: (statsData as any)?.therapistCount ?? (Array.isArray(therapistsData) ? therapistsData.length : 0),
          upcomingAppointments: (statsData as any)?.upcomingAppointments ?? (Array.isArray(appointmentsData) ? appointmentsData.filter((apt: any) => apt.status === 'scheduled').length : 0)
        };

        setDashboardStats(combinedStats);
        setWaitingList(Array.isArray(waitingListData) ? waitingListData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setTherapists(Array.isArray(therapistsData) ? therapistsData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set empty states on error
        setDashboardStats({
          activeClients: 0,
          totalSessions: 0,
          monthlyRevenue: 0,
          waitingListCount: 0,
          therapistCount: 0,
          upcomingAppointments: 0
        });
        setWaitingList([]);
        setClients([]);
        setTherapists([]);
        setAppointments([]);
        setInvoices([]);
      }
    };

    loadDashboardData();
  }, [getStats, getFinancialOverview, getWaitingList, getClients, getTherapists, getAppointments, getInvoices]);

  // Calculate derived stats
  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );
  
  const urgentWaitingList = waitingList.filter(item => 
    item.urgency === 'critical' || item.urgency === 'high'
  );

  const unpaidInvoices = invoices.filter(inv => 
    inv.status === 'sent' || inv.status === 'overdue'
  );

  const activeTherapists = therapists.filter(t => t.status === 'active');

  // Recent activity simulation
  const recentActivity = [
    {
      id: 1,
      type: 'new_application',
      message: 'New waiting list application: Emma Williams',
      time: '5 minutes ago',
      icon: UserPlusIcon,
      color: 'text-blue-600',
      priority: 'high'
    },
    {
      id: 2,
      type: 'appointment_completed',
      message: 'Appointment completed: Maria van der Berg with Sarah Johnson',
      time: '1 hour ago',
      icon: CalendarIcon,
      color: 'text-green-600',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'invoice_overdue',
      message: 'Invoice overdue: Michael Davis - €344.85',
      time: '2 hours ago',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      priority: 'high'
    },
    {
      id: 4,
      type: 'therapist_vacation',
      message: 'Peter de Vries marked as on vacation',
      time: '1 day ago',
      icon: ClockIcon,
      color: 'text-orange-600',
      priority: 'normal'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('dashboard.welcome')}, {getDisplayName()}
            </h1>
            <p className="text-blue-100 mt-1">
              Practice Overview • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-blue-100">Role</p>
              <p className="text-lg font-semibold">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Clients"
          value={dashboardStats?.activeClients ?? clients.length}
          change="+12%"
          changeType="positive"
          icon={UsersIcon}
          iconColor="bg-blue-500"
          isLoading={statsLoading || clientsLoading}
        />
        <DashboardCard
          title="Active Therapists"
          value={dashboardStats?.therapistCount ?? activeTherapists.length}
          change={therapists.filter(t => t.status === 'vacation').length > 0 ? '-1' : '0'}
          changeType={therapists.filter(t => t.status === 'vacation').length > 0 ? 'negative' : 'neutral'}
          icon={UsersIcon}
          iconColor="bg-green-500"
          isLoading={statsLoading || therapistsLoading}
        />
        <DashboardCard
          title="Today's Appointments"
          value={dashboardStats?.upcomingAppointments ?? todayAppointments.length}
          change="+3"
          changeType="positive"
          icon={CalendarIcon}
          iconColor="bg-purple-500"
          isLoading={statsLoading || appointmentsLoading}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={`€${(dashboardStats?.monthlyRevenue ?? 0).toLocaleString()}`}
          change={unpaidInvoices.filter(inv => inv.status === 'overdue').length > 0 ? '+15%' : '0%'}
          changeType={unpaidInvoices.filter(inv => inv.status === 'overdue').length > 0 ? 'negative' : 'positive'}
          icon={CurrencyDollarIcon}
          iconColor="bg-orange-500"
          isLoading={statsLoading || invoicesLoading}
        />
      </div>

      {/* Priority Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-900">Priority Actions:</span>
          </div>
          {urgentWaitingList.length > 0 && (
            <button className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition-colors">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{urgentWaitingList.length} Urgent Applications</span>
            </button>
          )}
          {unpaidInvoices.filter(inv => inv.status === 'overdue').length > 0 && (
            <button className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg transition-colors">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{unpaidInvoices.filter(inv => inv.status === 'overdue').length} Overdue Invoices</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                    <PriorityIndicator priority={activity.priority} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Waiting List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-orange-600" />
              Waiting List Applications
              {waitingList.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                  {waitingList.length}
                </span>
              )}
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          
          {waitingListLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : waitingList.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications in waiting list</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingList.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{item.client_name}</p>
                      <StatusIndicator 
                        type="priority" 
                        status={item.urgency || 'normal'} 
                        size="sm"
                        showText={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{item.email}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {new Date(item.registration_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{item.therapy_type}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <StatusIndicator 
                      type="waiting_list" 
                      status={item.status || 'new'} 
                      size="sm"
                    />
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2 text-green-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <UserPlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add New Client</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Add Therapist</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Schedule Appointment</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-orange-100 group-hover:bg-orange-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">View Reports</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;