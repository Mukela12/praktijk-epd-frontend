import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  CalendarIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAdminWaitingList } from '@/hooks/useRealApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumListItem, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { normalizeClientList, withSmartDefaults } from '@/utils/dataMappers';
import { adminApi } from '@/services/unifiedApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SmartPairingResults from '@/components/admin/SmartPairingResults';

// Types
interface WaitingListItem {
  id: string;
  client_name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  registration_date: string;
  therapy_type: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'assigned';
  preferred_therapist_gender?: string;
  preferred_language?: string;
  notes?: string;
  insurance_type?: string;
  location_preference?: string;
  hulpvragen?: string[];
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  intakeCompleted?: boolean;
}

const WaitingListManagement: React.FC = () => {
  const { t } = useTranslation();
  const { getWaitingList, waitingList: apiWaitingList, updateEntry, isLoading } = useAdminWaitingList();
  const { success, error, info, warning } = useAlert();

  // State
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
  const [filteredList, setFilteredList] = useState<WaitingListItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WaitingListItem | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    therapyType: 'all',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'status'>('urgency');
  
  // Smart pairing state
  const [smartPairingResults, setSmartPairingResults] = useState<any[]>([]);
  const [showPairingResults, setShowPairingResults] = useState(false);

  // Load data
  useEffect(() => {
    console.log('[WaitingList] ===== LOADING WAITING LIST =====');
    console.log('[WaitingList] Calling API hook: getWaitingList()');
    getWaitingList();
  }, []);

  // Update local state when API data changes - using centralized data transformation
  useEffect(() => {
    console.log('[WaitingList] ===== PROCESSING API DATA =====');
    console.log('[WaitingList] API waiting list data:', apiWaitingList);
    console.log('[WaitingList] Data length:', apiWaitingList?.length || 0);

    if (apiWaitingList && apiWaitingList.length > 0) {
      console.log('[WaitingList] First raw item:', apiWaitingList[0]);

      // Use centralized data transformation
      console.log('[WaitingList] Starting normalization...');
      try {
        const normalizedClients = normalizeClientList(apiWaitingList);
        console.log('[WaitingList] Normalized clients count:', normalizedClients.length);

        // Map to waiting list format expected by component
        const formattedData = normalizedClients.map((normalized: any) => {
          const client = withSmartDefaults(normalized, 'client');

          return {
            id: client.id,
            client_name: client.name,
            email: client.email,
            phone: client.phone,
            age: client.age || 'N/A', // Calculate from dateOfBirth if available
            gender: client.gender,
            registration_date: client.createdAt,
            therapy_type: client.therapy_type || 'General',
            urgency: client.urgencyLevel || 'medium',
            status: client.status || 'viewed',
            preferred_therapist_gender: client.preferred_therapist_gender,
            preferred_language: client.preferredLanguage,
            notes: client.notes,
            insurance_type: client.insurance_type,
            location_preference: client.location_preference,
            // Additional fields from appointment request context
            hulpvragen: client.hulpvragen || [],
            assignedTherapistName: client.assignedTherapistName,
            intakeCompleted: client.intakeCompleted
          };
        });

        console.log('[WaitingList] ✓ Normalization successful');
        console.log('[WaitingList] Formatted data count:', formattedData.length);
        console.log('[WaitingList] First formatted item:', formattedData[0]);
        setWaitingList(formattedData);
        setFilteredList(formattedData);
      } catch (error) {
        console.error('[WaitingList] ✗ Error normalizing waiting list data:', error);
        console.error('[WaitingList] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });

        // Fallback to existing logic if normalization fails
        console.log('[WaitingList] Using fallback data mapping...');
        const fallbackData = apiWaitingList.map(item => ({
          id: item.id,
          client_name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Client',
          email: item.email,
          phone: item.phone,
          age: item.age,
          gender: item.gender,
          registration_date: item.created_at,
          therapy_type: item.therapy_type || 'General',
          urgency: item.urgency_level || 'medium',
          status: item.status || 'new',
          preferred_therapist_gender: item.preferred_therapist_gender,
          preferred_language: item.preferred_language,
          notes: item.notes,
          insurance_type: item.insurance_type,
          location_preference: item.location_preference
        }));
        console.log('[WaitingList] ✓ Fallback data created:', fallbackData.length, 'items');
        setWaitingList(fallbackData);
        setFilteredList(fallbackData);
      }
    } else {
      console.log('[WaitingList] No waiting list data available');
    }
  }, [apiWaitingList]);

  // Apply filters
  useEffect(() => {
    let filtered = [...waitingList];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.client_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.therapy_type.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Urgency filter
    if (filters.urgency !== 'all') {
      filtered = filtered.filter(item => item.urgency === filters.urgency);
    }

    // Therapy type filter
    if (filters.therapyType !== 'all') {
      filtered = filtered.filter(item => item.therapy_type === filters.therapyType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      } else if (sortBy === 'date') {
        return new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime();
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredList(filtered);
  }, [waitingList, filters, sortBy]);

  // Smart pairing function - now using real API
  const performSmartPairing = async (clientId?: string) => {
    console.log('[WaitingList] ===== SMART PAIRING =====');
    console.log('[WaitingList] Client ID (if specific):', clientId);

    try {
      info('Analyzing client preferences and therapist availability...', { duration: 3000 });

      // If no specific client ID, perform bulk pairing for all pending clients
      const clientsToProcess = clientId ?
        waitingList.filter(client => client.id === clientId) :
        waitingList.filter(client => client.status === 'viewed' || client.status === 'contacted');

      console.log('[WaitingList] Clients to process:', clientsToProcess.length);
      console.log('[WaitingList] Clients:', clientsToProcess.map(c => ({ id: c.id, name: c.client_name })));

      if (clientsToProcess.length === 0) {
        console.log('[WaitingList] ⚠ No clients available for smart pairing');
        warning('No clients available for smart pairing');
        return;
      }

      const recommendations: any[] = [];

      // Get recommendations for each client
      for (const client of clientsToProcess) {
        console.log('[WaitingList] Processing client:', client.id, client.client_name);
        try {
          const params = {
            clientId: client.id,
            appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
            preferredLanguage: client.preferred_language,
            problemCategory: client.hulpvragen?.[0] // Use first hulpvraag if available
          };
          console.log('[WaitingList] API params for client:', params);

          const response = await adminApi.getSmartPairingRecommendations(params);

          console.log('[WaitingList] Smart pairing response for client', client.id, ':', response);

          if (response.success && response.data?.recommendations?.length > 0) {
            const topRecommendations = response.data.recommendations.slice(0, 3);
            console.log('[WaitingList] ✓ Found', response.data.recommendations.length, 'matches (taking top 3)');
            recommendations.push({
              client,
              recommendations: topRecommendations
            });
          } else {
            console.log('[WaitingList] No recommendations for client', client.id);
          }
        } catch (error) {
          console.error(`[WaitingList] ✗ Error getting recommendations for client ${client.id}:`, error);
          console.error('[WaitingList] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            response: (error as any)?.response?.data,
            status: (error as any)?.response?.status
          });
        }
      }

      console.log('[WaitingList] Total recommendations:', recommendations.length);

      if (recommendations.length > 0) {
        console.log('[WaitingList] ✓ Smart pairing completed successfully');
        success(`Smart pairing completed! Found ${recommendations.length} clients with optimal matches.`, {
          action: {
            label: 'View Results',
            onClick: () => {
              // Store recommendations in state for display
              setSmartPairingResults(recommendations);
              setShowPairingResults(true);
            }
          }
        });
      } else {
        console.log('[WaitingList] ⚠ No optimal matches found');
        warning('No optimal matches found. Please check therapist availability and client preferences.');
      }

    } catch (err) {
      console.error('[WaitingList] ✗ Smart pairing error:', err);
      console.error('[WaitingList] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status
      });
      error('Failed to perform smart pairing. Please try again.');
    }
  };

  // Handle therapist assignment - FIXED: Now calls correct assignment endpoint
  const handleAssignTherapist = async (clientId: string, therapistId: string) => {
    console.log('[WaitingList] ===== ASSIGN THERAPIST =====');
    console.log('[WaitingList] Client ID:', clientId);
    console.log('[WaitingList] Therapist ID:', therapistId);

    try {
      const assignmentData = {
        therapistId,
        assignmentDate: new Date().toISOString(),
        notes: 'Assigned via Smart Pairing Algorithm'
      };
      console.log('[WaitingList] Assignment data:', assignmentData);
      console.log('[WaitingList] Calling API: /admin/assign-therapist');

      // CORRECTED: Call proper assignment endpoint instead of waiting list update
      const response = await adminApi.assignTherapist(clientId, assignmentData);

      console.log('[WaitingList] Assignment response:', response);

      if (response.success) {
        console.log('[WaitingList] ✓ Assignment successful');

        // Update local state
        setWaitingList(prev =>
          prev.map(item =>
            item.id === clientId ? {
              ...item,
              status: 'assigned' as any,
              assignedTherapistId: therapistId
            } : item
          )
        );

        // Find client name for success message
        const client = waitingList.find(c => c.id === clientId);
        const clientName = client?.client_name || 'Client';

        success(`${clientName} successfully assigned to therapist`);

        // Reload data to get fresh updates
        console.log('[WaitingList] Reloading waiting list...');
        getWaitingList();
      } else {
        console.error('[WaitingList] ✗ Assignment failed - invalid response');
        throw new Error(response.error || 'Assignment failed');
      }
    } catch (err: any) {
      console.error('[WaitingList] ✗ Assignment error:', err);
      console.error('[WaitingList] Error details:', {
        message: err.message || 'Unknown error',
        response: err?.response?.data,
        status: err?.response?.status
      });
      error(`Failed to assign therapist: ${err.message || 'Unknown error'}`);
      throw err; // Re-throw for SmartPairingResults component to handle
    }
  };

  // Handle status update
  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    console.log('[WaitingList] ===== STATUS UPDATE =====');
    console.log('[WaitingList] Item ID:', itemId);
    console.log('[WaitingList] New status:', newStatus);

    try {
      console.log('[WaitingList] Calling updateEntry hook...');
      await updateEntry(itemId, { status: newStatus });
      console.log('[WaitingList] ✓ Status updated successfully');

      setWaitingList(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus as any } : item
        )
      );
      success(`Status updated to ${newStatus}`);

      // Reload data to get fresh updates
      console.log('[WaitingList] Reloading waiting list...');
      getWaitingList();
    } catch (err) {
      console.error('[WaitingList] ✗ Failed to update status:', err);
      console.error('[WaitingList] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status
      });
      error('Failed to update status');
    }
  };

  // Get priority color
  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return ExclamationTriangleIcon;
      case 'viewed': return EyeIcon;
      case 'contacted': return PhoneIcon;
      case 'scheduled': return CalendarIcon;
      case 'assigned': return CheckCircleIcon;
      default: return ClockIcon;
    }
  };

  const therapyTypes = [...new Set(waitingList.map(item => item.therapy_type))];
  const statusOptions = ['new', 'viewed', 'contacted', 'scheduled', 'assigned'];
  const urgencyOptions = ['critical', 'high', 'medium', 'low'];

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ClockIcon className="w-8 h-8 mr-3" />
              Waiting List Management
            </h1>
            <p className="text-blue-100 mt-1">
              Smart client-therapist pairing with AI-powered matching
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={SparklesIcon}
              onClick={() => performSmartPairing()}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Smart Pairing
            </PremiumButton>
            <PremiumButton
              variant="outline"
              icon={UserPlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Add Application
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <PremiumCard>
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-gray-900">Status Legend:</span>
          {statusOptions.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <StatusBadge status={status} type={status as any} size="sm" />
              <span className="text-sm text-gray-600 capitalize">
                {status === 'new' && 'Not yet viewed'}
                {status === 'viewed' && 'Reviewed by practitioner'}
                {status === 'contacted' && 'Client contacted'}
                {status === 'scheduled' && 'Intake scheduled'}
                {status === 'assigned' && 'Therapist assigned'}
              </span>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Smart Pairing Results */}
      {showPairingResults && smartPairingResults.length > 0 && (
        <SmartPairingResults
          pairingResults={smartPairingResults}
          onAssignTherapist={handleAssignTherapist}
          onClose={() => {
            setShowPairingResults(false);
            setSmartPairingResults([]);
          }}
        />
      )}

      {/* Filters */}
      <PremiumCard>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status} className="capitalize">{status}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Urgency Filter */}
          <div className="relative">
            <select
              value={filters.urgency}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Urgency</option>
              {urgencyOptions.map(urgency => (
                <option key={urgency} value={urgency} className="capitalize">{urgency}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Therapy Type Filter */}
          <div className="relative">
            <select
              value={filters.therapyType}
              onChange={(e) => setFilters(prev => ({ ...prev, therapyType: e.target.value }))}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {therapyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </PremiumCard>

      {/* Waiting List */}
      {filteredList.length === 0 ? (
        <PremiumCard>
          <PremiumEmptyState
            icon={ClockIcon}
            title="No Applications Found"
            description="There are no waiting list applications matching your current filters."
            action={{
              label: 'Clear Filters',
              onClick: () => setFilters({ status: 'all', urgency: 'all', therapyType: 'all', searchTerm: '' })
            }}
          />
        </PremiumCard>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            const timeSinceRegistration = Math.floor(
              (new Date().getTime() - new Date(item.registration_date).getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <PremiumCard
                key={item.id}
                hover
                border={item.urgency === 'critical' ? 'danger' : item.urgency === 'high' ? 'warning' : 'primary'}
                className="p-0"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {item.client_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.client_name}</h3>
                          <StatusBadge status={item.status} type={item.status as any} />
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.urgency)}`}>
                            {item.urgency.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{item.email}</span>
                          </div>
                          {item.phone && (
                            <div className="flex items-center space-x-2">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{item.phone}</span>
                            </div>
                          )}
                          {item.age && (
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-4 h-4" />
                              <span>{item.gender} • {item.age} years</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Applied {timeSinceRegistration}d ago</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4" />
                            <span className="font-medium text-blue-600">{item.therapy_type}</span>
                          </div>
                          {item.location_preference && (
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{item.location_preference}</span>
                            </div>
                          )}
                        </div>

                        {/* Preferences */}
                        {(item.preferred_therapist_gender || item.preferred_language) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-900">Preferences: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.preferred_therapist_gender && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {item.preferred_therapist_gender} therapist
                                </span>
                              )}
                              {item.preferred_language && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {item.preferred_language}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <PremiumButton
                        size="sm"
                        variant="primary"
                        icon={EyeIcon}
                        onClick={() => setSelectedItem(item)}
                      >
                        View Details
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        icon={EnvelopeIcon}
                      >
                        Contact
                      </PremiumButton>
                      {item.status === 'viewed' && (
                        <PremiumButton
                          size="sm"
                          variant="success"
                          icon={CalendarIcon}
                          onClick={() => handleStatusUpdate(item.id, 'scheduled')}
                        >
                          Schedule
                        </PremiumButton>
                      )}
                    </div>
                  </div>

                  {/* Smart Matching (show for viewed items) */}
                  {item.status === 'viewed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 -mx-6 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <SparklesIcon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">AI Match Suggestion:</span>
                          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium">Dr. Sarah Wilson (97% match)</span>
                          </div>
                        </div>
                        <PremiumButton
                          size="sm"
                          variant="success"
                          icon={UserPlusIcon}
                          onClick={() => {
                            handleStatusUpdate(item.id, 'assigned');
                            success(`${item.client_name} assigned to Dr. Sarah Wilson`);
                          }}
                        >
                          Assign
                        </PremiumButton>
                      </div>
                    </div>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {/* Results Summary */}
      <PremiumCard className="bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            <p className="text-gray-600">
              Showing {filteredList.length} of {waitingList.length} applications
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredList.filter(item => item.urgency === 'critical').length}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredList.filter(item => item.urgency === 'high').length}
              </div>
              <div className="text-xs text-gray-600">High</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredList.filter(item => item.status === 'assigned').length}
              </div>
              <div className="text-xs text-gray-600">Assigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredList.filter(item => item.status === 'new').length}
              </div>
              <div className="text-xs text-gray-600">New</div>
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default WaitingListManagement;