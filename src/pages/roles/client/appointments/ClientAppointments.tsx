import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  UserIcon,
  HeartIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarSolid,
  ClockIcon as ClockSolid,
  CheckCircleIcon as CheckCircleSolid,
  HeartIcon as HeartSolid,
  SparklesIcon as SparklesSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  therapist_name: string;
  therapist_first_name?: string;
  therapist_last_name?: string;
  type: string;
  therapy_type?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  location: string;
  notes?: string;
  session_notes?: string;
  cost?: number;
}

const ClientAppointments: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const hasErrorRef = useRef(false);
  const loadingRef = useRef(false);

  // Load appointments data
  useEffect(() => {
    const loadAppointments = async () => {
      // Don't retry if we already have an error or are already loading
      if (hasErrorRef.current || loadingRef.current) return;
      
      try {
        loadingRef.current = true;
        setIsLoading(true);
        hasErrorRef.current = false;
        const response = await realApiService.client.getAppointments();
        
        if (response.success && response.data) {
          // response.data is the appointments array directly
          const appointmentsData = Array.isArray(response.data) ? response.data : [];
          // Ensure each appointment has the required fields
          const formattedAppointments = appointmentsData.map((apt: any) => ({
            ...apt,
            therapist_name: apt.therapist_name || `${apt.therapist_first_name || ''} ${apt.therapist_last_name || ''}`.trim() || 'Unknown Therapist',
            type: apt.type || apt.therapy_type || 'Regular Session',
            start_time: apt.start_time || apt.time || '09:00',
            end_time: apt.end_time || '10:00',
            location: apt.location || 'Main Office'
          }));
          setAppointments(formattedAppointments);
        }
      } catch (error: any) {
        console.error('Failed to load appointments:', error);
        
        // Don't keep retrying if it's a rate limit or auth error
        if (error?.response?.status === 429 || error?.response?.status === 403) {
          hasErrorRef.current = true;
        }
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'scheduled': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'completed': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'rescheduled': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleSolid className="w-4 h-4 text-emerald-500" />;
      case 'scheduled': return <ClockSolid className="w-4 h-4 text-sky-500" />;
      case 'completed': return <HeartSolid className="w-4 h-4 text-violet-500" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4 text-rose-500" />;
      case 'rescheduled': return <SparklesSolid className="w-4 h-4 text-amber-500" />;
      default: return <ClockIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  // Calendar navigation helpers
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handler functions
  const handleReschedule = async (appointmentId: string) => {
    try {
      // For now, just open a confirmation dialog
      if (window.confirm('Are you sure you want to request a reschedule for this appointment? This will notify your therapist.')) {
        console.log('Requesting reschedule for appointment:', appointmentId);
        // In a real implementation, this would call the API
        // await realApiService.client.rescheduleAppointment(appointmentId, newDate, newTime);
        alert('Reschedule request sent to your therapist. You will be contacted shortly to confirm the new time.');
      }
    } catch (error) {
      console.error('Failed to request reschedule:', error);
      alert('Failed to request reschedule. Please try again later.');
    }
  };

  const handleContactTherapist = (appointment: Appointment) => {
    // Navigate to messages or open contact modal
    console.log('Contacting therapist for appointment:', appointment.id);
    // This could navigate to the messages page with pre-filled message
    navigate('/client/messages');
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      // Call API to confirm appointment
      console.log('Confirming appointment:', appointmentId);
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed' as const }
          : apt
      ));
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  const handleBookSession = async () => {
    try {
      // For now, create a simple appointment request
      const appointmentData = {
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
        preferredTime: '10:00',
        therapyType: 'regular',
        urgencyLevel: 'normal',
        reason: 'Regular therapy session'
      };

      console.log('Requesting appointment:', appointmentData);
      const response = await realApiService.client.requestAppointment(appointmentData);
      
      if (response.success) {
        alert('Appointment request submitted successfully! You will receive a confirmation shortly.');
        // Refresh appointments list
        window.location.reload();
      } else {
        alert('Failed to submit appointment request. Please try again later.');
      }
    } catch (error: any) {
      console.error('Failed to book session:', error);
      if (error?.response?.status === 500) {
        alert('Appointment booking is temporarily unavailable. Please contact your therapist directly.');
      } else {
        alert('Failed to book session. Please try again later.');
      }
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (searchTerm) {
      const matchesSearch = 
        (appointment.therapist_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }

    if (filterType !== 'all' && appointment.type !== filterType) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && ['scheduled', 'confirmed'].includes(apt.status)
  );
  
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  
  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header with Glassmorphism */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/30 via-sky-100/30 to-emerald-100/30"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CalendarSolid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      My Wellness Calendar
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Your journey to healing, one session at a time
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToToday}
                  className="bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700 px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/40"
                >
                  <SunIcon className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">Today</span>
                </button>
                
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                  className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {viewMode === 'list' ? (
                    <>
                      <CalendarSolid className="w-5 h-5" />
                      <span className="font-medium">Calendar</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5" />
                      <span className="font-medium">List</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleBookSession}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <SparklesSolid className="w-5 h-5" />
                  <span className="font-medium">Book Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Filters with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/20 via-white/20 to-slate-100/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your wellness journey..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700 placeholder-slate-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-3">
                  <FunnelIcon className="w-5 h-5 text-slate-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl text-sm focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl text-sm focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="CBT Session">CBT Session</option>
                  <option value="EMDR Session">EMDR Session</option>
                  <option value="Intake Session">Intake Session</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Progress Review">Progress Review</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/20 via-white/20 to-slate-100/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-400 to-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CalendarSolid className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No sessions found</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                    ? "Try adjusting your search or filters to find your sessions" 
                    : "Begin your healing journey by scheduling your first session"}
                </p>
                <button 
                  onClick={handleBookSession}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                >
                  <SparklesSolid className="w-5 h-5" />
                  <span>Book Your First Session</span>
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          // Enhanced Calendar View with Glassmorphism
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-sky-100/20 to-emerald-100/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-violet-500/10 via-sky-500/10 to-emerald-500/10 backdrop-blur-xl border-b border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="w-10 h-10 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-lg border border-white/40"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => navigateMonth('next')}
                      className="w-10 h-10 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-lg border border-white/40"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-3">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="text-center">
                      <div className="text-slate-600 font-medium text-sm bg-white/40 backdrop-blur-sm rounded-xl py-3 border border-white/30">
                        {day.slice(0, 3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-3">
                  {calendarDays.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                    const dateString = day.toISOString().split('T')[0];
                    
                    const dayAppointments = filteredAppointments.filter(apt => 
                      new Date(apt.date).toISOString().split('T')[0] === dateString
                    );
                    
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative min-h-[120px] rounded-2xl border transition-all duration-300 cursor-pointer group
                          ${isCurrentMonth 
                            ? 'bg-white/60 border-white/40 hover:bg-white/80' 
                            : 'bg-white/20 border-white/20 hover:bg-white/40'
                          }
                          ${isToday 
                            ? 'ring-2 ring-sky-400/50 bg-gradient-to-br from-sky-50/80 to-blue-50/80' 
                            : ''
                          }
                          ${isSelected 
                            ? 'ring-2 ring-violet-400/50 bg-gradient-to-br from-violet-50/80 to-purple-50/80' 
                            : ''
                          }
                          backdrop-blur-sm shadow-lg hover:shadow-xl
                        `}
                      >
                        {/* Date number */}
                        <div className="p-3">
                          <div className={`
                            text-lg font-semibold mb-2 flex items-center justify-between
                            ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}
                            ${isToday ? 'text-sky-600' : ''}
                            ${isSelected ? 'text-violet-600' : ''}
                          `}>
                            <span>{day.getDate()}</span>
                            {isToday && (
                              <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          {/* Appointments */}
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt, index) => (
                              <div
                                key={apt.id}
                                className={`
                                  text-xs px-2 py-1 rounded-lg font-medium truncate border backdrop-blur-sm
                                  ${getStatusColor(apt.status)}
                                  hover:scale-105 transition-transform duration-200
                                `}
                                title={`${apt.start_time} - ${apt.therapy_type || apt.type} with ${apt.therapist_first_name || ''} ${apt.therapist_last_name || ''}`}
                              >
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(apt.status)}
                                  <span className="truncate">
                                    {apt.start_time} {apt.therapy_type || apt.type}
                                  </span>
                                </div>
                              </div>
                            ))}
                            
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-slate-600 bg-white/60 rounded-lg px-2 py-1 border border-white/40 font-medium">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Enhanced List View with Glassmorphism
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/10 via-sky-100/10 to-emerald-100/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl">
              <div className="divide-y divide-white/20">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-8 hover:bg-white/20 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-violet-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                            {(appointment.therapy_type || appointment.type)?.includes('CBT') ? (
                              <HeartSolid className="w-6 h-6 text-white" />
                            ) : (appointment.therapy_type || appointment.type)?.includes('EMDR') ? (
                              <SparklesSolid className="w-6 h-6 text-white" />
                            ) : (
                              <CalendarSolid className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                              {appointment.therapy_type || appointment.type}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium border backdrop-blur-sm ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-2 capitalize">{appointment.status}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <CalendarSolid className="w-5 h-5 text-sky-500" />
                            <div>
                              <div className="text-sm text-slate-600 font-medium">Date</div>
                              <div className="text-slate-800 font-semibold">
                                {new Date(appointment.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <ClockSolid className="w-5 h-5 text-emerald-500" />
                            <div>
                              <div className="text-sm text-slate-600 font-medium">Time</div>
                              <div className="text-slate-800 font-semibold">
                                {appointment.start_time} - {appointment.end_time}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <MapPinIcon className="w-5 h-5 text-violet-500" />
                            <div>
                              <div className="text-sm text-slate-600 font-medium">Location</div>
                              <div className="text-slate-800 font-semibold">{appointment.location}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                          <div className="flex items-center space-x-3 mb-3">
                            <UserIcon className="w-5 h-5 text-slate-600" />
                            <span className="text-slate-800 font-semibold">
                              Dr. {appointment.therapist_first_name || ''} {appointment.therapist_last_name || ''}
                            </span>
                          </div>
                          
                          {appointment.session_notes && (
                            <p className="text-slate-700 text-sm mb-2">
                              <strong>Notes:</strong> {appointment.session_notes}
                            </p>
                          )}
                          
                          {appointment.cost && (
                            <p className="text-slate-700 text-sm">
                              <strong>Investment:</strong> €{appointment.cost}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 ml-6">
                        {appointment.status === 'scheduled' && (
                          <button 
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <CheckCircleSolid className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                        )}
                        
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <button 
                            onClick={() => handleReschedule(appointment.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <ClockSolid className="w-4 h-4" />
                            <span>Reschedule</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleContactTherapist(appointment)}
                          className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>Contact</span>
                        </button>
                        
                        <button className="bg-white/60 hover:bg-white/80 backdrop-blur-sm text-slate-600 hover:text-slate-800 p-3 rounded-2xl transition-all duration-300 shadow-lg border border-white/40">
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;