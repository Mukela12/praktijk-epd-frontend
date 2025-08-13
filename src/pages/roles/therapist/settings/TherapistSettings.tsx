import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  KeyIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface TherapistSettings {
  // Profile settings
  specializations: string[];
  languages: string[];
  session_types: string[];
  preferred_duration: number;
  max_clients: number;
  
  // Availability settings
  working_hours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  break_duration: number;
  advance_booking_days: number;
  
  // Notification settings
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  client_messages: boolean;
  session_notes_reminder: boolean;
  
  // Communication preferences
  telehealth_platform: string;
  allow_phone_sessions: boolean;
  allow_video_sessions: boolean;
  emergency_contact: string;
  
  // Privacy & Security
  two_factor_enabled: boolean;
  session_recording: boolean;
  data_sharing_consent: boolean;
}

const TherapistSettings: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning } = useAlert();

  // State
  const [settings, setSettings] = useState<TherapistSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'availability' | 'notifications' | 'communication' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock settings data
  const mockSettings: TherapistSettings = {
    specializations: ['Cognitive Behavioral Therapy', 'EMDR', 'Anxiety Disorders', 'Depression'],
    languages: ['Dutch', 'English', 'German'],
    session_types: ['Individual Therapy', 'Group Therapy', 'Assessment'],
    preferred_duration: 50,
    max_clients: 25,
    working_hours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '15:00', available: true },
      saturday: { start: '10:00', end: '14:00', available: false },
      sunday: { start: '10:00', end: '14:00', available: false }
    },
    break_duration: 10,
    advance_booking_days: 30,
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    client_messages: true,
    session_notes_reminder: true,
    telehealth_platform: 'zoom',
    allow_phone_sessions: true,
    allow_video_sessions: true,
    emergency_contact: '+31 6 12345678',
    two_factor_enabled: true,
    session_recording: false,
    data_sharing_consent: true
  };

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // In a real app, this would fetch from API
        setTimeout(() => {
          setSettings(mockSettings);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(mockSettings);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle setting changes
  const handleSettingChange = (key: keyof TherapistSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        working_hours: {
          ...settings.working_hours,
          [day]: {
            ...settings.working_hours[day as keyof typeof settings.working_hours],
            [field]: value
          }
        }
      });
      setHasChanges(true);
    }
  };

  const handleArrayChange = (key: keyof TherapistSettings, newArray: string[]) => {
    if (settings) {
      setSettings({ ...settings, [key]: newArray });
      setHasChanges(true);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      warning('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
    info('Settings reset to defaults');
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              My Settings
            </h1>
            <p className="text-green-100 mt-1">
              Customize your profile, availability, and preferences
            </p>
          </div>
          <div className="flex space-x-3">
            {hasChanges && (
              <>
                <PremiumButton
                  variant="outline"
                  onClick={handleReset}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Reset
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  icon={CheckCircleIcon}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </PremiumButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <PremiumCard>
        <div className="flex flex-wrap items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'availability', label: 'Availability', icon: CalendarIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'communication', label: 'Communication', icon: VideoCameraIcon },
            { id: 'security', label: 'Security & Privacy', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-green-600" />
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.specializations.map((spec, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {spec}
                      <button
                        onClick={() => handleArrayChange('specializations', settings.specializations.filter((_, i) => i !== index))}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add specialization..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleArrayChange('specializations', [...settings.specializations, e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.languages.map((lang, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {lang}
                      <button
                        onClick={() => handleArrayChange('languages', settings.languages.filter((_, i) => i !== index))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Session Duration (minutes)</label>
                <select
                  value={settings.preferred_duration}
                  onChange={(e) => handleSettingChange('preferred_duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={50}>50 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Clients</label>
                <input
                  type="number"
                  value={settings.max_clients}
                  onChange={(e) => handleSettingChange('max_clients', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Types</h3>
            <div className="space-y-3">
              {settings.session_types.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{type}</span>
                  <button
                    onClick={() => handleArrayChange('session_types', settings.session_types.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'availability' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
            Working Hours
          </h3>
          <div className="space-y-4">
            {Object.entries(settings.working_hours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20">
                  <span className="font-medium text-gray-900 capitalize">{day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hours.available}
                    onChange={(e) => handleWorkingHoursChange(day, 'available', e.target.checked)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                {hours.available && (
                  <>
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <span className="text-gray-600">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration (minutes)</label>
              <input
                type="number"
                value={settings.break_duration}
                onChange={(e) => handleSettingChange('break_duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={0}
                max={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Booking (days)</label>
              <input
                type="number"
                value={settings.advance_booking_days}
                onChange={(e) => handleSettingChange('advance_booking_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={1}
                max={365}
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">Advanced Availability Settings</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Manage exceptions, vacation mode, and detailed scheduling preferences
                </p>
              </div>
              <a
                href="/therapist/availability"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Manage Availability
              </a>
            </div>
          </div>
        </PremiumCard>
      )}

      {activeTab === 'notifications' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-green-600" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
              { key: 'appointment_reminders', label: 'Appointment Reminders', description: 'Get reminded about upcoming appointments' },
              { key: 'client_messages', label: 'Client Messages', description: 'Notifications for new client messages' },
              { key: 'session_notes_reminder', label: 'Session Notes Reminder', description: 'Reminder to complete session notes' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{notification.label}</span>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[notification.key as keyof TherapistSettings] as boolean}
                  onChange={(e) => handleSettingChange(notification.key as keyof TherapistSettings, e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <VideoCameraIcon className="w-5 h-5 mr-2 text-green-600" />
              Session Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Phone Sessions</span>
                  <p className="text-sm text-gray-600">Allow phone-based therapy sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_phone_sessions}
                  onChange={(e) => handleSettingChange('allow_phone_sessions', e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Video Sessions</span>
                  <p className="text-sm text-gray-600">Allow video-based therapy sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_video_sessions}
                  onChange={(e) => handleSettingChange('allow_video_sessions', e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telehealth Platform</label>
                <select
                  value={settings.telehealth_platform}
                  onChange={(e) => handleSettingChange('telehealth_platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="meet">Google Meet</option>
                  <option value="webex">Cisco Webex</option>
                </select>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone Number</label>
                <input
                  type="tel"
                  value={settings.emergency_contact}
                  onChange={(e) => handleSettingChange('emergency_contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  This number will be used for emergency situations and will be available to clients and colleagues.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'security' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
            Security & Privacy Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={settings.two_factor_enabled ? 'active' : 'inactive'} type={settings.two_factor_enabled ? 'paid' : 'pending'} size="sm" />
                <PremiumButton
                  size="sm"
                  variant="outline"
                  icon={PencilIcon}
                  onClick={() => info('Two-factor authentication settings')}
                >
                  Configure
                </PremiumButton>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Session Recording</span>
                <p className="text-sm text-gray-600">Allow recording of therapy sessions (with client consent)</p>
              </div>
              <input
                type="checkbox"
                checked={settings.session_recording}
                onChange={(e) => handleSettingChange('session_recording', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Data Sharing Consent</span>
                <p className="text-sm text-gray-600">Consent to anonymized data sharing for research purposes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.data_sharing_consent}
                onChange={(e) => handleSettingChange('data_sharing_consent', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default TherapistSettings;