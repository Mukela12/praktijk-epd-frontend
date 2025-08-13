import React, { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  TrophyIcon,
  FlagIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  FlagIcon as FlagSolid,
  FireIcon as FireSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Challenge, ChallengeType, ChallengeDifficulty, ChallengeStatus } from '@/types/resources';

const ChallengesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();

  // State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    status: 'all',
    category: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalParticipants: 0,
    averageCompletionRate: 0,
    byType: {} as Record<ChallengeType, number>,
    byDifficulty: {} as Record<ChallengeDifficulty, number>
  });

  // Load challenges
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await resourcesApi.getChallenges();
      
      if (response.success && response.data) {
        const challengesData = response.data.challenges || [];
        setChallenges(challengesData);
        calculateStats(challengesData);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (challengesData: Challenge[]) => {
    const stats = {
      totalChallenges: challengesData.length,
      activeChallenges: challengesData.filter(c => c.status === 'active').length,
      totalParticipants: challengesData.reduce((sum, c) => sum + c.participant_count, 0),
      averageCompletionRate: challengesData.length > 0 
        ? Math.round(challengesData.reduce((sum, c) => sum + c.completion_rate, 0) / challengesData.length)
        : 0,
      byType: {} as Record<ChallengeType, number>,
      byDifficulty: {} as Record<ChallengeDifficulty, number>
    };

    // Count by type and difficulty
    challengesData.forEach(challenge => {
      stats.byType[challenge.challengeType] = (stats.byType[challenge.challengeType] || 0) + 1;
      stats.byDifficulty[challenge.difficultyLevel] = (stats.byDifficulty[challenge.difficultyLevel] || 0) + 1;
    });

    setStats(stats);
  };

  // Handle challenge deletion
  const handleDelete = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    try {
      await resourcesApi.deleteChallenge(challengeId);
      success('Challenge deleted successfully');
      loadChallenges();
    } catch (err) {
      error('Failed to delete challenge');
    }
  };

  // Handle status change
  const handleStatusChange = async (challengeId: string, newStatus: ChallengeStatus) => {
    try {
      await resourcesApi.updateChallenge(challengeId, { status: newStatus });
      success(`Challenge ${newStatus} successfully`);
      loadChallenges();
    } catch (err) {
      error('Failed to update challenge status');
    }
  };

  // Get icon for challenge type
  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case 'daily': return CalendarDaysIcon;
      case 'weekly': return FlagIcon;
      case 'monthly': return TrophyIcon;
      case 'custom': return RocketLaunchIcon;
      default: return PuzzlePieceIcon;
    }
  };

  const getChallengeIconSolid = (type: ChallengeType) => {
    switch (type) {
      case 'daily': return FireSolid;
      case 'weekly': return FlagSolid;
      case 'monthly': return TrophySolid;
      case 'custom': return StarSolid;
      default: return TrophySolid;
    }
  };

  // Get color for challenge type
  const getTypeColor = (type: ChallengeType) => {
    switch (type) {
      case 'daily': return 'bg-red-100 text-red-800 border-red-200';
      case 'weekly': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monthly': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'custom': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get color for difficulty
  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        challenge.title.toLowerCase().includes(searchLower) ||
        challenge.description.toLowerCase().includes(searchLower) ||
        challenge.category.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type !== 'all' && challenge.challengeType !== filters.type) return false;
    
    // Difficulty filter
    if (filters.difficulty !== 'all' && challenge.difficultyLevel !== filters.difficulty) return false;
    
    // Status filter
    if (filters.status !== 'all' && challenge.status !== filters.status) return false;
    
    // Category filter
    if (filters.category !== 'all' && challenge.category !== filters.category) return false;

    return true;
  });

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
      <div className="card-premium gradient-medical text-white rounded-2xl p-8 animate-fadeInUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <PuzzlePieceIcon className="w-8 h-8" />
              </div>
              Challenge Management
            </h1>
            <p className="text-body text-green-50 mt-2">
              Create and manage therapeutic challenges and goals
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-premium-ghost bg-white/10 border border-white/30 text-white hover:bg-white/20 flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-premium-primary bg-white text-emerald-600 hover:bg-gray-50 flex items-center space-x-2 shadow-premium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Total Challenges"
          value={stats.totalChallenges}
          icon={PuzzlePieceIcon}
          iconColor="text-purple-600"
          change={{ value: "+8", type: "positive" }}
        />
        <PremiumMetric
          title="Active Challenges"
          value={stats.activeChallenges}
          icon={PlayIcon}
          iconColor="text-green-600"
          change={{ value: `${Math.round((stats.activeChallenges / stats.totalChallenges) * 100)}%`, type: "neutral" }}
        />
        <PremiumMetric
          title="Total Participants"
          value={stats.totalParticipants}
          icon={UserGroupIcon}
          iconColor="text-blue-600"
          change={{ value: "+45%", type: "positive" }}
        />
        <PremiumMetric
          title="Avg Completion"
          value={`${stats.averageCompletionRate}%`}
          icon={CheckCircleIcon}
          iconColor="text-amber-600"
          change={{ value: "+12%", type: "positive" }}
        />
      </div>

      {/* Challenge Type Distribution */}
      <div className="grid-content-flexible gap-6">
        <div className="card-premium">
          <div className="p-6">
            <h3 className="heading-section mb-4 flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
              </div>
              Challenges by Type
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const Icon = getChallengeIcon(type as ChallengeType);
              const percentage = Math.round((count / stats.totalChallenges) * 100);
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="p-6">
            <h3 className="heading-section mb-4 flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg mr-3">
                <FireIcon className="w-5 h-5 text-orange-600" />
              </div>
              Challenges by Difficulty
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.byDifficulty).map(([difficulty, count]) => {
              const percentage = Math.round((count / stats.totalChallenges) * 100);
              
              return (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">{difficulty}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <PremiumEmptyState
          icon={PuzzlePieceIcon}
          title="No Challenges Found"
          description={searchTerm || filters.type !== 'all' || filters.difficulty !== 'all' 
            ? "Try adjusting your search or filters"
            : "Create your first challenge to engage clients"}
          action={{
            label: 'Create Challenge',
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid-content-flexible gap-6">
          {filteredChallenges.map((challenge) => {
            const Icon = getChallengeIcon(challenge.challengeType);
            const IconSolid = getChallengeIconSolid(challenge.challengeType);
            
            return (
              <div
                key={challenge.id}
                className="card-premium hover:shadow-premium-lg transition-all duration-300 animate-fadeInUp"
              >
                <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(challenge.challengeType)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge
                      status={challenge.status}
                      type={challenge.status === 'active' ? 'active' : 
                            challenge.status === 'completed' ? 'discontinued' : 
                            challenge.status === 'archived' ? 'discontinued' : 'pending'}
                      size="sm"
                    />
                  </div>
                </div>

                <h3 className="heading-section mb-2">
                  {challenge.title}
                </h3>
                
                <p className="text-body-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficultyLevel)}`}>
                    <FireIcon className="w-3 h-3 mr-1" />
                    {challenge.difficultyLevel}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {challenge.durationDays} days
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <FlagIcon className="w-3 h-3 mr-1" />
                    {challenge.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    {challenge.participant_count} participants
                  </span>
                  <span className="flex items-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    {challenge.completion_rate}% complete
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setShowParticipantsModal(true);
                    }}
                    className="btn-premium-secondary px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Participants</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setShowEditModal(true);
                    }}
                    className="btn-premium-ghost px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {challenge.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(challenge.id, 'active')}
                      className="btn-premium-ghost text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Activate</span>
                    </button>
                  )}
                  {challenge.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(challenge.id, 'completed')}
                      className="btn-premium-ghost text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                    >
                      <PauseIcon className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  )}
                  {challenge.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusChange(challenge.id, 'archived')}
                      className="btn-premium-ghost text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChallengesManagement;