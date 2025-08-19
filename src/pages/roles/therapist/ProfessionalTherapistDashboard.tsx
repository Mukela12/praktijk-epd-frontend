import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Appointment, Client } from '@/types/entities';
import { formatTime, formatDate } from '@/utils/dateFormatters';

// Professional metric card with gradient background
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradientFrom: string;
  gradientTo: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  gradientFrom,
  gradientTo,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trend.isPositive ? 'text-green-100' : 'text-red-100'
            }`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-white/60 text-sm">{subtitle}</p>
        )}
      </div>
      {/* Decorative elements */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-white/5 rounded-full" />
    </div>
  );
};

// Professional appointment card
interface AppointmentCardProps {
  appointment: Appointment;
  onView: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onView }) => {
  const statusColors = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-gray-50 text-gray-700 border-gray-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-green-600/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-green-600/10 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-7 h-7 text-green-600" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {appointment.client?.first_name} {appointment.client?.last_name}
            </h4>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-1" />
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled
        }`}>
          {appointment.status}
        </span>
      </div>
      
      {appointment.type && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 text-sm text-gray-700">
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('_', ' ')}
          </span>
        </div>
      )}
      
      <button
        onClick={onView}
        className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-green-600/5 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 group"
      >
        View Details
        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

// Quick actions section
const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const actions = [
    {
      title: 'New Appointment',
      description: 'Schedule a session',
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/therapist/appointments/new')
    },
    {
      title: 'Client Notes',
      description: 'Write session notes',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => navigate('/therapist/notes')
    },
    {
      title: 'View Schedule',
      description: 'Today\'s appointments',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/therapist/calendar')
    },
    {
      title: 'Client Progress',
      description: 'Track progress',
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => navigate('/therapist/clients')
    }
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="group p-5 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-green-600/20 transition-all duration-300"
        >
          <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <action.icon className={`w-6 h-6 ${action.color}`} />
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
            {action.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  );
};

const ProfessionalTherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Load all data in parallel with proper error handling
      const [appointmentsResult, clientsResult, sessionsResult] = await Promise.allSettled([
        realApiService.therapist.getAppointments(),
        realApiService.therapist.getClients(),
        realApiService.therapist.getSessions({ limit: 50 })
      ]);

      let todayAppointments = 0;
      let weeklyAppointments = 0;
      let upcomingAppts: Appointment[] = [];

      // Handle appointments
      if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value.success) {
        const appointments = appointmentsResult.value.data || [];
        
        // Filter today's appointments
        const todayAppts = appointments.filter((apt: any) => apt.appointment_date === today);
        todayAppointments = todayAppts.length;
        
        // Calculate weekly appointments
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeklyAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= weekStart && aptDate <= weekEnd;
        }).length;
        
        // Get upcoming appointments (future or today) that are scheduled or confirmed
        upcomingAppts = appointments
          .filter((apt: any) => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= new Date(today) && 
                   (apt.status === 'scheduled' || apt.status === 'confirmed');
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.appointment_date + ' ' + a.start_time);
            const dateB = new Date(b.appointment_date + ' ' + b.start_time);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5) as unknown as Appointment[];
      }

      // Handle clients
      let activeClientsCount = 0;
      if (clientsResult.status === 'fulfilled' && clientsResult.value.success) {
        const clients = clientsResult.value.data || [];
        setActiveClients(clients as unknown as Client[]);
        activeClientsCount = clients.filter((c: any) => c.status === 'active').length;
      }

      // Handle sessions (for completed count)
      let completedSessions = 0;
      if (sessionsResult.status === 'fulfilled' && sessionsResult.value.success) {
        const sessions = sessionsResult.value.data?.sessions || [];
        // Count sessions completed this month
        const monthStart = new Date();
        monthStart.setDate(1);
        completedSessions = sessions.filter((s: any) => {
          const sessionDate = new Date(s.created_at || s.date);
          return s.status === 'completed' && sessionDate >= monthStart;
        }).length;
      }

      // Set dashboard data
      setDashboardData({
        stats: {
          activeClients: activeClientsCount,
          todayAppointments,
          weeklyAppointments,
          completedSessions
        }
      });
      
      setUpcomingAppointments(upcomingAppts);

    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    activeClients: activeClients.length,
    todayAppointments: 0,
    weeklyAppointments: 0,
    completedSessions: 0
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Welcome back, {user?.first_name || 'Therapist'}!
          </h1>
          <p className="text-white/90">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Clients"
            value={stats.activeClients}
            subtitle="Currently in therapy"
            icon={UserGroupIcon}
            trend={{ value: 12, isPositive: true }}
            gradientFrom="#4F46E5"
            gradientTo="#7C3AED"
            onClick={() => navigate('/therapist/clients')}
          />
          <MetricCard
            title="Today's Sessions"
            value={stats.todayAppointments}
            subtitle="Scheduled appointments"
            icon={CalendarIcon}
            gradientFrom="#059669"
            gradientTo="#10B981"
            onClick={() => navigate('/therapist/calendar')}
          />
          <MetricCard
            title="This Week"
            value={stats.weeklyAppointments}
            subtitle="Total appointments"
            icon={CalendarDaysIcon}
            trend={{ value: 8, isPositive: true }}
            gradientFrom="#DC2626"
            gradientTo="#F59E0B"
            onClick={() => navigate('/therapist/appointments')}
          />
          <MetricCard
            title="Completed"
            value={stats.completedSessions}
            subtitle="Sessions this month"
            icon={CheckCircleIcon}
            trend={{ value: 15, isPositive: true }}
            gradientFrom="#0891B2"
            gradientTo="#06B6D4"
            onClick={() => navigate('/therapist/appointments?status=completed')}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                <Link
                  to="/therapist/appointments"
                  className="text-sm font-medium text-green-600 hover:text-emerald-600 transition-colors flex items-center"
                >
                  View all
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onView={() => navigate(`/therapist/appointments/${appointment.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/therapist/appointments/new')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Quick Stats</h2>
            <div className="space-y-4">
              {/* Active Clients Quick View */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Clients</span>
                  <span className="text-lg font-bold text-green-600">{activeClients.length}</span>
                </div>
                {activeClients.length === 0 && (
                  <p className="text-xs text-red-600">No clients assigned yet</p>
                )}
              </div>
              
              {/* Today's Schedule */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Today's Sessions</span>
                  <span className="text-lg font-bold text-blue-600">{stats.todayAppointments}</span>
                </div>
                {stats.todayAppointments > 0 && (
                  <p className="text-xs text-gray-600">
                    Next: {upcomingAppointments[0]?.start_time ? formatTime(upcomingAppointments[0].start_time) : 'N/A'}
                  </p>
                )}
              </div>
              
              {/* Week Progress */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">This Week</span>
                  <span className="text-lg font-bold text-purple-600">{stats.weeklyAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.todayAppointments / Math.max(stats.weeklyAppointments, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Monthly Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completed This Month</span>
                  <span className="text-lg font-bold text-orange-600">{stats.completedSessions}</span>
                </div>
                <Link
                  to="/therapist/sessions"
                  className="text-xs text-green-600 hover:text-emerald-600 transition-colors"
                >
                  View session history →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistDashboard;