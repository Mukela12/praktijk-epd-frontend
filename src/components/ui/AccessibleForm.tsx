import React, { FormEvent, ReactNode } from 'react';

interface AccessibleFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  noValidate?: boolean;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  onSubmit,
  children,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  noValidate = false
}) => {
  return (
    <form
      onSubmit={onSubmit}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
      noValidate={noValidate}
      role="form"
    >
      {children}
    </form>
  );
};

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId}
        className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
      >
        {label}
      </label>
      
      <input
        id={inputId}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      <span className="flex items-center justify-center">
        {loading && (
          <svg 
            className="animate-spin h-4 w-4 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        
        <span>{loading ? loadingText : children}</span>
        
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="h-4 w-4 ml-2" aria-hidden="true" />
        )}
      </span>
    </button>
  );
};

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  helperText?: string;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  label,
  options,
  error,
  helperText,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={selectId}
        className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
      >
        {label}
      </label>
      
      <select
        id={selectId}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  label,
  error,
  helperText,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={textareaId}
        className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
      >
        {label}
      </label>
      
      <textarea
        id={textareaId}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Skip link for keyboard navigation
export const SkipToMainContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
};

// Focus trap for modals
export const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
};