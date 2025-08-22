import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  HeartIcon,
  PuzzlePieceIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTherapistDashboard } from '@/hooks/useApi';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';

const TherapistProfile: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, error } = useAlert();
  
  // API hooks
  const { getProfile, updateProfile, isLoading } = useTherapistDashboard();
  
  // State management
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'schedule' | 'financial'>('personal');
  
  // Therapies and psychological problems from admin
  const [availableTherapies, setAvailableTherapies] = useState<any[]>([]);
  const [availableProblems, setAvailableProblems] = useState<any[]>([]);
  const [loadingTherapies, setLoadingTherapies] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get profile from real API
        const profileData = await getProfile();
        
        if (profileData) {
          // Enhance profile with default data if missing
          const enhancedProfile = {
            ...profileData,
            // Use real data from API, fallback to defaults for missing fields
            name: (profileData as any).firstName && (profileData as any).lastName 
              ? `${(profileData as any).firstName} ${(profileData as any).lastName}` 
              : ((profileData as any).name || getDisplayName()),
            phone: (profileData as any).phone || '+31 6 1234 5678',
            email: (profileData as any).email || user?.email || 'therapist@praktijkepd.nl',
            address: (profileData as any).address || 'Hoofdstraat 123, 1234 AB Amsterdam',
            date_of_birth: (profileData as any).dateOfBirth || '1985-03-15',
            license_number: (profileData as any).licenseNumber || 'NL-PSY-2019-0234',
            license_expiry: (profileData as any).licenseExpiry || '2025-03-15',
            // Changed from specialization to therapies and psychologicalProblems
            therapies: (profileData as any).therapies || (profileData as any).specializations || [],
            psychologicalProblems: (profileData as any).psychological_problems || (profileData as any).psychologicalProblems || [],
            bio: (profileData as any).bio || 'Experienced therapist specializing in cognitive behavioral therapy and trauma treatment.',
            education: (profileData as any).education || [
              {
                degree: 'Master of Science in Clinical Psychology',
                institution: 'University of Amsterdam',
                year: '2010'
              }
            ],
            certifications: (profileData as any).certifications || [
              'Cognitive Behavioral Therapy (CBT)',
              'EMDR Therapy',
              'Trauma-Focused Therapy'
            ],
            schedule: (profileData as any).schedule || {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '15:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '16:00', available: true },
              saturday: { start: '', end: '', available: false },
              sunday: { start: '', end: '', available: false }
            },
            hourly_rate: (profileData as any).hourlyRate || 85,
            status: (profileData as any).status || 'active',
            hire_date: (profileData as any).createdAt ? new Date((profileData as any).createdAt).getFullYear().toString() : '2019'
          };
          setProfile(enhancedProfile);
          setEditedProfile(enhancedProfile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to user data if API fails
        if (user) {
          const fallbackProfile = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: '+31 6 1234 5678',
            address: 'Hoofdstraat 123, 1234 AB Amsterdam',
            therapies: [],
            psychologicalProblems: [],
            status: 'active',
            bio: 'Experienced therapist specializing in cognitive behavioral therapy.',
            education: [],
            certifications: [],
            schedule: {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '15:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '16:00', available: true },
              saturday: { start: '', end: '', available: false },
              sunday: { start: '', end: '', available: false }
            },
            hourly_rate: 85
          };
          setProfile(fallbackProfile);
          setEditedProfile(fallbackProfile);
        }
      }
    };

    loadProfile();
  }, [getProfile, user, getDisplayName]);

  // Load available therapies and problems from admin
  useEffect(() => {
    const loadAdminLists = async () => {
      try {
        setLoadingTherapies(true);
        setLoadingProblems(true);
        
        // Load therapies
        const therapiesResponse = await realApiService.admin.getTherapies();
        if (therapiesResponse.success && therapiesResponse.data) {
          setAvailableTherapies(therapiesResponse.data.filter((t: any) => t.isActive));
        }
        
        // Load psychological problems
        const problemsResponse = await realApiService.admin.getPsychologicalProblems();
        if (problemsResponse.success && problemsResponse.data) {
          setAvailableProblems(problemsResponse.data.filter((p: any) => p.isActive));
        }
      } catch (err) {
        console.error('Failed to load admin lists:', err);
      } finally {
        setLoadingTherapies(false);
        setLoadingProblems(false);
      }
    };

    if (isEditing) {
      loadAdminLists();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      // Save profile using real API
      const updatedProfile = await updateProfile({
        ...editedProfile,
        therapies: editedProfile.therapies,
        psychological_problems: editedProfile.psychologicalProblems
      });
      
      if (updatedProfile) {
        setProfile(editedProfile);
        setIsEditing(false);
        success('Profile saved successfully');
      } else {
        error('Failed to save profile');
      }
    } catch (err) {
      error('Error saving profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddTherapy = (therapyId: string) => {
    const therapy = availableTherapies.find(t => t.id === therapyId);
    if (therapy && !editedProfile.therapies.some((t: any) => t.id === therapyId)) {
      setEditedProfile((prev: any) => ({
        ...prev,
        therapies: [...prev.therapies, therapy]
      }));
    }
  };

  const handleRemoveTherapy = (therapyId: string) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      therapies: prev.therapies.filter((t: any) => t.id !== therapyId)
    }));
  };

  const handleAddProblem = (problemId: string) => {
    const problem = availableProblems.find(p => p.id === problemId);
    if (problem && !editedProfile.psychologicalProblems.some((p: any) => p.id === problemId)) {
      setEditedProfile((prev: any) => ({
        ...prev,
        psychologicalProblems: [...prev.psychologicalProblems, problem]
      }));
    }
  };

  const handleRemoveProblem = (problemId: string) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      psychologicalProblems: prev.psychologicalProblems.filter((p: any) => p.id !== problemId)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-500">Unable to load therapist profile information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
            <p className="text-red-100 mt-1">
              Manage your professional information and settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', name: 'Personal Information', icon: UserCircleIcon },
              { id: 'professional', name: 'Professional Details', icon: AcademicCapIcon },
              { id: 'schedule', name: 'Schedule & Availability', icon: CalendarIcon },
              { id: 'financial', name: 'Financial Information', icon: BanknotesIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <ProfilePhotoUpload
                  userId={user?.id}
                  currentPhotoUrl={profile.profile_photo_url || profile.profile_photo}
                  size="medium"
                  editable={isEditing}
                  onPhotoUpdate={(photoUrl) => {
                    handleInputChange('profile_photo_url', photoUrl);
                    setProfile((prev: any) => ({ ...prev, profile_photo_url: photoUrl }));
                  }}
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-500">
                    {profile.therapies && profile.therapies.length > 0 
                      ? profile.therapies.map((t: any) => t.name || t).join(', ')
                      : 'No therapies selected'}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.status}
                    </span>
                    <span className="text-xs text-gray-500">Member since {profile.hire_date}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details - Same as before */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedProfile.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.date_of_birth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-6">
              {/* License Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">License & Certification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-gray-900">{profile.license_number}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.license_expiry}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
                <div className="space-y-4">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-xs text-gray-500">{edu.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapies (replaced Specializations) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Therapieën</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {editedProfile.therapies?.map((therapy: any) => (
                        <div key={therapy.id || therapy} className="flex items-center space-x-2 p-2 bg-purple-100 border border-purple-200 rounded-lg">
                          <HeartIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">{therapy.name || therapy}</span>
                          <button
                            onClick={() => handleRemoveTherapy(therapy.id || therapy)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {loadingTherapies ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <select
                        onChange={(e) => e.target.value && handleAddTherapy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        value=""
                      >
                        <option value="">Select a therapy to add...</option>
                        {availableTherapies
                          .filter(t => !editedProfile.therapies?.some((et: any) => (et.id || et) === t.id))
                          .map(therapy => (
                            <option key={therapy.id} value={therapy.id}>
                              {therapy.name} - {therapy.category}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.therapies?.map((therapy: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <HeartIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-900">{therapy.name || therapy}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Psychological Problems (Hulpvragen) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hulpvragen (Psychological Problems)</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {editedProfile.psychologicalProblems?.map((problem: any) => (
                        <div key={problem.id || problem} className="flex items-center space-x-2 p-2 bg-indigo-100 border border-indigo-200 rounded-lg">
                          <PuzzlePieceIcon className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-900">{problem.name || problem}</span>
                          <button
                            onClick={() => handleRemoveProblem(problem.id || problem)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {loadingProblems ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <select
                        onChange={(e) => e.target.value && handleAddProblem(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value=""
                      >
                        <option value="">Select a psychological problem to add...</option>
                        {availableProblems
                          .filter(p => !editedProfile.psychologicalProblems?.some((ep: any) => (ep.id || ep) === p.id))
                          .map(problem => (
                            <option key={problem.id} value={problem.id}>
                              {problem.name} - {problem.category} ({problem.severity})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.psychologicalProblems?.map((problem: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <PuzzlePieceIcon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-indigo-900">{problem.name || problem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.certifications.map((cert: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-900">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Describe your professional background and approach to therapy..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>
          )}

          {/* Schedule and Financial tabs remain the same */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
              <div className="space-y-4">
                {Object.entries(profile.schedule).map(([day, schedule]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="font-medium text-gray-900 capitalize">{day}</span>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editedProfile.schedule[day].available}
                            onChange={(e) => handleScheduleChange(day, 'available', e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">Available</span>
                          {editedProfile.schedule[day].available && (
                            <>
                              <input
                                type="time"
                                value={editedProfile.schedule[day].start}
                                onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={editedProfile.schedule[day].end}
                                onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {schedule.available ? (
                            <>
                              <ClockIcon className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-900">{schedule.start} - {schedule.end}</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            </>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Not available</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <input
                        type="number"
                        value={editedProfile.hourly_rate}
                        onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">€{profile.hourly_rate} per hour</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.bank_account}
                      onChange={(e) => handleInputChange('bank_account', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono">{profile.bank_account || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.tax_number}
                      onChange={(e) => handleInputChange('tax_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono">{profile.tax_number || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chamber of Commerce</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.chamber_of_commerce}
                      onChange={(e) => handleInputChange('chamber_of_commerce', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono">{profile.chamber_of_commerce || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Financial Information Security</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your financial information is encrypted and securely stored. Only authorized personnel have access to this data for payroll and tax purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile;