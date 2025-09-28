import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { useRealApi } from '@/hooks/useRealApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/dateFormatters';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onEdit?: (client: any) => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack, onEdit }) => {
  const { t } = useTranslation();
  const { getClient, sendClientActivationEmail } = useRealApi();
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sendingActivationEmail, setSendingActivationEmail] = useState(false);

  useEffect(() => {
    loadClientDetails();
  }, [clientId]);

  const loadClientDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getClient(clientId);
      setClient(data);
    } catch (error) {
      console.error('Failed to load client details:', error);
      toast.error('Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendActivationEmail = async () => {
    try {
      setSendingActivationEmail(true);
      await sendClientActivationEmail(clientId);
      // Refresh client data to update email_verified status
      await loadClientDetails();
    } catch (error) {
      console.error('Failed to send activation email:', error);
    } finally {
      setSendingActivationEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'therapy', label: 'Therapy', icon: HeartIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'invoices', label: 'Invoices', icon: CreditCardIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'statistics', label: 'Statistics', icon: ChartBarIcon }
  ];

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.salutation ? `${client.salutation} ` : ''}
              {client.initials ? `${client.initials} ` : ''}
              {client.name_prefix ? `${client.name_prefix} ` : ''}
              {client.first_name} {client.last_name}
            </dd>
          </div>
          {client.bsn && (
            <div>
              <dt className="text-sm font-medium text-gray-500">BSN</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.bsn}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.date_of_birth ? formatDate(client.date_of_birth) : 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.gender || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.preferred_language || 'English'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <dl className="space-y-4">
          <div className="flex items-start">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.email}</dd>
            </div>
          </div>
          <div className="flex items-start">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {client.phone || 'Not provided'}
              </dd>
            </div>
          </div>
          {client.mobile_phone && (
            <div className="flex items-start">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Mobile Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.mobile_phone}</dd>
              </div>
            </div>
          )}
          <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {(client.street_address || client.street_name) ? (
                  <>
                    {client.street_address || `${client.street_name || ''} ${client.house_number || ''}`.trim()}<br />
                    {client.postal_code} {client.city}<br />
                    {client.country || 'Netherlands'}
                  </>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Insurance Company</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.insurance_company || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Insurance Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {client.insurance_number || 'Not provided'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Financial Information */}
      {client.bank_account_iban && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Account (IBAN)</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.bank_account_iban}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Mailing Address */}
      {(client.mailing_street_name || client.mailing_postal_code) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mailing Address</h3>
          <dl className="space-y-4">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Mailing Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {client.mailing_street_name} {client.mailing_house_number}<br />
                  {client.mailing_postal_code} {client.mailing_city}<br />
                  {client.mailing_country || 'Netherlands'}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      )}

      {/* Medical Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
        <dl className="space-y-4">
          {client.general_practitioner_name && (
            <div>
              <dt className="text-sm font-medium text-gray-500">General Practitioner</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {client.general_practitioner_name}
                {client.general_practitioner_phone && (
                  <><br />Phone: {client.general_practitioner_phone}</>
                )}
                {client.general_practitioner_email && (
                  <><br />Email: {client.general_practitioner_email}</>
                )}
              </dd>
            </div>
          )}
          {client.medical_notes && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Medical Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.medical_notes}</dd>
            </div>
          )}
          {client.primary_complaint && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary Complaint</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.primary_complaint}</dd>
            </div>
          )}
          {client.treatment_history && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Treatment History</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.treatment_history}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Guardian Information */}
      {client.guardian_name && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Guardian Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.guardian_name}</dd>
            </div>
            {client.guardian_relation && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Relation</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.guardian_relation}</dd>
              </div>
            )}
            {client.guardian_phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.guardian_phone}</dd>
              </div>
            )}
            {client.guardian_email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.guardian_email}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Emergency Contact */}
      {client.emergency_contact_name && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.emergency_contact_name}</dd>
            </div>
            {client.emergency_contact_phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.emergency_contact_phone}</dd>
              </div>
            )}
            {client.emergency_contact_relation && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Relation</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.emergency_contact_relation}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
        <dl className="space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd>
              <span className={`px-2 py-1 text-xs rounded-full ${
                client.user_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : client.user_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {client.user_status}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
            <dd>
              {client.email_verified ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </dd>
          </div>
          
          {/* Send Activation Email Button for unverified clients */}
          {!client.email_verified && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Email Not Verified</h4>
                  <p className="text-sm text-yellow-600">This client hasn't verified their email address yet.</p>
                </div>
                <button
                  onClick={handleSendActivationEmail}
                  disabled={sendingActivationEmail}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingActivationEmail ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Send Activation Email
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-sm font-medium text-gray-500">Intake Completed</dt>
            <dd>
              {client.intake_completed ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(client.created_at)}
            </dd>
          </div>
          {client.newsletter_subscribed !== undefined && (
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Newsletter Subscription</dt>
              <dd>
                {client.newsletter_subscribed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </dd>
            </div>
          )}
          {client.referral_source && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Referral Source</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.referral_source}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );

  const renderTherapyTab = () => (
    <div className="space-y-6">
      {/* Assigned Therapist */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Therapist</h3>
        {client.assigned_therapist_id ? (
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">
                {client.therapist_first_name} {client.therapist_last_name}
              </p>
              <p className="text-sm text-gray-500">Therapist</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No therapist assigned yet</p>
        )}
      </div>

      {/* Therapy Goals */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Therapy Goals</h3>
        {client.therapy_goals ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.therapy_goals}</p>
        ) : (
          <p className="text-sm text-gray-500">No therapy goals specified yet</p>
        )}
      </div>

      {/* Intake Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intake Information</h3>
        <dl className="space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm font-medium text-gray-500">Intake Status</dt>
            <dd>
              <span className={`px-2 py-1 text-xs rounded-full ${
                client.intake_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {client.intake_completed ? 'Completed' : 'Pending'}
              </span>
            </dd>
          </div>
          {client.intake_date && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Intake Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(client.intake_date)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );

  const renderAppointmentsTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {client.total_appointments || 0}
          </p>
          <p className="text-sm text-gray-600">Total Appointments</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {client.completed_appointments || 0}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">
            {client.unpaid_appointments || 0}
          </p>
          <p className="text-sm text-gray-600">Unpaid</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.first_name} {client.last_name}
              </h1>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(client)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Client
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'therapy' && renderTherapyTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">Invoice information coming soon...</p>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">Document management coming soon...</p>
          </div>
        )}
        {activeTab === 'statistics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">Client statistics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;