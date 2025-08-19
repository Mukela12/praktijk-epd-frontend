import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import { useAlert } from '@/components/ui/CustomAlert';

interface TimeSlot {
  time: string;
  available: boolean;
}

const RescheduleAppointment: React.FC = () => {
  const { appointmentId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: errorAlert, warning } = useAlert();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await realApiService.therapist.getAppointment(appointmentId!);
      
      if (response.success && response.data) {
        setAppointment(response.data);
        // Set default date to current appointment date
        setSelectedDate(response.data.appointment_date);
      } else {
        throw new Error('Failed to load appointment');
      }
    } catch (error: any) {
      console.error('Error loading appointment:', error);
      setError('Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    // In a real implementation, this would check therapist availability
    // For now, we'll generate mock available slots
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3 // Random availability for demo
      });
      if (hour < 17) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:30`,
          available: Math.random() > 0.3
        });
      }
    }
    setAvailableSlots(slots);
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      warning('Please select a new date and time');
      return;
    }

    if (!reason.trim()) {
      warning('Please provide a reason for rescheduling');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await realApiService.therapist.updateAppointment(appointmentId!, {
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime),
        status: 'rescheduled',
        reschedule_reason: reason,
        notify_client: notifyClient
      });
      
      if (response.success) {
        success('Appointment rescheduled successfully');
        if (notifyClient) {
          success('Client has been notified of the change');
        }
        navigate('/therapist/appointments');
      }
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      errorAlert('Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      warning('Please provide a reason for cancellation');
      return;
    }

    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await realApiService.therapist.updateAppointment(appointmentId!, {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: 'therapist',
        notify_client: notifyClient
      });
      
      if (response.success) {
        success('Appointment cancelled');
        if (notifyClient) {
          success('Client has been notified of the cancellation');
        }
        navigate('/therapist/appointments');
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      errorAlert('Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1; // Assume 1-hour sessions
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading appointment..." />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || 'Failed to load appointment'}</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/therapist/appointments')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reschedule or Cancel Appointment</h1>
              <p className="text-gray-600 mt-1">
                Current: {formatDate(appointment.appointment_date)} at {formatTime(appointment.start_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {appointment.client?.first_name} {appointment.client?.last_name}
              </h3>
              <p className="text-sm text-gray-600">{appointment.type || 'Regular Session'}</p>
            </div>
          </div>
        </div>

        {/* Reschedule Options */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option 
                    key={slot.time} 
                    value={slot.time}
                    disabled={!slot.available}
                  >
                    {slot.time} {!slot.available && '(Unavailable)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rescheduling or cancelling..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyClient"
              checked={notifyClient}
              onChange={(e) => setNotifyClient(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
            />
            <label htmlFor="notifyClient" className="ml-2 text-sm text-gray-700">
              Send notification to client about this change
            </label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={() => navigate('/therapist/appointments')}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Keep Original
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting || !reason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircleIcon className="w-5 h-5 inline mr-2" />
              Cancel Appointment
            </button>
            <button
              onClick={handleReschedule}
              disabled={isSubmitting || !selectedDate || !selectedTime || !reason.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="w-5 h-5 inline mr-2" />
              Reschedule
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Rescheduling should be done at least 24 hours in advance when possible</li>
                <li>Frequent cancellations may affect client trust and progress</li>
                <li>Consider offering alternative times to minimize disruption</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RescheduleAppointment;