import React, { useState, useEffect, useMemo } from 'react';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate } from '@/utils/dateFormatters';
import {
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
  TagsField
} from '@/components/forms/FormFields';

// Types
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'document' | 'link' | 'exercise';
  category: string;
  contentBody?: string;
  url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  assignmentCount?: number;
  viewCount?: number;
  status: 'draft' | 'published' | 'archived';
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const TherapistResourcesManagementInline: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert } = useAlert();

  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'assign' | 'preview'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    description: '',
    type: 'article',
    category: 'mental_health',
    contentBody: '',
    url: '',
    difficulty: 'beginner',
    tags: [],
    isPublic: false,
    status: 'draft'
  });

  // Assignment state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState('');

  // Load data
  useEffect(() => {
    loadResources();
    loadClients();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.therapist.getResources();
      
      if (response.success && response.data) {
        const resourcesData = response.data.resources || response.data || [];
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      errorAlert('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await realApiService.therapist.getClients();
      if (response.success && response.data) {
        const clientsData = response.data as any;
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || resource.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || resource.difficulty === filterDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [resources, searchTerm, filterType, filterDifficulty]);

  // Handle create/update resource
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (viewMode === 'create') {
        // Ensure contentUrl is either a valid URL or undefined (not empty string)
        const contentUrl = formData.url?.trim();
        const isValidUrl = contentUrl && (contentUrl.startsWith('http://') || contentUrl.startsWith('https://'));

        const response = await realApiService.resources.createResource({
          title: formData.title || '',
          description: formData.description || '',
          type: formData.type || 'article',
          category: formData.category || 'mental_health',
          contentBody: formData.contentBody || '',
          contentUrl: isValidUrl ? contentUrl : undefined,
          difficulty: formData.difficulty || 'beginner',
          tags: formData.tags || [],
          isPublic: formData.isPublic !== false
        });
        
        if (response.success) {
          success('Resource created successfully');
          await loadResources();
          handleCancel();
        }
      } else if (viewMode === 'edit' && selectedResource) {
        // Ensure contentUrl is either a valid URL or undefined (not empty string)
        const contentUrl = formData.url?.trim() || selectedResource.url;
        const isValidUrl = contentUrl && (contentUrl.startsWith('http://') || contentUrl.startsWith('https://'));

        const response = await realApiService.resources.updateResource(selectedResource.id, {
          title: formData.title || selectedResource.title,
          description: formData.description || selectedResource.description,
          shortDescription: formData.description?.substring(0, 100) || selectedResource.description?.substring(0, 100),
          type: formData.type || selectedResource.type,
          category: formData.category || selectedResource.category,
          contentBody: formData.contentBody || selectedResource.contentBody,
          contentUrl: isValidUrl ? contentUrl : undefined,
          difficulty: formData.difficulty || selectedResource.difficulty,
          tags: formData.tags || selectedResource.tags,
          isPublic: formData.isPublic !== undefined ? formData.isPublic : selectedResource.isPublic,
          status: formData.status || selectedResource.status
        });
        
        if (response.success) {
          success('Resource updated successfully');
          await loadResources();
          handleCancel();
        }
      }
    } catch (error) {
      console.error('Failed to save resource:', error);
      errorAlert('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete resource
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await realApiService.resources.deleteResource(id);
      
      if (response.success) {
        success('Resource deleted successfully');
        await loadResources();
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      errorAlert('Failed to delete resource');
    }
  };

  // Handle assign resource
  const handleAssignResource = async () => {
    if (!selectedResource || !selectedClientId) {
      warning('Please select a client');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await realApiService.resources.assignResource(selectedResource.id, {
        clientId: selectedClientId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'normal',
        notes: assignmentNote
      });
      
      if (response.success) {
        success('Resource assigned successfully');
        handleCancel();
        await loadResources();
      }
    } catch (error) {
      console.error('Failed to assign resource:', error);
      errorAlert('Failed to assign resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedResource(null);
    setFormData({
      title: '',
      description: '',
      type: 'article',
      category: 'mental_health',
      contentBody: '',
      url: '',
      difficulty: 'beginner',
      tags: [],
      isPublic: false,
      status: 'draft'
    });
    setSelectedClientId('');
    setAssignmentNote('');
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

  // Handle view
  const handleView = (resource: Resource) => {
    setSelectedResource(resource);
    setViewMode('preview');
  };

  // Handle assign
  const handleAssign = (resource: Resource) => {
    setSelectedResource(resource);
    setSelectedClientId('');
    setAssignmentNote('');
    setViewMode('assign');
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return DocumentTextIcon;
      case 'video': return VideoCameraIcon;
      case 'document': return DocumentTextIcon;
      case 'link': return LinkIcon;
      case 'exercise': return BookOpenIcon;
      default: return DocumentTextIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'link': return 'bg-yellow-100 text-yellow-800';
      case 'exercise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Icon className="w-5 h-5 mt-0.5 text-teal-600" />
            <div>
              <p className="font-medium text-gray-900">{resource.title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {resource.description}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (resource: Resource) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
          {resource.type}
        </span>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (resource: Resource) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
          {resource.difficulty}
        </span>
      )
    },
    {
      key: 'assignments',
      label: 'Assignments',
      render: (resource: Resource) => (
        <div className="flex items-center text-sm text-gray-600">
          <UserPlusIcon className="w-4 h-4 mr-1" />
          {resource.assignmentCount || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (resource: Resource) => (
        <StatusBadge
          status={resource.status}
          type={resource.status === 'published' ? 'active' : 
                resource.status === 'archived' ? 'discontinued' : 'pending'}
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
          value={formData.title || ''}
          onChange={(value) => setFormData({ ...formData, title: value })}
          required
          placeholder="Enter resource title"
        />

        <SelectField
          label="Type"
          name="type"
          value={formData.type || 'article'}
          onChange={(value) => setFormData({ ...formData, type: value as any })}
          options={[
            { value: 'article', label: 'Article' },
            { value: 'video', label: 'Video' },
            { value: 'document', label: 'Document' },
            { value: 'link', label: 'Link' },
            { value: 'exercise', label: 'Exercise' }
          ]}
          required
        />

        <TextField
          label="Category"
          name="category"
          value={formData.category || ''}
          onChange={(value) => setFormData({ ...formData, category: value })}
          placeholder="e.g., anxiety, depression, mindfulness"
        />

        <SelectField
          label="Difficulty"
          name="difficulty"
          value={formData.difficulty || 'beginner'}
          onChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' }
          ]}
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Describe the resource..."
        rows={3}
      />

      {(formData.type === 'article' || formData.type === 'exercise' || formData.type === 'document') && (
        <TextareaField
          label="Content"
          name="contentBody"
          value={formData.contentBody || ''}
          onChange={(value) => setFormData({ ...formData, contentBody: value })}
          placeholder="Write your content here..."
          rows={10}
        />
      )}

      {(formData.type === 'video' || formData.type === 'link') && (
        <TextField
          label="URL"
          name="url"
          type="url"
          value={formData.url || ''}
          onChange={(value) => setFormData({ ...formData, url: value })}
          placeholder="https://..."
        />
      )}

      <TagsField
        label="Tags"
        name="tags"
        value={formData.tags || []}
        onChange={(tags) => setFormData({ ...formData, tags })}
        placeholder="Add tags..."
      />

      <div className="flex items-center space-x-6">
        <CheckboxField
          label="Make this resource public (visible to all clients)"
          name="isPublic"
          checked={formData.isPublic || false}
          onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status || 'draft'}
          onChange={(value) => setFormData({ ...formData, status: value as any })}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
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
          <Icon className="w-8 h-8 text-teal-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h2>
            <p className="text-gray-500 mt-1">{selectedResource.type} • {selectedResource.difficulty}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedResource.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(selectedResource.difficulty)}`}>
            {selectedResource.difficulty}
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
            {selectedResource.category}
          </span>
          {selectedResource.tags.map((tag, index) => (
            <span key={index} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        {selectedResource.contentBody && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans">{selectedResource.contentBody}</pre>
          </div>
        )}

        {selectedResource.url && (
          <div>
            <a
              href={selectedResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              Open Resource Link
            </a>
          </div>
        )}

        <div className="text-sm text-gray-500">
          {selectedResource.createdAt && (
            <p>Created: {formatDate(selectedResource.createdAt)}</p>
          )}
          <p>Assigned to {selectedResource.assignmentCount || 0} clients</p>
          <p>Viewed {selectedResource.viewCount || 0} times</p>
        </div>
      </div>
    );
  };

  // Render assignment view
  const renderAssignmentView = () => {
    if (!selectedResource) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Assigning Resource</h3>
          <p className="text-gray-600">{selectedResource.title}</p>
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

        <TextareaField
          label="Assignment Note (Optional)"
          name="assignmentNote"
          value={assignmentNote}
          onChange={(value) => setAssignmentNote(value)}
          rows={3}
          placeholder="Add a note for the client about this resource..."
        />

        <div className="flex justify-end space-x-3">
          <PremiumButton
            variant="outline"
            onClick={() => setViewMode('list')}
          >
            Cancel
          </PremiumButton>
          <PremiumButton
            variant="primary"
            onClick={handleAssignResource}
            disabled={!selectedClientId}
            loading={isSubmitting}
          >
            Assign Resource
          </PremiumButton>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Resource Management"
      subtitle="Create and manage therapeutic resources for your clients"
      icon={BookOpenIcon}
      viewMode={viewMode as any}
      onViewModeChange={setViewMode as any}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create Resource"
      totalCount={resources.length}
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
                    placeholder="Search resources..."
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
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="link">Links</option>
                  <option value="exercise">Exercises</option>
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources List */}
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterDifficulty !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating a new resource'}
              </p>
              {searchTerm === '' && filterType === 'all' && filterDifficulty === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create Resource
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
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(resource)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(resource)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAssign(resource)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="Assign to Client"
                        >
                          <UserPlusIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(resource)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        {resource.createdBy === user?.id && (
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
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
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
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
              {viewMode === 'create' ? 'Create Resource' : 'Update Resource'}
            </button>
          </div>
        </form>
      )}

      {/* Detail View */}
      {viewMode === 'preview' && (
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
              onClick={() => handleAssign(selectedResource!)}
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

export default TherapistResourcesManagementInline;