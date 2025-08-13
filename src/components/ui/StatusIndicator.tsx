import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ClockIcon as ClockSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  XCircleIcon as XCircleSolid,
  CalendarIcon as CalendarSolid,
  UserIcon as UserSolid,
  CurrencyEuroIcon as CurrencyEuroSolid,
  DocumentTextIcon as DocumentTextSolid
} from '@heroicons/react/24/solid';

// Type definitions for all status types
export type ClientStatus = 'new' | 'viewed' | 'scheduled' | 'starting' | 'active' | 'discontinued' | 'completed' | 'archived';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
export type WaitingListStatus = 'new' | 'read' | 'contacted' | 'phoned' | 'emailed' | 'intake_planned' | 'assigned';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'vacation';

export type StatusType = 'client' | 'appointment' | 'priority' | 'invoice' | 'task' | 'waiting_list' | 'user';

// Comprehensive color configuration based on Natalie's specifications
export const statusColors = {
  client: {
    new: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    viewed: 'bg-blue-100 text-blue-800 border-blue-200',
    scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
    starting: 'bg-orange-100 text-orange-800 border-orange-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    discontinued: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    archived: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  appointment: {
    scheduled: 'bg-sky-100 text-sky-800 border-sky-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-violet-100 text-violet-800 border-violet-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    no_show: 'bg-amber-100 text-amber-800 border-amber-200',
    rescheduled: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  priority: {
    low: 'bg-gray-100 text-gray-800 border-gray-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
    critical: 'bg-red-200 text-red-900 border-red-300'
  },
  invoice: {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    sent: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-200 text-gray-600 border-gray-300'
  },
  task: {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    waiting: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  waiting_list: {
    new: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    read: 'bg-blue-100 text-blue-800 border-blue-200',
    contacted: 'bg-purple-100 text-purple-800 border-purple-200',
    phoned: 'bg-green-100 text-green-800 border-green-200',
    emailed: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    intake_planned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    assigned: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  user: {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    vacation: 'bg-blue-100 text-blue-800 border-blue-200'
  }
} as const;

// Icon mapping for different status types
const getStatusIcon = (type: StatusType, status: string, variant: 'outline' | 'solid' = 'outline') => {
  const IconComponent = variant === 'solid';
  
  switch (type) {
    case 'client':
      switch (status as ClientStatus) {
        case 'new': return IconComponent ? UserSolid : UserIcon;
        case 'viewed': return IconComponent ? DocumentTextSolid : DocumentTextIcon;
        case 'scheduled': return IconComponent ? CalendarSolid : CalendarIcon;
        case 'starting': return IconComponent ? ClockSolid : ClockIcon;
        case 'active': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'discontinued': return IconComponent ? XCircleSolid : XCircleIcon;
        case 'completed': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'archived': return IconComponent ? DocumentTextSolid : DocumentTextIcon;
        default: return IconComponent ? UserSolid : UserIcon;
      }
    
    case 'appointment':
      switch (status as AppointmentStatus) {
        case 'scheduled': return IconComponent ? CalendarSolid : CalendarIcon;
        case 'confirmed': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'completed': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'cancelled': return IconComponent ? XCircleSolid : XCircleIcon;
        case 'no_show': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        case 'rescheduled': return IconComponent ? ClockSolid : ClockIcon;
        default: return IconComponent ? CalendarSolid : CalendarIcon;
      }
    
    case 'priority':
      switch (status as PriorityLevel) {
        case 'low': return IconComponent ? ClockSolid : ClockIcon;
        case 'normal': return QuestionMarkCircleIcon;
        case 'high': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        case 'urgent': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        case 'critical': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        default: return QuestionMarkCircleIcon;
      }
    
    case 'invoice':
      switch (status as InvoiceStatus) {
        case 'draft': return IconComponent ? DocumentTextSolid : DocumentTextIcon;
        case 'sent': return EnvelopeIcon;
        case 'paid': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'overdue': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        case 'cancelled': return IconComponent ? XCircleSolid : XCircleIcon;
        default: return IconComponent ? CurrencyEuroSolid : CurrencyEuroIcon;
      }
    
    case 'task':
      switch (status as TaskStatus) {
        case 'pending': return IconComponent ? ClockSolid : ClockIcon;
        case 'in_progress': return IconComponent ? DocumentTextSolid : DocumentTextIcon;
        case 'waiting': return IconComponent ? ClockSolid : ClockIcon;
        case 'completed': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'cancelled': return IconComponent ? XCircleSolid : XCircleIcon;
        default: return IconComponent ? DocumentTextSolid : DocumentTextIcon;
      }
    
    case 'waiting_list':
      switch (status as WaitingListStatus) {
        case 'new': return IconComponent ? UserSolid : UserIcon;
        case 'read': return IconComponent ? DocumentTextSolid : DocumentTextIcon;
        case 'contacted': return PhoneIcon;
        case 'phoned': return PhoneIcon;
        case 'emailed': return EnvelopeIcon;
        case 'intake_planned': return IconComponent ? CalendarSolid : CalendarIcon;
        case 'assigned': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        default: return IconComponent ? UserSolid : UserIcon;
      }
    
    case 'user':
      switch (status as UserStatus) {
        case 'active': return IconComponent ? CheckCircleSolid : CheckCircleIcon;
        case 'inactive': return IconComponent ? XCircleSolid : XCircleIcon;
        case 'pending': return IconComponent ? ClockSolid : ClockIcon;
        case 'suspended': return IconComponent ? ExclamationTriangleSolid : ExclamationTriangleIcon;
        case 'vacation': return IconComponent ? ClockSolid : ClockIcon;
        default: return IconComponent ? UserSolid : UserIcon;
      }
    
    default:
      return QuestionMarkCircleIcon;
  }
};

// Helper function to get human-readable status text
const getStatusText = (type: StatusType, status: string): string => {
  const statusMap = {
    client: {
      new: 'New Client',
      viewed: 'Viewed',
      scheduled: 'Scheduled',
      starting: 'Starting',
      active: 'Active',
      discontinued: 'Discontinued',
      completed: 'Completed',
      archived: 'Archived'
    },
    appointment: {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show',
      rescheduled: 'Rescheduled'
    },
    priority: {
      low: 'Low Priority',
      normal: 'Normal',
      high: 'High Priority',
      urgent: 'Urgent',
      critical: 'Critical'
    },
    invoice: {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled'
    },
    task: {
      pending: 'Pending',
      in_progress: 'In Progress',
      waiting: 'Waiting',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },
    waiting_list: {
      new: 'New Application',
      read: 'Read',
      contacted: 'Contacted',
      phoned: 'Called',
      emailed: 'Emailed',
      intake_planned: 'Intake Planned',
      assigned: 'Assigned'
    },
    user: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      suspended: 'Suspended',
      vacation: 'On Vacation'
    }
  };

  return statusMap[type]?.[status as keyof typeof statusMap[typeof type]] || status.replace('_', ' ');
};

// Main StatusIndicator component
export interface StatusIndicatorProps {
  type: StatusType;
  status: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'solid' | 'outline' | 'minimal';
  showIcon?: boolean;
  showText?: boolean;
  iconVariant?: 'outline' | 'solid';
  className?: string;
  onClick?: () => void;
  tooltip?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showText = true,
  iconVariant = 'outline',
  className = '',
  onClick,
  tooltip
}) => {
  // Get the appropriate color class
  const typeColors = statusColors[type];
  const colorClass = (typeColors && status in typeColors) 
    ? typeColors[status as keyof typeof typeColors]
    : 'bg-gray-100 text-gray-800 border-gray-200';
  
  // Size configurations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Variant configurations
  const variantClasses = {
    default: `inline-flex items-center rounded-full font-medium border ${colorClass}`,
    solid: `inline-flex items-center rounded-full font-medium ${colorClass.split(' ').map(cls => {
      if (cls.startsWith('bg-')) return cls.replace('100', '500');
      if (cls.startsWith('text-')) return 'text-white';
      if (cls.startsWith('border-')) return cls.replace('border-', 'bg-').replace('200', '500');
      return cls;
    }).join(' ')}`,
    outline: `inline-flex items-center rounded-full font-medium border-2 bg-transparent ${colorClass.split(' ').map(cls => {
      if (cls.startsWith('bg-')) return cls.replace('bg-', 'border-').replace('100', '500');
      return cls;
    }).join(' ')}`,
    minimal: `inline-flex items-center font-medium ${colorClass.split(' ').map(cls => {
      if (cls.startsWith('bg-')) return '';
      if (cls.startsWith('border-')) return '';
      if (cls.startsWith('text-')) return cls.replace('800', '600');
      return cls;
    }).filter(Boolean).join(' ')}`
  };

  // Get the icon component
  const IconComponent = getStatusIcon(type, status, iconVariant);
  const statusText = getStatusText(type, status);

  const baseClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {showIcon && IconComponent && (
        <IconComponent className={`${iconSizes[size]} ${showText ? 'mr-1.5' : ''}`} />
      )}
      {showText && (
        <span className="font-medium">{statusText}</span>
      )}
    </>
  );

  if (tooltip) {
    return (
      <span
        className={baseClasses}
        onClick={onClick}
        title={tooltip}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      >
        {content}
      </span>
    );
  }

  return (
    <span
      className={baseClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {content}
    </span>
  );
};

// Utility function to get status color for custom components
export const getStatusColor = (type: StatusType, status: string): string => {
  return statusColors[type]?.[status as keyof typeof statusColors[typeof type]] || 
         'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper component for status lists/filters
export interface StatusFilterProps {
  type: StatusType;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  className?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  type,
  selectedStatuses,
  onStatusChange,
  className = ''
}) => {
  const availableStatuses = Object.keys(statusColors[type] || {});

  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusToggle(status)}
          className={`transition-all duration-200 ${
            selectedStatuses.includes(status) 
              ? 'ring-2 ring-blue-500 ring-offset-1' 
              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
          }`}
        >
          <StatusIndicator
            type={type}
            status={status}
            size="sm"
            variant={selectedStatuses.includes(status) ? 'solid' : 'default'}
          />
        </button>
      ))}
    </div>
  );
};

// Helper component for status counts/statistics
export interface StatusStatsProps {
  type: StatusType;
  counts: Record<string, number>;
  showPercentages?: boolean;
  className?: string;
}

export const StatusStats: React.FC<StatusStatsProps> = ({
  type,
  counts,
  showPercentages = false,
  className = ''
}) => {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {Object.entries(counts).map(([status, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return (
          <div key={status} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <StatusIndicator
                type={type}
                status={status}
                size="sm"
                showText={false}
              />
              <span className="text-sm font-medium text-gray-900">
                {getStatusText(type, status)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              {showPercentages && (
                <div className="text-xs text-gray-500">{percentage}%</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusIndicator;