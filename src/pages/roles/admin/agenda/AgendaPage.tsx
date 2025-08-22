import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  FunnelIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ViewColumnsIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CalendarEvent {
  id: string;
  title: string;
  client_name: string;
  therapist_name: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  date: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'in_progress';
  location: string;
  notes?: string;
}

type ViewMode = 'day' | 'week' | 'month' | 'list';

const AgendaPage: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showMyAgenda, setShowMyAgenda] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsResponse, therapistsResponse] = await Promise.all([
          realApiService.admin.getAppointments(),
          realApiService.therapists.getAll()
        ]);

        if (appointmentsResponse.success && appointmentsResponse.data) {
          // Transform appointments to calendar events
          const appointments = appointmentsResponse.data.appointments || appointmentsResponse.data || [];
          const calendarEvents: CalendarEvent[] = appointments.map((apt: any) => ({
            id: apt.id,
            title: `${apt.type} - ${apt.client_name}`,
            client_name: apt.client_name,
            therapist_name: apt.therapist_name,
            therapist_id: apt.therapist_id,
            start_time: apt.start_time,
            end_time: apt.end_time,
            date: apt.date,
            type: apt.type,
            status: apt.status,
            location: apt.location || 'Room 1',
            notes: apt.notes
          }));
          setEvents(calendarEvents);
          setFilteredEvents(calendarEvents);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
      } catch (error) {
        // Silent fail - show empty state
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter events based on selected filters
  useEffect(() => {
    let filtered = events;

    if (selectedTherapist !== 'all') {
      filtered = filtered.filter(event => event.therapist_id === selectedTherapist);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.location === selectedLocation);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // If showing "My Agenda" and user is also a therapist
    if (showMyAgenda && user?.role === 'admin') {
      filtered = filtered.filter(event => event.therapist_name === getDisplayName());
    }

    setFilteredEvents(filtered);
  }, [events, selectedTherapist, selectedLocation, selectedType, showMyAgenda, user, getDisplayName]);

  // Generate time slots for calendar views
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Get week days for week view
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push({
        date: currentDay,
        dayName: dayNames[i]
      });
    }
    return week;
  };

  // Get month days for month view
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get event color based on status
  const getEventColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'confirmed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'completed':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'no_show':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'no_show': return '🚫';
      case 'scheduled': return '📅';
      case 'in_progress': return '⏳';
      case 'confirmed': return '✓';
      default: return '📅';
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getDateRangeDisplay = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };

    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', options);
      case 'week':
        const startWeek = new Date(currentDate);
        startWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endWeek = new Date(startWeek);
        endWeek.setDate(startWeek.getDate() + 6);
        return `${startWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case 'list':
        return 'All Appointments';
      default:
        return '';
    }
  };

  // Get unique locations and types for filters
  const locations = [...new Set(events.map(event => event.location))];
  const types = [...new Set(events.map(event => event.type))];

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('agenda.title')}</h1>
            <p className="text-blue-100 mt-1">
              {t('agenda.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowMyAgenda(!showMyAgenda)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showMyAgenda
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {showMyAgenda ? t('agenda.fullPracticeAgenda') : t('agenda.myAgenda')}
              </button>
            )}
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>{t('agenda.newAppointment')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'list' ? (
                  <ListBulletIcon className="w-4 h-4" />
                ) : (
                  <ViewColumnsIcon className="w-4 h-4" />
                )}
                <span className="ml-1 capitalize">{mode}</span>
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="text-lg font-semibold text-gray-900 min-w-0">
              {getDateRangeDisplay()}
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedTherapist}
              onChange={(e) => setSelectedTherapist(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Therapists</option>
              {therapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {viewMode === 'list' ? (
          <div className="divide-y divide-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Appointments ({filteredEvents.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments found</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeRange(event.start_time, event.end_time)}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {event.client_name}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                              <span className="mr-1">{getStatusIcon(event.status)}</span>
                              {event.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <UsersIcon className="w-4 h-4" />
                              <span>{event.therapist_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View Details
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : viewMode === 'day' ? (
          // Day View
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {generateTimeSlots().map((timeSlot) => (
                <div key={timeSlot} className="flex border-b border-gray-100">
                  <div className="w-20 text-sm text-gray-500 font-medium py-2">
                    {timeSlot}
                  </div>
                  <div className="flex-1 relative h-16">
                    {filteredEvents
                      .filter(event => {
                        const eventDate = new Date(event.date);
                        return (
                          eventDate.toDateString() === currentDate.toDateString() &&
                          event.start_time.startsWith(timeSlot)
                        );
                      })
                      .map(event => (
                        <div
                          key={event.id}
                          className={`absolute inset-x-0 p-2 rounded-lg border ${getEventColor(event.status)} cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                          <div className="text-xs font-medium">{event.client_name}</div>
                          <div className="text-xs text-gray-600">{event.therapist_name}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          // Week View
          <div className="p-4">
            <div className="grid grid-cols-8 gap-1">
              {/* Time column */}
              <div className="col-span-1">
                <div className="h-12 mb-1"></div>
                {generateTimeSlots().map((timeSlot) => (
                  <div key={timeSlot} className="h-20 text-xs text-gray-500 pr-2 text-right">
                    {timeSlot}
                  </div>
                ))}
              </div>
              
              {/* Days columns */}
              {getWeekDays(currentDate).map((day, dayIndex) => (
                <div key={dayIndex} className="col-span-1">
                  <div className="h-12 mb-1 text-center">
                    <div className="text-xs text-gray-600">{day.dayName}</div>
                    <div className={`text-sm font-medium ${
                      day.date.toDateString() === new Date().toDateString() 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                  </div>
                  
                  {/* Time slots for this day */}
                  {generateTimeSlots().map((timeSlot) => (
                    <div key={`${dayIndex}-${timeSlot}`} className="h-20 border border-gray-100 relative">
                      {filteredEvents
                        .filter(event => {
                          const eventDate = new Date(event.date);
                          return (
                            eventDate.toDateString() === day.date.toDateString() &&
                            event.start_time.startsWith(timeSlot)
                          );
                        })
                        .map(event => (
                          <div
                            key={event.id}
                            className={`absolute inset-1 p-1 rounded text-xs ${getEventColor(event.status)} cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                            title={`${event.client_name} - ${event.therapist_name}`}
                          >
                            <div className="font-medium truncate">{event.client_name}</div>
                            <div className="text-gray-600 truncate">{event.therapist_name}</div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Month View
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 border border-gray-200 p-1 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    day.date.toDateString() === new Date().toDateString()
                      ? 'text-blue-600'
                      : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {filteredEvents
                      .filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.toDateString() === day.date.toDateString();
                      })
                      .slice(0, 3)
                      .map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate ${getEventColor(event.status)} cursor-pointer hover:opacity-90 transition-opacity`}
                          title={`${event.start_time} - ${event.client_name}`}
                        >
                          {event.start_time} {event.client_name}
                        </div>
                      ))}
                    
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.toDateString() === day.date.toDateString();
                    }).length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{filteredEvents.filter(event => {
                          const eventDate = new Date(event.date);
                          return eventDate.toDateString() === day.date.toDateString();
                        }).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'scheduled', label: 'Scheduled' },
            { status: 'confirmed', label: 'Confirmed' },
            { status: 'in_progress', label: 'In Progress' },
            { status: 'completed', label: 'Completed' },
            { status: 'cancelled', label: 'Cancelled' },
            { status: 'no_show', label: 'No Show' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                <span className="mr-1">{getStatusIcon(status)}</span>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;