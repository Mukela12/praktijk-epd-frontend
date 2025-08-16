import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  PuzzlePieceIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PuzzlePieceIcon as PuzzleSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DataTable } from '@/components/table/DataTable';
import { PremiumEmptyState } from '@/components/layout/PremiumLayout';

interface PsychologicalProblem {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PsychologicalProblemsManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, warning, confirm } = useAlert();
  
  // State
  const [problems, setProblems] = useState<PsychologicalProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'anxiety',
    severity: 'moderate' as 'mild' | 'moderate' | 'severe',
    isActive: true
  });

  // Categories for psychological problems
  const categories = [
    { value: 'anxiety', label: 'Anxiety Disorders' },
    { value: 'mood', label: 'Mood Disorders' },
    { value: 'trauma', label: 'Trauma & Stress' },
    { value: 'behavioral', label: 'Behavioral Issues' },
    { value: 'developmental', label: 'Developmental Disorders' },
    { value: 'addiction', label: 'Addiction & Substance Use' },
    { value: 'personality', label: 'Personality Disorders' },
    { value: 'eating', label: 'Eating Disorders' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'severe', label: 'Severe', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getPsychologicalProblems();
      
      if (response.success && response.data) {
        setProblems(response.data);
      }
    } catch (err) {
      error('Failed to load psychological problems');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      warning('Please enter a problem name');
      return;
    }

    try {
      if (editingId) {
        // Update existing problem
        const response = await realApiService.admin.updatePsychologicalProblem(editingId, formData);
        if (response.success) {
          success('Psychological problem updated successfully');
          setEditingId(null);
          resetForm();
          loadProblems();
        }
      } else {
        // Create new problem
        const response = await realApiService.admin.createPsychologicalProblem(formData);
        if (response.success) {
          success('Psychological problem created successfully');
          resetForm();
          loadProblems();
        }
      }
    } catch (err) {
      error(editingId ? 'Failed to update problem' : 'Failed to create problem');
    }
  };

  const handleEdit = (problem: PsychologicalProblem) => {
    setEditingId(problem.id);
    setFormData({
      name: problem.name,
      description: problem.description,
      category: problem.category,
      severity: problem.severity,
      isActive: problem.isActive
    });
  };

  const handleDelete = async (id: string) => {
    const result = await confirm({
      title: 'Delete Psychological Problem',
      message: 'Are you sure you want to delete this psychological problem? Therapists using this will need to update their profiles.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (result) {
      try {
        await realApiService.admin.deletePsychologicalProblem(id);
        success('Psychological problem deleted successfully');
        loadProblems();
      } catch (err) {
        error('Failed to delete psychological problem');
      }
    }
  };

  const handleToggleActive = async (problem: PsychologicalProblem) => {
    try {
      await realApiService.admin.updatePsychologicalProblem(problem.id, {
        ...problem,
        isActive: !problem.isActive
      });
      success(`Problem ${problem.isActive ? 'deactivated' : 'activated'} successfully`);
      loadProblems();
    } catch (err) {
      error('Failed to update problem status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'anxiety',
      severity: 'moderate',
      isActive: true
    });
    setEditingId(null);
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || problem.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || problem.severity === filterSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const columns = [
    {
      key: 'name',
      label: 'Hulpvraag (Problem)',
      sortable: true,
      render: (problem: PsychologicalProblem) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-sm">
            <PuzzleSolid className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{problem.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{problem.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (problem: PsychologicalProblem) => {
        const category = categories.find(c => c.value === problem.category);
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {category?.label || problem.category}
          </span>
        );
      }
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (problem: PsychologicalProblem) => {
        const severity = severityLevels.find(s => s.value === problem.severity);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${severity?.color}`}>
            {severity?.label || problem.severity}
          </span>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (problem: PsychologicalProblem) => (
        <button
          onClick={() => handleToggleActive(problem)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            problem.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {problem.isActive ? (
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
      render: (problem: PsychologicalProblem) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(problem)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit problem"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(problem.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete problem"
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
        {editingId ? 'Edit Hulpvraag' : 'Add New Hulpvraag'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Problem Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., ADD, Concentration Problems"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity Level
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'mild' | 'moderate' | 'severe' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {severityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description of the psychological problem..."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
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
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
        >
          {editingId ? 'Update Hulpvraag' : 'Add Hulpvraag'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <PuzzlePieceIcon className="w-8 h-8" />
              </div>
              Hulpvragen Management
            </h1>
            <p className="text-indigo-100 mt-2">
              Manage psychological problems that therapists can help with
            </p>
          </div>
          <ExclamationTriangleIcon className="w-16 h-16 text-white/20" />
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
                placeholder="Search psychological problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            {severityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
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
        ) : filteredProblems.length > 0 ? (
          <DataTable
            data={filteredProblems}
            columns={columns.map(col => ({
              key: col.key,
              title: col.label,
              sortable: col.sortable,
              render: col.render
            }))}
          />
        ) : (
          <PremiumEmptyState
            icon={PuzzlePieceIcon}
            title="No psychological problems found"
            description="Start by adding psychological problems that therapists can help with."
            action={{
              label: 'Add First Problem',
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

export default PsychologicalProblemsManagement;