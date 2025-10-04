import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { clientApi } from '@/services/unifiedApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';
import SimpleHulpvragenSelector from '@/components/forms/SimpleHulpvragenSelector';
import notifications from '@/utils/notifications';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  specializations?: string[];
  availability?: any[];
  email?: string;
  phone?: string;
  bio?: string;
  therapy_types?: string;
  languages_spoken?: string[];
  online_therapy_available?: boolean;
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { success, error: errorAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedHulpvragen, setSelectedHulpvragen] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [preferredTherapist, setPreferredTherapist] = useState<string>('');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [therapyType, setTherapyType] = useState('Individual Therapy');
  const [hasUnpaidInvoices, setHasUnpaidInvoices] = useState(false);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [isCheckingInvoices, setIsCheckingInvoices] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);
  const [therapistSearchTerm, setTherapistSearchTerm] = useState('');
  const [showTherapistSelection, setShowTherapistSelection] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Load initial data once on component mount
  useEffect(() => {
    console.log('[BookAppointment] Component mounted - initializing');
    let isMounted = true;

    const loadInitialData = async () => {
      if (isMounted) {
        console.log('[BookAppointment] Loading initial data');
        await loadTherapists();
        await checkUnpaidInvoices();
        console.log('[BookAppointment] Initial data loaded');
      }
    };

    loadInitialData();

    return () => {
      console.log('[BookAppointment] Component unmounting');
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Handle preselected therapist separately
  useEffect(() => {
    const preselectedTherapistId = location.state?.preselectedTherapistId;
    console.log('[BookAppointment] Checking for preselected therapist:', preselectedTherapistId);
    if (preselectedTherapistId && allTherapists.length > 0) {
      const preselectedTherapist = allTherapists.find(t => t.id === preselectedTherapistId);
      if (preselectedTherapist) {
        console.log('[BookAppointment] Found preselected therapist:', preselectedTherapist.first_name, preselectedTherapist.last_name);
        setSelectedTherapist(preselectedTherapist);
        setPreferredTherapist(preselectedTherapistId);
        setShowTherapistSelection(true);
      } else {
        console.log('[BookAppointment] Preselected therapist not found in list');
      }
    }
  }, [allTherapists]); // Only re-run when therapists list changes

  useEffect(() => {
    console.log('[BookAppointment] Date/Therapist changed:', { selectedDate, therapist: selectedTherapist?.id });
    if (selectedDate && selectedTherapist) {
      console.log('[BookAppointment] Loading therapist availability');
      loadTherapistAvailability();
    } else if (selectedDate) {
      // Fallback to hardcoded slots if no therapist selected
      console.log('[BookAppointment] No therapist selected, generating fallback time slots');
      generateTimeSlots();
    }
  }, [selectedDate, selectedTherapist]);

  const checkUnpaidInvoices = async () => {
    console.log('[BookAppointment] Checking unpaid invoices');
    try {
      setIsCheckingInvoices(true);
      const response = await realApiService.client.getInvoices({ status: 'unpaid' });

      console.log('[BookAppointment] Invoices response:', response);

      if (response.success && response.data) {
        const data = response.data as any;
        const invoices = data.invoices || data || [];
        const unpaid = invoices.filter((inv: any) =>
          inv.status === 'sent' || inv.status === 'overdue'
        );

        let total = 0;
        unpaid.forEach((invoice: any) => {
          total += Number(invoice.total_amount);
        });

        console.log('[BookAppointment] Unpaid invoices:', unpaid.length, 'Total:', total);

        setUnpaidAmount(total);
        setHasUnpaidInvoices(total > 300);

        if (total > 300) {
          console.log('[BookAppointment] WARNING: Client has unpaid invoices over €300');
        }
      }
    } catch (error) {
      console.error('[BookAppointment] Error checking invoices:', error);
      // Silent fail - continue with appointment booking
    } finally {
      setIsCheckingInvoices(false);
    }
  };

  const loadTherapists = async () => {
    // Prevent duplicate calls - check if already loading
    if (isLoading) {
      console.log('[BookAppointment] Already loading therapists, skipping duplicate call');
      return;
    }

    console.log('[BookAppointment] Starting to load therapists');

    try {
      setIsLoading(true);

      // First try to get assigned therapist
      console.log('[BookAppointment] Checking for assigned therapist');
      try {
        const assignedResponse = await realApiService.client.getTherapist();
        console.log('[BookAppointment] Assigned therapist response:', assignedResponse);
        if (assignedResponse.success && assignedResponse.data) {
          console.log('[BookAppointment] Client has assigned therapist:', assignedResponse.data.first_name, assignedResponse.data.last_name);
          setTherapists([assignedResponse.data]);
          setPreferredTherapist(assignedResponse.data.id);
          setSelectedTherapist(assignedResponse.data);
        }
      } catch (error) {
        // No assigned therapist - this is okay
        console.log('[BookAppointment] No assigned therapist found (expected for new clients)');
      }

      // Load all available therapists
      console.log('[BookAppointment] Loading all available therapists');
      const allTherapistsResponse = await realApiService.therapists.getAll({ status: 'active' });
      console.log('[BookAppointment] All therapists response:', allTherapistsResponse);

      if (allTherapistsResponse.success && allTherapistsResponse.data) {
        const therapistsList = allTherapistsResponse.data.therapists || allTherapistsResponse.data || [];
        console.log('[BookAppointment] Loaded therapists:', therapistsList.length);
        console.log('[BookAppointment] Therapists list:', therapistsList.map((t: any) => ({ id: t.id, name: `${t.first_name} ${t.last_name}` })));
        setAllTherapists(therapistsList);
      } else {
        console.warn('[BookAppointment] Failed to load therapists list');
      }
    } catch (error) {
      // Silent fail - user can still proceed without therapist selection
      console.error('[BookAppointment] Error loading therapists:', error);
    } finally {
      setIsLoading(false);
      console.log('[BookAppointment] Finished loading therapists');
    }
  };


  // FIXED: Load real therapist availability instead of hardcoded slots
  const loadTherapistAvailability = async () => {
    if (!selectedTherapist || !selectedDate) {
      console.log('[BookAppointment] Cannot load availability - missing therapist or date');
      return;
    }

    // Prevent duplicate calls
    if (isLoadingAvailability) {
      console.log('[BookAppointment] Already loading availability, skipping duplicate call');
      return;
    }

    console.log('[BookAppointment] ===== LOADING THERAPIST AVAILABILITY =====');
    console.log('[BookAppointment] Therapist:', selectedTherapist.first_name, selectedTherapist.last_name, '(ID:', selectedTherapist.id + ')');
    console.log('[BookAppointment] Date:', selectedDate);

    try {
      setIsLoadingAvailability(true);

      // Call new endpoint to get therapists with availability slots
      console.log('[BookAppointment] Calling API: /client/therapists/available?date=' + selectedDate);
      const response = await realApiService.client.getAvailableTherapists({
        date: selectedDate
      });

      console.log('[BookAppointment] API Response:', response);

      if (response.success && response.data) {
        const therapists = response.data.therapists || [];
        console.log('[BookAppointment] Received therapists count:', therapists.length);

        // Find selected therapist in response
        const therapistData = therapists.find((t: any) => t.id === selectedTherapist.id);
        console.log('[BookAppointment] Found selected therapist in response:', !!therapistData);

        if (therapistData && therapistData.availabilitySlots) {
          console.log('[BookAppointment] Therapist availability slots:', therapistData.availabilitySlots);

          // Extract time slots from availability slots
          const slots = therapistData.availabilitySlots
            .map((slot: any) => slot.start_time.substring(0, 5)) // Format as HH:MM
            .sort((a: string, b: string) => a.localeCompare(b)); // Sort by time

          console.log('[BookAppointment] Processed time slots:', slots);
          setAvailableSlots(slots);

          if (slots.length === 0) {
            console.warn('[BookAppointment] No slots available for this date');
            errorAlert(`No available time slots for ${selectedTherapist.first_name} ${selectedTherapist.last_name} on ${formatDate(selectedDate)}`);
          } else {
            console.log('[BookAppointment] ✓ Successfully loaded', slots.length, 'available slots');
          }
        } else {
          console.warn('[BookAppointment] Therapist not found in response or no availability slots');
          setAvailableSlots([]);
          errorAlert(`${selectedTherapist.first_name} ${selectedTherapist.last_name} is not available on ${formatDate(selectedDate)}`);
        }
      } else {
        console.error('[BookAppointment] API response not successful');
        // Fallback to hardcoded slots if API fails
        generateTimeSlots();
        errorAlert('Could not load therapist availability. Showing general time slots.');
      }
    } catch (error: any) {
      console.error('[BookAppointment] ✗ Error loading therapist availability:', error);
      console.error('[BookAppointment] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Fallback to hardcoded slots
      generateTimeSlots();
      errorAlert('Could not load therapist availability. Showing general time slots.');
    } finally {
      setIsLoadingAvailability(false);
      console.log('[BookAppointment] ===== END LOADING AVAILABILITY =====');
    }
  };

  // Fallback method for when no therapist is selected
  const generateTimeSlots = () => {
    console.log('[BookAppointment] Generating fallback time slots (9:00-17:00)');
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    console.log('[BookAppointment] Generated', slots.length, 'fallback slots');
    setAvailableSlots(slots);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || selectedHulpvragen.length === 0) {
      errorAlert(t('validation.fillRequiredFields'));
      return;
    }

    // If therapist is selected, use new booking endpoint
    if (selectedTherapist) {
      setIsSubmitting(true);
      try {
        console.log('[BookAppointment] Submitting booking with:', {
          therapistId: selectedTherapist.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          hulpvragen: selectedHulpvragen
        });

        const bookingData = {
          therapistId: selectedTherapist.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          hulpvragen: selectedHulpvragen,
          problemDescription: problemDescription || '',
          therapyType: urgency === 'urgent' ? 'emergency' : 'individual',
          urgencyLevel: urgency
        };

        const response = await realApiService.client.bookWithTherapist(bookingData);

        console.log('[BookAppointment] Booking response:', response);

        if (response.success) {
          if (response.data?.waitingList) {
            notifications.info(
              'The therapist is not available at your selected time. Your request has been added to the waiting list and an admin will assign you a suitable therapist soon.',
              {
                title: 'Added to Waiting List',
                duration: 8000
              }
            );
          } else {
            notifications.success(
              `Your appointment with ${selectedTherapist.first_name} ${selectedTherapist.last_name} has been successfully booked for ${formatDate(selectedDate)} at ${selectedTime}!`,
              {
                title: 'Appointment Confirmed',
                duration: 8000,
                action: {
                  label: 'View Appointments',
                  onClick: () => navigate('/client/appointments')
                }
              }
            );
          }

          // Reset form
          console.log('[BookAppointment] Booking successful - resetting form');
          setSelectedDate('');
          setSelectedTime('');
          setSelectedHulpvragen([]);
          setProblemDescription('');
          setStep(1);
        }
      } catch (error: any) {
        console.error('[BookAppointment] Booking error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.';
        notifications.error(errorMessage, {
          title: 'Booking Failed',
          duration: 5000
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback to old endpoint if no therapist selected
      setIsSubmitting(true);
      try {
        const requestData = {
          preferredDate: selectedDate,
          preferredTime: selectedTime,
          therapyType: urgency === 'urgent' ? 'emergency' : 'regular',
          urgencyLevel: urgency,
          hulpvragen: selectedHulpvragen,
          reason: problemDescription || '',
          problemDescription: problemDescription || ''
        };

        const response = await realApiService.client.requestAppointment(requestData);

        if (response.success) {
          notifications.success(
            'Your appointment request has been submitted successfully. An admin will review and assign a therapist soon.',
            {
              title: 'Request Submitted',
              duration: 8000,
              action: {
                label: 'View Appointments',
                onClick: () => navigate('/client/appointments')
              }
            }
          );

          // Reset form
          console.log('[BookAppointment] Request successful - resetting form');
          setSelectedDate('');
          setSelectedTime('');
          setSelectedHulpvragen([]);
          setProblemDescription('');
          setStep(1);
        }
      } catch (error: any) {
        console.error('[BookAppointment] Request error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to submit appointment request. Please try again.';
        notifications.error(errorMessage, {
          title: 'Submission Failed',
          duration: 5000
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.selectDateTime')}</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('appointments.preferredDate')} *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      console.log('[BookAppointment] Date selected:', e.target.value);
                      setSelectedDate(e.target.value);
                    }}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('appointments.preferredTime')} *
                    </label>
                    {selectedTherapist && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Real availability for {selectedTherapist.first_name} {selectedTherapist.last_name}
                      </span>
                    )}
                  </div>
                  
                  {isLoadingAvailability ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="medium" />
                      <span className="ml-2 text-gray-600">Loading availability...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            console.log('[BookAppointment] Time slot selected:', slot);
                            setSelectedTime(slot);
                          }}
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
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No available time slots for this date</p>
                      <p className="text-sm text-gray-500 mt-1">Please select a different date or therapist</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Therapy Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('appointments.therapyType')} *
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
                {t('appointments.urgencyLevel')}
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
                    {t('appointments.normal')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{t('appointments.regularAppointment')}</p>
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
                    {t('appointments.urgent')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{t('appointments.needHelpSoon')}</p>
                </button>
              </div>
            </div>

            {/* Therapist Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('appointments.selectTherapist')}
              </label>
              
              {/* Show assigned therapist first if exists */}
              {therapists.length > 0 && !showTherapistSelection && (
                <div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {therapists[0].first_name?.charAt(0)}{therapists[0].last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {therapists[0].first_name} {therapists[0].last_name}
                          </p>
                          {therapists[0].specializations && therapists[0].specializations.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {therapists[0].specializations.join(', ')}
                            </p>
                          )}
                          <p className="text-xs text-blue-600 font-medium">{t('appointments.yourTherapist')}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('[BookAppointment] User clicked "Choose Another Therapist"');
                          setShowTherapistSelection(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('appointments.chooseAnother')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show therapist selection */}
              {(showTherapistSelection || therapists.length === 0) && (
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('appointments.searchTherapists')}
                      value={therapistSearchTerm}
                      onChange={(e) => setTherapistSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Therapist list */}
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                    {allTherapists
                      .filter(therapist => 
                        therapist.first_name?.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
                        therapist.last_name?.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
                        therapist.specializations?.some(s => s.toLowerCase().includes(therapistSearchTerm.toLowerCase()))
                      )
                      .map(therapist => (
                        <div
                          key={therapist.id}
                          onClick={() => {
                            console.log('[BookAppointment] Therapist selected:', therapist.first_name, therapist.last_name, '(ID:', therapist.id + ')');
                            setSelectedTherapist(therapist);
                            setPreferredTherapist(therapist.id);
                            setShowTherapistSelection(false);
                            // Reset selected time when changing therapist
                            console.log('[BookAppointment] Resetting selected time due to therapist change');
                            setSelectedTime('');
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedTherapist?.id === therapist.id
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {therapist.first_name?.charAt(0)}{therapist.last_name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {therapist.first_name} {therapist.last_name}
                              </p>
                              {therapist.specializations && therapist.specializations.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  {therapist.specializations.join(', ')}
                                </p>
                              )}
                              {therapist.languages_spoken && therapist.languages_spoken.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {t('appointments.languages')}: {therapist.languages_spoken.join(', ')}
                                </p>
                              )}
                              {therapist.online_therapy_available && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  {t('appointments.onlineAvailable')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {allTherapists.length === 0 && (
                      <p className="text-center text-gray-500 py-4">{t('appointments.noTherapistsAvailable')}</p>
                    )}
                  </div>

                  {therapists.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('[BookAppointment] Returning to assigned therapist:', therapists[0].first_name, therapists[0].last_name);
                        setSelectedTherapist(therapists[0]);
                        setPreferredTherapist(therapists[0].id);
                        setShowTherapistSelection(false);
                        // Reset selected time when changing therapist
                        console.log('[BookAppointment] Resetting selected time');
                        setSelectedTime('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      {t('appointments.backToAssigned')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.describeYourNeeds')}</h3>
              
              {/* Hulpvragen Selector */}
              <div className="mb-6">
                <SimpleHulpvragenSelector
                  value={selectedHulpvragen}
                  onChange={setSelectedHulpvragen}
                  maxSelection={5}
                  required={true}
                />
              </div>

              {/* Optional additional description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('appointments.additionalInfo')} (optioneel)
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={4}
                  placeholder={t('appointments.additionalDetailsPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t('appointments.optionalAdditionalInfo')}
                </p>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">{t('appointments.privacyImportant')}</p>
                    <p>{t('appointments.confidentialInfo')}</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.reviewRequest')}</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">{t('appointments.date')}</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">{t('appointments.time')}</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">{t('appointments.therapyType')}</span>
                  <span className="font-medium text-gray-900">{therapyType}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">{t('appointments.urgency')}</span>
                  <span className={`font-medium ${urgency === 'urgent' ? 'text-red-600' : 'text-green-600'}`}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </span>
                </div>
                
                {selectedTherapist && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">{t('appointments.therapist')}</span>
                    <span className="font-medium text-gray-900">
                      {selectedTherapist.first_name} {selectedTherapist.last_name}
                    </span>
                  </div>
                )}
                
                <div className="py-3">
                  <span className="text-sm text-gray-600 block mb-2">{t('appointments.selectedConcerns')}</span>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedHulpvragen.map((hulpvraag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                        {hulpvraag}
                      </span>
                    ))}
                  </div>
                  {problemDescription && (
                    <>
                      <span className="text-sm text-gray-600 block mb-2">{t('appointments.additionalInfo')}</span>
                      <p className="text-gray-900">{problemDescription}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">{t('common.important')}</p>
                    <p>{t('appointments.requestReviewNotice')}</p>
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

  if (isCheckingInvoices) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </PageTransition>
    );
  }

  if (hasUnpaidInvoices) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('appointments.bookingRestricted')}</h2>
              <p className="text-gray-600 mb-6">
                {t('appointments.cannotBookExceedsLimit')}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">
                  {t('appointments.outstandingBalance')}: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(unpaidAmount)}
                </p>
              </div>
              <p className="text-gray-600 mb-8">
                {t('appointments.payToContineBooking')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/client/invoices?filter=unpaid')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('appointments.viewUnpaidInvoices')}
                </button>
                <button
                  onClick={() => navigate('/client/payment-center')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t('appointments.makePayment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
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
            {t('common.backToAppointments')}
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('appointments.bookAppointment')}</h1>
          <p className="text-gray-600">{t('appointments.requestNewSession')}</p>
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
              {t('appointments.dateTime')}
            </span>
            <span className={`text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {t('appointments.description')}
            </span>
            <span className={`text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {t('appointments.review')}
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
              onClick={() => {
                console.log('[BookAppointment] Navigation: Going back from step', step, 'to step', step - 1);
                setStep(step - 1);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('common.previous')}
            </button>
          )}

          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={() => {
                  console.log('[BookAppointment] Attempting to move from step', step, 'to step', step + 1);
                  if (step === 1 && (!selectedDate || !selectedTime)) {
                    console.warn('[BookAppointment] Cannot proceed: Missing date or time');
                    errorAlert(t('appointments.selectDateTimeError'));
                    return;
                  }
                  if (step === 2 && selectedHulpvragen.length === 0) {
                    console.warn('[BookAppointment] Cannot proceed: No hulpvragen selected');
                    errorAlert(t('appointments.selectConcerns'));
                    return;
                  }
                  console.log('[BookAppointment] ✓ Validation passed, moving to step', step + 1);
                  console.log('[BookAppointment] Current state:', {
                    date: selectedDate,
                    time: selectedTime,
                    therapist: selectedTherapist ? `${selectedTherapist.first_name} ${selectedTherapist.last_name}` : 'None',
                    hulpvragen: selectedHulpvragen
                  });
                  setStep(step + 1);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('common.next')}
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
                    {t('common.submitting')}...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {t('appointments.submitRequest')}
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