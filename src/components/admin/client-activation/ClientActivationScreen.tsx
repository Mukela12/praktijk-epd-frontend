import React, { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useRealApi } from '@/hooks/useRealApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ClientActivationScreenProps {
  onBack: () => void;
}

interface UnverifiedClient {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  user_status: string;
  client_status: string;
}

interface BulkActivationOptions {
  batchSize: number;
  delayBetweenBatches: number;
  regeneratePasswords: boolean;
}

const ClientActivationScreen: React.FC<ClientActivationScreenProps> = ({ onBack }) => {
  const { getUnverifiedClients, sendBulkActivationEmails, getActivationStats } = useRealApi();
  
  const [unverifiedClients, setUnverifiedClients] = useState<UnverifiedClient[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [activationStats, setActivationStats] = useState<any>(null);
  const [bulkOptions, setBulkOptions] = useState<BulkActivationOptions>({
    batchSize: 10,
    delayBetweenBatches: 2000,
    regeneratePasswords: false
  });
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    isActive: boolean;
  }>({ current: 0, total: 0, isActive: false });
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalClients: number;
    clientsPerPage: number;
  }>({ 
    currentPage: 1, 
    totalPages: 1, 
    totalClients: 0, 
    clientsPerPage: 50 
  });

  // Load unverified clients and stats
  const loadData = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * pagination.clientsPerPage;
      
      const [clientsResponse, statsResponse] = await Promise.all([
        getUnverifiedClients({ 
          limit: pagination.clientsPerPage, 
          offset: offset 
        }),
        getActivationStats()
      ]);
      
      if (clientsResponse) {
        setUnverifiedClients(clientsResponse.clients || []);
        
        // Clear selections when loading new page
        if (page !== pagination.currentPage) {
          setSelectedClients([]);
        }
        
        // Update pagination info
        if (clientsResponse.pagination) {
          const totalPages = Math.ceil(clientsResponse.pagination.total / pagination.clientsPerPage);
          setPagination(prev => ({
            ...prev,
            currentPage: page,
            totalPages: totalPages,
            totalClients: clientsResponse.pagination.total
          }));
        }
      }
      
      if (statsResponse) {
        setActivationStats(statsResponse);
      }
    } catch (error) {
      console.error('Failed to load activation data:', error);
      toast.error('Failed to load client activation data');
    } finally {
      setIsLoading(false);
    }
  }, [getUnverifiedClients, getActivationStats, pagination.clientsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      loadData(pagination.currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      loadData(pagination.currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadData(page);
    }
  };

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === unverifiedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(unverifiedClients.map(client => client.id));
    }
  };

  // Handle bulk activation
  const handleBulkActivation = async () => {
    if (selectedClients.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    if (!window.confirm(`Send activation emails to ${selectedClients.length} clients?`)) {
      return;
    }

    try {
      setIsSendingEmails(true);
      setProgress({ current: 0, total: selectedClients.length, isActive: true });

      await sendBulkActivationEmails(selectedClients, bulkOptions);
      
      toast.success(`Activation emails sent to ${selectedClients.length} clients`);
      setSelectedClients([]);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to send bulk activation emails:', error);
      toast.error('Failed to send bulk activation emails');
    } finally {
      setIsSendingEmails(false);
      setProgress({ current: 0, total: 0, isActive: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Activation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send activation emails to clients with unverified email addresses
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Client List
        </button>
      </div>

      {/* Statistics */}
      {activationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{activationStats.totalClients || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-2xl font-semibold text-gray-900">{unverifiedClients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-semibold text-gray-900">{activationStats.verifiedClients || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-semibold text-gray-900">{activationStats.emailsSent || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <CogIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Activation Options</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size
            </label>
            <select
              value={bulkOptions.batchSize}
              onChange={(e) => setBulkOptions(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 clients per batch</option>
              <option value={10}>10 clients per batch</option>
              <option value={20}>20 clients per batch</option>
              <option value={50}>50 clients per batch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay Between Batches
            </label>
            <select
              value={bulkOptions.delayBetweenBatches}
              onChange={(e) => setBulkOptions(prev => ({ ...prev, delayBetweenBatches: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="regeneratePasswords"
              checked={bulkOptions.regeneratePasswords}
              onChange={(e) => setBulkOptions(prev => ({ ...prev, regeneratePasswords: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="regeneratePasswords" className="ml-2 text-sm text-gray-700">
              Regenerate passwords
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Unverified Clients ({pagination.totalClients})
            </h3>
            <p className="text-sm text-gray-500">
              {selectedClients.length} of {unverifiedClients.length} clients selected on this page
              {pagination.totalPages > 1 && (
                <span className="ml-2">
                  • Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedClients.length === unverifiedClients.length ? 'Deselect All' : 'Select All'} on this page
            </button>
            
            <button
              onClick={handleBulkActivation}
              disabled={selectedClients.length === 0 || isSendingEmails}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingEmails ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Send Activation Emails ({selectedClients.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {progress.isActive && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Sending activation emails...
              </span>
              <span className="text-sm text-blue-700">
                {progress.current} of {progress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Client List */}
        {unverifiedClients.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clients Verified!</h3>
            <p className="text-gray-500">
              All clients have verified their email addresses. No action needed.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === unverifiedClients.length && unverifiedClients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unverifiedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                          {client.first_name?.[0]}{client.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{client.email}</span>
                        <XCircleIcon className="w-4 h-4 text-red-500 ml-2" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {client.user_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls - Outside of client list conditional */}
        {pagination.totalPages > 1 && unverifiedClients.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 bg-white rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.clientsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.clientsPerPage, pagination.totalClients)} of{' '}
              {pagination.totalClients} clients
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientActivationScreen;