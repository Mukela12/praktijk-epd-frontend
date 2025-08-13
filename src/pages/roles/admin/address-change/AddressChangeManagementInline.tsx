import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { adminApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import type { AddressChangeRequest } from '@/types/addressChange';

const AddressChangeManagementInline: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: errorAlert, info } = useAlert();

  const [requests, setRequests] = useState<AddressChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await adminApi.getAddressChangeRequests(params);
      
      if (response.success && response.data) {
        setRequests(response.data.requests || []);
      }
    } catch (err) {
      errorAlert('Failed to load address change requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: AddressChangeRequest) => {
    if (!window.confirm('Are you sure you want to approve this address change?')) return;

    try {
      setProcessingIds([...processingIds, request.id]);
      await adminApi.approveAddressChange(request.id);
      success('Address change approved successfully');
      loadRequests();
    } catch (err) {
      errorAlert('Failed to approve address change');
    } finally {
      setProcessingIds(processingIds.filter(id => id !== request.id));
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = rejectionReasons[requestId];
    if (!reason || reason.length < 10) {
      errorAlert('Please provide a detailed reason for rejection (minimum 10 characters)');
      return;
    }

    try {
      setProcessingIds([...processingIds, requestId]);
      await adminApi.rejectAddressChange(requestId, reason);
      success('Address change rejected');
      setRejectionReasons({ ...rejectionReasons, [requestId]: '' });
      setExpandedRequest(null);
      loadRequests();
    } catch (err) {
      errorAlert('Failed to reject address change');
    } finally {
      setProcessingIds(processingIds.filter(id => id !== requestId));
    }
  };

  const toggleExpanded = (requestId: string) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(requestId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-amber-600" />;
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.clientName.toLowerCase().includes(searchLower) ||
        request.clientEmail.toLowerCase().includes(searchLower) ||
        request.newAddress.city.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <HomeIcon className="w-8 h-8 mr-3" />
              Address Change Management
            </h1>
            <p className="text-purple-100 mt-1">
              Review and manage client address change requests
            </p>
          </div>
          <PremiumButton
            onClick={loadRequests}
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
            icon={ArrowPathIcon}
          >
            Refresh
          </PremiumButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </PremiumCard>
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-amber-600" />
          </div>
        </PremiumCard>
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </PremiumCard>
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
        </PremiumCard>
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <PremiumEmptyState
          icon={HomeIcon}
          title="No address change requests"
          description={filter === 'pending' ? 'No pending requests to review' : 'No requests found matching your criteria'}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const isExpanded = expandedRequest === request.id;
            const isProcessing = processingIds.includes(request.id);
            
            return (
              <PremiumCard key={request.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.clientName}</h3>
                        <StatusBadge
                          type="general"
                          status={request.status}
                          size="sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">From</p>
                          <div className="text-sm text-gray-600">
                            <p>{request.oldAddress.street} {request.oldAddress.houseNumber}</p>
                            <p>{request.oldAddress.postalCode} {request.oldAddress.city}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">To</p>
                          <div className="text-sm text-gray-600">
                            <p>{request.newAddress.street} {request.newAddress.houseNumber}</p>
                            <p>{request.newAddress.postalCode} {request.newAddress.city}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          {request.clientEmail}
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                          <p className="text-sm text-red-600">{request.rejectionReason}</p>
                        </div>
                      )}

                      {/* Inline Rejection Form */}
                      {request.status === 'pending' && isExpanded && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fadeIn">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reject Address Change</h4>
                          <textarea
                            value={rejectionReasons[request.id] || ''}
                            onChange={(e) => setRejectionReasons({
                              ...rejectionReasons,
                              [request.id]: e.target.value
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Please provide a detailed reason for rejecting this address change request..."
                            disabled={isProcessing}
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                          
                          <div className="flex items-center justify-end space-x-3 mt-3">
                            <PremiumButton
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setExpandedRequest(null);
                                setRejectionReasons({ ...rejectionReasons, [request.id]: '' });
                              }}
                              disabled={isProcessing}
                            >
                              Cancel
                            </PremiumButton>
                            <PremiumButton
                              size="sm"
                              variant="danger"
                              icon={XCircleIcon}
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing || (rejectionReasons[request.id] || '').length < 10}
                            >
                              Confirm Rejection
                            </PremiumButton>
                          </div>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <PremiumButton
                          size="sm"
                          variant="success"
                          icon={CheckCircleIcon}
                          onClick={() => handleApprove(request)}
                          disabled={isProcessing}
                        >
                          Approve
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          variant="danger"
                          icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                          onClick={() => toggleExpanded(request.id)}
                          disabled={isProcessing}
                        >
                          {isExpanded ? 'Cancel' : 'Reject'}
                        </PremiumButton>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressChangeManagementInline;