import React, { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  TagIcon,
  ScaleIcon,
  UsersIcon,
  ChartBarIcon
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

interface PsychologicalProblem {
  id: string;
  name: string;
  description: string;
  category: string;
  severity_levels: string[];
  symptoms: string[];
  treatments: string[];
  age_groups: string[];
  prevalence_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client_count?: number;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const PsychologicalProblemsManagementInline: React.FC = () => {
  const { success, error: errorAlert, warning } = useAlert();
  
  // State
  const [problems, setProblems] = useState<PsychologicalProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProblem, setSelectedProblem] = useState<PsychologicalProblem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mood',
    severity_levels: [] as string[],
    symptoms: [] as string[],
    treatments: [] as string[],
    age_groups: [] as string[],
    prevalence_rate: 0,
    is_active: true
  });

  // Load psychological problems
  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.getPsychologicalProblems();
      if (response.data) {
        setProblems(response.data);
      }
    } catch (error) {
      console.error('Failed to load psychological problems:', error);
      errorAlert('Failed to load psychological problems');
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
        const response = await realApiService.createPsychologicalProblem(formData);
        if (response.data) {
          success('Psychological problem created successfully');
        }
      } else if (viewMode === 'edit' && selectedProblem) {
        const response = await realApiService.updatePsychologicalProblem(selectedProblem.id, formData);
        if (response.data) {
          success('Psychological problem updated successfully');
        }
      }
      
      await loadProblems();
      handleCancel();
    } catch (error: any) {
      errorAlert(error.message || 'Failed to save psychological problem');
    }
  };

  // Handle delete
  const handleDelete = async (problemId: string) => {
    if (!window.confirm('Are you sure you want to delete this psychological problem?')) return;
    
    try {
      await realApiService.deletePsychologicalProblem(problemId);
      success('Psychological problem deleted successfully');
      await loadProblems();
    } catch (error) {
      errorAlert('Failed to delete psychological problem');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list');
    setSelectedProblem(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'mood',
      severity_levels: [],
      symptoms: [],
      treatments: [],
      age_groups: [],
      prevalence_rate: 0,
      is_active: true
    });
  };

  // Handle edit
  const handleEdit = (problem: PsychologicalProblem) => {
    setSelectedProblem(problem);
    setFormData({
      name: problem.name,
      description: problem.description,
      category: problem.category,
      severity_levels: problem.severity_levels,
      symptoms: problem.symptoms,
      treatments: problem.treatments,
      age_groups: problem.age_groups,
      prevalence_rate: problem.prevalence_rate || 0,
      is_active: problem.is_active
    });
    setViewMode('edit');
  };

  // Handle view details
  const handleViewDetails = (problem: PsychologicalProblem) => {
    setSelectedProblem(problem);
    setViewMode('detail');
  };

  // Filter problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = searchTerm === '' || 
      problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || problem.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Column definitions
  const columns = [
    {
      key: 'name',
      label: 'Problem',
      render: (problem: PsychologicalProblem) => (
        <div className="flex items-start space-x-3">
          <PuzzlePieceIcon className="w-5 h-5 mt-0.5 text-purple-600" />
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
      render: (problem: PsychologicalProblem) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {problem.category}
        </span>
      )
    },
    {
      key: 'symptoms',
      label: 'Symptoms',
      render: (problem: PsychologicalProblem) => (
        <div className="flex flex-wrap gap-1">
          {problem.symptoms.slice(0, 2).map((symptom, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {symptom}
            </span>
          ))}
          {problem.symptoms.length > 2 && (
            <span className="text-xs text-gray-500">+{problem.symptoms.length - 2}</span>
          )}
        </div>
      )
    },
    {
      key: 'prevalence',
      label: 'Prevalence',
      render: (problem: PsychologicalProblem) => (
        <div className="flex items-center text-sm text-gray-600">
          <ChartBarIcon className="w-4 h-4 mr-1" />
          {problem.prevalence_rate ? `${problem.prevalence_rate}%` : 'N/A'}
        </div>
      )
    },
    {
      key: 'clients',
      label: 'Clients',
      render: (problem: PsychologicalProblem) => (
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="w-4 h-4 mr-1" />
          {problem.client_count || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (problem: PsychologicalProblem) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          problem.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {problem.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Problem Name"
          name="name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          required
          placeholder="e.g., Depression"
        />
        
        <SelectField
          label="Category"
          name="category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={[
            { value: 'mood', label: 'Mood Disorders' },
            { value: 'anxiety', label: 'Anxiety Disorders' },
            { value: 'trauma', label: 'Trauma & Stress' },
            { value: 'personality', label: 'Personality Disorders' },
            { value: 'psychotic', label: 'Psychotic Disorders' },
            { value: 'neurodevelopmental', label: 'Neurodevelopmental' },
            { value: 'eating', label: 'Eating Disorders' },
            { value: 'substance', label: 'Substance Use' },
            { value: 'other', label: 'Other' }
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
        placeholder="Describe the psychological problem"
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberField
          label="Prevalence Rate (%)"
          name="prevalence_rate"
          value={formData.prevalence_rate}
          onChange={(value) => setFormData({ ...formData, prevalence_rate: value })}
          min={0}
          max={100}
          step={0.1}
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
        label="Severity Levels"
        name="severity_levels"
        value={formData.severity_levels}
        onChange={(value) => setFormData({ ...formData, severity_levels: value })}
        placeholder="Add severity levels..."
        suggestions={[
          'Mild',
          'Moderate',
          'Severe',
          'Very Severe',
          'Critical'
        ]}
      />

      <TagsField
        label="Common Symptoms"
        name="symptoms"
        value={formData.symptoms}
        onChange={(value) => setFormData({ ...formData, symptoms: value })}
        placeholder="Add common symptoms..."
        suggestions={[
          'Sadness',
          'Anxiety',
          'Fatigue',
          'Irritability',
          'Sleep problems',
          'Appetite changes',
          'Concentration issues',
          'Social withdrawal',
          'Panic attacks',
          'Flashbacks'
        ]}
      />

      <TagsField
        label="Treatment Options"
        name="treatments"
        value={formData.treatments}
        onChange={(value) => setFormData({ ...formData, treatments: value })}
        placeholder="Add treatment options..."
        suggestions={[
          'CBT',
          'EMDR',
          'Medication',
          'Group therapy',
          'Mindfulness',
          'Exposure therapy',
          'DBT',
          'Family therapy',
          'Psychoeducation'
        ]}
      />

      <TagsField
        label="Age Groups"
        name="age_groups"
        value={formData.age_groups}
        onChange={(value) => setFormData({ ...formData, age_groups: value })}
        placeholder="Add affected age groups..."
        suggestions={[
          'Children (5-12)',
          'Adolescents (13-17)',
          'Young Adults (18-25)',
          'Adults (26-64)',
          'Seniors (65+)'
        ]}
      />
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedProblem) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <PuzzlePieceIcon className="w-8 h-8 text-purple-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{selectedProblem.name}</h2>
            <p className="text-gray-600 mt-1">{selectedProblem.category} • {selectedProblem.prevalence_rate}% prevalence</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-900">{selectedProblem.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Severity Levels</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProblem.severity_levels.map((level, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  {level}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProblem.age_groups.map((age, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {age}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Common Symptoms</h3>
          <div className="flex flex-wrap gap-2">
            {selectedProblem.symptoms.map((symptom, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                {symptom}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Treatment Options</h3>
          <div className="flex flex-wrap gap-2">
            {selectedProblem.treatments.map((treatment, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {treatment}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedProblem.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Affected Clients</p>
            <p className="text-lg font-semibold text-gray-900">{selectedProblem.client_count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(selectedProblem.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Psychological Problems Management"
      subtitle="Manage psychological problems and conditions"
      icon={PuzzlePieceIcon}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Add Problem"
      totalCount={problems.length}
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
                    placeholder="Search psychological problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="mood">Mood Disorders</option>
                <option value="anxiety">Anxiety Disorders</option>
                <option value="trauma">Trauma & Stress</option>
                <option value="personality">Personality Disorders</option>
                <option value="psychotic">Psychotic Disorders</option>
                <option value="neurodevelopmental">Neurodevelopmental</option>
                <option value="eating">Eating Disorders</option>
                <option value="substance">Substance Use</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Problems List */}
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No psychological problems found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding a psychological problem'}
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
                  {filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(problem)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(problem)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(problem)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(problem.id)}
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              {viewMode === 'create' ? 'Create Problem' : 'Update Problem'}
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(selectedProblem!)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit Problem
            </button>
          </div>
        </div>
      )}
    </InlineCrudLayout>
  );
};

export default PsychologicalProblemsManagementInline;