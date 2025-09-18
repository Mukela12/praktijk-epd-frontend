import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  DocumentArrowDownIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useClientContext } from '../shared/ClientContext';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumButton, PremiumCard } from '@/components/layout/PremiumLayout';

const BulkActions: React.FC = () => {
  const { selectedIds, therapists, assignTherapist, bulkUpdateStatus } = useClientContext();
  const { success, error, confirm } = useAlert();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  
  const selectedCount = selectedIds.size;
  
  const handleAssignTherapist = async () => {
    if (!selectedTherapistId) {
      error('Please select a therapist');
      return;
    }
    
    const confirmed = await confirm(
      `Are you sure you want to assign ${selectedCount} client(s) to this therapist?`
    );
    
    if (!confirmed) return;
    
    // Process assignments one by one
    let successCount = 0;
    for (const clientId of selectedIds) {
      const result = await assignTherapist(clientId, selectedTherapistId);
      if (result) successCount++;
    }
    
    if (successCount === selectedCount) {
      success(`All ${selectedCount} client(s) assigned successfully`);
    } else if (successCount > 0) {
      error(`Only ${successCount} out of ${selectedCount} assignments succeeded`);
    } else {
      error('Failed to assign clients');
    }
    
    setShowAssignModal(false);
    setSelectedTherapistId('');
  };
  
  const handleBulkStatusUpdate = async (status: string) => {
    const confirmed = await confirm(
      `Are you sure you want to update the status of ${selectedCount} client(s) to ${status}?`
    );
    
    if (!confirmed) return;
    
    const clientIds = Array.from(selectedIds);
    const result = await bulkUpdateStatus(clientIds, status);
    
    if (result) {
      success(`${selectedCount} client(s) updated successfully`);
    }
  };
  
  const handleExport = () => {
    // TODO: Implement export functionality
    success('Export functionality coming soon');
  };
  
  const handleBulkEmail = () => {
    // TODO: Implement bulk email functionality
    success('Bulk email functionality coming soon');
  };
  
  return (
    <>
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              <strong>{selectedCount}</strong> client(s) selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <PremiumButton
              size="sm"
              variant="outline"
              icon={UserGroupIcon}
              onClick={() => setShowAssignModal(true)}
            >
              Assign Therapist
            </PremiumButton>
            
            <PremiumButton
              size="sm"
              variant="outline"
              icon={CheckCircleIcon}
              onClick={() => handleBulkStatusUpdate('active')}
            >
              Activate
            </PremiumButton>
            
            <PremiumButton
              size="sm"
              variant="outline"
              icon={XCircleIcon}
              onClick={() => handleBulkStatusUpdate('inactive')}
            >
              Deactivate
            </PremiumButton>
            
            <PremiumButton
              size="sm"
              variant="outline"
              icon={EnvelopeIcon}
              onClick={handleBulkEmail}
            >
              Send Email
            </PremiumButton>
            
            <PremiumButton
              size="sm"
              variant="outline"
              icon={DocumentArrowDownIcon}
              onClick={handleExport}
            >
              Export
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
      
      {/* Assign Therapist Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Assign Therapist
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Select a therapist to assign to {selectedCount} selected client(s)
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <select
                      value={selectedTherapistId}
                      onChange={(e) => setSelectedTherapistId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select a therapist...</option>
                      {therapists.map(therapist => (
                        <option key={therapist.id} value={therapist.id}>
                          Dr. {therapist.first_name} {therapist.last_name} 
                          ({therapist.current_clients || 0} clients)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <PremiumButton
                  variant="danger"
                  onClick={handleAssignTherapist}
                  className="sm:col-start-2"
                >
                  Assign
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  className="mt-3 sm:mt-0 sm:col-start-1"
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;