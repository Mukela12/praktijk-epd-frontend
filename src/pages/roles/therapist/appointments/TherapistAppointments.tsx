import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAppointments } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumListItem, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface Appointment {
  id: string;
  client_name: string;
  client_id: string;
  date: string;
  time: string;
  duration: number;
  type: 'therapy' | 'intake' | 'follow_up' | 'assessment';
  location: 'office' | 'online' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  notes?: string;
  preparation_notes?: string;
  session_notes?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

const TherapistAppointments: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { getAll: getAppointments, isLoading } = useAppointments();
  const { success, info, warning } = useAlert();

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      client_name: 'Maria Jansen',
      client_id: 'client_1',
      date: '2024-08-02',
      time: '09:00',
      duration: 50,
      type: 'therapy',
      location: 'office',
      status: 'scheduled',
      notes: 'Regular CBT session',
      preparation_notes: 'Review anxiety homework from last session',
      priority: 'normal'
    },
    {
      id: '2',
      client_name: 'Peter de Vries',
      client_id: 'client_2',
      date: '2024-08-02',
      time: '10:30',
      duration: 50,
      type: 'therapy',
      location: 'online',
      status: 'scheduled',
      notes: 'EMDR session',
      preparation_notes: 'Prepare trauma processing protocol',
      priority: 'high'
    },
    {
      id: '3',
      client_name: 'Lisa van Berg',
      client_id: 'client_3',
      date: '2024-08-02',
      time: '14:00',
      duration: 50,
      type: 'intake',
      location: 'office',
      status: 'scheduled',
      notes: 'Initial assessment',
      preparation_notes: 'First session - intake questionnaire',
      priority: 'normal'
    },
    {
      id: '4',
      client_name: 'Jan Bakker',
      client_id: 'client_4',
      date: '2024-08-01',
      time: '15:30',
      duration: 50,
      type: 'follow_up',
      location: 'phone',
      status: 'completed',
      notes: 'Follow-up after treatment',
      session_notes: 'Client doing well, discussed coping strategies',
      priority: 'low'
    },
    {
      id: '5',
      client_name: 'Sophie Hendricks',
      client_id: 'client_5',
      date: '2024-08-03',
      time: '11:00',
      duration: 50,
      type: 'assessment',
      location: 'office',
      status: 'scheduled',
      notes: 'Psychological assessment',
      preparation_notes: 'Prepare assessment materials',
      priority: 'urgent'
    },
    {
      id: '6',
      client_name: 'Mark van Dijk',
      client_id: 'client_6',
      date: '2024-08-01',
      time: '13:00',
      duration: 50,
      type: 'therapy',
      location: 'office',
      status: 'no_show',
      notes: 'Weekly therapy session',
      priority: 'normal'
    }
  ];

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAppointments();
        if (Array.isArray(data) && data.length > 0) {
          // Map API data to appointment format
          const mappedAppointments = data.map(apt => ({
            id: apt.id || apt.appointment_id,
            client_name: apt.client_name || apt.client?.name || 'Unknown Client',
            client_id: apt.client_id,
            date: apt.date || apt.appointment_date,
            time: apt.time || apt.appointment_time,
            duration: apt.duration || 50,
            type: apt.type || 'therapy',
            location: apt.location || 'office',
            status: apt.status || 'scheduled',
            notes: apt.notes,
            preparation_notes: apt.preparation_notes,
            session_notes: apt.session_notes,
            priority: apt.priority || 'normal'
          }));
          setAppointments(mappedAppointments);
        } else {
          setAppointments(mockAppointments);
        }
      } catch (error) {
        console.error('Failed to load appointments:', error);
        setAppointments(mockAppointments);
      }
    };

    loadAppointments();
  }, [getAppointments]);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || appointment.location === filterLocation;
    const matchesType = filterType === 'all' || appointment.type === filterType;
    const matchesDate = viewMode === 'day' ? appointment.date === selectedDate : true;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesType && matchesDate;
  }).sort((a, b) => {
    // Sort by date and time
    const dateTimeA = new Date(`${a.date}T${a.time}:00`);
    const dateTimeB = new Date(`${b.date}T${b.time}:00`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  // Get appointment stats
  const getAppointmentStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
    const scheduledToday = todayAppointments.filter(apt => apt.status === 'scheduled').length;
    const noShows = appointments.filter(apt => apt.status === 'no_show').length;
    
    return {
      todayTotal: todayAppointments.length,
      completed: completedToday,
      scheduled: scheduledToday,
      noShows: noShows
    };
  };

  const stats = getAppointmentStats();

  // Handle appointment actions
  const handleAppointmentAction = (appointmentId: string, action: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      switch (action) {
        case 'complete':
          setAppointments(prev => 
            prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'completed' } : apt)
          );
          success(`Session with ${appointment.client_name} marked as completed`);
          break;
        case 'cancel':
          setAppointments(prev => 
            prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt)
          );
          warning(`Appointment with ${appointment.client_name} cancelled`);
          break;
        case 'reschedule':
          info(`Opening scheduler for ${appointment.client_name}`);
          break;
        case 'notes':
          info(`Opening session notes for ${appointment.client_name}`);
          break;
        case 'join':
          success(`Joining session with ${appointment.client_name}`);
          break;
        case 'call':
          info(`Calling ${appointment.client_name}`);
          break;
      }
    }
  };

  // Get location icon
  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'online': return VideoCameraIcon;
      case 'phone': return PhoneIcon;
      case 'office': return MapPinIcon;
      default: return MapPinIcon;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'no_show': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rescheduled': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <CalendarIcon className="w-8 h-8 mr-3" />
              My Appointments
            </h1>
            <p className="text-green-100 mt-1">
              Manage your therapy sessions and client appointments
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={PlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => info('Schedule new appointment')}
            >
              New Appointment
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <PremiumMetric
          title="Today's Total"
          value={stats.todayTotal}
          change={{ value: 'Appointments', type: 'neutral' }}
          icon={CalendarIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Completed"
          value={stats.completed}
          change={{ value: 'Sessions done', type: 'positive' }}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
        />
        <PremiumMetric
          title="Scheduled"
          value={stats.scheduled}
          change={{ value: 'Upcoming', type: 'neutral' }}
          icon={ClockIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="No Shows"
          value={stats.noShows}
          change={{ value: 'Total', type: stats.noShows > 0 ? 'negative' : 'neutral' }}
          icon={ExclamationTriangleIcon}
          iconColor="text-red-600"
        />
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Locations</option>
              <option value="office">Office</option>
              <option value="online">Online</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Appointments List */}
      <PremiumCard>
        {filteredAppointments.length === 0 ? (
          <PremiumEmptyState
            icon={CalendarIcon}
            title="No Appointments Found"
            description="No appointments match your current filters or selected date."
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterLocation('all');
                setFilterType('all');
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const LocationIcon = getLocationIcon(appointment.location);
              const isUpcoming = new Date(`${appointment.date}T${appointment.time}:00`) > new Date();
              
              return (
                <PremiumListItem
                  key={appointment.id}
                  avatar={{ 
                    initials: appointment.client_name.split(' ').map(n => n[0]).join(''), 
                    color: 'bg-green-500' 
                  }}
                  priority={appointment.priority as any}
                  status={{ 
                    status: appointment.status, 
                    type: appointment.status === 'scheduled' ? 'pending' :
                          appointment.status === 'completed' ? 'paid' :
                          appointment.status === 'cancelled' ? 'discontinued' :
                          appointment.status === 'no_show' ? 'overdue' : 'active'
                  }}
                  actions={
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          {appointment.location === 'online' && (
                            <PremiumButton
                              size="sm"
                              variant="primary"
                              icon={VideoCameraIcon}
                              onClick={() => handleAppointmentAction(appointment.id, 'join')}
                            >
                              Join
                            </PremiumButton>
                          )}
                          {appointment.location === 'phone' && (
                            <PremiumButton
                              size="sm"
                              variant="primary"
                              icon={PhoneIcon}
                              onClick={() => handleAppointmentAction(appointment.id, 'call')}
                            >
                              Call
                            </PremiumButton>
                          )}
                          <PremiumButton
                            size="sm"
                            variant="success"
                            icon={CheckCircleIcon}
                            onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                          >
                            Complete
                          </PremiumButton>
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            icon={PencilIcon}
                            onClick={() => handleAppointmentAction(appointment.id, 'reschedule')}
                          >
                            Reschedule
                          </PremiumButton>
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            icon={XMarkIcon}
                            onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                          >
                            Cancel
                          </PremiumButton>
                        </>
                      )}
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={DocumentTextIcon}
                        onClick={() => handleAppointmentAction(appointment.id, 'notes')}
                      >
                        Notes
                      </PremiumButton>
                    </div>
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.client_name}</h4>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {appointment.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.duration} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <LocationIcon className="w-4 h-4" />
                        <span className="capitalize">{appointment.location}</span>
                      </div>
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs">
                        {appointment.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(appointment.priority)}`}>
                        {appointment.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    {appointment.preparation_notes && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong className="text-blue-800">Preparation:</strong> 
                        <span className="text-blue-700 ml-1">{appointment.preparation_notes}</span>
                      </div>
                    )}
                    
                    {appointment.session_notes && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <strong className="text-green-800">Session Notes:</strong> 
                        <span className="text-green-700 ml-1">{appointment.session_notes}</span>
                      </div>
                    )}
                  </div>
                </PremiumListItem>
              );
            })}
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

export default TherapistAppointments;