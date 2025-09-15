import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type BadgeType = 'user' | 'subscription' | 'appointment' | 'payment';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  type: BadgeType;
  status: string;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase();
    
    switch (type) {
      case 'user':
        switch (normalizedStatus) {
          case 'active':
            return {
              label: 'Active',
              color: 'bg-green-50 text-green-700 border-green-200',
              icon: CheckCircleIcon,
              iconColor: 'text-green-500'
            };
          case 'inactive':
            return {
              label: 'Inactive',
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: XCircleIcon,
              iconColor: 'text-gray-500'
            };
          case 'pending':
            return {
              label: 'Pending',
              color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
              icon: ClockIcon,
              iconColor: 'text-yellow-500'
            };
          case 'suspended':
            return {
              label: 'Suspended',
              color: 'bg-red-50 text-red-700 border-red-200',
              icon: ExclamationTriangleIcon,
              iconColor: 'text-red-500'
            };
          default:
            return {
              label: status,
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: null,
              iconColor: ''
            };
        }
      
      case 'subscription':
        switch (normalizedStatus) {
          case 'active':
            return {
              label: 'Active',
              color: 'bg-green-50 text-green-700 border-green-200',
              icon: CheckCircleIcon,
              iconColor: 'text-green-500'
            };
          case 'trial':
            return {
              label: 'Trial',
              color: 'bg-blue-50 text-blue-700 border-blue-200',
              icon: ClockIcon,
              iconColor: 'text-blue-500'
            };
          case 'expired':
            return {
              label: 'Expired',
              color: 'bg-red-50 text-red-700 border-red-200',
              icon: XCircleIcon,
              iconColor: 'text-red-500'
            };
          case 'cancelled':
            return {
              label: 'Cancelled',
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: XCircleIcon,
              iconColor: 'text-gray-500'
            };
          default:
            return {
              label: status,
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: null,
              iconColor: ''
            };
        }
      
      case 'appointment':
        switch (normalizedStatus) {
          case 'scheduled':
            return {
              label: 'Scheduled',
              color: 'bg-blue-50 text-blue-700 border-blue-200',
              icon: ClockIcon,
              iconColor: 'text-blue-500'
            };
          case 'completed':
            return {
              label: 'Completed',
              color: 'bg-green-50 text-green-700 border-green-200',
              icon: CheckCircleIcon,
              iconColor: 'text-green-500'
            };
          case 'cancelled':
            return {
              label: 'Cancelled',
              color: 'bg-red-50 text-red-700 border-red-200',
              icon: XCircleIcon,
              iconColor: 'text-red-500'
            };
          case 'no_show':
            return {
              label: 'No Show',
              color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
              icon: ExclamationTriangleIcon,
              iconColor: 'text-yellow-500'
            };
          default:
            return {
              label: status,
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: null,
              iconColor: ''
            };
        }
      
      case 'payment':
        switch (normalizedStatus) {
          case 'paid':
            return {
              label: 'Paid',
              color: 'bg-green-50 text-green-700 border-green-200',
              icon: CheckCircleIcon,
              iconColor: 'text-green-500'
            };
          case 'pending':
            return {
              label: 'Pending',
              color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
              icon: ClockIcon,
              iconColor: 'text-yellow-500'
            };
          case 'failed':
            return {
              label: 'Failed',
              color: 'bg-red-50 text-red-700 border-red-200',
              icon: XCircleIcon,
              iconColor: 'text-red-500'
            };
          case 'refunded':
            return {
              label: 'Refunded',
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: ExclamationTriangleIcon,
              iconColor: 'text-gray-500'
            };
          default:
            return {
              label: status,
              color: 'bg-gray-50 text-gray-700 border-gray-200',
              icon: null,
              iconColor: ''
            };
        }
      
      default:
        return {
          label: status,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: null,
          iconColor: ''
        };
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${config.color}
      ${sizeClasses[size]}
      ${className}
    `}>
      {showIcon && Icon && (
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      )}
      {config.label}
    </span>
  );
};