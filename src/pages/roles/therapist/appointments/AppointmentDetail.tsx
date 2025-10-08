import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  PlayIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShieldCheckIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { therapistApi } from '@/services/therapistApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatTime } from '@/utils/dateFormatters';

interface ClientInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance_info?: {
    provider: string;
    policy_number: string;
  };
  medical_history?: {
    current_medications: string[];
    allergies: string[];
    previous_therapy: boolean;
    notes: string;
  };
  preferences?: {
    preferred_contact_method: string;
    appointment_reminders: boolean;
    session_notes_sharing: boolean;
  };
}

interface AppointmentDetail {
  id: string;
  client: ClientInfo;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  type: string;
  location: string;
  status: string;
  notes?: string;
  preparation_notes?: string;
  therapy_goals?: string[];
  previous_sessions_count?: number;
  last_session_date?: string;
  payment_status?: string;
  recurring?: boolean;
  recurring_pattern?: string;
  video_link?: string;
  created_at: string;
  updated_at: string;
}

const AppointmentDetail: React.FC = () => {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error, warning, info } = useAlert();

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showNoShowConfirm, setShowNoShowConfirm] = useState(false);
  const [noShowNotes, setNoShowNotes] = useState('');

  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await therapistApi.getAppointment(appointmentId!);
      
      if (response.success && response.data) {
        // Calculate duration from start and end times if not provided
        const appointmentData = response.data as any;
        let duration = appointmentData.duration;
        if (!duration && appointmentData.start_time && appointmentData.end_time) {
          const start = new Date(`1970-01-01T${appointmentData.start_time}`);
          const end = new Date(`1970-01-01T${appointmentData.end_time}`);
          duration = Math.floor((end.getTime() - start.getTime()) / 60000);
        }
        setAppointment({
          ...appointmentData,
          duration: duration || 60 // Default to 60 minutes if not calculable
        } as AppointmentDetail);
      } else {
        error('Appointment not found');
        navigate('/therapist/appointments');
      }
    } catch (err: any) {
      console.error('Error loading appointment:', err);
      error('Failed to load appointment details');
      navigate('/therapist/appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!appointment) return;

    try {
      setIsUpdating(true);
      navigate(`/therapist/sessions?start=${appointment.id}`);
    } catch (err) {
      error('Failed to start session');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment || !cancelReason.trim()) {
      warning('Please provide a reason for cancellation');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await therapistApi.updateAppointment(appointment.id, {
        status: 'cancelled',
        notes: `Cancelled by therapist: ${cancelReason}`
      });

      if (response.success) {
        success('Appointment cancelled successfully');
        setShowCancelConfirm(false);
        await loadAppointmentDetails();
      }
    } catch (err) {
      error('Failed to cancel appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNoShow = async () => {
    if (!appointment) return;

    try {
      setIsUpdating(true);
      const response = await therapistApi.updateAppointment(appointment.id, {
        status: 'no_show',
        notes: `Client no-show. ${noShowNotes}`
      });

      if (response.success) {
        warning('Client marked as no-show');
        setShowNoShowConfirm(false);
        await loadAppointmentDetails();
        
        // TODO: Trigger no-show policy (e.g., fee, notification)
        info('No-show policy will be applied');
      }
    } catch (err) {
      error('Failed to update appointment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReschedule = () => {
    if (!appointment) return;
    navigate(`/therapist/appointments/${appointment.id}/reschedule`);
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'online': return VideoCameraIcon;
      case 'phone': return PhoneIcon;
      default: return MapPinIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const LocationIcon = getLocationIcon(appointment.location);
  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
  const isUpcoming = appointmentDateTime > new Date();
  const isPast = appointmentDateTime < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/therapist/appointments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {appointment.status === 'scheduled' && isUpcoming && (
            <>
              <PremiumButton
                variant="primary"
                icon={PlayIcon}
                onClick={handleStartSession}
                disabled={isUpdating}
              >
                Start Session
              </PremiumButton>
              <PremiumButton
                variant="outline"
                icon={PencilSquareIcon}
                onClick={handleReschedule}
              >
                Reschedule
              </PremiumButton>
              <PremiumButton
                variant="outline"
                icon={XMarkIcon}
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel
              </PremiumButton>
            </>
          )}
        </div>
      </div>

      {/* Client Information */}
      <PremiumCard>
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Client Information
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Personal Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Name:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {appointment.client.first_name} {appointment.client.last_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Email:</dt>
                <dd className="text-sm font-medium text-gray-900">{appointment.client.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Phone:</dt>
                <dd className="text-sm font-medium text-gray-900">{appointment.client.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Date of Birth:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(appointment.client.date_of_birth)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Gender:</dt>
                <dd className="text-sm font-medium text-gray-900">{appointment.client.gender}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Emergency Contact</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Name:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {appointment.client.emergency_contact.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Relationship:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {appointment.client.emergency_contact.relationship}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Phone:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {appointment.client.emergency_contact.phone}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Session History */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-3">Session History</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-lg font-semibold text-gray-900">
                {appointment.previous_sessions_count || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Last Session</p>
              <p className="text-sm font-medium text-gray-900">
                {appointment.last_session_date ? formatDate(appointment.last_session_date) : 'First Session'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="text-sm font-medium text-gray-900">
                {appointment.payment_status || 'Pending'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Recurring</p>
              <p className="text-sm font-medium text-gray-900">
                {appointment.recurring ? appointment.recurring_pattern : 'One-time'}
              </p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Appointment Details */}
      <PremiumCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Appointment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  <span className="text-sm text-gray-600 ml-2">({appointment.duration} minutes)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <LocationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-900 capitalize">{appointment.location}</p>
                {appointment.location === 'online' && appointment.video_link && (
                  <a
                    href={appointment.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Join Video Call
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Appointment Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {appointment.type.replace('_', ' ')}
              </p>
            </div>

            {appointment.therapy_goals && appointment.therapy_goals.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Therapy Goals</p>
                <ul className="list-disc list-inside space-y-1">
                  {appointment.therapy_goals.map((goal, index) => (
                    <li key={index} className="text-sm text-gray-700">{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {(appointment.notes || appointment.preparation_notes) && (
          <div className="mt-6 pt-6 border-t space-y-4">
            {appointment.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">General Notes</p>
                <p className="text-sm text-gray-600">{appointment.notes}</p>
              </div>
            )}
            
            {appointment.preparation_notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Preparation Notes</p>
                <p className="text-sm text-gray-600">{appointment.preparation_notes}</p>
              </div>
            )}
          </div>
        )}
      </PremiumCard>

      {/* Medical Information (if available) */}
      {appointment.client.medical_history && (
        <PremiumCard>
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <HeartIcon className="w-5 h-5 mr-2" />
            Medical Information
          </h2>

          <div className="space-y-4">
            {appointment.client.medical_history.current_medications.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Medications</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.client.medical_history.current_medications.map((med, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {appointment.client.medical_history.allergies.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.client.medical_history.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {appointment.client.medical_history.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Medical Notes</p>
                <p className="text-sm text-gray-600">{appointment.client.medical_history.notes}</p>
              </div>
            )}
          </div>
        </PremiumCard>
      )}

      {/* Quick Actions */}
      <PremiumCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate(`/therapist/clients/${appointment.client.id}`)}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <UserIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">View Client Profile</p>
          </button>
          
          <button
            onClick={() => navigate(`/therapist/notes?client=${appointment.client.id}`)}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <DocumentTextIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Session Notes</p>
          </button>
          
          <button
            onClick={() => navigate(`/therapist/messages?client=${appointment.client.id}`)}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Send Message</p>
          </button>
          
          <button
            onClick={() => info('Treatment plan feature coming soon')}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Treatment Plan</p>
          </button>
        </div>
      </PremiumCard>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PremiumCard className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this appointment? The client will be notified.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <PremiumButton
                variant="danger"
                onClick={handleCancelAppointment}
                disabled={isUpdating || !cancelReason.trim()}
                className="flex-1"
              >
                Confirm Cancel
              </PremiumButton>
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason('');
                }}
                className="flex-1"
              >
                Keep Appointment
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* No-Show Confirmation Dialog */}
      {showNoShowConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PremiumCard className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark as No-Show</h3>
            <p className="text-gray-600 mb-4">
              Marking the client as no-show will apply the practice's no-show policy, which may include fees.
            </p>
            <textarea
              value={noShowNotes}
              onChange={(e) => setNoShowNotes(e.target.value)}
              placeholder="Additional notes (optional)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <strong>No-Show Policy:</strong> A fee of €50 will be charged to the client's account.
              </p>
            </div>
            <div className="flex space-x-3">
              <PremiumButton
                variant="warning"
                onClick={handleNoShow}
                disabled={isUpdating}
                className="flex-1"
              >
                Confirm No-Show
              </PremiumButton>
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setShowNoShowConfirm(false);
                  setNoShowNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;