import React, { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  TrophyIcon,
  FlagIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { therapistApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Challenge, ChallengeType, ChallengeDifficulty, ChallengeStatus } from '@/types/resources';

type ViewMode = 'list' | 'create' | 'detail' | 'assign';

const TherapistChallengesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  // State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all'
  });

  // Form state for creating challenges
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 30,
    targetValue: 30,
    targetUnit: 'days',
    instructions: '',
    tips: '',
    isPublic: true
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
        const challengesData = response.data.challenges || response.data || [];
        setChallenges(Array.isArray(challengesData) ? challengesData : []);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle challenge creation
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const challengeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.duration,
        targetValue: formData.targetValue,
        targetUnit: formData.targetUnit,
        instructions: formData.instructions ? [formData.instructions] : [],
        tips: formData.tips ? [formData.tips] : [],
        isPublic: formData.isPublic,
        targetAudience: 'all'
      };

      const response = await therapistApi.createChallenge(challengeData);
      if (response.success) {
        success('Challenge created successfully');
        setViewMode('list');
        setFormData({
          title: '',
          description: '',
          category: 'mindfulness',
          difficulty: 'beginner',
          duration: 30,
          targetValue: 30,
          targetUnit: 'days',
          instructions: '',
          tips: '',
          isPublic: true
        });
        loadChallenges();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create challenge');
    }
  };

  // Handle challenge assignment
  const handleAssignChallenge = async () => {
    if (!selectedChallenge || !selectedClientId) return;

    try {
      const response = await therapistApi.assignChallenge(selectedChallenge.id, selectedClientId);
      if (response.success) {
        success('Challenge assigned successfully');
        setViewMode('list');
        setSelectedChallenge(null);
        setSelectedClientId('');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign challenge');
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    // Tab filter
    if (activeTab === 'my' && challenge.created_by !== user?.id) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        challenge.title.toLowerCase().includes(searchLower) ||
        challenge.description.toLowerCase().includes(searchLower) ||
        challenge.category.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Difficulty filter
    if (filters.difficulty !== 'all' && (challenge as any).difficulty !== filters.difficulty) return false;
    
    // Category filter
    if (filters.category !== 'all' && challenge.category !== filters.category) return false;

    return true;
  });

  // Get icon for difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render create form
  const renderCreateForm = () => (
    <PremiumCard>
      <form onSubmit={handleCreateChallenge} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter challenge title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="mindfulness">Mindfulness</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress</option>
              <option value="relationships">Relationships</option>
              <option value="self-care">Self Care</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.targetUnit}
              onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., days, times, minutes"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe the challenge and its objectives"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Step-by-step instructions for participants"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tips for Success
          </label>
          <textarea
            value={formData.tips}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Helpful tips to complete the challenge"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Make this challenge public (available to all therapists)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <PremiumButton
            variant="outline"
            onClick={() => setViewMode('list')}
          >
            Cancel
          </PremiumButton>
          <PremiumButton
            variant="primary"
          >
            Create Challenge
          </PremiumButton>
        </div>
      </form>
    </PremiumCard>
  );

  // Render challenge detail
  const renderChallengeDetail = () => {
    if (!selectedChallenge) return null;

    return (
      <PremiumCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <TrophyIcon className="w-8 h-8 text-purple-600" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
              <p className="text-gray-500 mt-1">{selectedChallenge.category} • {(selectedChallenge as any).difficulty}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{(selectedChallenge as any).duration} days</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-2xl font-bold text-gray-900">{selectedChallenge.targetValue} {selectedChallenge.targetUnit}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{selectedChallenge.participant_count || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{selectedChallenge.description}</p>
          </div>

          {selectedChallenge.instructions && Array.isArray(selectedChallenge.instructions) && selectedChallenge.instructions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedChallenge.instructions.map((instruction: any, index: number) => (
                  <li key={index} className="text-gray-700">{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedChallenge.tips && Array.isArray(selectedChallenge.tips) && selectedChallenge.tips.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedChallenge.tips.map((tip: any, index: number) => (
                  <li key={index} className="text-gray-700">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <PremiumButton
              variant="outline"
              onClick={() => setViewMode('list')}
            >
              Back to List
            </PremiumButton>
            <PremiumButton
              variant="primary"
              icon={UserPlusIcon}
              onClick={() => setViewMode('assign')}
            >
              Assign to Client
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    );
  };

  // Render assignment view
  const renderAssignmentView = () => {
    if (!selectedChallenge) return null;

    return (
      <PremiumCard>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Assigning Challenge</h3>
            <p className="text-gray-600">{selectedChallenge.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <PremiumButton
              variant="outline"
              onClick={() => setViewMode('detail')}
            >
              Back
            </PremiumButton>
            <PremiumButton
              variant="primary"
              onClick={handleAssignChallenge}
              disabled={!selectedClientId}
            >
              Assign Challenge
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {viewMode !== 'list' && (
              <button
                onClick={() => setViewMode('list')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                <PuzzlePieceIcon className="w-8 h-8 mr-3" />
                {viewMode === 'create' ? 'Create Challenge' : 
                 viewMode === 'detail' ? 'Challenge Details' :
                 viewMode === 'assign' ? 'Assign Challenge' : 'Client Challenges'}
              </h1>
              <p className="text-purple-100 mt-1">
                {viewMode === 'create' ? 'Create therapeutic challenges for clients' :
                 viewMode === 'detail' ? 'View challenge information' :
                 viewMode === 'assign' ? 'Assign challenge to client' :
                 `${filteredChallenges.length} challenges available`}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {viewMode === 'list' && (
              <PremiumButton
                icon={PlusIcon}
                onClick={() => setViewMode('create')}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20"
              >
                Create Challenge
              </PremiumButton>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PremiumMetric
            title="Available Challenges"
            value={challenges.length}
            icon={PuzzlePieceIcon}
            iconColor="text-purple-600"
          />
          <PremiumMetric
            title="My Challenges"
            value={challenges.filter(c => c.created_by === user?.id).length}
            icon={StarIcon}
            iconColor="text-pink-600"
          />
          <PremiumMetric
            title="Public Challenges"
            value={challenges.filter(c => (c as any).is_public).length}
            icon={UserGroupIcon}
            iconColor="text-blue-600"
          />
          <PremiumMetric
            title="Total Assignments"
            value={challenges.reduce((sum, c) => sum + (c.participant_count || 0), 0)}
            icon={CheckCircleIcon}
            iconColor="text-green-600"
          />
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'create' && renderCreateForm()}
      {viewMode === 'detail' && renderChallengeDetail()}
      {viewMode === 'assign' && renderAssignmentView()}

      {/* Challenge List */}
      {viewMode === 'list' && (
        <>
          {/* Tabs and Filters */}
          <div className="space-y-4">
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

            <PremiumCard>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search challenges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="depression">Depression</option>
                    <option value="stress">Stress</option>
                    <option value="relationships">Relationships</option>
                    <option value="self-care">Self Care</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Challenges Grid */}
          {filteredChallenges.length === 0 ? (
            <PremiumEmptyState
              icon={PuzzlePieceIcon}
              title="No Challenges Found"
              description={searchTerm || filters.difficulty !== 'all' || filters.category !== 'all' 
                ? "Try adjusting your search or filters"
                : activeTab === 'my'
                  ? "Create your first challenge to engage clients"
                  : "No challenges available"}
              action={activeTab === 'my' ? {
                label: 'Create Challenge',
                onClick: () => setViewMode('create')
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((challenge) => (
                <PremiumCard
                  key={challenge.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                      <TrophyIcon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {challenge.created_by === user?.id && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          My Challenge
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor((challenge as any).difficulty)}`}>
                        {(challenge as any).difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {(challenge as any).duration} days
                    </span>
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <FlagIcon className="w-3 h-3 mr-1" />
                      {challenge.category}
                    </span>
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      <UserGroupIcon className="w-3 h-3 mr-1" />
                      {challenge.participant_count || 0} participants
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <PremiumButton
                      size="sm"
                      variant="primary"
                      icon={UserPlusIcon}
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setViewMode('assign');
                      }}
                    >
                      Assign
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      icon={EyeIcon}
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setViewMode('detail');
                      }}
                    >
                      View
                    </PremiumButton>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TherapistChallengesManagement;