import React from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';

const TherapistDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();

  // Mock data for therapist dashboard
  const metrics = [
    {
      name: 'My Clients',
      nameKey: 'dashboard.myClients',
      value: '23',
      change: '+2',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Today\'s Appointments',
      nameKey: 'dashboard.todayAppointments',
      value: '6',
      change: '0',
      changeType: 'neutral',
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'This Week\'s Hours',
      nameKey: 'dashboard.weeklyHours',
      value: '32',
      change: '+4',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Notes',
      nameKey: 'dashboard.pendingNotes',
      value: '3',
      change: '-2',
      changeType: 'positive',
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
    },
  ];

  const todayAppointments = [
    {
      id: 1,
      time: '09:00',
      client: 'Sarah Johnson',
      type: 'CBT Session',
      status: 'confirmed',
      duration: '50 min',
    },
    {
      id: 2,
      time: '10:30',
      client: 'Michael Brown',
      type: 'Intake Session',
      status: 'confirmed',
      duration: '90 min',
    },
    {
      id: 3,
      time: '13:00',
      client: 'Emma Wilson',
      type: 'EMDR Session',
      status: 'confirmed',
      duration: '50 min',
    },
    {
      id: 4,
      time: '14:30',
      client: 'David Lee',
      type: 'Follow-up',
      status: 'pending',
      duration: '50 min',
    },
    {
      id: 5,
      time: '16:00',
      client: 'Lisa Garcia',
      type: 'CBT Session',
      status: 'confirmed',
      duration: '50 min',
    },
  ];

  const recentClients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      lastSession: '2024-01-14',
      nextSession: '2024-01-21',
      status: 'active',
      progress: 'good',
    },
    {
      id: 2,
      name: 'Michael Brown',
      lastSession: '2024-01-13',
      nextSession: '2024-01-20',
      status: 'active',
      progress: 'excellent',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      lastSession: '2024-01-12',
      nextSession: '2024-01-19',
      status: 'active',
      progress: 'fair',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('dashboard.welcome')}, Dr. {getDisplayName()}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Your therapeutic practice overview for today
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-therapist-primary">
              Therapist Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                  {metric.change !== '0' && (
                    <p className={`ml-2 text-sm font-medium ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.changeType === 'positive' ? '+' : ''}{metric.change}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Schedule
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View full calendar
            </button>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <p className="text-xs text-gray-500">{appointment.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appointment.client}</p>
                    <p className="text-xs text-gray-500">{appointment.type}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Clients
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all clients
            </button>
          </div>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">Last: {client.lastSession}</p>
                  <p className="text-xs text-gray-500">Next: {client.nextSession}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(client.progress)}`}>
                    {client.progress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Schedule Appointment</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Add Session Notes</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">View Client Details</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Send Message</span>
            </div>
          </button>
        </div>
      </div>

      {/* Next Week Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Week Preview</h2>
        <div className="grid grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <p className="text-sm font-medium text-gray-600">{day}</p>
              <div className="mt-2 space-y-1">
                {index < 5 && ( // Weekdays have appointments
                  <>
                    <div className="h-2 bg-blue-200 rounded"></div>
                    <div className="h-2 bg-green-200 rounded"></div>
                    {index < 3 && <div className="h-2 bg-purple-200 rounded"></div>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;