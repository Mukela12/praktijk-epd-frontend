import React, { useState, useEffect, useMemo } from 'react';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  ScaleIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
  ChartPieIcon,
  LockClosedIcon,
  LockOpenIcon,
  CalendarIcon,
  ArrowLeftIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  ClipboardDocumentCheckIcon as ClipboardSolid,
  ChatBubbleBottomCenterTextIcon as ChatSolid,
  ScaleIcon as ScaleSolid,
  ChartBarIcon as ChartSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { useAuth } from '@/store/authStore';
import type { Survey, SurveyType, QuestionType } from '@/types/resources';
import {
  TextField,
  TextareaField,
  SelectField,
  CheckboxField
} from '@/components/forms/FormFields';
import { formatDate } from '@/utils/dateFormatters';

interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  isRequired: boolean;
  options?: string[];
  scale?: { min: number; max: number; labels?: { min: string; max: string } };
  order: number;
}

const TherapistSurveysManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'detail' | 'assign'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating surveys
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assessment' as SurveyType,
    isAnonymous: false,
    allowMultipleSubmissions: false,
    validUntil: '',
    questions: [] as SurveyQuestion[]
  });

  // Current question being added
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'text' as QuestionType,
    isRequired: true,
    options: [] as string[],
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: '', max: '' }
  });

  // Load surveys and clients
  useEffect(() => {
    loadSurveys();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await realApiService.therapist.getClients();
      if (response.success && response.data) {
        const clientsData = response.data as any;
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || []);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.therapist.getSurveys();
      
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

  // Handle survey creation
  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      error('Please add at least one question to the survey');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const surveyData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        isAnonymous: formData.isAnonymous,
        allowMultipleSubmissions: formData.allowMultipleSubmissions,
        validUntil: formData.validUntil || null,
        questions: formData.questions,
        status: 'published'
      };

      const response = await realApiService.therapist.createSurvey(surveyData);
      if (response.success) {
        success('Survey created successfully');
        handleCancel();
        loadSurveys();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle survey assignment
  const handleAssignSurvey = async () => {
    if (!selectedSurvey || !selectedClientId) return;

    try {
      setIsSubmitting(true);
      const response = await realApiService.therapist.assignSurvey(selectedSurvey.id, selectedClientId, {
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        notes: 'Survey assigned by therapist'
      });
      if (response.success) {
        success('Survey assigned successfully');
        setViewMode('list');
        setSelectedSurvey(null);
        setSelectedClientId('');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add question to survey
  const handleAddQuestion = () => {
    if (!currentQuestion.text.trim()) {
      error('Question text is required');
      return;
    }

    const question: SurveyQuestion = {
      id: Date.now().toString(),
      text: currentQuestion.text,
      type: currentQuestion.type,
      isRequired: currentQuestion.isRequired,
      order: formData.questions.length + 1,
      ...(currentQuestion.type === 'multiple_choice' && { options: currentQuestion.options.filter(opt => opt.trim()) }),
      ...(currentQuestion.type === 'scale' && {
        scale: {
          min: currentQuestion.scaleMin,
          max: currentQuestion.scaleMax,
          labels: currentQuestion.scaleLabels
        }
      })
    };

    setFormData({ ...formData, questions: [...formData.questions, question] });
    setCurrentQuestion({
      text: '',
      type: 'text',
      isRequired: true,
      options: [],
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: '', max: '' }
    });
  };

  // Remove question from survey
  const handleRemoveQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    });
  };

  // Add option to multiple choice question
  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  // Update option text
  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index)
    });
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedSurvey(null);
    setFormData({
      title: '',
      description: '',
      type: 'assessment',
      isAnonymous: false,
      allowMultipleSubmissions: false,
      validUntil: '',
      questions: []
    });
    setCurrentQuestion({
      text: '',
      type: 'text',
      isRequired: true,
      options: [],
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: '', max: '' }
    });
  };

  // Handle create
  const handleCreate = () => {
    setViewMode('create');
  };

  // Handle edit
  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description,
      type: survey.type,
      isAnonymous: survey.isAnonymous || false,
      allowMultipleSubmissions: (survey as any).allowMultipleSubmissions || false,
      validUntil: survey.validUntil || '',
      questions: (survey.questions || []).map(q => ({
        ...q,
        isRequired: q.required ?? true,
        order: q.order ?? 0
      }))
    });
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('detail');
  };

  // Handle assign survey
  const handleAssign = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('assign');
  };

  // Get icon for survey type
  const getSurveyIcon = (type: SurveyType) => {
    switch (type) {
      case 'assessment': return ClipboardDocumentCheckIcon;
      case 'feedback': return ChatBubbleBottomCenterTextIcon;
      case 'progress': return ChartBarIcon;
      case 'satisfaction': return ScaleIcon;
      case 'custom': return ListBulletIcon;
      default: return QuestionMarkCircleIcon;
    }
  };

  // Get color for survey type
  const getTypeColor = (type: SurveyType) => {
    switch (type) {
      case 'assessment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'feedback': return 'bg-green-100 text-green-800 border-green-200';
      case 'progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'satisfaction': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'custom': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get question type label
  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'scale': return 'Scale';
      case 'multiple_choice': return 'Multiple Choice';
      case 'text': return 'Text';
      case 'boolean': return 'Yes/No';
      default: return type;
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

  // Column definitions
  const columns = [
    {
      key: 'title',
      label: 'Survey',
      render: (survey: Survey) => {
        const Icon = getSurveyIcon(survey.type);
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
          <ListBulletIcon className="w-4 h-4 mr-1" />
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
          {survey.response_count || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (survey: Survey) => (
        <StatusBadge
          status={survey.status}
          type={survey.status === 'published' ? 'active' : 
                survey.status === 'closed' ? 'discontinued' : 'pending'}
          size="sm"
        />
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
          value={formData.title}
          onChange={(value) => setFormData({ ...formData, title: value })}
          required
          placeholder="Enter survey title"
        />

        <SelectField
          label="Type"
          name="type"
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value as SurveyType })}
          options={[
            { value: 'assessment', label: 'Assessment' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'progress', label: 'Progress' },
            { value: 'satisfaction', label: 'Satisfaction' },
            { value: 'custom', label: 'Custom' }
          ]}
          required
        />

        <TextField
          label="Valid Until (Optional)"
          name="validUntil"
          value={formData.validUntil}
          onChange={(value) => setFormData({ ...formData, validUntil: value })}
          placeholder="YYYY-MM-DD"
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Describe the purpose and instructions for this survey"
        rows={3}
      />

      <div className="flex items-center space-x-6">
        <CheckboxField
          label="Anonymous responses"
          name="isAnonymous"
          checked={formData.isAnonymous}
          onChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
        />
        <CheckboxField
          label="Allow multiple submissions"
          name="allowMultipleSubmissions"
          checked={formData.allowMultipleSubmissions}
          onChange={(checked) => setFormData({ ...formData, allowMultipleSubmissions: checked })}
        />
      </div>

      {/* Questions Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Questions</h3>
        
        {/* Existing Questions */}
        {formData.questions.length > 0 && (
          <div className="space-y-3 mb-6">
            {formData.questions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Type: {getQuestionTypeLabel(question.type)}
                      {question.isRequired && ' • Required'}
                    </div>
                    {question.options && (
                      <div className="text-sm text-gray-600 mt-2">
                        Options: {question.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Question */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Question</h4>
          
          <TextField
            label="Question Text"
            name="questionText"
            value={currentQuestion.text}
            onChange={(value) => setCurrentQuestion({ ...currentQuestion, text: value })}
            placeholder="Enter your question"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Question Type"
              name="questionType"
              value={currentQuestion.type}
              onChange={(value) => setCurrentQuestion({ ...currentQuestion, type: value as QuestionType })}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'multiple_choice', label: 'Multiple Choice' },
                { value: 'scale', label: 'Scale (1-10)' },
                { value: 'boolean', label: 'Yes/No' }
              ]}
            />
            
            <div className="flex items-center">
              <CheckboxField
                label="Required question"
                name="isRequired"
                checked={currentQuestion.isRequired}
                onChange={(checked) => setCurrentQuestion({ ...currentQuestion, isRequired: checked })}
              />
            </div>
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Options
              </label>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Scale Labels */}
          {currentQuestion.type === 'scale' && (
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Minimum Label (1)"
                name="scaleMin"
                value={currentQuestion.scaleLabels.min}
                onChange={(value) => setCurrentQuestion({ 
                  ...currentQuestion, 
                  scaleLabels: { ...currentQuestion.scaleLabels, min: value }
                })}
                placeholder="e.g., Not at all"
              />
              <TextField
                label="Maximum Label (10)"
                name="scaleMax"
                value={currentQuestion.scaleLabels.max}
                onChange={(value) => setCurrentQuestion({ 
                  ...currentQuestion, 
                  scaleLabels: { ...currentQuestion.scaleLabels, max: value }
                })}
                placeholder="e.g., Extremely"
              />
            </div>
          )}

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
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedSurvey) return null;

    const Icon = getSurveyIcon(selectedSurvey.type);

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Icon className="w-8 h-8 text-teal-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedSurvey.title}</h2>
            <p className="text-gray-500 mt-1">{selectedSurvey.type} • {selectedSurvey.questions?.length || 0} questions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Questions</p>
            <p className="text-2xl font-bold text-gray-900">{selectedSurvey.questions?.length || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Responses</p>
            <p className="text-2xl font-bold text-gray-900">{selectedSurvey.response_count || 0}</p>
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
              {selectedSurvey.questions.map((question: any, index: number) => (
                <div key={question.id || index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-900">
                    {index + 1}. {question.text}
                    {(question.isRequired || question.required) && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Type: {getQuestionTypeLabel(question.type)}
                  </div>
                  {question.options && (
                    <div className="text-sm text-gray-600 mt-2">
                      Options: {question.options.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {selectedSurvey.created_at && (
            <p>Created: {formatDate(selectedSurvey.created_at)}</p>
          )}
          {selectedSurvey.updated_at && (
            <p>Last updated: {formatDate(selectedSurvey.updated_at)}</p>
          )}
        </div>
      </div>
    );
  };

  // Render assignment view
  const renderAssignmentView = () => {
    if (!selectedSurvey) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Assigning Survey</h3>
          <p className="text-gray-600">{selectedSurvey.title}</p>
        </div>

        <SelectField
          label="Select Client"
          name="client"
          value={selectedClientId}
          onChange={(value) => setSelectedClientId(value)}
          options={[
            { value: '', label: 'Choose a client...' },
            ...clients.map(client => ({
              value: client.id,
              label: `${client.first_name} ${client.last_name}`
            }))
          ]}
          required
        />

        <div className="flex justify-end space-x-3">
          <PremiumButton
            variant="outline"
            onClick={() => setViewMode('detail')}
          >
            Back
          </PremiumButton>
          <PremiumButton
            variant="primary"
            onClick={handleAssignSurvey}
            disabled={!selectedClientId}
            loading={isSubmitting}
          >
            Assign Survey
          </PremiumButton>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Survey Management"
      subtitle="Create and manage surveys for your clients"
      icon={ClipboardDocumentCheckIcon}
      viewMode={viewMode as any}
      onViewModeChange={setViewMode as any}
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
                </select>
              </div>
            </div>
          </div>

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
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAssign(survey)}
                          className="text-teal-600 hover:text-teal-900"
                          title="Assign to Client"
                        >
                          <UserPlusIcon className="w-5 h-5" />
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
        <form onSubmit={handleCreateSurvey} className="space-y-6">
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
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => handleAssign(selectedSurvey!)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Assign to Client
            </button>
          </div>
        </div>
      )}

      {/* Assign View */}
      {viewMode === 'assign' && renderAssignmentView()}
    </InlineCrudLayout>
  );
};

export default TherapistSurveysManagement;