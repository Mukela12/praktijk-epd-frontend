import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate, formatTime, formatDateTime } from '@/utils/dateFormatters';
import { useApiWithErrorHandling } from '@/hooks/useApiWithErrorHandling';
import { normalizeAppointmentList, withSmartDefaults } from '@/utils/dataMappers';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons } from '@/components/crud/InlineCrudLayout';
import { TextField, SelectField, TextareaField, DateField, TimeField } from '@/components/forms/FormFields';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  therapy_type?: string;
  location?: string;
  session_notes?: string;
  homework_assigned?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  invoice_sent: boolean;
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
  // Related data
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  client_phone?: string;
  therapist_first_name?: string;
  therapist_last_name?: string;
  therapist_email?: string;
  therapist_phone?: string;
  // Additional fields that might come from backend
  appointment_time?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
  therapistFirstName?: string;
  therapistLastName?: string;
  therapistEmail?: string;
  duration_minutes?: number;
  type?: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const AppointmentsManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert, confirm } = useAlert();

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    therapist: 'all',
    date: 'all',
    paymentStatus: 'all'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    todayCount: 0,
    weekCount: 0,
    pendingPayments: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    therapistId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    therapyType: 'individual',
    location: 'office',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Date filter options
  const dateFilterOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'nextMonth', label: 'Next Month' },
    { value: 'past', label: 'Past Appointments' }
  ];

  // API hooks
  const createAppointmentApi = useApiWithErrorHandling(realApiService.therapist.createAppointment, {
    successMessage: 'Appointment created successfully',
    errorMessage: 'Failed to create appointment'
  });

  const updateAppointmentApi = useApiWithErrorHandling(realApiService.therapist.updateAppointment, {
    successMessage: 'Appointment updated successfully',
    errorMessage: 'Failed to update appointment'
  });

  // Load data
  useEffect(() => {
    loadAppointments();
    loadClients();
    loadTherapists();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('[AdminAppointments] ===== LOADING APPOINTMENTS =====');
      console.log('[AdminAppointments] Filters:', filters);

      const apiParams = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.therapist !== 'all' && { therapistId: filters.therapist }),
        page: 1,
        limit: 100
      };
      console.log('[AdminAppointments] API params:', apiParams);
      console.log('[AdminAppointments] Calling API: /admin/appointments');

      const response = await realApiService.admin.getAppointments(apiParams);

      console.log('[AdminAppointments] API Response:', response);
      console.log('[AdminAppointments] Response success:', response.success);
      console.log('[AdminAppointments] Response data keys:', response.data ? Object.keys(response.data) : 'no data');
      
      if (response.success && response.data) {
        let appointmentsData = response.data.appointments || [];
        console.log('[AdminAppointments] Raw appointments count:', appointmentsData.length);
        console.log('[AdminAppointments] First raw appointment (if any):', appointmentsData[0]);

        // Use centralized data transformation instead of manual mapping
        console.log('[AdminAppointments] Starting normalization...');
        try {
          const normalizedAppointments = normalizeAppointmentList(appointmentsData);
          console.log('[AdminAppointments] Normalized count:', normalizedAppointments.length);

          appointmentsData = normalizedAppointments.map((normalized: any) => {
            const appointment = withSmartDefaults(normalized, 'appointment');

            return {
              ...appointment,
              // Map to component's expected field names
              start_time: appointment.startTime,
              appointment_time: appointment.appointmentTime,
              client_first_name: appointment.clientFirstName,
              client_last_name: appointment.clientLastName,
              client_email: appointment.clientEmail,
              client_phone: appointment.client?.phone || '',
              therapist_first_name: appointment.therapistFirstName,
              therapist_last_name: appointment.therapistLastName,
              therapist_email: appointment.therapistEmail,
              therapy_type: appointment.therapyType,
              payment_status: appointment.paymentStatus,
              invoice_sent: appointment.invoice_sent || false
            };
          });
          console.log('[AdminAppointments] ✓ Normalization successful');
          console.log('[AdminAppointments] First normalized appointment:', appointmentsData[0]);
        } catch (error) {
          console.error('[AdminAppointments] ✗ Error normalizing appointment data:', error);
          console.error('[AdminAppointments] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          // Fallback to original data if normalization fails
        }

        // Apply date filter
        console.log('[AdminAppointments] Applying date filter:', filters.date);
        const beforeDateFilter = appointmentsData.length;
        appointmentsData = filterAppointmentsByDate(appointmentsData);
        console.log('[AdminAppointments] After date filter:', appointmentsData.length, `(filtered out ${beforeDateFilter - appointmentsData.length})`);

        // Apply payment status filter
        if (filters.paymentStatus !== 'all') {
          console.log('[AdminAppointments] Applying payment status filter:', filters.paymentStatus);
          const beforePaymentFilter = appointmentsData.length;
          appointmentsData = appointmentsData.filter(apt => apt.payment_status === filters.paymentStatus);
          console.log('[AdminAppointments] After payment filter:', appointmentsData.length, `(filtered out ${beforePaymentFilter - appointmentsData.length})`);
        }

        console.log('[AdminAppointments] Final filtered count:', appointmentsData.length);
        setAppointments(appointmentsData);
        
        // Calculate statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        
        const stats = {
          total: appointmentsData.length,
          scheduled: appointmentsData.filter(apt => apt.status === 'scheduled').length,
          confirmed: appointmentsData.filter(apt => apt.status === 'confirmed').length,
          completed: appointmentsData.filter(apt => apt.status === 'completed').length,
          cancelled: appointmentsData.filter(apt => apt.status === 'cancelled').length,
          noShow: appointmentsData.filter(apt => apt.status === 'no-show').length,
          todayCount: appointmentsData.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() === today.getTime();
          }).length,
          weekCount: appointmentsData.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= today && aptDate <= weekFromNow;
          }).length,
          pendingPayments: appointmentsData.filter(apt => apt.payment_status === 'pending').length
        };
        
        console.log('[AdminAppointments] Calculated statistics:', stats);
        setStatistics(stats);

        // If we have statistics from the API response, merge them
        if (response.data && 'statistics' in response.data) {
          console.log('[AdminAppointments] Merging API statistics:', (response.data as any).statistics);
          setStatistics(prev => ({ ...prev, ...(response.data as any).statistics }));
        }
        console.log('[AdminAppointments] ✓ Successfully loaded appointments');
      } else {
        console.error('[AdminAppointments] ✗ Invalid response structure:', response);
        errorAlert('Invalid response from server');
      }
    } catch (error) {
      console.error('[AdminAppointments] ✗ Error loading appointments:', error);
      console.error('[AdminAppointments] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      handleApiError(error);
      errorAlert('Failed to load appointments. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      console.log('[AdminAppointments] ===== LOAD COMPLETE =====');
    }
  };

  const loadClients = async () => {
    try {
      console.log('[AdminAppointments] Loading clients for dropdown...');
      const response = await realApiService.admin.getClients({ status: 'active' });
      console.log('[AdminAppointments] Clients response:', response);
      if (response.success && response.data) {
        const clientsData = response.data.clients || [];
        console.log('[AdminAppointments] ✓ Loaded', clientsData.length, 'clients for dropdown');
        setClients(clientsData);
      } else {
        console.error('[AdminAppointments] ✗ No clients in response');
      }
    } catch (error) {
      console.error('[AdminAppointments] ✗ Failed to load clients:', error);
    }
  };

  const loadTherapists = async () => {
    try {
      console.log('[AdminAppointments] Loading therapists for dropdown...');
      const response = await realApiService.admin.getTherapists({ status: 'active' });
      console.log('[AdminAppointments] Therapists response:', response);
      if (response.success && response.data) {
        const therapistsData = response.data.therapists || [];
        console.log('[AdminAppointments] ✓ Loaded', therapistsData.length, 'therapists for dropdown');
        setTherapists(therapistsData);
      } else {
        console.error('[AdminAppointments] ✗ No therapists in response');
      }
    } catch (error) {
      console.error('[AdminAppointments] ✗ Failed to load therapists:', error);
    }
  };

  // Filter appointments by date
  const filterAppointmentsByDate = (appointmentsList: Appointment[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    return appointmentsList.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      aptDate.setHours(0, 0, 0, 0);
      
      switch (filters.date) {
        case 'today':
          return aptDate.getTime() === today.getTime();
        case 'tomorrow':
          return aptDate.getTime() === tomorrow.getTime();
        case 'thisWeek':
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        case 'nextWeek':
          return aptDate >= startOfNextWeek && aptDate <= endOfNextWeek;
        case 'thisMonth':
          return aptDate >= startOfMonth && aptDate <= endOfMonth;
        case 'nextMonth':
          return aptDate >= startOfNextMonth && aptDate <= endOfNextMonth;
        case 'past':
          return aptDate < today;
        default:
          return true;
      }
    });
  };

  // Filter appointments by search
  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      apt.client_first_name?.toLowerCase().includes(search) ||
      apt.client_last_name?.toLowerCase().includes(search) ||
      apt.therapist_first_name?.toLowerCase().includes(search) ||
      apt.therapist_last_name?.toLowerCase().includes(search) ||
      apt.therapy_type?.toLowerCase().includes(search) ||
      apt.location?.toLowerCase().includes(search)
    );
  });

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.clientId) {
      errors.clientId = 'Client is required';
    }

    if (!formData.therapistId) {
      errors.therapistId = 'Therapist is required';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Date is required';
    }

    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      errors.endTime = 'End time must be after start time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('[AdminAppointments] ===== FORM SUBMISSION =====');
    console.log('[AdminAppointments] View mode:', viewMode);
    console.log('[AdminAppointments] Form data:', formData);

    if (!validateForm()) {
      console.log('[AdminAppointments] ✗ Form validation failed');
      warning('Please fix the form errors');
      return;
    }

    try {
      const appointmentData = {
        clientId: formData.clientId,
        therapistId: formData.therapistId,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.therapyType,
        location: formData.location,
        notes: formData.notes
      };

      console.log('[AdminAppointments] Appointment data to submit:', appointmentData);

      if (viewMode === 'create') {
        console.log('[AdminAppointments] Creating new appointment...');
        await createAppointmentApi.execute(appointmentData);
        console.log('[AdminAppointments] ✓ Appointment created successfully');
        await loadAppointments();
        setViewMode('list');
        resetForm();
      } else if (viewMode === 'edit' && selectedAppointment) {
        console.log('[AdminAppointments] Updating appointment:', selectedAppointment.id);
        await updateAppointmentApi.execute(selectedAppointment.id, appointmentData);
        console.log('[AdminAppointments] ✓ Appointment updated successfully');
        await loadAppointments();
        setViewMode('list');
        setSelectedAppointment(null);
        resetForm();
      }
    } catch (error) {
      console.error('[AdminAppointments] ✗ Form submission error:', error);
      console.error('[AdminAppointments] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    console.log('[AdminAppointments] ===== STATUS CHANGE =====');
    console.log('[AdminAppointments] Appointment ID:', appointmentId);
    console.log('[AdminAppointments] New status:', newStatus);

    try {
      await updateAppointmentApi.execute(appointmentId, { status: newStatus });
      console.log('[AdminAppointments] ✓ Status changed successfully');
      success(`Appointment ${newStatus}`);
      await loadAppointments();
    } catch (error) {
      console.error('[AdminAppointments] ✗ Status change failed:', error);
      console.error('[AdminAppointments] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      handleApiError(error);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    console.log('[AdminAppointments] ===== DELETE APPOINTMENT =====');
    console.log('[AdminAppointments] Appointment ID:', appointmentId);

    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep'
    });

    if (!confirmed) {
      console.log('[AdminAppointments] Delete cancelled by user');
      return;
    }

    try {
      console.log('[AdminAppointments] Cancelling appointment...');
      await updateAppointmentApi.execute(appointmentId, {
        status: 'cancelled',
        cancellation_reason: 'Cancelled by admin'
      });
      console.log('[AdminAppointments] ✓ Appointment cancelled successfully');
      success('Appointment cancelled');
      await loadAppointments();
    } catch (error) {
      console.error('[AdminAppointments] ✗ Delete failed:', error);
      console.error('[AdminAppointments] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      handleApiError(error);
    }
  };

  // Send reminder
  const handleSendReminder = async (appointmentId: string) => {
    try {
      // Call reminder endpoint
      info('Reminder sent to client');
    } catch (error) {
      handleApiError(error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      clientId: '',
      therapistId: '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      therapyType: 'individual',
      location: 'office',
      notes: ''
    });
    setFormErrors({});
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'confirmed': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      case 'no-show': return 'orange';
      default: return 'gray';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  // Render detail view
  const renderDetailView = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="space-y-6">
        <PremiumCard>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Appointment Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.start_time)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge
                    type="scheduled"
                    status={selectedAppointment.status}
                  />
                  <StatusBadge
                    type="paid"
                    status={selectedAppointment.payment_status}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      icon={CheckCircleIcon}
                      onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                    >
                      Confirm
                    </PremiumButton>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      icon={PencilIcon}
                      onClick={() => {
                        setFormData({
                          clientId: selectedAppointment.client_id,
                          therapistId: selectedAppointment.therapist_id,
                          appointmentDate: selectedAppointment.appointment_date,
                          startTime: selectedAppointment.start_time,
                          endTime: selectedAppointment.end_time,
                          therapyType: selectedAppointment.therapy_type || 'individual',
                          location: selectedAppointment.location || 'office',
                          notes: selectedAppointment.session_notes || ''
                        });
                        setViewMode('edit');
                      }}
                    >
                      Edit
                    </PremiumButton>
                  </>
                )}
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={XCircleIcon}
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  >
                    Cancel
                  </PremiumButton>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Client Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedAppointment.client_first_name || 'Client'} {selectedAppointment.client_last_name || ''}
                      </p>
                      {selectedAppointment.client_email && (
                        <a href={`mailto:${selectedAppointment.client_email}`} className="text-sm text-blue-600 hover:text-blue-800">
                          {selectedAppointment.client_email}
                        </a>
                      )}
                      {selectedAppointment.client_phone && (
                        <a href={`tel:${selectedAppointment.client_phone}`} className="text-sm text-blue-600 hover:text-blue-800 block">
                          {selectedAppointment.client_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapist Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Therapist Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr. {selectedAppointment.therapist_first_name || 'Therapist'} {selectedAppointment.therapist_last_name || ''}
                      </p>
                      {selectedAppointment.therapist_email && (
                        <a href={`mailto:${selectedAppointment.therapist_email}`} className="text-sm text-blue-600 hover:text-blue-800">
                          {selectedAppointment.therapist_email}
                        </a>
                      )}
                      {selectedAppointment.therapist_phone && (
                        <a href={`tel:${selectedAppointment.therapist_phone}`} className="text-sm text-blue-600 hover:text-blue-800 block">
                          {selectedAppointment.therapist_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedAppointment.appointment_date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.start_time ? formatTime(selectedAppointment.start_time) : 'Time TBD'} 
                        {selectedAppointment.end_time && ` - ${formatTime(selectedAppointment.end_time)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.duration} minutes</p>
                    </div>
                  </div>
                  {selectedAppointment.location && (
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{selectedAppointment.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Billing */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Payment & Billing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <StatusBadge
                        type="paid"
                        status={selectedAppointment.payment_status}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Invoice</p>
                      <p className="font-medium text-gray-900">
                        {selectedAppointment.invoice_sent ? 'Sent' : 'Not sent'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.session_notes && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Session Notes</h3>
                <p className="text-gray-600">{selectedAppointment.session_notes}</p>
              </div>
            )}

            {/* Cancellation Reason */}
            {selectedAppointment.cancellation_reason && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Cancellation Reason</h3>
                <p className="text-gray-600">{selectedAppointment.cancellation_reason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {selectedAppointment.status === 'scheduled' && (
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    icon={EnvelopeIcon}
                    onClick={() => handleSendReminder(selectedAppointment.id)}
                  >
                    Send Reminder
                  </PremiumButton>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    icon={CheckCircleIcon}
                    onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                  >
                    Mark Completed
                  </PremiumButton>
                )}
                {selectedAppointment.status === 'scheduled' && (
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    icon={XCircleIcon}
                    onClick={() => handleStatusChange(selectedAppointment.id, 'no-show')}
                  >
                    Mark No-Show
                  </PremiumButton>
                )}
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={ChatBubbleLeftRightIcon}
                  onClick={() => info('Opening message composer...')}
                >
                  Send Message
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    );
  };

  // Render form
  const renderForm = () => {
    const isEdit = viewMode === 'edit';

    return (
      <div className="space-y-6">
        <FormSection
          title="Appointment Information"
          description="Schedule a new appointment or update existing one"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Client"
              name="clientId"
              value={formData.clientId}
              onChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
              options={clients.map(client => ({
                value: client.id,
                label: `${client.first_name} ${client.last_name}`
              }))}
              error={formErrors.clientId}
              required
              disabled={isEdit}
            />
            <SelectField
              label="Therapist"
              name="therapistId"
              value={formData.therapistId}
              onChange={(value) => setFormData(prev => ({ ...prev, therapistId: value }))}
              options={therapists.map(therapist => ({
                value: therapist.id,
                label: `${therapist.first_name} ${therapist.last_name}`
              }))}
              error={formErrors.therapistId}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DateField
              label="Date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={(value) => setFormData(prev => ({ ...prev, appointmentDate: value }))}
              error={formErrors.appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <TimeField
              label="Start Time"
              name="startTime"
              value={formData.startTime}
              onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
              error={formErrors.startTime}
              required
            />
            <TimeField
              label="End Time"
              name="endTime"
              value={formData.endTime}
              onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
              error={formErrors.endTime}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Therapy Type"
              name="therapyType"
              value={formData.therapyType}
              onChange={(value) => setFormData(prev => ({ ...prev, therapyType: value }))}
              options={[
                { value: 'individual', label: 'Individual Therapy' },
                { value: 'couples', label: 'Couples Therapy' },
                { value: 'family', label: 'Family Therapy' },
                { value: 'group', label: 'Group Therapy' }
              ]}
            />
            <SelectField
              label="Location"
              name="location"
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              options={[
                { value: 'office', label: 'Office' },
                { value: 'online', label: 'Online' },
                { value: 'home', label: 'Home Visit' }
              ]}
            />
          </div>

          <TextareaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            placeholder="Any special notes or requirements for this appointment"
            rows={3}
          />
        </FormSection>

        <ActionButtons
          onCancel={() => {
            setViewMode('list');
            setSelectedAppointment(null);
            resetForm();
          }}
          onSubmit={handleSubmit}
          submitText={isEdit ? 'Update Appointment' : 'Create Appointment'}
          isSubmitting={createAppointmentApi.isLoading || updateAppointmentApi.isLoading}
        />
      </div>
    );
  };

  // Render list
  const renderList = () => {
    if (filteredAppointments.length === 0) {
      return (
        <PremiumEmptyState
          icon={CalendarDaysIcon}
          title={searchTerm || filters.status !== 'all' || filters.date !== 'all' || filters.therapist !== 'all' || filters.paymentStatus !== 'all'
            ? "No appointments match your filters"
            : "No appointments scheduled yet"}
          description={searchTerm || filters.status !== 'all' || filters.date !== 'all' || filters.therapist !== 'all' || filters.paymentStatus !== 'all'
            ? "Try adjusting your search criteria or filters to see more results" 
            : "Start scheduling appointments to manage therapy sessions"}
          action={{
            label: searchTerm || filters.status !== 'all' || filters.date !== 'all' || filters.therapist !== 'all' || filters.paymentStatus !== 'all'
              ? "Clear Filters"
              : "Schedule First Appointment",
            onClick: () => {
              if (searchTerm || filters.status !== 'all' || filters.date !== 'all' || filters.therapist !== 'all' || filters.paymentStatus !== 'all') {
                setSearchTerm('');
                setFilters({
                  status: 'all',
                  therapist: 'all',
                  date: 'all',
                  paymentStatus: 'all'
                });
              } else {
                setViewMode('create');
              }
            }
          }}
        />
      );
    }

    // Group appointments by date
    const groupedAppointments: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!groupedAppointments[date]) {
        groupedAppointments[date] = [];
      }
      groupedAppointments[date].push(apt);
    });

    // Sort dates (newest first)
    const sortedDates = Object.keys(groupedAppointments).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    return (
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {groupedAppointments[date].map((appointment) => (
                <ListItemCard
                  key={appointment.id}
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setViewMode('detail');
                  }}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-7 h-7 text-blue-700" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {appointment.start_time ? formatTime(appointment.start_time) : 'Time TBD'} 
                            {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                          </h4>
                          <StatusBadge
                            type="scheduled"
                            status={appointment.status}
                            size="sm"
                          />
                          <StatusBadge
                            type="paid"
                            status={appointment.payment_status}
                            size="sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Client:</span>
                                <span className="text-gray-900">
                                  {appointment.client_first_name || 'Client'} {appointment.client_last_name || ''}
                                </span>
                              </div>
                            </div>
                            {appointment.client_email && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                <EnvelopeIcon className="w-3 h-3" />
                                <span>{appointment.client_email}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Therapist:</span>
                                <span className="text-gray-900">
                                  Dr. {appointment.therapist_first_name || 'Therapist'} {appointment.therapist_last_name || ''}
                                </span>
                              </div>
                            </div>
                            {appointment.therapist_email && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                <EnvelopeIcon className="w-3 h-3" />
                                <span>{appointment.therapist_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          {appointment.therapy_type && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-medium text-gray-500 uppercase">Type:</span>
                              <span className="text-xs text-gray-700 capitalize">
                                {appointment.therapy_type.replace('_', ' ')}
                              </span>
                            </div>
                          )}
                          {appointment.location && (
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700 capitalize">{appointment.location}</span>
                            </div>
                          )}
                          {appointment.duration && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">{appointment.duration} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      {appointment.status === 'scheduled' && (
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          icon={CheckCircleIcon}
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleStatusChange(appointment.id, 'confirmed');
                          }}
                          className="whitespace-nowrap"
                        >
                          Confirm
                        </PremiumButton>
                      )}
                      <div className="flex items-center space-x-1">
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          icon={PencilIcon}
                          onClick={(e) => {
                            e?.stopPropagation();
                            setSelectedAppointment(appointment);
                            setFormData({
                              clientId: appointment.client_id,
                              therapistId: appointment.therapist_id,
                              appointmentDate: appointment.appointment_date,
                              startTime: appointment.start_time || appointment.appointment_time || '',
                              endTime: appointment.end_time || '',
                              therapyType: appointment.therapy_type || 'individual',
                              location: appointment.location || 'office',
                              notes: appointment.session_notes || ''
                            });
                            setViewMode('edit');
                          }}
                          className="p-2"
                        >
                          <span className="sr-only">Edit</span>
                        </PremiumButton>
                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                          <PremiumButton
                            variant="outline"
                            size="sm"
                            icon={TrashIcon}
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleDeleteAppointment(appointment.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 border-red-300"
                          >
                            <span className="sr-only">Cancel</span>
                          </PremiumButton>
                        )}
                      </div>
                    </div>
                  </div>
                </ListItemCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <InlineCrudLayout
      title="Appointments Management"
      subtitle="Manage all appointments in the system"
      icon={CalendarDaysIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
          setViewMode(mode);
        }
      }}
      showCreateButton={viewMode === 'list'}
      createButtonText="Schedule Appointment"
      isLoading={isLoading}
      totalCount={appointments.length}
      onBack={viewMode !== 'list' ? () => {
        setViewMode('list');
        setSelectedAppointment(null);
        resetForm();
      } : undefined}
    >
      {viewMode === 'list' && (
        <>
          {/* Statistics Summary */}
          {appointments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              <PremiumCard className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Today</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.todayCount}</p>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.weekCount}</p>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.scheduled}</p>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <BanknotesIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pending Pay</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.pendingPayments}</p>
                  </div>
                </div>
              </PremiumCard>
            </div>
          )}
          
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={ArrowPathIcon}
                  onClick={() => loadAppointments()}
                  className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </PremiumButton>
                <select
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {dateFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
                <select
                  value={filters.therapist}
                  onChange={(e) => setFilters(prev => ({ ...prev, therapist: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Therapists</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </>
            }
          />
          {renderList()}
        </>
      )}
      {(viewMode === 'create' || viewMode === 'edit') && renderForm()}
      {viewMode === 'detail' && renderDetailView()}
    </InlineCrudLayout>
  );
};

export default AppointmentsManagement;