import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  TagIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolid,
  VideoCameraIcon as VideoCameraSolid,
  DocumentTextIcon as DocumentTextSolid,
  SparklesIcon as SparklesSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Resource, ResourceType, ResourceCategory, ResourceDifficulty } from '@/types/resources';

const ResourcesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();

  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    difficulty: 'all',
    status: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalResources: 0,
    publishedResources: 0,
    totalViews: 0,
    totalAssignments: 0,
    byType: {} as Record<ResourceType, number>,
    byCategory: {} as Record<ResourceCategory, number>
  });

  // Load resources
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await resourcesApi.getResources();
      
      if (response.success && response.data) {
        const resourcesData = response.data.resources || [];
        setResources(resourcesData);
        calculateStats(resourcesData);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (resourcesData: Resource[]) => {
    const stats = {
      totalResources: resourcesData.length,
      publishedResources: resourcesData.filter(r => r.status === 'published').length,
      totalViews: resourcesData.reduce((sum, r) => sum + (r.view_count || 0), 0),
      totalAssignments: 0, // This would come from assignments API
      byType: {} as Record<ResourceType, number>,
      byCategory: {} as Record<ResourceCategory, number>
    };

    // Count by type
    resourcesData.forEach(resource => {
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;
      stats.byCategory[resource.category] = (stats.byCategory[resource.category] || 0) + 1;
    });

    setStats(stats);
  };

  // Handle resource deletion
  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await resourcesApi.deleteResource(resourceId);
      success('Resource deleted successfully');
      loadResources();
    } catch (err) {
      error('Failed to delete resource');
    }
  };

  // Get icon for resource type
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'article': return BookOpenIcon;
      case 'video': return VideoCameraIcon;
      case 'pdf': return DocumentTextIcon;
      case 'audio': return MusicalNoteIcon;
      case 'interactive': return PuzzlePieceIcon;
      case 'external': return GlobeAltIcon;
      default: return DocumentTextIcon;
    }
  };

  const getResourceIconSolid = (type: ResourceType) => {
    switch (type) {
      case 'article': return BookOpenSolid;
      case 'video': return VideoCameraSolid;
      case 'pdf': return DocumentTextSolid;
      default: return DocumentTextSolid;
    }
  };

  // Get color for resource type
  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pdf': return 'bg-red-100 text-red-800 border-red-200';
      case 'audio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interactive': return 'bg-green-100 text-green-800 border-green-200';
      case 'external': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get color for difficulty
  const getDifficultyColor = (difficulty: ResourceDifficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        resource.author_name.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type !== 'all' && resource.type !== filters.type) return false;
    
    // Category filter
    if (filters.category !== 'all' && resource.category !== filters.category) return false;
    
    // Difficulty filter
    if (filters.difficulty !== 'all' && resource.difficulty !== filters.difficulty) return false;
    
    // Status filter
    if (filters.status !== 'all' && resource.status !== filters.status) return false;

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
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 animate-fadeInUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <BookOpenIcon className="w-8 h-8" />
              </div>
              Educational Resources
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Manage therapeutic content and educational materials
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-premium-ghost bg-white/10 border border-white/30 text-white hover:bg-white/20 flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-premium-primary bg-white text-blue-600 hover:bg-gray-50 flex items-center space-x-2 shadow-premium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Resource</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Total Resources"
          value={stats.totalResources}
          icon={BookOpenIcon}
          iconColor="text-indigo-600"
          change={{ value: "+12%", type: "positive" }}
        />
        <PremiumMetric
          title="Published"
          value={stats.publishedResources}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
          change={{ value: `${Math.round((stats.publishedResources / stats.totalResources) * 100)}%`, type: "neutral" }}
        />
        <PremiumMetric
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={EyeIcon}
          iconColor="text-blue-600"
          change={{ value: "+25%", type: "positive" }}
        />
        <PremiumMetric
          title="Assignments"
          value={stats.totalAssignments}
          icon={UserGroupIcon}
          iconColor="text-purple-600"
          change={{ value: "Active", type: "neutral" }}
        />
      </div>

      {/* Resource Type Distribution */}
      <div className="grid-content-flexible gap-6">
        <div className="card-premium">
          <div className="p-6">
            <h3 className="heading-section mb-4 flex items-center">
              <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                <ChartBarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              Resources by Type
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const Icon = getResourceIcon(type as ResourceType);
              const percentage = Math.round((count / stats.totalResources) * 100);
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
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
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <TagIcon className="w-5 h-5 text-purple-600" />
              </div>
              Resources by Category
            </h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).map(([category, count]) => {
              const percentage = Math.round((count / stats.totalResources) * 100);
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
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
                placeholder="Search resources by title, description, tags, or author..."
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
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="audio">Audio</option>
              <option value="interactive">Interactive</option>
              <option value="external">External</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Categories</option>
              <option value="anxiety">Anxiety</option>
              <option value="depression">Depression</option>
              <option value="stress">Stress</option>
              <option value="relationships">Relationships</option>
              <option value="trauma">Trauma</option>
              <option value="self-care">Self-Care</option>
              <option value="mindfulness">Mindfulness</option>
            </select>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select-premium text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <PremiumEmptyState
          icon={BookOpenIcon}
          title="No Resources Found"
          description={searchTerm || filters.type !== 'all' || filters.category !== 'all' 
            ? "Try adjusting your search or filters"
            : "Create your first educational resource to get started"}
          action={{
            label: 'Create Resource',
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid-content-flexible gap-6">
          {filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const IconSolid = getResourceIconSolid(resource.type);
            
            return (
              <div
                key={resource.id}
                className="card-premium hover:shadow-premium-lg transition-all duration-300 animate-fadeInUp"
              >
                <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge
                      status={resource.status}
                      type={resource.status === 'published' ? 'active' : 
                            resource.status === 'archived' ? 'discontinued' : 'pending'}
                      size="sm"
                    />
                  </div>
                </div>

                <h3 className="heading-section mb-2">
                  {resource.title}
                </h3>
                
                <p className="text-body-sm mb-4 line-clamp-2">
                  {resource.short_description || resource.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(resource.difficulty)}`}>
                    <AcademicCapIcon className="w-3 h-3 mr-1" />
                    {resource.difficulty}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {resource.category}
                  </span>
                  
                  {resource.duration_minutes && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {resource.duration_minutes} min
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {resource.author_name}</span>
                  <span className="flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {resource.view_count} views
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowAssignModal(true);
                    }}
                    className="btn-premium-secondary px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Assign</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowEditModal(true);
                    }}
                    className="btn-premium-ghost px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="btn-premium-ghost text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 text-sm flex items-center space-x-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourcesManagement;