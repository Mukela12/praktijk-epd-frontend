import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  specializations?: string[];
  availability?: any[];
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error: errorAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [preferredTherapist, setPreferredTherapist] = useState<string>('');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [therapyType, setTherapyType] = useState('Individual Therapy');

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate]);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.client.getTherapist();
      if (response.success && response.data) {
        setTherapists([response.data]);
        setPreferredTherapist(response.data.id);
      }
    } catch (error) {
      console.log('No assigned therapist yet');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    setAvailableSlots(slots);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !problemDescription) {
      errorAlert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        therapyType,
        urgencyLevel: urgency,
        reason: problemDescription
      };

      const response = await realApiService.client.requestAppointment(requestData);
      
      if (response.success) {
        success('Appointment request submitted successfully! You will be notified once it is confirmed.');
        navigate('/client/appointments');
      }
    } catch (error: any) {
      console.error('Failed to submit appointment request:', error);
      errorAlert(error.response?.data?.message || 'Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-4 rounded-lg border-2 transition-all ${
                          selectedTime === slot
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Therapy Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapy Type *
              </label>
              <select
                value={therapyType}
                onChange={(e) => setTherapyType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Individual Therapy">Individual Therapy</option>
                <option value="CBT Session">CBT Session</option>
                <option value="EMDR Session">EMDR Session</option>
                <option value="Group Therapy">Group Therapy</option>
                <option value="Family Therapy">Family Therapy</option>
                <option value="Crisis Intervention">Crisis Intervention</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUrgency('normal')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    urgency === 'normal'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircleIcon className={`w-6 h-6 mx-auto mb-2 ${
                    urgency === 'normal' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${urgency === 'normal' ? 'text-green-700' : 'text-gray-700'}`}>
                    Normal
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Regular appointment</p>
                </button>
                
                <button
                  onClick={() => setUrgency('urgent')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    urgency === 'urgent'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ExclamationTriangleIcon className={`w-6 h-6 mx-auto mb-2 ${
                    urgency === 'urgent' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${urgency === 'urgent' ? 'text-red-700' : 'text-gray-700'}`}>
                    Urgent
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Need help soon</p>
                </button>
              </div>
            </div>

            {/* Therapist Selection (if available) */}
            {therapists.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Therapist
                </label>
                <select
                  value={preferredTherapist}
                  onChange={(e) => setPreferredTherapist(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any available therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name}
                      {therapist.specializations && ` - ${therapist.specializations.join(', ')}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Needs</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to discuss? *
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={6}
                  placeholder="Please describe what you'd like to work on in this session..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  This helps your therapist prepare for your session
                </p>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Your privacy is important</p>
                    <p>All information shared is confidential and will only be seen by your therapist.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Request</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Therapy Type</span>
                  <span className="font-medium text-gray-900">{therapyType}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Urgency</span>
                  <span className={`font-medium ${urgency === 'urgent' ? 'text-red-600' : 'text-green-600'}`}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </span>
                </div>
                
                {preferredTherapist && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Therapist</span>
                    <span className="font-medium text-gray-900">
                      {therapists.find(t => t.id === preferredTherapist)?.first_name}{' '}
                      {therapists.find(t => t.id === preferredTherapist)?.last_name}
                    </span>
                  </div>
                )}
                
                <div className="py-3">
                  <span className="text-sm text-gray-600 block mb-2">Description</span>
                  <p className="text-gray-900">{problemDescription}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important</p>
                    <p>Your appointment request will be reviewed and you'll receive a confirmation within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <button
            onClick={() => navigate('/client/appointments')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Appointments
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Request a new therapy session</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-24 h-1 mx-2 transition-all ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className={`text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Date & Time
            </span>
            <span className={`text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Description
            </span>
            <span className={`text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Review
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Previous
            </button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && (!selectedDate || !selectedTime)) {
                    errorAlert('Please select both date and time');
                    return;
                  }
                  if (step === 2 && !problemDescription) {
                    errorAlert('Please describe what you would like to discuss');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookAppointment;