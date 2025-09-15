import React from 'react';

export const DiagnosticInfo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-yellow-800 mb-2">Therapist Management v2.0</h3>
      <p className="text-sm text-yellow-700">New modular system loaded</p>
      <p className="text-xs text-yellow-600 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};