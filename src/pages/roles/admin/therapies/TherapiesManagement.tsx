import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DataTable } from '@/components/table/DataTable';
import { PremiumEmptyState } from '@/components/layout/PremiumLayout';

interface Therapy {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TherapiesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, warning, confirm } = useAlert();
  
  // State
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'behavioral',
    isActive: true
  });

  // Categories for therapies
  const categories = [
    { value: 'behavioral', label: 'Behavioral Therapy' },
    { value: 'cognitive', label: 'Cognitive Therapy' },
    { value: 'psychodynamic', label: 'Psychodynamic Therapy' },
    { value: 'integrative', label: 'Integrative Therapy' },
    { value: 'specialized', label: 'Specialized Therapy' }
  ];

  useEffect(() => {
    loadTherapies();
  }, []);

  const loadTherapies = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getTherapies();
      
      if (response.success && response.data) {
        setTherapies(response.data);
      }
    } catch (err) {
      error('Failed to load therapies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      warning('Please enter a therapy name');
      return;
    }

    try {
      if (editingId) {
        // Update existing therapy
        const response = await realApiService.admin.updateTherapy(editingId, formData);
        if (response.success) {
          success('Therapy updated successfully');
          setEditingId(null);
          resetForm();
          loadTherapies();
        }
      } else {
        // Create new therapy
        const response = await realApiService.admin.createTherapy(formData);
        if (response.success) {
          success('Therapy created successfully');
          resetForm();
          loadTherapies();
        }
      }
    } catch (err) {
      error(editingId ? 'Failed to update therapy' : 'Failed to create therapy');
    }
  };

  const handleEdit = (therapy: Therapy) => {
    setEditingId(therapy.id);
    setFormData({
      name: therapy.name,
      description: therapy.description,
      category: therapy.category,
      isActive: therapy.isActive
    });
  };

  const handleDelete = async (id: string) => {
    const result = await confirm({
      title: 'Delete Therapy',
      message: 'Are you sure you want to delete this therapy? Therapists using this therapy will need to update their profiles.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (result) {
      try {
        await realApiService.admin.deleteTherapy(id);
        success('Therapy deleted successfully');
        loadTherapies();
      } catch (err) {
        error('Failed to delete therapy');
      }
    }
  };

  const handleToggleActive = async (therapy: Therapy) => {
    try {
      await realApiService.admin.updateTherapy(therapy.id, {
        ...therapy,
        isActive: !therapy.isActive
      });
      success(`Therapy ${therapy.isActive ? 'deactivated' : 'activated'} successfully`);
      loadTherapies();
    } catch (err) {
      error('Failed to update therapy status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'behavioral',
      isActive: true
    });
    setEditingId(null);
  };

  const filteredTherapies = therapies.filter(therapy => {
    const matchesSearch = therapy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || therapy.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: 'name',
      label: 'Therapy Name',
      sortable: true,
      render: (therapy: Therapy) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
            <HeartSolid className="w-5 h-5 text-white" />
          </div>
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
      sortable: true,
      render: (therapy: Therapy) => {
        const category = categories.find(c => c.value === therapy.category);
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {category?.label || therapy.category}
          </span>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (therapy: Therapy) => (
        <button
          onClick={() => handleToggleActive(therapy)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            therapy.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {therapy.isActive ? (
            <>
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XMarkIcon className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (therapy: Therapy) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(therapy)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit therapy"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(therapy.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete therapy"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const renderForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingId ? 'Edit Therapy' : 'Add New Therapy'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Therapy Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Cognitive Behavioral Therapy (CBT)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Brief description of the therapy approach..."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Active (available for therapists to select)
            </span>
          </label>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={resetForm}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm"
        >
          {editingId ? 'Update Therapy' : 'Add Therapy'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <HeartIcon className="w-8 h-8" />
              </div>
              Therapieën Management
            </h1>
            <p className="text-purple-100 mt-2">
              Manage the list of available therapies for therapists to choose from
            </p>
          </div>
          <SparklesIcon className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {renderForm()}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search therapies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredTherapies.length > 0 ? (
          <DataTable
            data={filteredTherapies}
            columns={columns.map(col => ({
              key: col.key,
              title: col.label,
              sortable: col.sortable,
              render: col.render
            }))}
          />
        ) : (
          <PremiumEmptyState
            icon={HeartIcon}
            title="No therapies found"
            description="Start by adding your first therapy type."
            action={{
              label: 'Add First Therapy',
              onClick: () => {
                resetForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TherapiesManagement;