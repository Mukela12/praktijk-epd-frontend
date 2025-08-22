import React, { useState, useEffect, useMemo } from 'react';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  TagIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon
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
import type { Resource, ResourceType, ResourceCategory, ResourceDifficulty } from '@/types/resources';

const ResourcesManagement: React.FC = () => {
  const { success, error } = useAlert();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    description: '',
    short_description: '',
    type: 'article',
    category: 'anxiety',
    difficulty: 'beginner',
    content_url: '',
    content_body: '',
    duration_minutes: 0,
    tags: [],
    author_name: '',
    author_credentials: '',
    is_public: true,
    target_audience: 'all',
    specific_client_ids: [],
    status: 'draft'
  });

  // Load resources
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      // Use the working resources endpoint
      const response = await realApiService.resources.getResources();
      
      if (response.success && response.data) {
        const resourcesData = Array.isArray(response.data) ? response.data : response.data.resources || [];
        setResources(resourcesData);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (viewMode === 'create') {
        const response = await realApiService.resources.createResource({
          title: formData.title || '',
          description: formData.description || '',
          type: formData.type || 'article',
          category: formData.category || 'anxiety',
          contentBody: formData.content_body,
          contentUrl: formData.content_url,
          difficulty: formData.difficulty || 'beginner',
          tags: formData.tags || [],
          isPublic: formData.is_public ?? true,
          durationMinutes: formData.duration_minutes
        });
        if (response.success) {
          success('Resource created successfully');
          await loadResources();
          handleCancel();
        }
      } else if (viewMode === 'edit' && selectedResource) {
        const response = await realApiService.resources.updateResource(selectedResource.id, formData);
        if (response.success) {
          success('Resource updated successfully');
          await loadResources();
          handleCancel();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save resource');
    }
  };

  // Handle delete
  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await realApiService.resources.deleteResource(resourceId);
      success('Resource deleted successfully');
      await loadResources();
    } catch (err) {
      error('Failed to delete resource');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedResource(null);
    setFormData({
      title: '',
      description: '',
      short_description: '',
      type: 'article',
      category: 'anxiety',
      difficulty: 'beginner',
      content_url: '',
      content_body: '',
      duration_minutes: 0,
      tags: [],
      author_name: '',
      author_credentials: '',
      is_public: true,
      target_audience: 'all',
      specific_client_ids: [],
      status: 'draft'
    });
  };

  // Handle create
  const handleCreate = () => {
    setViewMode('create');
  };

  // Handle edit
  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData(resource);
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setViewMode('detail');
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
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

      // Category filter
      if (filterCategory !== 'all' && resource.category !== filterCategory) return false;
      
      // Type filter
      if (filterType !== 'all' && resource.type !== filterType) return false;
      
      // Status filter
      if (filterStatus !== 'all' && resource.status !== filterStatus) return false;

      return true;
    });
  }, [resources, searchTerm, filterCategory, filterType, filterStatus]);

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
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

  // Get color for resource type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-blue-600';
      case 'video': return 'text-purple-600';
      case 'pdf': return 'text-red-600';
      case 'audio': return 'text-yellow-600';
      case 'interactive': return 'text-green-600';
      case 'external': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Column definitions
  const columns = [
    {
      key: 'title',
      label: 'Resource',
      render: (resource: Resource) => {
        const Icon = getResourceIcon(resource.type);
        return (
          <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(resource.type)}`} />
            <div>
              <p className="font-medium text-gray-900">{resource.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {resource.short_description || resource.description}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (resource: Resource) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {resource.category.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (resource: Resource) => {
        const colors = {
          beginner: 'bg-green-100 text-green-800',
          intermediate: 'bg-yellow-100 text-yellow-800',
          advanced: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[resource.difficulty]}`}>
            {resource.difficulty}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (resource: Resource) => {
        const colors = {
          draft: 'bg-gray-100 text-gray-800',
          published: 'bg-green-100 text-green-800',
          archived: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[resource.status]}`}>
            {resource.status}
          </span>
        );
      }
    },
    {
      key: 'metrics',
      label: 'Metrics',
      render: (resource: Resource) => (
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            {resource.view_count}
          </span>
          {resource.duration_minutes && (
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {resource.duration_minutes}m
            </span>
          )}
        </div>
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
          placeholder="Enter resource title"
        />

        <SelectField
          label="Type"
          name="type"
          value={formData.type || 'article'}
          onChange={(value) => setFormData({ ...formData, type: value as Resource['type'] })}
          options={[
            { value: 'article', label: 'Article' },
            { value: 'video', label: 'Video' },
            { value: 'pdf', label: 'PDF' },
            { value: 'audio', label: 'Audio' },
            { value: 'interactive', label: 'Interactive' },
            { value: 'external', label: 'External Link' }
          ]}
          required
        />

        <SelectField
          label="Category"
          name="category"
          value={formData.category || 'anxiety'}
          onChange={(value) => setFormData({ ...formData, category: value as Resource['category'] })}
          options={[
            { value: 'anxiety', label: 'Anxiety' },
            { value: 'depression', label: 'Depression' },
            { value: 'stress', label: 'Stress' },
            { value: 'relationships', label: 'Relationships' },
            { value: 'trauma', label: 'Trauma' },
            { value: 'self_care', label: 'Self Care' },
            { value: 'mindfulness', label: 'Mindfulness' },
            { value: 'coping_skills', label: 'Coping Skills' }
          ]}
          required
        />

        <SelectField
          label="Difficulty"
          name="difficulty"
          value={formData.difficulty || 'beginner'}
          onChange={(value) => setFormData({ ...formData, difficulty: value as Resource['difficulty'] })}
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' }
          ]}
          required
        />

        <TextField
          label="Author Name"
          name="author_name"
          value={formData.author_name || ''}
          onChange={(value) => setFormData({ ...formData, author_name: value })}
          placeholder="Enter author name"
          required
        />

        <TextField
          label="Author Credentials"
          name="author_credentials"
          value={formData.author_credentials || ''}
          onChange={(value) => setFormData({ ...formData, author_credentials: value })}
          placeholder="e.g., PhD, LCSW"
        />

        <NumberField
          label="Duration (minutes)"
          name="duration_minutes"
          value={formData.duration_minutes || 0}
          onChange={(value) => setFormData({ ...formData, duration_minutes: value })}
          min={0}
          placeholder="Estimated time to complete"
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status || 'draft'}
          onChange={(value) => setFormData({ ...formData, status: value as Resource['status'] })}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>

      <TextareaField
        label="Short Description"
        name="short_description"
        value={formData.short_description || ''}
        onChange={(value) => setFormData({ ...formData, short_description: value })}
        placeholder="Brief summary for preview (max 500 characters)"
        rows={2}
      />

      <TextareaField
        label="Full Description"
        name="description"
        value={formData.description || ''}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Detailed description of the resource"
        rows={4}
      />

      {(formData.type === 'video' || formData.type === 'pdf' || formData.type === 'external') && (
        <TextField
          label="Content URL"
          name="content_url"
          type="url"
          value={formData.content_url || ''}
          onChange={(value) => setFormData({ ...formData, content_url: value })}
          placeholder="https://example.com/resource"
        />
      )}

      {(formData.type === 'article' || formData.type === 'interactive') && (
        <TextareaField
          label="Content Body"
          name="content_body"
          value={formData.content_body || ''}
          onChange={(value) => setFormData({ ...formData, content_body: value })}
          placeholder="Main content of the resource"
          rows={8}
        />
      )}

      <TagsField
        label="Tags"
        name="tags"
        value={formData.tags || []}
        onChange={(tags) => setFormData({ ...formData, tags })}
        placeholder="Add tags for better searchability"
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Visibility Settings</h3>
        
        <CheckboxField
          label="Public Resource"
          name="is_public"
          checked={formData.is_public || false}
          onChange={(checked) => setFormData({ ...formData, is_public: checked })}
          hint="Make this resource publicly accessible"
        />

        <SelectField
          label="Target Audience"
          name="target_audience"
          value={formData.target_audience || 'all'}
          onChange={(value) => setFormData({ ...formData, target_audience: value as Resource['target_audience'] })}
          options={[
            { value: 'all', label: 'All Users' },
            { value: 'clients', label: 'Clients Only' },
            { value: 'therapists', label: 'Therapists Only' },
            { value: 'specific', label: 'Specific Clients' }
          ]}
        />
      </div>
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedResource) return null;

    const Icon = getResourceIcon(selectedResource.type);

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Icon className={`w-8 h-8 ${getTypeColor(selectedResource.type)}`} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h2>
            <p className="text-gray-500 mt-1">By {selectedResource.author_name} {selectedResource.author_credentials && `(${selectedResource.author_credentials})`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium capitalize">{selectedResource.category.replace('_', ' ')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="font-medium capitalize">{selectedResource.difficulty}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{selectedResource.status}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedResource.description}</p>
        </div>

        {selectedResource.content_url && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content URL</h3>
            <a href={selectedResource.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {selectedResource.content_url}
            </a>
          </div>
        )}

        {selectedResource.content_body && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedResource.content_body}</p>
            </div>
          </div>
        )}

        {selectedResource.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedResource.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="w-4 h-4 mr-1" />
              Views
            </div>
            <p className="text-2xl font-bold text-gray-900">{selectedResource.view_count}</p>
          </div>
          {selectedResource.duration_minutes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                Duration
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedResource.duration_minutes} minutes</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>Created: {new Date(selectedResource.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(selectedResource.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Educational Resources"
      subtitle="Manage therapeutic content and educational materials"
      icon={BookOpenIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
          setViewMode(mode);
        }
      }}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create Resource"
      totalCount={resources.length}
      onBack={viewMode !== 'list' ? handleCancel : undefined}
    >
      {/* Todo: Implement resource list, form and detail views */}
      <div>Resource management content</div>
    </InlineCrudLayout>
  );
};

export default ResourcesManagement;
