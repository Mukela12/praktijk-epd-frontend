import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import notifications from '@/utils/notifications';

const EditChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.get(`/challenges/${challengeId}`);

      if (response.success && response.data) {
        setInitialData(response.data);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading challenge..." />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Not Found</h3>
        <p className="text-gray-600 mb-6">The challenge you're trying to edit doesn't exist.</p>
        <button
          onClick={() => navigate('/therapist/challenges')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  // For now, redirect to detail view with a message
  // TODO: Implement proper edit functionality
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Edit Mode</h3>
        <p className="text-yellow-700 mb-4">
          Challenge editing functionality is currently being enhanced. For now, you can view the challenge details.
        </p>
        <button
          onClick={() => navigate(`/therapist/challenges/${challengeId}`)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          View Challenge Details
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{initialData.title}</h2>
        <p className="text-gray-600 mb-4">{initialData.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Category:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">{initialData.category}</span>
          </div>
          <div>
            <span className="text-gray-600">Difficulty:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">{initialData.difficulty}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium text-gray-900">
              {initialData.duration_days || initialData.targetValue} {initialData.targetUnit || 'days'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Visibility:</span>
            <span className="ml-2 font-medium text-gray-900">
              {initialData.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {Array.isArray(initialData.instructions) && initialData.instructions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <ul className="list-decimal list-inside text-gray-700 space-y-1">
              {initialData.instructions.map((instruction: string, idx: number) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditChallenge;
