import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
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
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTherapistDashboard, useAppointments } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CalendarEvent {
  id: string;
  title: string;
  client_name: string;
  start_time: string;
  end_time: string;
  date: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'in_progress';
  location: string;
  notes?: string;
  client_phone?: string;
  duration: number;
  urgency?: 'normal' | 'high' | 'urgent';
  session_number?: number;
  client_goals?: string[];
  preparation_notes?: string;
  insurance_approved?: boolean;
}

type ViewMode = 'day' | 'week' | 'month' | 'list';

const TherapistCalendar: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  
  // API hooks
  const { getAppointments: getTherapistAppointments, isLoading: appointmentsLoading } = useTherapistDashboard();
  
  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Load data
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        // Get appointments from real API
        const appointmentsData = await getTherapistAppointments();

        if (appointmentsData) {
          // Transform API data to calendar events
          const therapistAppointments: CalendarEvent[] = (Array.isArray(appointmentsData) ? appointmentsData : [])
            .map((apt: any) => ({
              id: apt.id,
              title: `${apt.type || 'Session'} - ${apt.clientName || apt.client_name || 'Unknown Client'}`,
              client_name: apt.clientName || apt.client_name || 'Unknown Client',
              start_time: apt.time || apt.start_time || '09:00',
              end_time: apt.end_time || (apt.time ? String(parseInt(apt.time.split(':')[0]) + 1) + ':' + apt.time.split(':')[1] : '10:00'),
              date: apt.date,
              type: apt.type || 'regular',
              status: apt.status || 'scheduled',
              location: apt.location || 'Room 1',
              notes: apt.notes,
              client_phone: apt.client_phone,
              duration: apt.duration || 50
            }));
          
          setEvents(therapistAppointments);
          setFilteredEvents(therapistAppointments);
        }
      } catch (error) {
        console.error('Failed to load calendar data:', error);
        // Set empty array on error
        setEvents([]);
        setFilteredEvents([]);
      }
    };

    loadCalendarData();
  }, []); // Remove dependency to prevent infinite loop

  // Filter events
  useEffect(() => {
    let filtered = events;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    setFilteredEvents(filtered);
  }, [events, selectedStatus, selectedType]);

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
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
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
        return t('therapist.allAppointments');
      default:
        return '';
    }
  };

  // Get unique types for filters
  const types = [...new Set(events.map(event => event.type))];

  // Get today's appointments
  const todayEvents = filteredEvents.filter(event => 
    event.date === new Date().toISOString().split('T')[0]
  );

  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('therapist.myCalendar')}</h1>
            <p className="text-red-100 mt-1">
              {t('therapist.calendarSubtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>{t('therapist.newAppointment')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Appointments Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-red-600" />
            {t('therapist.todaySchedule')} ({todayEvents.length})
          </h2>
          <div className="text-sm text-gray-600">
            {todayEvents.reduce((sum, event) => sum + event.duration, 0)} minutes total
          </div>
        </div>
        
        {todayEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('therapist.noAppointmentsToday')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayEvents.map((event) => (
              <div key={event.id} className={`p-4 rounded-lg border-2 ${getStatusColor(event.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.status)}
                    <span className="text-sm font-medium">
                      {formatTimeRange(event.start_time, event.end_time)}
                    </span>
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded">
                    {event.duration}m
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{event.client_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{event.type}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="text-blue-600 hover:text-blue-700 p-1">
                      <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-700 p-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                    ? 'bg-white text-red-600 shadow-sm'
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
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

      {/* Calendar Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {viewMode === 'list' ? (
          <div className="divide-y divide-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('therapist.allAppointments')} ({filteredEvents.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('agenda.noAppointments')}</p>
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
                              <ClockIcon className="w-4 h-4" />
                              <span>{event.duration}m</span>
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
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                          {t('agenda.viewDetails')}
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                          {t('action.edit')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Calendar Grid View</p>
              <p className="text-gray-400 text-sm">
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('agenda.statusLegend')}</h4>
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

export default TherapistCalendar;