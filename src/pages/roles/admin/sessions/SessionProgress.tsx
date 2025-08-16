import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { InlineCrudLayout, FilterBar, ListItemCard, EmptyState } from '@/components/crud/InlineCrudLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StatusBadge, PremiumCard, PremiumMetric, PremiumButton } from '@/components/layout/PremiumLayout';
import { formatDate, formatTime, formatDuration } from '@/utils/dateFormatters';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface Session {
  id: string;
  appointment_id: string;
  therapist_id: string;
  therapist_name: string;
  client_id: string;
  client_name: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'no_show';
  client_present: boolean;
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  progress_notes?: string;
  challenges_assigned?: number;
  surveys_assigned?: number;
  created_at: string;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  noShowRate: number;
  activeTherapists: number;
  activeClients: number;
  monthlyGrowth: number;
}

type ViewMode = 'list' | 'detail';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

const SessionProgress: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert, info } = useAlert();

  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [filters, setFilters] = useState({
    therapist: 'all',
    status: 'all'
  });

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on filter
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      const [sessionsResponse, statsResponse] = await Promise.all([
        realApiService.admin.getSessions({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        realApiService.admin.getSessionStatistics()
      ]);

      if (sessionsResponse.success && sessionsResponse.data) {
        setSessions(sessionsResponse.data.sessions || []);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      errorAlert(handleApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  // Get unique therapists for filter
  const uniqueTherapists = Array.from(new Set(sessions.map(s => s.therapist_id)))
    .map(id => {
      const session = sessions.find(s => s.therapist_id === id);
      return { id, name: session?.therapist_name || 'Unknown' };
    });

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTherapist = filters.therapist === 'all' || session.therapist_id === filters.therapist;
    const matchesStatus = filters.status === 'all' || session.status === filters.status;
    
    return matchesSearch && matchesTherapist && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'active';
      case 'scheduled': return 'pending';
      case 'no_show': return 'overdue';
      default: return 'inactive';
    }
  };

  // Get mood indicator
  const getMoodIndicator = (moodBefore?: number, moodAfter?: number) => {
    if (!moodBefore || !moodAfter) return null;
    
    const change = moodAfter - moodBefore;
    if (change > 0) {
      return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />;
    } else if (change < 0) {
      return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />;
    } else {
      return <span className="text-gray-400">→</span>;
    }
  };

  // Render session detail view
  const renderDetailView = () => {
    if (!selectedSession) return null;

    return (
      <div className="space-y-6">
        <PremiumCard>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Session Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(selectedSession.start_time)} at {formatTime(selectedSession.start_time)}
              </p>
            </div>
            <StatusBadge 
              status={selectedSession.status} 
              type={getStatusColor(selectedSession.status) as any}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Participants
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium text-gray-900">{selectedSession.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Therapist</p>
                  <p className="font-medium text-gray-900">{selectedSession.therapist_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client Present</p>
                  <p className="font-medium text-gray-900">
                    {selectedSession.client_present ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        No
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Session Metrics
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {selectedSession.duration_minutes 
                      ? `${selectedSession.duration_minutes} minutes`
                      : 'In progress'}
                  </p>
                </div>
                {selectedSession.mood_before && selectedSession.mood_after && (
                  <div>
                    <p className="text-sm text-gray-500">Mood Change</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {selectedSession.mood_before} → {selectedSession.mood_after}
                      </span>
                      {getMoodIndicator(selectedSession.mood_before, selectedSession.mood_after)}
                    </div>
                  </div>
                )}
                <div className="flex space-x-6">
                  {selectedSession.challenges_assigned !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Challenges</p>
                      <p className="font-medium text-gray-900">{selectedSession.challenges_assigned}</p>
                    </div>
                  )}
                  {selectedSession.surveys_assigned !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Surveys</p>
                      <p className="font-medium text-gray-900">{selectedSession.surveys_assigned}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedSession.notes && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Session Notes
              </h4>
              <p className="text-gray-900">{selectedSession.notes}</p>
            </div>
          )}

          {selectedSession.progress_notes && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Progress Notes
              </h4>
              <p className="text-gray-900">{selectedSession.progress_notes}</p>
            </div>
          )}
        </PremiumCard>

        <PremiumButton
          variant="outline"
          onClick={() => {
            setSelectedSession(null);
            setViewMode('list');
          }}
        >
          Back to List
        </PremiumButton>
      </div>
    );
  };

  // Render list view
  const renderList = () => {
    if (filteredSessions.length === 0) {
      return (
        <EmptyState
          icon={ClockIcon}
          title="No sessions found"
          description="No sessions match your current filters"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setFilters({ therapist: 'all', status: 'all' });
          }}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.map((session) => (
          <ListItemCard 
            key={session.id}
            onClick={() => {
              setSelectedSession(session);
              setViewMode('detail');
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {session.client_name} - {session.therapist_name}
                  </h4>
                  <StatusBadge 
                    status={session.status} 
                    type={getStatusColor(session.status) as any}
                    size="sm"
                  />
                </div>
                <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(session.start_time)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatTime(session.start_time)}</span>
                  </div>
                  {session.duration_minutes && (
                    <span>{session.duration_minutes} min</span>
                  )}
                  {!session.client_present && (
                    <span className="text-red-600 font-medium">Client No-Show</span>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  {session.mood_before && session.mood_after && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Mood:</span>
                      <span className="text-sm font-medium">
                        {session.mood_before} → {session.mood_after}
                      </span>
                      {getMoodIndicator(session.mood_before, session.mood_after)}
                    </div>
                  )}
                  {(session.challenges_assigned || session.surveys_assigned) && (
                    <div className="flex items-center space-x-4 text-sm">
                      {session.challenges_assigned && session.challenges_assigned > 0 && (
                        <span className="flex items-center text-blue-600">
                          <TrophyIcon className="w-4 h-4 mr-1" />
                          {session.challenges_assigned}
                        </span>
                      )}
                      {session.surveys_assigned && session.surveys_assigned > 0 && (
                        <span className="flex items-center text-green-600">
                          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
                          {session.surveys_assigned}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {session.notes && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{session.notes}</p>
                )}
              </div>
            </div>
          </ListItemCard>
        ))}
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Session Progress Tracking"
      subtitle="Monitor therapy sessions and client progress"
      icon={ChartBarIcon}
      viewMode={viewMode}
      showCreateButton={false}
      isLoading={isLoading}
      totalCount={sessions.length}
      onBack={viewMode !== 'list' ? () => setViewMode('list') : undefined}
      onViewModeChange={() => {}}
    >
      {viewMode === 'list' && (
        <>
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <PremiumMetric
                title="Total Sessions"
                value={stats.totalSessions}
                icon={ClockIcon}
                iconColor="text-blue-600"
              />
              <PremiumMetric
                title="Completed"
                value={stats.completedSessions}
                icon={CheckCircleIcon}
                iconColor="text-green-600"
              />
              <PremiumMetric
                title="Avg Duration"
                value={`${stats.averageDuration}m`}
                icon={ClockIcon}
                iconColor="text-purple-600"
              />
              <PremiumMetric
                title="No-Show Rate"
                value={`${stats.noShowRate}%`}
                icon={ExclamationTriangleIcon}
                iconColor="text-red-600"
              />
              <PremiumMetric
                title="Active Therapists"
                value={stats.activeTherapists}
                icon={UserGroupIcon}
                iconColor="text-indigo-600"
              />
              <PremiumMetric
                title="Monthly Growth"
                value={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`}
                change={{ 
                  value: stats.monthlyGrowth > 0 ? 'Increase' : 'Decrease', 
                  type: stats.monthlyGrowth > 0 ? 'positive' : 'negative'
                }}
                icon={ArrowTrendingUpIcon}
                iconColor="text-green-600"
              />
            </div>
          )}

          {/* Time Filter */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg shadow-sm">
              {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`
                    px-4 py-2 text-sm font-medium
                    ${filter === 'today' ? 'rounded-l-lg' : ''}
                    ${filter === 'all' ? 'rounded-r-lg' : ''}
                    ${timeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }
                    border border-gray-200
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <div className="flex items-center space-x-3">
                <select
                  value={filters.therapist}
                  onChange={(e) => setFilters(prev => ({ ...prev, therapist: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Therapists</option>
                  {uniqueTherapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
            }
          />

          {/* Session List */}
          {renderList()}
        </>
      )}

      {viewMode === 'detail' && renderDetailView()}
    </InlineCrudLayout>
  );
};

export default SessionProgress;