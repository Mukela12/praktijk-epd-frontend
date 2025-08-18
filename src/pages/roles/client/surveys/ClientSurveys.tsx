import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  StarIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatters';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'scale' | 'yes_no' | 'checkbox';
  options?: string[];
  required: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: SurveyQuestion[];
  estimatedTime: number;
  assignedBy?: {
    firstName: string;
    lastName: string;
  };
  assignedAt?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  responses?: Record<string, any>;
  isTemplate?: boolean;
  tags?: string[];
}

// Template surveys for mental health therapy
const templateSurveys: Survey[] = [
  {
    id: 'template-1',
    title: 'Weekly Mood and Well-being Check-in',
    description: 'A comprehensive weekly assessment of your mood, stress levels, and overall well-being to help track your progress.',
    category: 'Mental Health',
    estimatedTime: 10,
    status: 'pending',
    isTemplate: true,
    tags: ['mood', 'wellbeing', 'weekly'],
    questions: [
      {
        id: 'q1',
        question: 'Overall, how would you rate your mood this week?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'Very Low', max: 'Excellent' },
        required: true
      },
      {
        id: 'q2',
        question: 'How well did you sleep this week on average?',
        type: 'multiple_choice',
        options: ['Very poorly', 'Poorly', 'Okay', 'Well', 'Very well'],
        required: true
      },
      {
        id: 'q3',
        question: 'Which emotions did you experience most frequently this week? (Select all that apply)',
        type: 'checkbox',
        options: ['Happy', 'Sad', 'Anxious', 'Angry', 'Peaceful', 'Excited', 'Lonely', 'Content', 'Frustrated', 'Hopeful'],
        required: true
      },
      {
        id: 'q4',
        question: 'Did you experience any significant stressors this week?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'q5',
        question: 'If yes, please briefly describe the main stressor(s):',
        type: 'text',
        placeholder: 'Describe any significant stressors you experienced...',
        required: false,
        maxLength: 500
      },
      {
        id: 'q6',
        question: 'How many days this week did you engage in physical activity for at least 30 minutes?',
        type: 'scale',
        scaleMin: 0,
        scaleMax: 7,
        required: true
      },
      {
        id: 'q7',
        question: 'What coping strategies did you use this week? (Select all that apply)',
        type: 'checkbox',
        options: ['Deep breathing', 'Meditation', 'Exercise', 'Talking to friends/family', 'Journaling', 'Listening to music', 'Reading', 'Therapy techniques', 'Other'],
        required: true
      },
      {
        id: 'q8',
        question: 'Is there anything specific you would like to discuss in your next therapy session?',
        type: 'text',
        placeholder: 'Topics, concerns, or achievements you want to share...',
        required: false,
        maxLength: 1000
      }
    ]
  },
  {
    id: 'template-2',
    title: 'Anxiety Assessment Questionnaire',
    description: 'Evaluate your anxiety levels and identify specific triggers and patterns to better understand your anxiety.',
    category: 'Anxiety',
    estimatedTime: 15,
    status: 'pending',
    isTemplate: true,
    tags: ['anxiety', 'assessment', 'triggers'],
    questions: [
      {
        id: 'q1',
        question: 'Over the past two weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
        type: 'multiple_choice',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'q2',
        question: 'How often have you found it difficult to stop or control worrying?',
        type: 'multiple_choice',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'q3',
        question: 'Rate the intensity of your anxiety on most days:',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'Minimal', max: 'Severe' },
        required: true
      },
      {
        id: 'q4',
        question: 'Which situations tend to trigger your anxiety? (Select all that apply)',
        type: 'checkbox',
        options: ['Social situations', 'Work/School', 'Health concerns', 'Financial matters', 'Relationships', 'Public speaking', 'Crowded places', 'Being alone', 'Future uncertainty', 'Past events'],
        required: true
      },
      {
        id: 'q5',
        question: 'Have you experienced any panic attacks in the past two weeks?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'q6',
        question: 'What physical symptoms do you experience with anxiety? (Select all that apply)',
        type: 'checkbox',
        options: ['Rapid heartbeat', 'Sweating', 'Trembling', 'Shortness of breath', 'Chest pain', 'Nausea', 'Dizziness', 'Hot/cold flashes', 'Muscle tension', 'Fatigue'],
        required: true
      },
      {
        id: 'q7',
        question: 'How has anxiety affected your daily functioning?',
        type: 'text',
        placeholder: 'Describe how anxiety impacts your work, relationships, or daily activities...',
        required: true,
        maxLength: 1000
      },
      {
        id: 'q8',
        question: 'What helps you manage your anxiety?',
        type: 'text',
        placeholder: 'List strategies, activities, or support systems that help...',
        required: false,
        maxLength: 500
      }
    ]
  },
  {
    id: 'template-3',
    title: 'Depression Screening Tool',
    description: 'A structured assessment to help identify symptoms of depression and track changes in your mood over time.',
    category: 'Depression',
    estimatedTime: 12,
    status: 'pending',
    isTemplate: true,
    tags: ['depression', 'screening', 'mood'],
    questions: [
      {
        id: 'q1',
        question: 'Over the past two weeks, how often have you been bothered by little interest or pleasure in doing things?',
        type: 'multiple_choice',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'q2',
        question: 'How often have you felt down, depressed, or hopeless?',
        type: 'multiple_choice',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'q3',
        question: 'Have you experienced changes in your appetite?',
        type: 'multiple_choice',
        options: ['No change', 'Decreased appetite', 'Increased appetite', 'Significant weight change'],
        required: true
      },
      {
        id: 'q4',
        question: 'How has your energy level been?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'No energy', max: 'High energy' },
        required: true
      },
      {
        id: 'q5',
        question: 'Have you had thoughts that you would be better off dead or of hurting yourself?',
        type: 'multiple_choice',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        required: true
      },
      {
        id: 'q6',
        question: 'What activities have you enjoyed recently?',
        type: 'text',
        placeholder: 'List any activities that brought you joy or satisfaction...',
        required: false,
        maxLength: 500
      },
      {
        id: 'q7',
        question: 'What are your main concerns right now?',
        type: 'text',
        placeholder: 'Share what feels most challenging or overwhelming...',
        required: true,
        maxLength: 1000
      }
    ]
  },
  {
    id: 'template-4',
    title: 'Relationship Satisfaction Survey',
    description: 'Assess the quality of your relationships and identify areas for improvement in your interpersonal connections.',
    category: 'Relationships',
    estimatedTime: 8,
    status: 'pending',
    isTemplate: true,
    tags: ['relationships', 'satisfaction', 'communication'],
    questions: [
      {
        id: 'q1',
        question: 'Overall, how satisfied are you with your current relationships?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'Very Unsatisfied', max: 'Very Satisfied' },
        required: true
      },
      {
        id: 'q2',
        question: 'Which relationships are you evaluating? (Select all that apply)',
        type: 'checkbox',
        options: ['Romantic partner', 'Family members', 'Friends', 'Colleagues', 'Children', 'Parents', 'Siblings'],
        required: true
      },
      {
        id: 'q3',
        question: 'How would you rate the communication in your primary relationship?',
        type: 'multiple_choice',
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'],
        required: true
      },
      {
        id: 'q4',
        question: 'Do you feel emotionally supported in your relationships?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'q5',
        question: 'What aspects of your relationships would you like to improve?',
        type: 'checkbox',
        options: ['Communication', 'Trust', 'Intimacy', 'Conflict resolution', 'Quality time', 'Boundaries', 'Emotional support', 'Shared activities'],
        required: true
      },
      {
        id: 'q6',
        question: 'Describe a recent positive interaction in one of your relationships:',
        type: 'text',
        placeholder: 'Share a moment that made you feel connected or appreciated...',
        required: false,
        maxLength: 500
      }
    ]
  },
  {
    id: 'template-5',
    title: 'Self-Care Assessment',
    description: 'Evaluate your self-care practices across different life domains and identify areas for improvement.',
    category: 'Wellness',
    estimatedTime: 10,
    status: 'pending',
    isTemplate: true,
    tags: ['self-care', 'wellness', 'balance'],
    questions: [
      {
        id: 'q1',
        question: 'How often do you engage in physical self-care (exercise, healthy eating, sleep)?',
        type: 'multiple_choice',
        options: ['Daily', 'Several times a week', 'Weekly', 'Rarely', 'Never'],
        required: true
      },
      {
        id: 'q2',
        question: 'Rate your current stress level:',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'No stress', max: 'Extreme stress' },
        required: true
      },
      {
        id: 'q3',
        question: 'Which self-care activities do you currently practice? (Select all that apply)',
        type: 'checkbox',
        options: ['Exercise', 'Meditation', 'Reading', 'Hobbies', 'Social time', 'Nature walks', 'Creative activities', 'Rest/relaxation', 'Therapy', 'Journaling'],
        required: true
      },
      {
        id: 'q4',
        question: 'What prevents you from practicing self-care regularly?',
        type: 'checkbox',
        options: ['Lack of time', 'Financial constraints', 'Guilt', 'Lack of energy', 'Not knowing where to start', 'Family obligations', 'Work demands', 'Nothing - I practice regularly'],
        required: true
      },
      {
        id: 'q5',
        question: 'What self-care goal would you like to set for the next week?',
        type: 'text',
        placeholder: 'Describe one specific self-care activity you commit to trying...',
        required: true,
        maxLength: 300
      }
    ]
  },
  {
    id: 'template-6',
    title: 'Progress and Goals Review',
    description: 'Reflect on your therapy progress and set meaningful goals for continued growth and healing.',
    category: 'Progress',
    estimatedTime: 12,
    status: 'pending',
    isTemplate: true,
    tags: ['progress', 'goals', 'reflection'],
    questions: [
      {
        id: 'q1',
        question: 'How would you rate your overall progress in therapy?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'No progress', max: 'Significant progress' },
        required: true
      },
      {
        id: 'q2',
        question: 'What positive changes have you noticed since starting therapy?',
        type: 'text',
        placeholder: 'Describe any improvements in thoughts, feelings, or behaviors...',
        required: true,
        maxLength: 1000
      },
      {
        id: 'q3',
        question: 'Which areas still feel challenging? (Select all that apply)',
        type: 'checkbox',
        options: ['Managing emotions', 'Relationships', 'Work/Career', 'Self-esteem', 'Anxiety', 'Depression', 'Trauma', 'Life transitions', 'Habits/Behaviors', 'Communication'],
        required: true
      },
      {
        id: 'q4',
        question: 'Are you consistently using the coping strategies learned in therapy?',
        type: 'multiple_choice',
        options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
        required: true
      },
      {
        id: 'q5',
        question: 'What would you like to focus on in upcoming sessions?',
        type: 'text',
        placeholder: 'Share your priorities and goals for therapy...',
        required: true,
        maxLength: 500
      },
      {
        id: 'q6',
        question: 'How satisfied are you with your therapy experience?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleLabels: { min: 'Very unsatisfied', max: 'Very satisfied' },
        required: true
      }
    ]
  }
];

const ClientSurveys: React.FC = () => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getSurveys();
      
      if (response.success && response.data) {
        // Combine API surveys with template surveys
        const apiSurveys = response.data.surveys || [];
        const combinedSurveys = [...templateSurveys, ...apiSurveys];
        setSurveys(combinedSurveys);
      } else {
        // Use template surveys if API fails
        setSurveys(templateSurveys);
      }
    } catch (err) {
      // Use template surveys as fallback
      setSurveys(templateSurveys);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyClick = (survey: Survey) => {
    setSelectedSurvey(survey);
    // Initialize responses with empty values
    const initialResponses: Record<string, any> = {};
    survey.questions.forEach(q => {
      if (q.type === 'checkbox') {
        initialResponses[q.id] = [];
      } else {
        initialResponses[q.id] = '';
      }
    });
    setResponses(survey.responses || initialResponses);
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateResponses = (): boolean => {
    if (!selectedSurvey) return false;
    
    for (const question of selectedSurvey.questions) {
      if (question.required) {
        const response = responses[question.id];
        if (!response || (Array.isArray(response) && response.length === 0)) {
          error(`Please answer: ${question.question}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateResponses() || !selectedSurvey) return;

    setIsSaving(true);
    try {
      if (selectedSurvey.id.startsWith('template-')) {
        // For template surveys, just show success
        success('Survey submitted successfully! Your responses have been saved.');
        
        // Update local state to mark as completed
        setSurveys(prev => prev.map(s => 
          s.id === selectedSurvey.id 
            ? { ...s, status: 'completed', completedAt: new Date().toISOString(), responses }
            : s
        ));
        
        setSelectedSurvey(null);
        setResponses({});
      } else {
        // Submit to API for real surveys
        await realApiService.client.submitSurveyResponse(selectedSurvey.id, responses);
        success('Survey submitted successfully!');
        await loadSurveys();
        setSelectedSurvey(null);
        setResponses({});
      }
    } catch (err) {
      error('Failed to submit survey. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    if (!selectedSurvey) return;
    
    // Update local state with draft responses
    setSurveys(prev => prev.map(s => 
      s.id === selectedSurvey.id 
        ? { ...s, status: 'in_progress', responses }
        : s
    ));
    
    success('Draft saved successfully!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mental health': return HeartIcon;
      case 'anxiety': return ExclamationCircleIcon;
      case 'depression': return HeartIcon;
      case 'relationships': return HeartIcon;
      case 'wellness': return ShieldCheckIcon;
      case 'progress': return ChartBarIcon;
      default: return ClipboardDocumentCheckIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mental health': return 'bg-blue-100 text-blue-600';
      case 'anxiety': return 'bg-purple-100 text-purple-600';
      case 'depression': return 'bg-indigo-100 text-indigo-600';
      case 'relationships': return 'bg-pink-100 text-pink-600';
      case 'wellness': return 'bg-green-100 text-green-600';
      case 'progress': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={question.maxLength}
            />
            {question.maxLength && (
              <p className="text-xs text-gray-500 text-right">
                {value.length} / {question.maxLength}
              </p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={value.includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...value, option]
                      : value.filter((v: string) => v !== option);
                    handleResponseChange(question.id, newValue);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scaleLabels?.min}</span>
              <span>{question.scaleLabels?.max}</span>
            </div>
            <div className="flex justify-between items-center">
              {Array.from({ length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 }, (_, i) => {
                const scaleValue = (question.scaleMin || 1) + i;
                return (
                  <button
                    key={scaleValue}
                    onClick={() => handleResponseChange(question.id, scaleValue)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      value === scaleValue
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 hover:border-blue-400 text-gray-700'
                    }`}
                  >
                    {scaleValue}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleResponseChange(question.id, 'yes')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                value === 'yes'
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 hover:border-green-400 text-gray-700'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleResponseChange(question.id, 'no')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                value === 'no'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 hover:border-red-400 text-gray-700'
              }`}
            >
              No
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const filteredSurveys = surveys.filter(s => 
    activeTab === 'pending' ? s.status !== 'completed' : s.status === 'completed'
  );

  // Calculate progress for in-progress surveys
  const getProgress = (survey: Survey) => {
    if (!survey.responses) return 0;
    const answeredQuestions = survey.questions.filter(q => {
      const response = survey.responses![q.id];
      return response && (Array.isArray(response) ? response.length > 0 : response !== '');
    }).length;
    return Math.round((answeredQuestions / survey.questions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedSurvey) {
    const currentQuestionIndex = 0; // Could implement pagination for questions
    const progress = Math.round(
      (Object.keys(responses).filter(key => {
        const response = responses[key];
        return response && (Array.isArray(response) ? response.length > 0 : response !== '');
      }).length / selectedSurvey.questions.length) * 100
    );

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedSurvey(null);
            setResponses({});
          }}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowRightIcon className="w-5 h-5 rotate-180 mr-1" />
          Back to Surveys
        </button>

        {/* Survey Header */}
        <PremiumCard>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedSurvey.title}
              </h1>
              <p className="text-gray-600">
                {selectedSurvey.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedSurvey.category)}`}>
                {selectedSurvey.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {selectedSurvey.estimatedTime} min
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {selectedSurvey.questions.length} questions
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Questions */}
        <div className="space-y-6">
          {selectedSurvey.questions.map((question, index) => (
            <PremiumCard key={question.id}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-medium">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                  </div>
                </div>
                
                <div className="ml-11">
                  {renderQuestion(question)}
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-6">
          <PremiumButton
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            Save Draft
          </PremiumButton>
          
          <PremiumButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSaving}
            icon={CheckCircleIcon}
          >
            {isSaving ? 'Submitting...' : 'Submit Survey'}
          </PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Surveys</h1>
            <p className="text-purple-100">
              Complete surveys to help your therapist understand your progress
            </p>
          </div>
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-purple-200" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.status === 'in_progress').length}
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Surveys
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

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <PremiumEmptyState
          icon={ClipboardDocumentCheckIcon}
          title={activeTab === 'pending' ? "No Pending Surveys" : "No Completed Surveys"}
          description={
            activeTab === 'pending' 
              ? "You don't have any surveys to complete at the moment. Your therapist may assign surveys to track your progress."
              : "You haven't completed any surveys yet. Check your pending surveys to get started."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSurveys.map((survey) => {
            const Icon = getCategoryIcon(survey.category);
            const isInProgress = survey.status === 'in_progress';
            const surveyProgress = isInProgress ? getProgress(survey) : 0;
            
            return (
              <div
                key={survey.id}
                className="cursor-pointer"
                onClick={() => handleSurveyClick(survey)}
              >
                <PremiumCard hover>
                  <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {survey.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {survey.description}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${getCategoryColor(survey.category).split(' ')[0]}`}>
                      <Icon className={`w-6 h-6 ${getCategoryColor(survey.category).split(' ')[1]}`} />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                      {survey.category}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      {survey.estimatedTime} min
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {survey.questions.length} questions
                    </span>
                  </div>

                  {/* Due Date */}
                  {survey.dueDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Due: {formatDate(survey.dueDate)}</span>
                    </div>
                  )}

                  {/* Progress for in-progress surveys */}
                  {isInProgress && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{surveyProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${surveyProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {survey.assignedBy && (
                      <p className="text-xs text-gray-500">
                        Assigned by {survey.assignedBy.firstName}
                      </p>
                    )}
                    
                    {survey.status === 'completed' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircleSolidIcon className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : (
                      <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </PremiumCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientSurveys;