import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const OldVersionWarning: React.FC = () => {
  return (
    <div className="mb-6 bg-red-50 border-2 border-red-400 rounded-lg p-4">
      <div className="flex items-center">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
        <div>
          <h3 className="font-bold text-red-800">Old Version Warning</h3>
          <p className="text-red-700">This is the OLD therapist management system. Please navigate to <strong>/admin/therapists</strong> for the new version.</p>
        </div>
      </div>
    </div>
  );
};