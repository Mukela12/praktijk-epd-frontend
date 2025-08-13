import React, { useState, useEffect } from 'react';
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
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { resourcesApi, adminApi } from '@/services/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate } from '@/utils/dateFormatters';

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

const ResourcesManagementInline: React.FC = () => {
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
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    difficulty: 'all'
  });

  // Form state
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    description: '',
    type: 'article',
    category: 'general',
    contentBody: '',
    url: '',
    difficulty: 'beginner',
    tags: [],
    isPublic: true,
    status: 'draft'
  });

  // Assignment state
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [assignmentNote, setAssignmentNote] = useState('');

  // Load data
  useEffect(() => {
    loadResources();
    loadClients();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await resourcesApi.getResources();
      
      if (response.success && response.data) {
        setResources(response.data.resources || response.data || []);
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
      const response = await adminApi.getClients();
      if (response.success && response.data) {
        setClients(response.data.clients || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filters.type === 'all' || resource.type === filters.type;
    const matchesCategory = filters.category === 'all' || resource.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || resource.difficulty === filters.difficulty;
    
    return matchesSearch && matchesType && matchesCategory && matchesDifficulty;
  });

  // Handle form changes
  const handleFormChange = (field: keyof Resource, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle tags
  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  // Handle create resource
  const handleCreateResource = async () => {
    if (!formData.title || !formData.description) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      const response = await resourcesApi.createResource({
        ...formData,
        createdBy: user?.id || ''
      });
      
      if (response.success) {
        success('Resource created successfully');
        loadResources();
        setViewMode('list');
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create resource:', error);
      errorAlert('Failed to create resource');
    }
  };

  // Handle update resource
  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    
    try {
      const response = await resourcesApi.updateResource(selectedResource.id, formData);
      
      if (response.success) {
        success('Resource updated successfully');
        loadResources();
        setViewMode('list');
        setSelectedResource(null);
      }
    } catch (error) {
      console.error('Failed to update resource:', error);
      errorAlert('Failed to update resource');
    }
  };

  // Handle delete resource
  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await resourcesApi.deleteResource(id);
      
      if (response.success) {
        success('Resource deleted successfully');
        loadResources();
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      errorAlert('Failed to delete resource');
    }
  };

  // Handle assign resource
  const handleAssignResource = async () => {
    if (!selectedResource || selectedClients.length === 0) {
      warning('Please select at least one client');
      return;
    }

    try {
      // Assign to each selected client
      const promises = selectedClients.map(clientId =>
        resourcesApi.assignResource(selectedResource.id, {
          clientId,
          note: assignmentNote
        })
      );

      await Promise.all(promises);
      
      success(`Resource assigned to ${selectedClients.length} client(s)`);
      setViewMode('list');
      setSelectedResource(null);
      setSelectedClients([]);
      setAssignmentNote('');
    } catch (error) {
      console.error('Failed to assign resource:', error);
      errorAlert('Failed to assign resource');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'article',
      category: 'general',
      contentBody: '',
      url: '',
      difficulty: 'beginner',
      tags: [],
      isPublic: true,
      status: 'draft'
    });
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

  const getResourceTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      article: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      document: 'bg-green-100 text-green-800',
      link: 'bg-yellow-100 text-yellow-800',
      exercise: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <BookOpenIcon className="w-8 h-8 mr-3" />
              Resources Management
            </h1>
            <p className="text-blue-100 mt-1">
              Create and manage therapeutic resources for clients
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Total Resources</span>
              <span className="block text-xl font-bold">{resources.length}</span>
            </div>
            {viewMode === 'list' && (
              <PremiumButton
                onClick={() => {
                  setViewMode('create');
                  resetForm();
                }}
                className="bg-white text-blue-600 hover:bg-gray-50"
                icon={PlusIcon}
              >
                Create Resource
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
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="link">Links</option>
                  <option value="exercise">Exercises</option>
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredResources.length} of {resources.length} resources
              </div>
            </div>
          </PremiumCard>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <PremiumEmptyState
              icon={BookOpenIcon}
              title="No Resources Found"
              description={searchTerm || filters.type !== 'all' ? "No resources match your filters." : "Create your first resource to get started."}
              action={{
                label: 'Create Resource',
                onClick: () => setViewMode('create')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredResources.map((resource) => {
                const ResourceIcon = getResourceIcon(resource.type);
                
                return (
                  <PremiumCard key={resource.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                            <ResourceIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{resource.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                                {resource.difficulty}
                              </span>
                              <StatusBadge
                                type="general"
                                status={resource.status}
                                size="sm"
                              />
                              {resource.isPublic && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Public
                                </span>
                              )}
                            </div>
                            
                            {resource.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {resource.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{resource.assignmentCount || 0} assignments</span>
                              <span>{resource.viewCount || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedResource(resource);
                            setViewMode('preview');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            setSelectedResource(resource);
                            setSelectedClients([]);
                            setAssignmentNote('');
                            setViewMode('assign');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <UserPlusIcon className="w-4 h-4 mr-1" />
                          Assign
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={PencilIcon}
                          onClick={() => {
                            setSelectedResource(resource);
                            setFormData(resource);
                            setViewMode('edit');
                          }}
                        >
                          Edit
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={TrashIcon}
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
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
                {viewMode === 'create' ? 'Create New Resource' : 'Edit Resource'}
              </h2>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Resource title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type || 'article'}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., anxiety, depression, mindfulness"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty || 'beginner'}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the resource..."
                />
              </div>

              {(formData.type === 'article' || formData.type === 'exercise') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={formData.contentBody || ''}
                    onChange={(e) => handleFormChange('contentBody', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={10}
                    placeholder="Write your content here..."
                  />
                </div>
              )}

              {(formData.type === 'video' || formData.type === 'link') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => handleFormChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic || false}
                    onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Make this resource public</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
                  resetForm();
                }}
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="primary"
                icon={CheckCircleIcon}
                onClick={viewMode === 'create' ? handleCreateResource : handleUpdateResource}
              >
                {viewMode === 'create' ? 'Create Resource' : 'Update Resource'}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Assign View */}
      {viewMode === 'assign' && selectedResource && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Resource</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedResource.title}</p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
                  setSelectedClients([]);
                  setAssignmentNote('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Clients</label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {clients.map((client) => (
                  <label key={client.id} className="flex items-center py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(selectedClients.filter(id => id !== client.id));
                        }
                      }}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">({client.email})</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedClients.length} client(s) selected
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Note (Optional)</label>
              <textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Add a note for the clients about this resource..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
                  setSelectedClients([]);
                  setAssignmentNote('');
                }}
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="primary"
                icon={UserPlusIcon}
                onClick={handleAssignResource}
                disabled={selectedClients.length === 0}
              >
                Assign to {selectedClients.length} Client(s)
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && selectedResource && (
        <PremiumCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Resource Preview</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedResource.type}</p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h3>
                <p className="text-gray-600 mt-2">{selectedResource.description}</p>
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
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {selectedResource.contentBody}
                  </div>
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
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedResource(null);
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

export default ResourcesManagementInline;