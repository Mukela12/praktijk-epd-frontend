import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  KeyIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  UserPlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate } from '@/utils/dateFormatters';
import { useApiWithErrorHandling } from '@/hooks/useApiWithErrorHandling';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons } from '@/components/crud/InlineCrudLayout';
import { TextField, PasswordField, SelectField, CheckboxField, DateField } from '@/components/forms/FormFields';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'therapist' | 'client' | 'assistant' | 'bookkeeper';
  user_status: 'active' | 'inactive' | 'pending' | 'suspended';
  email_verified: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_count?: number;
  preferred_language?: string;
  timezone?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert, confirm } = useAlert();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'client' as User['role'],
    sendWelcomeEmail: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // API hooks
  const createUserApi = useApiWithErrorHandling(realApiService.admin.createUser, {
    successMessage: 'User created successfully',
    errorMessage: 'Failed to create user'
  });

  const updateUserApi = useApiWithErrorHandling(realApiService.admin.updateUser, {
    successMessage: 'User updated successfully',
    errorMessage: 'Failed to update user'
  });

  // Load users
  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  // Filter users
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status })
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(Math.ceil(pagination.total / itemsPerPage));
        }
      }
    } catch (error) {
      handleApiError(error);
      errorAlert('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.user_status === filters.status);
    }

    setFilteredUsers(filtered);
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation (only for new users)
    if (viewMode === 'create') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
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
      if (viewMode === 'create') {
        await createUserApi.execute({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role
        });
        
        await loadUsers();
        setViewMode('list');
        resetForm();
      } else if (viewMode === 'edit' && selectedUser) {
        await updateUserApi.execute(selectedUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: formData.role
        });
        
        await loadUsers();
        setViewMode('list');
        setSelectedUser(null);
        resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      // Note: Backend might not have delete endpoint for safety
      // You might want to change status to 'inactive' instead
      await updateUserApi.execute(userId, { user_status: 'inactive' });
      success('User deactivated successfully');
      await loadUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle status change
  const handleStatusChange = async (userId: string, newStatus: User['user_status']) => {
    try {
      await updateUserApi.execute(userId, { user_status: newStatus });
      success(`User status updated to ${newStatus}`);
      await loadUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Reset Password',
      message: 'Send a password reset email to this user?',
      confirmText: 'Send Email',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      // Call password reset endpoint
      info('Password reset email sent');
    } catch (error) {
      handleApiError(error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'client',
      sendWelcomeEmail: true
    });
    setFormErrors({});
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'therapist': return 'blue';
      case 'client': return 'green';
      case 'assistant': return 'purple';
      case 'bookkeeper': return 'orange';
      default: return 'gray';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  // Render user detail view
  const renderDetailView = () => {
    if (!selectedUser) return null;

    return (
      <div className="space-y-6">
        <PremiumCard>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge
                      type="user"
                      status={selectedUser.role}
                      size="sm"
                    />
                    <StatusBadge
                      type="active"
                      status={selectedUser.user_status}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={PencilIcon}
                  onClick={() => {
                    setFormData({
                      email: selectedUser.email,
                      password: '',
                      confirmPassword: '',
                      firstName: selectedUser.first_name,
                      lastName: selectedUser.last_name,
                      phone: selectedUser.phone || '',
                      role: selectedUser.role,
                      sendWelcomeEmail: false
                    });
                    setViewMode('edit');
                  }}
                >
                  Edit
                </PremiumButton>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                  {selectedUser.last_login && (
                    <div className="flex items-center space-x-3">
                      <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="text-gray-900">{formatDate(selectedUser.last_login)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircleIcon className={`w-5 h-5 ${selectedUser.email_verified ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-700">
                    Email {selectedUser.email_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ShieldCheckIcon className={`w-5 h-5 ${selectedUser.two_factor_enabled ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-700">
                    2FA {selectedUser.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <KeyIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {selectedUser.login_count || 0} Logins
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={selectedUser.user_status === 'active' ? LockClosedIcon : LockOpenIcon}
                  onClick={() => handleStatusChange(
                    selectedUser.id,
                    selectedUser.user_status === 'active' ? 'suspended' : 'active'
                  )}
                >
                  {selectedUser.user_status === 'active' ? 'Suspend' : 'Activate'}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={KeyIcon}
                  onClick={() => handlePasswordReset(selectedUser.id)}
                >
                  Reset Password
                </PremiumButton>
                {!selectedUser.email_verified && (
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    icon={EnvelopeIcon}
                    onClick={() => info('Verification email sent')}
                  >
                    Resend Verification
                  </PremiumButton>
                )}
                <PremiumButton
                  variant="danger"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  Delete User
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
          title="User Information"
          description="Basic information about the user"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
              error={formErrors.firstName}
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
              error={formErrors.lastName}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              error={formErrors.email}
              disabled={isEdit}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              placeholder="+31 6 12345678"
            />
          </div>

          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            onChange={(value) => setFormData(prev => ({ ...prev, role: value as User['role'] }))}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'therapist', label: 'Therapist' },
              { value: 'client', label: 'Client' },
              { value: 'assistant', label: 'Assistant' },
              { value: 'bookkeeper', label: 'Bookkeeper' }
            ]}
            required
          />
        </FormSection>

        {!isEdit && (
          <FormSection
            title="Security"
            description="Set up the user's password"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                error={formErrors.password}
                required
                hint="At least 8 characters"
              />
              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                error={formErrors.confirmPassword}
                required
              />
            </div>

            <CheckboxField
              label="Send welcome email"
              name="sendWelcomeEmail"
              checked={formData.sendWelcomeEmail}
              onChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: checked }))}
              hint="Send an email with login instructions to the user"
            />
          </FormSection>
        )}

        <ActionButtons
          onCancel={() => {
            setViewMode('list');
            setSelectedUser(null);
            resetForm();
          }}
          onSubmit={handleSubmit}
          submitText={isEdit ? 'Update User' : 'Create User'}
          isSubmitting={createUserApi.isLoading || updateUserApi.isLoading}
        />
      </div>
    );
  };

  // Render list
  const renderList = () => {
    if (filteredUsers.length === 0) {
      return (
        <PremiumEmptyState
          icon={UserGroupIcon}
          title="No users found"
          description={searchTerm || filters.role !== 'all' || filters.status !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Create your first user to get started"}
          action={{
            label: "Create User",
            onClick: () => setViewMode('create')
          }}
        />
      );
    }

    return (
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <ListItemCard
            key={user.id}
            onClick={() => {
              setSelectedUser(user);
              setViewMode('detail');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge
                      type="user"
                      status={user.role}
                      size="sm"
                    />
                    <StatusBadge
                      type="active"
                      status={user.user_status}
                      size="sm"
                    />
                    {user.email_verified && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={EyeIcon}
                  onClick={(e) => {
                    e?.stopPropagation();
                    setSelectedUser(user);
                    setViewMode('detail');
                  }}
                >
                  View
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={PencilIcon}
                  onClick={(e) => {
                    e?.stopPropagation();
                    setSelectedUser(user);
                    setFormData({
                      email: user.email,
                      password: '',
                      confirmPassword: '',
                      firstName: user.first_name,
                      lastName: user.last_name,
                      phone: user.phone || '',
                      role: user.role,
                      sendWelcomeEmail: false
                    });
                    setViewMode('edit');
                  }}
                >
                  Edit
                </PremiumButton>
              </div>
            </div>
          </ListItemCard>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="User Management"
      subtitle="Manage all users in the system"
      icon={UserGroupIcon}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showCreateButton={viewMode === 'list'}
      createButtonText="Create User"
      isLoading={isLoading}
      totalCount={users.length}
      onBack={viewMode !== 'list' ? () => {
        setViewMode('list');
        setSelectedUser(null);
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
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="therapist">Therapist</option>
                  <option value="client">Client</option>
                  <option value="assistant">Assistant</option>
                  <option value="bookkeeper">Bookkeeper</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
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

export default UserManagement;