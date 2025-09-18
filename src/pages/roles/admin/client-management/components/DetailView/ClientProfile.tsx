import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useClientContext } from '../shared/ClientContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumButton, PremiumCard, StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import { useAlert } from '@/components/ui/CustomAlert';

const ClientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadClientDetails, clientDetails, loading, assignTherapist, therapists } = useClientContext();
  const { success, error, confirm } = useAlert();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');

  useEffect(() => {
    if (id) {
      loadClientDetails(id);
    }
  }, [id, loadClientDetails]);

  const handleAssignTherapist = async () => {
    if (!selectedTherapistId) {
      error('Please select a therapist');
      return;
    }

    const result = await assignTherapist(id!, selectedTherapistId);
    if (result) {
      success('Therapist assigned successfully');
      setShowAssignModal(false);
      loadClientDetails(id!);
    }
  };

  if (loading || !clientDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const { client, statistics, recentAppointments, behaviors } = clientDetails;

  // Format full name
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown';
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'notes', label: 'Notes & Documents', icon: DocumentTextIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <PremiumButton
            variant="outline"
            icon={ArrowLeftIcon}
            onClick={() => navigate('/admin/clients')}
          >
            Back to List
          </PremiumButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <p className="text-sm text-gray-500">Client Profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!client.assigned_therapist_id && (
            <PremiumButton
              variant="outline"
              icon={UserGroupIcon}
              onClick={() => setShowAssignModal(true)}
            >
              Assign Therapist
            </PremiumButton>
          )}
          <PremiumButton
            variant="danger"
            icon={PencilIcon}
            onClick={() => navigate(`/admin/clients/${id}/edit`)}
          >
            Edit Client
          </PremiumButton>
        </div>
      </div>

      {/* Client Info Card */}
      <PremiumCard className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {client.profile_photo_url ? (
              <img
                className="h-16 w-16 rounded-full"
                src={client.profile_photo_url}
                alt={fullName}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {client.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    {client.phone}
                  </div>
                )}
                {client.date_of_birth && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(client.date_of_birth)}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <StatusBadge 
                  type={getStatusColor(client.user_status)} 
                  status={client.user_status}
                />
                {client.intake_completed && (
                  <StatusBadge 
                    type="success" 
                    status="Intake Completed"
                  />
                )}
                {client.insurance_company && (
                  <div className="flex items-center text-sm text-green-600">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    Insured
                  </div>
                )}
              </div>
            </div>
          </div>
          {client.assigned_therapist_id && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Assigned Therapist</p>
              <p className="font-medium">
                Dr. {client.therapist_first_name} {client.therapist_last_name}
              </p>
              {client.therapist_email && (
                <p className="text-sm text-gray-500">{client.therapist_email}</p>
              )}
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.appointments.total_appointments || 0}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.appointments.completed_appointments || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                €{statistics.payments.total_outstanding || 0}
              </p>
            </div>
            <BanknotesIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">No Shows</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.appointments.no_show_appointments || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </PremiumCard>
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
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Full Name</dt>
                  <dd className="text-sm font-medium text-gray-900">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date of Birth</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.date_of_birth ? formatDate(client.date_of_birth) : 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Gender</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {client.gender || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Preferred Language</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.preferred_language || 'English'}
                  </dd>
                </div>
              </dl>
            </PremiumCard>

            {/* Contact Information */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">{client.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="text-sm font-medium text-gray-900">{client.phone || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Address</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.street_address ? (
                      <>
                        {client.street_address}<br />
                        {client.postal_code} {client.city}<br />
                        {client.country}
                      </>
                    ) : 'Not provided'}
                  </dd>
                </div>
              </dl>
            </PremiumCard>

            {/* Insurance Information */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Insurance Company</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.insurance_company || 'None'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Insurance Number</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.insurance_number || 'N/A'}
                  </dd>
                </div>
              </dl>
            </PremiumCard>

            {/* Therapy Information */}
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Therapy Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Therapy Type</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {client.therapy_type || 'Individual'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Reason for Therapy</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.reason_for_therapy || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Therapy Goals</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.therapy_goals || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Referred By</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {client.referred_by || 'Self-referred'}
                  </dd>
                </div>
              </dl>
            </PremiumCard>

            {/* Emergency Contact */}
            {(client.emergency_contact_name || client.emergency_contact_phone) && (
              <PremiumCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Name</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {client.emergency_contact_name || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {client.emergency_contact_phone || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </PremiumCard>
            )}

            {/* Psychological Behaviors */}
            {behaviors && behaviors.length > 0 && (
              <PremiumCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Behaviors</h3>
                <ul className="space-y-2">
                  {behaviors.map((behavior: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <HeartIcon className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{behavior.behavior_name}</p>
                        {behavior.notes && (
                          <p className="text-xs text-gray-500 mt-1">{behavior.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
            {recentAppointments && recentAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Therapist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAppointments.map((appointment: any) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.appointment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.start_time && formatTime(appointment.start_time)}
                          {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {appointment.therapist_first_name} {appointment.therapist_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {appointment.therapy_type || 'Individual'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge 
                            type={appointment.status === 'completed' ? 'success' : 'info'} 
                            status={appointment.status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No appointments found.</p>
            )}
            {statistics.appointments.next_appointment_date && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Next Appointment:</strong> {formatDate(statistics.appointments.next_appointment_date)}
                </p>
              </div>
            )}
          </PremiumCard>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Paid</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    €{statistics.payments.total_paid || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Outstanding Balance</dt>
                  <dd className="text-sm font-medium text-red-600">
                    €{statistics.payments.total_outstanding || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Paid Invoices</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {statistics.payments.paid_invoices || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Pending Invoices</dt>
                  <dd className="text-sm font-medium text-yellow-600">
                    {statistics.payments.pending_invoices || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Overdue Invoices</dt>
                  <dd className="text-sm font-medium text-red-600">
                    {statistics.payments.overdue_invoices || 0}
                  </dd>
                </div>
              </dl>
            </PremiumCard>
          </div>
        )}

        {activeTab === 'notes' && (
          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Documents</h3>
            {client.notes ? (
              <div className="prose max-w-none">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            ) : (
              <p className="text-gray-500">No notes available.</p>
            )}
          </PremiumCard>
        )}
      </div>

      {/* Assign Therapist Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Assign Therapist
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Select a therapist to assign to {fullName}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <select
                      value={selectedTherapistId}
                      onChange={(e) => setSelectedTherapistId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select a therapist...</option>
                      {therapists.map(therapist => (
                        <option key={therapist.id} value={therapist.id}>
                          Dr. {therapist.first_name} {therapist.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <PremiumButton
                  variant="danger"
                  onClick={handleAssignTherapist}
                  className="sm:col-start-2"
                >
                  Assign
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  className="mt-3 sm:mt-0 sm:col-start-1"
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;