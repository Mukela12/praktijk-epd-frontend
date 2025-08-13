import React, { useState, useEffect } from 'react';
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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi } from '@/services/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
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
  type: 'assessment' | 'feedback' | 'screening' | 'progress' | 'general';
  questions: SurveyQuestion[];
  status: 'draft' | 'published' | 'active' | 'closed' | 'archived';
  createdBy: string;
  createdAt: string;
  responseCount?: number;
  targetAudience?: 'all' | 'clients' | 'therapists' | 'specific';
  validFrom?: string;
  validUntil?: string;
  isAnonymous?: boolean;
}

const SurveysManagementInline: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert } = useAlert();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'preview' | 'responses'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all'
  });

  // Form state
  const [formData, setFormData] = useState<Partial<Survey>>({
    title: '',
    description: '',
    type: 'general',
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
      const response = await resourcesApi.getSurveys();
      
      if (response.success && response.data) {
        setSurveys(response.data.surveys || response.data || []);
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
      errorAlert('Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || survey.status === filters.status;
    const matchesType = filters.type === 'all' || survey.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle form changes
  const handleFormChange = (field: keyof Survey, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add question to survey
  const handleAddQuestion = () => {
    if (!newQuestion.text) {
      warning('Please enter question text');
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

  // Move question up/down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const questions = [...(formData.questions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      setFormData(prev => ({ ...prev, questions }));
    }
  };

  // Handle create survey
  const handleCreateSurvey = async () => {
    if (!formData.title || !formData.description) {
      warning('Please fill in all required fields');
      return;
    }

    if (!formData.questions || formData.questions.length === 0) {
      warning('Please add at least one question');
      return;
    }

    try {
      const response = await resourcesApi.createSurvey({
        ...formData,
        createdBy: user?.id || ''
      });
      
      if (response.success) {
        success('Survey created successfully');
        loadSurveys();
        setViewMode('list');
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
      errorAlert('Failed to create survey');
    }
  };

  // Handle update survey
  const handleUpdateSurvey = async () => {
    if (!selectedSurvey) return;
    
    try {
      const response = await resourcesApi.updateSurvey(selectedSurvey.id, formData);
      
      if (response.success) {
        success('Survey updated successfully');
        loadSurveys();
        setViewMode('list');
        setSelectedSurvey(null);
      }
    } catch (error) {
      console.error('Failed to update survey:', error);
      errorAlert('Failed to update survey');
    }
  };

  // Handle delete survey
  const handleDeleteSurvey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    
    try {
      const response = await resourcesApi.deleteSurvey(id);
      
      if (response.success) {
        success('Survey deleted successfully');
        loadSurveys();
      }
    } catch (error) {
      console.error('Failed to delete survey:', error);
      errorAlert('Failed to delete survey');
    }
  };

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await resourcesApi.updateSurvey(id, { status: newStatus });
      
      if (response.success) {
        success(`Survey ${newStatus === 'published' ? 'published' : 'updated'} successfully`);
        loadSurveys();
      }
    } catch (error) {
      console.error('Failed to update survey status:', error);
      errorAlert('Failed to update survey status');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'general',
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

  const getSurveyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      assessment: 'bg-purple-100 text-purple-800',
      feedback: 'bg-blue-100 text-blue-800',
      screening: 'bg-red-100 text-red-800',
      progress: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3" />
              Surveys Management
            </h1>
            <p className="text-teal-100 mt-1">
              Create and manage feedback surveys and assessments
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Total Surveys</span>
              <span className="block text-xl font-bold">{surveys.length}</span>
            </div>
            {viewMode === 'list' && (
              <PremiumButton
                onClick={() => {
                  setViewMode('create');
                  resetForm();
                }}
                className="bg-white text-teal-600 hover:bg-gray-50"
                icon={PlusIcon}
              >
                Create Survey
              </PremiumButton>
            )}
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <PremiumCard>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search surveys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="assessment">Assessment</option>
                  <option value="feedback">Feedback</option>
                  <option value="screening">Screening</option>
                  <option value="progress">Progress</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredSurveys.length} of {surveys.length} surveys
              </div>
            </div>
          </PremiumCard>

          {/* Surveys Grid */}
          {filteredSurveys.length === 0 ? (
            <PremiumEmptyState
              icon={ClipboardDocumentCheckIcon}
              title="No Surveys Found"
              description={searchTerm || filters.status !== 'all' ? "No surveys match your filters." : "Create your first survey to get started."}
              action={{
                label: 'Create Survey',
                onClick: () => setViewMode('create')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSurveys.map((survey) => (
                <PremiumCard key={survey.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{survey.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSurveyTypeColor(survey.type)}`}>
                          {survey.type}
                        </span>
                        <StatusBadge
                          type="general"
                          status={survey.status}
                          size="sm"
                        />
                        {survey.isAnonymous && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Anonymous
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
                          {survey.questions.length} questions
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {survey.responseCount || 0} responses
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSurvey(survey);
                          setViewMode('preview');
                        }}
                        className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      {survey.responseCount && survey.responseCount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSurvey(survey);
                            setViewMode('responses');
                          }}
                          className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                        >
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          Responses
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {survey.status === 'draft' && (
                        <PremiumButton
                          size="sm"
                          variant="primary"
                          icon={PlayIcon}
                          onClick={() => handleStatusChange(survey.id, 'published')}
                        >
                          Publish
                        </PremiumButton>
                      )}
                      {survey.status === 'published' && (
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={PauseIcon}
                          onClick={() => handleStatusChange(survey.id, 'closed')}
                        >
                          Close
                        </PremiumButton>
                      )}
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={PencilIcon}
                        onClick={() => {
                          setSelectedSurvey(survey);
                          setFormData(survey);
                          setViewMode('edit');
                        }}
                      >
                        Edit
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={TrashIcon}
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'create' ? 'Create New Survey' : 'Edit Survey'}
              </h2>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Survey Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Survey title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type || 'general'}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="assessment">Assessment</option>
                  <option value="feedback">Feedback</option>
                  <option value="screening">Screening</option>
                  <option value="progress">Progress</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                  placeholder="Describe the survey..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={formData.targetAudience || 'all'}
                  onChange={(e) => handleFormChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Users</option>
                  <option value="clients">Clients Only</option>
                  <option value="therapists">Therapists Only</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous || false}
                    onChange={(e) => handleFormChange('isAnonymous', e.target.checked)}
                    className="mr-2 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Anonymous responses</span>
                </label>
              </div>
            </div>

            {/* Questions Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Questions</h3>
              
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
                          onClick={() => handleMoveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveQuestion(index, 'down')}
                          disabled={index === (formData.questions?.length || 0) - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        <button
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
                    <input
                      type="text"
                      value={newQuestion.text || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Question text"
                    />
                  </div>
                  <div>
                    <select
                      value={newQuestion.type || 'text'}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="scale">Scale</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuestion.required ?? true}
                        onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                        className="mr-2 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    icon={PlusIcon}
                    onClick={handleAddQuestion}
                  >
                    Add Question
                  </PremiumButton>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                  resetForm();
                }}
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="primary"
                icon={CheckCircleIcon}
                onClick={viewMode === 'create' ? handleCreateSurvey : handleUpdateSurvey}
              >
                {viewMode === 'create' ? 'Create Survey' : 'Update Survey'}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && selectedSurvey && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Survey Preview</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedSurvey.title}</p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedSurvey.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedSurvey.description}</p>
              </div>

              <div className="space-y-4">
                {selectedSurvey.questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.text} {question.required && <span className="text-red-500">*</span>}
                    </p>
                    <div className="mt-2">
                      {question.type === 'text' && (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Your answer"
                          disabled
                        />
                      )}
                      {question.type === 'number' && (
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                          disabled
                        />
                      )}
                      {question.type === 'scale' && (
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              className="w-10 h-10 border border-gray-300 rounded-lg"
                              disabled
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                }}
              >
                Back to List
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Responses View */}
      {viewMode === 'responses' && selectedSurvey && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Survey Responses</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedSurvey.title}</p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-12 text-gray-500">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-4" />
              <p>Response analysis functionality will be implemented here.</p>
              <p className="text-sm mt-2">This will show aggregated survey responses and analytics.</p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedSurvey(null);
                }}
              >
                Back to List
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default SurveysManagementInline;