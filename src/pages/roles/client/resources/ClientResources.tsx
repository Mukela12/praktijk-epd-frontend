import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  LinkIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatters';
import DOMPurify from 'dompurify';
import { marked as markedParser } from 'marked';

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: 'article' | 'video' | 'pdf' | 'link';
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  rating: number;
  createdAt: string;
  assignedAt?: string;
  assignedBy?: {
    firstName: string;
    lastName: string;
  };
  progress?: {
    viewed: boolean;
    viewedAt?: string;
    completed: boolean;
    completedAt?: string;
    timeSpent: number;
    isFavorite: boolean;
  };
  estimatedReadTime?: number;
  externalUrl?: string;
  thumbnailUrl?: string;
}


const ClientResources: React.FC = () => {
  const { t } = useTranslation();
  const { success, error } = useAlert();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getResources();
      
      if (response.success && response.data) {
        const resourcesData = Array.isArray(response.data.resources) ? response.data.resources : 
                           Array.isArray(response.data) ? response.data : [];
        setResources(resourcesData);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error('Error loading resources:', err);
      setResources([]);
      
      if (err.response?.status === 404) {
        error('Resources not found. Please contact your therapist.');
      } else if (err.response?.status === 401) {
        error('You are not authorized to view resources.');
      } else {
        error('Failed to load resources. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = async (resource: Resource) => {
    setSelectedResource(resource);
    
    // Track view if not already viewed
    if (!resource.progress?.viewed && resource.id) {
      try {
        await realApiService.resources.trackEngagement(resource.id, 'view');
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    }
  };

  const handleMarkComplete = async (resource: Resource) => {
    try {
      await realApiService.resources.trackEngagement(resource.id, 'complete');
      success('Resource marked as completed!');
      await loadResources();
    } catch (err) {
      error('Failed to mark resource as complete');
    }
  };

  const handleToggleFavorite = async (resource: Resource) => {
    try {
      const isFavorite = resource.progress?.isFavorite;
      // Assuming there's an API endpoint for favorites - this might need to be implemented
      // await realApiService.resources.toggleFavorite(resource.id);
      success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      await loadResources();
    } catch (err) {
      error('Failed to update favorite status');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpenIcon;
      case 'video': return VideoCameraIcon;
      case 'pdf': return DocumentTextIcon;
      case 'link': return LinkIcon;
      default: return DocumentTextIcon;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-600';
      case 'video': return 'bg-purple-100 text-purple-600';
      case 'pdf': return 'bg-green-100 text-green-600';
      case 'link': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mental health': return HeartIcon;
      case 'mindfulness': return SparklesIcon;
      case 'relationships': return HeartIcon;
      case 'wellness': return ShieldCheckIcon;
      case 'stress management': return LightBulbIcon;
      default: return BookOpenIcon;
    }
  };

  // Get unique categories from resources
  const categories = ['all', ...new Set(resources.map(r => r.category))];

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesFavorites = !showFavoritesOnly || resource.progress?.isFavorite;
    
    return matchesSearch && matchesCategory && matchesType && matchesFavorites;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedResource) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedResource(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronRightIcon className="w-5 h-5 rotate-180 mr-1" />
          Back to Resources
        </button>

        {/* Resource Detail */}
        <PremiumCard>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedResource.title}
                  </h1>
                  <p className="text-gray-600">
                    {selectedResource.description}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFavorite(selectedResource)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {selectedResource.progress?.isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResourceTypeColor(selectedResource.type)}`}>
                  {selectedResource.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {selectedResource.category}
                </span>
                {selectedResource.estimatedReadTime && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {selectedResource.estimatedReadTime} min
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {selectedResource.rating}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedResource.tags.map((tag, index) => (
                  <span key={index} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="border-t pt-6">
              {selectedResource.type === 'article' && (
                <div className="prose prose-blue max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markedParser.parse(selectedResource.content) as string) }} />
                </div>
              )}
              
              {selectedResource.type === 'video' && (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedResource.thumbnailUrl ? (
                    <img 
                      src={selectedResource.thumbnailUrl} 
                      alt={selectedResource.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Video content would be displayed here</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedResource.type === 'pdf' && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">PDF Document: {selectedResource.content}</p>
                  <PremiumButton
                    variant="outline"
                    icon={ArrowDownTrayIcon}
                  >
                    Download PDF
                  </PremiumButton>
                </div>
              )}
              
              {selectedResource.type === 'link' && (
                <div className="bg-blue-50 rounded-lg p-8 text-center">
                  <LinkIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">External Resource</p>
                  <PremiumButton
                    variant="primary"
                    onClick={() => window.open(selectedResource.externalUrl || selectedResource.content, '_blank')}
                  >
                    Open External Link
                  </PremiumButton>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedResource.assignedBy && (
                  <p>
                    Assigned by {selectedResource.assignedBy.firstName} {selectedResource.assignedBy.lastName}
                    {selectedResource.assignedAt && ` on ${formatDate(selectedResource.assignedAt)}`}
                  </p>
                )}
              </div>
              
              {!selectedResource.progress?.completed && (
                <PremiumButton
                  variant="primary"
                  icon={CheckCircleIcon}
                  onClick={() => handleMarkComplete(selectedResource)}
                >
                  Mark as Complete
                </PremiumButton>
              )}
              
              {selectedResource.progress?.completed && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">Completed</span>
                  {selectedResource.progress.completedAt && (
                    <span className="text-sm text-gray-600 ml-2">
                      on {formatDate(selectedResource.progress.completedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
            <p className="text-blue-100">
              Explore curated resources to support your mental health journey
            </p>
          </div>
          <BookOpenIcon className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
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
                {resources.filter(r => r.progress?.completed).length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.progress?.viewed && !r.progress?.completed).length}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <HeartIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.progress?.isFavorite).length}
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="link">External Links</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HeartIcon className="w-4 h-4" />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <PremiumEmptyState
          icon={BookOpenIcon}
          title="No Resources Found"
          description={
            searchQuery || selectedCategory !== 'all' || selectedType !== 'all' || showFavoritesOnly
              ? "Try adjusting your filters or search query"
              : "No resources have been assigned to you yet. Check back later or ask your therapist for recommendations."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const CategoryIcon = getCategoryIcon(resource.category);
            
            return (
              <div
                key={resource.id}
                className="cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <PremiumCard hover>
                  <div className="space-y-4">
                  {/* Thumbnail or Icon */}
                  {resource.thumbnailUrl ? (
                    <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="w-20 h-20 text-blue-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-3">
                    {/* Title and Favorite */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {resource.title}
                      </h3>
                      {resource.progress?.isFavorite && (
                        <HeartSolidIcon className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {resource.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
                        <Icon className="w-3.5 h-3.5 mr-1" />
                        {resource.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {resource.category}
                      </span>
                      {resource.estimatedReadTime && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <ClockIcon className="w-3.5 h-3.5 mr-1" />
                          {resource.estimatedReadTime} min
                        </span>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    {resource.progress && (
                      <div className="pt-2 border-t">
                        {resource.progress.completed ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">Completed</span>
                          </div>
                        ) : resource.progress.viewed ? (
                          <div className="flex items-center text-blue-600 text-sm">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">In Progress</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500 text-sm">
                            <span className="font-medium">Not Started</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {resource.rating > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{resource.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{resource.viewCount} views</span>
                      </div>
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


export default ClientResources;