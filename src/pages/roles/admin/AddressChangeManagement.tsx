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
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { adminApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { AddressChangeRequest } from '@/types/addressChange';

const AddressChangeManagement: React.FC = () => {
  const { t } = useTranslation();
  const { success, error, info } = useAlert();

  const [requests, setRequests] = useState<AddressChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AddressChangeRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
      error('Failed to load address change requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: AddressChangeRequest) => {
    if (!window.confirm('Are you sure you want to approve this address change?')) return;

    try {
      setIsProcessing(true);
      await adminApi.approveAddressChange(request.id);
      success('Address change approved successfully');
      loadRequests();
    } catch (err) {
      error('Failed to approve address change');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.length < 10) {
      error('Please provide a detailed reason for rejection (minimum 10 characters)');
      return;
    }

    try {
      setIsProcessing(true);
      if (selectedRequest) {
        await adminApi.rejectAddressChange(selectedRequest.id, rejectionReason);
        success('Address change rejected');
        setShowReviewModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        loadRequests();
      }
    } catch (err) {
      error('Failed to reject address change');
    } finally {
      setIsProcessing(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-priority-normal';
      case 'approved':
        return 'status-client-active';
      case 'rejected':
        return 'status-client-discontinued';
      default:
        return '';
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
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 animate-fadeInUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <HomeIcon className="w-8 h-8" />
              </div>
              Address Change Management
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Review and manage client address change requests
            </p>
          </div>
          <button
            onClick={loadRequests}
            className="btn-premium-ghost bg-white/10 border border-white/30 text-white hover:bg-white/20 flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by client name, email, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="select-premium"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">No address change requests</h3>
          <p className="text-body-sm text-gray-600">
            {filter === 'pending' ? 'No pending requests to review' : 'No requests found matching your criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="heading-section">{request.clientName}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-caption mb-1">From</p>
                        <div className="text-body-sm text-gray-700">
                          <p>{request.oldAddress.street} {request.oldAddress.houseNumber}</p>
                          <p>{request.oldAddress.postalCode} {request.oldAddress.city}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-caption mb-1">To</p>
                        <div className="text-body-sm text-gray-700">
                          <p>{request.newAddress.street} {request.newAddress.houseNumber}</p>
                          <p>{request.newAddress.postalCode} {request.newAddress.city}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-caption mb-1">Reason</p>
                      <p className="text-body-sm text-gray-700">{request.reason}</p>
                    </div>

                    <div className="flex items-center space-x-6 text-body-sm text-gray-500">
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
                        <p className="text-caption text-red-700 mb-1">Rejection Reason</p>
                        <p className="text-body-sm text-red-600">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={isProcessing}
                        className="btn-premium-success px-3 py-1.5 text-sm flex items-center space-x-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowReviewModal(true);
                        }}
                        disabled={isProcessing}
                        className="btn-premium-danger px-3 py-1.5 text-sm flex items-center space-x-1"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-lg w-full p-6 animate-scaleIn">
            <h3 className="heading-section mb-4">Reject Address Change</h3>
            
            <div className="mb-4">
              <p className="text-body-sm text-gray-600 mb-2">
                You are rejecting the address change request for:
              </p>
              <p className="font-medium text-gray-900">{selectedRequest.clientName}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="rejectionReason" className="label-premium label-premium-required">
                Reason for Rejection
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="input-premium"
                placeholder="Please provide a detailed reason for rejecting this address change request..."
              />
              <p className="form-help">Minimum 10 characters required</p>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="btn-premium-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.length < 10}
                className="btn-premium-danger flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-5 h-5" />
                    <span>Reject Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressChangeManagement;