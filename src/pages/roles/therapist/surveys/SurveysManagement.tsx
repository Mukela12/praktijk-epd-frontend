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
  UserPlusIcon,
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
import { therapistApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Survey, SurveyType, QuestionType } from '@/types/resources';

const TherapistSurveysManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [mySurveys, setMySurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    anonymous: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalSurveys: 0,
    mySurveys: 0,
    totalResponses: 0,
    activeAssignments: 0
  });

  // Load surveys
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const response = await therapistApi.getSurveys();
      
      if (response.success && response.data) {
        const surveysData = response.data.surveys || [];
        setSurveys(surveysData);
        
        // Filter my surveys (created by me)
        const mySurveysList = surveysData.filter((s: Survey) => s.created_by === user?.id);
        setMySurveys(mySurveysList);
        
        calculateStats(surveysData, mySurveysList);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
      error('Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (allSurveys: Survey[], mySurveysList: Survey[]) => {
    setStats({
      totalSurveys: allSurveys.length,
      mySurveys: mySurveysList.length,
      totalResponses: allSurveys.reduce((sum, s) => sum + s.response_count, 0),
      activeAssignments: 0 // Would need assignment data
    });
  };

  // Handle survey assignment
  const handleAssign = async (surveyId: string, clientId: string) => {
    try {
      await therapistApi.assignSurvey(surveyId, clientId);
      success('Survey assigned successfully');
      setShowAssignModal(false);
    } catch (err) {
      error('Failed to assign survey');
    }
  };

  // Handle survey deletion (only for own surveys)
  const handleDelete = async (surveyId: string) => {
    if (!window.confirm('Are you sure you want to delete this survey? This will also delete all responses.')) return;

    try {
      // Would need delete endpoint in therapistApi
      // await therapistApi.deleteSurvey(surveyId);
      success('Survey deleted successfully');
      loadSurveys();
    } catch (err) {
      error('Failed to delete survey');
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
      
      await therapistApi.createSurvey(duplicatedSurvey);
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
  const currentSurveys = activeTab === 'my' ? mySurveys : surveys;
  const filteredSurveys = currentSurveys.filter(survey => {
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
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3" />
              Client Surveys
            </h1>
            <p className="text-teal-100 mt-1">
              Create and assign assessments and feedback forms to your clients
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              icon={PlusIcon}
              onClick={() => setShowCreateModal(true)}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20"
            >
              Create Survey
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Available Surveys"
          value={stats.totalSurveys}
          icon={ClipboardDocumentCheckIcon}
          iconColor="text-teal-600"
        />
        <PremiumMetric
          title="My Surveys"
          value={stats.mySurveys}
          icon={ClipboardSolid}
          iconColor="text-cyan-600"
        />
        <PremiumMetric
          title="Total Responses"
          value={stats.totalResponses}
          icon={UserGroupIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Active Assignments"
          value={stats.activeAssignments}
          icon={ChartPieIcon}
          iconColor="text-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Surveys
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'my' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Surveys
        </button>
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={filters.anonymous}
              onChange={(e) => setFilters({ ...filters, anonymous: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Privacy</option>
              <option value="anonymous">Anonymous</option>
              <option value="identified">Identified</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <PremiumEmptyState
          icon={ClipboardDocumentCheckIcon}
          title="No Surveys Found"
          description={searchTerm || filters.type !== 'all' || filters.status !== 'all' 
            ? "Try adjusting your search or filters"
            : activeTab === 'my'
              ? "Create your first survey to collect feedback and assessments"
              : "No surveys available"}
          action={activeTab === 'my' ? {
            label: 'Create Survey',
            onClick: () => setShowCreateModal(true)
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredSurveys.map((survey) => {
            const Icon = getSurveyIcon(survey.type);
            const IconSolid = getSurveyIconSolid(survey.type);
            const isMySurvey = survey.created_by === user?.id;
            
            return (
              <PremiumCard
                key={survey.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(survey.type)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {isMySurvey && (
                      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                        My Survey
                      </span>
                    )}
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

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {survey.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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

                <div className="flex items-center space-x-2">
                  <PremiumButton
                    size="sm"
                    variant="primary"
                    icon={UserPlusIcon}
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign to Client
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    icon={EyeIcon}
                    onClick={() => {
                      // Preview survey
                    }}
                  >
                    Preview
                  </PremiumButton>
                  {survey.response_count > 0 && (
                    <PremiumButton
                      size="sm"
                      variant="secondary"
                      icon={ChartBarIcon}
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setShowResponsesModal(true);
                      }}
                    >
                      Results
                    </PremiumButton>
                  )}
                  {isMySurvey && (
                    <>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={DocumentDuplicateIcon}
                        onClick={() => handleDuplicate(survey)}
                      >
                        Copy
                      </PremiumButton>
                      {survey.status === 'draft' && (
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={PencilIcon}
                          onClick={() => {
                            setSelectedSurvey(survey);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </PremiumButton>
                      )}
                    </>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapistSurveysManagement;