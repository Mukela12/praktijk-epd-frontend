import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  KeyIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface AssistantSettings {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  supervisor: string;
  
  // Work Preferences
  preferred_language: string;
  time_zone: string;
  working_hours: {
    start: string;
    end: string;
    break_duration: number;
  };
  max_concurrent_tasks: number;
  task_priority_preference: 'urgent_first' | 'chronological' | 'client_based';
  
  // Notification Settings
  email_notifications: boolean;
  desktop_notifications: boolean;
  task_reminders: boolean;
  appointment_alerts: boolean;
  client_message_alerts: boolean;
  system_updates: boolean;
  
  // Communication Preferences
  auto_response_enabled: boolean;
  auto_response_message: string;
  client_communication_hours: {
    start: string;
    end: string;
  };
  preferred_contact_method: 'email' | 'phone' | 'internal_chat';
  
  // Security Settings
  two_factor_enabled: boolean;
  session_timeout: number; // minutes
  password_last_changed: string;
  access_level: string;
}

const AssistantSettings: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning } = useAlert();

  // State
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'notifications' | 'communication' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock settings data
  const mockSettings: AssistantSettings = {
    first_name: user?.first_name || 'Emma',
    last_name: user?.last_name || 'Thompson', 
    email: user?.email || 'emma.thompson@praktijkepd.nl',
    phone: '+31 20 123 4567',
    employee_id: 'AST001',
    department: 'Client Support',
    supervisor: 'Dr. Mark Johnson',
    preferred_language: 'nl-NL',
    time_zone: 'Europe/Amsterdam',
    working_hours: {
      start: '08:30',
      end: '17:00',
      break_duration: 30
    },
    max_concurrent_tasks: 8,
    task_priority_preference: 'urgent_first',
    email_notifications: true,
    desktop_notifications: true,
    task_reminders: true,
    appointment_alerts: true,
    client_message_alerts: true,
    system_updates: false,
    auto_response_enabled: true,
    auto_response_message: 'Thank you for your message. I will respond within 2 hours during business hours.',
    client_communication_hours: {
      start: '09:00',
      end: '17:00'
    },
    preferred_contact_method: 'email',
    two_factor_enabled: true,
    session_timeout: 60,
    password_last_changed: '2024-06-15',
    access_level: 'Standard Assistant'
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
  const handleSettingChange = (key: keyof AssistantSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleWorkingHoursChange = (field: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        working_hours: {
          ...settings.working_hours,
          [field]: value
        }
      });
      setHasChanges(true);
    }
  };

  const handleCommunicationHoursChange = (field: string, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        client_communication_hours: {
          ...settings.client_communication_hours,
          [field]: value
        }
      });
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
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              Assistant Settings
            </h1>
            <p className="text-orange-100 mt-1">
              Configure your work preferences and system settings
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
            { id: 'work', label: 'Work Preferences', icon: ClockIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'communication', label: 'Communication', icon: PhoneIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
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
              <UserIcon className="w-5 h-5 mr-2 text-orange-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={settings.last_name}
                    onChange={(e) => handleSettingChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={settings.employee_id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={settings.department}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                <input
                  type="text"
                  value={settings.supervisor}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <input
                  type="text"
                  value={settings.access_level}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'work' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
              Working Hours
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={settings.working_hours.start}
                    onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={settings.working_hours.end}
                    onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.working_hours.break_duration}
                  onChange={(e) => handleWorkingHoursChange('break_duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={15}
                  max={120}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Tasks</label>
                <input
                  type="number"
                  value={settings.max_concurrent_tasks}
                  onChange={(e) => handleSettingChange('max_concurrent_tasks', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={1}
                  max={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Priority Order</label>
                <select
                  value={settings.task_priority_preference}
                  onChange={(e) => handleSettingChange('task_priority_preference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="urgent_first">Urgent Tasks First</option>
                  <option value="chronological">Chronological Order</option>
                  <option value="client_based">Client-Based Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={settings.preferred_language}
                  onChange={(e) => handleSettingChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="nl-NL">Dutch</option>
                  <option value="en-US">English</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'notifications' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-orange-600" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'desktop_notifications', label: 'Desktop Notifications', description: 'Show system notifications on desktop' },
              { key: 'task_reminders', label: 'Task Reminders', description: 'Get reminded about upcoming task deadlines' },
              { key: 'appointment_alerts', label: 'Appointment Alerts', description: 'Notifications for upcoming appointments' },
              { key: 'client_message_alerts', label: 'Client Messages', description: 'Instant notifications for new client messages' },
              { key: 'system_updates', label: 'System Updates', description: 'Notifications about system maintenance and updates' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{notification.label}</span>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[notification.key as keyof AssistantSettings] as boolean}
                  onChange={(e) => handleSettingChange(notification.key as keyof AssistantSettings, e.target.checked)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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
              <PhoneIcon className="w-5 h-5 mr-2 text-orange-600" />
              Communication Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                <select
                  value={settings.preferred_contact_method}
                  onChange={(e) => handleSettingChange('preferred_contact_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="internal_chat">Internal Chat</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Contact Start</label>
                  <input
                    type="time"
                    value={settings.client_communication_hours.start}
                    onChange={(e) => handleCommunicationHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Contact End</label>
                  <input
                    type="time"
                    value={settings.client_communication_hours.end}
                    onChange={(e) => handleCommunicationHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_response"
                  checked={settings.auto_response_enabled}
                  onChange={(e) => handleSettingChange('auto_response_enabled', e.target.checked)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_response" className="ml-2 text-sm font-medium text-gray-700">
                  Enable auto-response messages
                </label>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Response Message</h3>
            <div className="space-y-4">
              <textarea
                value={settings.auto_response_message}
                onChange={(e) => handleSettingChange('auto_response_message', e.target.value)}
                disabled={!settings.auto_response_enabled}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your auto-response message..."
              />
              <p className="text-sm text-gray-500">
                This message will be sent automatically when clients contact you outside business hours.
              </p>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-orange-600" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                  <p className="text-sm text-gray-600">Add extra security to your account</p>
                </div>
                <StatusBadge 
                  status={settings.two_factor_enabled ? 'enabled' : 'disabled'} 
                  type={settings.two_factor_enabled ? 'paid' : 'pending'} 
                  size="sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                <select
                  value={settings.session_timeout}
                  onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
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
                    onClick={() => info('Password change feature requires authentication')}
                  >
                    Change
                  </PremiumButton>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Account Active</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Your account is in good standing</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Security Score: Good</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">All security features are properly configured</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default AssistantSettings;