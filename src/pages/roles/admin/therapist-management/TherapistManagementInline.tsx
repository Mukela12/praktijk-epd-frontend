import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserPlusIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDate } from '@/utils/dateFormatters';
import { InlineCrudLayout } from '@/components/crud/InlineCrudLayout';
import { 
  TextField, 
  PasswordField, 
  SelectField, 
  TextareaField, 
  TagsField,
  CheckboxField,
  NumberField
} from '@/components/forms/FormFields';
import { Therapist } from '@/types/entities';
import TherapistProfileEditModal from '@/components/admin/TherapistProfileEditModal';

interface TherapistData extends Therapist {
  user_status: 'active' | 'inactive' | 'pending';
  therapist_status?: 'active' | 'available' | 'on_leave' | 'unavailable';
  qualifications?: string;
  years_of_experience?: number;
  consultation_rate?: number;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  available_days?: string[];
  available_hours?: string;
  accepting_new_clients?: boolean;
  online_therapy?: boolean;
  in_person_therapy?: boolean;
  client_count?: number;
  rating?: number;
  total_reviews?: number;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const TherapistManagementInline: React.FC = () => {
  const { success, error: errorAlert, warning, info } = useAlert();
  
  // State
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    specializations: [] as string[],
    languages: [] as string[],
    qualifications: '',
    years_of_experience: 0,
    bio: '',
    consultation_rate: 0,
    street_address: '',
    postal_code: '',
    city: '',
    country: 'Netherlands',
    available_days: [] as string[],
    available_hours: '',
    accepting_new_clients: true,
    online_therapy: true,
    in_person_therapy: true
  });

  // Load data
  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getTherapists();
      
      if (response.success && response.data) {
        // Map the API response to match our TherapistData interface
        const therapistsData = response.data.therapists || [];
        const mappedTherapists = therapistsData.map((therapist: any) => ({
          ...therapist,
          user_status: therapist.user_status || therapist.status || 'active',
          created_at: therapist.created_at || new Date().toISOString(),
          updated_at: therapist.updated_at || new Date().toISOString()
        }));
        setTherapists(mappedTherapists);
      }
    } catch (error) {
      console.error('Failed to load therapists:', error);
      errorAlert('Failed to load therapists data');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new therapist
  const handleCreate = async () => {
    try {
      console.log('Creating therapist with data:', formData);
      
      // Validate required fields
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        warning('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        warning('Please enter a valid email address');
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        warning('Password must be at least 6 characters long');
        return;
      }

      const response = await realApiService.admin.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.first_name,
        lastName: formData.last_name,
        role: 'therapist',
        phone: formData.phone || undefined
      });

      if (response.success && response.data?.id) {
        // Update therapist-specific fields
        await realApiService.admin.updateUser(response.data.id, {
          specializations: formData.specializations,
          languages: formData.languages,
          qualifications: formData.qualifications,
          years_of_experience: formData.years_of_experience,
          bio: formData.bio,
          consultation_rate: formData.consultation_rate,
          street_address: formData.street_address,
          postal_code: formData.postal_code,
          city: formData.city,
          country: formData.country,
          accepting_new_clients: formData.accepting_new_clients,
          online_therapy: formData.online_therapy,
          in_person_therapy: formData.in_person_therapy
        });

        success('Therapist created successfully');
        setViewMode('list');
        resetForm();
        loadTherapists();
      }
    } catch (error: any) {
      console.error('Error creating therapist:', error);
      errorAlert(error.response?.data?.message || error.message || 'Failed to create therapist');
    }
  };

  // Update therapist
  const handleUpdate = async () => {
    if (!selectedTherapist) return;

    try {
      const updates = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        specializations: formData.specializations,
        languages: formData.languages,
        qualifications: formData.qualifications,
        years_of_experience: formData.years_of_experience,
        bio: formData.bio,
        consultation_rate: formData.consultation_rate,
        street_address: formData.street_address,
        postal_code: formData.postal_code,
        city: formData.city,
        country: formData.country,
        accepting_new_clients: formData.accepting_new_clients,
        online_therapy: formData.online_therapy,
        in_person_therapy: formData.in_person_therapy
      };

      const response = await realApiService.admin.updateUser(selectedTherapist.id, updates);

      if (response.success) {
        success('Therapist updated successfully');
        setViewMode('list');
        setSelectedTherapist(null);
        resetForm();
        loadTherapists();
      }
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to update therapist');
    }
  };

  // Delete therapist
  const handleDelete = async (therapistId: string) => {
    if (!window.confirm('Are you sure you want to delete this therapist? This action cannot be undone.')) {
      return;
    }

    try {
      // Change status to inactive instead of deleting
      await realApiService.admin.updateUser(therapistId, { user_status: 'inactive' });
      success('Therapist deactivated successfully');
      loadTherapists();
    } catch (error: any) {
      errorAlert('Failed to deactivate therapist');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      specializations: [],
      languages: [],
      qualifications: '',
      years_of_experience: 0,
      bio: '',
      consultation_rate: 0,
      street_address: '',
      postal_code: '',
      city: '',
      country: 'Netherlands',
      available_days: [],
      available_hours: '',
      accepting_new_clients: true,
      online_therapy: true,
      in_person_therapy: true
    });
  };

  // Edit therapist
  const handleEdit = (therapist: TherapistData) => {
    setSelectedTherapist(therapist);
    setShowEditModal(true);
  };

  // Handle modal update
  const handleModalUpdate = () => {
    loadTherapists();
    setShowEditModal(false);
  };

  // View therapist details
  const handleView = (therapist: TherapistData) => {
    setSelectedTherapist(therapist);
    setViewMode('detail');
  };

  // Filter therapists
  const filteredTherapists = therapists.filter(therapist => {
    const therapistSpecializations = Array.isArray(therapist.specializations) ? therapist.specializations : [];
    
    const matchesSearch = searchTerm === '' || 
      therapist.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapistSpecializations.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || therapist.user_status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' || 
      therapistSpecializations.includes(filterSpecialization);
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Get unique specializations for filter
  const allSpecializations = Array.from(new Set(
    therapists.flatMap(t => Array.isArray(t.specializations) ? t.specializations : [])
  )).sort();

  // Render detail view
  const renderDetailView = () => {
    if (!selectedTherapist) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {selectedTherapist.first_name[0]}{selectedTherapist.last_name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Dr. {selectedTherapist.first_name} {selectedTherapist.last_name}
                </h2>
                <p className="text-gray-600">{selectedTherapist.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge
                    type="user"
                    status={selectedTherapist.user_status}
                    size="sm"
                  />
                  {selectedTherapist.rating && (
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {selectedTherapist.rating.toFixed(1)} ({selectedTherapist.total_reviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleEdit(selectedTherapist)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedTherapist.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.phone || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.street_address ? (
                        <>
                          {selectedTherapist.street_address}<br />
                          {selectedTherapist.postal_code} {selectedTherapist.city}<br />
                          {selectedTherapist.country}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Specializations</dt>
                    <dd className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(selectedTherapist.specializations) && selectedTherapist.specializations.map((spec: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Languages</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.languages?.join(', ') || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Years of Experience</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.years_of_experience || 0} years
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Qualifications</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.qualifications || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Consultation Rate</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      €{selectedTherapist.consultation_rate || 0} per session
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Service Types</dt>
                    <dd className="flex items-center gap-2">
                      {selectedTherapist.online_therapy && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Online Therapy
                        </span>
                      )}
                      {selectedTherapist.in_person_therapy && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          In-Person
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Accepting New Clients</dt>
                    <dd className="text-sm font-medium">
                      {selectedTherapist.accepting_new_clients ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Current Client Count</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedTherapist.client_count || 0} clients
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedTherapist.bio || 'No bio provided'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Account Created</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(selectedTherapist.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(selectedTherapist.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedTherapist(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  };

  // Render form
  const renderFormFields = () => {
    console.log('Rendering form fields, viewMode:', viewMode);
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              disabled={viewMode === 'edit'}
              required
            />
            {viewMode === 'create' && (
              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                required
              />
            )}
          </div>
        </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={(value) => setFormData({ ...formData, first_name: value })}
            required
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={(value) => setFormData({ ...formData, last_name: value })}
            required
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
          />
          <NumberField
            label="Years of Experience"
            name="years_of_experience"
            value={formData.years_of_experience}
            onChange={(value) => setFormData({ ...formData, years_of_experience: value })}
            min={0}
            max={50}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="space-y-6">
          <TagsField
            label="Specializations"
            name="specializations"
            value={formData.specializations}
            onChange={(value) => setFormData({ ...formData, specializations: value })}
            placeholder="Add specializations..."
          />
          <TextField
            label="Qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={(value) => setFormData({ ...formData, qualifications: value })}
            placeholder="e.g., PhD in Clinical Psychology, Licensed Therapist"
          />
          <TextareaField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={(value) => setFormData({ ...formData, bio: value })}
            rows={4}
            placeholder="Professional bio and approach to therapy..."
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NumberField
            label="Consultation Rate (€)"
            name="consultation_rate"
            value={formData.consultation_rate}
            onChange={(value) => setFormData({ ...formData, consultation_rate: value })}
            min={0}
            max={500}
          />
          <div className="space-y-4">
            <CheckboxField
              label="Accepting new clients"
              name="accepting_new_clients"
              checked={formData.accepting_new_clients}
              onChange={(checked) => setFormData({ ...formData, accepting_new_clients: checked })}
            />
            <CheckboxField
              label="Offers online therapy"
              name="online_therapy"
              checked={formData.online_therapy}
              onChange={(checked) => setFormData({ ...formData, online_therapy: checked })}
            />
            <CheckboxField
              label="Offers in-person therapy"
              name="in_person_therapy"
              checked={formData.in_person_therapy}
              onChange={(checked) => setFormData({ ...formData, in_person_therapy: checked })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <TextField
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={(value) => setFormData({ ...formData, street_address: value })}
            />
          </div>
          <TextField
            label="Postal Code"
            name="postal_code"
            value={formData.postal_code}
            onChange={(value) => setFormData({ ...formData, postal_code: value })}
          />
          <TextField
            label="City"
            name="city"
            value={formData.city}
            onChange={(value) => setFormData({ ...formData, city: value })}
          />
          <SelectField
            label="Country"
            name="country"
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
            options={[
              { value: 'Netherlands', label: 'Netherlands' },
              { value: 'Belgium', label: 'Belgium' },
              { value: 'Germany', label: 'Germany' },
              { value: 'France', label: 'France' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>
    </div>
    );
  };

  // Column definitions for the list
  const columns = [
    {
      key: 'therapist',
      label: 'Therapist',
      render: (therapist: TherapistData) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {therapist.first_name[0]}{therapist.last_name[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Dr. {therapist.first_name} {therapist.last_name}
            </p>
            <p className="text-sm text-gray-500">{therapist.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'specializations',
      label: 'Specializations',
      render: (therapist: TherapistData) => {
        const therapistSpecializations = Array.isArray(therapist.specializations) ? therapist.specializations : [];
        return (
          <div className="flex flex-wrap gap-1">
            {therapistSpecializations.slice(0, 3).map((spec: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {spec}
              </span>
            ))}
            {therapistSpecializations.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{therapistSpecializations.length - 3}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'clients',
      label: 'Clients',
      render: (therapist: TherapistData) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{therapist.client_count || 0}</p>
          <p className="text-gray-500">
            {therapist.accepting_new_clients ? 'Accepting' : 'Not accepting'}
          </p>
        </div>
      )
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (therapist: TherapistData) => (
        <span className="font-medium text-gray-900">
          €{therapist.consultation_rate || 0}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (therapist: TherapistData) => (
        <StatusBadge
          type="user"
          status={therapist.user_status}
          size="sm"
        />
      )
    }
  ];

  return (
    <InlineCrudLayout
      title="Therapist Management"
      subtitle="Manage all therapists in the system"
      icon={UsersIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        console.log('Changing view mode to:', mode);
        if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
          setViewMode(mode);
          if (mode === 'create') {
            resetForm();
          }
        }
      }}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Add Therapist"
      totalCount={therapists.length}
      onBack={viewMode !== 'list' ? () => {
        setViewMode('list');
        setSelectedTherapist(null);
        resetForm();
      } : undefined}
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
                    placeholder="Search therapists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Specializations</option>
                  {allSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Therapist List */}
          {filteredTherapists.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No therapists found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterSpecialization !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first therapist'}
              </p>
              {searchTerm === '' && filterStatus === 'all' && filterSpecialization === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => setViewMode('create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Therapist
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
                  {filteredTherapists.map((therapist) => (
                    <tr key={therapist.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render(therapist)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(therapist)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(therapist)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(therapist.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {viewMode === 'create' ? 'Create New Therapist' : 'Edit Therapist'}
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); viewMode === 'create' ? handleCreate() : handleUpdate(); }} className="space-y-6">
            {renderFormFields()}
            
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedTherapist(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                {viewMode === 'create' ? 'Create Therapist' : 'Update Therapist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && renderDetailView()}

      {/* Edit Modal */}
      {selectedTherapist && (
        <TherapistProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          therapist={selectedTherapist as Therapist}
          onUpdate={handleModalUpdate}
        />
      )}
    </InlineCrudLayout>
  );
};

export default TherapistManagementInline;