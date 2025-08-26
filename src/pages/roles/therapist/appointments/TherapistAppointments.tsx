import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExclamationTriangleIcon,
  ChevronDownIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTherapistAppointments } from '@/hooks/useRealApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumListItem, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { therapistApi } from '@/services/therapistApi';
import { realApiService } from '@/services/realApi';
import { formatDate, formatTime } from '@/utils/dateFormatters';

// Types
interface ClientInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance_info?: {
    provider: string;
    policy_number: string;
  };
  last_session_date?: string;
  total_sessions?: number;
  therapy_goals?: string[];
}

interface Appointment {
  id: string;
  client_name: string;
  client_id: string;
  client?: ClientInfo;
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
  recurring?: boolean;
  recurring_pattern?: string;
  video_link?: string;
}

const TherapistAppointments: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appointments: apiAppointments, getAppointments, isLoading, error: apiError } = useTherapistAppointments();
  const { success, info, warning, error: showError } = useAlert();

  // Debug logging
  useEffect(() => {
  }, [user]);

  useEffect(() => {
  }, [apiAppointments, isLoading, apiError]);

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [hasClients, setHasClients] = useState<boolean | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [showNoShowDialog, setShowNoShowDialog] = useState<string | null>(null);
  const [noShowReason, setNoShowReason] = useState('');


  // Use refs to prevent re-renders and infinite loops
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Load appointments on mount - only once
  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedRef.current || isLoadingRef.current) {
      return;
    }

    const loadAppointments = async () => {
      isLoadingRef.current = true;
      try {
        hasLoadedRef.current = true;
        // Call the getAppointments function from the hook
        if (getAppointments) {
          const result = await getAppointments();
        } else {
          // Fallback: Use the general appointments API if therapist-specific fails
          const response = await realApiService.appointments.getAll({ 
            status: 'scheduled' 
          });
          if (response.success && response.data) {
            setAppointments(response.data.appointments || []);
          }
        }
      } catch (err: any) {
        console.error('[TherapistAppointments] Error loading appointments:', err);
        console.error('[TherapistAppointments] Error response:', err?.response);
        console.error('[TherapistAppointments] Error status:', err?.response?.status);
        console.error('[TherapistAppointments] Error data:', err?.response?.data);
        console.error('Failed to load appointments:', err);
        
        // Check if it's a rate limit error
        if (err?.response?.status === 429) {
          warning('Too many requests. Please wait a moment before refreshing.');
        } else if (err?.response?.status === 403) {
          showError('Access denied. Please check your permissions.');
        } else if (err?.response?.status === 401) {
          showError('Session expired. Please login again.');
        } else if (err?.response?.status === 500) {
          showError('Server error. Please try again later.');
        } else if (err?.response?.status === 404) {
          // 404 might mean no appointments endpoint or no appointments
          info('No appointments found.');
          setAppointments([]);
        } else {
          // Generic error - don't retry automatically
          showError('Unable to load appointments. Please use the refresh button.');
          setAppointments([]); // Set empty to prevent infinite loop
        }
      } finally {
        isLoadingRef.current = false;
      }
    };

    // Add a small delay to prevent immediate API calls on mount
    const timer = setTimeout(() => {
      loadAppointments();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Update local appointments when API data changes
  useEffect(() => {
    if (Array.isArray(apiAppointments)) {
      // Map API data to appointment format
      const mappedAppointments = apiAppointments.map((apt, index) => {
        return {
        id: apt.id || apt.appointment_id || String(Math.random()),
        client_name: apt.client_name || apt.client?.name || `${apt.client_first_name || ''} ${apt.client_last_name || ''}`.trim() || 'Unknown Client',
        client_id: apt.client_id,
        client: apt.client || (apt.client_id ? {
          id: apt.client_id,
          first_name: apt.client_first_name || apt.client?.first_name || '',
          last_name: apt.client_last_name || apt.client?.last_name || '',
          email: apt.client_email || apt.client?.email || '',
          phone: apt.client_phone || apt.client?.phone || '',
          profile_photo_url: apt.client?.profile_photo_url,
          last_session_date: apt.client?.last_session_date,
          total_sessions: apt.client?.total_sessions,
          therapy_goals: apt.client?.therapy_goals
        } : undefined),
        date: apt.date || apt.appointment_date,
        time: apt.time || apt.appointment_time || apt.start_time,
        duration: apt.duration || 50,
        type: apt.type || 'therapy',
        location: apt.location || 'office',
        status: apt.status || 'scheduled',
        notes: apt.notes,
        preparation_notes: apt.preparation_notes,
        session_notes: apt.session_notes,
        priority: apt.priority || 'normal',
        recurring: apt.recurring,
        recurring_pattern: apt.recurring_pattern,
        video_link: apt.video_link
      }});
      setAppointments(mappedAppointments);
    } else {
      // If no appointments or invalid data, set empty array
      setAppointments([]);
    }
    
    // Check if therapist has been assigned any clients
    checkTherapistClients();
  }, [apiAppointments]);

  // Check if therapist has any assigned clients
  const checkTherapistClients = async () => {
    try {
      const response = await realApiService.therapist.getClients();
      if (response.success && response.data) {
        const clients = Array.isArray(response.data) ? response.data : [];
        setHasClients(clients.length > 0);
      }
    } catch (error) {
      console.error('Failed to check assigned clients:', error);
      setHasClients(false);
    }
  };

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

  // Handle creating new appointment
  const handleCreateAppointment = async () => {
    try {
      // In a real application, this would open a modal or navigate to a form
      // For now, we'll just show a message indicating the functionality is available
      info('New appointment creation - Integration with appointment booking system needed');
      
      // Example of how it would work:
      // const appointmentData = {
      //   client_id: 'selected_client_id',
      //   date: '2024-08-15',
      //   time: '10:00',
      //   duration: 50,
      //   type: 'therapy',
      //   location: 'office',
      //   notes: 'Regular therapy session'
      // };
      // 
      // const response = await therapistApi.createAppointment(appointmentData);
      // if (response.success) {
      //   success('Appointment created successfully');
      //   await getAppointments(); // Refresh the list
      // }
    } catch (err: any) {
      showError(`Failed to create appointment: ${err.response?.data?.message || err.message}`);
    }
  };

  // Manual refresh function
  const refreshAppointments = async () => {
    if (isLoadingRef.current) {
      warning('Already loading appointments...');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      if (getAppointments) {
        await getAppointments();
        success('Appointments refreshed');
      }
    } catch (err) {
      showError('Failed to refresh appointments');
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Handle appointment actions
  const handleAppointmentAction = async (appointmentId: string, action: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    try {
      switch (action) {
        case 'complete':
          const completeResponse = await therapistApi.updateAppointment(appointmentId, { 
            status: 'completed',
            session_notes: 'Session completed'
          });
          if (completeResponse.success) {
            setAppointments(prev => 
              prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'completed' } : apt)
            );
            success(`Session with ${appointment.client_name} marked as completed`);
          }
          break;
        case 'cancel':
          const cancelResponse = await therapistApi.updateAppointment(appointmentId, { 
            status: 'cancelled',
            notes: 'Appointment cancelled by therapist'
          });
          if (cancelResponse.success) {
            setAppointments(prev => 
              prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt)
            );
            warning(`Appointment with ${appointment.client_name} cancelled`);
          }
          break;
        case 'reschedule':
          info(`Opening scheduler for ${appointment.client_name} - Integration with calendar system needed`);
          break;
        case 'notes':
          info(`Opening session notes for ${appointment.client_name} - Notes interface integration needed`);
          break;
        case 'join':
          if (appointment.location === 'online') {
            success(`Joining online session with ${appointment.client_name}`);
            // In a real app, this would open the video conferencing platform
          }
          break;
        case 'call':
          if (appointment.location === 'phone') {
            info(`Calling ${appointment.client_name} - Phone system integration needed`);
            // In a real app, this would integrate with a phone system
          }
          break;
        case 'no_show':
          setShowNoShowDialog(appointmentId);
          break;
      }
    } catch (err: any) {
      showError(`Failed to ${action} appointment: ${err.response?.data?.message || err.message}`);
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

  // Show loading state
  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error state if there's an API error and no appointments
  if (apiError && appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
        <p className="text-gray-600">Unable to load appointments</p>
        <button
          onClick={refreshAppointments}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
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
              icon={ClockIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={refreshAppointments}
            >
              Refresh
            </PremiumButton>
            <PremiumButton
              variant="outline"
              icon={PlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => handleCreateAppointment()}
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
        {appointments.length === 0 && !isLoading && hasClients === false ? (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <UserIcon className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Welcome to Your Practice
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                You haven't been assigned any clients yet. The administrator will assign clients to you based on your specializations and availability.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  What happens next?
                </h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-blue-900 text-center text-sm font-semibold mr-3 flex-shrink-0">1</span>
                    <span>Clients will request appointments through the platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-blue-900 text-center text-sm font-semibold mr-3 flex-shrink-0">2</span>
                    <span>An administrator will review their needs and assign them to you based on your specializations and availability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-blue-900 text-center text-sm font-semibold mr-3 flex-shrink-0">3</span>
                    <span>You'll receive a notification when a new client is assigned to you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-blue-900 text-center text-sm font-semibold mr-3 flex-shrink-0">4</span>
                    <span>Their appointments will automatically appear in this dashboard</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 flex justify-center space-x-4">
                <PremiumButton
                  variant="primary"
                  icon={UserIcon}
                  onClick={() => window.location.href = '/therapist/profile'}
                >
                  Update Your Profile
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  icon={ClockIcon}
                  onClick={refreshAppointments}
                >
                  Check for Updates
                </PremiumButton>
              </div>
            </div>
          </div>
        ) : appointments.length === 0 && !isLoading && hasClients === true ? (
          <PremiumEmptyState
            icon={CalendarIcon}
            title="No Appointments Scheduled"
            description="You have been assigned clients, but no appointments are scheduled yet. Clients will book appointments with you soon."
            action={{
              label: 'Create Appointment',
              onClick: () => handleCreateAppointment()
            }}
          />
        ) : filteredAppointments.length === 0 ? (
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
                <>
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedAppointment(expandedAppointment === appointment.id ? null : appointment.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${
                          expandedAppointment === appointment.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                  }
                  onClick={() => setExpandedAppointment(expandedAppointment === appointment.id ? null : appointment.id)}
                >
                  <div className="flex-1 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {appointment.client?.profile_photo_url ? (
                          <img
                            src={appointment.client.profile_photo_url}
                            alt={appointment.client_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.client_name}</h4>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                          {appointment.client?.email && (
                            <p className="text-xs text-gray-500">{appointment.client.email}</p>
                          )}
                        </div>
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
                      {appointment.recurring && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Recurring: {appointment.recurring_pattern}
                        </span>
                      )}
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
                
                {/* Expanded Appointment Details */}
                {expandedAppointment === appointment.id && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Client Information */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Client Information</h5>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Phone:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {appointment.client?.phone || 'Not provided'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Date of Birth:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {appointment.client?.date_of_birth ? formatDate(appointment.client.date_of_birth) : 'Not provided'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Total Sessions:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {appointment.client?.total_sessions || 0}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Last Session:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {appointment.client?.last_session_date ? formatDate(appointment.client.last_session_date) : 'First session'}
                            </dd>
                          </div>
                        </dl>
                        
                        {appointment.client?.emergency_contact && (
                          <div className="mt-4">
                            <h6 className="text-sm font-semibold text-gray-900 mb-2">Emergency Contact</h6>
                            <p className="text-sm text-gray-600">
                              {appointment.client.emergency_contact.name} ({appointment.client.emergency_contact.relationship})<br />
                              {appointment.client.emergency_contact.phone}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Session Details & Actions */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Session Details</h5>
                        
                        {appointment.client?.therapy_goals && appointment.client.therapy_goals.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-semibold text-gray-700 mb-1">Therapy Goals</h6>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {appointment.client.therapy_goals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {appointment.location === 'online' && appointment.video_link && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Video Call Link</p>
                            <a href={appointment.video_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700">
                              {appointment.video_link}
                            </a>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {appointment.status === 'scheduled' && isUpcoming && (
                            <>
                              <div className="flex space-x-2">
                                {appointment.location === 'online' && (
                                  <PremiumButton
                                    size="sm"
                                    variant="primary"
                                    icon={VideoCameraIcon}
                                    onClick={() => handleAppointmentAction(appointment.id, 'join')}
                                    className="flex-1"
                                  >
                                    Join Video Call
                                  </PremiumButton>
                                )}
                                {appointment.location === 'phone' && (
                                  <PremiumButton
                                    size="sm"
                                    variant="primary"
                                    icon={PhoneIcon}
                                    onClick={() => handleAppointmentAction(appointment.id, 'call')}
                                    className="flex-1"
                                  >
                                    Call Client
                                  </PremiumButton>
                                )}
                                <PremiumButton
                                  size="sm"
                                  variant="success"
                                  icon={PlayIcon}
                                  onClick={() => navigate(`/therapist/sessions?start=${appointment.id}`)}
                                  className="flex-1"
                                >
                                  Start Session
                                </PremiumButton>
                              </div>
                              
                              <div className="flex space-x-2">
                                <PremiumButton
                                  size="sm"
                                  variant="outline"
                                  icon={PencilIcon}
                                  onClick={() => handleAppointmentAction(appointment.id, 'reschedule')}
                                  className="flex-1"
                                >
                                  Reschedule
                                </PremiumButton>
                                <PremiumButton
                                  size="sm"
                                  variant="outline"
                                  icon={XMarkIcon}
                                  onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                  className="flex-1"
                                >
                                  Cancel
                                </PremiumButton>
                                <PremiumButton
                                  size="sm"
                                  variant="outline"
                                  icon={ExclamationTriangleIcon}
                                  onClick={() => handleAppointmentAction(appointment.id, 'no_show')}
                                  className="flex-1"
                                >
                                  No Show
                                </PremiumButton>
                              </div>
                            </>
                          )}
                          
                          <div className="flex space-x-2">
                            <PremiumButton
                              size="sm"
                              variant="outline"
                              icon={DocumentTextIcon}
                              onClick={() => navigate(`/therapist/notes?client=${appointment.client_id}`)}
                              className="flex-1"
                            >
                              View Notes
                            </PremiumButton>
                            <PremiumButton
                              size="sm"
                              variant="outline"
                              icon={UserIcon}
                              onClick={() => navigate(`/therapist/clients/${appointment.client_id}`)}
                              className="flex-1"
                            >
                              Client Profile
                            </PremiumButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </>
              );
            })}
          </div>
        )}
      </PremiumCard>
      
      {/* No-Show Confirmation Dialog */}
      {showNoShowDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PremiumCard className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark as No-Show</h3>
            <p className="text-gray-600 mb-4">
              Marking the client as no-show will update the appointment status and may apply the practice's no-show policy.
            </p>
            <textarea
              value={noShowReason}
              onChange={(e) => setNoShowReason(e.target.value)}
              placeholder="Reason for no-show (optional)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> The client will be notified of the no-show status.
              </p>
            </div>
            <div className="flex space-x-3">
              <PremiumButton
                variant="warning"
                onClick={async () => {
                  const appointment = appointments.find(apt => apt.id === showNoShowDialog);
                  if (!appointment) return;
                  
                  try {
                    const noShowResponse = await therapistApi.updateAppointment(showNoShowDialog, { 
                      status: 'no_show',
                      notes: `Client did not show up for appointment. ${noShowReason}`.trim()
                    });
                    if (noShowResponse.success) {
                      setAppointments(prev => 
                        prev.map(apt => apt.id === showNoShowDialog ? { ...apt, status: 'no_show' } : apt)
                      );
                      warning(`${appointment.client_name} marked as no-show`);
                      setShowNoShowDialog(null);
                      setNoShowReason('');
                    }
                  } catch (err: any) {
                    showError(`Failed to update status: ${err.message}`);
                  }
                }}
                className="flex-1"
              >
                Confirm No-Show
              </PremiumButton>
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setShowNoShowDialog(null);
                  setNoShowReason('');
                }}
                className="flex-1"
              >
                Cancel
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default TherapistAppointments;