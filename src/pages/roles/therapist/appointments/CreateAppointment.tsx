import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Client } from '@/types/entities';
import { useAlert } from '@/components/ui/CustomAlert';

const appointmentTypes = [
  { value: 'initial_consultation', label: 'Initial Consultation' },
  { value: 'regular_session', label: 'Regular Session' },
  { value: 'follow_up', label: 'Follow-up Session' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'crisis_intervention', label: 'Crisis Intervention' }
];

const sessionLocations = [
  { value: 'In-Person', label: 'In-Person', icon: MapPinIcon },
  { value: 'Video', label: 'Video Call', icon: CalendarIcon },
  { value: 'Phone', label: 'Phone Call', icon: ClockIcon }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const CreateAppointment: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: errorAlert, warning } = useAlert();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    client_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    type: 'regular_session',
    location: 'In-Person',
    notes: '',
    send_reminder: true
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Auto-calculate end time when start time is selected (1 hour sessions)
    if (formData.start_time) {
      const [hours, minutes] = formData.start_time.split(':').map(Number);
      const endHours = hours + 1;
      setFormData(prev => ({
        ...prev,
        end_time: `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }));
    }
  }, [formData.start_time]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getClients();
      
      if (response.success) {
        const activeClients = (response.data || []).filter((c: any) => c.status === 'active');
        setClients(activeClients as unknown as Client[]);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_id) {
      warning('Please select a client');
      return;
    }
    if (!formData.appointment_date) {
      warning('Please select a date');
      return;
    }
    if (!formData.start_time) {
      warning('Please select a start time');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Match the backend expected format from test-all-endpoints-enhanced.js
      const appointmentData = {
        clientId: formData.client_id,
        appointmentDate: new Date(formData.appointment_date).toISOString(),
        startTime: formData.start_time,
        endTime: formData.end_time,
        therapyType: formData.type === 'regular_session' ? 'individual' : formData.type,
        location: formData.location.toLowerCase(),
        notes: formData.notes || 'Regular therapy session'
      };
      
      const response = await realApiService.therapist.createAppointment(appointmentData);
      
      if (response.success) {
        success('Appointment created successfully');
        if (formData.send_reminder) {
          success('Reminder will be sent to client');
        }
        navigate('/therapist/appointments');
      } else {
        throw new Error(response.message || 'Failed to create appointment');
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      errorAlert(error.message || 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  const isTimeSlotAvailable = (time: string) => {
    // TODO: Check against existing appointments
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/therapist/appointments')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/therapist/appointments')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Appointment</h1>
            <p className="text-gray-600 mt-1">Schedule a session with a client</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client <span className="text-red-500">*</span>
              </label>
              {clients.length > 0 ? (
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} - {client.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No active clients found</p>
                  <p className="text-sm text-gray-500">
                    You need to have clients assigned before creating appointments
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                  disabled={!formData.appointment_date}
                >
                  <option value="">Select time...</option>
                  {timeSlots.map((time) => (
                    <option 
                      key={time} 
                      value={time}
                      disabled={!isTimeSlotAvailable(time)}
                    >
                      {time} {!isTimeSlotAvailable(time) && '(Unavailable)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Automatically set to 1 hour after start time</p>
              </div>
            </div>

            {/* Location */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Location
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sessionLocations.map((location) => (
                  <label
                    key={location.value}
                    className={`
                      flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${formData.location === location.value 
                        ? 'border-green-600 bg-green-50 text-green-600' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="location"
                      value={location.value}
                      checked={formData.location === location.value}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="sr-only"
                    />
                    <location.icon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes or special instructions..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Send Reminder */}
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.send_reminder}
                  onChange={(e) => setFormData({ ...formData, send_reminder: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send appointment reminder to client
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/therapist/appointments')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || clients.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Create Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CreateAppointment;