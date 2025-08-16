import React, { useState, useEffect, useMemo } from 'react';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  PuzzlePieceIcon,
  TrophyIcon,
  FlagIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  TagsField,
  CheckboxField
} from '@/components/forms/FormFields';
import type { Challenge, ChallengeDifficulty, ChallengeStatus } from '@/types/resources';

// Challenge Templates
const challengeTemplates = [
  {
    title: '7-Day Mindfulness Challenge',
    description: 'Build a daily meditation habit with this beginner-friendly mindfulness challenge',
    type: 'daily' as const,
    category: 'mindfulness',
    difficultyLevel: 'easy' as ChallengeDifficulty,
    durationDays: 7,
    targetValue: 7,
    targetUnit: 'days',
    goals: {
      targetValue: 7,
      targetUnit: 'days',
      description: 'Complete 7 consecutive days of mindfulness meditation'
    },
    rules: [
      'Meditate for at least 10 minutes each day',
      'Use any meditation app or technique you prefer',
      'Track your progress daily',
      'If you miss a day, continue from where you left off'
    ],
    milestones: [
      { id: 'm1', dueDay: 3, title: 'Getting Started', description: '3 days completed - You\'re building the habit!', targetValue: 3 },
      { id: 'm2', dueDay: 5, title: 'Almost There', description: '5 days completed - Keep going!', targetValue: 5 },
      { id: 'm3', dueDay: 7, title: 'Challenge Complete!', description: 'Congratulations on completing the challenge!', targetValue: 7 }
    ],
    rewards: 'Certificate of completion and mindfulness badge',
    instructions: 'Find a quiet space, sit comfortably, and focus on your breath. Use guided meditations if helpful.',
    tips: 'Set a consistent time each day, create a dedicated space, start with shorter sessions if needed',
    status: 'active' as ChallengeStatus
  },
  {
    title: '30-Day Fitness Journey',
    description: 'Transform your physical health with daily exercise and movement',
    type: 'daily' as const,
    category: 'fitness',
    difficultyLevel: 'medium' as ChallengeDifficulty,
    durationDays: 30,
    targetValue: 30,
    targetUnit: 'workouts',
    goals: {
      targetValue: 30,
      targetUnit: 'workouts',
      description: 'Complete 30 days of physical exercise'
    },
    rules: [
      'Exercise for at least 20 minutes daily',
      'Mix cardio, strength, and flexibility exercises',
      'Rest days count if you do light stretching',
      'Listen to your body and avoid overexertion'
    ],
    milestones: [
      { id: 'm1', dueDay: 7, title: 'First Week Done', description: 'Great start! Your body is adapting', targetValue: 7 },
      { id: 'm2', dueDay: 14, title: 'Halfway Mark', description: 'Two weeks strong - habits are forming', targetValue: 14 },
      { id: 'm3', dueDay: 21, title: 'Three Weeks', description: 'It takes 21 days to form a habit!', targetValue: 21 },
      { id: 'm4', dueDay: 30, title: 'Champion!', description: 'You\'ve completed the fitness journey!', targetValue: 30 }
    ],
    rewards: 'Fitness achievement badge and personalized workout plan',
    instructions: 'Choose activities you enjoy. Start with warm-up, do main exercise, end with cool-down.',
    tips: 'Track progress with photos, find an accountability partner, celebrate small wins',
    status: 'active' as ChallengeStatus
  },
  {
    title: 'Gratitude Practice Challenge',
    description: 'Cultivate happiness and positivity through daily gratitude journaling',
    type: 'daily' as const,
    category: 'mental_health',
    difficultyLevel: 'easy' as ChallengeDifficulty,
    durationDays: 14,
    targetValue: 14,
    targetUnit: 'entries',
    goals: {
      targetValue: 14,
      targetUnit: 'entries',
      description: 'Write 3 things you\'re grateful for each day for 14 days'
    },
    rules: [
      'Write down 3 things you\'re grateful for each day',
      'Be specific and detailed in your entries',
      'Try to find new things each day',
      'Reflect on why you\'re grateful for each item'
    ],
    milestones: [
      { id: 'm1', dueDay: 3, title: 'Starting Strong', description: 'You\'re developing awareness of positivity', targetValue: 3 },
      { id: 'm2', dueDay: 7, title: 'One Week', description: 'A full week of gratitude - notice any changes?', targetValue: 7 },
      { id: 'm3', dueDay: 14, title: 'Gratitude Master', description: 'Two weeks of daily gratitude complete!', targetValue: 14 }
    ],
    rewards: 'Gratitude journal template and happiness tracker',
    instructions: 'Each evening, write 3 specific things from your day. Include why you\'re grateful.',
    tips: 'Keep journal by bedside, include people/experiences/small moments, review past entries',
    status: 'active' as ChallengeStatus
  }
];

const ChallengesManagementInline: React.FC = () => {
  const { success, error } = useAlert();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    type: 'daily',
    category: 'mental_health',
    difficultyLevel: 'easy',
    durationDays: 7,
    targetValue: 1,
    targetUnit: 'times',
    goals: {
      targetValue: 1,
      targetUnit: 'times',
      description: ''
    },
    rules: [],
    milestones: [],
    status: 'draft',
    rewards: '',
    instructions: '',
    tips: ''
  });

  // Load challenges
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.challenges.getChallenges();
      
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

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (viewMode === 'create') {
        const challengeData = {
          title: formData.title || '',
          description: formData.description || '',
          category: formData.category || 'mental_health',
          difficulty: formData.difficultyLevel || 'easy',
          duration: formData.durationDays || 7,
          targetValue: formData.targetValue || 1,
          targetUnit: formData.targetUnit || 'times',
          isPublic: true,
          milestones: formData.milestones || [],
          rewards: formData.rewards || '',
          instructions: formData.instructions ? [formData.instructions] : [],
          tips: formData.tips ? [formData.tips] : []
        };
        const response = await realApiService.challenges.createChallenge(challengeData);
        if (response.success) {
          success('Challenge created successfully');
          await loadChallenges();
          handleCancel();
        }
      } else if (viewMode === 'edit' && selectedChallenge) {
        const challengeData = {
          title: formData.title || '',
          description: formData.description || '',
          category: formData.category || 'mental_health',
          difficulty: formData.difficultyLevel || 'easy',
          duration: formData.durationDays || 7,
          targetValue: formData.targetValue || 1,
          targetUnit: formData.targetUnit || 'times',
          isPublic: true,
          milestones: formData.milestones || [],
          rewards: formData.rewards || '',
          instructions: formData.instructions ? [formData.instructions] : [],
          tips: formData.tips ? [formData.tips] : []
        };
        const response = await realApiService.challenges.updateChallenge(selectedChallenge.id, challengeData);
        if (response.success) {
          success('Challenge updated successfully');
          await loadChallenges();
          handleCancel();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save challenge');
    }
  };

  // Handle delete
  const handleDelete = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      await realApiService.challenges.deleteChallenge(challengeId);
      success('Challenge deleted successfully');
      await loadChallenges();
    } catch (err) {
      error('Failed to delete challenge');
    }
  };

  // Handle use template
  const handleUseTemplate = (template: typeof challengeTemplates[0]) => {
    setFormData({
      ...template,
      status: 'draft' as ChallengeStatus // Always start as draft
    });
    setViewMode('create');
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedChallenge(null);
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      category: 'mental_health',
      difficultyLevel: 'easy',
      durationDays: 7,
      targetValue: 1,
      targetUnit: 'times',
      goals: {
        targetValue: 1,
        targetUnit: 'times',
        description: ''
      },
      rules: [],
      milestones: [],
      status: 'draft'
    });
  };

  // Handle create
  const handleCreate = () => {
    setViewMode('create');
  };

  // Handle edit
  const handleEdit = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormData(challenge);
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setViewMode('detail');
  };

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          challenge.title.toLowerCase().includes(searchLower) ||
          challenge.description.toLowerCase().includes(searchLower) ||
          challenge.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && challenge.category !== filterCategory) return false;
      
      // Difficulty filter
      if (filterDifficulty !== 'all' && challenge.difficultyLevel !== filterDifficulty) return false;
      
      // Status filter
      if (filterStatus !== 'all' && challenge.status !== filterStatus) return false;

      return true;
    });
  }, [challenges, searchTerm, filterCategory, filterDifficulty, filterStatus]);

  // Get icon for challenge category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mental_health': return PuzzlePieceIcon;
      case 'fitness': return FireIcon;
      case 'nutrition': return StarIcon;
      case 'mindfulness': return UserGroupIcon;
      default: return PuzzlePieceIcon;
    }
  };

  // Get color for difficulty
  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Column definitions
  const columns = [
    {
      key: 'title',
      label: 'Challenge',
      render: (challenge: Challenge) => {
        const Icon = getCategoryIcon(challenge.category);
        return (
          <div className="flex items-start space-x-3">
            <Icon className="w-5 h-5 mt-0.5 text-indigo-600" />
            <div>
              <p className="font-medium text-gray-900">{challenge.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {challenge.description}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (challenge: Challenge) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {challenge.category.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (challenge: Challenge) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficultyLevel)}`}>
          {challenge.difficultyLevel}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (challenge: Challenge) => (
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-1" />
          {challenge.durationDays} days
        </div>
      )
    },
    {
      key: 'participants',
      label: 'Participants',
      render: (challenge: Challenge) => (
        <div className="flex items-center text-sm text-gray-600">
          <UserGroupIcon className="w-4 h-4 mr-1" />
          {challenge.participant_count}
        </div>
      )
    },
    {
      key: 'completion',
      label: 'Completion Rate',
      render: (challenge: Challenge) => (
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          {challenge.completion_rate}%
        </div>
      )
    }
  ];

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Title"
          name="title"
          value={formData.title || ''}
          onChange={(value) => setFormData({ ...formData, title: value })}
          required
          placeholder="Enter challenge title"
        />

        <SelectField
          label="Category"
          name="category"
          value={formData.category || 'mental_health'}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={[
            { value: 'mental_health', label: 'Mental Health' },
            { value: 'fitness', label: 'Fitness' },
            { value: 'nutrition', label: 'Nutrition' },
            { value: 'sleep', label: 'Sleep' },
            { value: 'mindfulness', label: 'Mindfulness' },
            { value: 'habits', label: 'Habits' },
            { value: 'social', label: 'Social' },
            { value: 'learning', label: 'Learning' }
          ]}
          required
        />

        <SelectField
          label="Difficulty Level"
          name="difficultyLevel"
          value={formData.difficultyLevel || 'easy'}
          onChange={(value) => setFormData({ ...formData, difficultyLevel: value as ChallengeDifficulty })}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' }
          ]}
          required
        />

        <NumberField
          label="Duration (days)"
          name="durationDays"
          value={formData.durationDays || 7}
          onChange={(value) => setFormData({ ...formData, durationDays: value })}
          min={1}
          max={365}
          required
        />

        <NumberField
          label="Target Value"
          name="targetValue"
          value={formData.targetValue || 1}
          onChange={(value) => setFormData({ ...formData, targetValue: value })}
          min={1}
          required
        />

        <TextField
          label="Target Unit"
          name="targetUnit"
          value={formData.targetUnit || ''}
          onChange={(value) => setFormData({ ...formData, targetUnit: value })}
          placeholder="e.g., times, minutes, hours"
          required
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status || 'draft'}
          onChange={(value) => setFormData({ ...formData, status: value as ChallengeStatus })}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Describe the challenge and its objectives"
        rows={4}
      />

      <TextareaField
        label="Goal Description"
        name="goalDescription"
        value={formData.goals?.description || ''}
        onChange={(value) => setFormData({ 
          ...formData, 
          goals: { ...formData.goals!, description: value }
        })}
        placeholder="Describe what participants should achieve"
        rows={3}
      />
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedChallenge) return null;

    const Icon = getCategoryIcon(selectedChallenge.category);

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Icon className="w-8 h-8 text-indigo-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
            <p className="text-gray-500 mt-1">{selectedChallenge.category.replace('_', ' ')} • {selectedChallenge.difficultyLevel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-2xl font-bold text-gray-900">{selectedChallenge.durationDays} days</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Target</p>
            <p className="text-2xl font-bold text-gray-900">{selectedChallenge.targetValue} {selectedChallenge.targetUnit}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Participants</p>
            <p className="text-2xl font-bold text-gray-900">{selectedChallenge.participant_count}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{selectedChallenge.completion_rate}%</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedChallenge.description}</p>
        </div>

        {selectedChallenge.goals && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Goals</h3>
            <p className="text-gray-700">{selectedChallenge.goals.description}</p>
          </div>
        )}

        {selectedChallenge.rules && selectedChallenge.rules.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              {selectedChallenge.rules.map((rule, index) => (
                <li key={index} className="text-gray-700">{rule}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>Created: {new Date(selectedChallenge.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(selectedChallenge.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Challenge Management"
      subtitle="Create and manage therapeutic challenges for clients"
      icon={TrophyIcon}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create Challenge"
      totalCount={challenges.length}
      onBack={viewMode !== 'list' ? handleCancel : undefined}
    >
      {viewMode === 'list' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="sleep">Sleep</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="habits">Habits</option>
                  <option value="social">Social</option>
                  <option value="learning">Learning</option>
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

          {/* Templates Section for Empty State */}
          {challenges.length === 0 && searchTerm === '' && filterCategory === 'all' && filterDifficulty === 'all' && filterStatus === 'all' && (
            <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Challenge Templates</h3>
              <p className="text-sm text-gray-600 mb-6">Start with these professionally designed therapeutic challenges</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {challengeTemplates.map((template, index) => {
                  const Icon = getCategoryIcon(template.category);
                  return (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficultyLevel)}`}>
                              {template.difficultyLevel}
                            </span>
                            <span className="text-xs text-gray-500">{template.durationDays} days</span>
                          </div>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Use this template →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Challenge List */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No challenges found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating a new challenge'}
              </p>
              {searchTerm === '' && filterCategory === 'all' && filterDifficulty === 'all' && filterStatus === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create Challenge
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChallenges.map((challenge) => (
                    <tr key={challenge.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(challenge)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(challenge)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(challenge.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {renderFormFields()}
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              {viewMode === 'create' ? 'Create Challenge' : 'Update Challenge'}
            </button>
          </div>
        </form>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && (
        <div className="space-y-6">
          {renderDetailView()}
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(selectedChallenge!)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit Challenge
            </button>
          </div>
        </div>
      )}
    </InlineCrudLayout>
  );
};

export default ChallengesManagementInline;