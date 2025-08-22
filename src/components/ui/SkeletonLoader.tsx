import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'table-row' | 'custom';
  className?: string;
  count?: number;
  width?: string | number;
  height?: string | number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  className = '', 
  count = 1,
  width,
  height 
}) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return `${baseClass} h-4 w-full`;
      case 'title':
        return `${baseClass} h-8 w-3/4`;
      case 'avatar':
        return `${baseClass} h-12 w-12 rounded-full`;
      case 'button':
        return `${baseClass} h-10 w-24`;
      case 'card':
        return `${baseClass} h-48 w-full`;
      case 'table-row':
        return `${baseClass} h-12 w-full`;
      case 'custom':
        return baseClass;
      default:
        return `${baseClass} h-4 w-full`;
    }
  };

  const skeletonStyle = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`${getSkeletonClass()} ${className}`}
          style={skeletonStyle}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      ))}
    </>
  );
};

// Compound components for common patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <SkeletonLoader type="avatar" className="mb-4" />
    <SkeletonLoader type="title" className="mb-2" />
    <SkeletonLoader type="text" count={3} className="mb-2" />
    <div className="flex space-x-2 mt-4">
      <SkeletonLoader type="button" />
      <SkeletonLoader type="button" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    <div className="p-4">
      <SkeletonLoader type="title" className="mb-4" />
    </div>
    <div className="border-t border-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="border-b border-gray-100 p-4">
          <SkeletonLoader type="table-row" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonForm: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 4, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <SkeletonLoader type="title" className="mb-6" />
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="mb-4">
        <SkeletonLoader type="text" className="w-1/4 mb-2" />
        <SkeletonLoader type="custom" className="h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-2 mt-6">
      <SkeletonLoader type="button" className="w-32" />
      <SkeletonLoader type="button" className="w-32" />
    </div>
  </div>
);

export default SkeletonLoader;