import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import {
  TextField,
  TextareaField,
  NumberField,
  SelectField,
  TagsField,
  DateField
} from '@/components/forms/FormFields';
import { Therapist } from '@/types/entities';

interface TherapistProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: Therapist;
  onUpdate: () => void;
}

const TherapistProfileEditModal: React.FC<TherapistProfileEditModalProps> = ({
  isOpen,
  onClose,
  therapist,
  onUpdate
}) => {
  const { success, error: errorAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'contract' | 'photo'>('basic');
  
  // Form data
  const [formData, setFormData] = useState({
    // Basic info (handled by user update endpoint)
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    
    // Professional info
    licenseNumber: '',
    specializations: [] as string[],
    therapyTypes: [] as string[],
    languages: [] as string[],
    bio: '',
    qualifications: [] as string[],
    hourlyRate: 0,
    maxClients: 0,
    maxClientsPerDay: 0,
    sessionDuration: 60,
    breakBetweenSessions: 15,
    
    // Contract info
    contractStatus: 'active' as 'active' | 'draft' | 'expired' | 'terminated',
    contractStartDate: '',
    contractEndDate: ''
  });

  // Available options
  const specializationOptions = [
    'Anxiety', 'Depression', 'Trauma & PTSD', 'Couples Therapy',
    'Family Therapy', 'Addiction', 'Eating Disorders', 'OCD',
    'Bipolar Disorder', 'Personality Disorders', 'ADHD',
    'Autism Spectrum', 'Grief & Loss', 'Life Transitions'
  ];

  const therapyTypeOptions = [
    'CBT', 'DBT', 'EMDR', 'Psychodynamic', 'Humanistic',
    'Solution-Focused', 'Mindfulness-Based', 'Art Therapy',
    'Play Therapy', 'Group Therapy'
  ];

  const languageOptions = [
    'Dutch', 'English', 'Spanish', 'French', 'German',
    'Italian', 'Portuguese', 'Turkish', 'Arabic', 'Polish'
  ];

  // Initialize form data
  useEffect(() => {
    if (therapist) {
      setFormData({
        first_name: therapist.first_name || '',
        last_name: therapist.last_name || '',
        email: therapist.email || '',
        phone: therapist.phone || '',
        licenseNumber: therapist.license_number || '',
        specializations: therapist.specializations || [],
        therapyTypes: (therapist as any).therapy_types || [],
        languages: therapist.languages || [],
        bio: therapist.bio || '',
        qualifications: (therapist as any).qualifications || [],
        hourlyRate: therapist.hourly_rate || 0,
        maxClients: therapist.max_clients || 0,
        maxClientsPerDay: (therapist as any).max_clients_per_day || 0,
        sessionDuration: (therapist as any).session_duration || 60,
        breakBetweenSessions: (therapist as any).break_between_sessions || 15,
        contractStatus: therapist.contract_status || 'active',
        contractStartDate: therapist.contract_start_date || '',
        contractEndDate: therapist.contract_end_date || ''
      });
    }
  }, [therapist]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Update basic user info
      await realApiService.admin.updateUser(therapist.user_id, {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone
      });

      // Update therapist profile
      await realApiService.admin.updateTherapistProfile(therapist.user_id, {
        licenseNumber: formData.licenseNumber,
        specializations: formData.specializations,
        therapyTypes: formData.therapyTypes,
        languages: formData.languages,
        bio: formData.bio,
        qualifications: formData.qualifications,
        hourlyRate: formData.hourlyRate,
        maxClients: formData.maxClients,
        maxClientsPerDay: formData.maxClientsPerDay,
        sessionDuration: formData.sessionDuration,
        breakBetweenSessions: formData.breakBetweenSessions,
        contractStatus: formData.contractStatus,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate
      });

      success('Therapist profile updated successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      errorAlert(error.response?.data?.message || 'Failed to update therapist profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpdate = (photoUrl: string | null) => {
    if (photoUrl) {
      success('Profile photo updated successfully');
    } else {
      success('Profile photo removed successfully');
    }
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          required
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
        />
      </div>

      <TextField
        label="License Number"
        name="licenseNumber"
        value={formData.licenseNumber}
        onChange={(value) => setFormData({ ...formData, licenseNumber: value })}
        hint="Professional license or registration number"
      />
    </div>
  );

  const renderProfessionalInfoTab = () => (
    <div className="space-y-6">
      <TagsField
        label="Specializations"
        name="specializations"
        value={formData.specializations}
        onChange={(value) => setFormData({ ...formData, specializations: value })}
        hint="Type and press Enter to add specializations"
      />

      <div className="text-sm text-gray-500 mb-2">
        Suggested: {specializationOptions.filter(s => !formData.specializations.includes(s)).slice(0, 5).join(', ')}
      </div>

      <TagsField
        label="Therapy Types"
        name="therapyTypes"
        value={formData.therapyTypes}
        onChange={(value) => setFormData({ ...formData, therapyTypes: value })}
        hint="Therapeutic approaches and methodologies"
      />

      <TagsField
        label="Languages"
        name="languages"
        value={formData.languages}
        onChange={(value) => setFormData({ ...formData, languages: value })}
        hint="Languages spoken by the therapist"
      />

      <TextareaField
        label="Bio"
        name="bio"
        value={formData.bio}
        onChange={(value) => setFormData({ ...formData, bio: value })}
        rows={4}
        hint="Professional biography and approach"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberField
          label="Hourly Rate (€)"
          name="hourlyRate"
          value={formData.hourlyRate}
          onChange={(value) => setFormData({ ...formData, hourlyRate: value })}
          min={0}
          step={5}
        />
        <NumberField
          label="Max Clients"
          name="maxClients"
          value={formData.maxClients}
          onChange={(value) => setFormData({ ...formData, maxClients: value })}
          min={0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberField
          label="Session Duration (minutes)"
          name="sessionDuration"
          value={formData.sessionDuration}
          onChange={(value) => setFormData({ ...formData, sessionDuration: value })}
          min={15}
          max={240}
          step={15}
        />
        <NumberField
          label="Break Between Sessions (minutes)"
          name="breakBetweenSessions"
          value={formData.breakBetweenSessions}
          onChange={(value) => setFormData({ ...formData, breakBetweenSessions: value })}
          min={0}
          max={120}
          step={5}
        />
      </div>
    </div>
  );

  const renderContractTab = () => (
    <div className="space-y-6">
      <SelectField
        label="Contract Status"
        name="contractStatus"
        value={formData.contractStatus}
        onChange={(value) => setFormData({ ...formData, contractStatus: value as any })}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'draft', label: 'Draft' },
          { value: 'expired', label: 'Expired' },
          { value: 'terminated', label: 'Terminated' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateField
          label="Contract Start Date"
          name="contractStartDate"
          value={formData.contractStartDate}
          onChange={(value) => setFormData({ ...formData, contractStartDate: value })}
        />
        <DateField
          label="Contract End Date"
          name="contractEndDate"
          value={formData.contractEndDate}
          onChange={(value) => setFormData({ ...formData, contractEndDate: value })}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Contract Information</h4>
        <p className="text-sm text-blue-700">
          Contract management helps track therapist agreements, renewal dates, and compliance requirements.
        </p>
      </div>
    </div>
  );

  const renderPhotoTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Photo Management</h3>
        <p className="text-sm text-gray-500 mb-6">
          Upload or manage the therapist's professional profile photo
        </p>
      </div>

      <ProfilePhotoUpload
        userId={therapist.user_id}
        currentPhotoUrl={(therapist as any).profile_photo_url}
        onPhotoUpdate={handlePhotoUpdate}
        size="large"
        editable={true}
      />

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Professional headshot preferred</li>
          <li>• Minimum 400x400 pixels recommended</li>
          <li>• JPG, PNG, or WebP format</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <Dialog.Title className="text-lg font-medium text-white flex items-center">
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Edit Therapist Profile
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    {[
                      { id: 'basic', label: 'Basic Info' },
                      { id: 'professional', label: 'Professional' },
                      { id: 'contract', label: 'Contract' },
                      { id: 'photo', label: 'Photo' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                          ${activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <>
                      {activeTab === 'basic' && renderBasicInfoTab()}
                      {activeTab === 'professional' && renderProfessionalInfoTab()}
                      {activeTab === 'contract' && renderContractTab()}
                      {activeTab === 'photo' && renderPhotoTab()}
                    </>
                  )}
                </div>

                {/* Footer */}
                {activeTab !== 'photo' && (
                  <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TherapistProfileEditModal;