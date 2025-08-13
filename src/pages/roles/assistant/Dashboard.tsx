import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  PhoneIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon,
  BellIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatTime, formatDate, formatRelativeTime, formatDuration } from '@/utils/dateFormatters';

const AssistantDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsResponse, clientsResponse, messagesResponse] = await Promise.all([
          realApiService.appointments.getAll(),
          realApiService.clients.getAll(),
          realApiService.messages.getInbox(user?.id || '1')
        ]);

        if (appointmentsResponse.success && appointmentsResponse.data) {
          setAppointments(appointmentsResponse.data);
        }

        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Calculate derived stats
  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );
  
  const pendingTasks = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );
  
  const urgentMessages = messages.filter((msg: any) => 
    msg.priority === 'high' || msg.priority === 'urgent'
  );

  const clientsNeedingSupport = clients.filter((client: any) => 
    client.status === 'new' || client.status === 'viewed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Enhanced Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('dashboard.welcome')}, {getDisplayName()}
            </h1>
            <p className="text-blue-100 mt-1">
              Practice support and client assistance overview
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-blue-100">Support Team</p>
              <p className="text-lg font-semibold">{t('role.assistant')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid - Following Approved Design */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Clients Needing Support Card - Blue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{clientsNeedingSupport.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Clients Needing Support</div>
              <div className="flex items-center text-sm text-blue-600">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span>Require follow-up</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <UsersIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Today's Appointments Card - Green */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{todayAppointments.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Today's Appointments</div>
              <div className="flex items-center text-sm text-green-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Coordination required</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CalendarIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Pending Tasks Card - Orange */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{pendingTasks.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Pending Tasks</div>
              <div className="flex items-center text-sm text-orange-600">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                <span>Administrative tasks</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <DocumentTextIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Urgent Messages Card - Red */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{urgentMessages.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Urgent Messages</div>
              <div className="flex items-center text-sm text-red-600">
                <BellIcon className="w-4 h-4 mr-1" />
                <span>Immediate attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
              <ChatBubbleLeftIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Appointment Schedule
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View full schedule
            </button>
          </div>
          <div className="space-y-3">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{formatTime(appointment.start_time)}</p>
                      <p className="text-xs text-gray-500">{formatDuration(appointment.duration || 50)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.client_name}</p>
                      <p className="text-xs text-gray-500">{appointment.therapist_name}</p>
                      <p className="text-xs text-gray-500">{appointment.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-700">
                      View details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Clients Requiring Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Clients Requiring Support
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all clients
            </button>
          </div>
          <div className="space-y-3">
            {clientsNeedingSupport.length > 0 ? (
              clientsNeedingSupport.slice(0, 5).map((client: any) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Registered: {formatDate(client.registration_date)}</p>
                    <p className="text-xs text-gray-500">Phone: {client.phone}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                    <div className="flex space-x-1">
                      <button className="p-1 text-blue-600 hover:text-blue-700">
                        <PhoneIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-700">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">All clients are up to date</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Priority Messages</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View all messages
          </button>
        </div>
        <div className="space-y-3">
          {urgentMessages.length > 0 ? (
            urgentMessages.slice(0, 3).map((message: any) => (
              <div key={message.id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{message.sender_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{message.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(message.created_at)}</p>
                </div>
                <button className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                  Respond
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No urgent messages at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <PhoneIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Client Call</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Schedule Appointment</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Send Message</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Update Records</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantDashboard;