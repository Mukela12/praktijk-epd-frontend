import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';

// Survey status badge component
const SurveyStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Active'
    },
    draft: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: 'Draft'
    },
    archived: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      label: 'Archived'
    },
    template: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Template'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Survey type badge component
const SurveyTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const typeConfig = {
    assessment: {
      icon: ClipboardDocumentCheckIcon,
      label: 'Assessment',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    feedback: {
      icon: ChartBarIcon,
      label: 'Feedback',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    screening: {
      icon: DocumentTextIcon,
      label: 'Screening',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    questionnaire: {
      icon: DocumentTextIcon,
      label: 'Questionnaire',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || {
    icon: DocumentTextIcon,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    color: 'text-gray-600',
    bg: 'bg-gray-50'
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg ${config.bg} text-sm`}>
      <Icon className={`w-4 h-4 ${config.color} mr-1`} />
      <span className={config.color}>{config.label}</span>
    </span>
  );
};

// Survey card component
interface SurveyCardProps {
  survey: any;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onViewResponses: () => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ 
  survey, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onAssign,
  onViewResponses
}) => {
  const responseCount = survey.responseCount || 0;
  const assignedCount = survey.assignedCount || 0;
  const completionRate = assignedCount > 0 ? Math.round((responseCount / assignedCount) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-green-600/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
            {survey.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <SurveyTypeBadge type={survey.type || 'assessment'} />
          <SurveyStatusBadge status={survey.isTemplate ? 'template' : survey.status || 'active'} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{survey.questions?.length || 0}</div>
          <div className="text-xs text-gray-600">Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assignedCount}</div>
          <div className="text-xs text-gray-600">Assigned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-xs text-gray-600">Completion</div>
        </div>
      </div>

      {responseCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Responses</span>
            <span>{responseCount} / {assignedCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Created {formatDate(survey.createdAt || new Date().toISOString())}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Survey"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Survey"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Duplicate Survey"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          {responseCount > 0 && (
            <button
              onClick={onViewResponses}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="View Responses"
            >
              <ChartBarIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onAssign}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Assign to Client"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Survey"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick stats component
const QuickStats: React.FC<{ surveys: any[] }> = ({ surveys }) => {
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => !s.isTemplate && s.status === 'active').length;
  const templates = surveys.filter(s => s.isTemplate).length;
  const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);

  const stats = [
    {
      label: 'Total Surveys',
      value: totalSurveys,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Surveys',
      value: activeSurveys,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Templates',
      value: templates,
      icon: DocumentDuplicateIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Total Responses',
      value: totalResponses,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

const ProfessionalTherapistSurveys: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState<any[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [searchTerm, filterType, filterStatus, showTemplates, surveys]);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getSurveys();
      
      if (response.success) {
        setSurveys(response.data?.surveys || []);
      } else {
        throw new Error('Failed to load surveys');
      }
    } catch (error: any) {
      console.error('Error loading surveys:', error);
      
      if (error?.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error?.response?.status === 404) {
        setSurveys([]);
        setError(null);
      } else if (error?.response?.status === 403) {
        setError('You do not have permission to view surveys.');
      } else {
        setError('Failed to load surveys. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = [...surveys];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(survey => survey.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'template') {
        filtered = filtered.filter(survey => survey.isTemplate);
      } else {
        filtered = filtered.filter(survey => !survey.isTemplate && survey.status === filterStatus);
      }
    }

    // Apply template filter
    if (!showTemplates) {
      filtered = filtered.filter(survey => !survey.isTemplate);
    }

    setFilteredSurveys(filtered);
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;

    try {
      const response = await realApiService.therapist.deleteSurvey(surveyId);
      if (response.success) {
        await loadSurveys();
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      alert('Failed to delete survey. Please try again.');
    }
  };

  const handleDuplicateSurvey = async (survey: any) => {
    try {
      const duplicatedData = {
        ...survey,
        title: `${survey.title} (Copy)`,
        isTemplate: false,
        status: 'draft'
      };
      delete duplicatedData.id;
      delete duplicatedData.createdAt;
      delete duplicatedData.updatedAt;
      
      const response = await realApiService.therapist.createSurvey(duplicatedData);
      if (response.success) {
        await loadSurveys();
      }
    } catch (error) {
      console.error('Error duplicating survey:', error);
      alert('Failed to duplicate survey. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading surveys..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Surveys</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadSurveys}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surveys & Assessments</h1>
            <p className="text-gray-600 mt-1">Create and manage surveys for your clients</p>
          </div>
          <button
            onClick={() => navigate('/therapist/surveys/new')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Survey
          </button>
        </div>

        {/* Quick Stats */}
        <QuickStats surveys={surveys} />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Types</option>
                <option value="assessment">Assessment</option>
                <option value="feedback">Feedback</option>
                <option value="screening">Screening</option>
                <option value="questionnaire">Questionnaire</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="template">Templates</option>
                <option value="archived">Archived</option>
              </select>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTemplates}
                  onChange={(e) => setShowTemplates(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Show Templates</span>
              </label>
              
              <button
                onClick={loadSurveys}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Surveys Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onView={() => navigate(`/therapist/surveys/${survey.id}`)}
                onEdit={() => navigate(`/therapist/surveys/${survey.id}/edit`)}
                onDuplicate={() => handleDuplicateSurvey(survey)}
                onDelete={() => handleDeleteSurvey(survey.id)}
                onAssign={() => navigate(`/therapist/surveys/${survey.id}/assign`)}
                onViewResponses={() => navigate(`/therapist/surveys/${survey.id}/responses`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No surveys found' 
                : 'No surveys yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first survey to start gathering insights from clients'
              }
            </p>
            {(!searchTerm && filterType === 'all' && filterStatus === 'all') && (
              <button
                onClick={() => navigate('/therapist/surveys/new')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Create Your First Survey
              </button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistSurveys;