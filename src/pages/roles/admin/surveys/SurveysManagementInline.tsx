import React, { useState, useEffect, useMemo } from 'react';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  TagsField,
  CheckboxField
} from '@/components/forms/FormFields';
import { formatDate } from '@/utils/dateFormatters';

// Types
interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'scale' | 'multiple_choice' | 'checkbox';
  required: boolean;
  options?: string[];
  scale?: { min: number; max: number; labels?: string[] };
}

interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'assessment' | 'feedback' | 'progress' | 'satisfaction' | 'custom';
  questions: SurveyQuestion[];
  status: 'draft' | 'published' | 'closed' | 'archived';
  createdBy?: string;
  created_at?: string;
  updated_at?: string;
  responseCount?: number;
  response_count?: number;
  targetAudience?: 'all' | 'clients' | 'therapists' | 'specific';
  validFrom?: string;
  validUntil?: string;
  isAnonymous?: boolean;
}

// Survey Templates
const surveyTemplates = [
  {
    title: 'Weekly Progress Check-In',
    description: 'A brief survey to track client progress and adjust treatment plans',
    type: 'progress' as const,
    questions: [
      {
        id: 'q1',
        text: 'How would you rate your overall mood this week?',
        type: 'scale' as const,
        required: true,
        scale: { min: 1, max: 10, labels: ['Very Low', 'Low', 'Moderate', 'Good', 'Excellent'] }
      },
      {
        id: 'q2',
        text: 'Which coping strategies did you use this week? (Select all that apply)',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Deep breathing', 'Exercise', 'Meditation', 'Journaling', 'Talking to friends/family', 'Other']
      },
      {
        id: 'q3',
        text: 'What challenges did you face this week?',
        type: 'text' as const,
        required: false
      },
      {
        id: 'q4',
        text: 'Do you feel you made progress toward your therapy goals this week?',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Yes, significant progress', 'Yes, some progress', 'No change', 'Some setbacks', 'Major setbacks']
      },
      {
        id: 'q5',
        text: 'What would you like to focus on in our next session?',
        type: 'text' as const,
        required: false
      }
    ],
    status: 'published' as const,
    isAnonymous: false,
    targetAudience: 'clients' as const
  },
  {
    title: 'Initial Mental Health Assessment',
    description: 'Comprehensive assessment for new clients to understand their mental health needs',
    type: 'assessment' as const,
    questions: [
      {
        id: 'q1',
        text: 'What brings you to therapy at this time?',
        type: 'text' as const,
        required: true
      },
      {
        id: 'q2',
        text: 'How long have you been experiencing these concerns?',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year']
      },
      {
        id: 'q3',
        text: 'Rate the severity of your symptoms on average:',
        type: 'scale' as const,
        required: true,
        scale: { min: 1, max: 10, labels: ['Mild', 'Moderate', 'Severe'] }
      },
      {
        id: 'q4',
        text: 'Are you currently taking any medications for mental health?',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Yes', 'No', 'Prefer not to say']
      },
      {
        id: 'q5',
        text: 'Have you had therapy before?',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Yes, currently', 'Yes, in the past', 'No, this is my first time']
      },
      {
        id: 'q6',
        text: 'What are your goals for therapy?',
        type: 'text' as const,
        required: true
      },
      {
        id: 'q7',
        text: 'Do you have any concerns about starting therapy?',
        type: 'text' as const,
        required: false
      }
    ],
    status: 'published' as const,
    isAnonymous: false,
    targetAudience: 'clients' as const
  },
  {
    title: 'Client Satisfaction Survey',
    description: 'Gather feedback to improve our therapy services',
    type: 'satisfaction' as const,
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with your therapy experience?',
        type: 'scale' as const,
        required: true,
        scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
      },
      {
        id: 'q2',
        text: 'How well does your therapist understand your needs?',
        type: 'scale' as const,
        required: true,
        scale: { min: 1, max: 5, labels: ['Not at all', 'Poorly', 'Adequately', 'Well', 'Very Well'] }
      },
      {
        id: 'q3',
        text: 'Would you recommend our services to others?',
        type: 'multiple_choice' as const,
        required: true,
        options: ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not']
      },
      {
        id: 'q4',
        text: 'What aspects of our service could be improved?',
        type: 'text' as const,
        required: false
      },
      {
        id: 'q5',
        text: 'What do you appreciate most about your therapy experience?',
        type: 'text' as const,
        required: false
      }
    ],
    status: 'published' as const,
    isAnonymous: true,
    targetAudience: 'clients' as const
  }
];

const SurveysManagementInline: React.FC = () => {
  const { success, error } = useAlert();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<Survey>>({
    title: '',
    description: '',
    type: 'assessment',
    questions: [],
    status: 'draft',
    isAnonymous: false,
    targetAudience: 'all'
  });

  // Question form state
  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
    text: '',
    type: 'text',
    required: true,
    options: []
  });

  // Load surveys
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.surveys.getSurveys();
      
      if (response.success && response.data) {
        const surveysData = response.data.surveys || response.data || [];
        setSurveys(Array.isArray(surveysData) ? surveysData : []);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
      error('Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          survey.title.toLowerCase().includes(searchLower) ||
          survey.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && survey.type !== filterType) return false;
      
      // Status filter
      if (filterStatus !== 'all' && survey.status !== filterStatus) return false;

      return true;
    });
  }, [surveys, searchTerm, filterType, filterStatus]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (viewMode === 'create') {
        const response = await realApiService.surveys.createSurvey({
          title: formData.title || '',
          description: formData.description || '',
          type: formData.type || 'assessment',
          questions: formData.questions || []
        });
        if (response.success) {
          success('Survey created successfully');
          await loadSurveys();
          handleCancel();
        }
      } else if (viewMode === 'edit' && selectedSurvey) {
        const response = await realApiService.surveys.updateSurvey(selectedSurvey.id, formData);
        if (response.success) {
          success('Survey updated successfully');
          await loadSurveys();
          handleCancel();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save survey');
    }
  };

  // Handle delete
  const handleDelete = async (surveyId: string) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    
    try {
      await realApiService.surveys.deleteSurvey(surveyId);
      success('Survey deleted successfully');
      await loadSurveys();
    } catch (err) {
      error('Failed to delete survey');
    }
  };

  // Handle use template
  const handleUseTemplate = (template: typeof surveyTemplates[0]) => {
    setFormData({
      ...template,
      status: 'draft' // Always start as draft
    });
    setViewMode('create');
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedSurvey(null);
    setFormData({
      title: '',
      description: '',
      type: 'assessment',
      questions: [],
      status: 'draft',
      isAnonymous: false,
      targetAudience: 'all'
    });
    setNewQuestion({
      text: '',
      type: 'text',
      required: true,
      options: []
    });
  };

  // Handle create
  const handleCreate = () => {
    setViewMode('create');
  };

  // Handle edit
  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setFormData(survey);
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('detail');
  };

  // Add question to survey
  const handleAddQuestion = () => {
    if (!newQuestion.text) {
      error('Please enter question text');
      return;
    }

    const question: SurveyQuestion = {
      id: `q${Date.now()}`,
      text: newQuestion.text,
      type: newQuestion.type || 'text',
      required: newQuestion.required ?? true,
      options: newQuestion.options || []
    };

    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    // Reset new question form
    setNewQuestion({
      text: '',
      type: 'text',
      required: true,
      options: []
    });
  };

  // Remove question
  const handleRemoveQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: (prev.questions || []).filter(q => q.id !== questionId)
    }));
  };

  // Get icon for survey type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assessment': return ClipboardDocumentCheckIcon;
      case 'feedback': return StarIcon;
      case 'progress': return ChartBarIcon;
      case 'satisfaction': return FireIcon;
      case 'custom': return PlusIcon;
      default: return ClipboardDocumentCheckIcon;
    }
  };

  // Get color for survey type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'feedback': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'satisfaction': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Column definitions
  const columns = [
    {
      key: 'title',
      label: 'Survey',
      render: (survey: Survey) => {
        const Icon = getTypeIcon(survey.type);
        return (
          <div className="flex items-start space-x-3">
            <Icon className="w-5 h-5 mt-0.5 text-teal-600" />
            <div>
              <p className="font-medium text-gray-900">{survey.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {survey.description}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (survey: Survey) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(survey.type)}`}>
          {survey.type}
        </span>
      )
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (survey: Survey) => (
        <div className="flex items-center text-sm text-gray-600">
          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
          {survey.questions?.length || 0} questions
        </div>
      )
    },
    {
      key: 'responses',
      label: 'Responses',
      render: (survey: Survey) => (
        <div className="flex items-center text-sm text-gray-600">
          <UserGroupIcon className="w-4 h-4 mr-1" />
          {survey.responseCount || survey.response_count || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (survey: Survey) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          survey.status === 'published' ? 'bg-green-100 text-green-800' :
          survey.status === 'draft' ? 'bg-gray-100 text-gray-800' :
          survey.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {survey.status}
        </span>
      )
    }
  ];

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Title"
          name="title"
          value={formData.title || ''}
          onChange={(value) => setFormData({ ...formData, title: value })}
          required
          placeholder="Enter survey title"
        />

        <SelectField
          label="Type"
          name="type"
          value={formData.type || 'assessment'}
          onChange={(value) => setFormData({ ...formData, type: value as any })}
          options={[
            { value: 'assessment', label: 'Assessment' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'progress', label: 'Progress' },
            { value: 'satisfaction', label: 'Satisfaction' },
            { value: 'custom', label: 'Custom' }
          ]}
          required
        />

        <SelectField
          label="Target Audience"
          name="targetAudience"
          value={formData.targetAudience || 'all'}
          onChange={(value) => setFormData({ ...formData, targetAudience: value as any })}
          options={[
            { value: 'all', label: 'All Users' },
            { value: 'clients', label: 'Clients Only' },
            { value: 'therapists', label: 'Therapists Only' },
            { value: 'specific', label: 'Specific Users' }
          ]}
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status || 'draft'}
          onChange={(value) => setFormData({ ...formData, status: value as any })}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'closed', label: 'Closed' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Describe the survey and its purpose"
        rows={4}
      />

      <div className="flex items-center">
        <CheckboxField
          label="Anonymous responses"
          name="isAnonymous"
          checked={formData.isAnonymous || false}
          onChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
        />
      </div>

      {/* Questions Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Questions</h3>
        
        {/* Existing Questions */}
        <div className="space-y-4 mb-6">
          {formData.questions?.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{index + 1}. {question.text}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {question.type} {question.required && '(Required)'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Question */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Question</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextField
                label="Question Text"
                name="questionText"
                value={newQuestion.text || ''}
                onChange={(value) => setNewQuestion({ ...newQuestion, text: value })}
                placeholder="Enter question text"
              />
            </div>
            <SelectField
              label="Question Type"
              name="questionType"
              value={newQuestion.type || 'text'}
              onChange={(value) => setNewQuestion({ ...newQuestion, type: value as any })}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'scale', label: 'Scale (1-5)' },
                { value: 'multiple_choice', label: 'Multiple Choice' },
                { value: 'checkbox', label: 'Checkbox' }
              ]}
            />
            <div className="flex items-center">
              <CheckboxField
                label="Required"
                name="questionRequired"
                checked={newQuestion.required ?? true}
                onChange={(checked) => setNewQuestion({ ...newQuestion, required: checked })}
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedSurvey) return null;

    const Icon = getTypeIcon(selectedSurvey.type);

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Icon className="w-8 h-8 text-teal-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedSurvey.title}</h2>
            <p className="text-gray-500 mt-1">{selectedSurvey.type} • {selectedSurvey.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{selectedSurvey.type}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Questions</p>
            <p className="text-2xl font-bold text-gray-900">{selectedSurvey.questions?.length || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Responses</p>
            <p className="text-2xl font-bold text-gray-900">{selectedSurvey.responseCount || selectedSurvey.response_count || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{selectedSurvey.status}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedSurvey.description}</p>
        </div>

        {selectedSurvey.questions && selectedSurvey.questions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Questions</h3>
            <div className="space-y-3">
              {selectedSurvey.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {index + 1}. {question.text} {question.required && <span className="text-red-500">*</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Type: {question.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {selectedSurvey.created_at && (
            <p>Created: {new Date(selectedSurvey.created_at).toLocaleDateString()}</p>
          )}
          {selectedSurvey.updated_at && (
            <p>Last updated: {new Date(selectedSurvey.updated_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Survey Management"
      subtitle="Create and manage surveys and assessments"
      icon={ClipboardDocumentCheckIcon}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create Survey"
      totalCount={surveys.length}
      onBack={viewMode !== 'list' ? handleCancel : undefined}
    >
      {viewMode === 'list' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search surveys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="assessment">Assessment</option>
                  <option value="feedback">Feedback</option>
                  <option value="progress">Progress</option>
                  <option value="satisfaction">Satisfaction</option>
                  <option value="custom">Custom</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates Section for Empty State */}
          {surveys.length === 0 && searchTerm === '' && filterType === 'all' && filterStatus === 'all' && (
            <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Templates</h3>
              <p className="text-sm text-gray-600 mb-6">Get started quickly with these professional survey templates</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {surveyTemplates.map((template, index) => {
                  const Icon = getTypeIcon(template.type);
                  return (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-teal-100">
                          <Icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(template.type)}`}>
                              {template.type}
                            </span>
                            <span className="text-xs text-gray-500">{template.questions.length} questions</span>
                          </div>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Use this template →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Survey List */}
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating a new survey'}
              </p>
              {searchTerm === '' && filterType === 'all' && filterStatus === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create Survey
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSurveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(survey)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(survey)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(survey)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(survey.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {renderFormFields()}
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              {viewMode === 'create' ? 'Create Survey' : 'Update Survey'}
            </button>
          </div>
        </form>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && (
        <div className="space-y-6">
          {renderDetailView()}
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(selectedSurvey!)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit Survey
            </button>
          </div>
        </div>
      )}
    </InlineCrudLayout>
  );
};

export default SurveysManagementInline;