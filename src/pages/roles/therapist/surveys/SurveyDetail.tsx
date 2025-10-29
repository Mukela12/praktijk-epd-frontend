import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';
import notifications from '@/utils/notifications';

const SurveyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.get(`/surveys/${surveyId}`);

      if (response.success && response.data) {
        setSurvey(response.data);
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this survey?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await realApiService.delete(`/surveys/${surveyId}`);

      if (response.success) {
        notifications.success('Survey deleted successfully');
        navigate('/therapist/surveys');
      } else {
        notifications.error('Failed to delete survey');
      }
    } catch (error: any) {
      console.error('Error deleting survey:', error);
      notifications.error('Failed to delete survey');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading survey..." />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Not Found</h3>
        <p className="text-gray-600 mb-6">The survey you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/therapist/surveys')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Surveys
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
              onClick={() => navigate('/therapist/surveys')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Surveys
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {survey.type && `${survey.type.charAt(0).toUpperCase() + survey.type.slice(1)} Survey`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/therapist/surveys/${surveyId}/responses`)}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              title="View Responses"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Responses
            </button>
            <button
              onClick={() => navigate(`/therapist/surveys/${surveyId}/assign`)}
              className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
              title="Assign"
            >
              <PaperAirplaneIcon className="w-5 h-5 mr-2" />
              Assign
            </button>
            <button
              onClick={() => navigate(`/therapist/surveys/${surveyId}/edit`)}
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

        {/* Survey Content */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{survey.description}</p>
          </div>

          {/* Questions */}
          {Array.isArray(survey.questions) && survey.questions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions ({survey.questions.length})</h2>
              <div className="space-y-4">
                {survey.questions.map((question: any, index: number) => (
                  <div key={question.id || index} className="border-l-4 border-green-600 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {index + 1}. {question.text}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {question.type}
                          {question.required && <span className="ml-2 text-red-600">*Required</span>}
                        </p>
                      </div>
                    </div>
                    {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                      <div className="mt-2 ml-4">
                        <p className="text-sm text-gray-600 mb-1">Options:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {question.options.map((option: string, optIdx: number) => (
                            <li key={optIdx}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Created: {formatDate(survey.created_at)}</span>
              {survey.updated_at && (
                <span>Last updated: {formatDate(survey.updated_at)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SurveyDetail;
