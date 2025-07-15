import React from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';

const ClientDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();

  // Mock data for client dashboard
  const metrics = [
    {
      name: 'Next Appointment',
      nameKey: 'dashboard.nextAppointment',
      value: 'Today 2:00 PM',
      change: 'with Dr. Smith',
      changeType: 'neutral',
      icon: CalendarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Sessions Completed',
      nameKey: 'dashboard.sessionsCompleted',
      value: '12',
      change: '+1',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Progress Goals',
      nameKey: 'dashboard.progressGoals',
      value: '3/5',
      change: '60%',
      changeType: 'positive',
      icon: HeartIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Unread Messages',
      nameKey: 'dashboard.unreadMessages',
      value: '2',
      change: 'from therapist',
      changeType: 'neutral',
      icon: ChatBubbleLeftIcon,
      color: 'bg-orange-500',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      date: '2024-01-15',
      time: '14:00',
      therapist: 'Dr. Sarah Smith',
      type: 'CBT Session',
      status: 'confirmed',
      location: 'Room 201',
    },
    {
      id: 2,
      date: '2024-01-22',
      time: '14:00',
      therapist: 'Dr. Sarah Smith',
      type: 'CBT Session',
      status: 'scheduled',
      location: 'Room 201',
    },
    {
      id: 3,
      date: '2024-01-29',
      time: '14:00',
      therapist: 'Dr. Sarah Smith',
      type: 'Progress Review',
      status: 'scheduled',
      location: 'Room 201',
    },
  ];

  const progressGoals = [
    {
      id: 1,
      goal: 'Reduce anxiety levels',
      progress: 75,
      status: 'on_track',
      deadline: '2024-02-15',
    },
    {
      id: 2,
      goal: 'Improve sleep quality',
      progress: 60,
      status: 'on_track',
      deadline: '2024-02-01',
    },
    {
      id: 3,
      goal: 'Practice mindfulness daily',
      progress: 45,
      status: 'needs_attention',
      deadline: '2024-01-30',
    },
    {
      id: 4,
      goal: 'Social interaction goals',
      progress: 30,
      status: 'behind',
      deadline: '2024-02-10',
    },
  ];

  const recentMessages = [
    {
      id: 1,
      from: 'Dr. Sarah Smith',
      subject: 'Follow-up on last session',
      preview: 'Hi Sarah, I wanted to follow up on our discussion about...',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      from: 'Practice Admin',
      subject: 'Appointment reminder',
      preview: 'This is a reminder about your upcoming appointment...',
      time: '1 day ago',
      unread: true,
    },
    {
      id: 3,
      from: 'Dr. Sarah Smith',
      subject: 'Homework assignment',
      preview: 'Please remember to complete the mindfulness exercises...',
      time: '3 days ago',
      unread: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'needs_attention': return 'bg-yellow-500';
      case 'behind': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('dashboard.welcome')}, {getDisplayName()}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Your therapy journey overview
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
            <p className="text-base sm:text-lg font-semibold text-client-primary">
              Client Portal
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
                <div className="flex flex-col">
                  <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.change}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.upcomingAppointments')}
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Book new appointment
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appointment.therapist}</p>
                    <p className="text-xs text-gray-500">{appointment.type}</p>
                    <p className="text-xs text-gray-500">{appointment.location}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Messages
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all messages
            </button>
          </div>
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg ${message.unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium ${message.unread ? 'text-blue-900' : 'text-gray-900'}`}>
                        {message.from}
                      </p>
                      {message.unread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${message.unread ? 'text-blue-800' : 'text-gray-700'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.preview}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Progress Goals
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View detailed progress
          </button>
        </div>
        <div className="space-y-4">
          {progressGoals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{goal.goal}</p>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(goal.status)}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Due: {goal.deadline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Book Appointment</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Message Therapist</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">View Session Notes</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <HeartIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Track Mood</span>
            </div>
          </button>
        </div>
      </div>

      {/* Therapist Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Therapist</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-900">Dr. Sarah Smith</p>
            <p className="text-sm text-gray-600">Licensed Clinical Psychologist</p>
            <p className="text-sm text-gray-500">Specializes in CBT and Anxiety Disorders</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;