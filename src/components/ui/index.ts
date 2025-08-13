// PraktijkEPD UI Components - Export Index
// Central export file for all UI components

// Status System
export { default as StatusIndicator } from './StatusIndicator';
export type {
  StatusType,
  ClientStatus,
  AppointmentStatus,
  PriorityLevel,
  InvoiceStatus,
  TaskStatus,
  WaitingListStatus,
  UserStatus,
  StatusIndicatorProps,
  StatusFilterProps,
  StatusStatsProps
} from './StatusIndicator';

export { StatusFilter, StatusStats, getStatusColor } from './StatusIndicator';

// Re-export LoadingSpinner for consistency
export { default as LoadingSpinner } from './LoadingSpinner';

// Search and Filter Components
export { default as SearchFilter } from '../search/SearchFilter';
export type { FilterConfig, FilterValues, SearchFilterProps } from '../search/SearchFilter';

// Table Components
export { default as DataTable } from '../table/DataTable';
export type { TableColumn, TableAction, DataTableProps } from '../table/DataTable';

// Hooks
export { default as useSearchFilter } from '../../hooks/useSearchFilter';
export type { UseSearchFilterOptions, UseSearchFilterReturn } from '../../hooks/useSearchFilter';

// Future UI components will be exported here as we create them
// export { default as Button } from './Button';
// export { default as Modal } from './Modal';
// export { default as Card } from './Card';