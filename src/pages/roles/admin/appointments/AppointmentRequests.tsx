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
import { LOCATIONS, getLocationLabel } from '@/types/locations';
import { APPOINTMENT_TYPE_LABELS } from '@/types/appointments';

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
  therapy_type?: string;
  urgency_level: string;
  reason_for_therapy: string;
  hulpvragen?: string[]; // Selected help questions/concerns
  preferred_therapist_id?: string;
  preferred_location?: string;
  appointment_type?: 'intake' | 'individual' | 'relation' | 'group' | 'family' | 'crisis';
  duration_minutes?: number;
  smart_pairing_used?: boolean;
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
  therapistId: string;
  therapistName: string;
  score: number;
  reasons?: string[];
  availability?: boolean;
  factors?: {
    availability: number;
    hulpvragen: number;
    specialization: number;
    experience: number;
    successRate: number;
    distance: number;
    language: number;
    gender: number;
  };
  details?: {
    specializations: string[];
    hulpvragenExpertise: any[];
    availableSlots: any[];
    languages: string[];
    yearsExperience: number;
    totalClients: number;
    successRate: number;
  };
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
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterAppointmentType, setFilterAppointmentType] = useState('all');
  const [smartRecommendations, setSmartRecommendations] = useState<SmartPairingRecommendation[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showSmartPairing, setShowSmartPairing] = useState(false);
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(false);
  const [isTogglingAutoMatch, setIsTogglingAutoMatch] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('[AppointmentRequests] ===== LOADING DATA =====');
      console.log('[AppointmentRequests] Calling APIs: /admin/appointment-requests and /admin/therapists');

      const [requestsResponse, therapistsResponse] = await Promise.all([
        realApiService.admin.getAppointmentRequests(),
        realApiService.admin.getTherapists()
      ]);

      console.log('[AppointmentRequests] Requests response:', requestsResponse);
      console.log('[AppointmentRequests] Therapists response:', therapistsResponse);

      if (requestsResponse.success && requestsResponse.data) {
        const requestsData = (requestsResponse.data as any).requests || [];
        console.log('[AppointmentRequests] Loaded', requestsData.length, 'appointment requests');
        console.log('[AppointmentRequests] First request (if any):', requestsData[0]);
        setRequests(requestsData);
      } else {
        console.error('[AppointmentRequests] ✗ Invalid requests response structure');
      }

      if (therapistsResponse.success && therapistsResponse.data) {
        const therapistsData = Array.isArray(therapistsResponse.data)
          ? therapistsResponse.data
          : therapistsResponse.data.therapists || [];
        console.log('[AppointmentRequests] Loaded', therapistsData.length, 'therapists');
        setTherapists(therapistsData);
      } else {
        console.error('[AppointmentRequests] ✗ Invalid therapists response structure');
      }

      console.log('[AppointmentRequests] ✓ Data loading complete');
    } catch (error) {
      console.error('[AppointmentRequests] ✗ Failed to load data:', error);
      console.error('[AppointmentRequests] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      errorAlert(handleApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAutoMatchStatus();

    // Reload auto-match status when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAutoMatchStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load auto-match status
  const loadAutoMatchStatus = async () => {
    try {
      console.log('[AppointmentRequests] Loading auto-match status...');
      const response = await realApiService.admin.getAutoMatchingStatus();
      console.log('[AppointmentRequests] Auto-match status response:', response);

      if (response.success && response.data) {
        setAutoMatchEnabled(response.data.autoMatchingEnabled);
        console.log('[AppointmentRequests] Auto-match enabled:', response.data.autoMatchingEnabled);
      }
    } catch (error) {
      console.error('[AppointmentRequests] Failed to load auto-match status:', error);
      // Don't show error to user - just default to false
    }
  };

  // Handle auto-match toggle
  const handleToggleAutoMatch = async () => {
    console.log('[AppointmentRequests] ===== TOGGLING AUTO-MATCH =====');
    console.log('[AppointmentRequests] Current state:', autoMatchEnabled);

    try {
      setIsTogglingAutoMatch(true);
      const newState = !autoMatchEnabled;
      console.log('[AppointmentRequests] New state:', newState);

      // Persist to backend
      console.log('[AppointmentRequests] Calling toggleAutoMatching API...');
      const toggleResponse = await realApiService.admin.toggleAutoMatching(newState);
      console.log('[AppointmentRequests] Toggle response:', toggleResponse);

      if (!toggleResponse.success) {
        throw new Error('Failed to toggle auto-matching setting');
      }

      setAutoMatchEnabled(newState);

      if (newState) {
        // Show processing notification
        info('Processing pending appointment requests...', {
          title: 'Auto-Matching Active',
          duration: 3000
        });

        // Trigger immediate auto-matching for existing pending requests
        console.log('[AppointmentRequests] Calling processAutoAssignments API...');
        const processResponse = await realApiService.admin.processAutoAssignments();
        console.log('[AppointmentRequests] Process response:', processResponse);

        if (processResponse.success && processResponse.data) {
          const { processed, assigned, assignments } = processResponse.data;
          console.log('[AppointmentRequests] Processed:', processed, 'Assigned:', assigned);

          if (assigned > 0) {
            success(
              `Successfully matched ${assigned} of ${processed} pending requests`,
              {
                title: 'Auto-Matching Complete',
                duration: 5000
              }
            );

            // Show details of assignments
            if (assignments && assignments.length > 0) {
              console.log('[AppointmentRequests] Assignment details:', assignments);
            }

            // Reload appointment requests to reflect changes
            await loadData();
          } else {
            info(
              processed > 0
                ? `Reviewed ${processed} requests but no suitable matches found with available therapists`
                : 'No pending requests available to process',
              {
                title: 'Auto-Matching Complete',
                duration: 4000
              }
            );
          }
        }
      } else {
        success('Auto-matching disabled. New requests will require manual assignment.', {
          duration: 3000
        });
      }

      console.log('[AppointmentRequests] ✓ Auto-match toggle complete');
    } catch (error) {
      console.error('[AppointmentRequests] ✗ Toggle auto-match error:', error);
      errorAlert('Failed to toggle auto-matching setting');
      // Revert state on error
      setAutoMatchEnabled(!autoMatchEnabled);
    } finally {
      setIsTogglingAutoMatch(false);
    }
  };

  // Load smart pairing recommendations
  const loadSmartRecommendations = async (request: AppointmentRequest) => {
    console.log('[AppointmentRequests] ===== LOADING SMART PAIRING =====');
    console.log('[AppointmentRequests] Request ID:', request.id);
    console.log('[AppointmentRequests] Client ID:', request.client_id);
    console.log('[AppointmentRequests] Preferred date/time:', request.preferred_date, request.preferred_time);

    try {
      // Format date as YYYY-MM-DD (remove time portion if present)
      const formattedDate = request.preferred_date.split('T')[0];

      // Format time as HH:MM (remove seconds if present)
      const formattedTime = request.preferred_time?.substring(0, 5);

      const params = {
        clientId: request.client_id,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime
      };
      console.log('[AppointmentRequests] API params:', params);
      console.log('[AppointmentRequests] Calling API: /admin/smart-pairing');

      const response = await realApiService.admin.getSmartPairingRecommendations(params);

      console.log('[AppointmentRequests] Smart pairing response:', response);

      if (response.success && response.data) {
        const recommendations = response.data.recommendations || [];
        console.log('[AppointmentRequests] Received', recommendations.length, 'recommendations');
        console.log('[AppointmentRequests] Recommendations:', recommendations);
        setSmartRecommendations(recommendations);
        setShowSmartPairing(true);

        // SUCCESS NOTIFICATION: Smart pairing analysis completed
        if (recommendations.length > 0) {
          console.log('[AppointmentRequests] ✓ Best match:', recommendations[0]?.therapistName, 'with score', recommendations[0]?.score);
          info(`Best match: ${recommendations[0]?.therapistName} (${Math.round((recommendations[0]?.score || 0) * 100)}% compatibility)`, {
            title: `Found ${recommendations.length} Therapist Matches`,
            duration: 5000
          });
        } else {
          console.log('[AppointmentRequests] ⚠ No optimal matches found');
          warning('Consider manual assignment or adjusting criteria', {
            title: 'No Optimal Matches Found',
            duration: 4000
          });
        }
      } else {
        console.error('[AppointmentRequests] ✗ Invalid smart pairing response');
      }
    } catch (error) {
      console.error('[AppointmentRequests] ✗ Failed to load smart recommendations:', error);
      console.error('[AppointmentRequests] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      warning('Unable to load smart pairing recommendations');
    }
  };

  // Handle assignment
  const handleAssignment = async () => {
    console.log('[AppointmentRequests] ===== ASSIGNING THERAPIST =====');
    console.log('[AppointmentRequests] Request:', selectedRequest);
    console.log('[AppointmentRequests] Selected therapist ID:', selectedTherapist);
    console.log('[AppointmentRequests] Assignment notes:', assignmentNotes);

    if (!selectedRequest || !selectedTherapist) {
      console.log('[AppointmentRequests] ✗ Missing request or therapist');
      warning('Please select a therapist');
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData = {
        therapistId: selectedTherapist
      };
      console.log('[AppointmentRequests] Assignment data:', assignmentData);
      console.log('[AppointmentRequests] Calling API: /admin/appointment-requests/:id/assign');

      const response = await realApiService.admin.assignAppointmentRequest(selectedRequest.id, assignmentData);

      console.log('[AppointmentRequests] Assignment response:', response);

      if (response.success) {
        console.log('[AppointmentRequests] ✓ Therapist assigned successfully');
        success('Therapist assigned successfully! Both the client and therapist have been notified.');
        await loadData();
        resetAssignment();
      } else {
        console.error('[AppointmentRequests] ✗ Assignment failed - invalid response');
      }
    } catch (error) {
      console.error('[AppointmentRequests] ✗ Assignment error:', error);
      console.error('[AppointmentRequests] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
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
    const matchesLocation = filterLocation === 'all' || request.preferred_location === filterLocation;
    const matchesAppointmentType = filterAppointmentType === 'all' || request.appointment_type === filterAppointmentType;

    return matchesSearch && matchesUrgency && matchesLocation && matchesAppointmentType && request.status === 'pending';
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
                      {request.urgency_level && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency_level)}`}>
                          {request.urgency_level.toUpperCase()}
                        </span>
                      )}
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
                    {/* Hulpvragen Display */}
                    {request.hulpvragen && request.hulpvragen.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Selected Concerns:</span>
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {request.hulpvragen.map((hulpvraag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {hulpvraag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    {/* Appointment Details Badges */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* Location Badge */}
                      {request.preferred_location && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          {getLocationLabel(request.preferred_location, 'nl')}
                        </span>
                      )}

                      {/* Appointment Type Badge */}
                      {request.appointment_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                          {APPOINTMENT_TYPE_LABELS[request.appointment_type as keyof typeof APPOINTMENT_TYPE_LABELS]?.nl || request.appointment_type}
                        </span>
                      )}

                      {/* Duration Badge */}
                      {request.duration_minutes && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {request.duration_minutes} min
                        </span>
                      )}

                      {/* Therapy Type Badge */}
                      {request.therapy_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200">
                          {request.therapy_type.replace('_', ' ')}
                        </span>
                      )}

                      {/* Auto-Match Badge */}
                      {request.smart_pairing_used && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Auto-Matched
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
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
              <p className="text-sm text-blue-700">Appointment Type</p>
              <p className="font-medium text-blue-900">
                {selectedRequest.appointment_type
                  ? APPOINTMENT_TYPE_LABELS[selectedRequest.appointment_type as keyof typeof APPOINTMENT_TYPE_LABELS]?.nl || selectedRequest.appointment_type
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Duration</p>
              <p className="font-medium text-blue-900">
                {selectedRequest.duration_minutes ? `${selectedRequest.duration_minutes} minutes` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Location</p>
              <p className="font-medium text-blue-900">
                {selectedRequest.preferred_location ? getLocationLabel(selectedRequest.preferred_location, 'nl') : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Therapy Type/Method</p>
              <p className="font-medium text-blue-900 capitalize">{selectedRequest.therapy_type?.replace('_', ' ') || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-blue-700">Reason for Therapy</p>
              <p className="font-medium text-blue-900">{selectedRequest.reason_for_therapy}</p>
            </div>
            {/* Hulpvragen Display in Detail View */}
            {selectedRequest.hulpvragen && selectedRequest.hulpvragen.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-blue-700">Selected Concerns (Hulpvragen)</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedRequest.hulpvragen.map((hulpvraag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-900"
                    >
                      {hulpvraag}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  key={rec.therapistId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTherapist === rec.therapistId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTherapist(rec.therapistId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{rec.therapistName}</h4>
                        <div className="flex items-center space-x-1">
                          <SparklesIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">{Math.round(rec.score * 100)}% match</span>
                        </div>
                        {rec.availability && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      {rec.reasons && rec.reasons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Matching factors:</p>
                          <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Detailed Matching Scores */}
                      {rec.factors && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {rec.factors.hulpvragen > 0 && (
                            <div className="flex justify-between">
                              <span>Hulpvragen Match:</span>
                              <span className="font-medium text-blue-600">{Math.round(rec.factors.hulpvragen * 100)}%</span>
                            </div>
                          )}
                          {rec.factors.specialization > 0 && (
                            <div className="flex justify-between">
                              <span>Specialization:</span>
                              <span className="font-medium text-green-600">{Math.round(rec.factors.specialization * 100)}%</span>
                            </div>
                          )}
                          {rec.factors.availability > 0 && (
                            <div className="flex justify-between">
                              <span>Availability:</span>
                              <span className="font-medium text-purple-600">{Math.round(rec.factors.availability * 100)}%</span>
                            </div>
                          )}
                          {rec.factors.language > 0 && (
                            <div className="flex justify-between">
                              <span>Language:</span>
                              <span className="font-medium text-orange-600">{Math.round(rec.factors.language * 100)}%</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hulpvragen Expertise Details */}
                      {rec.details?.hulpvragenExpertise && rec.details.hulpvragenExpertise.length > 0 && selectedRequest?.hulpvragen && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">Hulpvragen Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedRequest.hulpvragen.map((clientHulpvraag) => {
                              const expertise = rec.details!.hulpvragenExpertise.find(
                                (exp: any) => exp.problem_category === clientHulpvraag
                              );
                              return (
                                <span
                                  key={clientHulpvraag}
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    expertise
                                      ? expertise.expertise_level >= 4
                                        ? 'bg-green-100 text-green-800'
                                        : expertise.expertise_level >= 3
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {clientHulpvraag}
                                  {expertise && ` (${expertise.expertise_level}/5)`}
                                  {!expertise && ' (No expertise)'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {selectedTherapist === rec.therapistId && (
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

          {/* Auto-Match Toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Auto-Match Mode</h3>
                    <p className="text-xs text-gray-500">
                      Automatically match pending requests to therapists using smart recommendations
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleAutoMatch}
                disabled={isTogglingAutoMatch}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                  isTogglingAutoMatch ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                } ${autoMatchEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoMatchEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {autoMatchEnabled && (
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  <strong>Auto-match is active:</strong> New appointment requests will be automatically matched to the best available therapist based on smart recommendations.
                </p>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <div className="flex gap-2 flex-wrap">
                {/* Urgency Filter */}
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

                {/* Location Filter */}
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{getLocationLabel(loc, 'nl')}</option>
                  ))}
                </select>

                {/* Appointment Type Filter */}
                <select
                  value={filterAppointmentType}
                  onChange={(e) => setFilterAppointmentType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="intake">Intake</option>
                  <option value="individual">Individual</option>
                  <option value="relation">Relation</option>
                  <option value="group">Group</option>
                  <option value="family">Family</option>
                  <option value="crisis">Crisis</option>
                </select>
              </div>
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