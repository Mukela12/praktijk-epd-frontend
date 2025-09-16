import React, { createContext, useContext, useState, useCallback } from 'react';
import { Therapist, FilterState, SortState } from './therapistTypes';
import { realApiService } from '@/services/realApi';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { transformToFrontend } from '@/utils/fieldTransformations';

interface TherapistContextType {
  // List state
  therapists: Therapist[];
  loading: boolean;
  error: string | null;
  
  // Selection state
  selectedIds: Set<string>;
  selectAll: boolean;
  
  // Filter & Sort state
  filters: FilterState;
  sort: SortState;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  
  // Actions
  loadTherapists: () => Promise<void>;
  toggleSelection: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  updateSort: (sort: SortState) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Operations
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  bulkDelete: (ids: string[], permanent: boolean) => Promise<void>;
  exportTherapists: (ids: string[]) => Promise<void>;
}

const TherapistContext = createContext<TherapistContextType | undefined>(undefined);

export const useTherapistContext = () => {
  const context = useContext(TherapistContext);
  if (!context) {
    throw new Error('useTherapistContext must be used within TherapistProvider');
  }
  return context;
};

export const TherapistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  
  // State
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters & Sort
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    specializations: [],
    acceptingClients: null,
    dateRange: null,
    clientCount: null,
    rating: null
  });
  
  const [sort, setSort] = useState<SortState>({
    field: 'name',
    direction: 'asc'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Load therapists with filters and sorting
  const loadTherapists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await realApiService.admin.getTherapists();
      
      if (response.success && response.data) {
        const therapistsData = response.data.therapists || response.data || [];
        const therapistsArray = Array.isArray(therapistsData) ? therapistsData : [];
        
        // Transform and filter data
        let processedTherapists = therapistsArray.map((therapist: any) => {
          const frontendData = transformToFrontend(therapist);
          return {
            ...therapist,
            ...frontendData,
            user_status: therapist.user_status || therapist.status || 'active',
            created_at: therapist.created_at || new Date().toISOString(),
            updated_at: therapist.updated_at || new Date().toISOString()
          };
        });
        
        // Apply filters
        processedTherapists = applyFilters(processedTherapists, filters);
        
        // Apply sorting
        processedTherapists = applySort(processedTherapists, sort);
        
        setTherapists(processedTherapists);
        setTotalItems(processedTherapists.length);
      }
    } catch (err) {
      console.error('Failed to load therapists:', err);
      setError('Failed to load therapists');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load therapists data',
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sort, addNotification]);

  // Filter logic
  const applyFilters = (therapists: Therapist[], filters: FilterState): Therapist[] => {
    return therapists.filter(therapist => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          therapist.first_name.toLowerCase().includes(searchLower) ||
          therapist.last_name.toLowerCase().includes(searchLower) ||
          therapist.email.toLowerCase().includes(searchLower) ||
          therapist.specializations.some(s => s.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(therapist.user_status)) {
        return false;
      }
      
      // Specialization filter
      if (filters.specializations.length > 0) {
        const hasSpecialization = filters.specializations.some(spec => 
          therapist.specializations.includes(spec)
        );
        if (!hasSpecialization) return false;
      }
      
      // Accepting clients filter
      if (filters.acceptingClients !== null && therapist.accepting_new_clients !== filters.acceptingClients) {
        return false;
      }
      
      // Client count filter
      if (filters.clientCount) {
        const count = therapist.client_count || 0;
        if (count < filters.clientCount.min || count > filters.clientCount.max) {
          return false;
        }
      }
      
      // Rating filter
      if (filters.rating) {
        const rating = therapist.rating || 0;
        if (rating < filters.rating.min || rating > filters.rating.max) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Sort logic
  const applySort = (therapists: Therapist[], sort: SortState): Therapist[] => {
    const sorted = [...therapists].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sort.field) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'status':
          aValue = a.user_status;
          bValue = b.user_status;
          break;
        case 'clients':
          aValue = a.client_count || 0;
          bValue = b.client_count || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  };

  // Selection actions
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(therapists.map(t => t.id)));
      setSelectAll(true);
    }
  }, [selectAll, therapists]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAll(false);
  }, []);

  // Filter & Sort actions
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page
  }, []);

  const updateSort = useCallback((newSort: SortState) => {
    setSort(newSort);
  }, []);

  // Pagination actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSizeAction = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Bulk operations
  const bulkUpdateStatus = async (ids: string[], status: string) => {
    console.log('🔄 [TherapistContext] Bulk update status:', { ids, status });
    
    try {
      setLoading(true);
      
      // Update each therapist's status
      const promises = ids.map(id => {
        console.log(`📤 [TherapistContext] Updating therapist ${id} status to ${status}`);
        return realApiService.admin.updateUser(id, { user_status: status });
      });
      
      const results = await Promise.allSettled(promises);
      
      // Check results
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log('📊 [TherapistContext] Bulk update results:', { succeeded, failed, total: ids.length });
      
      if (failed > 0) {
        console.error('❌ [TherapistContext] Some updates failed:', results.filter(r => r.status === 'rejected'));
        addNotification({
          type: 'warning',
          title: 'Partial Success',
          message: `Updated ${succeeded} therapist(s), but ${failed} failed`,
          duration: 5000
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `Successfully updated ${ids.length} therapist(s) status to ${status}`,
          duration: 5000
        });
      }
      
      clearSelection();
      await loadTherapists();
    } catch (err: any) {
      console.error('❌ [TherapistContext] Bulk update failed:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update therapist status',
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (ids: string[], permanent: boolean) => {
    console.log('🗑️ [TherapistContext] Bulk delete:', { ids, permanent });
    
    try {
      setLoading(true);
      
      const promises = ids.map(id => {
        console.log(`📤 [TherapistContext] Deleting therapist ${id} (permanent: ${permanent})`);
        return realApiService.admin.deleteUser(id, permanent);
      });
      
      const results = await Promise.allSettled(promises);
      
      // Check results
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log('📊 [TherapistContext] Bulk delete results:', { succeeded, failed, total: ids.length });
      
      if (failed > 0) {
        console.error('❌ [TherapistContext] Some deletes failed:', results.filter(r => r.status === 'rejected'));
        addNotification({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${succeeded} therapist(s), but ${failed} failed`,
          duration: 5000
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `Successfully ${permanent ? 'permanently deleted' : 'deactivated'} ${ids.length} therapist(s)`,
          duration: 5000
        });
      }
      
      clearSelection();
      await loadTherapists();
    } catch (err: any) {
      console.error('❌ [TherapistContext] Bulk delete failed:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete therapists',
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTherapists = async (ids: string[]) => {
    try {
      setLoading(true);
      
      // Filter therapists to export
      const therapistsToExport = ids.length > 0 
        ? therapists.filter(t => ids.includes(t.id))
        : therapists;
      
      // Convert to CSV format
      const headers = [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status',
        'License Number', 'Specializations', 'Languages', 'Years of Experience',
        'Hourly Rate', 'Client Count', 'Rating', 'Created Date'
      ];
      
      const csvData = therapistsToExport.map(t => [
        t.id,
        t.first_name,
        t.last_name,
        t.email,
        t.phone || '',
        t.status,
        t.license_number || '',
        (t.specializations || []).join('; '),
        (t.languages || []).join('; '),
        t.years_of_experience || 0,
        t.hourly_rate || 0,
        t.client_count || 0,
        t.rating || 0,
        new Date(t.created_at).toLocaleDateString()
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell
          ).join(',')
        )
      ].join('\\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `therapists_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Successfully exported ${therapistsToExport.length} therapist(s)`,
        duration: 5000
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export therapists',
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const value: TherapistContextType = {
    therapists,
    loading,
    error,
    selectedIds,
    selectAll,
    filters,
    sort,
    currentPage,
    pageSize,
    totalItems,
    loadTherapists,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    updateFilters,
    updateSort,
    setPage,
    setPageSize: setPageSizeAction,
    bulkUpdateStatus,
    bulkDelete,
    exportTherapists
  };

  return (
    <TherapistContext.Provider value={value}>
      {children}
    </TherapistContext.Provider>
  );
};