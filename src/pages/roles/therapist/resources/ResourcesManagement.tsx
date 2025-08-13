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
  XCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolid,
  VideoCameraIcon as VideoCameraSolid,
  DocumentTextIcon as DocumentTextSolid,
  SparklesIcon as SparklesSolid
} from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi, therapistApi } from '@/services/endpoints';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import type { Resource, ResourceType, ResourceCategory, ResourceDifficulty } from '@/types/resources';

const TherapistResourcesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    difficulty: 'all',
    status: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalResources: 0,
    myResources: 0,
    assignedToClients: 0,
    completedByClients: 0
  });

  // Load resources
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      
      // Get all resources
      const [allResourcesResponse, myClientsResponse] = await Promise.all([
        resourcesApi.getResources(),
        therapistApi.getClients()
      ]);
      
      if (allResourcesResponse.success && allResourcesResponse.data) {
        const resourcesData = allResourcesResponse.data.resources || [];
        setResources(resourcesData);
        
        // Filter my resources (created by me)
        const myResourcesList = resourcesData.filter((r: Resource) => r.created_by === user?.id);
        setMyResources(myResourcesList);
        
        calculateStats(resourcesData, myResourcesList);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (allResources: Resource[], myResourcesList: Resource[]) => {
    setStats({
      totalResources: allResources.length,
      myResources: myResourcesList.length,
      assignedToClients: 0, // Would need assignment data
      completedByClients: 0 // Would need completion data
    });
  };

  // Handle resource assignment
  const handleAssign = async (resourceId: string) => {
    if (!selectedClientId) {
      error('Please select a client');
      return;
    }

    try {
      await therapistApi.assignResource(resourceId, selectedClientId);
      success('Resource assigned successfully');
      setShowAssignModal(false);
      setSelectedClientId('');
    } catch (err) {
      error('Failed to assign resource');
    }
  };

  // Handle resource deletion (only for own resources)
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
  const currentResources = activeTab === 'my' ? myResources : resources;
  const filteredResources = currentResources.filter(resource => {
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <BookOpenIcon className="w-8 h-8 mr-3" />
              Educational Resources
            </h1>
            <p className="text-emerald-100 mt-1">
              Create and assign therapeutic content to your clients
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              icon={PlusIcon}
              onClick={() => setShowCreateModal(true)}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20"
            >
              Create Resource
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Available Resources"
          value={stats.totalResources}
          icon={BookOpenIcon}
          iconColor="text-emerald-600"
        />
        <PremiumMetric
          title="My Resources"
          value={stats.myResources}
          icon={SparklesIcon}
          iconColor="text-teal-600"
        />
        <PremiumMetric
          title="Assigned to Clients"
          value={stats.assignedToClients}
          icon={UserGroupIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Completed by Clients"
          value={stats.completedByClients}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
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
          All Resources
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'my' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Resources
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
                placeholder="Search resources by title, description, tags, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <PremiumEmptyState
          icon={BookOpenIcon}
          title="No Resources Found"
          description={searchTerm || filters.type !== 'all' || filters.category !== 'all' 
            ? "Try adjusting your search or filters"
            : activeTab === 'my' 
              ? "Create your first educational resource to share with clients"
              : "No resources available"}
          action={activeTab === 'my' ? {
            label: 'Create Resource',
            onClick: () => setShowCreateModal(true)
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const IconSolid = getResourceIconSolid(resource.type);
            const isMyResource = resource.created_by === user?.id;
            
            return (
              <PremiumCard
                key={resource.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    <IconSolid className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {isMyResource && (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        My Resource
                      </span>
                    )}
                    <StatusBadge
                      status={resource.status}
                      type={resource.status === 'published' ? 'active' : 
                            resource.status === 'archived' ? 'discontinued' : 'pending'}
                      size="sm"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                  <PremiumButton
                    size="sm"
                    variant="primary"
                    icon={UserPlusIcon}
                    onClick={() => {
                      setSelectedResource(resource);
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
                      // Preview resource
                    }}
                  >
                    Preview
                  </PremiumButton>
                  {isMyResource && (
                    <>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={PencilIcon}
                        onClick={() => {
                          setSelectedResource(resource);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={TrashIcon}
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </PremiumButton>
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

export default TherapistResourcesManagement;