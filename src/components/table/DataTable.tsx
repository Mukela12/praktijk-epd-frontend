import React, { useState, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { StatusIndicator } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchFilter from '@/components/search/SearchFilter';
import useSearchFilter from '@/hooks/useSearchFilter';
import type { FilterConfig, FilterValues } from '@/components/search/SearchFilter';
import type { StatusType } from '@/components/ui/StatusIndicator';

// Column definition interface
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

// Action button interface
export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (item: T, index: number) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

// Table props interface
export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  searchConfig?: {
    placeholder?: string;
    searchFields: (keyof T)[];
    filters?: FilterConfig[];
    customFilters?: Record<string, (item: T, value: any) => boolean>;
  };
  pagination?: {
    pageSize?: number;
    showPagination?: boolean;
    showPageSizeOptions?: boolean;
  };
  sorting?: {
    defaultSort?: keyof T;
    defaultDirection?: 'asc' | 'desc';
  };
  selection?: {
    enabled?: boolean;
    onSelectionChange?: (selectedItems: T[]) => void;
  };
  loading?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  className?: string;
  compact?: boolean;
}

// Sort direction type
type SortDirection = 'asc' | 'desc' | null;

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchConfig,
  pagination = { pageSize: 10, showPagination: true },
  sorting,
  selection,
  loading = false,
  emptyState,
  className = "",
  compact = false
}: DataTableProps<T>) => {
  // Search and filter state
  const {
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValue,
    clearFilters,
    filterItems,
    hasActiveFilters,
    activeFilterCount
  } = useSearchFilter();

  // Sorting state
  const [sortColumn, setSortColumn] = useState<keyof T | null>(sorting?.defaultSort || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(sorting?.defaultDirection || null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);

  // Selection state
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (!columns.find(col => col.key === column)?.sortable) return;

    if (sortColumn === column) {
      // Toggle direction or clear sort
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Apply filters and search
  const filteredData = useMemo(() => {
    if (!searchConfig) return data;

    return filterItems(
      data,
      searchConfig.searchFields,
      searchConfig.customFilters
    );
  }, [data, searchConfig, filterItems]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination.showPagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination.showPagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sortedData.length);

  // Handle selection
  const handleSelectItem = (item: T, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedItems, item];
      setSelectedItems(newSelection);
      selection?.onSelectionChange?.(newSelection);
    } else {
      const newSelection = selectedItems.filter(selected => selected !== item);
      setSelectedItems(newSelection);
      selection?.onSelectionChange?.(newSelection);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData);
      selection?.onSelectionChange?.(paginatedData);
    } else {
      setSelectedItems([]);
      selection?.onSelectionChange?.([]);
    }
  };

  const isSelected = (item: T) => selectedItems.includes(item);
  const isAllSelected = paginatedData.length > 0 && selectedItems.length === paginatedData.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < paginatedData.length;

  // Render action buttons
  const renderActions = (item: T, index: number) => {
    const visibleActions = actions.filter(action => !action.hidden?.(item));
    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      const buttonVariant = action.variant || 'secondary';
      const IconComponent = action.icon;

      return (
        <button
          onClick={() => action.onClick(item, index)}
          disabled={action.disabled?.(item)}
          className={`btn-${buttonVariant} btn-icon`}
          title={action.label}
        >
          {IconComponent && <IconComponent className="h-4 w-4" />}
        </button>
      );
    }

    return (
      <div className="relative">
        <button className="btn-icon">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
        {/* Action dropdown menu would go here */}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filters */}
      {searchConfig && (
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={searchConfig.filters || []}
          filterValues={filterValues}
          onFilterChange={setFilterValue}
          onClearFilters={clearFilters}
          placeholder={searchConfig.placeholder}
          compact={compact}
        />
      )}

      {/* Table container */}
      <div className="table-container">
        <table className="table-standard">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              {selection?.enabled && (
                <th className="table-header-cell w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`table-header-cell ${column.className || ''} ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as keyof T)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={`h-3 w-3 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDownIcon
                          className={`h-3 w-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="table-header-cell w-24">Actions</th>
              )}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="table-body">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection?.enabled ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="table-cell text-center py-12"
                >
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium mb-2">
                      {emptyState?.title || 'No data found'}
                    </h3>
                    <p className="text-sm mb-4">
                      {emptyState?.description || 'Try adjusting your search or filter criteria.'}
                    </p>
                    {emptyState?.action}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={index} className="table-row">
                  {selection?.enabled && (
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className={`table-cell ${column.className || ''}`}>
                      {column.render
                        ? column.render(item[column.key as keyof T], item, index)
                        : String(item[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {renderActions(item, index)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.showPagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-outline"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-outline"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{sortedData.length}</span> results
              </p>
              {pagination.showPageSizeOptions && (
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="select-field-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;