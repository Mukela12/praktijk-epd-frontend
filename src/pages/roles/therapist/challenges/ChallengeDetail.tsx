import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';
import notifications from '@/utils/notifications';

const ChallengeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.get(`/challenges/${challengeId}`);

      if (response.success && response.data) {
        setChallenge(response.data);
      } else {
        notifications.error('Challenge not found');
        navigate('/therapist/challenges');
      }
    } catch (error: any) {
      console.error('Error loading challenge:', error);
      notifications.error('Failed to load challenge');
      navigate('/therapist/challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await realApiService.delete(`/challenges/${challengeId}`);

      if (response.success) {
        notifications.success('Challenge deleted successfully');
        navigate('/therapist/challenges');
      } else {
        notifications.error('Failed to delete challenge');
      }
    } catch (error: any) {
      console.error('Error deleting challenge:', error);
      notifications.error('Failed to delete challenge');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading challenge..." />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Not Found</h3>
        <p className="text-gray-600 mb-6">The challenge you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/therapist/challenges')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/therapist/challenges')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Challenges
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {challenge.category && `${challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)} Challenge`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/therapist/challenges/${challengeId}/progress`)}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              title="View Progress"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Progress
            </button>
            <button
              onClick={() => navigate(`/therapist/challenges/${challengeId}/assign`)}
              className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
              title="Assign"
            >
              <PaperAirplaneIcon className="w-5 h-5 mr-2" />
              Assign
            </button>
            <button
              onClick={() => navigate(`/therapist/challenges/${challengeId}/edit`)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PencilSquareIcon className="w-5 h-5 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {challenge.duration_days || challenge.targetValue} {challenge.targetUnit || 'days'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <FireIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {challenge.difficulty || 'Beginner'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visibility</p>
                  <p className="font-semibold text-gray-900">
                    {challenge.is_public ? 'Public' : 'Private'}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{challenge.description}</p>
          </div>

          {/* Instructions */}
          {Array.isArray(challenge.instructions) && challenge.instructions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
              <ul className="list-decimal list-inside space-y-2 text-gray-700">
                {challenge.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {Array.isArray(challenge.tips) && challenge.tips.length > 0 && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Tips for Success</h2>
              <ul className="list-disc list-inside space-y-2 text-blue-900">
                {challenge.tips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestones */}
          {Array.isArray(challenge.milestones) && challenge.milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-3">
                {challenge.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{milestone.name || milestone.title}</p>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Created: {formatDate(challenge.created_at)}</span>
              {challenge.updated_at && (
                <span>Last updated: {formatDate(challenge.updated_at)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChallengeDetail;
