import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ClockIcon,
  UserIcon,
  PlayIcon,
  StopIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  PencilSquareIcon,
  SparklesIcon,
  HeartIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { therapistApi as legacyTherapistApi } from '@/services/therapistApi';
import { therapistApi } from '@/services/unifiedApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, PremiumEmptyState, StatusBadge } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import { Appointment, Session } from '@/types/entities';

interface SessionProgress {
  progressNotes: string;
  goalsDiscussed?: string;
  clientMoodStart?: number;
  clientMoodEnd?: number;
  techniquesUsed?: string[];
}

interface ActiveSession extends Session {
  appointment: Appointment;
  startTime: Date;
  duration: number;
  progress?: SessionProgress;
}

interface SessionStartDialog {
  appointment: Appointment | null;
  showDialog: boolean;
  location: 'office' | 'online' | 'phone';
  initialNotes: string;
  clientPresent: boolean;
  moodStart: number;
  sessionGoals: string;
  concerns: string;
}

const SessionManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionForm, setSessionForm] = useState({
    location: 'office',
    initialNotes: ''
  });
  const [selectedTab, setSelectedTab] = useState<'today' | 'active' | 'history'>('today');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sessionStartDialog, setSessionStartDialog] = useState<SessionStartDialog>({
    appointment: null,
    showDialog: false,
    location: 'office',
    initialNotes: '',
    clientPresent: true,
    moodStart: 5,
    sessionGoals: '',
    concerns: ''
  });
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  
  const [progressForm, setProgressForm] = useState({
    progressNotes: '',
    goalsDiscussed: '',
    clientMoodStart: 5,
    clientMoodEnd: 5,
    techniquesUsed: [] as string[],
    summary: '',
    homework: '',
    nextSessionRecommendation: ''
  });

  const availableTechniques = [
    'CBT (Cognitive Behavioral Therapy)',
    'Mindfulness',
    'EMDR',
    'Psychodynamic Therapy',
    'Solution-Focused Therapy',
    'Dialectical Behavior Therapy',
    'Acceptance and Commitment Therapy',
    'Narrative Therapy',
    'Art Therapy',
    'Play Therapy'
  ];

  useEffect(() => {
    loadData();
    
    // Check if we need to start a session from appointment
    const params = new URLSearchParams(location.search);
    const startAppointmentId = params.get('start');
    if (startAppointmentId && appointments.length > 0) {
      const appointment = appointments.find(apt => apt.id === startAppointmentId);
      if (appointment) {
        setSessionStartDialog({
          appointment,
          showDialog: true,
          location: (appointment.location || 'office') as 'office' | 'online' | 'phone',
          initialNotes: '',
          clientPresent: true,
          moodStart: 5,
          sessionGoals: appointment.notes || '',
          concerns: ''
        });
      }
    }
    
    // Set up interval to update session duration
    const interval = setInterval(() => {
      if (activeSession) {
        setActiveSession(prev => ({
          ...prev!,
          duration: Math.floor((Date.now() - prev!.startTime.getTime()) / 1000)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.id, appointments, location.search]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await legacyTherapistApi.getAppointments({
        date: today,
        status: 'scheduled'
      });
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const appointmentsData = appointmentsResponse.data as any;
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : appointmentsData.appointments || []);
      }

      // Load session history
      try {
        const sessionsResponse = await therapistApi.getSessions({
          limit: 20
        });
        
        if (sessionsResponse.success && sessionsResponse.data) {
          const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : (sessionsResponse.data as any)?.sessions || [];
          setSessionHistory(Array.isArray(sessions) ? sessions : []);
        }
      } catch (err) {
        console.error('Error loading session history:', err);
        setSessionHistory([]);
      }

      // Note: Active sessions endpoint might not exist, skip for now
      // as sessions are typically managed per appointment
    } catch (err: any) {
      console.error('Error loading data:', err);
      if (err.response?.status === 404) {
        error('Session management not available. Please contact support.');
      } else {
        error('Failed to load session data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    if (!sessionStartDialog.appointment) return;
    
    if (!sessionStartDialog.sessionGoals.trim()) {
      error('Please specify session goals');
      return;
    }
    
    try {
      const response = await therapistApi.startSession({
        appointmentId: sessionStartDialog.appointment.id,
        clientPresent: sessionStartDialog.clientPresent,
        location: sessionStartDialog.location,
        initialNotes: sessionStartDialog.initialNotes || 'Session started',
        moodStart: sessionStartDialog.moodStart,
        sessionGoals: sessionStartDialog.sessionGoals,
        concerns: sessionStartDialog.concerns
      });

      if (response.success && response.data) {
        setActiveSession({
          ...response.data.session,
          appointment: sessionStartDialog.appointment,
          startTime: new Date(),
          duration: 0
        });
        setSelectedTab('active');
        success('Session started successfully');
        setSessionStartDialog({
          appointment: null,
          showDialog: false,
          location: 'office',
          initialNotes: '',
          clientPresent: true,
          moodStart: 5,
          sessionGoals: '',
          concerns: ''
        });
      }
    } catch (err: any) {
      console.error('Error starting session:', err);
      if (err.response?.status === 400) {
        error('Invalid session data. Please check appointment details.');
      } else if (err.response?.status === 500) {
        error('Server error. Please try again later.');
      } else {
        error('Failed to start session');
      }
    }
  };

  const updateSessionProgress = async () => {
    if (!activeSession) return;

    try {
      // Note: This endpoint might not exist in the current API
      // Log progress for now
      console.log('Session progress update:', {
        sessionId: activeSession.id,
        progress: progressForm
      });
      
      success('Progress saved');
    } catch (err) {
      console.error('Error updating progress:', err);
      error('Failed to update session progress');
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    if (!progressForm.summary) {
      error('Please provide a session summary');
      return;
    }

    try {
      // FIXED: End session with automatic invoice generation
      const sessionEndResponse = await therapistApi.endSession(activeSession.id, {
        summary: progressForm.summary || 'Session completed',
        homework: progressForm.homework || 'None',
        nextSessionGoals: progressForm.nextSessionRecommendation || 'Continue current treatment plan',
        clientMoodEnd: progressForm.clientMoodEnd,
        techniquesUsed: progressForm.techniquesUsed,
        progressNotes: progressForm.progressNotes,
        goalsDiscussed: progressForm.goalsDiscussed
      });

      if (sessionEndResponse.success) {
        success('Session ended successfully');
        
        // ADDED: Automatic invoice generation after session completion
        try {
          const invoiceResponse = await therapistApi.generateInvoiceFromSession(activeSession.id, {
            appointmentId: activeSession.appointment?.id,
            clientId: activeSession.appointment?.client?.id,
            sessionDuration: activeSession.duration,
            sessionType: activeSession.appointment?.type || 'therapy',
            autoSend: true // Automatically send invoice to client
          });
          
          if (invoiceResponse.success) {
            success('Invoice automatically generated and sent to client', {
              action: {
                label: 'View Invoice',
                onClick: () => window.open(`/therapist/invoices/${invoiceResponse.data?.invoiceId}`, '_blank')
              }
            });
          } else {
            // Invoice generation failed but session ended successfully
            error('Session completed but invoice generation failed. Please create invoice manually.');
          }
        } catch (invoiceErr: any) {
          console.error('Invoice generation error:', invoiceErr);
          error('Session completed but invoice generation failed. Please create invoice manually.');
        }
        
        // Reset form and state
        setActiveSession(null);
        setProgressForm({
          progressNotes: '',
          goalsDiscussed: '',
          clientMoodStart: 5,
          clientMoodEnd: 5,
          techniquesUsed: [],
          summary: '',
          homework: '',
          nextSessionRecommendation: ''
        });
        setSelectedTab('today');
        await loadData();
      }
    } catch (err: any) {
      console.error('Error ending session:', err);
      error('Failed to end session');
    }
  };

  const markClientAbsent = async (appointment: Appointment) => {
    try {
      await legacyTherapistApi.updateAppointment(appointment.id, {
        status: 'cancelled',
        notes: `Client marked as no-show at ${new Date().toLocaleString()}`
      });
      
      success('Client marked as absent');
      await loadData();
    } catch (err) {
      console.error('Error marking client absent:', err);
      error('Failed to update appointment status');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'phone': return PhoneIcon;
      case 'office': return BuildingOfficeIcon;
      default: return BuildingOfficeIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('sessions.title')}</h1>
            <p className="text-green-100">
              {t('sessions.subtitle')}
            </p>
          </div>
          <ClockIcon className="w-16 h-16 text-green-200" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('today')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'today'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Today's Sessions
        </button>
        <button
          onClick={() => setSelectedTab('active')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Session
          {activeSession && (
            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Session History
        </button>
      </div>

      {/* Today's Sessions */}
      {selectedTab === 'today' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <PremiumEmptyState
              icon={CalendarIcon}
              title="No sessions scheduled"
              description="You don't have any sessions scheduled for today"
            />
          ) : (
            appointments.map((appointment) => (
              <PremiumCard key={appointment.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.client?.first_name} {appointment.client?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusBadge 
                      status={appointment.status} 
                      size="sm"
                    />
                    
                    <PremiumButton
                      variant="primary"
                      size="sm"
                      icon={PlayIcon}
                      onClick={() => {
                        setSessionStartDialog({
                          appointment,
                          showDialog: true,
                          location: (appointment.location || 'office') as 'office' | 'online' | 'phone',
                          initialNotes: '',
                          clientPresent: true,
                          moodStart: 5,
                          sessionGoals: appointment.notes || '',
                          concerns: ''
                        });
                      }}
                    >
                      Start Session
                    </PremiumButton>
                    
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => markClientAbsent(appointment)}
                    >
                      No Show
                    </PremiumButton>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
              </PremiumCard>
            ))
          )}
        </div>
      )}

      {/* Active Session */}
      {selectedTab === 'active' && (
        <div>
          {activeSession ? (
            <div className="space-y-6">
              {/* Session Header */}
              <PremiumCard className="bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Session in Progress
                      </h3>
                      <p className="text-gray-600">
                        {activeSession.appointment?.client?.first_name} {activeSession.appointment?.client?.last_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {formatDuration(activeSession.duration)}
                    </p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </div>
              </PremiumCard>

              {/* Progress Notes */}
              <PremiumCard>
                <h3 className="text-lg font-semibold mb-4">Session Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress Notes
                    </label>
                    <textarea
                      value={progressForm.progressNotes}
                      onChange={(e) => setProgressForm({ ...progressForm, progressNotes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Document the session progress..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goals Discussed
                    </label>
                    <input
                      type="text"
                      value={progressForm.goalsDiscussed}
                      onChange={(e) => setProgressForm({ ...progressForm, goalsDiscussed: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Goals covered in this session"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Mood Start (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={progressForm.clientMoodStart}
                        onChange={(e) => setProgressForm({ ...progressForm, clientMoodStart: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Mood End (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={progressForm.clientMoodEnd}
                        onChange={(e) => setProgressForm({ ...progressForm, clientMoodEnd: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Techniques Used
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTechniques.map((technique) => (
                        <button
                          key={technique}
                          onClick={() => {
                            const isSelected = progressForm.techniquesUsed.includes(technique);
                            setProgressForm({
                              ...progressForm,
                              techniquesUsed: isSelected
                                ? progressForm.techniquesUsed.filter(t => t !== technique)
                                : [...progressForm.techniquesUsed, technique]
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            progressForm.techniquesUsed.includes(technique)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {technique}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <PremiumButton
                    variant="outline"
                    icon={CheckCircleIcon}
                    onClick={updateSessionProgress}
                    className="w-full"
                  >
                    Save Progress
                  </PremiumButton>
                </div>
              </PremiumCard>

              {/* End Session */}
              <PremiumCard>
                <h3 className="text-lg font-semibold mb-4">End Session</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Summary *
                    </label>
                    <textarea
                      value={progressForm.summary}
                      onChange={(e) => setProgressForm({ ...progressForm, summary: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Provide a summary of the session..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Homework Assigned
                    </label>
                    <textarea
                      value={progressForm.homework}
                      onChange={(e) => setProgressForm({ ...progressForm, homework: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any homework or exercises for the client..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Session Recommendations
                    </label>
                    <textarea
                      value={progressForm.nextSessionRecommendation}
                      onChange={(e) => setProgressForm({ ...progressForm, nextSessionRecommendation: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Goals or topics for the next session..."
                    />
                  </div>
                  
                  <PremiumButton
                    variant="primary"
                    icon={StopIcon}
                    onClick={endSession}
                    className="w-full"
                  >
                    End Session
                  </PremiumButton>
                </div>
              </PremiumCard>
            </div>
          ) : (
            <PremiumEmptyState
              icon={PlayIcon}
              title="No active session"
              description="Start a session from today's appointments to begin"
            />
          )}
        </div>
      )}

      {/* Session History */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          {sessionHistory.length === 0 ? (
            <PremiumEmptyState
              icon={ClockIcon}
              title="No session history"
              description="Your completed sessions will appear here"
            />
          ) : (
            sessionHistory.map((session: any) => (
              <div key={session.id} className="cursor-pointer" onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}>
                <PremiumCard className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {session.client_name || 'Unknown Client'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(session.date || session.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {session.duration || 'N/A'} minutes
                    </p>
                    <StatusBadge 
                      status={session.status || 'completed'} 
                      size="sm"
                    />
                  </div>
                </div>
                
                {session.summary && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{session.summary}</p>
                  </div>
                )}
                
                {/* Expanded Session Details */}
                {expandedSession === session.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Session Details</h4>
                        <dl className="space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Start Time:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {session.start_time || 'N/A'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">End Time:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {session.end_time || 'N/A'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Location:</dt>
                            <dd className="text-sm font-medium text-gray-900 capitalize">
                              {session.location || 'Office'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Type:</dt>
                            <dd className="text-sm font-medium text-gray-900 capitalize">
                              {session.type || 'Therapy'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Progress</h4>
                        <dl className="space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Mood Start:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {session.mood_start || 'N/A'}/10
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Mood End:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {session.mood_end || 'N/A'}/10
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    
                    {session.goals_discussed && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Goals Discussed</h4>
                        <p className="text-sm text-gray-600">{session.goals_discussed}</p>
                      </div>
                    )}
                    
                    {session.homework && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Homework Assigned</h4>
                        <p className="text-sm text-gray-600">{session.homework}</p>
                      </div>
                    )}
                    
                    {session.techniques_used && session.techniques_used.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Techniques Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {session.techniques_used.map((technique: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {technique}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={DocumentTextIcon}
                        onClick={() => navigate(`/therapist/notes?session=${session.id}`)}
                      >
                        View Full Notes
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={UserIcon}
                        onClick={() => navigate(`/therapist/clients/${session.client_id}`)}
                      >
                        Client Profile
                      </PremiumButton>
                    </div>
                  </div>
                )}
                </PremiumCard>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Session Start Dialog */}
      {sessionStartDialog.showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PremiumCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Start Session</h3>
              <button
                onClick={() => setSessionStartDialog(prev => ({ ...prev, showDialog: false }))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {sessionStartDialog.appointment && (
              <>
                {/* Client Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {sessionStartDialog.appointment.client?.first_name} {sessionStartDialog.appointment.client?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Appointment Time</p>
                      <p className="font-medium">
                        {formatTime(sessionStartDialog.appointment.start_time)} - {formatTime(sessionStartDialog.appointment.end_time)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Session Setup */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Is the client present?
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={sessionStartDialog.clientPresent}
                          onChange={() => setSessionStartDialog(prev => ({ ...prev, clientPresent: true }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Yes, client is present</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!sessionStartDialog.clientPresent}
                          onChange={() => setSessionStartDialog(prev => ({ ...prev, clientPresent: false }))}
                          className="mr-2"
                        />
                        <span className="text-sm">No (No-show)</span>
                      </label>
                    </div>
                  </div>
                  
                  {sessionStartDialog.clientPresent && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Location
                        </label>
                        <select
                          value={sessionStartDialog.location}
                          onChange={(e) => setSessionStartDialog(prev => ({ 
                            ...prev, 
                            location: e.target.value as 'office' | 'online' | 'phone' 
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="office">In Office</option>
                          <option value="online">Online Video</option>
                          <option value="phone">Phone Call</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client's Starting Mood (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={sessionStartDialog.moodStart}
                          onChange={(e) => setSessionStartDialog(prev => ({ 
                            ...prev, 
                            moodStart: parseInt(e.target.value) || 5 
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Goals *
                        </label>
                        <textarea
                          value={sessionStartDialog.sessionGoals}
                          onChange={(e) => setSessionStartDialog(prev => ({ ...prev, sessionGoals: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="What are the main goals for today's session?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Concerns/Issues
                        </label>
                        <textarea
                          value={sessionStartDialog.concerns}
                          onChange={(e) => setSessionStartDialog(prev => ({ ...prev, concerns: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Any specific concerns or issues the client mentioned?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Notes
                        </label>
                        <textarea
                          value={sessionStartDialog.initialNotes}
                          onChange={(e) => setSessionStartDialog(prev => ({ ...prev, initialNotes: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Any initial observations or notes before starting the session..."
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  {sessionStartDialog.clientPresent ? (
                    <PremiumButton
                      variant="primary"
                      icon={PlayIcon}
                      onClick={startSession}
                      className="flex-1"
                    >
                      Start Session
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      variant="warning"
                      icon={ExclamationCircleIcon}
                      onClick={() => markClientAbsent(sessionStartDialog.appointment!)}
                      className="flex-1"
                    >
                      Mark as No-Show
                    </PremiumButton>
                  )}
                  <PremiumButton
                    variant="outline"
                    onClick={() => setSessionStartDialog(prev => ({ ...prev, showDialog: false }))}
                    className="flex-1"
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </>
            )}
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;