import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  KeyIcon,
  ServerIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface SystemSettings {
  practice_name: string;
  practice_address: string;
  practice_phone: string;
  practice_email: string;
  website: string;
  time_zone: string;
  currency: string;
  language: string;
  session_duration: number;
  max_clients_per_therapist: number;
  appointment_buffer: number;
  auto_reminders: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  backup_frequency: string;
  data_retention_days: number;
  two_factor_required: boolean;
  password_expiry_days: number;
}

// Extended company settings type for the backend response
interface ExtendedCompanySettings {
  company_name: string;
  address: string | { street: string; house_number: string; postal_code: string; city: string; country: string; };
  phone: string;
  email: string;
  website?: string;
  timezone?: string;
  currency?: string;
  default_language?: string;
  session_duration?: number;
  max_clients_per_therapist?: number;
  appointment_buffer_minutes?: number;
  appointment_reminders_enabled?: boolean;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  backup_frequency?: string;
  data_retention_days?: number;
  two_factor_required?: boolean;
  password_expiry_days?: number;
  integrations?: IntegrationSettings;
}

interface IntegrationSettings {
  calendar_sync: boolean;
  email_provider: string;
  payment_gateway: string;
  insurance_integration: boolean;
  telehealth_platform: string;
}

const AdminSettings: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning } = useAlert();

  // State
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations' | 'backup'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Default settings structure
  const defaultSettings: SystemSettings = {
    practice_name: '',
    practice_address: '',
    practice_phone: '',
    practice_email: '',
    website: '',
    time_zone: 'Europe/Amsterdam',
    currency: 'EUR',
    language: 'nl-NL',
    session_duration: 50,
    max_clients_per_therapist: 25,
    appointment_buffer: 10,
    auto_reminders: true,
    email_notifications: true,
    sms_notifications: false,
    backup_frequency: 'daily',
    data_retention_days: 2555, // 7 years
    two_factor_required: true,
    password_expiry_days: 90
  };

  const defaultIntegrations: IntegrationSettings = {
    calendar_sync: false,
    email_provider: 'none',
    payment_gateway: 'none',
    insurance_integration: false,
    telehealth_platform: 'none'
  };

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Load company settings from backend
        const { adminApi } = await import('@/services/endpoints');
        const response = await adminApi.getCompanySettings();
        
        if (response.success && response.data) {
          // Map backend data to our settings structure
          const data = response.data as ExtendedCompanySettings;
          const addressString = typeof data.address === 'object' 
            ? `${data.address.street} ${data.address.house_number}, ${data.address.postal_code} ${data.address.city}` 
            : data.address || defaultSettings.practice_address;
            
          const backendSettings: SystemSettings = {
            practice_name: data.company_name || defaultSettings.practice_name,
            practice_address: addressString,
            practice_phone: data.phone || defaultSettings.practice_phone,
            practice_email: data.email || defaultSettings.practice_email,
            website: data.website || defaultSettings.website,
            time_zone: data.timezone || defaultSettings.time_zone,
            currency: data.currency || defaultSettings.currency,
            language: data.default_language || defaultSettings.language,
            session_duration: data.session_duration || defaultSettings.session_duration,
            max_clients_per_therapist: data.max_clients_per_therapist || defaultSettings.max_clients_per_therapist,
            appointment_buffer: data.appointment_buffer_minutes || defaultSettings.appointment_buffer,
            auto_reminders: data.appointment_reminders_enabled ?? defaultSettings.auto_reminders,
            email_notifications: data.email_notifications_enabled ?? defaultSettings.email_notifications,
            sms_notifications: data.sms_notifications_enabled ?? defaultSettings.sms_notifications,
            backup_frequency: data.backup_frequency || defaultSettings.backup_frequency,
            data_retention_days: data.data_retention_days || defaultSettings.data_retention_days,
            two_factor_required: data.two_factor_required ?? defaultSettings.two_factor_required,
            password_expiry_days: data.password_expiry_days || defaultSettings.password_expiry_days
          };
          
          setSettings(backendSettings);
          
          // Set integrations if available
          if (data.integrations) {
            setIntegrations(data.integrations);
          } else {
            setIntegrations(defaultIntegrations);
          }
        } else {
          // Use defaults if no backend data
          setSettings(defaultSettings);
          setIntegrations(defaultIntegrations);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fall back to defaults on error
        setSettings(defaultSettings);
        setIntegrations(defaultIntegrations);
        info('Using default settings. Configure your practice settings below.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle setting changes
  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleIntegrationChange = (key: keyof IntegrationSettings, value: any) => {
    if (integrations) {
      setIntegrations({ ...integrations, [key]: value });
      setHasChanges(true);
    }
  };

  // Save settings
  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { adminApi } = await import('@/services/endpoints');
      
      // Map our settings to backend format
      const settingsToSave = {
        company_name: settings.practice_name,
        address: settings.practice_address,
        phone: settings.practice_phone,
        email: settings.practice_email,
        website: settings.website,
        timezone: settings.time_zone,
        currency: settings.currency,
        default_language: settings.language,
        session_duration: settings.session_duration,
        max_clients_per_therapist: settings.max_clients_per_therapist,
        appointment_buffer_minutes: settings.appointment_buffer,
        appointment_reminders_enabled: settings.auto_reminders,
        email_notifications_enabled: settings.email_notifications,
        sms_notifications_enabled: settings.sms_notifications,
        backup_frequency: settings.backup_frequency,
        data_retention_days: settings.data_retention_days,
        two_factor_required: settings.two_factor_required,
        password_expiry_days: settings.password_expiry_days,
        integrations: integrations
      };
      
      const response = await adminApi.updateCompanySettings(settingsToSave as any);
      
      if (response.success) {
        success('Settings saved successfully');
        setHasChanges(false);
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      warning('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    // Reload settings from backend
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const { adminApi } = await import('@/services/endpoints');
        const response = await adminApi.getCompanySettings();
        
        if (response.success && response.data) {
          // Map backend data to our settings structure
          const data = response.data as ExtendedCompanySettings;
          const addressString = typeof data.address === 'object' 
            ? `${data.address.street} ${data.address.house_number}, ${data.address.postal_code} ${data.address.city}` 
            : data.address || defaultSettings.practice_address;
            
          const backendSettings: SystemSettings = {
            practice_name: data.company_name || defaultSettings.practice_name,
            practice_address: addressString,
            practice_phone: data.phone || defaultSettings.practice_phone,
            practice_email: data.email || defaultSettings.practice_email,
            website: data.website || defaultSettings.website,
            time_zone: data.timezone || defaultSettings.time_zone,
            currency: data.currency || defaultSettings.currency,
            language: data.default_language || defaultSettings.language,
            session_duration: data.session_duration || defaultSettings.session_duration,
            max_clients_per_therapist: data.max_clients_per_therapist || defaultSettings.max_clients_per_therapist,
            appointment_buffer: data.appointment_buffer_minutes || defaultSettings.appointment_buffer,
            auto_reminders: data.appointment_reminders_enabled ?? defaultSettings.auto_reminders,
            email_notifications: data.email_notifications_enabled ?? defaultSettings.email_notifications,
            sms_notifications: data.sms_notifications_enabled ?? defaultSettings.sms_notifications,
            backup_frequency: data.backup_frequency || defaultSettings.backup_frequency,
            data_retention_days: data.data_retention_days || defaultSettings.data_retention_days,
            two_factor_required: data.two_factor_required ?? defaultSettings.two_factor_required,
            password_expiry_days: data.password_expiry_days || defaultSettings.password_expiry_days
          };
          
          setSettings(backendSettings);
          
          if (data.integrations) {
            setIntegrations(data.integrations);
          } else {
            setIntegrations(defaultIntegrations);
          }
          
          setHasChanges(false);
          info('Settings reset to saved values');
        }
      } catch (error) {
        console.error('Failed to reload settings:', error);
        warning('Failed to reload settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  };

  if (isLoading || !settings || !integrations) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              System Settings
            </h1>
            <p className="text-indigo-100 mt-1">
              Configure practice settings, security, and integrations
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
            { id: 'general', label: 'General', icon: Cog6ToothIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'integrations', label: 'Integrations', icon: ServerIcon },
            { id: 'backup', label: 'Backup & Data', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
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
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Practice Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                <input
                  type="text"
                  value={settings.practice_name}
                  onChange={(e) => handleSettingChange('practice_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={settings.practice_address}
                  onChange={(e) => handleSettingChange('practice_address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.practice_phone}
                  onChange={(e) => handleSettingChange('practice_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.practice_email}
                  onChange={(e) => handleSettingChange('practice_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleSettingChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Regional Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <select
                  value={settings.time_zone}
                  onChange={(e) => handleSettingChange('time_zone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="nl-NL">Dutch</option>
                  <option value="en-US">English</option>
                  <option value="de-DE">German</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Appointment Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Session Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.session_duration}
                  onChange={(e) => handleSettingChange('session_duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Clients per Therapist</label>
                <input
                  type="number"
                  value={settings.max_clients_per_therapist}
                  onChange={(e) => handleSettingChange('max_clients_per_therapist', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Buffer (minutes)</label>
                <input
                  type="number"
                  value={settings.appointment_buffer}
                  onChange={(e) => handleSettingChange('appointment_buffer', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_reminders"
                  checked={settings.auto_reminders}
                  onChange={(e) => handleSettingChange('auto_reminders', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_reminders" className="ml-2 text-sm font-medium text-gray-700">
                  Enable automatic reminders
                </label>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Authentication Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="two_factor_required"
                  checked={settings.two_factor_required}
                  onChange={(e) => handleSettingChange('two_factor_required', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="two_factor_required" className="ml-2 text-sm font-medium text-gray-700">
                  Require two-factor authentication for all users
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
                <input
                  type="number"
                  value={settings.password_expiry_days}
                  onChange={(e) => handleSettingChange('password_expiry_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">Security Recommendation</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  We recommend enabling two-factor authentication and setting password expiry to 90 days or less.
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <KeyIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Access Control
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-800">SSL Certificate</span>
                    <p className="text-sm text-green-700">Valid until: March 2025</p>
                  </div>
                  <StatusBadge status="active" type="paid" size="sm" />
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-800">Data Encryption</span>
                    <p className="text-sm text-blue-700">AES-256 encryption enabled</p>
                  </div>
                  <StatusBadge status="active" type="paid" size="sm" />
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-purple-800">Audit Logging</span>
                    <p className="text-sm text-purple-700">All user actions logged</p>
                  </div>
                  <StatusBadge status="active" type="paid" size="sm" />
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'notifications' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Notification Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                  <p className="text-sm text-gray-600">Send notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                  <p className="text-sm text-gray-600">Send notifications via SMS (requires SMS provider)</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sms_notifications}
                  onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </PremiumCard>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ServerIcon className="w-5 h-5 mr-2 text-indigo-600" />
              External Integrations
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Calendar Sync</span>
                  <p className="text-sm text-gray-600">Sync with external calendars</p>
                </div>
                <input
                  type="checkbox"
                  checked={integrations.calendar_sync}
                  onChange={(e) => handleIntegrationChange('calendar_sync', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Provider</label>
                <select
                  value={integrations.email_provider}
                  onChange={(e) => handleIntegrationChange('email_provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="outlook">Microsoft Outlook</option>
                  <option value="gmail">Google Gmail</option>
                  <option value="custom">Custom SMTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Gateway</label>
                <select
                  value={integrations.payment_gateway}
                  onChange={(e) => handleIntegrationChange('payment_gateway', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="stripe">Stripe</option>
                  <option value="mollie">Mollie</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Calendar Sync</span>
                <StatusBadge status="active" type="paid" size="sm" />
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Email Provider</span>
                <StatusBadge status="active" type="paid" size="sm" />
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">Payment Gateway</span>
                <StatusBadge status="pending" type="pending" size="sm" />
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'backup' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Backup & Data Management
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                <select
                  value={settings.backup_frequency}
                  onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention (days)</label>
                <input
                  type="number"
                  value={settings.data_retention_days}
                  onChange={(e) => handleSettingChange('data_retention_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">Recommended: 2555 days (7 years) for healthcare records</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-800">Last Backup</span>
                    <p className="text-sm text-green-700">Today at 02:00 AM</p>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex space-x-3">
                <PremiumButton size="sm" variant="primary">
                  Backup Now
                </PremiumButton>
                <PremiumButton size="sm" variant="outline">
                  Download Backup
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default AdminSettings;