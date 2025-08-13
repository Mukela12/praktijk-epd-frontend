import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface BookkeeperSettings {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  supervisor: string;
  
  // Financial Preferences
  default_currency: string;
  decimal_places: number;
  tax_rate: number;
  payment_terms_days: number;
  invoice_numbering_format: string;
  auto_generate_invoices: boolean;
  late_payment_interest: number;
  
  // Working Preferences
  preferred_language: string;
  time_zone: string;
  fiscal_year_start: string;
  working_hours: {
    start: string;
    end: string;
  };
  report_frequency: 'weekly' | 'monthly' | 'quarterly';
  
  // Notification Settings
  email_notifications: boolean;
  payment_reminders: boolean;
  overdue_alerts: boolean;
  report_notifications: boolean;
  invoice_status_updates: boolean;
  bank_reconciliation_alerts: boolean;
  
  // System Preferences
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  data_retention_months: number;
  export_format_preference: 'pdf' | 'excel' | 'csv';
  
  // Security Settings
  two_factor_enabled: boolean;
  session_timeout: number;
  password_last_changed: string;
  access_level: string;
}

const BookkeeperSettings: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning } = useAlert();

  // State
  const [settings, setSettings] = useState<BookkeeperSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'financial' | 'notifications' | 'system' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Default empty settings
  const defaultSettings: BookkeeperSettings = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    employee_id: '',
    department: '',
    supervisor: '',
    default_currency: 'EUR',
    decimal_places: 2,
    tax_rate: 0,
    payment_terms_days: 30,
    invoice_numbering_format: '',
    auto_generate_invoices: false,
    late_payment_interest: 0,
    preferred_language: 'en-US',
    time_zone: 'UTC',
    fiscal_year_start: '01-01',
    working_hours: {
      start: '09:00',
      end: '17:00'
    },
    report_frequency: 'monthly',
    email_notifications: false,
    payment_reminders: false,
    overdue_alerts: false,
    report_notifications: false,
    invoice_status_updates: false,
    bank_reconciliation_alerts: false,
    auto_backup_enabled: false,
    backup_frequency: 'daily',
    data_retention_months: 12,
    export_format_preference: 'pdf',
    two_factor_enabled: false,
    session_timeout: 30,
    password_last_changed: '',
    access_level: ''
  };

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // In a real app, this would fetch from API
        // TODO: Implement actual API call when backend endpoint is available
        // const response = await bookkeeperApi.getSettings();
        // if (response.success && response.data) {
        //   setSettings(response.data);
        // }
        
        // For now, use default settings
        setSettings(defaultSettings);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(defaultSettings);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle setting changes
  const handleSettingChange = (key: keyof BookkeeperSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleWorkingHoursChange = (field: string, value: string) => {
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
    setSettings(defaultSettings);
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              Bookkeeper Settings
            </h1>
            <p className="text-emerald-100 mt-1">
              Configure financial preferences and system settings
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
            { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'system', label: 'System', icon: DocumentTextIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
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
              <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={settings.last_name}
                    onChange={(e) => handleSettingChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Employment Details
            </h3>
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

          <PremiumCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Work Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={settings.preferred_language}
                  onChange={(e) => handleSettingChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="nl-NL">Dutch</option>
                  <option value="en-US">English</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours Start</label>
                <input
                  type="time"
                  value={settings.working_hours.start}
                  onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours End</label>
                <input
                  type="time"
                  value={settings.working_hours.end}
                  onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Currency & Formatting
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => handleSettingChange('default_currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                <select
                  value={settings.decimal_places}
                  onChange={(e) => handleSettingChange('decimal_places', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={0}>0</option>
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => handleSettingChange('tax_rate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (days)</label>
                <input
                  type="number"
                  value={settings.payment_terms_days}
                  onChange={(e) => handleSettingChange('payment_terms_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number Format</label>
                <input
                  type="text"
                  value={settings.invoice_numbering_format}
                  onChange={(e) => handleSettingChange('invoice_numbering_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="INV-YYYY-NNNN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Late Payment Interest (%)</label>
                <input
                  type="number"
                  value={settings.late_payment_interest}
                  onChange={(e) => handleSettingChange('late_payment_interest', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  step="0.1"
                  min="0"
                  max="50"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_generate"
                  checked={settings.auto_generate_invoices}
                  onChange={(e) => handleSettingChange('auto_generate_invoices', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_generate" className="ml-2 text-sm font-medium text-gray-700">
                  Auto-generate invoices
                </label>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start</label>
                <input
                  type="text"
                  value={settings.fiscal_year_start}
                  onChange={(e) => handleSettingChange('fiscal_year_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="MM-DD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Frequency</label>
                <select
                  value={settings.report_frequency}
                  onChange={(e) => handleSettingChange('report_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <select
                  value={settings.export_format_preference}
                  onChange={(e) => handleSettingChange('export_format_preference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'notifications' && (
        <PremiumCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-emerald-600" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'payment_reminders', label: 'Payment Reminders', description: 'Send reminders for upcoming payments' },
              { key: 'overdue_alerts', label: 'Overdue Alerts', description: 'Notifications for overdue invoices' },
              { key: 'report_notifications', label: 'Report Notifications', description: 'Get notified when reports are ready' },
              { key: 'invoice_status_updates', label: 'Invoice Status Updates', description: 'Updates when invoice status changes' },
              { key: 'bank_reconciliation_alerts', label: 'Bank Reconciliation Alerts', description: 'Alerts for reconciliation discrepancies' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{notification.label}</span>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[notification.key as keyof BookkeeperSettings] as boolean}
                  onChange={(e) => handleSettingChange(notification.key as keyof BookkeeperSettings, e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Backup Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_backup"
                  checked={settings.auto_backup_enabled}
                  onChange={(e) => handleSettingChange('auto_backup_enabled', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_backup" className="ml-2 text-sm font-medium text-gray-700">
                  Enable automatic backups
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                <select
                  value={settings.backup_frequency}
                  onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                  disabled={!settings.auto_backup_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention (months)</label>
                <input
                  type="number"
                  value={settings.data_retention_months}
                  onChange={(e) => handleSettingChange('data_retention_months', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="12"
                  max="120"
                />
                <p className="text-sm text-gray-500 mt-1">Recommended: 84 months (7 years) for financial records</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">System Online</span>
                </div>
                <p className="text-sm text-green-700 mt-1">All financial systems are operational</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Last Backup</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Today at 2:00 AM - Successful</p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Bank Sync</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Last sync: 1 hour ago</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                  <p className="text-sm text-gray-600">Extra security for financial access</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
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
                    onClick={() => info('Password change requires authentication')}
                  >
                    Change
                  </PremiumButton>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance & Access</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">GDPR Compliant</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Data handling meets EU requirements</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Financial Access Level</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">{settings.access_level}</p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Audit Trail</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">All actions are logged and monitored</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default BookkeeperSettings;