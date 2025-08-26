import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  FireIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  BeakerIcon,
  SunIcon,
  MoonIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';

// Challenge category icons
const categoryIcons: { [key: string]: React.ElementType } = {
  breathing: SunIcon,
  gratitude: HeartIcon,
  mindfulness: BeakerIcon,
  exercise: BoltIcon,
  social: UserGroupIcon,
  sleep: MoonIcon,
  nutrition: SparklesIcon,
  meditation: SunIcon
};

// Challenge difficulty colors
const difficultyConfig = {
  beginner: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Beginner'
  },
  intermediate: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Intermediate'
  },
  advanced: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Advanced'
  }
};

// Challenge difficulty badge
const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.beginner;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Challenge category badge
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const Icon = categoryIcons[category] || SparklesIcon;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 text-sm">
      <Icon className="w-4 h-4 text-gray-600 mr-1" />
      <span className="text-gray-700">{formattedCategory}</span>
    </span>
  );
};

// Challenge card component
interface ChallengeCardProps {
  challenge: any;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onViewProgress: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onAssign,
  onViewProgress
}) => {
  const assignedCount = challenge.assignedCount || 0;
  const activeCount = challenge.activeCount || 0;
  const completionRate = challenge.completionRate || 0;
  const Icon = categoryIcons[challenge.category] || SparklesIcon;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-green-600/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            challenge.isPublic ? 'bg-green-600/10' : 'bg-gray-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              challenge.isPublic ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
          </div>
        </div>
        <DifficultyBadge difficulty={challenge.difficulty || 'beginner'} />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <CategoryBadge category={challenge.category} />
        <span className="text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 inline mr-1" />
          {challenge.durationMinutes || challenge.duration} {challenge.targetUnit || 'days'}
        </span>
        {challenge.frequencyPerWeek && (
          <span className="text-sm text-gray-600">
            {challenge.frequencyPerWeek}x/week
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assignedCount}</div>
          <div className="text-xs text-gray-600">Assigned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-xs text-gray-600">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-xs text-gray-600">Completion</div>
        </div>
      </div>

      {challenge.milestones && challenge.milestones.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <TrophyIcon className="w-4 h-4 mr-1" />
            <span>{challenge.milestones.length} milestones</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Created {formatDate(challenge.createdAt || new Date().toISOString())}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Challenge"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Challenge"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Duplicate Challenge"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          {assignedCount > 0 && (
            <button
              onClick={onViewProgress}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="View Progress"
            >
              <ChartBarIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onAssign}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Assign to Client"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Challenge"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick stats component
const QuickStats: React.FC<{ challenges: any[] }> = ({ challenges }) => {
  const totalChallenges = challenges.length;
  const publicChallenges = challenges.filter(c => c.isPublic).length;
  const privateChallenges = challenges.filter(c => !c.isPublic).length;
  const totalAssigned = challenges.reduce((sum, c) => sum + (c.assignedCount || 0), 0);

  const stats = [
    {
      label: 'Total Challenges',
      value: totalChallenges,
      icon: TrophyIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Public Challenges',
      value: publicChallenges,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Private Challenges',
      value: privateChallenges,
      icon: SparklesIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Total Assigned',
      value: totalAssigned,
      icon: CheckCircleIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

const ProfessionalTherapistChallenges: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [searchTerm, filterCategory, filterDifficulty, showPublicOnly, challenges]);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getChallenges();
      
      if (response.success && response.data) {
        const challengesData = Array.isArray(response.data.challenges) ? response.data.challenges : [];
        setChallenges(challengesData);
      } else {
        setChallenges([]);
        setError('No challenges found.');
      }
    } catch (error: any) {
      console.error('Error loading challenges:', error);
      setChallenges([]);
      
      if (error?.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error?.response?.status === 404) {
        setError('Challenges endpoint not found. Please contact support.');
      } else if (error?.response?.status === 403) {
        setError('You do not have permission to view challenges.');
      } else {
        setError('Failed to load challenges. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = [...challenges];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(challenge => 
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === filterCategory);
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === filterDifficulty);
    }

    // Apply public filter
    if (showPublicOnly) {
      filtered = filtered.filter(challenge => challenge.isPublic);
    }

    setFilteredChallenges(filtered);
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const response = await realApiService.therapist.deleteChallenge(challengeId);
      if (response.success) {
        await loadChallenges();
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge. Please try again.');
    }
  };

  const handleDuplicateChallenge = async (challenge: any) => {
    try {
      const duplicatedData = {
        ...challenge,
        title: `${challenge.title} (Copy)`,
        isPublic: false
      };
      delete duplicatedData.id;
      delete duplicatedData.createdAt;
      delete duplicatedData.updatedAt;
      
      const response = await realApiService.therapist.createChallenge(duplicatedData);
      if (response.success) {
        await loadChallenges();
      }
    } catch (error) {
      console.error('Error duplicating challenge:', error);
      alert('Failed to duplicate challenge. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading challenges..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Challenges</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadChallenges}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Challenges & Activities</h1>
            <p className="text-gray-600 mt-1">Create and manage therapeutic challenges for your clients</p>
          </div>
          <button
            onClick={() => navigate('/therapist/challenges/new')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Challenge
          </button>
        </div>

        {/* Quick Stats */}
        <QuickStats challenges={challenges} />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Categories</option>
                <option value="breathing">Breathing</option>
                <option value="gratitude">Gratitude</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="exercise">Exercise</option>
                <option value="social">Social</option>
                <option value="sleep">Sleep</option>
                <option value="meditation">Meditation</option>
              </select>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Public Only</span>
              </label>
              
              <button
                onClick={loadChallenges}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => navigate(`/therapist/challenges/${challenge.id}`)}
                onEdit={() => navigate(`/therapist/challenges/${challenge.id}/edit`)}
                onDuplicate={() => handleDuplicateChallenge(challenge)}
                onDelete={() => handleDeleteChallenge(challenge.id)}
                onAssign={() => navigate(`/therapist/challenges/${challenge.id}/assign`)}
                onViewProgress={() => navigate(`/therapist/challenges/${challenge.id}/progress`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all' 
                ? 'No challenges found' 
                : 'No challenges yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first challenge to help clients build healthy habits'
              }
            </p>
            {(!searchTerm && filterCategory === 'all' && filterDifficulty === 'all') && (
              <button
                onClick={() => navigate('/therapist/challenges/new')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Create Your First Challenge
              </button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistChallenges;