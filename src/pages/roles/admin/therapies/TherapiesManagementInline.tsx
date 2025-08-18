import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  TagIcon,
  DocumentTextIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import {
  TextField,
  TextareaField,
  SelectField,
  TagsField,
  NumberField
} from '@/components/forms/FormFields';

interface Therapy {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  category: string;
  techniques: string[];
  conditions_treated: string[];
  age_groups: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  therapist_count?: number;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const TherapiesManagementInline: React.FC = () => {
  const { success, error: errorAlert, warning } = useAlert();
  
  // State
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTherapy, setSelectedTherapy] = useState<Therapy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 50,
    category: 'individual',
    techniques: [] as string[],
    conditions_treated: [] as string[],
    age_groups: [] as string[],
    is_active: true
  });

  // Load therapies
  useEffect(() => {
    loadTherapies();
  }, []);

  const loadTherapies = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getTherapies();
      if (response.data) {
        setTherapies(response.data);
      }
    } catch (error) {
      console.error('Failed to load therapies:', error);
      errorAlert('Failed to load therapies');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.description) {
        warning('Please fill in all required fields');
        return;
      }

      if (viewMode === 'create') {
        const response = await realApiService.admin.createTherapy(formData);
        if (response.data) {
          success('Therapy created successfully');
        }
      } else if (viewMode === 'edit' && selectedTherapy) {
        const response = await realApiService.admin.updateTherapy(selectedTherapy.id, formData);
        if (response.data) {
          success('Therapy updated successfully');
        }
      }
      
      await loadTherapies();
      handleCancel();
    } catch (error: any) {
      errorAlert(error.message || 'Failed to save therapy');
    }
  };

  // Handle delete
  const handleDelete = async (therapyId: string) => {
    if (!window.confirm('Are you sure you want to delete this therapy?')) return;
    
    try {
      await realApiService.admin.deleteTherapy(therapyId);
      success('Therapy deleted successfully');
      await loadTherapies();
    } catch (error) {
      errorAlert('Failed to delete therapy');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedTherapy(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 50,
      category: 'individual',
      techniques: [],
      conditions_treated: [],
      age_groups: [],
      is_active: true
    });
  };

  // Handle edit
  const handleEdit = (therapy: Therapy) => {
    setSelectedTherapy(therapy);
    setFormData({
      name: therapy.name,
      description: therapy.description,
      duration_minutes: therapy.duration_minutes,
      category: therapy.category,
      techniques: therapy.techniques,
      conditions_treated: therapy.conditions_treated,
      age_groups: therapy.age_groups,
      is_active: therapy.is_active
    });
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (therapy: Therapy) => {
    setSelectedTherapy(therapy);
    setViewMode('detail');
  };

  // Filter therapies
  const filteredTherapies = therapies.filter(therapy => {
    const matchesSearch = searchTerm === '' || 
      therapy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || therapy.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Column definitions
  const columns = [
    {
      key: 'name',
      label: 'Therapy',
      render: (therapy: Therapy) => (
        <div className="flex items-start space-x-3">
          <HeartIcon className="w-5 h-5 mt-0.5 text-pink-600" />
          <div>
            <p className="font-medium text-gray-900">{therapy.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{therapy.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (therapy: Therapy) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {therapy.category}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (therapy: Therapy) => (
        <span className="text-sm text-gray-900">{therapy.duration_minutes} min</span>
      )
    },
    {
      key: 'conditions',
      label: 'Conditions Treated',
      render: (therapy: Therapy) => (
        <div className="flex flex-wrap gap-1">
          {therapy.conditions_treated.slice(0, 3).map((condition, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {condition}
            </span>
          ))}
          {therapy.conditions_treated.length > 3 && (
            <span className="text-xs text-gray-500">+{therapy.conditions_treated.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: 'therapists',
      label: 'Therapists',
      render: (therapy: Therapy) => (
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 mr-1" />
          {therapy.therapist_count || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (therapy: Therapy) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          therapy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {therapy.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Therapy Name"
          name="name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          required
          placeholder="e.g., Cognitive Behavioral Therapy"
        />
        
        <SelectField
          label="Category"
          name="category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={[
            { value: 'individual', label: 'Individual Therapy' },
            { value: 'group', label: 'Group Therapy' },
            { value: 'couples', label: 'Couples Therapy' },
            { value: 'family', label: 'Family Therapy' },
            { value: 'online', label: 'Online Therapy' }
          ]}
          required
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        required
        placeholder="Describe the therapy approach and methodology"
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberField
          label="Duration (minutes)"
          name="duration_minutes"
          value={formData.duration_minutes}
          onChange={(value) => setFormData({ ...formData, duration_minutes: value })}
          min={15}
          max={180}
          step={15}
          required
        />

        <SelectField
          label="Status"
          name="is_active"
          value={formData.is_active ? 'active' : 'inactive'}
          onChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
      </div>

      <TagsField
        label="Techniques"
        name="techniques"
        value={formData.techniques}
        onChange={(value) => setFormData({ ...formData, techniques: value })}
        placeholder="Add therapy techniques..."
      />

      <TagsField
        label="Conditions Treated"
        name="conditions_treated"
        value={formData.conditions_treated}
        onChange={(value) => setFormData({ ...formData, conditions_treated: value })}
        placeholder="Add conditions this therapy can treat..."
      />

      <TagsField
        label="Age Groups"
        name="age_groups"
        value={formData.age_groups}
        onChange={(value) => setFormData({ ...formData, age_groups: value })}
        placeholder="Add suitable age groups..."
      />
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedTherapy) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <HeartIcon className="w-8 h-8 text-pink-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedTherapy.name}</h2>
            <p className="text-gray-600 mt-1">{selectedTherapy.category} therapy • {selectedTherapy.duration_minutes} minutes</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-900">{selectedTherapy.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Techniques</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTherapy.techniques.map((technique, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {technique}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTherapy.age_groups.map((age, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {age}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Conditions Treated</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTherapy.conditions_treated.map((condition, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {condition}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedTherapy.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Therapists Using</p>
            <p className="text-lg font-semibold text-gray-900">{selectedTherapy.therapist_count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(selectedTherapy.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Therapy Management"
      subtitle="Manage available therapy types and approaches"
      icon={HeartIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
          setViewMode(mode);
        }
      }}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Add Therapy"
      totalCount={therapies.length}
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
                    placeholder="Search therapies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">All Categories</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="couples">Couples</option>
                <option value="family">Family</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* Therapies List */}
          {filteredTherapies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No therapies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding a therapy type'}
              </p>
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
                  {filteredTherapies.map((therapy) => (
                    <tr key={therapy.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(therapy)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(therapy)}
                          className="text-pink-600 hover:text-pink-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(therapy)}
                          className="text-pink-600 hover:text-pink-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(therapy.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              {viewMode === 'create' ? 'Create Therapy' : 'Update Therapy'}
            </button>
          </div>
        </form>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && (
        <div className="space-y-6">
          {renderDetailView()}
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(selectedTherapy!)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit Therapy
            </button>
          </div>
        </div>
      )}
    </InlineCrudLayout>
  );
};

export default TherapiesManagementInline;