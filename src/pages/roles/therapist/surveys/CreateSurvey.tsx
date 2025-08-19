import React, { useState } from 'react';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ListBulletIcon,
  ChartBarIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

// Question type definitions
const questionTypes = [
  { value: 'text', label: 'Text Answer', icon: DocumentTextIcon },
  { value: 'multipleChoice', label: 'Multiple Choice', icon: ListBulletIcon },
  { value: 'scale', label: 'Scale Rating', icon: ChartBarIcon },
  { value: 'yesNo', label: 'Yes/No', icon: CheckIcon }
];

// Question component
interface QuestionProps {
  question: any;
  index: number;
  onUpdate: (index: number, question: any) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const QuestionEditor: React.FC<QuestionProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) => {
  const handleUpdate = (field: string, value: any) => {
    onUpdate(index, { ...question, [field]: value });
  };

  const handleOptionUpdate = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    handleUpdate('options', newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [...(question.options || []), ''];
    handleUpdate('options', newOptions);
  };

  const handleDeleteOption = (optionIndex: number) => {
    const newOptions = question.options.filter((_: any, i: number) => i !== optionIndex);
    handleUpdate('options', newOptions);
  };

  const QuestionTypeIcon = questionTypes.find(t => t.value === question.type)?.icon || DocumentTextIcon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
            {index + 1}
          </div>
          <QuestionTypeIcon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMoveUp(index)}
            disabled={!canMoveUp}
            className={`p-1 rounded ${
              canMoveUp 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Move up"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={!canMoveDown}
            className={`p-1 rounded ${
              canMoveDown 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Move down"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
            title="Delete question"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <select
          value={question.type}
          onChange={(e) => handleUpdate('type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
        >
          {questionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          value={question.text}
          onChange={(e) => handleUpdate('text', e.target.value)}
          placeholder="Enter your question here..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 resize-none"
        />
      </div>

      {/* Type-specific options */}
      {question.type === 'multipleChoice' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options
          </label>
          <div className="space-y-2">
            {(question.options || []).map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionUpdate(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
                <button
                  onClick={() => handleDeleteOption(optionIndex)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>
        </div>
      )}

      {question.type === 'scale' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Value
            </label>
            <input
              type="number"
              value={question.scale?.min || 1}
              onChange={(e) => handleUpdate('scale', { 
                ...question.scale, 
                min: parseInt(e.target.value) 
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Value
            </label>
            <input
              type="number"
              value={question.scale?.max || 10}
              onChange={(e) => handleUpdate('scale', { 
                ...question.scale, 
                max: parseInt(e.target.value) 
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Label (Optional)
            </label>
            <input
              type="text"
              value={question.scaleLabels?.min || ''}
              onChange={(e) => handleUpdate('scaleLabels', { 
                ...question.scaleLabels, 
                min: e.target.value 
              })}
              placeholder="e.g., Very Poor"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Label (Optional)
            </label>
            <input
              type="text"
              value={question.scaleLabels?.max || ''}
              onChange={(e) => handleUpdate('scaleLabels', { 
                ...question.scaleLabels, 
                max: e.target.value 
              })}
              placeholder="e.g., Excellent"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`required-${index}`}
          checked={question.required || false}
          onChange={(e) => handleUpdate('required', e.target.checked)}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
    </div>
  );
};

const CreateSurvey: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    type: 'assessment',
    isTemplate: false,
    questions: [] as any[]
  });

  const surveyTypes = [
    { value: 'assessment', label: 'Assessment' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'screening', label: 'Screening' },
    { value: 'questionnaire', label: 'Questionnaire' }
  ];

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: '',
      type: 'text',
      required: true,
      options: ['', ''],
      scale: { min: 1, max: 10 }
    };
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, newQuestion]
    });
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: any) => {
    const newQuestions = [...surveyData.questions];
    newQuestions[index] = updatedQuestion;
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = surveyData.questions.filter((_, i) => i !== index);
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...surveyData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  const handleSubmit = async (saveAsTemplate: boolean = false) => {
    if (!surveyData.title.trim()) {
      alert('Please enter a survey title');
      return;
    }

    if (surveyData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate all questions have text
    const invalidQuestions = surveyData.questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      alert('Please fill in all question texts');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        ...surveyData,
        isTemplate: saveAsTemplate,
        status: saveAsTemplate ? 'template' : 'active'
      };

      const response = await realApiService.therapist.createSurvey(dataToSubmit);
      
      if (response.success) {
        navigate('/therapist/surveys');
      } else {
        throw new Error('Failed to create survey');
      }
    } catch (error: any) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load templates for quick start
  const loadTemplate = (templateType: string) => {
    const templates: { [key: string]: any } = {
      mentalHealth: {
        title: 'Weekly Mental Health Check-in',
        description: 'A comprehensive assessment of mental health and well-being',
        type: 'assessment',
        questions: [
          {
            id: 'q1',
            text: 'How would you rate your overall mood this week?',
            type: 'scale',
            required: true,
            scale: { min: 1, max: 10 },
            scaleLabels: { min: 'Very Poor', max: 'Excellent' }
          },
          {
            id: 'q2',
            text: 'Have you experienced any of the following this week?',
            type: 'multipleChoice',
            required: true,
            options: ['Anxiety', 'Depression', 'Stress', 'Insomnia', 'None of the above']
          },
          {
            id: 'q3',
            text: 'Please describe any challenges you faced this week:',
            type: 'text',
            required: false
          }
        ]
      },
      anxiety: {
        title: 'Anxiety Assessment',
        description: 'Evaluate anxiety levels and triggers',
        type: 'screening',
        questions: [
          {
            id: 'q1',
            text: 'How often have you felt nervous or anxious in the past 2 weeks?',
            type: 'multipleChoice',
            required: true,
            options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
          },
          {
            id: 'q2',
            text: 'How difficult have these feelings made it to do work, take care of things at home, or get along with other people?',
            type: 'multipleChoice',
            required: true,
            options: ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult']
          }
        ]
      },
      sessionFeedback: {
        title: 'Session Feedback',
        description: 'Gather feedback about therapy sessions',
        type: 'feedback',
        questions: [
          {
            id: 'q1',
            text: 'How would you rate today\'s session?',
            type: 'scale',
            required: true,
            scale: { min: 1, max: 5 },
            scaleLabels: { min: 'Poor', max: 'Excellent' }
          },
          {
            id: 'q2',
            text: 'Did you feel heard and understood?',
            type: 'yesNo',
            required: true
          },
          {
            id: 'q3',
            text: 'What was most helpful about today\'s session?',
            type: 'text',
            required: false
          }
        ]
      }
    };

    if (templates[templateType]) {
      setSurveyData({
        ...surveyData,
        ...templates[templateType]
      });
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Create New Survey</h1>
              <p className="text-gray-600 mt-1">Design a survey to gather insights from your clients</p>
            </div>
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => loadTemplate('mentalHealth')}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
            >
              <h4 className="font-medium text-blue-900">Mental Health Check-in</h4>
              <p className="text-sm text-blue-700 mt-1">Weekly assessment template</p>
            </button>
            <button
              onClick={() => loadTemplate('anxiety')}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
            >
              <h4 className="font-medium text-blue-900">Anxiety Screening</h4>
              <p className="text-sm text-blue-700 mt-1">Standard anxiety assessment</p>
            </button>
            <button
              onClick={() => loadTemplate('sessionFeedback')}
              className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
            >
              <h4 className="font-medium text-blue-900">Session Feedback</h4>
              <p className="text-sm text-blue-700 mt-1">Post-session feedback form</p>
            </button>
          </div>
        </div>

        {/* Survey Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Survey Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title
              </label>
              <input
                type="text"
                value={surveyData.title}
                onChange={(e) => setSurveyData({ ...surveyData, title: e.target.value })}
                placeholder="e.g., Weekly Mental Health Check-in"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Type
              </label>
              <select
                value={surveyData.type}
                onChange={(e) => setSurveyData({ ...surveyData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                {surveyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={surveyData.description}
              onChange={(e) => setSurveyData({ ...surveyData, description: e.target.value })}
              placeholder="Briefly describe the purpose of this survey..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 resize-none"
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            <button
              onClick={handleAddQuestion}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Question
            </button>
          </div>
          
          {surveyData.questions.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No questions added yet</p>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {surveyData.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onMoveUp={() => handleMoveQuestion(index, 'up')}
                  onMoveDown={() => handleMoveQuestion(index, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < surveyData.questions.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/therapist/surveys')}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                  Save as Template
                </>
              )}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Create Survey
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateSurvey;