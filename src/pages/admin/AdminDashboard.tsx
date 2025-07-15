import React from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();

  // Mock data for dashboard metrics
  const metrics = [
    {
      name: 'Total Clients',
      nameKey: 'dashboard.totalClients',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Therapists',
      nameKey: 'dashboard.activeTherapists',
      value: '8',
      change: '+1',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Appointments Today',
      nameKey: 'dashboard.appointmentsToday',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Monthly Revenue',
      nameKey: 'dashboard.monthlyRevenue',
      value: '€12,450',
      change: '+8.2%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_client',
      message: 'New client registration: Sarah Johnson',
      time: '2 minutes ago',
      icon: UsersIcon,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'appointment',
      message: 'Appointment completed: Dr. Smith with John Doe',
      time: '15 minutes ago',
      icon: CalendarIcon,
      color: 'text-green-600',
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment received: €85 from Maria Garcia',
      time: '1 hour ago',
      icon: CurrencyDollarIcon,
      color: 'text-orange-600',
    },
    {
      id: 4,
      type: 'alert',
      message: 'Upcoming contract renewal: Dr. Wilson',
      time: '2 hours ago',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
    },
  ];

  const waitingListItems = [
    {
      id: 1,
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      urgency: 'high',
      appliedDate: '2024-01-15',
      status: 'new',
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      urgency: 'normal',
      appliedDate: '2024-01-14',
      status: 'contacted',
    },
    {
      id: 3,
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      urgency: 'urgent',
      appliedDate: '2024-01-13',
      status: 'intake_planned',
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'intake_planned': return 'bg-green-100 text-green-800';
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
              {t('dashboard.welcome')}, {getDisplayName()}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Here's your practice overview for today
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
            <p className="text-base sm:text-lg font-semibold text-admin-primary">
              Admin Dashboard
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
                  <p className={`ml-2 text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.recentActivity')}
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Waiting List Applications
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {waitingListItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.email}</p>
                  <p className="text-xs text-gray-500">Applied: {item.appliedDate}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
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
              <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Add New Client</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Add Therapist</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Schedule Appointment</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">View Reports</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;