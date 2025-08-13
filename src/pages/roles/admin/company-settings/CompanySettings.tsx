import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  chamberOfCommerce: string;
  logo?: string;
  
  // Business settings
  defaultSessionDuration: number;
  sessionTypes: string[];
  operatingHours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  
  // Financial settings
  defaultHourlyRate: number;
  currency: string;
  paymentTerms: number;
  invoicePrefix: string;
  
  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: {
    email: boolean;
    sms: boolean;
    hours: number;
  };
  
  // Security settings
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
  };
  
  // System settings
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
}

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'business' | 'financial' | 'notifications' | 'security'>('company');

  // Load settings data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Try to get settings from real API (this endpoint may not exist yet)
        // For now, use fallback data
        const defaultSettings: CompanySettings = {
          name: 'PraktijkEPD',
          address: 'Hoofdstraat 123, 1234 AB Amsterdam',
          phone: '+31 20 123 4567',
          email: 'info@praktijkepd.nl',
          website: 'https://www.praktijkepd.nl',
          taxNumber: 'NL123456789B01',
          chamberOfCommerce: '12345678',
          
          defaultSessionDuration: 50,
          sessionTypes: ['Initial Consultation', 'Regular Therapy', 'Group Therapy', 'Emergency Session'],
          operatingHours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '16:00', available: true },
            saturday: { start: '', end: '', available: false },
            sunday: { start: '', end: '', available: false }
          },
          
          defaultHourlyRate: 85,
          currency: 'EUR',
          paymentTerms: 30,
          invoicePrefix: 'INV',
          
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: {
            email: true,
            sms: false,
            hours: 24
          },
          
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true
          },
          
          timezone: 'Europe/Amsterdam',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          language: 'Dutch'
        };
        
        setSettings(defaultSettings);
        setEditedSettings(defaultSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!editedSettings) return;
    
    try {
      setIsSaving(true);
      
      // Here you would save to the real API
      // await realApiService.admin.updateCompanySettings(editedSettings);
      
      // For now, just update local state
      setSettings(editedSettings);
      setIsEditing(false);
      console.log('Settings saved:', editedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSettings(settings);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      [field]: value
    });
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      [parent]: {
        ...(editedSettings as any)[parent],
        [field]: value
      }
    });
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      operatingHours: {
        ...editedSettings.operatingHours,
        [day]: {
          ...editedSettings.operatingHours[day],
          [field]: value
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <CogIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings not found</h3>
        <p className="text-gray-500">Unable to load company settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Company Settings</h1>
            <p className="text-blue-100 mt-1">
              Manage your practice configuration and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'company', name: 'Company Info', icon: BuildingOfficeIcon },
              { id: 'business', name: 'Business Settings', icon: ClockIcon },
              { id: 'financial', name: 'Financial Settings', icon: BanknotesIcon },
              { id: 'notifications', name: 'Notifications', icon: BellIcon },
              { id: 'security', name: 'Security', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              
              {/* Company Logo */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Company Logo" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Company Logo</h4>
                  <p className="text-sm text-gray-500">Upload your company logo (max 2MB)</p>
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSettings?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{settings.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedSettings?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{settings.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedSettings?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{settings.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedSettings?.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{settings.website}</span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSettings?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{settings.address}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSettings?.taxNumber || ''}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900 font-mono">{settings.taxNumber}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chamber of Commerce</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSettings?.chamberOfCommerce || ''}
                      onChange={(e) => handleInputChange('chamberOfCommerce', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900 font-mono">{settings.chamberOfCommerce}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Session Duration (minutes)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedSettings?.defaultSessionDuration || ''}
                      onChange={(e) => handleInputChange('defaultSessionDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{settings.defaultSessionDuration} minutes</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Language</label>
                  {isEditing ? (
                    <select
                      value={editedSettings?.language || ''}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Dutch">Dutch</option>
                      <option value="English">English</option>
                    </select>
                  ) : (
                    <span className="text-gray-900">{settings.language}</span>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Operating Hours</h4>
                <div className="space-y-4">
                  {Object.entries(settings.operatingHours).map(([day, schedule]) => (
                    <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-20">
                          <span className="font-medium text-gray-900 capitalize">{day}</span>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={editedSettings?.operatingHours[day].available || false}
                              onChange={(e) => handleOperatingHoursChange(day, 'available', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Open</span>
                            {editedSettings?.operatingHours[day].available && (
                              <>
                                <input
                                  type="time"
                                  value={editedSettings.operatingHours[day].start}
                                  onChange={(e) => handleOperatingHoursChange(day, 'start', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={editedSettings.operatingHours[day].end}
                                  onChange={(e) => handleOperatingHoursChange(day, 'end', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                  Open
                                </span>
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Closed</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Financial Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Hourly Rate</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <input
                        type="number"
                        value={editedSettings?.defaultHourlyRate || ''}
                        onChange={(e) => handleInputChange('defaultHourlyRate', parseFloat(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">€{settings.defaultHourlyRate} per hour</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (days)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedSettings?.paymentTerms || ''}
                      onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{settings.paymentTerms} days</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedSettings?.invoicePrefix || ''}
                      onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900 font-mono">{settings.invoicePrefix}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  {isEditing ? (
                    <select
                      value={editedSettings?.currency || ''}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  ) : (
                    <span className="text-gray-900">{settings.currency}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedSettings?.emailNotifications || false}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      settings.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedSettings?.smsNotifications || false}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      settings.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {settings.smsNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>

                {/* Appointment Reminders */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Appointment Reminders</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email Reminders</span>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedSettings?.appointmentReminders.email || false}
                          onChange={(e) => handleNestedInputChange('appointmentReminders', 'email', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          settings.appointmentReminders.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {settings.appointmentReminders.email ? 'On' : 'Off'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">SMS Reminders</span>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedSettings?.appointmentReminders.sms || false}
                          onChange={(e) => handleNestedInputChange('appointmentReminders', 'sms', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          settings.appointmentReminders.sms ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {settings.appointmentReminders.sms ? 'On' : 'Off'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Reminder Time (hours before)</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedSettings?.appointmentReminders.hours || ''}
                          onChange={(e) => handleNestedInputChange('appointmentReminders', 'hours', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{settings.appointmentReminders.hours} hours</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedSettings?.sessionTimeout || ''}
                      onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{settings.sessionTimeout} minutes</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  {isEditing ? (
                    <select
                      value={editedSettings?.timezone || ''}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  ) : (
                    <span className="text-gray-900">{settings.timezone}</span>
                  )}
                </div>
              </div>

              {/* Password Policy */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Minimum Length</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedSettings?.passwordPolicy.minLength || ''}
                        onChange={(e) => handleNestedInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{settings.passwordPolicy.minLength} characters</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require Special Characters</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedSettings?.passwordPolicy.requireSpecialChars || false}
                        onChange={(e) => handleNestedInputChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        settings.passwordPolicy.requireSpecialChars ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.passwordPolicy.requireSpecialChars ? 'Required' : 'Optional'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require Numbers</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedSettings?.passwordPolicy.requireNumbers || false}
                        onChange={(e) => handleNestedInputChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        settings.passwordPolicy.requireNumbers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.passwordPolicy.requireNumbers ? 'Required' : 'Optional'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require Uppercase Letters</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedSettings?.passwordPolicy.requireUppercase || false}
                        onChange={(e) => handleNestedInputChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        settings.passwordPolicy.requireUppercase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.passwordPolicy.requireUppercase ? 'Required' : 'Optional'}
                      </span>
                    )}
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

export default CompanySettings;