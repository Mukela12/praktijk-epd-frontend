import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StatusIndicator, StatusFilter } from '@/components/ui';
import type { StatusType } from '@/components/ui/StatusIndicator';

// Base filter option interface
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
}

// Filter configuration for different types
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'status' | 'date-range' | 'search' | 'toggle';
  options?: FilterOption[];
  statusType?: StatusType;
  placeholder?: string;
  icon?: React.ComponentType<any>;
  clearable?: boolean;
}

// Filter values interface
export interface FilterValues {
  [key: string]: any;
}

// Search and filter props
export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  filterValues: FilterValues;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  placeholder?: string;
  showFilterCount?: boolean;
  className?: string;
  compact?: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  placeholder = "Search...",
  showFilterCount = true,
  className = "",
  compact = false
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Calculate active filter count
  useEffect(() => {
    const count = Object.values(filterValues).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
    setActiveFilterCount(count);
  }, [filterValues]);

  const renderFilter = (filter: FilterConfig) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="flex-1 min-w-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder || placeholder}
                className="input-field pl-10 pr-10"
              />
              {value && (
                <button
                  onClick={() => onFilterChange(filter.key, '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={filter.key} className="min-w-48">
            <label className="form-label">{filter.label}</label>
            <div className="relative">
              {filter.icon && (
                <filter.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <select
                value={value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className={`select-field ${filter.icon ? 'pl-10' : ''}`}
              >
                <option value="">All {filter.label}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.key} className="min-w-64">
            <label className="form-label">{filter.label}</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
              {filter.options?.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onFilterChange(filter.key, [...currentValues, option.value]);
                      } else {
                        onFilterChange(filter.key, currentValues.filter(v => v !== option.value));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {option.label}
                    {option.count !== undefined && (
                      <span className="text-gray-500 ml-1">({option.count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'status':
        return (
          <div key={filter.key} className="min-w-64">
            <label className="form-label">{filter.label}</label>
            {filter.statusType && (
              <StatusFilter
                type={filter.statusType}
                selectedStatuses={Array.isArray(value) ? value : []}
                onStatusChange={(statuses) => onFilterChange(filter.key, statuses)}
                className="mt-1"
              />
            )}
          </div>
        );

      case 'date-range':
        return (
          <div key={filter.key} className="min-w-80">
            <label className="form-label">{filter.label}</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={value?.start || ''}
                  onChange={(e) => onFilterChange(filter.key, { ...value, start: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Start date"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={value?.end || ''}
                  onChange={(e) => onFilterChange(filter.key, { ...value, end: e.target.value })}
                  className="input-field pl-10"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div key={filter.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`toggle-${filter.key}`}
              checked={Boolean(value)}
              onChange={(e) => onFilterChange(filter.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`toggle-${filter.key}`} className="text-sm font-medium text-gray-700 cursor-pointer">
              {filter.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Main search bar */}
      <div className="flex items-center space-x-4">
        {/* Primary search input */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="input-field pl-10 pr-4"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className={`btn-secondary flex items-center space-x-2 ${
            activeFilterCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {showFilterCount && activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear filters button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="btn-ghost text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {isFilterExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {filters.map(renderFilter)}
          </div>

          {/* Active filter summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filterValues).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    
                    const filter = filters.find(f => f.key === key);
                    if (!filter) return null;

                    const displayValue = Array.isArray(value) 
                      ? value.length === 1 ? value[0] : `${value.length} selected`
                      : typeof value === 'object' && value.start && value.end
                        ? `${value.start} to ${value.end}`
                        : value.toString();

                    return (
                      <span
                        key={key}
                        className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        <span>{filter.label}: {displayValue}</span>
                        <button
                          onClick={() => onFilterChange(key, Array.isArray(value) ? [] : '')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;