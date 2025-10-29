import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import notifications from '@/utils/notifications';
import CreateSurvey from './CreateSurvey';

const EditSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.get(`/surveys/${surveyId}`);

      if (response.success && response.data) {
        setInitialData(response.data);
      } else {
        notifications.error('Survey not found');
        navigate('/therapist/surveys');
      }
    } catch (error: any) {
      console.error('Error loading survey:', error);
      notifications.error('Failed to load survey');
      navigate('/therapist/surveys');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading survey..." />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Not Found</h3>
        <p className="text-gray-600 mb-6">The survey you're trying to edit doesn't exist.</p>
        <button
          onClick={() => navigate('/therapist/surveys')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Surveys
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
          Survey editing functionality is currently being enhanced. For now, you can view the survey details.
        </p>
        <button
          onClick={() => navigate(`/therapist/surveys/${surveyId}`)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          View Survey Details
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{initialData.title}</h2>
        <p className="text-gray-600 mb-4">{initialData.description}</p>

        {Array.isArray(initialData.questions) && initialData.questions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Questions ({initialData.questions.length})</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {initialData.questions.map((q: any, idx: number) => (
                <li key={q.id || idx}>{q.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSurvey;
