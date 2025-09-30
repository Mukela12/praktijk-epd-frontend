import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useClientDashboard } from '@/hooks/useApi';
import { useAlert } from '@/components/ui/CustomAlert';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ClientProfile: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: errorAlert, info } = useAlert();
  
  // API hooks
  const { getDashboard, getPreferences, updatePreferences, isLoading } = useClientDashboard();
  
  // State management
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'preferences' | 'privacy'>('personal');

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get profile data from real API
        const [dashboardData, preferencesData] = await Promise.all([
          getDashboard().catch(() => null),
          getPreferences().catch(() => null)
        ]);
        
        // Combine data from dashboard and preferences with fallbacks
        const enhancedProfile = {
          // Basic profile info from user or dashboard
          first_name: user?.first_name || 'Client',
          last_name: user?.last_name || 'User',
          name: getDisplayName(),
          email: user?.email || 'client@praktijkepd.nl',
          phone: '+31 6 1234 5678',
          date_of_birth: '1988-07-22',
          gender: 'Not specified',
          address: 'Keizersgracht 456, 1017 EG Amsterdam',
          status: user?.status || 'active',
          
          // Emergency contact
          emergency_contact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '+31 6 9876 5432'
          },
          
          // Insurance information
          insurance: {
            provider: 'Zilveren Kruis',
            policy_number: 'ZK-2023-891234',
            coverage_type: 'Basic + Mental Health',
            deductible_remaining: 185
          },
          
          // Medical history
          medical_history: {
            conditions: [],
            medications: [],
            allergies: [],
            previous_therapy: false
          },
          
          // Preferences from API or defaults
          preferences: {
            session_reminder: (preferencesData as any)?.appointmentReminders ?? true,
            email_notifications: (preferencesData as any)?.communicationMethod === 'email' || true,
            sms_notifications: (preferencesData as any)?.communicationMethod === 'sms' || false,
            preferred_time: 'afternoon',
            session_frequency: 'weekly',
            language: (preferencesData as any)?.language || 'Dutch'
          },
          
          // Privacy settings
          privacy_settings: {
            share_with_gp: true,
            data_sharing: false,
            marketing_emails: false,
            session_recordings: false
          },
          
          // Therapy goals
          therapy_goals: [
            'Improve mental wellbeing',
            'Develop coping strategies'
          ],
          
          // Dashboard data
          next_appointment: (dashboardData as any)?.upcomingAppointments?.[0]?.date || null,
          therapist_name: (dashboardData as any)?.therapist?.name || 'Not assigned',
          total_sessions: 0,
          remaining_sessions: 10
        };
        
        setProfile(enhancedProfile);
        setEditedProfile(enhancedProfile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to user data if API fails
        if (user) {
          const fallbackProfile = {
            first_name: user.first_name,
            last_name: user.last_name,
            name: getDisplayName(),
            email: user.email,
            phone: '+31 6 1234 5678',
            status: user.status || 'active',
            preferences: {
              session_reminder: true,
              email_notifications: true,
              sms_notifications: false,
              preferred_time: 'afternoon',
              session_frequency: 'weekly',
              language: 'Dutch'
            },
            privacy_settings: {
              share_with_gp: true,
              data_sharing: false,
              marketing_emails: false,
              session_recordings: false
            }
          };
          setProfile(fallbackProfile);
          setEditedProfile(fallbackProfile);
        }
      }
    };

    loadProfile();
  }, [getDashboard, getPreferences, user, getDisplayName]);

  const handleSave = async () => {
    try {
      // Save both profile data and preferences
      let profileUpdateSuccess = true;
      let preferencesUpdateSuccess = true;

      // Save full profile data if there are profile changes
      if (editedProfile.phone || editedProfile.emergencyContactName || editedProfile.emergencyContactPhone) {
        const profileData = {
          phone: editedProfile.phone,
          emergencyContactName: editedProfile.emergencyContactName,
          emergencyContactPhone: editedProfile.emergencyContactPhone,
          // Add other profile fields as needed
        };

        const profileResponse = await realApiService.client.updateProfile(profileData);
        if (!profileResponse.success) {
          profileUpdateSuccess = false;
        }
      }

      // Save preferences using existing API
      if (editedProfile.preferences) {
        const preferencesUpdate = await updatePreferences(editedProfile.preferences);
        if (!preferencesUpdate) {
          preferencesUpdateSuccess = false;
        }
      }

      // Handle success/error notifications
      if (profileUpdateSuccess && preferencesUpdateSuccess) {
        setProfile(editedProfile);
        setIsEditing(false);
        
        // SUCCESS NOTIFICATION: Profile updated successfully
        success('Your information has been updated and saved securely', {
          title: 'Profile Updated Successfully',
          duration: 4000
        });
      } else {
        // Partial success - update local state but show warning
        setProfile(editedProfile);
        setIsEditing(false);
        
        // WARNING NOTIFICATION: Some changes may not have been saved
        errorAlert('Please try saving again or contact support if the issue persists.', {
          title: 'Some Changes May Not Have Been Saved',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Still update local state for better UX
      setProfile(editedProfile);
      setIsEditing(false);
      
      // ERROR NOTIFICATION: Exception occurred during save
      errorAlert('Please check your connection and try again, or contact support if the issue persists.', {
        title: 'Error Saving Profile',
        duration: 6000
      });
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

  const handleNestedChange = (section: string, field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
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
        <p className="text-gray-500">Unable to load client profile information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
            <p className="text-purple-100 mt-1">
              Manage your personal information and therapy preferences
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
              { id: 'medical', name: 'Medical Information', icon: HeartIcon },
              { id: 'preferences', name: 'Preferences', icon: BellIcon },
              { id: 'privacy', name: 'Privacy Settings', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
              {/* Profile Photo and Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">Client ID: {profile.id}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profile.status === 'active_treatment' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">Member since {profile.registration_date}</span>
                  </div>
                  {profile.next_appointment && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          Next appointment: {profile.next_appointment} with {profile.therapist_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedProfile.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.date_of_birth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profile.address}</span>
                    </div>
                    <button
                      onClick={() => navigate('/client/address-change')}
                      className="btn-premium-secondary text-sm flex items-center space-x-1"
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Request Change</span>
                    </button>
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-2">
                      Address changes require administrative approval
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.emergency_contact?.name}
                        onChange={(e) => handleNestedChange('emergency_contact', 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.emergency_contact?.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.emergency_contact?.relationship}
                        onChange={(e) => handleNestedChange('emergency_contact', 'relationship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.emergency_contact?.relationship}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.emergency_contact?.phone}
                        onChange={(e) => handleNestedChange('emergency_contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.emergency_contact?.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              {/* Insurance Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                    <p className="text-gray-900">{profile.insurance?.provider}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                    <p className="text-gray-900 font-mono">{profile.insurance?.policy_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Type</label>
                    <p className="text-gray-900">{profile.insurance?.coverage_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Deductible</label>
                    <p className="text-gray-900">€{profile.insurance?.deductible_remaining}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.medical_history?.conditions.map((condition: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.medical_history?.medications.map((medication: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.medical_history?.allergies.map((allergy: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapy Goals */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Therapy Goals</h3>
                <div className="space-y-2">
                  {profile.therapy_goals?.map((goal: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-900">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Session Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Session Time</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences?.preferred_time}
                      onChange={(e) => handleNestedChange('preferences', 'preferred_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{profile.preferences?.preferred_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Frequency</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences?.session_frequency}
                      onChange={(e) => handleNestedChange('preferences', 'session_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{profile.preferences?.session_frequency}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences?.language}
                      onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Dutch">Dutch</option>
                      <option value="English">English</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.preferences?.language}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Session Reminders</p>
                      <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                    </div>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.preferences?.session_reminder}
                        onChange={(e) => handleNestedChange('preferences', 'session_reminder', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.preferences?.session_reminder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.preferences?.session_reminder ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.preferences?.email_notifications}
                        onChange={(e) => handleNestedChange('preferences', 'email_notifications', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.preferences?.email_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.preferences?.email_notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Get text message updates</p>
                    </div>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.preferences?.sms_notifications}
                        onChange={(e) => handleNestedChange('preferences', 'sms_notifications', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.preferences?.sms_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.preferences?.sms_notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Privacy & Data Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Share Information with GP</p>
                    <p className="text-sm text-gray-500">Allow sharing of therapy progress with your general practitioner</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.privacy_settings?.share_with_gp}
                        onChange={(e) => handleNestedChange('privacy_settings', 'share_with_gp', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <>
                        {profile.privacy_settings?.share_with_gp ? (
                          <EyeIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.privacy_settings?.share_with_gp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.privacy_settings?.share_with_gp ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Data Sharing for Research</p>
                    <p className="text-sm text-gray-500">Allow anonymized data to be used for research purposes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.privacy_settings?.data_sharing}
                        onChange={(e) => handleNestedChange('privacy_settings', 'data_sharing', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <>
                        {profile.privacy_settings?.data_sharing ? (
                          <EyeIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.privacy_settings?.data_sharing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.privacy_settings?.data_sharing ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Session Recordings</p>
                    <p className="text-sm text-gray-500">Allow sessions to be recorded for quality assurance</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.privacy_settings?.session_recordings}
                        onChange={(e) => handleNestedChange('privacy_settings', 'session_recordings', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.privacy_settings?.session_recordings ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {profile.privacy_settings?.session_recordings ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Marketing Communications</p>
                    <p className="text-sm text-gray-500">Receive information about new services and offers</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedProfile.privacy_settings?.marketing_emails}
                        onChange={(e) => handleNestedChange('privacy_settings', 'marketing_emails', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.privacy_settings?.marketing_emails ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.privacy_settings?.marketing_emails ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Data Protection</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your personal information is protected under GDPR and Dutch privacy laws. 
                      You have the right to access and modify your data at any time.
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

export default ClientProfile;