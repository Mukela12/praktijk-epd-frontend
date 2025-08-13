import React from 'react';
import { motion } from 'framer-motion';

// Premium Card Component
interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  border?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  border
}) => {
  const borderColors = {
    primary: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    danger: 'border-l-red-500',
    info: 'border-l-indigo-500'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6 
        ${hover ? 'transition-all duration-200 cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
        ${border ? `border-l-4 ${borderColors[border]}` : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// Premium Metric Card
interface PremiumMetricProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ComponentType<any>;
  iconColor: string;
  isLoading?: boolean;
}

export const PremiumMetric: React.FC<PremiumMetricProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  isLoading
}) => {
  return (
    <PremiumCard hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              {change && (
                <div className={`flex items-center text-sm font-medium ${
                  change.type === 'positive' ? 'text-green-600' : 
                  change.type === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <span>{change.value}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent via-transparent to-gray-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
    </PremiumCard>
  );
};

// Premium Status Badge
interface StatusBadgeProps {
  status: string;
  type?: 'new' | 'viewed' | 'scheduled' | 'starting' | 'active' | 'discontinued' | 'paid' | 'partial' | 'overdue' | 'collection' | 'legal' | 'pending' | 'suspended' | 'processing';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const typeStyles = {
    new: 'bg-white text-gray-800 border border-gray-300',
    viewed: 'bg-yellow-500 text-white',
    scheduled: 'bg-blue-500 text-white',
    starting: 'bg-purple-500 text-white',
    active: 'bg-green-500 text-white',
    discontinued: 'bg-red-500 text-white',
    paid: 'bg-green-500 text-white',
    partial: 'bg-yellow-500 text-white',
    overdue: 'bg-orange-500 text-white',
    collection: 'bg-red-500 text-white',
    legal: 'bg-black text-white',
    pending: 'bg-blue-500 text-white',
    suspended: 'bg-purple-500 text-white',
    processing: 'bg-white text-gray-800 border border-gray-300'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium uppercase tracking-wide
      ${sizeClasses[size]}
      ${type ? typeStyles[type] : 'bg-gray-100 text-gray-800'}
    `}>
      {status}
    </span>
  );
};

// Premium Button
interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<any>;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-xl',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </motion.button>
  );
};

// Premium List Item
interface PremiumListItemProps {
  children: React.ReactNode;
  avatar?: {
    initials: string;
    color?: string;
  };
  status?: StatusBadgeProps;
  actions?: React.ReactNode;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  onClick?: () => void;
}

export const PremiumListItem: React.FC<PremiumListItemProps> = ({
  children,
  avatar,
  status,
  actions,
  priority,
  onClick
}) => {
  const priorityColors = {
    urgent: 'border-l-red-500',
    high: 'border-l-orange-500',
    normal: 'border-l-blue-500',
    low: 'border-l-gray-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 mb-3 transition-all duration-200
        ${priority ? `border-l-4 ${priorityColors[priority]}` : ''}
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center space-x-4">
        {avatar && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${avatar.color || 'bg-blue-500'}`}>
            {avatar.initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        <div className="flex items-center space-x-3">
          {status && <StatusBadge {...status} />}
          {actions}
        </div>
      </div>
    </motion.div>
  );
};

// Premium Table
interface PremiumTableProps {
  headers: string[];
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export const PremiumTable: React.FC<PremiumTableProps> = ({
  headers,
  children,
  title,
  actions
}) => {
  return (
    <PremiumCard className="p-0 overflow-hidden">
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {actions}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
};

// Premium Empty State
interface PremiumEmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 p-3 bg-gray-100 rounded-full">
        <Icon className="w-10 h-10 text-gray-400 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <PremiumButton onClick={action.onClick} variant="primary">
          {action.label}
        </PremiumButton>
      )}
    </div>
  );
};