import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { realApiService } from "@/services/realApi";
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons, EmptyState } from '@/components/crud/InlineCrudLayout';
import { TextField, SelectField, TextAreaField, DateField } from '@/components/forms/FormFields';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDate } from '@/utils/dateFormatters';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  assigned_therapist_id?: string;
  insurance_company?: string;
  insurance_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  therapy_type?: string;
  urgency_level?: string;
  reason_for_therapy?: string;
  referred_by?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at?: string;
}

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const ClientManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert, warning, confirm } = useAlert();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    therapist: 'all'
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    therapistId: '',
    insuranceCompany: '',
    insuranceNumber: '',
    therapyType: 'individual',
    urgencyLevel: 'normal',
    reasonForTherapy: '',
    referredBy: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading clients and therapists...');
      
      const [clientsResponse, therapistsResponse] = await Promise.all([
        realApiService.admin.getClients(),
        realApiService.admin.getTherapists()
      ]);

      console.log('Clients response:', clientsResponse);
      console.log('Therapists response:', therapistsResponse);

      if (clientsResponse.success && clientsResponse.data) {
        const clientsData = Array.isArray(clientsResponse.data) 
          ? clientsResponse.data 
          : (clientsResponse.data as any).clients || [];
        console.log('Processed clients data:', clientsData.length, 'clients');
        setClients(clientsData);
      } else {
        console.error('No clients data in response');
      }

      if (therapistsResponse.success && therapistsResponse.data) {
        const therapistsData = Array.isArray(therapistsResponse.data) 
          ? therapistsResponse.data 
          : (therapistsResponse.data as any).therapists || [];
        console.log('Processed therapists data:', therapistsData.length, 'therapists');
        setTherapists(therapistsData);
      } else {
        console.error('No therapists data in response');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      errorAlert(handleApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.therapistId) {
      errors.therapistId = 'Please assign a therapist';
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

    setIsSubmitting(true);
    try {
      if (viewMode === 'create') {
        const response = await realApiService.admin.createUser({
          email: formData.email,
          password: 'TempPassword123!', // Temporary password
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'client',
          phone: formData.phone
        });
        
        // TODO: Update client profile with additional data after user creation
        // This would require a separate API call to update client-specific information

        if (response.success) {
          success('Client added successfully! A welcome email with login instructions has been sent.');
          await loadData();
          setViewMode('list');
          resetForm();
        }
      } else if (viewMode === 'edit' && selectedClient) {
        // Update basic user information
        const updateData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          // Additional client data should be sent through additionalData field
          // but backend doesn't support it yet, so we send what we can
        };
        
        const response = await realApiService.admin.updateUser(selectedClient.id, updateData);
        
        if (response.success) {
          success('Client updated successfully');
          await loadData();
          setViewMode('list');
          resetForm();
        }
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      errorAlert(handleApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      postalCode: '',
      therapistId: '',
      insuranceCompany: '',
      insuranceNumber: '',
      therapyType: 'individual',
      urgencyLevel: 'normal',
      reasonForTherapy: '',
      referredBy: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: ''
    });
    setFormErrors({});
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'create') {
      resetForm();
      setSelectedClient(null);
    }
  };

  // Handle client selection
  const handleClientSelect = (client: Client, mode: ViewMode) => {
    setSelectedClient(client);
    setViewMode(mode);
    
    if (mode === 'edit') {
      setFormData({
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone || '',
        dateOfBirth: client.date_of_birth || '',
        address: client.address || '',
        city: client.city || '',
        postalCode: client.postal_code || '',
        therapistId: client.assigned_therapist_id || '',
        insuranceCompany: client.insurance_company || '',
        insuranceNumber: client.insurance_number || '',
        therapyType: client.therapy_type || 'individual',
        urgencyLevel: client.urgency_level || 'normal',
        reasonForTherapy: client.reason_for_therapy || '',
        referredBy: client.referred_by || '',
        emergencyContactName: client.emergency_contact_name || '',
        emergencyContactPhone: client.emergency_contact_phone || '',
        notes: client.notes || ''
      });
    }
  };

  // Handle delete
  const handleDelete = async (clientId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this client?', 'This action cannot be undone.');
    
    if (confirmed) {
      try {
        // TODO: Backend doesn't have a delete user endpoint yet
        // For now, we could deactivate the user instead
        warning('Delete functionality is not yet implemented in the backend');
        
        // Once backend supports it, use:
        // await realApiService.admin.deleteUser(clientId);
        // success('Client deleted successfully');
        // await loadData();
      } catch (error) {
        errorAlert(handleApiError(error).message);
      }
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm));
    
    const matchesStatus = filters.status === 'all' || client.status === filters.status;
    const matchesTherapist = filters.therapist === 'all' || client.assigned_therapist_id === filters.therapist;
    
    return matchesSearch && matchesStatus && matchesTherapist;
  });

  // Render list view
  const renderList = () => {
    if (filteredClients.length === 0) {
      return (
        <EmptyState
          icon={UsersIcon}
          title="No clients found"
          description={searchTerm || filters.status !== 'all' || filters.therapist !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Get started by adding your first client"}
          actionLabel="Add First Client"
          onAction={() => handleViewModeChange('create')}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client) => {
          const therapist = therapists.find(t => t.id === client.assigned_therapist_id);
          
          return (
            <ListItemCard key={client.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {client.first_name[0]}{client.last_name[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <StatusBadge 
                        status={client.status} 
                        type="client" 
                        size="sm" 
                      />
                      {therapist && (
                        <span className="text-sm text-gray-600">
                          Therapist: {therapist.first_name} {therapist.last_name}
                        </span>
                      )}
                      {client.therapy_type && (
                        <span className="text-sm text-gray-600 capitalize">
                          {client.therapy_type.replace('_', ' ')} therapy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleClientSelect(client, 'detail')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleClientSelect(client, 'edit')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </ListItemCard>
          );
        })}
      </div>
    );
  };

  // Render form view
  const renderForm = () => {
    const isEdit = viewMode === 'edit';
    
    return (
      <div className="space-y-6">
        <FormSection
          title="Basic Information"
          description="Personal details of the client"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
              error={formErrors.firstName}
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
              error={formErrors.lastName}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              error={formErrors.email}
              disabled={isEdit}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              error={formErrors.phone}
              placeholder="+31 6 12345678"
              required
            />
            <DateField
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
              error={formErrors.dateOfBirth}
              required
            />
            <SelectField
              label="Assigned Therapist"
              name="therapistId"
              value={formData.therapistId}
              onChange={(value) => setFormData(prev => ({ ...prev, therapistId: value }))}
              error={formErrors.therapistId}
              required
              options={[
                { value: "", label: "Select a therapist" },
                ...therapists.map((therapist) => ({
                  value: therapist.id,
                  label: `${therapist.first_name} ${therapist.last_name}`
                }))
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          title="Address Information"
          description="Client's residential address"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                placeholder="Street name and number"
              />
            </div>
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
            />
            <TextField
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
              placeholder="1234 AB"
            />
          </div>
        </FormSection>

        <FormSection
          title="Insurance & Medical Information"
          description="Insurance details and therapy preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Insurance Company"
              name="insuranceCompany"
              value={formData.insuranceCompany}
              onChange={(value) => setFormData(prev => ({ ...prev, insuranceCompany: value }))}
            />
            <TextField
              label="Insurance Number"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={(value) => setFormData(prev => ({ ...prev, insuranceNumber: value }))}
            />
            <SelectField
              label="Therapy Type"
              name="therapyType"
              value={formData.therapyType}
              onChange={(value) => setFormData(prev => ({ ...prev, therapyType: value }))}
              options={[
                { value: "individual", label: "Individual Therapy" },
                { value: "group", label: "Group Therapy" },
                { value: "family", label: "Family Therapy" },
                { value: "couples", label: "Couples Therapy" }
              ]}
            />
            <SelectField
              label="Urgency Level"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}
              options={[
                { value: "normal", label: "Normal" },
                { value: "urgent", label: "Urgent" },
                { value: "emergency", label: "Emergency" }
              ]}
            />
            <div className="md:col-span-2">
              <TextAreaField
                label="Reason for Therapy"
                name="reasonForTherapy"
                value={formData.reasonForTherapy}
                onChange={(value) => setFormData(prev => ({ ...prev, reasonForTherapy: value }))}
                rows={3}
                placeholder="Brief description of why the client is seeking therapy..."
              />
            </div>
            <TextField
              label="Referred By"
              name="referredBy"
              value={formData.referredBy}
              onChange={(value) => setFormData(prev => ({ ...prev, referredBy: value }))}
              placeholder="Doctor, school, self-referral, etc."
            />
          </div>
        </FormSection>

        <FormSection
          title="Emergency Contact"
          description="Contact person in case of emergency"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(value) => setFormData(prev => ({ ...prev, emergencyContactName: value }))}
            />
            <TextField
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(value) => setFormData(prev => ({ ...prev, emergencyContactPhone: value }))}
              placeholder="+31 6 12345678"
            />
          </div>
        </FormSection>

        <FormSection
          title="Additional Notes"
        >
          <TextAreaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            rows={4}
            placeholder="Any additional information about the client..."
          />
        </FormSection>

        {!isEdit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Information
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>The client will receive an email with login instructions and a temporary password</li>
                    <li>They will be required to change their password on first login</li>
                    <li>Make sure the email address is correct and accessible by the client</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <ActionButtons
          onCancel={() => {
            resetForm();
            setViewMode('list');
          }}
          onSubmit={handleSubmit}
          submitText={isEdit ? 'Update Client' : 'Add Client'}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  };

  // Render detail view
  const renderDetailView = () => {
    if (!selectedClient) return null;

    const therapist = therapists.find(t => t.id === selectedClient.assigned_therapist_id);

    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600">
                  {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedClient.first_name} {selectedClient.last_name}
                </h2>
                <StatusBadge status={selectedClient.status} type="client" />
              </div>
            </div>
            <button
              onClick={() => handleClientSelect(selectedClient, 'edit')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{selectedClient.email}</span>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-900">{selectedClient.address}</p>
                      {selectedClient.city && selectedClient.postal_code && (
                        <p className="text-gray-900">{selectedClient.city}, {selectedClient.postal_code}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Therapy Information</h3>
              <div className="space-y-3">
                {therapist && (
                  <div className="flex items-center space-x-3">
                    <UserPlusIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned Therapist</p>
                      <p className="text-gray-900">{therapist.first_name} {therapist.last_name}</p>
                    </div>
                  </div>
                )}
                {selectedClient.therapy_type && (
                  <div className="flex items-center space-x-3">
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Therapy Type</p>
                      <p className="text-gray-900 capitalize">{selectedClient.therapy_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
                {selectedClient.urgency_level && (
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Urgency Level</p>
                      <p className="text-gray-900 capitalize">{selectedClient.urgency_level}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(selectedClient.insurance_company || selectedClient.insurance_number) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Insurance Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedClient.insurance_company && (
                  <div>
                    <p className="text-sm text-gray-500">Insurance Company</p>
                    <p className="text-gray-900">{selectedClient.insurance_company}</p>
                  </div>
                )}
                {selectedClient.insurance_number && (
                  <div>
                    <p className="text-sm text-gray-500">Insurance Number</p>
                    <p className="text-gray-900">{selectedClient.insurance_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedClient.reason_for_therapy && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Reason for Therapy</h3>
              <p className="text-gray-900">{selectedClient.reason_for_therapy}</p>
            </div>
          )}

          {(selectedClient.emergency_contact_name || selectedClient.emergency_contact_phone) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedClient.emergency_contact_name && (
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900">{selectedClient.emergency_contact_name}</p>
                  </div>
                )}
                {selectedClient.emergency_contact_phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{selectedClient.emergency_contact_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedClient.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">Additional Notes</h3>
              <p className="text-gray-900">{selectedClient.notes}</p>
            </div>
          )}

          {selectedClient.created_at && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Registered on {formatDate(selectedClient.created_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get statistics
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    new: clients.filter(c => c.status === 'new').length,
    unassigned: clients.filter(c => !c.assigned_therapist_id).length
  };

  return (
    <InlineCrudLayout
      title="Client Management"
      subtitle={`${stats.total} total clients`}
      icon={UsersIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        if (mode === 'list' || mode === 'create' || mode === 'edit' || mode === 'detail') {
          handleViewModeChange(mode);
        }
      }}
      showCreateButton={viewMode === 'list'}
      createButtonText="Add Client"
      isLoading={isLoading}
      totalCount={stats.total}
      onBack={viewMode !== 'list' ? () => setViewMode('list') : undefined}
    >
      {viewMode === 'list' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">New</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.unassigned}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <div className="flex items-center space-x-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="new">New</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filters.therapist}
                  onChange={(e) => setFilters(prev => ({ ...prev, therapist: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Therapists</option>
                  <option value="">Unassigned</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name}
                    </option>
                  ))}
                </select>
              </div>
            }
          />

          {/* Client List */}
          {renderList()}
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && renderForm()}
      {viewMode === 'detail' && renderDetailView()}
    </InlineCrudLayout>
  );
};

export default ClientManagement;