import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  XCircleIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  BuildingOfficeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Appointment } from '@/types/entities';
import { formatTime, formatDate } from '@/utils/dateFormatters';

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
      icon: CalendarDaysIcon,
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
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// Calendar view modes
type ViewMode = 'day' | 'week' | 'month';

// Calendar day component
const CalendarDay: React.FC<{
  date: Date;
  appointments: Appointment[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  viewMode: ViewMode;
}> = ({ date, appointments, isToday, isSelected, isCurrentMonth, onSelect, onAppointmentClick, viewMode }) => {
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === date.toDateString();
  });

  const handleAppointmentClick = (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation();
    onAppointmentClick(apt);
  };

  return (
    <div
      onClick={() => onSelect(date)}
      className={`
        min-h-[100px] p-2 border transition-all cursor-pointer
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
        ${isToday ? 'border-green-600 border-2' : 'border-gray-200'}
        ${isSelected ? 'ring-2 ring-green-600 ring-offset-2' : ''}
        ${viewMode === 'month' ? 'hover:shadow-md' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm font-medium ${
          isToday ? 'text-green-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {date.getDate()}
        </span>
        {dayAppointments.length > 0 && (
          <span className="text-xs text-gray-500">
            {dayAppointments.length} appt{dayAppointments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {dayAppointments.slice(0, viewMode === 'month' ? 3 : 10).map((apt) => (
          <div
            key={apt.id}
            onClick={(e) => handleAppointmentClick(e, apt)}
            className={`
              text-xs p-1 rounded cursor-pointer truncate
              ${apt.status === 'cancelled' ? 'bg-gray-100 text-gray-500 line-through' : 'bg-green-600/10 text-green-700 hover:bg-green-600/20'}
            `}
          >
            <span className="font-medium">{formatTime(apt.start_time)}</span>
            <span className="ml-1 text-gray-600">{apt.client?.first_name}</span>
          </div>
        ))}
        {dayAppointments.length > (viewMode === 'month' ? 3 : 10) && (
          <div className="text-xs text-gray-500 text-center">
            +{dayAppointments.length - (viewMode === 'month' ? 3 : 10)} more
          </div>
        )}
      </div>
    </div>
  );
};

// Week view component
const WeekView: React.FC<{
  currentDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}> = ({ currentDate, appointments, onDateSelect, onAppointmentClick }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-3 bg-gray-50"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-3 text-center border-l border-gray-200 ${
              day.toDateString() === new Date().toDateString() ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="text-xs text-gray-600">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={`text-lg font-semibold ${
              day.toDateString() === new Date().toDateString() ? 'text-green-600' : 'text-gray-900'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="overflow-y-auto max-h-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-2 text-xs text-gray-500 text-right pr-3 bg-gray-50">
              {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.appointment_date);
                const aptHour = parseInt(apt.start_time.split(':')[0]);
                return aptDate.toDateString() === day.toDateString() && aptHour === hour;
              });

              return (
                <div
                  key={dayIndex}
                  className="relative border-l border-gray-100 hover:bg-gray-50 cursor-pointer p-1"
                  onClick={() => onDateSelect(day)}
                >
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className={`
                        absolute left-1 right-1 p-2 rounded text-xs cursor-pointer
                        ${apt.status === 'cancelled' 
                          ? 'bg-gray-100 text-gray-500 border border-gray-300' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }
                      `}
                      style={{
                        top: '0',
                        minHeight: '40px'
                      }}
                    >
                      <div className="font-medium truncate">
                        {apt.client?.first_name} {apt.client?.last_name}
                      </div>
                      <div className="text-xs opacity-90">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const TherapistCalendar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
  }, [currentDate, viewMode]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all appointments - the API doesn't support date range filtering well
      // so we'll load all and filter client-side
      const response = await realApiService.therapist.getAppointments();
      
      if (response.success) {
        const allAppointments = (response.data || []) as unknown as Appointment[];
        
        // Calculate visible date range based on view mode
        let startDate = new Date(currentDate);
        let endDate = new Date(currentDate);
        
        if (viewMode === 'month') {
          // For month view, show previous month's last week and next month's first week
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday of that week
          
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          const daysToAdd = 6 - endDate.getDay(); // End on Saturday of that week
          endDate.setDate(endDate.getDate() + daysToAdd);
        } else if (viewMode === 'week') {
          startDate.setDate(currentDate.getDate() - currentDate.getDay());
          endDate.setDate(startDate.getDate() + 6);
        } else {
          // Day view - just show current day
          endDate = new Date(startDate);
        }
        
        // Filter appointments for visible date range
        const filteredAppointments = allAppointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= startDate && aptDate <= endDate;
        });
        
        setAppointments(filteredAppointments);
      } else {
        throw new Error('Failed to load appointments');
      }
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      
      if (error?.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error?.response?.status === 404) {
        setAppointments([]);
        setError(null);
      } else {
        setError('Failed to load appointments. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (filterType !== 'all' && apt.location !== filterType) return false;
    return true;
  });

  // Get today's stats
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingToday = todayAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length;
  const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading calendar..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Calendar</h3>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your therapy sessions and schedule</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/therapist/appointments/new')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{todayAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{completedToday}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'day' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousPeriod}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
              >
                Today
              </button>
              
              <button
                onClick={handleNextPeriod}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-sm"
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
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-sm"
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

        {/* Calendar View */}
        {viewMode === 'month' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Month view header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-sm font-medium text-gray-600 text-center py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month days */}
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map((date, index) => (
                <CalendarDay
                  key={index}
                  date={date}
                  appointments={filteredAppointments}
                  isToday={date.toDateString() === new Date().toDateString()}
                  isSelected={date.toDateString() === selectedDate.toDateString()}
                  isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                  onSelect={setSelectedDate}
                  onAppointmentClick={(apt) => navigate(`/therapist/appointments/${apt.id}`)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <WeekView
            currentDate={currentDate}
            appointments={filteredAppointments}
            onDateSelect={setSelectedDate}
            onAppointmentClick={(apt) => navigate(`/therapist/appointments/${apt.id}`)}
          />
        ) : (
          // Day view
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="space-y-3">
              {filteredAppointments
                .filter(apt => new Date(apt.appointment_date).toDateString() === currentDate.toDateString())
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => navigate(`/therapist/appointments/${appointment.id}`)}
                    className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-green-600/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center">
                          <ClockIcon className="w-6 h-6 text-green-600" />
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
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              
              {filteredAppointments.filter(apt => new Date(apt.appointment_date).toDateString() === currentDate.toDateString()).length === 0 && (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled for this day</p>
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
        )}
      </div>
    </PageTransition>
  );
};

export default TherapistCalendar;