import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FilterValues, FilterConfig } from '@/components/search/SearchFilter';

export interface UseSearchFilterOptions {
  initialSearch?: string;
  initialFilters?: FilterValues;
  debounceMs?: number;
}

export interface UseSearchFilterReturn {
  // Search state
  searchValue: string;
  setSearchValue: (value: string) => void;
  debouncedSearchValue: string;
  
  // Filter state
  filterValues: FilterValues;
  setFilterValue: (key: string, value: any) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;
  
  // Combined filtering function
  filterItems: <T>(items: T[], searchFields: (keyof T)[], customFilters?: Record<string, (item: T, value: any) => boolean>) => T[];
  
  // Filter utilities
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export const useSearchFilter = (options: UseSearchFilterOptions = {}): UseSearchFilterReturn => {
  const {
    initialSearch = '',
    initialFilters = {},
    debounceMs = 300
  } = options;

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilters);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(initialSearch);

  // Debounce search value
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [searchValue, debounceMs]);

  // Update filter value
  const setFilterValue = useCallback((key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear specific filter
  const clearFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  // Clear all filters including search
  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setFilterValues({});
    setDebouncedSearchValue('');
  }, []);

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(filterValues).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    });
  }, [filterValues]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
  }, [filterValues]);

  // Generic filter function
  const filterItems = useCallback(<T,>(
    items: T[],
    searchFields: (keyof T)[],
    customFilters: Record<string, (item: T, value: any) => boolean> = {}
  ): T[] => {
    return items.filter(item => {
      // Apply search filter
      if (debouncedSearchValue.trim()) {
        const searchLower = debouncedSearchValue.toLowerCase();
        const matchesSearch = searchFields.some(field => {
          const fieldValue = item[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchLower);
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(searchLower);
          }
          return false;
        });
        if (!matchesSearch) return false;
      }

      // Apply custom filters
      for (const [filterKey, filterValue] of Object.entries(filterValues)) {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) continue;

        const customFilter = customFilters[filterKey];
        if (customFilter) {
          if (!customFilter(item, filterValue)) return false;
        } else {
          // Default filter logic for simple field matching
          const itemValue = (item as any)[filterKey];
          
          if (Array.isArray(filterValue)) {
            // Multiple selection filter
            if (!filterValue.includes(itemValue)) return false;
          } else if (typeof filterValue === 'object' && filterValue.start && filterValue.end) {
            // Date range filter
            const itemDate = new Date(itemValue);
            const startDate = new Date(filterValue.start);
            const endDate = new Date(filterValue.end);
            if (itemDate < startDate || itemDate > endDate) return false;
          } else {
            // Simple equality filter
            if (itemValue !== filterValue) return false;
          }
        }
      }

      return true;
    });
  }, [debouncedSearchValue, filterValues]);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    filterValues,
    setFilterValue,
    clearFilters,
    clearAllFilters,
    filterItems,
    hasActiveFilters,
    activeFilterCount
  };
};

export default useSearchFilter;