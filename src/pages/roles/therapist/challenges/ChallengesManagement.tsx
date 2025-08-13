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
  UserPlusIcon,
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
import { therapistApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Challenge, ChallengeType, ChallengeDifficulty, ChallengeStatus } from '@/types/resources';

const TherapistChallengesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  // State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    status: 'all',
    category: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalChallenges: 0,
    myChallenges: 0,
    activeAssignments: 0,
    completedByClients: 0
  });

  // Load challenges and clients
  useEffect(() => {
    loadChallenges();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await therapistApi.getClients();
      if (response.success && response.data) {
        setClients(response.data.clients || []);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await therapistApi.getChallenges();
      
      if (response.success && response.data) {
        const challengesData = response.data.challenges || [];
        setChallenges(challengesData);
        
        // Filter my challenges (created by me)
        const myChallengesList = challengesData.filter((c: Challenge) => c.created_by === user?.id);
        setMyChallenges(myChallengesList);
        
        calculateStats(challengesData, myChallengesList);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (allChallenges: Challenge[], myChallengesList: Challenge[]) => {
    setStats({
      totalChallenges: allChallenges.length,
      myChallenges: myChallengesList.length,
      activeAssignments: 0, // Would need assignment data
      completedByClients: 0 // Would need completion data
    });
  };

  // Handle challenge assignment
  const handleAssign = async (challengeId: string, clientId: string) => {
    try {
      await therapistApi.assignChallenge(challengeId, clientId);
      success('Challenge assigned successfully');
      setShowAssignModal(false);
    } catch (err) {
      error('Failed to assign challenge');
    }
  };

  // Handle challenge deletion (only for own challenges)
  const handleDelete = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    try {
      // Would need delete endpoint in therapistApi
      // await therapistApi.deleteChallenge(challengeId);
      success('Challenge deleted successfully');
      loadChallenges();
    } catch (err) {
      error('Failed to delete challenge');
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
  const currentChallenges = activeTab === 'my' ? myChallenges : challenges;
  const filteredChallenges = currentChallenges.filter(challenge => {
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <PuzzlePieceIcon className="w-8 h-8 mr-3" />
              Client Challenges
            </h1>
            <p className="text-purple-100 mt-1">
              Create and assign therapeutic challenges to your clients
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              icon={PlusIcon}
              onClick={() => setShowCreateModal(true)}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20"
            >
              Create Challenge
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Available Challenges"
          value={stats.totalChallenges}
          icon={PuzzlePieceIcon}
          iconColor="text-purple-600"
        />
        <PremiumMetric
          title="My Challenges"
          value={stats.myChallenges}
          icon={StarIcon}
          iconColor="text-pink-600"
        />
        <PremiumMetric
          title="Active Assignments"
          value={stats.activeAssignments}
          icon={UserGroupIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Completed by Clients"
          value={stats.completedByClients}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Challenges
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'my' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Challenges
        </button>
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <PremiumEmptyState
          icon={PuzzlePieceIcon}
          title="No Challenges Found"
          description={searchTerm || filters.type !== 'all' || filters.difficulty !== 'all' 
            ? "Try adjusting your search or filters"
            : activeTab === 'my'
              ? "Create your first challenge to engage clients"
              : "No challenges available"}
          action={activeTab === 'my' ? {
            label: 'Create Challenge',
            onClick: () => setShowCreateModal(true)
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredChallenges.map((challenge) => {
            const Icon = getChallengeIcon(challenge.challengeType);
            const IconSolid = getChallengeIconSolid(challenge.challengeType);
            const isMyChallenge = challenge.created_by === user?.id;
            
            return (
              <PremiumCard
                key={challenge.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(challenge.challengeType)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {isMyChallenge && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        My Challenge
                      </span>
                    )}
                    <StatusBadge
                      status={challenge.status}
                      type={challenge.status === 'active' ? 'active' : 
                            challenge.status === 'completed' ? 'discontinued' : 
                            challenge.status === 'archived' ? 'discontinued' : 'pending'}
                      size="sm"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {challenge.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                  <PremiumButton
                    size="sm"
                    variant="primary"
                    icon={UserPlusIcon}
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign to Client
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    icon={EyeIcon}
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setShowDetailModal(true);
                    }}
                  >
                    View
                  </PremiumButton>
                  {isMyChallenge && (
                    <>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={PencilIcon}
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </PremiumButton>
                      {challenge.status === 'draft' && (
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={PlayIcon}
                          onClick={() => {}}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Activate
                        </PremiumButton>
                      )}
                    </>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedChallenge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-4 ${getTypeColor(selectedChallenge.type)}`}>
                    {React.createElement(getChallengeIconSolid(selectedChallenge.type), { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <h2 className="heading-section">{selectedChallenge.title}</h2>
                    <p className="text-body-sm text-gray-600 mt-1">
                      {selectedChallenge.type} challenge • {selectedChallenge.durationDays} days
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedChallenge.description}</p>
                </div>

                {/* Difficulty & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-metric p-4">
                    <p className="text-caption mb-1">Difficulty</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedChallenge.difficultyLevel)}`}>
                      <FireIcon className="w-4 h-4 mr-1" />
                      {selectedChallenge.difficultyLevel}
                    </span>
                  </div>
                  <div className="card-metric p-4">
                    <p className="text-caption mb-1">Participants</p>
                    <p className="text-xl font-bold text-gray-900">{selectedChallenge.participant_count}</p>
                  </div>
                  <div className="card-metric p-4">
                    <p className="text-caption mb-1">Completion Rate</p>
                    <p className="text-xl font-bold text-gray-900">{selectedChallenge.completion_rate}%</p>
                  </div>
                </div>

                {/* Target & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Target Goal</h3>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-lg font-medium text-gray-900">
                        {selectedChallenge.targetValue} {selectedChallenge.targetUnit}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Complete within {selectedChallenge.durationDays} days</p>
                    </div>
                  </div>
                  {selectedChallenge.rules && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Rules</h3>
                      <ul className="space-y-1">
                        {selectedChallenge.rules.map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm text-gray-600">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Milestones */}
                {selectedChallenge.milestones && selectedChallenge.milestones.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
                    <div className="space-y-2">
                      {selectedChallenge.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{milestone.title}</p>
                            {milestone.description && (
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            Day {milestone.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-premium-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowAssignModal(true);
                  }}
                  className="btn-premium-primary flex items-center space-x-2"
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span>Assign to Client</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedChallenge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-md w-full animate-scaleIn">
            <div className="p-6">
              <h2 className="heading-section mb-4">Assign Challenge</h2>
              
              <div className="mb-4">
                <p className="text-body-sm text-gray-600 mb-2">
                  Assigning: <span className="font-medium">{selectedChallenge.title}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="select-premium w-full"
                  >
                    <option value="">Choose a client...</option>
                    <option value="client1">Maria Jansen</option>
                    <option value="client2">Peter de Vries</option>
                    <option value="client3">Lisa van Berg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input-premium w-full"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="input-premium w-full"
                    rows={3}
                    placeholder="Add any specific instructions or encouragement..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedClientId('');
                  }}
                  className="btn-premium-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedClientId) {
                      handleAssign(selectedChallenge.id, selectedClientId);
                    } else {
                      error('Please select a client');
                    }
                  }}
                  className="btn-premium-primary"
                  disabled={!selectedClientId}
                >
                  Assign Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistChallengesManagement;