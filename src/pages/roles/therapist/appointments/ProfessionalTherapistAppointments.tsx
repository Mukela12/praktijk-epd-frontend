import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Appointment } from '@/types/entities';
import { formatDate, formatTime } from '@/utils/dateFormatters';

// Appointment type icons
const AppointmentTypeIcon: React.FC<{ type?: string }> = ({ type }) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <VideoCameraIcon className="w-5 h-5" />;
    case 'phone':
      return <PhoneIcon className="w-5 h-5" />;
    case 'in-person':
    default:
      return <BuildingOfficeIcon className="w-5 h-5" />;
  }
};

// Status badge component
const AppointmentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    scheduled: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CalendarIcon,
      label: 'Scheduled'
    },
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: CheckCircleIcon,
      label: 'Confirmed'
    },
    completed: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: CheckCircleIcon,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircleIcon,
      label: 'Cancelled'
    },
    no_show: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: ExclamationTriangleIcon,
      label: 'No Show'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </span>
  );
};

// Calendar view component
const CalendarView: React.FC<{ 
  appointments: Appointment[], 
  selectedDate: Date,
  onSelectDate: (date: Date) => void,
  onSelectAppointment: (appointment: Appointment) => void 
}> = ({ appointments, selectedDate, onSelectDate, onSelectAppointment }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const days = getDaysInMonth(selectedDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };
  
  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onSelectDate(newDate);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onSelectDate(new Date())}
            className="px-3 py-1 text-sm text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onSelectDate(newDate);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDay(date);
          const hasAppointments = dayAppointments.length > 0;
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer
                ${!date ? 'invisible' : ''}
                ${isToday(date) ? 'border-green-600 bg-green-600/5' : 'border-gray-100'}
                ${isSelected(date) ? 'ring-2 ring-green-600' : ''}
                ${hasAppointments ? 'hover:shadow-md' : 'hover:bg-gray-50'}
              `}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  {dayAppointments.slice(0, 2).map((apt, i) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(apt);
                      }}
                      className="mb-1 px-1 py-0.5 bg-green-600/10 hover:bg-green-600/20 rounded text-xs text-green-600 truncate cursor-pointer transition-colors"
                    >
                      {formatTime(apt.start_time)}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Appointment card component
const AppointmentCard: React.FC<{ 
  appointment: Appointment, 
  onSelect: () => void,
  onAction: (action: string) => void 
}> = ({ appointment, onSelect, onAction }) => {
  const isPast = new Date(appointment.appointment_date + ' ' + appointment.end_time) < new Date();
  
  return (
    <div 
      className={`
        group bg-white rounded-xl border p-5 transition-all duration-300 cursor-pointer
        ${isPast ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:shadow-lg hover:border-green-600/30'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isPast ? 'bg-gray-100' : 'bg-green-600/10'
          }`}>
            <CalendarIcon className={`w-6 h-6 ${
              isPast ? 'text-gray-500' : 'text-green-600'
            }`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {appointment.client?.first_name} {appointment.client?.last_name}
            </h4>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
              <span className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </span>
              <span className="flex items-center">
                <AppointmentTypeIcon type={appointment.location} />
                <span className="ml-1">{appointment.location || 'In-Person'}</span>
              </span>
            </div>
          </div>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      
      {appointment.type && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 text-sm text-gray-700">
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('_', ' ')}
          </span>
        </div>
      )}
      
      {appointment.notes && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{appointment.notes}</p>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {formatDate(appointment.appointment_date)}
        </span>
        <div className="flex space-x-2">
          {appointment.status === 'scheduled' && !isPast && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('confirm');
                }}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('reschedule');
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Reschedule
              </button>
            </>
          )}
          {appointment.status === 'confirmed' && !isPast && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('start');
              }}
              className="px-3 py-1 text-sm text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
            >
              Start Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfessionalTherapistAppointments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, filterStatus, filterType, appointments]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getAppointments();
      
      if (response.success) {
        // Sort appointments by date and time
        const sorted = (response.data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.appointment_date + ' ' + a.start_time);
          const dateB = new Date(b.appointment_date + ' ' + b.start_time);
          return dateA.getTime() - dateB.getTime();
        });
        setAppointments(sorted as unknown as Appointment[]);
      } else {
        throw new Error('Failed to load appointments');
      }
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 500) {
        // Backend routing issue
        setError('Server error. Please try again later.');
        setAppointments([]);
      } else if (error?.response?.status === 404) {
        // No appointments found
        setAppointments([]);
        setError(null); // Don't show error for empty state
      } else if (error?.response?.status === 403) {
        setError('You do not have permission to view appointments.');
      } else {
        setError('Failed to load appointments. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.location === filterType);
    }

    setFilteredAppointments(filtered);
  };

  const handleAppointmentAction = async (appointmentId: string, action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await realApiService.therapist.updateAppointment(appointmentId, { status: 'confirmed' });
          break;
        case 'start':
          navigate('/therapist/sessions');
          return;
        case 'reschedule':
          navigate(`/therapist/appointments/${appointmentId}/reschedule`);
          return;
      }
      
      // Reload appointments after action
      await loadAppointments();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  // Get appointments for the selected date
  const selectedDateAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Get today's appointments count
  const todayCount = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === new Date().toDateString() && apt.status !== 'cancelled';
  }).length;

  // Get upcoming appointments count
  const upcomingCount = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate > new Date() && apt.status !== 'cancelled';
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading appointments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAppointments}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header section */}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your therapy sessions and schedule</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{todayCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.appointment_date);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return aptDate >= weekStart && aptDate <= weekEnd && apt.status !== 'cancelled';
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendar View
                </button>
              </div>
              
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Types</option>
                <option value="In-Person">In-Person</option>
                <option value="Video">Video Call</option>
                <option value="Phone">Phone Call</option>
              </select>
              
              <button
                onClick={loadAppointments}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CalendarView
                appointments={filteredAppointments}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectAppointment={(apt) => navigate(`/therapist/appointments/${apt.id}`)}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onSelect={() => navigate(`/therapist/appointments/${appointment.id}`)}
                      onAction={(action) => handleAppointmentAction(appointment.id, action)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onSelect={() => navigate(`/therapist/appointments/${appointment.id}`)}
                  onAction={(action) => handleAppointmentAction(appointment.id, action)}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                    ? 'No appointments found' 
                    : 'No Appointments Scheduled Yet'
                  }
                </h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'You don\'t have any appointments scheduled. Appointments will appear here once clients are assigned to you and they book sessions.'
                  }
                </p>
                {(!searchTerm && filterStatus === 'all' && filterType === 'all') && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                      <div className="flex items-start space-x-3">
                        <BellAlertIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">How Appointments Work</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Clients are assigned to you by the administrator</li>
                            <li>• Assigned clients can book appointments with you</li>
                            <li>• You\'ll receive notifications for new bookings</li>
                            <li>• You can manage and reschedule appointments here</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => navigate('/therapist/clients')}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View My Clients
                      </button>
                      <button
                        onClick={() => navigate('/therapist/availability')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Manage Availability
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistAppointments;