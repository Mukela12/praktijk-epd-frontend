import React, { useState, useEffect } from 'react';
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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
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

const SessionManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'today' | 'active' | 'history'>('today');
  const [sessionForm, setSessionForm] = useState({
    location: 'office' as 'office' | 'online' | 'phone',
    initialNotes: '',
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
  }, [activeSession?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await realApiService.therapist.getAppointments({
        date: today,
        status: 'scheduled'
      });
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const appointmentsData = appointmentsResponse.data as any;
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : appointmentsData.appointments || []);
      }

      // Load session history
      const sessionsResponse = await realApiService.sessions.getHistory({
        limit: 20
      });
      
      if (sessionsResponse.success && sessionsResponse.data) {
        setSessionHistory(sessionsResponse.data.sessions || []);
      }

      // Check for any active sessions
      const activeSessionsResponse = await realApiService.sessions.getActive();
      if (activeSessionsResponse.success && activeSessionsResponse.data?.session) {
        const session = activeSessionsResponse.data.session;
        setActiveSession({
          ...session,
          startTime: new Date(session.started_at),
          duration: Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
        });
        setSelectedTab('active');
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (appointment: Appointment) => {
    try {
      const response = await realApiService.sessions.start({
        appointmentId: appointment.id,
        clientPresent: true,
        location: sessionForm.location,
        initialNotes: sessionForm.initialNotes
      });

      if (response.success && response.data) {
        setActiveSession({
          ...response.data.session,
          appointment,
          startTime: new Date(),
          duration: 0
        });
        setSelectedTab('active');
        success('Session started successfully!');
        await loadData();
      }
    } catch (err) {
      error('Failed to start session. Please try again.');
    }
  };

  const updateProgress = async () => {
    if (!activeSession) return;

    try {
      await realApiService.sessions.updateProgress(activeSession.id, {
        progressNotes: sessionForm.progressNotes,
        goalsDiscussed: sessionForm.goalsDiscussed,
        clientMoodStart: sessionForm.clientMoodStart,
        clientMoodEnd: sessionForm.clientMoodEnd,
        techniquesUsed: sessionForm.techniquesUsed
      });

      setActiveSession(prev => ({
        ...prev!,
        progress: {
          progressNotes: sessionForm.progressNotes,
          goalsDiscussed: sessionForm.goalsDiscussed,
          clientMoodStart: sessionForm.clientMoodStart,
          clientMoodEnd: sessionForm.clientMoodEnd,
          techniquesUsed: sessionForm.techniquesUsed
        }
      }));

      success('Progress updated successfully!');
    } catch (err) {
      error('Failed to update progress. Please try again.');
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      await realApiService.sessions.end(activeSession.id, {
        summary: sessionForm.summary,
        homework: sessionForm.homework,
        nextSessionRecommendation: sessionForm.nextSessionRecommendation,
        duration: Math.floor(activeSession.duration / 60)
      });

      success('Session ended successfully!');
      setActiveSession(null);
      setSessionForm({
        location: 'office',
        initialNotes: '',
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
    } catch (err) {
      error('Failed to end session. Please try again.');
    }
  };

  const markClientAbsent = async (appointment: Appointment) => {
    try {
      await realApiService.sessions.start({
        appointmentId: appointment.id,
        clientPresent: false,
        location: sessionForm.location,
        initialNotes: 'Client did not attend'
      });

      success('Appointment marked as no-show');
      await loadData();
    } catch (err) {
      error('Failed to mark appointment. Please try again.');
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

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'online': return VideoCameraIcon;
      case 'phone': return PhoneIcon;
      default: return BuildingOfficeIcon;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'online': return 'bg-blue-100 text-blue-600';
      case 'phone': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const renderTodayAppointments = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
      
      {appointments.length === 0 ? (
        <PremiumEmptyState
          icon={CalendarIcon}
          title="No Appointments Today"
          description="You don't have any scheduled appointments for today."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment) => (
            <PremiumCard key={appointment.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {appointment.client?.first_name} {appointment.client?.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </span>
                      <span>{appointment.type || 'Individual Therapy'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value as any }))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="office">Office</option>
                    <option value="online">Online</option>
                    <option value="phone">Phone</option>
                  </select>
                  
                  <PremiumButton
                    variant="primary"
                    size="sm"
                    icon={PlayIcon}
                    onClick={() => startSession(appointment)}
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
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{appointment.notes}</p>
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderActiveSession = () => {
    if (!activeSession) {
      return (
        <PremiumEmptyState
          icon={ClockIcon}
          title="No Active Session"
          description="Start a session from today's appointments to begin."
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Session Header */}
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Session with {activeSession.appointment.client?.first_name} {activeSession.appointment.client?.last_name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLocationColor(activeSession.location || 'office')}`}>
                    {activeSession.location || 'Office'}
                  </span>
                  <span className="text-2xl font-mono text-gray-900">
                    {formatDuration(activeSession.duration)}
                  </span>
                </div>
              </div>
            </div>
            
            <PremiumButton
              variant="danger"
              icon={StopIcon}
              onClick={() => setSelectedTab('active')}
            >
              End Session
            </PremiumButton>
          </div>
        </PremiumCard>

        {/* Progress Notes */}
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Progress</h3>
          
          <div className="space-y-4">
            {/* Mood Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Mood - Start of Session
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSessionForm(prev => ({ ...prev, clientMoodStart: num }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        sessionForm.clientMoodStart === num
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 hover:border-blue-400 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Mood - Current
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSessionForm(prev => ({ ...prev, clientMoodEnd: num }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        sessionForm.clientMoodEnd === num
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-green-400 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Notes
              </label>
              <textarea
                value={sessionForm.progressNotes}
                onChange={(e) => setSessionForm(prev => ({ ...prev, progressNotes: e.target.value }))}
                placeholder="Document observations, client responses, and session progress..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Goals Discussed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goals Discussed
              </label>
              <textarea
                value={sessionForm.goalsDiscussed}
                onChange={(e) => setSessionForm(prev => ({ ...prev, goalsDiscussed: e.target.value }))}
                placeholder="What therapy goals were addressed in this session?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Techniques Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Techniques Used
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableTechniques.map((technique) => (
                  <label
                    key={technique}
                    className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={sessionForm.techniquesUsed.includes(technique)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSessionForm(prev => ({
                            ...prev,
                            techniquesUsed: [...prev.techniquesUsed, technique]
                          }));
                        } else {
                          setSessionForm(prev => ({
                            ...prev,
                            techniquesUsed: prev.techniquesUsed.filter(t => t !== technique)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{technique}</span>
                  </label>
                ))}
              </div>
            </div>

            <PremiumButton
              variant="outline"
              icon={CheckCircleIcon}
              onClick={updateProgress}
              className="w-full"
            >
              Save Progress
            </PremiumButton>
          </div>
        </PremiumCard>

        {/* End Session */}
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">End Session</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={sessionForm.summary}
                onChange={(e) => setSessionForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Provide a comprehensive summary of the session..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Homework / Action Items
              </label>
              <textarea
                value={sessionForm.homework}
                onChange={(e) => setSessionForm(prev => ({ ...prev, homework: e.target.value }))}
                placeholder="Assignments or practices for the client to work on..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Session Recommendation
              </label>
              <input
                type="text"
                value={sessionForm.nextSessionRecommendation}
                onChange={(e) => setSessionForm(prev => ({ ...prev, nextSessionRecommendation: e.target.value }))}
                placeholder="e.g., Continue with current approach, schedule in 1 week"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Before ending the session:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Ensure all progress notes are saved</li>
                    <li>Verify session summary is complete</li>
                    <li>Confirm homework assignments are clear</li>
                  </ul>
                </div>
              </div>
            </div>

            <PremiumButton
              variant="danger"
              icon={StopIcon}
              onClick={endSession}
              className="w-full"
              disabled={!sessionForm.summary}
            >
              End Session (Duration: {formatDuration(activeSession.duration)})
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    );
  };

  const renderSessionHistory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
      
      {sessionHistory.length === 0 ? (
        <PremiumEmptyState
          icon={DocumentTextIcon}
          title="No Session History"
          description="Your completed sessions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {sessionHistory.map((session) => (
            <PremiumCard key={session.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${session.client_present ? 'bg-green-100' : 'bg-red-100'}`}>
                    {session.client_present ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {session.client?.first_name} {session.client?.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{formatDate(session.session_date)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLocationColor(session.location || 'office')}`}>
                        {session.location || 'Office'}
                      </span>
                      {session.duration && (
                        <span>{session.duration} minutes</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={DocumentTextIcon}
                  onClick={() => {/* View session details */}}
                >
                  View Details
                </PremiumButton>
              </div>
              
              {session.summary && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-2">{session.summary}</p>
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Session Management</h1>
            <p className="text-indigo-100">
              Manage therapy sessions, track progress, and document client interactions
            </p>
          </div>
          <ClockIcon className="w-16 h-16 text-indigo-200" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessionHistory.filter(s => 
                  new Date(s.session_date).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSession ? formatDuration(activeSession.duration) : 'None'}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessionHistory.filter(s => {
                  const sessionDate = new Date(s.session_date);
                  const now = new Date();
                  return sessionDate.getMonth() === now.getMonth() && 
                         sessionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </PremiumCard>
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
          Today's Appointments
        </button>
        <button
          onClick={() => setSelectedTab('active')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors relative ${
            selectedTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Session
          {activeSession && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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

      {/* Content */}
      {selectedTab === 'today' && renderTodayAppointments()}
      {selectedTab === 'active' && renderActiveSession()}
      {selectedTab === 'history' && renderSessionHistory()}
    </div>
  );
};

export default SessionManagement;