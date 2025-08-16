import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { useAuth } from '@/store/authStore';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { TextField, TextareaField, SelectField } from '@/components/forms/FormFields';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatTime } from '@/utils/dateFormatters';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TherapistInfo {
  id: string;
  name: string;
  specializations: string[];
  availability: boolean;
}

type BookingStep = 'therapist' | 'datetime' | 'details' | 'confirm' | 'success';

interface BookingData {
  therapistId?: string;
  therapistName?: string;
  preferredDate?: string;
  preferredTime?: string;
  alternativeDate?: string;
  alternativeTime?: string;
  therapyType: string;
  urgencyLevel: string;
  reasonForTherapy: string;
  additionalNotes?: string;
}

const AppointmentBookingInline: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error, warning, info } = useAlert();

  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>('therapist');
  const [bookingData, setBookingData] = useState<BookingData>({
    therapyType: 'individual',
    urgencyLevel: 'normal',
    reasonForTherapy: ''
  });
  const [assignedTherapist, setAssignedTherapist] = useState<TherapistInfo | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Check if client has assigned therapist
  useEffect(() => {
    checkAssignedTherapist();
  }, []);

  const checkAssignedTherapist = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getTherapist();
      if (response.success && response.data) {
        setAssignedTherapist({
          id: response.data.id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          specializations: response.data.specializations || []
        });
        setBookingData(prev => ({
          ...prev,
          therapistId: response.data.id,
          therapistName: `${response.data.first_name} ${response.data.last_name}`
        }));
        // Automatically move to datetime step if therapist is assigned
        setCurrentStep('datetime');
      }
    } catch (error) {
      // No assigned therapist - stay on therapist selection step
      setAssignedTherapist(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Get available time slots for selected date
  const getAvailableSlots = async (date: string) => {
    if (!assignedTherapist?.id) return;

    try {
      const response = await realApiService.appointments.getAvailableSlots({
        therapistId: assignedTherapist.id,
        date
      });
      if (response.success && response.data) {
        setAvailableSlots(response.data.slots || []);
      }
    } catch (error) {
      console.error('Failed to get available slots:', error);
      setAvailableSlots([]);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setBookingData(prev => ({ ...prev, preferredDate: date }));
    getAvailableSlots(date);
  };

  // Handle appointment submission
  const handleSubmitAppointment = async () => {
    setIsLoading(true);
    try {
      const requestData = {
        preferredDate: bookingData.preferredDate!,
        preferredTime: bookingData.preferredTime!,
        therapyType: bookingData.therapyType,
        urgencyLevel: bookingData.urgencyLevel,
        reason: bookingData.reasonForTherapy
      };

      const response = await realApiService.client.requestAppointment(requestData);
      
      if (response.success) {
        success('Appointment request submitted successfully!');
        setCurrentStep('success');
      }
    } catch (err) {
      error('Failed to submit appointment request');
    } finally {
      setIsLoading(false);
    }
  };

  // Render calendar for date selection
  const renderCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < today;
      const isSelected = bookingData.preferredDate === dateString || bookingData.alternativeDate === dateString;
      const isPreferred = bookingData.preferredDate === dateString;

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateSelect(dateString)}
          disabled={isPast}
          className={`
            p-2 text-sm rounded-lg transition-all
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
            ${isSelected ? (isPreferred ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600') : ''}
            ${date.toDateString() === today.toDateString() ? 'font-bold ring-2 ring-blue-400' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMonth(new Date(year, month - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setSelectedMonth(new Date(year, month + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  // Render steps
  const renderStep = () => {
    switch (currentStep) {
      case 'therapist':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <UserIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Book Your Appointment
              </h2>
              {assignedTherapist ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-900 font-medium">Your Therapist</p>
                  <p className="text-xl text-blue-800 mt-1">{assignedTherapist.name}</p>
                  {assignedTherapist.specializations.length > 0 && (
                    <p className="text-sm text-blue-700 mt-2">
                      Specializations: {assignedTherapist.specializations.join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-900">
                    You haven't been assigned a therapist yet. Your appointment request will be reviewed by our admin team who will assign the best therapist for your needs.
                  </p>
                </div>
              )}
            </div>
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={() => setCurrentStep('datetime')}
              className="w-full"
            >
              Continue to Select Date & Time
            </PremiumButton>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Select Date & Time</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Date
                </label>
                {renderCalendar()}
                {bookingData.preferredDate && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formatDate(bookingData.preferredDate)}
                  </p>
                )}
              </div>

              {bookingData.preferredDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                  </label>
                  {assignedTherapist ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setBookingData(prev => ({ ...prev, preferredTime: slot.time }))}
                          disabled={!slot.available}
                          className={`
                            p-3 rounded-lg border text-sm font-medium transition-all
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                            ${bookingData.preferredTime === slot.time 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'border-gray-300 hover:border-blue-400'
                            }
                          `}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SelectField
                        label="Preferred Time"
                        name="preferredTime"
                        value={bookingData.preferredTime || ''}
                        onChange={(value) => setBookingData(prev => ({ ...prev, preferredTime: value }))}
                        options={[
                          { value: '', label: 'Select a time' },
                          { value: '09:00', label: '9:00 AM' },
                          { value: '10:00', label: '10:00 AM' },
                          { value: '11:00', label: '11:00 AM' },
                          { value: '14:00', label: '2:00 PM' },
                          { value: '15:00', label: '3:00 PM' },
                          { value: '16:00', label: '4:00 PM' },
                          { value: '17:00', label: '5:00 PM' }
                        ]}
                      />
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={bookingData.alternativeDate || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, alternativeDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <PremiumButton
                variant="outline"
                onClick={() => setCurrentStep('therapist')}
              >
                Back
              </PremiumButton>
              <PremiumButton
                variant="primary"
                onClick={() => setCurrentStep('details')}
                disabled={!bookingData.preferredDate || !bookingData.preferredTime}
              >
                Continue to Details
              </PremiumButton>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>

            <SelectField
              label="Type of Therapy"
              name="therapyType"
              value={bookingData.therapyType}
              onChange={(value) => setBookingData(prev => ({ ...prev, therapyType: value }))}
              options={[
                { value: 'individual', label: 'Individual Therapy' },
                { value: 'couple', label: 'Couple Therapy' },
                { value: 'family', label: 'Family Therapy' },
                { value: 'group', label: 'Group Therapy' }
              ]}
            />

            <SelectField
              label="Urgency Level"
              name="urgencyLevel"
              value={bookingData.urgencyLevel}
              onChange={(value) => setBookingData(prev => ({ ...prev, urgencyLevel: value }))}
              options={[
                { value: 'normal', label: 'Normal - Within 2 weeks' },
                { value: 'urgent', label: 'Urgent - Within 1 week' },
                { value: 'emergency', label: 'Emergency - Within 48 hours' }
              ]}
            />

            <TextareaField
              label="Reason for Therapy"
              name="reasonForTherapy"
              value={bookingData.reasonForTherapy}
              onChange={(value) => setBookingData(prev => ({ ...prev, reasonForTherapy: value }))}
              rows={4}
              required
              placeholder="Please describe what brings you to therapy..."
            />

            <TextareaField
              label="Additional Notes (Optional)"
              name="additionalNotes"
              value={bookingData.additionalNotes || ''}
              onChange={(value) => setBookingData(prev => ({ ...prev, additionalNotes: value }))}
              rows={3}
              placeholder="Any additional information you'd like to share..."
            />

            <div className="flex justify-between">
              <PremiumButton
                variant="outline"
                onClick={() => setCurrentStep('datetime')}
              >
                Back
              </PremiumButton>
              <PremiumButton
                variant="primary"
                onClick={() => setCurrentStep('confirm')}
                disabled={!bookingData.reasonForTherapy}
              >
                Review Appointment
              </PremiumButton>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Confirm Your Appointment</h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {assignedTherapist && (
                <div>
                  <p className="text-sm text-gray-600">Therapist</p>
                  <p className="font-medium">{assignedTherapist.name}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Preferred Date & Time</p>
                <p className="font-medium">
                  {formatDate(bookingData.preferredDate!)} at {formatTime(bookingData.preferredTime!)}
                </p>
              </div>

              {bookingData.alternativeDate && (
                <div>
                  <p className="text-sm text-gray-600">Alternative Date</p>
                  <p className="font-medium">{formatDate(bookingData.alternativeDate)}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Therapy Type</p>
                <p className="font-medium capitalize">{bookingData.therapyType.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Urgency</p>
                <StatusBadge 
                  status={bookingData.urgencyLevel} 
                  type={bookingData.urgencyLevel === 'emergency' ? 'danger' : bookingData.urgencyLevel === 'urgent' ? 'warning' : 'info'}
                />
              </div>

              <div>
                <p className="text-sm text-gray-600">Reason for Therapy</p>
                <p className="font-medium">{bookingData.reasonForTherapy}</p>
              </div>

              {bookingData.additionalNotes && (
                <div>
                  <p className="text-sm text-gray-600">Additional Notes</p>
                  <p className="font-medium">{bookingData.additionalNotes}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                {assignedTherapist 
                  ? "Your appointment request will be sent to your therapist for confirmation."
                  : "Your appointment request will be reviewed by our admin team who will assign the best therapist for your needs."
                }
              </p>
            </div>

            <div className="flex justify-between">
              <PremiumButton
                variant="outline"
                onClick={() => setCurrentStep('details')}
              >
                Back
              </PremiumButton>
              <PremiumButton
                variant="primary"
                onClick={handleSubmitAppointment}
                isLoading={isLoading}
              >
                Submit Appointment Request
              </PremiumButton>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Appointment Request Submitted!
            </h3>
            <p className="text-gray-600 mb-8">
              {assignedTherapist
                ? "Your therapist will review and confirm your appointment. You'll receive a notification once confirmed."
                : "Our admin team will review your request and assign a therapist. You'll receive a notification with the details."
              }
            </p>
            <PremiumButton
              variant="primary"
              onClick={() => window.location.href = '/client/appointments'}
            >
              View My Appointments
            </PremiumButton>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <PremiumCard>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {['therapist', 'datetime', 'details', 'confirm', 'success'].map((step, index) => {
            const isActive = currentStep === step;
            const isPast = ['therapist', 'datetime', 'details', 'confirm', 'success'].indexOf(currentStep) > index;
            
            return (
              <React.Fragment key={step}>
                {index > 0 && (
                  <div className={`h-0.5 w-12 ${isPast ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive ? 'bg-blue-600 text-white' : isPast ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}
                  `}
                >
                  {isPast ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {renderStep()}
    </PremiumCard>
  );
};

export default AppointmentBookingInline;