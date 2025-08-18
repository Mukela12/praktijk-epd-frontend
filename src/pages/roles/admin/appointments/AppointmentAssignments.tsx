import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserIcon,
  BellIcon,
  ChevronRightIcon,
  MapPinIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatTime } from '@/utils/dateFormatters';

interface AppointmentRequest {
  id: string;
  clientId: string;
  clientName: string;
  preferredDate: string;
  preferredTime: string;
  problemDescription: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'assigned' | 'cancelled';
  createdAt: string;
  preferredTherapistId?: string;
}

interface TherapistRecommendation {
  therapistId: string;
  therapistName: string;
  matchScore: number;
  matchReasons: string[];
  availability: boolean;
  specializations: string[];
  activeClients: number;
  rating?: number;
}

const AppointmentAssignments: React.FC = () => {
  const { success, error, info } = useAlert();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [recommendations, setRecommendations] = useState<TherapistRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showSmartPairing, setShowSmartPairing] = useState(false);

  useEffect(() => {
    loadUnassignedRequests();
  }, []);

  const loadUnassignedRequests = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getAppointmentRequests();
      if (response.success && response.data) {
        const unassignedRequests = response.data.requests?.filter((r: any) => r.status === 'pending' && !r.preferredTherapistId) || [];
        setRequests(unassignedRequests);
      }
    } catch (err) {
      error('Failed to load appointment requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartPairing = async (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setShowSmartPairing(true);
    
    try {
      const response = await realApiService.admin.getSmartPairingRecommendations({
        clientId: request.clientId,
        appointmentDate: request.preferredDate,
        appointmentTime: request.preferredTime,
        urgencyLevel: request.urgency
      });
      
      if (response.success && response.data) {
        setRecommendations(response.data.recommendations);
      }
    } catch (err) {
      error('Failed to get therapist recommendations');
      setRecommendations([]);
    }
  };

  const handleAssignTherapist = async (therapistId: string) => {
    if (!selectedRequest) return;
    
    setIsAssigning(true);
    try {
      const response = await realApiService.admin.assignTherapistToAppointment(selectedRequest.id, {
        therapistId
      });
      
      if (response.success) {
        success('Therapist assigned successfully! Both parties have been notified.');
        setShowSmartPairing(false);
        setSelectedRequest(null);
        loadUnassignedRequests();
      }
    } catch (err) {
      error('Failed to assign therapist');
    } finally {
      setIsAssigning(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      default: return 'info';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appointment Assignments</h1>
            <p className="text-blue-100">
              Review appointment requests and assign therapists using smart pairing
            </p>
          </div>
          <UserGroupIcon className="w-16 h-16 text-blue-200" />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Pending Requests</p>
            <p className="text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Urgent Cases</p>
            <p className="text-2xl font-bold">
              {requests.filter(r => r.urgency !== 'normal').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Average Wait Time</p>
            <p className="text-2xl font-bold">2.5 hrs</p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {requests.length === 0 ? (
        <PremiumEmptyState
          icon={CheckCircleIcon}
          title="All Caught Up!"
          description="There are no pending appointment requests. All clients have been assigned therapists."
        />
      ) : (
        <PremiumCard>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Appointment Requests
          </h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.clientName}
                      </h3>
                      <StatusBadge 
                        status={request.urgency.toUpperCase()} 
                        type={getUrgencyColor(request.urgency)}
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(request.preferredDate)} at {formatTime(request.preferredTime)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Requested {formatDate(request.createdAt)}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {request.problemDescription}
                    </p>
                  </div>
                  <PremiumButton
                    variant="primary"
                    size="sm"
                    icon={SparklesIcon}
                    onClick={() => handleSmartPairing(request)}
                    className="ml-4"
                  >
                    Smart Pairing
                  </PremiumButton>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Smart Pairing Modal */}
      {showSmartPairing && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-2xl font-bold mb-2">Smart Therapist Pairing</h2>
              <p className="text-blue-100">
                AI-powered recommendations based on specialization, availability, and client needs
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Client Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedRequest.clientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Preferred Time:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(selectedRequest.preferredDate)} at {formatTime(selectedRequest.preferredTime)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Issue:</span>
                    <p className="mt-1 text-gray-700">{selectedRequest.problemDescription}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <h3 className="font-semibold text-gray-900 mb-4">Recommended Therapists</h3>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No available therapists found for the requested time slot.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.therapistId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {rec.therapistName}
                            </h4>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(rec.matchScore)}`}>
                              {rec.matchScore}% Match
                            </div>
                            {rec.rating && (
                              <div className="flex items-center text-sm text-gray-600">
                                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                {rec.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <AcademicCapIcon className="w-4 h-4 mr-2" />
                              Specializations: {rec.specializations.join(', ')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <UserIcon className="w-4 h-4 mr-2" />
                              Active Clients: {rec.activeClients}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                              Available at requested time
                            </div>
                          </div>
                          
                          {rec.matchReasons.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Match Reasons:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {rec.matchReasons.map((reason, idx) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleAssignTherapist(rec.therapistId)}
                          loading={isAssigning}
                          className="ml-4"
                        >
                          Assign
                        </PremiumButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <BellIcon className="w-4 h-4 mr-2" />
                  Both the client and therapist will receive notifications upon assignment
                </div>
                <PremiumButton
                  variant="outline"
                  onClick={() => {
                    setShowSmartPairing(false);
                    setSelectedRequest(null);
                    setRecommendations([]);
                  }}
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentAssignments;