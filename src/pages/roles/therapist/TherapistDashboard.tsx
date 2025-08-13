import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  CurrencyEuroIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTherapistDashboard, useTherapistAppointments, useTherapistClients } from '@/hooks/useRealApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusIndicator from '@/components/ui/StatusIndicator';
import PageTransition from '@/components/ui/PageTransition';
import { Appointment, Client } from '@/types/entities';
import { formatTime, formatDate, formatCurrency } from '@/utils/dateFormatters';

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  link?: string;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  link,
  isLoading
}) => {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="mt-2">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} className="block">{content}</Link>;
  }

  return content;
};

// Appointment card component
interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const getTimeString = (time: string) => {
    return formatTime(time);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {new Date(appointment.appointment_date).getDate()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {appointment.client?.first_name} {appointment.client?.last_name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              {getTimeString(appointment.start_time)} - 
              {getTimeString(appointment.end_time)}
            </p>
          </div>
        </div>
      </div>
      <StatusIndicator
        type="appointment"
        status={appointment.status}
        size="sm"
      />
    </div>
  );
};

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // API hooks
  const { execute: getDashboard, data: dashboardData, isLoading: isDashboardLoading } = useTherapistDashboard();
  const { appointments, getAppointments, isLoading: isAppointmentsLoading } = useTherapistAppointments();
  const { clients, getClients, isLoading: isClientsLoading } = useTherapistClients();

  // State
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    todayAppointments: 0,
    weeklyAppointments: 0,
    monthlyRevenue: 0,
    completedSessions: 0,
    averageRating: 0
  });

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data in parallel
        const [dashboardResult] = await Promise.all([
          getDashboard(),
          getAppointments({ status: 'scheduled' }),
          getClients({ status: 'active' })
        ]);

        if (dashboardResult) {
          setMetrics({
            totalClients: dashboardResult.activeClients || clients.length || 0,
            todayAppointments: dashboardResult.todayAppointments || 0,
            weeklyAppointments: dashboardResult.weeklyAppointments || 0,
            monthlyRevenue: dashboardResult.monthlyRevenue || 0,
            completedSessions: dashboardResult.completedSessions || 0,
            averageRating: dashboardResult.averageRating || 0
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, []);

  // Filter appointments for today and upcoming
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      
      const todayAppts = appointments.filter(apt => 
        apt.appointment_date === today && apt.status === 'scheduled'
      );
      
      const upcomingAppts = appointments.filter(apt => 
        apt.appointment_date > today && apt.status === 'scheduled'
      ).slice(0, 5);

      setTodayAppointments(todayAppts);
      setUpcomingAppointments(upcomingAppts);
    }
  }, [appointments]);

  const isLoading = isDashboardLoading || isAppointmentsLoading || isClientsLoading;

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'session_completed',
      message: 'Session completed with Emma Williams',
      time: '2 hours ago',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600'
    },
    {
      id: 2,
      type: 'new_appointment',
      message: 'New appointment scheduled with John Smith',
      time: '4 hours ago',
      icon: CalendarIcon,
      iconColor: 'text-blue-600'
    },
    {
      id: 3,
      type: 'document_received',
      message: 'Insurance document received from Sarah Johnson',
      time: 'Yesterday',
      icon: DocumentTextIcon,
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 -mx-6 -mt-6 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.first_name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Here's your practice overview for today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/therapist/appointments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Schedule Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Clients"
            value={metrics.totalClients}
            icon={UsersIcon}
            iconColor="bg-blue-600"
            link="/therapist/clients"
            isLoading={isLoading}
          />
          <MetricCard
            title="Today's Appointments"
            value={metrics.todayAppointments}
            subtitle={`${todayAppointments.length} scheduled`}
            icon={CalendarIcon}
            iconColor="bg-green-600"
            link="/therapist/appointments"
            isLoading={isLoading}
          />
          <MetricCard
            title="This Week"
            value={metrics.weeklyAppointments}
            subtitle="appointments"
            icon={ClockIcon}
            iconColor="bg-purple-600"
            link="/therapist/calendar"
            isLoading={isLoading}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`€${metrics.monthlyRevenue.toLocaleString()}`}
            icon={CurrencyEuroIcon}
            iconColor="bg-orange-600"
            link="/therapist/invoices"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <Link 
                to="/therapist/appointments" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {isAppointmentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link 
                to="/therapist/activity" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link 
              to="/therapist/calendar" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View calendar
            </Link>
          </div>
          
          {isAppointmentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{metrics.completedSessions}</p>
              <p className="text-sm text-gray-600 mt-1">Sessions Completed</p>
              <p className="text-xs text-green-600 mt-2">+12% from last month</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{metrics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(metrics.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Clients</p>
              <p className="text-xs text-blue-600 mt-2">View client list</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TherapistDashboard;