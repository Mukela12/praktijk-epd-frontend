import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  LockClosedIcon,
  TrophyIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatRelativeTime } from '@/utils/dateFormatters';
import PageTransition from '@/components/ui/PageTransition';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  assignedBy?: {
    first_name: string;
    last_name: string;
  };
  status?: 'pending' | 'in_progress' | 'completed';
  progress?: {
    questionsAnswered: number;
    totalQuestions: number;
    lastUpdated?: string;
    completedAt?: string;
    score?: number;
  };
  tags?: string[];
  isRequired?: boolean;
  allowSkip?: boolean;
  showProgressBar?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'yes_no' | 'scale' | 'checkbox';
  options?: string[];
  required: boolean;
  helpText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  answer?: any;
}

interface SurveyResponse {
  questionId: string;
  answer: any;
}

// Template surveys for fallback
const templateSurveys: Survey[] = [
  {
    id: 'template-1',
    title: 'Weekly Mood Check-in',
    description: 'A quick assessment of your mood and well-being over the past week.',
    category: 'Mental Health',
    questions: [
      {
        id: 'q1',
        text: 'How would you rate your overall mood this week?',
        type: 'scale',
        required: true,
        validation: { min: 1, max: 10 },
        helpText: '1 = Very low, 10 = Excellent'
      },
      {
        id: 'q2',
        text: 'Have you experienced any of the following emotions this week?',
        type: 'checkbox',
        options: ['Happy', 'Sad', 'Anxious', 'Calm', 'Frustrated', 'Hopeful'],
        required: true,
        helpText: 'Select all that apply'
      },
      {
        id: 'q3',
        text: 'How well did you sleep on average?',
        type: 'multiple_choice',
        options: ['Very poorly', 'Poorly', 'Fair', 'Well', 'Very well'],
        required: true
      },
      {
        id: 'q4',
        text: 'Did you experience any significant stressors?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'q5',
        text: 'Is there anything specific you would like to discuss in your next session?',
        type: 'text',
        required: false,
        validation: { maxLength: 500 },
        helpText: 'Optional - Share any thoughts or concerns'
      }
    ],
    estimatedTime: 5,
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    tags: ['mood', 'weekly', 'mental-health'],
    isRequired: true,
    showProgressBar: true
  },
  {
    id: 'template-2',
    title: 'Therapy Progress Review',
    description: 'Reflect on your therapy journey and the progress you have made.',
    category: 'Assessment',
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with your therapy progress?',
        type: 'rating',
        required: true,
        helpText: 'Rate from 1 to 5 stars'
      },
      {
        id: 'q2',
        text: 'What has been most helpful in your therapy sessions?',
        type: 'text',
        required: true,
        validation: { minLength: 20, maxLength: 300 }
      },
      {
        id: 'q3',
        text: 'Are you applying the coping strategies you have learned?',
        type: 'multiple_choice',
        options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
        required: true
      }
    ],
    estimatedTime: 10,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    status: 'pending',
    tags: ['progress', 'review', 'feedback'],
    showProgressBar: true
  }
];

const ClientSurveysImproved: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert } = useAlert();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'newest'>('priority');
  const [showInstructions, setShowInstructions] = useState(true);

  // Load surveys
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getSurveys();
      
      if (response.success && response.data) {
        const surveysData = response.data.surveys || response.data || [];
        const apiSurveys = Array.isArray(surveysData) ? surveysData : [];
        // Combine API surveys with template surveys
        setSurveys([...templateSurveys, ...apiSurveys]);
      } else {
        // Use template surveys as fallback
        setSurveys(templateSurveys);
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
      // Use template surveys as fallback
      setSurveys(templateSurveys);
    } finally {
      setIsLoading(false);
    }
  };

  // Start survey
  const startSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setShowInstructions(true);
    
    // Load any existing responses
    if (survey.progress && survey.progress.questionsAnswered > 0) {
      // Load saved responses if survey was in progress
      loadSavedResponses(survey.id);
    }
  };

  // Load saved responses
  const loadSavedResponses = async (surveyId: string) => {
    try {
      const response = await realApiService.surveys.getResponses(surveyId);
      if (response.success && response.data) {
        setResponses(response.data.responses || []);
      }
    } catch (error) {
      console.error('Failed to load saved responses:', error);
    }
  };

  // Save response
  const saveResponse = (questionId: string, answer: any) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  // Navigate questions
  const goToNextQuestion = () => {
    if (activeSurvey && currentQuestionIndex < activeSurvey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit survey
  const submitSurvey = async () => {
    if (!activeSurvey) return;

    // For template surveys, just update local state
    if (activeSurvey.id.startsWith('template-')) {
      setSurveys(prev => prev.map(s => 
        s.id === activeSurvey.id 
          ? { ...s, status: 'completed' as const, progress: { questionsAnswered: s.questions.length, totalQuestions: s.questions.length, completedAt: new Date().toISOString() } }
          : s
      ));
      success('Survey completed successfully!');
      setActiveSurvey(null);
      return;
    }

    try {
      await realApiService.surveys.submit(activeSurvey.id, {
        responses,
        completedAt: new Date().toISOString()
      });
      
      success('Survey completed successfully!');
      setActiveSurvey(null);
      loadSurveys(); // Reload to update status
    } catch (error) {
      console.error('Failed to submit survey:', error);
      errorAlert('Failed to submit survey');
    }
  };

  // Save progress
  const saveProgress = async () => {
    if (!activeSurvey) return;

    // For template surveys, just show success
    if (activeSurvey.id.startsWith('template-')) {
      success('Progress saved');
      return;
    }

    try {
      await realApiService.surveys.saveProgress(activeSurvey.id, {
        responses,
        currentQuestionIndex
      });
      success('Progress saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mental health': return InformationCircleIcon;
      case 'wellness': return StarIcon;
      case 'satisfaction': return ChatBubbleBottomCenterTextIcon;
      case 'assessment': return ClipboardDocumentCheckIcon;
      default: return DocumentTextIcon;
    }
  };

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    if (filterStatus === 'all') return true;
    return survey.status === filterStatus;
  });

  // Sort surveys
  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Calculate stats
  const stats = {
    total: surveys.length,
    completed: surveys.filter(s => s.status === 'completed').length,
    inProgress: surveys.filter(s => s.status === 'in_progress').length,
    pending: surveys.filter(s => s.status === 'pending').length,
    highPriority: surveys.filter(s => s.priority === 'high' && s.status !== 'completed').length
  };

  // Render question
  const renderQuestion = (question: Question, questionIndex: number) => {
    const response = responses.find(r => r.questionId === question.id);
    const currentAnswer = response?.answer;

    return (
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {questionIndex + 1}. {question.text}
            </h3>
            {question.helpText && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                {question.helpText}
              </p>
            )}
          </div>
          {question.required && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Required
            </span>
          )}
        </div>

        {/* Question Input */}
        <div className="mt-4">
          {/* Multiple Choice */}
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    currentAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => saveResponse(question.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Yes/No */}
          {question.type === 'yes_no' && (
            <div className="flex space-x-4">
              <button
                onClick={() => saveResponse(question.id, 'yes')}
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  currentAnswer === 'yes'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => saveResponse(question.id, 'no')}
                className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  currentAnswer === 'no'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                No
              </button>
            </div>
          )}

          {/* Rating */}
          {question.type === 'rating' && (
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => saveResponse(question.id, rating)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  {rating <= (currentAnswer || 0) ? (
                    <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Scale */}
          {question.type === 'scale' && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{question.validation?.min || 0} - Strongly Disagree</span>
                <span>{question.validation?.max || 10} - Strongly Agree</span>
              </div>
              <input
                type="range"
                min={question.validation?.min || 0}
                max={question.validation?.max || 10}
                value={currentAnswer || question.validation?.min || 0}
                onChange={(e) => saveResponse(question.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-2xl font-bold text-blue-600">
                {currentAnswer || question.validation?.min || 0}
              </div>
            </div>
          )}

          {/* Text */}
          {question.type === 'text' && (
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => saveResponse(question.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={question.validation?.minLength}
              maxLength={question.validation?.maxLength}
            />
          )}

          {/* Checkbox */}
          {question.type === 'checkbox' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={(currentAnswer || []).includes(option)}
                    onChange={(e) => {
                      const current = currentAnswer || [];
                      if (e.target.checked) {
                        saveResponse(question.id, [...current, option]);
                      } else {
                        saveResponse(question.id, current.filter((v: string) => v !== option));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render survey taking interface
  const renderSurveyInterface = () => {
    if (!activeSurvey) return null;

    const currentQuestion = activeSurvey.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === activeSurvey.questions.length - 1;
    const currentResponse = responses.find(r => r.questionId === currentQuestion.id);
    const canProceed = !currentQuestion.required || currentResponse?.answer;

    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeSurvey.title}</h2>
                  <p className="text-gray-600 mt-1">{activeSurvey.description}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
                      saveProgress();
                      setActiveSurvey(null);
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowRightIcon className="w-6 h-6 transform rotate-180" />
                </button>
              </div>

              {/* Progress Bar */}
              {activeSurvey.showProgressBar !== false && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Question {currentQuestionIndex + 1} of {activeSurvey.questions.length}</span>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Instructions (show only at start) */}
            {showInstructions && currentQuestionIndex === 0 && (
              <div className="bg-blue-50 border border-blue-200 p-6 mt-4 rounded-lg">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Survey Instructions</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li key="instruction-1">• Take your time to read each question carefully</li>
                      <li key="instruction-2">• Answer honestly based on your current feelings and experiences</li>
                      <li key="instruction-3">• You can go back to previous questions using the navigation buttons</li>
                      <li key="instruction-4">• Your progress is automatically saved</li>
                      {activeSurvey.allowSkip && <li key="instruction-5">• You can skip optional questions</li>}
                    </ul>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Got it, let's start
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Question Content */}
            {!showInstructions && (
              <div className="bg-white shadow-sm border-x border-gray-200 p-8 min-h-[400px]">
                {renderQuestion(currentQuestion, currentQuestionIndex)}
              </div>
            )}

            {/* Navigation */}
            {!showInstructions && (
              <div className="bg-gray-50 rounded-b-2xl shadow-sm border border-gray-200 border-t-0 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={saveProgress}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Save Progress
                    </button>

                    {isLastQuestion ? (
                      <button
                        onClick={submitSurvey}
                        disabled={!canProceed}
                        className={`px-8 py-2 rounded-lg font-medium transition-colors ${
                          canProceed
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Survey
                      </button>
                    ) : (
                      <button
                        onClick={goToNextQuestion}
                        disabled={!canProceed && !activeSurvey.allowSkip}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          canProceed || activeSurvey.allowSkip
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {!canProceed && activeSurvey.allowSkip ? 'Skip' : 'Next'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render survey card
  const SurveyCard: React.FC<{ survey: Survey }> = ({ survey }) => {
    const CategoryIcon = getCategoryIcon(survey.category);
    const isOverdue = survey.dueDate && new Date(survey.dueDate) < new Date() && survey.status !== 'completed';
    const progressPercentage = survey.progress
      ? (survey.progress.questionsAnswered / survey.progress.totalQuestions) * 100
      : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Card Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className={`p-3 rounded-lg ${getCategoryIcon(survey.category) === StarIcon ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                <CategoryIcon className={`w-6 h-6 ${getCategoryIcon(survey.category) === StarIcon ? 'text-yellow-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{survey.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
              </div>
            </div>
            {survey.isRequired && (
              <LockClosedIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(survey.priority)}`}>
              {survey.priority} priority
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
              {survey.status || 'pending'}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <ClockIcon className="w-3.5 h-3.5 mr-1" />
              {survey.estimatedTime} min
            </span>
            {survey.questions && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {survey.questions.length} questions
              </span>
            )}
          </div>

          {/* Due Date */}
          {survey.dueDate && (
            <div className={`flex items-center text-sm mb-4 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              <CalendarIcon className="w-4 h-4 mr-1" />
              Due {formatRelativeTime(survey.dueDate)}
              {isOverdue && <ExclamationCircleIcon className="w-4 h-4 ml-1" />}
            </div>
          )}

          {/* Progress Bar */}
          {survey.status === 'in_progress' && survey.progress && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{survey.progress.questionsAnswered} of {survey.progress.totalQuestions} answered</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {survey.tags && survey.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {survey.tags.map((tag) => (
                <span key={`${survey.id}-tag-${tag}`} className="text-xs text-blue-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {survey.assignedBy && (
              <p className="text-sm text-gray-500">
                Assigned by {survey.assignedBy.first_name} {survey.assignedBy.last_name}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              {survey.status === 'completed' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircleSolidIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                  {survey.progress?.score && (
                    <span className="ml-2 text-sm text-gray-600">
                      Score: {survey.progress.score}%
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => startSurvey(survey)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    survey.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {survey.status === 'in_progress' ? 'Continue' : 'Start'} Survey
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show survey interface if active
  if (activeSurvey) {
    return renderSurveyInterface();
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3" />
                Surveys & Assessments
              </h1>
              <p className="text-indigo-100">
                Complete surveys to help your therapist better understand your progress and needs
              </p>
            </div>
            <div className="hidden md:block">
              <SparklesIcon className="w-24 h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by status:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        {sortedSurveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
              <p className="text-gray-500">
                {filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back later for new surveys from your therapist'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedSurveys.map(survey => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ClientSurveysImproved;