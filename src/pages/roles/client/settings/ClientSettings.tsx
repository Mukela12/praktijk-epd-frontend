import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface ClientSettings {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Preferences
  preferred_language: string;
  time_zone: string;
  preferred_communication: 'email' | 'sms' | 'phone' | 'app';
  session_reminders: boolean;
  reminder_time: number; // hours before appointment
  
  // Privacy & Notifications
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  treatment_updates: boolean;
  newsletter_subscription: boolean;
  data_sharing_research: boolean;
  
  // Therapy Preferences
  preferred_session_duration: number;
  preferred_session_type: 'in_person' | 'video' | 'phone' | 'no_preference';
  therapy_goals: string[];
  
  // Security
  two_factor_enabled: boolean;
  password_last_changed: string;
  login_notifications: boolean;
}

const ClientSettings: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning } = useAlert();

  // State
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'security' | 'payment'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock settings data
  const mockSettings: ClientSettings = {
    first_name: user?.first_name || 'John',
    last_name: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@email.com',
    phone: '+31 6 12345678',
    date_of_birth: '1990-05-15',
    address: 'Prinsengracht 123, 1015 DX Amsterdam, Netherlands',
    emergency_contact: {
      name: 'Jane Doe',
      phone: '+31 6 87654321',
      relationship: 'Spouse'
    },
    preferred_language: 'nl-NL',
    time_zone: 'Europe/Amsterdam',
    preferred_communication: 'email',
    session_reminders: true,
    reminder_time: 24,
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    treatment_updates: true,
    newsletter_subscription: false,
    data_sharing_research: true,
    preferred_session_duration: 50,
    preferred_session_type: 'video',
    therapy_goals: [
      'Reduce anxiety in social situations',
      'Improve sleep quality',
      'Develop coping strategies',
      'Build self-confidence'
    ],
    two_factor_enabled: false,
    password_last_changed: '2024-06-15',
    login_notifications: true
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
  const handleSettingChange = (key: keyof ClientSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        emergency_contact: {
          ...settings.emergency_contact,
          [field]: value
        }
      });
      setHasChanges(true);
    }
  };

  const handleArrayChange = (key: keyof ClientSettings, newArray: string[]) => {
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

  // Handle password change
  const handlePasswordChange = () => {
    info('Redirecting to password change form...');
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              My Settings
            </h1>
            <p className="text-purple-100 mt-1">
              Manage your profile, preferences, and privacy settings
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
            { id: 'preferences', label: 'Preferences', icon: HeartIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'privacy', label: 'Privacy', icon: DocumentTextIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'payment', label: 'Payment', icon: CreditCardIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
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
              <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={settings.first_name}
                    onChange={(e) => handleSettingChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={settings.last_name}
                    onChange={(e) => handleSettingChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={settings.date_of_birth}
                  onChange={(e) => handleSettingChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={settings.emergency_contact.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.emergency_contact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={settings.emergency_contact.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2 text-purple-600" />
              General Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                <select
                  value={settings.preferred_language}
                  onChange={(e) => handleSettingChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="nl-NL">Dutch</option>
                  <option value="en-US">English</option>
                  <option value="de-DE">German</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <select
                  value={settings.time_zone}
                  onChange={(e) => handleSettingChange('time_zone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Communication</label>
                <select
                  value={settings.preferred_communication}
                  onChange={(e) => handleSettingChange('preferred_communication', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Phone</option>
                  <option value="app">App Notifications</option>
                </select>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Therapy Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Session Duration</label>
                <select
                  value={settings.preferred_session_duration}
                  onChange={(e) => handleSettingChange('preferred_session_duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={50}>50 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Session Type</label>
                <select
                  value={settings.preferred_session_type}
                  onChange={(e) => handleSettingChange('preferred_session_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="in_person">In Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="no_preference">No Preference</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="session_reminders"
                  checked={settings.session_reminders}
                  onChange={(e) => handleSettingChange('session_reminders', e.target.checked)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="session_reminders" className="ml-2 text-sm font-medium text-gray-700">
                  Enable session reminders
                </label>
              </div>
              {settings.session_reminders && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Time</label>
                  <select
                    value={settings.reminder_time}
                    onChange={(e) => handleSettingChange('reminder_time', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={4}>4 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                  </select>
                </div>
              )}
            </div>
          </PremiumCard>

          <PremiumCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Therapy Goals</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.therapy_goals.map((goal, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {goal}
                  <button
                    onClick={() => handleArrayChange('therapy_goals', settings.therapy_goals.filter((_, i) => i !== index))}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a therapy goal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleArrayChange('therapy_goals', [...settings.therapy_goals, e.currentTarget.value.trim()]);
                  e.currentTarget.value = '';
                }
              }}
            />
          </PremiumCard>
        </div>
      )}

      {activeTab === 'notifications' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-purple-600" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            {[
              { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
              { key: 'appointment_reminders', label: 'Appointment Reminders', description: 'Get reminded about upcoming appointments' },
              { key: 'treatment_updates', label: 'Treatment Updates', description: 'Receive updates about your treatment progress' },
              { key: 'newsletter_subscription', label: 'Newsletter', description: 'Receive practice newsletter and health tips' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{notification.label}</span>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[notification.key as keyof ClientSettings] as boolean}
                  onChange={(e) => handleSettingChange(notification.key as keyof ClientSettings, e.target.checked)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {activeTab === 'privacy' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-600" />
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Research Data Sharing</span>
                <p className="text-sm text-gray-600">Allow anonymized data to be used for mental health research</p>
              </div>
              <input
                type="checkbox"
                checked={settings.data_sharing_research}
                onChange={(e) => handleSettingChange('data_sharing_research', e.target.checked)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Data Protection</h4>
              <p className="text-sm text-blue-800">
                Your personal health information is protected under GDPR and healthcare privacy regulations. 
                We use end-to-end encryption for all communications and store data securely.
              </p>
            </div>
          </div>
        </PremiumCard>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-600" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge 
                    status={settings.two_factor_enabled ? 'enabled' : 'disabled'} 
                    type={settings.two_factor_enabled ? 'paid' : 'pending'} 
                    size="sm" 
                  />
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    icon={PencilIcon}
                    onClick={() => info('Two-factor authentication settings')}
                  >
                    {settings.two_factor_enabled ? 'Manage' : 'Enable'}
                  </PremiumButton>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Password</span>
                  <p className="text-sm text-gray-600">
                    Last changed: {new Date(settings.password_last_changed).toLocaleDateString()}
                  </p>
                </div>
                <PremiumButton
                  size="sm"
                  variant="outline"
                  icon={KeyIcon}
                  onClick={handlePasswordChange}
                >
                  Change
                </PremiumButton>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Login Notifications</span>
                  <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.login_notifications}
                  onChange={(e) => handleSettingChange('login_notifications', e.target.checked)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Download Your Data</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Request a copy of all your personal data and therapy records.
                </p>
                <PremiumButton size="sm" variant="outline" onClick={() => info('Data export request submitted')}>
                  Request Export
                </PremiumButton>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <PremiumButton 
                  size="sm" 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => warning('Account deletion requires contacting support')}
                >
                  Delete Account
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2 text-purple-600" />
              Payment Settings
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Manage your payment methods for automatic billing and therapy session payments.
                </p>
                <PremiumButton
                  variant="primary"
                  icon={CreditCardIcon}
                  onClick={() => window.location.href = '/client/payment-methods'}
                >
                  Manage Payment Methods
                </PremiumButton>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Automatic Payments</h4>
                <p className="text-sm text-blue-800">
                  When enabled, therapy session fees will be automatically collected from your default payment method after each session.
                  You'll receive an invoice before each payment is processed.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Payment Reminders</span>
                  <p className="text-sm text-gray-600">Receive reminders for unpaid invoices</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={(e) => info('Payment reminder settings updated')}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Billing Address</span>
                  <button
                    onClick={() => info('Edit billing address in profile settings')}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600">Same as profile address</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Invoice History</span>
                    <p className="text-sm text-gray-600">View and download your past invoices</p>
                  </div>
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/client/invoices'}
                  >
                    View Invoices
                  </PremiumButton>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default ClientSettings;