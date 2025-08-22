import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  ScaleIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  LockClosedIcon,
  LockOpenIcon,
  CalendarIcon,
  PlayIcon,
  StopIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  ClipboardDocumentCheckIcon as ClipboardSolid,
  ChatBubbleBottomCenterTextIcon as ChatSolid,
  ScaleIcon as ScaleSolid,
  ChartBarIcon as ChartSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Survey, SurveyType, QuestionType } from '@/types/resources';

const SurveysManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    anonymous: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    averageResponseRate: 0,
    byType: {} as Record<SurveyType, number>,
    responsesByType: {} as Record<SurveyType, number>
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
        const surveysData = Array.isArray(response.data) ? response.data : response.data.surveys || [];
        setSurveys(surveysData);
        calculateStats(surveysData);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
      error('Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (surveysData: Survey[]) => {
    const stats = {
      totalSurveys: surveysData.length,
      activeSurveys: surveysData.filter(s => s.status === 'published').length,
      totalResponses: surveysData.reduce((sum, s) => sum + s.response_count, 0),
      averageResponseRate: 0,
      byType: {} as Record<SurveyType, number>,
      responsesByType: {} as Record<SurveyType, number>
    };

    // Count by type
    surveysData.forEach(survey => {
      stats.byType[survey.type] = (stats.byType[survey.type] || 0) + 1;
      stats.responsesByType[survey.type] = (stats.responsesByType[survey.type] || 0) + survey.response_count;
    });

    // Calculate average response rate (would need more data in real implementation)
    if (stats.activeSurveys > 0) {
      stats.averageResponseRate = Math.round(stats.totalResponses / stats.activeSurveys);
    }

    setStats(stats);
  };

  // Handle survey deletion
  const handleDelete = async (surveyId: string) => {
    if (!window.confirm('Are you sure you want to delete this survey? This will also delete all responses.')) return;

    try {
      await resourcesApi.deleteSurvey(surveyId);
      success('Survey deleted successfully');
      loadSurveys();
    } catch (err) {
      error('Failed to delete survey');
    }
  };

  // Handle status change
  const handleStatusChange = async (surveyId: string, newStatus: 'published' | 'closed') => {
    try {
      await resourcesApi.updateSurvey(surveyId, { status: newStatus });
      success(`Survey ${newStatus} successfully`);
      loadSurveys();
    } catch (err) {
      error('Failed to update survey status');
    }
  };

  // Handle survey duplication
  const handleDuplicate = async (survey: Survey) => {
    try {
      const duplicatedSurvey = {
        ...survey,
        title: `${survey.title} (Copy)`,
        status: 'draft' as const,
        response_count: 0
      };
      delete (duplicatedSurvey as any).id;
      delete (duplicatedSurvey as any).created_at;
      delete (duplicatedSurvey as any).updated_at;
      
      await resourcesApi.createSurvey(duplicatedSurvey);
      success('Survey duplicated successfully');
      loadSurveys();
    } catch (err) {
      error('Failed to duplicate survey');
    }
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

  const getSurveyIconSolid = (type: SurveyType) => {
    switch (type) {
      case 'assessment': return ClipboardSolid;
      case 'feedback': return ChatSolid;
      case 'progress': return ChartSolid;
      case 'satisfaction': return ScaleSolid;
      default: return ClipboardSolid;
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
  const filteredSurveys = surveys.filter(survey => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        survey.title.toLowerCase().includes(searchLower) ||
        survey.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type !== 'all' && survey.type !== filters.type) return false;
    
    // Status filter
    if (filters.status !== 'all' && survey.status !== filters.status) return false;
    
    // Anonymous filter
    if (filters.anonymous !== 'all') {
      const isAnonymous = filters.anonymous === 'anonymous';
      if (survey.isAnonymous !== isAnonymous) return false;
    }

    return true;
  });

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
      <div className="card-premium gradient-medical text-white rounded-2xl p-8 animate-fadeInUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ClipboardDocumentCheckIcon className="w-8 h-8" />
              </div>
              Survey Management
            </h1>
            <p className="text-body text-teal-50 mt-2">
              Create and manage assessments, feedback forms, and questionnaires
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-premium-ghost bg-white/10 border border-white/30 text-white hover:bg-white/20 flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export Results</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-premium-primary bg-white text-teal-600 hover:bg-gray-50 flex items-center space-x-2 shadow-premium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Survey</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Total Surveys"
          value={stats.totalSurveys}
          icon={ClipboardDocumentCheckIcon}
          iconColor="text-teal-600"
          change={stats.totalSurveys > 0 ? { value: "+12%", type: "positive" } : undefined}
        />
        <PremiumMetric
          title="Active Surveys"
          value={stats.activeSurveys}
          icon={PlayIcon}
          iconColor="text-green-600"
          change={stats.totalSurveys > 0 ? { value: `${Math.round((stats.activeSurveys / stats.totalSurveys) * 100) || 0}% active`, type: "neutral" } : undefined}
        />
        <PremiumMetric
          title="Total Responses"
          value={stats.totalResponses}
          icon={UserGroupIcon}
          iconColor="text-blue-600"
          change={stats.totalResponses > 10 ? { value: "+28%", type: "positive" } : { value: "New", type: "neutral" }}
        />
        <PremiumMetric
          title="Avg Response Rate"
          value={stats.averageResponseRate}
          icon={ChartPieIcon}
          iconColor="text-purple-600"
          change={stats.averageResponseRate > 0 ? { value: "85% avg", type: "positive" } : { value: "--", type: "neutral" }}
        />
      </div>

      {/* Survey Type Distribution */}
      <div className="grid-content-flexible gap-6">
        <div className="card-premium">
          <div className="p-6">
            <h3 className="heading-section mb-4 flex items-center">
              <div className="p-2 bg-teal-50 rounded-lg mr-3">
                <ChartBarIcon className="w-5 h-5 text-teal-600" />
              </div>
              Surveys by Type
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const Icon = getSurveyIcon(type as SurveyType);
              const percentage = stats.totalSurveys > 0 ? Math.round((count / stats.totalSurveys) * 100) : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="p-6">
            <h3 className="heading-section mb-4 flex items-center">
              <div className="p-2 bg-cyan-50 rounded-lg mr-3">
                <DocumentChartBarIcon className="w-5 h-5 text-cyan-600" />
              </div>
              Responses by Type
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.responsesByType).map(([type, count]) => {
              const percentage = stats.totalResponses > 0 ? Math.round((count / stats.totalResponses) * 100) : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Types</option>
              <option value="assessment">Assessment</option>
              <option value="feedback">Feedback</option>
              <option value="progress">Progress</option>
              <option value="satisfaction">Satisfaction</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={filters.anonymous}
              onChange={(e) => setFilters({ ...filters, anonymous: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Privacy</option>
              <option value="anonymous">Anonymous</option>
              <option value="identified">Identified</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <PremiumEmptyState
          icon={ClipboardDocumentCheckIcon}
          title="No Surveys Found"
          description={searchTerm || filters.type !== 'all' || filters.status !== 'all' 
            ? "Try adjusting your search or filters"
            : "Create your first survey to collect feedback and assessments"}
          action={{
            label: 'Create Survey',
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid-content-flexible gap-6">
          {filteredSurveys.map((survey) => {
            const Icon = getSurveyIcon(survey.type);
            const IconSolid = getSurveyIconSolid(survey.type);
            
            return (
              <div
                key={survey.id}
                className="card-premium hover:shadow-premium-lg transition-all duration-300 animate-fadeInUp"
              >
                <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(survey.type)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {survey.isAnonymous ? (
                      <LockClosedIcon className="w-4 h-4 text-gray-500" title="Anonymous" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4 text-gray-500" title="Identified" />
                    )}
                    <StatusBadge
                      status={survey.status}
                      type={survey.status === 'published' ? 'active' : 
                            survey.status === 'closed' ? 'discontinued' : 'pending'}
                      size="sm"
                    />
                  </div>
                </div>

                <h3 className="heading-section mb-2">
                  {survey.title}
                </h3>
                
                <p className="text-body-sm mb-4 line-clamp-2">
                  {survey.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <ListBulletIcon className="w-3 h-3 mr-1" />
                    {survey.questions.length} questions
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <UserGroupIcon className="w-3 h-3 mr-1" />
                    {survey.response_count} responses
                  </span>
                  
                  {survey.validUntil && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {new Date(survey.validUntil).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xs text-gray-500">Question Types:</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(survey.questions.map(q => q.type))).map(type => (
                      <span key={type} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getQuestionTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setShowPreviewModal(true);
                    }}
                    className="btn-premium-secondary px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  {survey.response_count > 0 && (
                    <button
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setShowResponsesModal(true);
                      }}
                      className="btn-premium-secondary px-3 py-1.5 text-sm flex items-center space-x-1"
                    >
                      <ChartBarIcon className="w-4 h-4" />
                      <span>Results</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(survey)}
                    className="btn-premium-ghost px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  {survey.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedSurvey(survey);
                          setShowEditModal(true);
                        }}
                        className="btn-premium-ghost px-3 py-1.5 text-sm flex items-center space-x-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(survey.id, 'published')}
                        className="btn-premium-ghost text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>Publish</span>
                      </button>
                    </>
                  )}
                  {survey.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(survey.id, 'closed')}
                      className="btn-premium-ghost text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedSurvey && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="heading-section">Survey Preview</h2>
                  <p className="text-body-sm text-gray-600 mt-1">
                    {selectedSurvey.isAnonymous ? 'Anonymous Survey' : 'Identified Survey'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Survey Header */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedSurvey.title}</h3>
                  <p className="text-gray-600">{selectedSurvey.description}</p>
                  {selectedSurvey.validUntil && (
                    <p className="text-sm text-gray-500 mt-2">
                      Valid until: {new Date(selectedSurvey.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {selectedSurvey.questions.map((question, index) => (
                    <div key={question.id} className="card-metric p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-600 font-semibold text-sm mr-3">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {question.text}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            {question.description && (
                              <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                      </div>

                      {/* Question Type Preview */}
                      {question.type === 'scale' && question.scale && (
                        <div className="ml-11">
                          <div className="flex items-center justify-between max-w-md">
                            <span className="text-sm text-gray-500">{question.scale?.minLabel || question.scale?.min || ''}</span>
                            <div className="flex space-x-2 mx-4">
                              {question.scale && Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, i) => (
                                <div key={i} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-teal-500 cursor-pointer">
                                  <span className="text-sm text-gray-700">{(question.scale?.min || 0) + i}</span>
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{question.scale?.maxLabel || question.scale?.max || ''}</span>
                          </div>
                        </div>
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <div className="ml-11 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type={question.allowMultiple ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                className="form-checkbox h-4 w-4 text-teal-600 rounded border-gray-300"
                                disabled
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'text' && (
                        <div className="ml-11">
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            rows={3}
                            placeholder="Enter your response here..."
                            disabled
                          />
                        </div>
                      )}

                      {question.type === 'boolean' && (
                        <div className="ml-11 flex space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name={`question-${question.id}`} className="form-radio" disabled />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name={`question-${question.id}`} className="form-radio" disabled />
                            <span>No</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> This is a preview of how the survey will appear to respondents.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="btn-premium-secondary"
                >
                  Close Preview
                </button>
                {selectedSurvey.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedSurvey.id, 'published');
                      setShowPreviewModal(false);
                    }}
                    className="btn-premium-primary flex items-center space-x-2"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Publish Survey</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveysManagement;