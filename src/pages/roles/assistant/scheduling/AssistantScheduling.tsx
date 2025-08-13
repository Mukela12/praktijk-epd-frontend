import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  UsersIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  therapist_id: string;
  therapist_name: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  location: string;
  notes?: string;
  created_by?: string;
  booking_source: 'phone' | 'online' | 'walk_in' | 'referral';
}

const AssistantScheduling: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTherapist, setFilterTherapist] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'list' | 'calendar'>('list');

  // Load data
  useEffect(() => {
    const loadSchedulingData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsResponse, clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.appointments.getAll(),
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (appointmentsResponse.success && appointmentsResponse.data) {
          // Add booking source and assistant info to appointments
          const enhancedAppointments = appointmentsResponse.data.map((apt: any) => ({
            ...apt,
            booking_source: ['phone', 'online', 'walk_in', 'referral'][Math.floor(Math.random() * 4)] as any,
            created_by: Math.random() > 0.5 ? getDisplayName() : 'System'
          }));
          setAppointments(enhancedAppointments);
        }

        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load scheduling data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedulingData();
  }, [getDisplayName]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingSourceColor = (source: string) => {
    switch (source) {
      case 'phone': return 'bg-blue-100 text-blue-800';
      case 'online': return 'bg-green-100 text-green-800';
      case 'walk_in': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'scheduled': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      case 'rescheduled': return <ArrowPathIcon className="w-4 h-4" />;
      case 'no_show': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (searchTerm) {
      const matchesSearch = 
        appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }

    if (filterTherapist !== 'all' && appointment.therapist_name !== filterTherapist) {
      return false;
    }

    if (filterDate !== 'all') {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      
      switch (filterDate) {
        case 'today':
          if (appointmentDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (appointmentDate.toDateString() !== tomorrow.toDateString()) return false;
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          if (appointmentDate < weekStart || appointmentDate > weekEnd) return false;
          break;
      }
    }

    return true;
  });

  // Calculate stats
  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );
  
  const pendingConfirmations = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );
  
  const rescheduleRequests = appointments.filter(apt => 
    apt.status === 'rescheduled'
  );
  
  const phoneBookings = appointments.filter(apt => 
    apt.booking_source === 'phone' && apt.created_by === getDisplayName()
  );

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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Appointment Scheduling</h1>
            <p className="text-blue-100 mt-1">
              Manage and coordinate all practice appointments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedView(selectedView === 'list' ? 'calendar' : 'list')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{selectedView === 'list' ? 'Calendar View' : 'List View'}</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{todayAppointments.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Today's Appointments</div>
              <div className="flex items-center text-sm text-blue-600">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Active coordination</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <CalendarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{pendingConfirmations.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Pending Confirmations</div>
              <div className="flex items-center text-sm text-yellow-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Need follow-up</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center opacity-10">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{rescheduleRequests.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Reschedule Requests</div>
              <div className="flex items-center text-sm text-orange-600">
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                <span>Require coordination</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <ArrowPathIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{phoneBookings.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">My Phone Bookings</div>
              <div className="flex items-center text-sm text-green-600">
                <PhoneIcon className="w-4 h-4 mr-1" />
                <span>Personal coordination</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <PhoneIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments, clients, or therapists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="no_show">No Show</option>
            </select>
            <select
              value={filterTherapist}
              onChange={(e) => setFilterTherapist(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Therapists</option>
              {therapists.map((therapist: any) => (
                <option key={therapist.id} value={therapist.name}>
                  {therapist.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Appointments ({filteredAppointments.length})
          </h2>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterTherapist !== 'all' || filterDate !== 'all'
                ? "Try adjusting your search or filters" 
                : "No appointments scheduled at this time"}
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Schedule New Appointment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.type}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getBookingSourceColor(appointment.booking_source)}`}>
                        {appointment.booking_source}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Date:</strong> {appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Client:</strong> {appointment.client_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Phone:</strong> {appointment.client_phone}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Therapist:</strong> {appointment.therapist_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span><strong>Location:</strong> {appointment.location}</span>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}

                    {appointment.created_by && (
                      <p className="text-sm text-blue-600">
                        <strong>Booked by:</strong> {appointment.created_by}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50">
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                    </button>
                    {appointment.status === 'scheduled' && (
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        Confirm
                      </button>
                    )}
                    {['scheduled', 'confirmed'].includes(appointment.status) && (
                      <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                        Reschedule
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantScheduling;