import React, { ReactNode } from 'react';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

export type ViewMode = 'list' | 'create' | 'edit' | 'detail' | 'assign' | 'share';

interface InlineCrudLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showCreateButton?: boolean;
  createButtonText?: string;
  isLoading?: boolean;
  totalCount?: number;
  children: ReactNode;
  onBack?: () => void;
  headerActions?: ReactNode;
  filters?: ReactNode;
}

export const InlineCrudLayout: React.FC<InlineCrudLayoutProps> = ({
  title,
  subtitle,
  icon: Icon,
  viewMode,
  onViewModeChange,
  showCreateButton = true,
  createButtonText,
  isLoading = false,
  totalCount,
  children,
  onBack,
  headerActions,
  filters
}) => {
  const { t } = useTranslation();

  const getViewTitle = () => {
    switch (viewMode) {
      case 'create':
        return `${t('action.create')} ${t('action.new')} ${title}`;
      case 'edit':
        return `${t('action.edit')} ${title}`;
      case 'detail':
        return `${title} ${t('action.details')}`;
      case 'assign':
        return `Assign ${title}`;
      case 'share':
        return `Share ${title}`;
      default:
        return title;
    }
  };

  const getViewSubtitle = () => {
    switch (viewMode) {
      case 'create':
        return `${t('crud.fillForm')} ${title.toLowerCase()}`;
      case 'edit':
        return `${t('crud.updateInfo')} ${title.toLowerCase()}`;
      case 'detail':
        return `${t('crud.viewInfo')} ${title.toLowerCase()}`;
      default:
        return subtitle || (totalCount !== undefined ? `${totalCount} ${t('crud.total')}` : '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white animate-fadeIn">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {viewMode !== 'list' && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                {Icon && <Icon className="w-8 h-8 mr-3" />}
                {getViewTitle()}
              </h1>
              <p className="text-blue-100 mt-1">
                {getViewSubtitle()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {headerActions}
            {viewMode === 'list' && showCreateButton && (
              <button
                onClick={() => onViewModeChange('create')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                <span>{createButtonText || `${t('action.add')} ${title}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {viewMode === 'list' && filters && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {filters}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
      ) : (
        <div className="animate-slideInUp">
          {children}
        </div>
      )}
    </div>
  );
};

// Filter Bar Component
interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  filters,
  actions
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={t('crud.searchPlaceholder')}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {filters}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12">
      <div className="text-center">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Form Section Component
interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// List Item Card Component
interface ListItemCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItemCard: React.FC<ListItemCardProps> = ({
  children,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Action Buttons Component
interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
  isSubmitting?: boolean;
  submitIcon?: React.ComponentType<any>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSubmit,
  cancelText,
  submitText,
  isSubmitting = false,
  submitIcon: SubmitIcon
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end space-x-3 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {cancelText || t('action.cancel')}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="small" className="text-white" />
            <span>{t('crud.saving')}</span>
          </>
        ) : (
          <>
            {SubmitIcon && <SubmitIcon className="w-5 h-5" />}
            <span>{submitText || t('action.save')}</span>
          </>
        )}
      </button>
    </div>
  );
};