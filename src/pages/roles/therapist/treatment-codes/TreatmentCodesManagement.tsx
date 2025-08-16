import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  CurrencyEuroIcon,
  ClockIcon,
  TagIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatCurrency, formatDate } from '@/utils/dateFormatters';
import { useApiWithErrorHandling } from '@/hooks/useApiWithErrorHandling';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons } from '@/components/crud/InlineCrudLayout';
import { TextField, TextareaField, SelectField, CheckboxField } from '@/components/forms/FormFields';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface TreatmentCode {
  id: string;
  code: string;
  description: string;
  duration_minutes: number;
  base_price: number;
  is_active: boolean;
  is_insurance_covered?: boolean;
  insurance_percentage?: number;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  last_used?: string;
  total_revenue?: number;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const TreatmentCodesManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert, confirm } = useAlert();

  // State
  const [treatmentCodes, setTreatmentCodes] = useState<TreatmentCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<TreatmentCode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    insurance: 'all'
  });

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    duration_minutes: 60,
    base_price: 0,
    is_active: true,
    is_insurance_covered: false,
    insurance_percentage: 0,
    category: 'individual',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Categories
  const categories = [
    { value: 'individual', label: 'Individual Therapy' },
    { value: 'couples', label: 'Couples Therapy' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'group', label: 'Group Therapy' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency Session' },
    { value: 'other', label: 'Other' }
  ];

  // API hooks
  const createTreatmentCodeApi = useApiWithErrorHandling(realApiService.billing.createTreatmentCode, {
    successMessage: 'Treatment code created successfully',
    errorMessage: 'Failed to create treatment code'
  });

  const updateTreatmentCodeApi = useApiWithErrorHandling(realApiService.billing.updateTreatmentCode, {
    successMessage: 'Treatment code updated successfully',
    errorMessage: 'Failed to update treatment code'
  });

  const deleteTreatmentCodeApi = useApiWithErrorHandling(realApiService.billing.deleteTreatmentCode, {
    successMessage: 'Treatment code deleted successfully',
    errorMessage: 'Failed to delete treatment code'
  });

  // Load treatment codes
  useEffect(() => {
    loadTreatmentCodes();
  }, []);

  const loadTreatmentCodes = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.billing.getTreatmentCodes();
      
      if (response.success && response.data) {
        const codes = response.data.treatmentCodes || response.data;
        setTreatmentCodes(codes);
      }
    } catch (error) {
      handleApiError(error);
      errorAlert('Failed to load treatment codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter treatment codes
  const filteredCodes = treatmentCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filters.status === 'all' ||
      (filters.status === 'active' && code.is_active) ||
      (filters.status === 'inactive' && !code.is_active);
    
    const matchesCategory = 
      filters.category === 'all' || code.category === filters.category;
    
    const matchesInsurance = 
      filters.insurance === 'all' ||
      (filters.insurance === 'covered' && code.is_insurance_covered) ||
      (filters.insurance === 'not_covered' && !code.is_insurance_covered);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesInsurance;
  });

  // Sort by usage count (most used first)
  const sortedCodes = filteredCodes.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    } else if (viewMode === 'create' && treatmentCodes.some(tc => tc.code === formData.code)) {
      errors.code = 'This code already exists';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.duration_minutes < 1) {
      errors.duration_minutes = 'Duration must be at least 1 minute';
    }

    if (formData.base_price < 0) {
      errors.base_price = 'Price cannot be negative';
    }

    if (formData.is_insurance_covered && (formData.insurance_percentage < 0 || formData.insurance_percentage > 100)) {
      errors.insurance_percentage = 'Insurance percentage must be between 0 and 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      warning('Please fix the form errors');
      return;
    }

    try {
      const codeData = {
        code: formData.code,
        description: formData.description,
        duration_minutes: formData.duration_minutes,
        base_price: formData.base_price,
        is_active: formData.is_active,
        is_insurance_covered: formData.is_insurance_covered,
        insurance_percentage: formData.is_insurance_covered ? formData.insurance_percentage : 0,
        category: formData.category,
        notes: formData.notes
      };

      if (viewMode === 'create') {
        await createTreatmentCodeApi.execute(codeData);
        await loadTreatmentCodes();
        setViewMode('list');
        resetForm();
      } else if (viewMode === 'edit' && selectedCode) {
        await updateTreatmentCodeApi.execute(selectedCode.id, codeData);
        await loadTreatmentCodes();
        setViewMode('list');
        setSelectedCode(null);
        resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle delete
  const handleDelete = async (codeId: string) => {
    const confirmed = await confirm({
      title: 'Delete Treatment Code',
      message: 'Are you sure you want to delete this treatment code? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await deleteTreatmentCodeApi.execute(codeId);
      await loadTreatmentCodes();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (code: TreatmentCode) => {
    try {
      await updateTreatmentCodeApi.execute(code.id, { is_active: !code.is_active });
      success(`Treatment code ${code.is_active ? 'deactivated' : 'activated'}`);
      await loadTreatmentCodes();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      duration_minutes: 60,
      base_price: 0,
      is_active: true,
      is_insurance_covered: false,
      insurance_percentage: 0,
      category: 'individual',
      notes: ''
    });
    setFormErrors({});
  };

  // Calculate statistics
  const statistics = {
    totalCodes: treatmentCodes.length,
    activeCodes: treatmentCodes.filter(c => c.is_active).length,
    insuranceCovered: treatmentCodes.filter(c => c.is_insurance_covered).length,
    totalRevenue: treatmentCodes.reduce((sum, code) => sum + (code.total_revenue || 0), 0)
  };

  // Render detail view
  const renderDetailView = () => {
    if (!selectedCode) return null;

    return (
      <div className="space-y-6">
        <PremiumCard>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCode.code} - {selectedCode.description}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge
                    type="active"
                    status={selectedCode.is_active ? 'active' : 'inactive'}
                  />
                  {selectedCode.is_insurance_covered && (
                    <StatusBadge
                      type="general"
                      status="Insurance Covered"
                    />
                  )}
                  <StatusBadge
                    type="general"
                    status={selectedCode.category || 'uncategorized'}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={PencilIcon}
                  onClick={() => {
                    setFormData({
                      code: selectedCode.code,
                      description: selectedCode.description,
                      duration_minutes: selectedCode.duration_minutes,
                      base_price: selectedCode.base_price,
                      is_active: selectedCode.is_active,
                      is_insurance_covered: selectedCode.is_insurance_covered || false,
                      insurance_percentage: selectedCode.insurance_percentage || 0,
                      category: selectedCode.category || 'individual',
                      notes: selectedCode.notes || ''
                    });
                    setViewMode('edit');
                  }}
                >
                  Edit
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={selectedCode.is_active ? ArchiveBoxIcon : CheckCircleIcon}
                  onClick={() => handleToggleActive(selectedCode)}
                >
                  {selectedCode.is_active ? 'Deactivate' : 'Activate'}
                </PremiumButton>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="font-medium text-gray-900">{selectedCode.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{selectedCode.duration_minutes} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Base Price</p>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedCode.base_price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Statistics */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Insurance & Usage</h3>
                <div className="space-y-3">
                  {selectedCode.is_insurance_covered && (
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Insurance Coverage</p>
                        <p className="font-medium text-gray-900">{selectedCode.insurance_percentage}%</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Usage Count</p>
                      <p className="font-medium text-gray-900">{selectedCode.usage_count || 0} times</p>
                    </div>
                  </div>
                  {selectedCode.last_used && (
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Used</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedCode.last_used)}</p>
                      </div>
                    </div>
                  )}
                  {selectedCode.total_revenue && (
                    <div className="flex items-center space-x-3">
                      <BanknotesIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="font-medium text-gray-900">{formatCurrency(selectedCode.total_revenue)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedCode.notes && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Notes</h3>
                <p className="text-gray-600">{selectedCode.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {formatDate(selectedCode.created_at)}</span>
                <span>Updated: {formatDate(selectedCode.updated_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <div className="flex justify-end space-x-3">
                <PremiumButton
                  variant="danger"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => handleDelete(selectedCode.id)}
                >
                  Delete Code
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    );
  };

  // Render form
  const renderForm = () => {
    const isEdit = viewMode === 'edit';

    return (
      <div className="space-y-6">
        <FormSection
          title="Basic Information"
          description="Enter the treatment code details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
              error={formErrors.code}
              disabled={isEdit}
              required
              placeholder="e.g., TC001"
            />
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={categories}
              required
            />
          </div>

          <TextareaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            error={formErrors.description}
            required
            rows={2}
            placeholder="Describe the treatment service"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) || 0 }))}
              error={formErrors.duration_minutes}
              required
              min="1"
            />
            <TextField
              label="Base Price (€)"
              name="base_price"
              type="number"
              value={formData.base_price.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, base_price: parseFloat(value) || 0 }))}
              error={formErrors.base_price}
              required
              min="0"
              step="0.01"
            />
          </div>
        </FormSection>

        <FormSection
          title="Insurance & Settings"
          description="Configure insurance coverage and status"
        >
          <CheckboxField
            label="Insurance Covered"
            name="is_insurance_covered"
            checked={formData.is_insurance_covered}
            onChange={(checked) => setFormData(prev => ({ ...prev, is_insurance_covered: checked }))}
            hint="Check if this treatment is covered by insurance"
          />

          {formData.is_insurance_covered && (
            <TextField
              label="Insurance Coverage Percentage"
              name="insurance_percentage"
              type="number"
              value={formData.insurance_percentage.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, insurance_percentage: parseInt(value) || 0 }))}
              error={formErrors.insurance_percentage}
              min="0"
              max="100"
              hint="Percentage covered by insurance (0-100)"
            />
          )}

          <CheckboxField
            label="Active"
            name="is_active"
            checked={formData.is_active}
            onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            hint="Inactive codes cannot be used for new appointments"
          />

          <TextareaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            rows={3}
            placeholder="Any additional notes or special instructions"
          />
        </FormSection>

        <ActionButtons
          onCancel={() => {
            setViewMode('list');
            setSelectedCode(null);
            resetForm();
          }}
          onSubmit={handleSubmit}
          submitText={isEdit ? 'Update Treatment Code' : 'Create Treatment Code'}
          isSubmitting={createTreatmentCodeApi.isLoading || updateTreatmentCodeApi.isLoading}
        />
      </div>
    );
  };

  // Render list
  const renderList = () => {
    if (sortedCodes.length === 0) {
      return (
        <PremiumEmptyState
          icon={ClipboardDocumentListIcon}
          title="No treatment codes found"
          description={searchTerm || filters.status !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Create your first treatment code to start billing"}
          action={{
            label: "Create Treatment Code",
            onClick: () => setViewMode('create')
          }}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCodes.map((code) => (
          <ListItemCard
            key={code.id}
            onClick={() => {
              setSelectedCode(code);
              setViewMode('detail');
            }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{code.code}</h3>
                  <p className="text-sm text-gray-600 mt-1">{code.description}</p>
                </div>
                <StatusBadge
                  type="active"
                  status={code.is_active ? 'active' : 'inactive'}
                  size="sm"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{code.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-gray-500">Base Price</p>
                  <p className="font-medium text-gray-900">{formatCurrency(code.base_price)}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  type="general"
                  status={code.category || 'uncategorized'}
                  size="sm"
                />
                {code.is_insurance_covered && (
                  <StatusBadge
                    type="general"
                    status={`${code.insurance_percentage}% covered`}
                    size="sm"
                  />
                )}
              </div>

              {/* Usage Stats */}
              {code.usage_count !== undefined && code.usage_count > 0 && (
                <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Used {code.usage_count} times</span>
                  {code.total_revenue && (
                    <span>{formatCurrency(code.total_revenue)} revenue</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-3 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCode(code);
                    setFormData({
                      code: code.code,
                      description: code.description,
                      duration_minutes: code.duration_minutes,
                      base_price: code.base_price,
                      is_active: code.is_active,
                      is_insurance_covered: code.is_insurance_covered || false,
                      insurance_percentage: code.insurance_percentage || 0,
                      category: code.category || 'individual',
                      notes: code.notes || ''
                    });
                    setViewMode('edit');
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(code);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {code.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(code.id);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </ListItemCard>
        ))}
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Treatment Codes"
      subtitle="Manage your billing codes and pricing"
      icon={ClipboardDocumentListIcon}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create Treatment Code"
      isLoading={isLoading}
      totalCount={treatmentCodes.length}
      onBack={viewMode !== 'list' ? () => {
        setViewMode('list');
        setSelectedCode(null);
        resetForm();
      } : undefined}
    >
      {viewMode === 'list' && (
        <>
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <select
                  value={filters.insurance}
                  onChange={(e) => setFilters(prev => ({ ...prev, insurance: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Insurance</option>
                  <option value="covered">Insurance Covered</option>
                  <option value="not_covered">Not Covered</option>
                </select>
              </>
            }
          />
          {renderList()}
        </>
      )}
      {(viewMode === 'create' || viewMode === 'edit') && renderForm()}
      {viewMode === 'detail' && renderDetailView()}
    </InlineCrudLayout>
  );
};

export default TreatmentCodesManagement;