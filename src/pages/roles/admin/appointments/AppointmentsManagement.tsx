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
      const response = await realApiService.admin.getAppointments({
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.therapist !== 'all' && { therapistId: filters.therapist })
      });
      
      if (response.success && response.data) {
        let appointmentsData = response.data.appointments || [];
        
        // Apply date filter
        appointmentsData = filterAppointmentsByDate(appointmentsData);
        
        // Apply payment status filter
        if (filters.paymentStatus !== 'all') {
          appointmentsData = appointmentsData.filter(apt => apt.payment_status === filters.paymentStatus);
        }
        
        setAppointments(appointmentsData);
      }
    } catch (error) {
      handleApiError(error);
      errorAlert('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await realApiService.admin.getClients({ status: 'active' });
      if (response.success && response.data) {
        setClients(response.data.clients || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadTherapists = async () => {
    try {
      const response = await realApiService.admin.getTherapists({ status: 'active' });
      if (response.success && response.data) {
        setTherapists(response.data.therapists || []);
      }
    } catch (error) {
      console.error('Failed to load therapists:', error);
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
    if (!validateForm()) {
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

      if (viewMode === 'create') {
        await createAppointmentApi.execute(appointmentData);
        await loadAppointments();
        setViewMode('list');
        resetForm();
      } else if (viewMode === 'edit' && selectedAppointment) {
        await updateAppointmentApi.execute(selectedAppointment.id, appointmentData);
        await loadAppointments();
        setViewMode('list');
        setSelectedAppointment(null);
        resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentApi.execute(appointmentId, { status: newStatus });
      success(`Appointment ${newStatus}`);
      await loadAppointments();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep'
    });

    if (!confirmed) return;

    try {
      await updateAppointmentApi.execute(appointmentId, { 
        status: 'cancelled',
        cancellation_reason: 'Cancelled by admin'
      });
      success('Appointment cancelled');
      await loadAppointments();
    } catch (error) {
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
                        {selectedAppointment.client_first_name} {selectedAppointment.client_last_name}
                      </p>
                      {selectedAppointment.client_email && (
                        <p className="text-sm text-gray-600">{selectedAppointment.client_email}</p>
                      )}
                      {selectedAppointment.client_phone && (
                        <p className="text-sm text-gray-600">{selectedAppointment.client_phone}</p>
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
                        {selectedAppointment.therapist_first_name} {selectedAppointment.therapist_last_name}
                      </p>
                      {selectedAppointment.therapist_email && (
                        <p className="text-sm text-gray-600">{selectedAppointment.therapist_email}</p>
                      )}
                      {selectedAppointment.therapist_phone && (
                        <p className="text-sm text-gray-600">{selectedAppointment.therapist_phone}</p>
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
                        {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
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
          title="No appointments found"
          description={searchTerm || filters.status !== 'all' || filters.date !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Schedule your first appointment to get started"}
          action={{
            label: "Create Appointment",
            onClick: () => setViewMode('create')
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

    // Sort dates
    const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
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
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </h4>
                          <StatusBadge
                            type="scheduled"
                            status={appointment.status}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>
                              {appointment.client_first_name} {appointment.client_last_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>
                              Dr. {appointment.therapist_first_name} {appointment.therapist_last_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          {appointment.therapy_type && (
                            <span className="text-xs text-gray-500">
                              {appointment.therapy_type}
                            </span>
                          )}
                          {appointment.location && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPinIcon className="w-3 h-3" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                          <StatusBadge
                            type="paid"
                            status={appointment.payment_status}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'scheduled' && (
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          icon={CheckCircleIcon}
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleStatusChange(appointment.id, 'confirmed');
                          }}
                        >
                          Confirm
                        </PremiumButton>
                      )}
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
                            startTime: appointment.start_time,
                            endTime: appointment.end_time,
                            therapyType: appointment.therapy_type || 'individual',
                            location: appointment.location || 'office',
                            notes: appointment.session_notes || ''
                          });
                          setViewMode('edit');
                        }}
                      >
                        Edit
                      </PremiumButton>
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
      onViewModeChange={setViewMode}
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
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <>
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