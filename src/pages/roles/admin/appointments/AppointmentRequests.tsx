import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserPlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons, EmptyState, ViewMode } from '@/components/crud/InlineCrudLayout';
import { SelectField, TextAreaField } from '@/components/forms/FormFields';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StatusBadge, PremiumButton } from '@/components/layout/PremiumLayout';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface AppointmentRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  preferred_date: string;
  preferred_time: string;
  alternative_date?: string;
  alternative_time?: string;
  therapy_type: string;
  urgency_level: string;
  reason_for_therapy: string;
  preferred_therapist_id?: string;
  status: string;
  created_at: string;
}

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specializations?: string[];
  availability?: boolean;
}

interface SmartPairingRecommendation {
  therapist_id: string;
  therapist_name: string;
  match_score: number;
  reasons: string[];
  availability: boolean;
}

// ViewMode is imported from InlineCrudLayout above

const AppointmentRequests: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert, warning, info } = useAlert();

  // State
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [smartRecommendations, setSmartRecommendations] = useState<SmartPairingRecommendation[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showSmartPairing, setShowSmartPairing] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [requestsResponse, therapistsResponse] = await Promise.all([
        realApiService.admin.getAppointmentRequests(),
        realApiService.admin.getTherapists()
      ]);

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data.requests || []);
      }

      if (therapistsResponse.success && therapistsResponse.data) {
        const therapistsData = Array.isArray(therapistsResponse.data) 
          ? therapistsResponse.data 
          : therapistsResponse.data.therapists || [];
        setTherapists(therapistsData);
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

  // Load smart pairing recommendations
  const loadSmartRecommendations = async (request: AppointmentRequest) => {
    try {
      const response = await realApiService.admin.getSmartPairingRecommendations({
        clientId: request.client_id,
        appointmentDate: request.preferred_date,
        appointmentTime: request.preferred_time,
        therapyType: request.therapy_type,
        urgencyLevel: request.urgency_level
      });

      if (response.success && response.data) {
        setSmartRecommendations(response.data.recommendations || []);
        setShowSmartPairing(true);
      }
    } catch (error) {
      console.error('Failed to load smart recommendations:', error);
      warning('Unable to load smart pairing recommendations');
    }
  };

  // Handle assignment
  const handleAssignment = async () => {
    if (!selectedRequest || !selectedTherapist) {
      warning('Please select a therapist');
      return;
    }

    setIsAssigning(true);
    try {
      const response = await realApiService.admin.assignTherapist({
        clientId: selectedRequest.client_id,
        therapistId: selectedTherapist,
        appointmentRequestId: selectedRequest.id,
        notes: assignmentNotes
      });

      if (response.success) {
        success('Therapist assigned successfully! Both the client and therapist have been notified.');
        await loadData();
        resetAssignment();
      }
    } catch (error) {
      errorAlert(handleApiError(error).message);
    } finally {
      setIsAssigning(false);
    }
  };

  // Reset assignment form
  const resetAssignment = () => {
    setSelectedRequest(null);
    setSelectedTherapist('');
    setAssignmentNotes('');
    setSmartRecommendations([]);
    setShowSmartPairing(false);
    setViewMode('list');
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason_for_therapy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = filterUrgency === 'all' || request.urgency_level === filterUrgency;
    
    return matchesSearch && matchesUrgency && request.status === 'pending';
  });

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Render list view
  const renderList = () => {
    if (filteredRequests.length === 0) {
      return (
        <EmptyState
          icon={CalendarIcon}
          title="No pending appointment requests"
          description="All appointment requests have been processed or there are no new requests"
          actionLabel="Refresh"
          onAction={loadData}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request) => (
          <ListItemCard key={request.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">{request.client_name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency_level)}`}>
                        {request.urgency_level.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{request.client_email}</span>
                      </div>
                      {request.client_phone && (
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{request.client_phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {request.reason_for_therapy}
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Preferred Date & Time</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(request.preferred_date)} at {formatTime(request.preferred_time)}
                        </p>
                      </div>
                      {request.alternative_date && (
                        <div>
                          <p className="text-sm text-gray-500">Alternative Date & Time</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(request.alternative_date)} at {formatTime(request.alternative_time || request.preferred_time)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Therapy Type:</span> {request.therapy_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        Requested {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <PremiumButton
                  variant="primary"
                  size="sm"
                  icon={UserPlusIcon}
                  onClick={() => {
                    setSelectedRequest(request);
                    setViewMode('detail');
                    loadSmartRecommendations(request);
                  }}
                >
                  Assign Therapist
                </PremiumButton>
              </div>
            </div>
          </ListItemCard>
        ))}
      </div>
    );
  };

  // Render assignment view
  const renderAssignment = () => {
    if (!selectedRequest) return null;

    return (
      <div className="space-y-6">
        {/* Request Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Appointment Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Client</p>
              <p className="font-medium text-blue-900">{selectedRequest.client_name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Contact</p>
              <p className="font-medium text-blue-900">{selectedRequest.client_email}</p>
              {selectedRequest.client_phone && (
                <p className="font-medium text-blue-900">{selectedRequest.client_phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-blue-700">Preferred Date & Time</p>
              <p className="font-medium text-blue-900">
                {formatDate(selectedRequest.preferred_date)} at {formatTime(selectedRequest.preferred_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Therapy Type</p>
              <p className="font-medium text-blue-900 capitalize">{selectedRequest.therapy_type.replace('_', ' ')}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-blue-700">Reason for Therapy</p>
              <p className="font-medium text-blue-900">{selectedRequest.reason_for_therapy}</p>
            </div>
          </div>
        </div>

        {/* Smart Pairing Recommendations */}
        {showSmartPairing && smartRecommendations.length > 0 && (
          <FormSection
            title="Smart Pairing Recommendations"
            description="AI-powered therapist recommendations based on availability, specializations, and client needs"
          >
            <div className="space-y-3">
              {smartRecommendations.map((rec) => (
                <div
                  key={rec.therapist_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTherapist === rec.therapist_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTherapist(rec.therapist_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{rec.therapist_name}</h4>
                        <div className="flex items-center space-x-1">
                          <SparklesIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">{rec.match_score}% match</span>
                        </div>
                        {rec.availability && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Matching factors:</p>
                        <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                          {rec.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="ml-4">
                      {selectedTherapist === rec.therapist_id && (
                        <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        )}

        {/* Manual Therapist Selection */}
        <FormSection
          title="Select Therapist"
          description="Choose a therapist to assign to this client"
        >
          <SelectField
            label="Therapist"
            name="therapist"
            value={selectedTherapist}
            onChange={(value) => setSelectedTherapist(value)}
            required
            options={[
              { value: '', label: 'Select a therapist' },
              ...therapists.map(therapist => ({
                value: therapist.id,
                label: `${therapist.first_name} ${therapist.last_name}${
                  therapist.specializations?.length 
                    ? ` - ${therapist.specializations.join(', ')}` 
                    : ''
                }`
              }))
            ]}
          />
          
          <div className="mt-4">
            <TextAreaField
              label="Assignment Notes (Optional)"
              name="notes"
              value={assignmentNotes}
              onChange={(value) => setAssignmentNotes(value)}
              rows={3}
              placeholder="Any special instructions or notes for the therapist..."
            />
          </div>
        </FormSection>

        {/* Action Buttons */}
        <ActionButtons
          onCancel={resetAssignment}
          onSubmit={handleAssignment}
          submitText="Assign Therapist"
          isSubmitting={isAssigning}
        />
      </div>
    );
  };

  // Get statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    emergency: requests.filter(r => r.urgency_level === 'emergency' && r.status === 'pending').length,
    urgent: requests.filter(r => r.urgency_level === 'urgent' && r.status === 'pending').length
  };

  return (
    <InlineCrudLayout
      title="Appointment Requests"
      subtitle={`${stats.pending} pending requests`}
      icon={CalendarIcon}
      viewMode={viewMode}
      onViewModeChange={(mode) => setViewMode(mode as 'list' | 'detail')}
      showCreateButton={false}
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
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Emergency</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.emergency}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.urgent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Urgency Levels</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            }
          />

          {/* Request List */}
          {renderList()}
        </>
      )}

      {viewMode === 'detail' && renderAssignment()}
    </InlineCrudLayout>
  );
};

export default AppointmentRequests;