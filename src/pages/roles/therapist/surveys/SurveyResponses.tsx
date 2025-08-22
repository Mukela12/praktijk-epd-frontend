import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate, formatTime } from '@/utils/dateFormatters';

interface SurveyResponse {
  id: string;
  surveyId: string;
  clientId: string;
  clientName: string;
  responses: any[];
  submittedAt: string;
  completionTime: number; // in minutes
}

const SurveyResponses: React.FC = () => {
  const { surveyId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      loadSurveyAndResponses();
    }
  }, [surveyId]);

  const loadSurveyAndResponses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load survey details and responses using working endpoints
      const [surveyResponse, responsesResponse] = await Promise.all([
        realApiService.surveys.getSurveyById(surveyId!),
        realApiService.surveys.getResponses(surveyId!)
      ]);
      
      if (surveyResponse.success) {
        setSurvey(surveyResponse.data);
      }
      
      if (responsesResponse.success) {
        const responsesData = responsesResponse.data?.responses || responsesResponse.data || [];
        setResponses(Array.isArray(responsesData) ? responsesData : []);
      }
    } catch (error: any) {
      // Silent fail on error
      setError('Failed to load survey responses');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToTextFile = () => {
    if (!survey || responses.length === 0) return;
    
    let content = `Survey: ${survey.title}\n`;
    content += `Created: ${formatDate(survey.createdAt)}\n`;
    content += `Total Responses: ${responses.length}\n`;
    content += `\n${'='.repeat(80)}\n\n`;
    
    responses.forEach((response, index) => {
      content += `Response #${index + 1}\n`;
      content += `Client: ${response.clientName}\n`;
      content += `Submitted: ${formatDate(response.submittedAt)}\n`;
      content += `Completion Time: ${response.completionTime} minutes\n`;
      content += `\n`;
      
      response.responses.forEach((answer: any, qIndex: number) => {
        const question = survey.questions?.[qIndex];
        if (question) {
          content += `Q${qIndex + 1}: ${question.text}\n`;
          content += `A: ${answer.value || answer.text || 'No answer'}\n`;
          if (answer.note) {
            content += `Note: ${answer.note}\n`;
          }
          content += `\n`;
        }
      });
      
      content += `\n${'='.repeat(80)}\n\n`;
    });
    
    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${survey.title.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!survey || responses.length === 0) return;
    
    // Create CSV headers
    const headers = ['Client Name', 'Submitted Date', 'Completion Time (minutes)'];
    survey.questions?.forEach((question: any, index: number) => {
      headers.push(`Q${index + 1}: ${question.text}`);
    });
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row = [
        response.clientName,
        formatDate(response.submittedAt),
        response.completionTime.toString()
      ];
      
      response.responses.forEach((answer: any) => {
        row.push(answer.value || answer.text || '');
      });
      
      return row;
    });
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${survey.title.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading survey responses..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/therapist/surveys')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Surveys
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/therapist/surveys')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey Responses</h1>
              <p className="text-gray-600 mt-1">{survey?.title}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToTextFile}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Export Text
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{responses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {survey?.assignmentCount > 0 
                    ? Math.round((responses.length / survey.assignmentCount) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {responses.length > 0
                    ? Math.round(responses.reduce((sum, r) => sum + r.completionTime, 0) / responses.length)
                    : 0} min
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Response</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {responses.length > 0
                    ? formatDate(responses[0].submittedAt)
                    : 'No responses yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Response List */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Individual Responses</h2>
          </div>
          
          {responses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedResponse(response)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{response.clientName}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted {formatDate(response.submittedAt)} • {response.completionTime} minutes
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No responses yet</p>
            </div>
          )}
        </div>

        {/* Response Detail Modal (Inline) */}
        {selectedResponse && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Response from {selectedResponse.clientName}
              </h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {selectedResponse.responses.map((answer: any, index: number) => {
                const question = survey.questions?.[index];
                if (!question) return null;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {index + 1}. {question.text}
                    </h4>
                    <p className="text-gray-700">
                      {answer.value || answer.text || 'No answer provided'}
                    </p>
                    {answer.note && (
                      <p className="text-sm text-gray-500 mt-2">
                        Note: {answer.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default SurveyResponses;