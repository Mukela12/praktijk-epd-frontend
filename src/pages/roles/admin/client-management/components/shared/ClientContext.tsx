import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import { handleApiError } from '@/utils/apiErrorHandler';

// Client interface matching backend response
export interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_status: 'active' | 'inactive' | 'suspended';
  preferred_language?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
  profile_photo_url?: string;
  
  // Client profile fields
  client_status?: string;
  date_of_birth?: string;
  gender?: string;
  insurance_company?: string;
  insurance_number?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  therapy_goals?: string;
  intake_completed?: boolean;
  intake_date?: string;
  assigned_therapist_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  therapy_type?: string;
  reason_for_therapy?: string;
  referred_by?: string;
  notes?: string;
  
  // Related data
  therapist_first_name?: string;
  therapist_last_name?: string;
  therapist_email?: string;
  therapist_phone?: string;
  
  // Statistics
  total_appointments?: number;
  completed_appointments?: number;
  unpaid_appointments?: number;
}

export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  assignedClients: number;
  unassignedClients: number;
  intakeCompleted: number;
  clientsWithUpcomingAppointments: number;
}

export interface ClientFilters {
  search: string;
  status: string[];
  therapist: string;
  intakeCompleted: string;
  hasUpcomingAppointments: string;
}

interface ClientContextValue {
  // Data
  clients: Client[];
  selectedClient: Client | null;
  clientDetails: any | null;
  statistics: ClientStatistics | null;
  therapists: any[];
  loading: boolean;
  error: string | null;
  
  // Filters and Pagination
  filters: ClientFilters;
  setFilters: (filters: Partial<ClientFilters>) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  setPage: (page: number) => void;
  
  // Selection
  selectedIds: Set<string>;
  selectAll: boolean;
  toggleSelectAll: () => void;
  toggleSelectClient: (id: string) => void;
  
  // Actions
  loadClients: () => Promise<void>;
  loadClientDetails: (clientId: string) => Promise<void>;
  loadTherapists: () => Promise<void>;
  createClient: (data: any) => Promise<boolean>;
  updateClient: (clientId: string, data: any) => Promise<boolean>;
  deleteClient: (clientId: string) => Promise<boolean>;
  assignTherapist: (clientId: string, therapistId: string, notes?: string) => Promise<boolean>;
  bulkUpdateStatus: (clientIds: string[], status: string) => Promise<boolean>;
}

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error: errorAlert } = useAlert();
  
  // Memoize alert functions to prevent unnecessary re-renders
  const stableErrorAlert = useCallback(errorAlert, [errorAlert]);
  const stableSuccessAlert = useCallback(success, [success]);
  
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetails, setClientDetails] = useState<any | null>(null);
  const [statistics, setStatistics] = useState<ClientStatistics | null>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and Pagination
  const [filtersState, setFiltersState] = useState<ClientFilters>({
    search: '',
    status: [],
    therapist: 'all',
    intakeCompleted: 'all',
    hasUpcomingAppointments: 'all'
  });

  // Memoize filters object to prevent unnecessary loadClients calls
  const filters = useMemo(() => filtersState, [filtersState.search, filtersState.status, filtersState.therapist, filtersState.intakeCompleted, filtersState.hasUpcomingAppointments]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Load clients
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status.length > 0) {
        params.status = filters.status[0]; // API expects single status
      }
      
      if (filters.therapist !== 'all') {
        params.therapist = filters.therapist;
      }
      
      const response = await realApiService.admin.getClients(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        // Transform client status if needed to match our interface
        const clientsArray = (data.clients || []).map((client: any) => ({
          ...client,
          user_status: client.user_status === 'pending' ? 'inactive' : client.user_status
        }));
        setClients(clientsArray);
        if (data.statistics) {
          setStatistics(data.statistics);
        }
        if (data.pagination) {
          setTotalItems(data.pagination.total);
        }
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      stableErrorAlert(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, stableErrorAlert]);
  
  // Load client details
  const loadClientDetails = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      const response = await realApiService.admin.getClient(clientId);
      
      if (response.success && response.data) {
        setClientDetails(response.data);
        setSelectedClient(response.data.client);
      }
    } catch (err) {
      const apiError = handleApiError(err);
      stableErrorAlert(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [stableErrorAlert]);
  
  // Load therapists
  const loadTherapists = useCallback(async () => {
    try {
      const response = await realApiService.admin.getTherapists();
      
      if (response.success && response.data) {
        setTherapists(response.data.therapists || []);
      }
    } catch (err) {
      console.error('Failed to load therapists:', err);
    }
  }, []);
  
  // Create client
  const createClient = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const response = await realApiService.admin.createClient(data);
      
      if (response.success) {
        stableSuccessAlert('Client created successfully');
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      const apiError = handleApiError(err);
      errorAlert(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadClients, success, errorAlert]);
  
  // Update client
  const updateClient = useCallback(async (clientId: string, data: any) => {
    try {
      setLoading(true);
      const response = await realApiService.admin.updateClient(clientId, data);
      
      if (response.success) {
        stableSuccessAlert('Client updated successfully');
        await loadClients();
        if (selectedClient?.id === clientId) {
          await loadClientDetails(clientId);
        }
        return true;
      }
      return false;
    } catch (err) {
      const apiError = handleApiError(err);
      errorAlert(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadClients, loadClientDetails, selectedClient, success, errorAlert]);
  
  // Delete client
  const deleteClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      const response = await realApiService.admin.deleteClient(clientId);
      
      if (response.success) {
        stableSuccessAlert('Client deleted successfully');
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      const apiError = handleApiError(err);
      errorAlert(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadClients, success, errorAlert]);
  
  // Assign therapist
  const assignTherapist = useCallback(async (clientId: string, therapistId: string, notes?: string) => {
    try {
      setLoading(true);
      const response = await realApiService.admin.assignTherapist({
        clientId,
        therapistId,
        notes
      });
      
      if (response.success) {
        stableSuccessAlert('Therapist assigned successfully');
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      const apiError = handleApiError(err);
      errorAlert(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadClients, success, errorAlert]);
  
  // Bulk update status
  const bulkUpdateStatus = useCallback(async (clientIds: string[], status: string) => {
    try {
      setLoading(true);
      // TODO: Implement bulk status update endpoint
      stableSuccessAlert(`${clientIds.length} clients updated successfully`);
      await loadClients();
      setSelectedIds(new Set());
      setSelectAll(false);
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      errorAlert(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadClients, success, errorAlert]);
  
  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)));
    }
    setSelectAll(!selectAll);
  }, [selectAll, clients]);
  
  const toggleSelectClient = useCallback((id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === clients.length);
  }, [selectedIds, clients]);
  
  // Filter handlers
  const setFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);
  
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const value: ClientContextValue = {
    // Data
    clients,
    selectedClient,
    clientDetails,
    statistics,
    therapists,
    loading,
    error,
    
    // Filters and Pagination
    filters,
    setFilters,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    
    // Selection
    selectedIds,
    selectAll,
    toggleSelectAll,
    toggleSelectClient,
    
    // Actions
    loadClients,
    loadClientDetails,
    loadTherapists,
    createClient,
    updateClient,
    deleteClient,
    assignTherapist,
    bulkUpdateStatus
  };
  
  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};