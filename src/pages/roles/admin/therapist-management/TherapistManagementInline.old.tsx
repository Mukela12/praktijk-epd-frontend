import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import { formatDate } from '@/utils/dateFormatters';
import { transformToBackend, transformToFrontend, separateUserAndProfileData } from '@/utils/fieldTransformations';
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
import { TagsFieldWithSuggestions, THERAPIST_SPECIALIZATIONS, LANGUAGES } from '@/components/forms/TagsFieldWithSuggestions';
import { Therapist } from '@/types/entities';
import TherapistProfileEditModal from '@/components/admin/TherapistProfileEditModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface TherapistData extends Therapist {
  user_status: 'active' | 'inactive' | 'pending';
  therapist_status?: 'active' | 'available' | 'on_leave' | 'unavailable';
  qualifications?: string;
  years_of_experience?: number;
  consultation_rate?: number;
  consultationRate?: number;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  available_days?: string[];
  kvk_number?: string;
  big_number?: string;
  therapy_types?: string[];
  session_duration?: number;
  break_between_sessions?: number;
  max_daily_sessions?: number;
  max_weekly_sessions?: number;
  max_clients_per_day?: number;
  available_hours?: string;
  accepting_new_clients?: boolean;
  online_therapy?: boolean;
  in_person_therapy?: boolean;
  client_count?: number;
  rating?: number;
  total_reviews?: number;
  profile_photo_url?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const TherapistManagementInline: React.FC = () => {
  console.log('⚠️ OLD TherapistManagementInline Component Loaded - Use /admin/therapists instead');
  
  const { success, error: errorAlert, warning, info } = useAlert();
  const location = useLocation();
  
  // State
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [filterAccepting, setFilterAccepting] = useState<boolean>(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [therapistToDelete, setTherapistToDelete] = useState<TherapistData | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  
  // Loading states for operations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    specializations: [] as string[],
    languages: [] as string[],
    qualifications: [] as string[],
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
    in_person_therapy: true,
    // Additional fields
    license_number: '',
    kvk_number: '',
    big_number: '',
    therapy_types: [] as string[],
    session_duration: 60,
    break_between_sessions: 15,
    max_clients: 20,
    max_daily_sessions: 8,
    max_weekly_sessions: 40,
    max_clients_per_day: 8
  });

  // Load data
  useEffect(() => {
    loadTherapists();
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewId = searchParams.get('view');
    const editId = searchParams.get('edit');
    
    if (viewId && therapists.length > 0) {
      const therapist = therapists.find(t => t.id === viewId);
      if (therapist) {
        setSelectedTherapist(therapist);
        setViewMode('detail');
      }
    } else if (editId && therapists.length > 0) {
      const therapist = therapists.find(t => t.id === editId);
      if (therapist) {
        handleEdit(therapist);
      }
    }
  }, [location.search, therapists]);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getTherapists();
      
      if (response.success && response.data) {
        // Map the API response to match our TherapistData interface
        const therapistsData = response.data.therapists || response.data || [];
        // Ensure therapistsData is an array
        const therapistsArray = Array.isArray(therapistsData) ? therapistsData : [];
        const mappedTherapists = therapistsArray.map((therapist: any) => {
          const frontendData = transformToFrontend(therapist);
          return {
            ...therapist,
            ...frontendData,
            user_status: therapist.user_status || therapist.status || 'active',
            created_at: therapist.created_at || new Date().toISOString(),
            updated_at: therapist.updated_at || new Date().toISOString()
          };
        });
        setTherapists(mappedTherapists);
      } else {
        setTherapists([]);
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
      setIsCreating(true);
      console.log('Creating therapist with data:', formData);
      
      // Validate required fields
      if (!formData.email || !formData.first_name || !formData.last_name) {
        warning('Please fill in all required fields');
        setIsCreating(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        warning('Please enter a valid email address');
        setIsCreating(false);
        return;
      }

      const response = await realApiService.admin.createUser({
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        role: 'therapist',
        phone: formData.phone || undefined
      });

      if (response.success && response.data?.id) {
        // Update therapist-specific fields using the dedicated endpoint
        const profileData = transformToBackend({
          specializations: formData.specializations,
          languages: formData.languages,
          qualifications: formData.qualifications,
          yearsOfExperience: formData.years_of_experience,
          bio: formData.bio,
          consultationRate: formData.consultation_rate,
          streetAddress: formData.street_address,
          postalCode: formData.postal_code,
          city: formData.city,
          country: formData.country,
          acceptingNewClients: formData.accepting_new_clients,
          onlineTherapy: formData.online_therapy,
          inPersonTherapy: formData.in_person_therapy,
          licenseNumber: formData.license_number,
          kvkNumber: formData.kvk_number,
          bigNumber: formData.big_number,
          therapyTypes: formData.therapy_types,
          sessionDuration: formData.session_duration,
          breakBetweenSessions: formData.break_between_sessions,
          maxClients: formData.max_clients,
          maxDailySessions: formData.max_daily_sessions,
          maxWeeklySessions: formData.max_weekly_sessions,
          maxClientsPerDay: formData.max_clients_per_day
        });
        
        await realApiService.admin.updateTherapistProfile(response.data.id, profileData);

        success('Therapist created successfully! A temporary password has been sent to their email address.');
        info('The therapist will receive login credentials via email and will be prompted to change their password on first login.');
        setViewMode('list');
        resetForm();
        loadTherapists();
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Error creating therapist:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        errorAlert('A user with this email address already exists. Please use a different email address.');
      } else if (error.response?.data?.message) {
        errorAlert(error.response.data.message);
      } else if (error.response?.data?.error) {
        errorAlert(error.response.data.error);
      } else {
        errorAlert('Failed to create therapist. Please check your input and try again.');
      }
      setIsCreating(false);
    }
  };

  // Update therapist
  const handleUpdate = async () => {
    if (!selectedTherapist) return;

    try {
      setIsUpdating(true);
      // Separate user fields from profile fields
      const { userData, profileData } = separateUserAndProfileData({
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        specializations: formData.specializations,
        languages: formData.languages,
        qualifications: formData.qualifications,
        yearsOfExperience: formData.years_of_experience,
        bio: formData.bio,
        consultationRate: formData.consultation_rate,
        streetAddress: formData.street_address,
        postalCode: formData.postal_code,
        city: formData.city,
        country: formData.country,
        acceptingNewClients: formData.accepting_new_clients,
        onlineTherapy: formData.online_therapy,
        inPersonTherapy: formData.in_person_therapy,
        licenseNumber: formData.license_number,
        kvkNumber: formData.kvk_number,
        bigNumber: formData.big_number,
        therapyTypes: formData.therapy_types,
        sessionDuration: formData.session_duration,
        breakBetweenSessions: formData.break_between_sessions,
        maxClients: formData.max_clients,
        maxDailySessions: formData.max_daily_sessions,
        maxWeeklySessions: formData.max_weekly_sessions,
        maxClientsPerDay: formData.max_clients_per_day
      });

      // Update basic user info if changed
      let response = { success: true };
      if (Object.keys(userData).length > 0) {
        response = await realApiService.admin.updateUser(selectedTherapist.id, userData);
      }
      
      // Update profile data using dedicated endpoint
      if (response.success && Object.keys(profileData).length > 0) {
        response = await realApiService.admin.updateTherapistProfile(selectedTherapist.id, profileData);
      }

      if (response.success) {
        success('Therapist updated successfully');
        setViewMode('list');
        setSelectedTherapist(null);
        resetForm();
        loadTherapists();
        setIsUpdating(false);
      }
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to update therapist');
      setIsUpdating(false);
    }
  };

  // Delete therapist - opens confirmation modal
  const handleDelete = (therapist: TherapistData) => {
    setTherapistToDelete(therapist);
    setShowDeleteModal(true);
    setIsPermanentDelete(false);
  };

  // Confirm delete - actually performs the deletion
  const confirmDelete = async () => {
    if (!therapistToDelete) return;

    try {
      setIsDeleting(true);
      if (isPermanentDelete) {
        // Use the delete endpoint with permanent flag
        const response = await realApiService.admin.deleteUser(therapistToDelete.id);
        if (response.success) {
          success('Therapist permanently deleted');
        }
      } else {
        // Soft delete - change status to inactive
        const response = await realApiService.admin.updateUser(therapistToDelete.id, { status: 'inactive' });
        if (response.success) {
          success('Therapist deactivated successfully');
        }
      }
      
      // Reset modal state
      setShowDeleteModal(false);
      setTherapistToDelete(null);
      setIsPermanentDelete(false);
      
      // Reload the list
      loadTherapists();
      setIsDeleting(false);
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to delete therapist');
      setIsDeleting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      specializations: [],
      languages: [],
      qualifications: [],
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
      in_person_therapy: true,
      license_number: '',
      kvk_number: '',
      big_number: '',
      therapy_types: [],
      session_duration: 60,
      break_between_sessions: 15,
      max_clients: 20,
      max_daily_sessions: 8,
      max_weekly_sessions: 40,
      max_clients_per_day: 8
    });
  };

  // Edit therapist
  const handleEdit = (therapist: TherapistData) => {
    setSelectedTherapist(therapist);
    setFormData({
      email: therapist.email,
      first_name: therapist.first_name,
      last_name: therapist.last_name,
      phone: therapist.phone || '',
      specializations: Array.isArray(therapist.specializations) ? therapist.specializations : [],
      languages: Array.isArray(therapist.languages) ? therapist.languages : [],
      qualifications: Array.isArray(therapist.qualifications) ? therapist.qualifications : [],
      years_of_experience: therapist.years_of_experience || 0,
      bio: therapist.bio || '',
      consultation_rate: therapist.consultationRate || therapist.consultation_rate || therapist.hourly_rate || 0,
      street_address: therapist.street_address || '',
      postal_code: therapist.postal_code || '',
      city: therapist.city || '',
      country: therapist.country || 'Netherlands',
      available_days: therapist.available_days || [],
      available_hours: therapist.available_hours || '',
      accepting_new_clients: therapist.accepting_new_clients ?? true,
      online_therapy: therapist.online_therapy ?? true,
      in_person_therapy: therapist.in_person_therapy ?? true,
      license_number: therapist.license_number || '',
      kvk_number: therapist.kvk_number || '',
      big_number: therapist.big_number || '',
      therapy_types: Array.isArray(therapist.therapy_types) ? therapist.therapy_types : [],
      session_duration: therapist.session_duration || 60,
      break_between_sessions: therapist.break_between_sessions || 15,
      max_clients: therapist.max_clients || 20,
      max_daily_sessions: therapist.max_daily_sessions || 8,
      max_weekly_sessions: therapist.max_weekly_sessions || 40,
      max_clients_per_day: therapist.max_clients_per_day || 8
    });
    setViewMode('edit');
  };

  // Handle modal update
  // const handleModalUpdate = () => {
  //   loadTherapists();
  //   setShowEditModal(false);
  // };

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
    const matchesAccepting = !filterAccepting || therapist.accepting_new_clients;
    
    return matchesSearch && matchesStatus && matchesSpecialization && matchesAccepting;
  });

  // Get unique specializations for filter
  const allSpecializations = Array.from(new Set(
    Array.isArray(therapists) ? therapists.flatMap(t => Array.isArray(t.specializations) ? t.specializations : []) : []
  )).sort();

  // Render detail view
  const renderDetailView = () => {
    if (!selectedTherapist) return null;

    return (
      <div className="space-y-6">
        {/* Professional Header with Enhanced Design */}
        <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl shadow-xl overflow-hidden border border-red-100/20">
          <div className="bg-white/70 backdrop-blur-xl">
            {/* Top Banner */}
            <div className="h-32 bg-gradient-to-r from-red-500 to-rose-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(selectedTherapist);
                  }}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 flex items-center gap-2 transition-all border border-white/30"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="px-8 pb-8">
              <div className="flex items-end -mt-16 mb-6">
                <div className="relative">
                  <ProfilePhotoUpload 
                    userId={selectedTherapist.id}
                    currentPhotoUrl={selectedTherapist.profile_photo_url}
                    size="large"
                    editable={true}
                    onPhotoUpdate={(url) => {
                      setSelectedTherapist(prev => prev ? { ...prev, profile_photo_url: url || undefined } : null);
                      loadTherapists();
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <div className={`w-5 h-5 rounded-full ${
                      selectedTherapist.user_status === 'active' ? 'bg-green-500' : 
                      selectedTherapist.user_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div className="ml-6 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Dr. {selectedTherapist.first_name} {selectedTherapist.last_name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-3">{selectedTherapist.email}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge
                      type="user"
                      status={selectedTherapist.user_status}
                      size="md"
                    />
                    
                    {selectedTherapist.years_of_experience && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        <BriefcaseIcon className="w-4 h-4 mr-1.5" />
                        {selectedTherapist.years_of_experience} years experience
                      </span>
                    )}
                    
                    {selectedTherapist.rating && (
                      <div className="inline-flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                        <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {selectedTherapist.rating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({selectedTherapist.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedTherapist.client_count || 0}</p>
                  <p className="text-sm text-gray-600">Active Clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">€{selectedTherapist.consultation_rate || 0}</p>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedTherapist.specializations?.length || 0}</p>
                  <p className="text-sm text-gray-600">Specializations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedTherapist.languages?.length || 0}</p>
                  <p className="text-sm text-gray-600">Languages</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-5">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl mr-3 shadow-sm">
                <PhoneIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            </div>
            <dl className="space-y-5">
              <div className="group">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</dt>
                <dd className="text-gray-900 flex items-center group-hover:text-red-600 transition-colors">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-400" />
                  <a href={`mailto:${selectedTherapist.email}`} className="hover:underline">
                    {selectedTherapist.email}
                  </a>
                </dd>
              </div>
              
              <div className="group">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</dt>
                <dd className="text-gray-900 flex items-center group-hover:text-red-600 transition-colors">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-400" />
                  {selectedTherapist.phone ? (
                    <a href={`tel:${selectedTherapist.phone}`} className="hover:underline">
                      {selectedTherapist.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </dd>
              </div>
              
              <div className="group">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</dt>
                <dd className="text-gray-900 flex items-start group-hover:text-red-600 transition-colors">
                  <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    {selectedTherapist.street_address ? (
                      <>
                        <p className="font-medium">{selectedTherapist.street_address}</p>
                        <p>{selectedTherapist.postal_code} {selectedTherapist.city}</p>
                        <p>{selectedTherapist.country}</p>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          {/* Professional Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-5">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 shadow-sm">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Professional Information</h3>
            </div>
            <dl className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500 mb-2">Specializations</dt>
                <dd className="flex flex-wrap gap-2">
                  {Array.isArray(selectedTherapist.specializations) && selectedTherapist.specializations.map((spec: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-lg font-medium">
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

          {/* Service Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-5">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-sm">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Service Information</h3>
            </div>
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
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

          {/* Bio Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedTherapist.bio || 'No bio provided'}
            </p>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
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

          {/* Therapy Approach Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AcademicCapIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Therapy Approach</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {selectedTherapist.bio || 'No therapy approach description available.'}
            </p>
          </div>
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
          {viewMode === 'create' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> A temporary password will be automatically generated and sent to the therapist's email address. They will be required to change it on first login.
              </p>
            </div>
          )}
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
          </div>
        </div>
        
        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
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
        
        {/* Professional Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AcademicCapIcon className="w-5 h-5 mr-2 text-purple-600" />
            Professional Information
          </h3>
        <div className="space-y-6">
          <TagsFieldWithSuggestions
            label="Specializations"
            name="specializations"
            value={formData.specializations}
            onChange={(value) => setFormData({ ...formData, specializations: value })}
            suggestions={THERAPIST_SPECIALIZATIONS}
            placeholder="Search specializations or add custom..."
            allowCustom={true}
          />
          <TagsFieldWithSuggestions
            label="Languages"
            name="languages"
            value={formData.languages}
            onChange={(value) => setFormData({ ...formData, languages: value })}
            suggestions={LANGUAGES}
            placeholder="Search languages or add custom..."
            allowCustom={true}
          />
          <TagsFieldWithSuggestions
            label="Qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={(value) => setFormData({ ...formData, qualifications: value })}
            suggestions={[
              'PhD in Clinical Psychology',
              'Master in Psychology',
              'Licensed Clinical Psychologist',
              'Licensed Therapist',
              'Certified CBT Therapist',
              'EMDR Practitioner',
              'Family Therapist',
              'Child Psychologist',
              'Addiction Counselor',
              'Trauma Specialist'
            ]}
            placeholder="Add qualifications..."
            allowCustom={true}
          />
          <TextareaField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={(value) => setFormData({ ...formData, bio: value })}
            rows={4}
            placeholder="Professional bio and approach to therapy..."
          />
          
          {/* Registration Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="License Number"
              name="license_number"
              value={formData.license_number}
              onChange={(value) => setFormData({ ...formData, license_number: value })}
              placeholder="Professional license"
            />
            <TextField
              label="KVK Number"
              name="kvk_number"
              value={formData.kvk_number}
              onChange={(value) => setFormData({ ...formData, kvk_number: value })}
              placeholder="Chamber of Commerce"
            />
            <TextField
              label="BIG Number"
              name="big_number"
              value={formData.big_number}
              onChange={(value) => setFormData({ ...formData, big_number: value })}
              placeholder="Healthcare registration"
            />
          </div>
          
          {/* Session Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Session Duration (minutes)"
              name="session_duration"
              value={formData.session_duration}
              onChange={(value) => setFormData({ ...formData, session_duration: value })}
              min={15}
              max={240}
              step={15}
            />
            <NumberField
              label="Break Between Sessions (minutes)"
              name="break_between_sessions"
              value={formData.break_between_sessions}
              onChange={(value) => setFormData({ ...formData, break_between_sessions: value })}
              min={0}
              max={60}
              step={5}
            />
          </div>
          
          {/* Capacity Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Max Clients"
              name="max_clients"
              value={formData.max_clients}
              onChange={(value) => setFormData({ ...formData, max_clients: value })}
              min={1}
              max={100}
            />
            <NumberField
              label="Max Clients Per Day"
              name="max_clients_per_day"
              value={formData.max_clients_per_day}
              onChange={(value) => setFormData({ ...formData, max_clients_per_day: value })}
              min={1}
              max={20}
            />
            <NumberField
              label="Max Daily Sessions"
              name="max_daily_sessions"
              value={formData.max_daily_sessions}
              onChange={(value) => setFormData({ ...formData, max_daily_sessions: value })}
              min={1}
              max={20}
            />
            <NumberField
              label="Max Weekly Sessions"
              name="max_weekly_sessions"
              value={formData.max_weekly_sessions}
              onChange={(value) => setFormData({ ...formData, max_weekly_sessions: value })}
              min={1}
              max={80}
            />
          </div>
        </div>
        </div>
        
        {/* Service Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
            Service Settings
          </h3>
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
        
        {/* Location Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-amber-600" />
            Location Information
          </h3>
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
          <div className="relative">
            {therapist.profile_photo_url ? (
              <img 
                src={therapist.profile_photo_url} 
                alt={`${therapist.first_name} ${therapist.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {therapist.first_name[0]}{therapist.last_name[0]}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              therapist.user_status === 'active' ? 'bg-green-500' : 
              therapist.user_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Dr. {therapist.first_name} {therapist.last_name}
            </p>
            <p className="text-sm text-gray-500">{therapist.email}</p>
            {therapist.phone && (
              <div className="flex items-center mt-0.5">
                <PhoneIcon className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">{therapist.phone}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'specializations',
      label: 'Specializations',
      render: (therapist: TherapistData) => {
        const therapistSpecializations = Array.isArray(therapist.specializations) ? therapist.specializations : [];
        if (therapistSpecializations.length === 0) {
          return <span className="text-sm text-gray-400 italic">None specified</span>;
        }
        return (
          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {therapistSpecializations.slice(0, 2).map((spec: string, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-100"
              >
                {spec}
              </span>
            ))}
            {therapistSpecializations.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                +{therapistSpecializations.length - 2} more
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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{therapist.client_count || 0}</span>
            <span className="text-xs text-gray-500">clients</span>
          </div>
          {therapist.accepting_new_clients ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Accepting
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              Full
            </span>
          )}
        </div>
      )
    },
    {
      key: 'rate',
      label: 'Hourly Rate',
      render: (therapist: TherapistData) => (
        <div className="flex items-center gap-1">
          <CurrencyEuroIcon className="w-4 h-4 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">
            {therapist.consultation_rate || 0}
          </span>
          <span className="text-sm text-gray-500">/hr</span>
        </div>
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
    <>
      {/* OLD VERSION WARNING - REMOVE AFTER MIGRATION */}
      <div className="mb-6 bg-red-50 border-2 border-red-400 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="font-bold text-red-800">Old Version Warning</h3>
            <p className="text-red-700">This is the OLD therapist management system. Please navigate to <strong>/admin/therapists</strong> for the new version.</p>
          </div>
        </div>
      </div>
      
      <InlineCrudLayout
        title="Therapists"
        subtitle={viewMode === 'list' ? `${therapists.length} therapists in the system` : undefined}
        icon={UsersIcon}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
            setViewMode(mode);
            if (mode === 'create') {
              resetForm();
          }
        }
      }}
      isLoading={isLoading}
      showCreateButton={viewMode === 'list'}
      createButtonText="Add New Therapist"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-2xl">
                  <div className="relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by name, email, specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{therapists.length}</p>
                    <p className="text-sm text-gray-500">Total Therapists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{therapists.filter(t => t.user_status === 'active').length}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{therapists.filter(t => t.accepting_new_clients).length}</p>
                    <p className="text-sm text-gray-500">Accepting</p>
                  </div>
                </div>
              </div>
              
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer transition-all text-sm font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Specialization Filter */}
                <div className="relative">
                  <select
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer transition-all text-sm font-medium"
                  >
                    <option value="all">All Specializations</option>
                    {allSpecializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Accepting Clients Filter */}
                <button
                  onClick={() => setFilterAccepting(!filterAccepting)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                    filterAccepting 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserGroupIcon className="w-4 h-4 inline-block mr-2" />
                  Accepting New Clients
                </button>
                
                {/* Clear Filters */}
                {(filterStatus !== 'all' || filterSpecialization !== 'all' || filterAccepting || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterSpecialization('all');
                      setFilterAccepting(false);
                      setSearchTerm('');
                    }}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Therapist List */}
          {filteredTherapists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== 'all' || filterSpecialization !== 'all' || filterAccepting
                    ? 'Try adjusting your filters to see more results'
                    : 'Get started by adding your first therapist to the system'}
                </p>
                {searchTerm === '' && filterStatus === 'all' && filterSpecialization === 'all' && !filterAccepting && (
                  <button
                    onClick={() => setViewMode('create')}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-sm"
                  >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Add Your First Therapist
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredTherapists.map((therapist, index) => (
                      <tr 
                        key={therapist.id} 
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        {columns.map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            {column.render(therapist)}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(therapist);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(therapist);
                              }}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 group"
                              title="Edit Therapist"
                            >
                              <PencilIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(therapist);
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                              title="Delete Therapist"
                            >
                              <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {viewMode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                    {viewMode === 'create' ? 'Create Therapist' : 'Update Therapist'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && renderDetailView()}

    </InlineCrudLayout>

    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setTherapistToDelete(null);
        setIsPermanentDelete(false);
      }}
      onConfirm={confirmDelete}
      title="Delete Therapist"
      message={`Are you sure you want to ${isPermanentDelete ? 'permanently delete' : 'deactivate'} ${therapistToDelete?.first_name} ${therapistToDelete?.last_name}?`}
      confirmText={isPermanentDelete ? "Permanently Delete" : "Deactivate"}
      cancelText="Cancel"
      variant="danger"
      icon={TrashIcon}
      showPermanentOption={true}
      isPermanent={isPermanentDelete}
      onPermanentChange={setIsPermanentDelete}
      additionalInfo={
        therapistToDelete && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {therapistToDelete.email}
            </p>
            {therapistToDelete.client_count && therapistToDelete.client_count > 0 && (
              <p className="text-sm text-yellow-600">
                <ExclamationTriangleIcon className="inline-block w-4 h-4 mr-1" />
                This therapist has {therapistToDelete.client_count} assigned client(s).
              </p>
            )}
            {isPermanentDelete ? (
              <p className="text-sm text-red-600 font-semibold">
                This action cannot be undone. All data will be permanently removed.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                The therapist will be deactivated and can be reactivated later.
              </p>
            )}
          </div>
        )
      }
    />
    </>
  );
};

export default TherapistManagementInline;