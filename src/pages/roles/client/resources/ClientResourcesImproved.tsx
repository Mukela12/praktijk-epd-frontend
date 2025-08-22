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
  SparklesIcon,
  PlayIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TagIcon,
  EyeIcon,
  CalendarIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon, CheckCircleIcon as CheckCircleSolidIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatters';
import PageTransition from '@/components/ui/PageTransition';

interface Resource {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  type: 'article' | 'video' | 'document' | 'link' | 'exercise';
  tags: string[];
  viewCount?: number;
  rating?: number;
  createdAt: string;
  assignedAt?: string;
  assignedBy?: {
    first_name: string;
    last_name: string;
  };
  progress?: {
    viewed: boolean;
    viewedAt?: string;
    completed: boolean;
    completedAt?: string;
    timeSpent?: number;
    isFavorite?: boolean;
    rating?: number;
  };
  estimatedReadTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  thumbnailUrl?: string;
}

// Template resources for fallback
const templateResources: Resource[] = [
  {
    id: 'template-1',
    title: 'Managing Anxiety: A Comprehensive Guide',
    description: 'Learn effective techniques to manage anxiety and improve your mental well-being through proven strategies.',
    content: `<h2>Understanding Anxiety</h2>
<p>Anxiety is a natural response to stress, but when it becomes overwhelming, it can interfere with daily life. This guide will help you understand and manage anxiety effectively.</p>

<h3>Common Symptoms</h3>
<ul>
  <li>Racing thoughts</li>
  <li>Physical tension</li>
  <li>Difficulty concentrating</li>
  <li>Sleep disturbances</li>
</ul>

<h3>Coping Strategies</h3>
<p><strong>1. Deep Breathing:</strong> Practice the 4-7-8 breathing technique. Inhale for 4 counts, hold for 7, exhale for 8.</p>
<p><strong>2. Grounding Techniques:</strong> Use the 5-4-3-2-1 method to stay present.</p>
<p><strong>3. Regular Exercise:</strong> Physical activity releases endorphins and reduces stress hormones.</p>
<p><strong>4. Mindfulness:</strong> Practice being present without judgment.</p>`,
    category: 'Mental Health',
    type: 'article',
    tags: ['anxiety', 'mental health', 'coping strategies'],
    viewCount: 1247,
    rating: 4.8,
    createdAt: new Date().toISOString(),
    estimatedReadTime: 10,
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=250&fit=crop'
  },
  {
    id: 'template-2',
    title: 'Mindfulness Meditation for Beginners',
    description: 'A step-by-step video guide to starting your mindfulness meditation practice.',
    category: 'Mindfulness',
    type: 'video',
    tags: ['mindfulness', 'meditation', 'stress relief'],
    viewCount: 892,
    rating: 4.9,
    createdAt: new Date().toISOString(),
    estimatedReadTime: 15,
    difficulty: 'beginner',
    url: 'https://www.youtube.com/embed/ssss7V1_eyA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop'
  },
  {
    id: 'template-3',
    title: 'Building Healthy Relationships',
    description: 'Essential guide for developing and maintaining healthy relationships in your life.',
    content: `<h2>The Foundation of Healthy Relationships</h2>
<p>Healthy relationships are built on mutual respect, trust, and open communication.</p>

<h3>Key Components</h3>
<ul>
  <li><strong>Communication:</strong> Express your needs clearly and listen actively</li>
  <li><strong>Boundaries:</strong> Set and respect personal limits</li>
  <li><strong>Trust:</strong> Build reliability through consistent actions</li>
  <li><strong>Support:</strong> Be there for each other during challenges</li>
</ul>`,
    category: 'Relationships',
    type: 'article',
    tags: ['relationships', 'communication', 'boundaries'],
    viewCount: 654,
    rating: 4.7,
    createdAt: new Date().toISOString(),
    estimatedReadTime: 8,
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&h=250&fit=crop'
  },
  {
    id: 'template-4',
    title: 'Sleep Hygiene Checklist',
    description: 'Improve your sleep quality with this comprehensive checklist and guide.',
    category: 'Wellness',
    type: 'document',
    tags: ['sleep', 'wellness', 'health'],
    viewCount: 445,
    rating: 4.6,
    createdAt: new Date().toISOString(),
    estimatedReadTime: 5,
    difficulty: 'beginner',
    content: `<h2>Sleep Hygiene Checklist</h2>
<p>Follow these guidelines for better sleep:</p>
<ul>
  <li>☐ Keep a consistent sleep schedule</li>
  <li>☐ Create a relaxing bedtime routine</li>
  <li>☐ Keep your bedroom cool and dark</li>
  <li>☐ Avoid screens 1 hour before bed</li>
  <li>☐ Limit caffeine after 2 PM</li>
  <li>☐ Exercise regularly (but not too late)</li>
</ul>`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400&h=250&fit=crop'
  }
];

const ClientResourcesImproved: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert } = useAlert();

  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'recommended'>('recommended');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  // Load resources
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      // Use the client resources endpoint
      const response = await realApiService.client.getResources();
      
      if (response.success && response.data) {
        const resourcesData = response.data.resources || response.data || [];
        const apiResources = Array.isArray(resourcesData) ? resourcesData : [];
        
        // Format API resources to match our interface
        const formattedResources = apiResources.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: resource.type || 'article',
          category: resource.category || 'general',
          content: resource.content_body || resource.content || '',
          url: resource.content_url || resource.url,
          tags: resource.tags || [],
          createdAt: resource.assigned_at || resource.created_at || new Date().toISOString(),
          assignedAt: resource.assigned_at,
          dueDate: resource.due_date,
          assignmentNotes: resource.assignment_notes,
          progress: {
            viewed: !!resource.completed_at,
            completed: !!resource.completed_at,
            isFavorite: false,
            timeSpent: 0,
            rating: undefined
          },
          viewCount: 0,
          estimatedReadTime: Math.ceil((resource.content_body || '').split(' ').length / 200) // Estimate based on 200 words per minute
        }));
        
        // Only use real data, no template resources
        setResources(formattedResources);
      } else {
        // Empty array if no data
        setResources([]);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      errorAlert('Failed to load resources. Please try again later.');
      // Empty array on error
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Track resource view/completion
  const trackResourceEngagement = async (resourceId: string, action: 'view' | 'complete', rating?: number) => {
    // Update local state immediately for better UX
    setResources(prev => prev.map(resource => {
      if (resource.id === resourceId) {
        return {
          ...resource,
          progress: {
            viewed: true,
            completed: action === 'complete' || resource.progress?.completed || false,
            timeSpent: 0,
            isFavorite: resource.progress?.isFavorite || false,
            ...resource.progress,
            rating: rating || resource.progress?.rating
          }
        };
      }
      return resource;
    }));

    if (action === 'complete') {
      if (rating) {
        success(`Thank you for rating this resource ${rating} star${rating > 1 ? 's' : ''}!`);
      } else {
        success('Resource marked as completed!');
      }
    }

    // Skip API call for template resources
    if (resourceId.startsWith('template-')) {
      return;
    }

    try {
      await realApiService.resources.trackEngagement(resourceId, {
        action,
        timeSpent: action === 'view' ? 60 : 300,
        completed: action === 'complete',
        rating
      });
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const newFavoriteStatus = !resource.progress?.isFavorite;
    
    // Update local state immediately
    setResources(prev => prev.map(r => {
      if (r.id === resourceId) {
        return {
          ...r,
          progress: {
            viewed: r.progress?.viewed || false,
            completed: r.progress?.completed || false,
            timeSpent: r.progress?.timeSpent || 0,
            ...r.progress,
            isFavorite: newFavoriteStatus
          }
        };
      }
      return r;
    }));

    // Show notification
    if (newFavoriteStatus) {
      success(`Added "${resource.title}" to your favorites!`);
    } else {
      success(`Removed "${resource.title}" from your favorites.`);
    }

    // Skip API call for template resources
    if (resourceId.startsWith('template-')) {
      return;
    }

    // Then update backend
    try {
      await realApiService.resources.updateProgress(resourceId, {
        isFavorite: newFavoriteStatus
      });
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      errorAlert('Failed to update favorite status. Please try again.');
    }
  };

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpenIcon;
      case 'video': return VideoCameraIcon;
      case 'document': return DocumentTextIcon;
      case 'link': return LinkIcon;
      case 'exercise': return LightBulbIcon;
      default: return DocumentTextIcon;
    }
  };

  // Get color for resource type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'video': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'document': return 'bg-green-100 text-green-700 border-green-200';
      case 'link': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'exercise': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      anxiety: 'bg-indigo-100 text-indigo-700',
      depression: 'bg-blue-100 text-blue-700',
      stress: 'bg-red-100 text-red-700',
      mindfulness: 'bg-green-100 text-green-700',
      relationships: 'bg-pink-100 text-pink-700',
      'self-care': 'bg-purple-100 text-purple-700',
      default: 'bg-gray-100 text-gray-700'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
    
    // Type filter
    if (selectedType !== 'all' && resource.type !== selectedType) return false;
    
    // Favorites filter
    if (showOnlyFavorites && !resource.progress?.isFavorite) return false;
    
    // Completed filter
    if (showOnlyCompleted && !resource.progress?.completed) return false;

    return true;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'recommended':
        // Prioritize assigned resources, then unviewed, then by date
        if (a.assignedAt && !b.assignedAt) return -1;
        if (!a.assignedAt && b.assignedAt) return 1;
        if (!a.progress?.viewed && b.progress?.viewed) return -1;
        if (a.progress?.viewed && !b.progress?.viewed) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Get unique categories
  const categories = Array.from(new Set(resources.map(r => r.category))).sort();

  // Calculate stats
  const stats = {
    total: resources.length,
    completed: resources.filter(r => r.progress?.completed).length,
    inProgress: resources.filter(r => r.progress?.viewed && !r.progress?.completed).length,
    favorites: resources.filter(r => r.progress?.isFavorite).length
  };

  // Render resource card
  const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const Icon = getResourceIcon(resource.type);
    const isCompleted = resource.progress?.completed;
    const isFavorite = resource.progress?.isFavorite;
    const isViewed = resource.progress?.viewed;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Card Header */}
        <div className="relative">
          {resource.thumbnailUrl ? (
            <img 
              src={resource.thumbnailUrl} 
              alt={resource.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className={`h-48 flex items-center justify-center ${getTypeColor(resource.type).split(' ')[0]}`}>
              <Icon className="w-16 h-16 text-white/20" />
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)} backdrop-blur-sm`}>
              <Icon className="w-3.5 h-3.5 mr-1" />
              {resource.type}
            </span>
            {resource.difficulty && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)} backdrop-blur-sm`}>
                {resource.difficulty}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(resource.id);
            }}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Progress indicator */}
          {isCompleted && (
            <div className="absolute bottom-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {resource.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {resource.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              {resource.estimatedReadTime && (
                <span className="flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1" />
                  {resource.estimatedReadTime} min
                </span>
              )}
              {resource.viewCount !== undefined && (
                <span className="flex items-center">
                  <EyeIcon className="w-3.5 h-3.5 mr-1" />
                  {resource.viewCount} views
                </span>
              )}
            </div>
            {resource.assignedAt && (
              <span className="text-blue-600 font-medium">
                Assigned
              </span>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
              {resource.category}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedResource(resource);
                trackResourceEngagement(resource.id, 'view');
              }}
              className="flex-1 mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center"
            >
              {resource.type === 'video' ? (
                <>
                  <PlayIcon className="w-4 h-4 mr-1.5" />
                  Watch
                </>
              ) : (
                <>
                  <BookOpenIcon className="w-4 h-4 mr-1.5" />
                  Read
                </>
              )}
            </button>
            
            {!isCompleted && isViewed && (
              <button
                onClick={() => trackResourceEngagement(resource.id, 'complete')}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render resource detail modal
  const ResourceDetailModal: React.FC = () => {
    if (!selectedResource) return null;

    const Icon = getResourceIcon(selectedResource.type);

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fadeIn">
        {/* Professional Article Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/95">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(selectedResource.type).split(' ')[0]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {selectedResource.type.charAt(0).toUpperCase() + selectedResource.type.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleFavorite(selectedResource.id)}
                className={`p-2 rounded-lg transition-all ${
                  selectedResource.progress?.isFavorite
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {selectedResource.progress?.isFavorite ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Article Header */}
          <header className="mb-12">
            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedResource.category)}`}>
                {selectedResource.category}
              </span>
              {selectedResource.difficulty && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedResource.difficulty)}`}>
                  {selectedResource.difficulty}
                </span>
              )}
              {selectedResource.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {selectedResource.title}
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {selectedResource.description}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
              {selectedResource.estimatedReadTime && (
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>{selectedResource.estimatedReadTime} min read</span>
                </div>
              )}
              {selectedResource.createdAt && (
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{new Date(selectedResource.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {selectedResource.viewCount && (
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  <span>{selectedResource.viewCount} views</span>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main>
            {selectedResource.type === 'video' && selectedResource.url ? (
              <div className="mb-12">
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={selectedResource.url}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedResource.title}
                  />
                </div>
              </div>
            ) : selectedResource.content ? (
              <div className="prose prose-xl prose-gray max-w-none">
                <style dangerouslySetInnerHTML={{ __html: `
                  .prose {
                    color: #374151;
                  }
                  .prose h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #111827;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    line-height: 1.2;
                  }
                  .prose h2 { 
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-top: 3rem; 
                    margin-bottom: 1.5rem;
                    line-height: 1.3;
                  }
                  .prose h3 { 
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #374151;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    line-height: 1.4;
                  }
                  .prose p { 
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #4b5563;
                    margin-bottom: 1.5rem;
                  }
                  .prose ul, .prose ol { 
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #4b5563;
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                  }
                  .prose li { 
                    margin-bottom: 0.75rem;
                  }
                  .prose strong { 
                    color: #1f2937;
                    font-weight: 700;
                  }
                  .prose blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1.5rem;
                    margin: 2rem 0;
                    font-style: italic;
                    color: #6b7280;
                  }
                  .prose code {
                    background-color: #f3f4f6;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    color: #1f2937;
                  }
                  .prose pre {
                    background-color: #1f2937;
                    color: #f3f4f6;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 2rem 0;
                  }
                  .prose img {
                    border-radius: 0.5rem;
                    margin: 2rem 0;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  }
                  .prose a {
                    color: #3b82f6;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    transition: color 0.2s;
                  }
                  .prose a:hover {
                    color: #2563eb;
                  }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: selectedResource.content }} />
              </div>
            ) : selectedResource.url ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LinkIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">External Resource</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">This resource is available on an external website.</p>
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
                >
                  Open External Resource
                  <ArrowRightIcon className="w-5 h-5 ml-3" />
                </a>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg text-gray-500">No content available for this resource.</p>
              </div>
            )}
          </main>

          {/* Article Footer */}
          <footer className="mt-16 pt-12 border-t border-gray-200">
            <div className="space-y-8">
              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 mr-2">Rate this resource:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => trackResourceEngagement(selectedResource.id, 'complete', star)}
                          className="p-1.5 hover:scale-110 transition-transform"
                        >
                          {star <= (selectedResource.progress?.rating || 0) ? (
                            <StarSolidIcon className="w-6 h-6 text-yellow-400" />
                          ) : (
                            <StarIcon className="w-6 h-6 text-gray-300 hover:text-yellow-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Close
                  </button>
                  {!selectedResource.progress?.completed && (
                    <button
                      onClick={() => {
                        trackResourceEngagement(selectedResource.id, 'complete');
                        setSelectedResource(null);
                      }}
                      className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                      Mark as Complete
                    </button>
                  )}
                  {selectedResource.progress?.completed && (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircleSolidIcon className="w-6 h-6 mr-2" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </footer>
        </article>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BookOpenIcon className="w-8 h-8 mr-3" />
                Learning Resources
              </h1>
              <p className="text-blue-100">
                Explore resources recommended by your therapist to support your wellness journey
              </p>
            </div>
            <div className="hidden md:block">
              <SparklesIcon className="w-24 h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Favorites</p>
                <p className="text-2xl font-bold text-red-600">{stats.favorites}</p>
              </div>
              <HeartIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="link">Links</option>
                <option value="exercise">Exercises</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* Quick Filters */}
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOnlyFavorites
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HeartIcon className="w-4 h-4 inline mr-1" />
                Favorites
              </button>

              <button
                onClick={() => setShowOnlyCompleted(!showOnlyCompleted)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOnlyCompleted
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        {sortedResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back later for new resources from your therapist'}
              </p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {sortedResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        {/* Resource Detail Modal */}
        <ResourceDetailModal />
      </div>
    </PageTransition>
  );
};

export default ClientResourcesImproved;