import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  LockClosedIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import ChallengeTimer from '@/components/challenges/ChallengeTimer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatters';

interface Challenge {
  id: string; // Will be set from assignment_id
  assignment_id: string;
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  assigned_at: string;
  due_date: string;
  status: 'active' | 'completed' | 'paused';
  notes: string | null;
  completed_at: string | null;
  instructions: string[];
  therapist_first_name: string;
  therapist_last_name: string;
  check_in_count: number;
  last_check_in_date: string | null;
  // Fields that might not be in API but are used in UI
  duration_minutes?: number;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  // Computed progress fields
  progress?: {
    completed_days: number;
    total_days: number;
    streak: number;
    last_completed: string | null;
    today_completed: boolean;
  };
  milestones?: any[];
}

const ClientChallenges: React.FC = () => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getChallenges();
      
      if (response.success && response.data) {
        const challengesData = response.data.challenges || [];
        
        // Map and compute progress for each challenge
        const mappedChallenges = challengesData.map((challenge: any) => {
          const assignedDate = new Date(challenge.assigned_at);
          const dueDate = new Date(challenge.due_date);
          const today = new Date();
          
          // Calculate total days
          const totalDays = Math.ceil((dueDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check if completed today
          const lastCheckIn = challenge.last_check_in_date ? new Date(challenge.last_check_in_date) : null;
          const todayCompleted = lastCheckIn ? 
            lastCheckIn.toDateString() === today.toDateString() : false;
          
          return {
            ...challenge,
            id: challenge.assignment_id, // Use assignment_id as id
            duration_minutes: 15, // Default duration
            frequency: 'daily', // Default frequency
            start_date: challenge.assigned_at,
            end_date: challenge.due_date,
            progress: {
              completed_days: challenge.check_in_count || 0,
              total_days: totalDays,
              streak: challenge.check_in_count || 0, // Simple streak based on check-ins
              last_completed: challenge.last_check_in_date,
              today_completed: todayCompleted
            }
          };
        });
        
        setChallenges(mappedChallenges);
      }
    } catch (err) {
      error('Failed to load challenges');
      console.error('Error loading challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.progress?.today_completed) {
      error('You have already completed this challenge today');
      return;
    }
    setSelectedChallenge(challenge);
    setShowTimer(true);
  };

  const handleChallengeComplete = async (duration: number) => {
    setShowTimer(false);
    await loadChallenges();
    success('Challenge completed! Keep up the great work! 🎉');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressPercentage = (progress: Challenge['progress'] | undefined) => {
    if (!progress || progress.total_days === 0) return 0;
    return Math.round((progress.completed_days / progress.total_days) * 100);
  };

  const filteredChallenges = challenges.filter(c => 
    activeTab === 'active' ? c.status === 'active' : c.status === 'completed'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (showTimer && selectedChallenge) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setShowTimer(false)}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Back to Challenges
        </button>
        <ChallengeTimer
          challengeId={selectedChallenge.id}
          challengeTitle={selectedChallenge.title}
          targetMinutes={selectedChallenge.duration_minutes || 15}
          onComplete={handleChallengeComplete}
          instructions={selectedChallenge.instructions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Challenges</h1>
            <p className="text-purple-100">
              Track your progress and build healthy habits
            </p>
          </div>
          <TrophyIcon className="w-16 h-16 text-purple-200" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Challenges</p>
              <p className="text-2xl font-bold text-gray-900">
                {challenges.filter(c => c.status === 'active').length}
              </p>
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
                {challenges.filter(c => c.progress?.today_completed).length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...challenges.map(c => c.progress?.streak || 0), 0)} days
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {challenges.reduce((sum, c) => sum + (c.progress?.completed_days || 0), 0)} days
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Challenges
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <PremiumEmptyState
          icon={TrophyIcon}
          title={activeTab === 'active' ? "No Active Challenges" : "No Completed Challenges"}
          description={
            activeTab === 'active' 
              ? "You don't have any active challenges. Ask your therapist to assign some challenges to help with your therapy goals."
              : "You haven't completed any challenges yet. Start working on your active challenges!"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => {
            const progressPercentage = getProgressPercentage(challenge.progress);
            const isCompletedToday = challenge.progress?.today_completed || false;
            
            return (
              <PremiumCard key={challenge.id} hover>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {challenge.description}
                      </p>
                    </div>
                    {challenge.progress && challenge.progress.streak > 0 && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <FireIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{challenge.progress.streak}</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty_level)}`}>
                      {challenge.difficulty_level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {challenge.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {challenge.duration_minutes || 15} min
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {challenge.frequency || 'daily'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {challenge.progress?.completed_days || 0} / {challenge.progress?.total_days || 0} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {formatDate(challenge.start_date || challenge.assigned_at)} - {formatDate(challenge.end_date || challenge.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {challenge.status === 'active' && (
                    <PremiumButton
                      variant={isCompletedToday ? 'outline' : 'primary'}
                      size="sm"
                      icon={isCompletedToday ? CheckCircleIcon : PlayIcon}
                      onClick={() => handleStartChallenge(challenge)}
                      disabled={isCompletedToday}
                      className="w-full"
                    >
                      {isCompletedToday ? 'Completed Today' : 'Start Today\'s Session'}
                    </PremiumButton>
                  )}

                  {challenge.status === 'completed' && (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Challenge Completed!</span>
                    </div>
                  )}

                  {/* Milestones */}
                  {challenge.milestones && challenge.milestones.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Milestones</p>
                      <div className="space-y-1">
                        {challenge.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${
                              milestone.achieved 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`}>
                              {milestone.achieved && (
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className={`text-xs ${
                              milestone.achieved 
                                ? 'text-gray-700 line-through' 
                                : 'text-gray-600'
                            }`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientChallenges;