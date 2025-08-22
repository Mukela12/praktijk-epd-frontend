import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  VideoCameraIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';

interface SessionRecord {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  therapistId: string;
  therapistName: string;
  sessionType: 'individual' | 'group' | 'online' | 'emergency';
  status: 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  treatmentGoals?: string[];
  progress?: string;
  homework?: string;
  nextSessionFocus?: string;
  rating?: number;
  feedback?: string;
  invoiceId?: string;
  location?: string;
}

const SessionHistory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'no-show'>('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    feedback: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    noShowSessions: 0,
    totalHours: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadSessionHistory();
  }, [filter, dateRange]);

  const loadSessionHistory = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (filter !== 'all') params.status = filter;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      // Use clientApi which has the getSessionHistory method
      const response = await clientApi.getSessionHistory(params);
      
      if (response.success && response.data) {
        const sessionData = response.data.sessions || [];
        setSessions(sessionData);
        calculateStats(sessionData);
      }
    } catch (err) {
      error('Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (sessionList: SessionRecord[]) => {
    const stats = sessionList.reduce((acc, session) => {
      acc.totalSessions++;
      
      if (session.status === 'completed') {
        acc.completedSessions++;
        acc.totalHours += session.duration / 60;
        if (session.rating) {
          acc.ratings.push(session.rating);
        }
      } else if (session.status === 'cancelled') {
        acc.cancelledSessions++;
      } else if (session.status === 'no-show') {
        acc.noShowSessions++;
      }
      
      return acc;
    }, {
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      noShowSessions: 0,
      totalHours: 0,
      ratings: [] as number[]
    });
    
    const averageRating = stats.ratings.length > 0 
      ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length 
      : 0;

    setStats({
      ...stats,
      averageRating
    });
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSession || feedbackForm.rating === 0) {
      error('Please provide a rating');
      return;
    }

    try {
      await clientApi.submitSessionFeedback(selectedSession.id, {
        rating: feedbackForm.rating,
        feedback: feedbackForm.feedback
      });
      
      success('Thank you for your feedback!');
      setShowFeedbackModal(false);
      setFeedbackForm({ rating: 0, feedback: '' });
      loadSessionHistory();
    } catch (err) {
      error('Failed to submit feedback');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await clientApi.downloadSessionReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-history-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success('Report downloaded successfully');
    } catch (err) {
      error('Failed to download report');
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return UserIcon;
      case 'group':
        return ClipboardDocumentCheckIcon;
      case 'online':
        return VideoCameraIcon;
      case 'emergency':
        return ClockIcon;
      default:
        return CalendarIcon;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-client-active';
      case 'cancelled':
        return 'status-cancelled';
      case 'no-show':
        return 'status-client-discontinued';
      default:
        return '';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.therapistName.toLowerCase().includes(searchLower) ||
        session.sessionType.toLowerCase().includes(searchLower) ||
        session.notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setFeedbackForm(prev => ({ ...prev, rating: star }))}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            {star <= (interactive ? feedbackForm.rating : rating) ? (
              <StarSolidIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ClockIcon className="w-8 h-8" />
              </div>
              Session History
            </h1>
            <p className="text-body text-blue-50 mt-2">
              View your therapy session history and progress
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="btn-premium-ghost bg-white/10 border border-white/30 text-white hover:bg-white/20 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 mb-8">
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
            </div>
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Cancelled</p>
              <p className="text-2xl font-bold text-amber-600">{stats.cancelledSessions}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">No-Show</p>
              <p className="text-2xl font-bold text-red-600">{stats.noShowSessions}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Avg Rating</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
                <StarSolidIcon className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <StarIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by therapist, type, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="startDate" className="text-sm text-gray-700">From:</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-premium"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="endDate" className="text-sm text-gray-700">To:</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-premium"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="select-premium"
                >
                  <option value="all">All Sessions</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-Show</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">No sessions found</h3>
          <p className="text-body-sm text-gray-600">
            {filter === 'all' ? 'You don\'t have any session history yet' : `No ${filter} sessions found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const TypeIcon = getSessionTypeIcon(session.sessionType);
            
            return (
              <div key={session.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <TypeIcon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="heading-section">
                            {new Date(session.sessionDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                            {session.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-body-sm">
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {session.startTime} - {session.endTime} ({session.duration} min)
                          </div>
                          <div className="flex items-center text-gray-600">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {session.therapistName}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {session.sessionType} session
                          </div>
                        </div>

                        {session.location && (
                          <div className="flex items-center text-body-sm text-gray-600 mb-3">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {session.location}
                          </div>
                        )}

                        {session.notes && (
                          <p className="text-body-sm text-gray-700 line-clamp-2 mb-3">
                            {session.notes}
                          </p>
                        )}

                        {session.rating && (
                          <div className="flex items-center space-x-2">
                            <span className="text-body-sm text-gray-600">Your rating:</span>
                            {renderStars(session.rating)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowDetailsModal(true);
                        }}
                        className="btn-premium-ghost text-sm flex items-center space-x-1"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      {session.status === 'completed' && !session.rating && (
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setShowFeedbackModal(true);
                          }}
                          className="btn-premium-secondary text-sm flex items-center space-x-1"
                        >
                          <StarIcon className="w-4 h-4" />
                          <span>Rate Session</span>
                        </button>
                      )}

                      {session.invoiceId && (
                        <button
                          onClick={() => navigate(`/client/invoices?id=${session.invoiceId}`)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>View Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="heading-section">Session Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Session Information</h3>
                    <div className="space-y-2 text-body-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">{new Date(selectedSession.sessionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-medium">{selectedSession.startTime} - {selectedSession.endTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{selectedSession.duration} minutes</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium capitalize">{selectedSession.sessionType} session</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedSession.status)}`}>
                          {selectedSession.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Therapist Information</h3>
                    <div className="space-y-2 text-body-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{selectedSession.therapistName}</p>
                      </div>
                      {selectedSession.location && (
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-medium">{selectedSession.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Session Notes</h3>
                    <p className="text-body-sm text-gray-700 whitespace-pre-wrap">{selectedSession.notes}</p>
                  </div>
                )}

                {selectedSession.treatmentGoals && selectedSession.treatmentGoals.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Treatment Goals Addressed</h3>
                    <ul className="list-disc list-inside text-body-sm text-gray-700 space-y-1">
                      {selectedSession.treatmentGoals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSession.progress && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Progress Made</h3>
                    <p className="text-body-sm text-gray-700">{selectedSession.progress}</p>
                  </div>
                )}

                {selectedSession.homework && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Homework/Exercises</h3>
                    <p className="text-body-sm text-blue-800">{selectedSession.homework}</p>
                  </div>
                )}

                {selectedSession.nextSessionFocus && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Next Session Focus</h3>
                    <p className="text-body-sm text-amber-800">{selectedSession.nextSessionFocus}</p>
                  </div>
                )}

                {selectedSession.rating && selectedSession.feedback && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Feedback</h3>
                    <div className="mb-2">{renderStars(selectedSession.rating)}</div>
                    <p className="text-body-sm text-gray-700">{selectedSession.feedback}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-premium-secondary"
                >
                  Close
                </button>
                {selectedSession.invoiceId && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate(`/client/invoices?id=${selectedSession.invoiceId}`);
                    }}
                    className="btn-premium-primary flex items-center space-x-2"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>View Invoice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-lg w-full animate-scaleIn">
            <div className="p-6">
              <h3 className="heading-section mb-4">Rate Your Session</h3>
              
              <div className="mb-4">
                <p className="text-body-sm text-gray-600 mb-2">
                  How was your session on {new Date(selectedSession.sessionDate).toLocaleDateString()} with {selectedSession.therapistName}?
                </p>
              </div>

              <div className="mb-6">
                <label className="label-premium mb-3">Your Rating</label>
                <div className="flex justify-center">
                  {renderStars(feedbackForm.rating, true)}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="feedback" className="label-premium">
                  Additional Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="input-premium"
                  placeholder="Share your thoughts about the session..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackForm({ rating: 0, feedback: '' });
                  }}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackForm.rating === 0}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  <StarIcon className="w-5 h-5" />
                  <span>Submit Rating</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Notice */}
      <div className="mt-8 card-premium bg-blue-50 border-blue-200 p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Your Session History</h3>
            <ul className="text-body-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Session notes and details are securely stored and only accessible to you and your therapist</li>
              <li>Rate your sessions to help your therapist improve their practice</li>
              <li>Download session reports for your personal records or insurance purposes</li>
              <li>Track your progress and therapy journey over time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;