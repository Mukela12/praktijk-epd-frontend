import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi } from '@/services/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate } from '@/utils/dateFormatters';

// Types
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  targetValue: number;
  targetUnit: string;
  points: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  createdBy: string;
  startDate?: string;
  endDate?: string;
  participantCount?: number;
  completionRate?: number;
  isPublic: boolean;
  tags?: string[];
}

const ChallengesManagementInline: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert } = useAlert();

  // State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'participants'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    difficulty: 'all'
  });

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'beginner',
    duration: 7,
    targetValue: 1,
    targetUnit: 'times',
    points: 100,
    status: 'draft',
    isPublic: true,
    tags: []
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
        setChallenges(response.data.challenges || response.data || []);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
      errorAlert('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || challenge.status === filters.status;
    const matchesCategory = filters.category === 'all' || challenge.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || challenge.difficulty === filters.difficulty;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDifficulty;
  });

  // Handle form changes
  const handleFormChange = (field: keyof Challenge, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle create challenge
  const handleCreateChallenge = async () => {
    try {
      const response = await resourcesApi.createChallenge({
        ...formData,
        createdBy: user?.id || ''
      });
      
      if (response.success) {
        success('Challenge created successfully');
        loadChallenges();
        setViewMode('list');
        setFormData({
          title: '',
          description: '',
          category: 'general',
          difficulty: 'beginner',
          duration: 7,
          targetValue: 1,
          targetUnit: 'times',
          points: 100,
          status: 'draft',
          isPublic: true,
          tags: []
        });
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      errorAlert('Failed to create challenge');
    }
  };

  // Handle update challenge
  const handleUpdateChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      const response = await resourcesApi.updateChallenge(selectedChallenge.id, formData);
      
      if (response.success) {
        success('Challenge updated successfully');
        loadChallenges();
        setViewMode('list');
        setSelectedChallenge(null);
      }
    } catch (error) {
      console.error('Failed to update challenge:', error);
      errorAlert('Failed to update challenge');
    }
  };

  // Handle delete challenge
  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      const response = await resourcesApi.deleteChallenge(id);
      
      if (response.success) {
        success('Challenge deleted successfully');
        loadChallenges();
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error);
      errorAlert('Failed to delete challenge');
    }
  };

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await resourcesApi.updateChallenge(id, { status: newStatus });
      
      if (response.success) {
        success(`Challenge ${newStatus === 'published' ? 'published' : 'updated'} successfully`);
        loadChallenges();
      }
    } catch (error) {
      console.error('Failed to update challenge status:', error);
      errorAlert('Failed to update challenge status');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      fitness: 'bg-red-100 text-red-800',
      mindfulness: 'bg-purple-100 text-purple-800',
      nutrition: 'bg-green-100 text-green-800',
      sleep: 'bg-blue-100 text-blue-800',
      social: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <TrophyIcon className="w-8 h-8 mr-3" />
              Challenges Management
            </h1>
            <p className="text-emerald-100 mt-1">
              Create and manage therapeutic challenges for clients
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Total Challenges</span>
              <span className="block text-xl font-bold">{challenges.length}</span>
            </div>
            {viewMode === 'list' && (
              <PremiumButton
                onClick={() => {
                  setViewMode('create');
                  setFormData({
                    title: '',
                    description: '',
                    category: 'general',
                    difficulty: 'beginner',
                    duration: 7,
                    targetValue: 1,
                    targetUnit: 'times',
                    points: 100,
                    status: 'draft',
                    isPublic: true,
                    tags: []
                  });
                }}
                className="bg-white text-emerald-600 hover:bg-gray-50"
                icon={PlusIcon}
              >
                Create Challenge
              </PremiumButton>
            )}
          </div>
        </div>
      </div>

      {/* View modes */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <PremiumCard>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="fitness">Fitness</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="sleep">Sleep</option>
                  <option value="social">Social</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredChallenges.length} of {challenges.length} challenges
              </div>
            </div>
          </PremiumCard>

          {/* Challenges List */}
          {filteredChallenges.length === 0 ? (
            <PremiumEmptyState
              icon={TrophyIcon}
              title="No Challenges Found"
              description={searchTerm || filters.status !== 'all' ? "No challenges match your filters." : "Create your first challenge to get started."}
              action={{
                label: 'Create Challenge',
                onClick: () => setViewMode('create')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredChallenges.map((challenge) => (
                <PremiumCard key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(challenge.category)}`}>
                          {challenge.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <StatusBadge
                          type="general"
                          status={challenge.status}
                          size="sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {challenge.duration} days
                        </div>
                        <div className="flex items-center">
                          <SparklesIcon className="w-4 h-4 mr-1" />
                          {challenge.points} points
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {challenge.participantCount || 0} participants
                        </div>
                        <div className="flex items-center">
                          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                          {challenge.completionRate || 0}% completion
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setViewMode('participants');
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Participants
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={PencilIcon}
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setFormData(challenge);
                          setViewMode('edit');
                        }}
                      >
                        Edit
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={TrashIcon}
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'create' ? 'Create New Challenge' : 'Edit Challenge'}
              </h2>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedChallenge(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'general',
                    difficulty: 'beginner',
                    duration: 7,
                    targetValue: 1,
                    targetUnit: 'times',
                    points: 100,
                    status: 'draft',
                    isPublic: true,
                    tags: []
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Challenge title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category || 'general'}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="fitness">Fitness</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="sleep">Sleep</option>
                  <option value="social">Social</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty || 'beginner'}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={formData.duration || 7}
                  onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  value={formData.targetValue || 1}
                  onChange={(e) => handleFormChange('targetValue', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Unit</label>
                <input
                  type="text"
                  value={formData.targetUnit || 'times'}
                  onChange={(e) => handleFormChange('targetUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., times, minutes, hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points || 100}
                  onChange={(e) => handleFormChange('points', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                  placeholder="Describe the challenge..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic ?? true}
                    onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Make this challenge public</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedChallenge(null);
                }}
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="primary"
                icon={CheckCircleIcon}
                onClick={viewMode === 'create' ? handleCreateChallenge : handleUpdateChallenge}
              >
                {viewMode === 'create' ? 'Create Challenge' : 'Update Challenge'}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Participants View */}
      {viewMode === 'participants' && selectedChallenge && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Challenge Participants</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedChallenge.title}</p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedChallenge(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-12 text-gray-500">
              <UserGroupIcon className="w-12 h-12 mx-auto mb-4" />
              <p>Participant management functionality will be implemented here.</p>
              <p className="text-sm mt-2">This will show all clients participating in this challenge and their progress.</p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedChallenge(null);
                }}
              >
                Back to List
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default ChallengesManagementInline;