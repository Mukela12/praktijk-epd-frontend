import React, { useState } from 'react';
import { 
  TrashIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useTherapistContext } from '../shared/TherapistContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAlert } from '@/components/ui/CustomAlert';

const BulkActions: React.FC = () => {
  const { 
    selectedIds, 
    clearSelection,
    bulkUpdateStatus,
    bulkDelete,
    exportTherapists
  } = useTherapistContext();
  
  const { info } = useAlert();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');

  const selectedCount = selectedIds.size;

  const handleStatusChange = async () => {
    await bulkUpdateStatus(Array.from(selectedIds), newStatus);
    setShowStatusModal(false);
  };

  const handleDelete = async () => {
    await bulkDelete(Array.from(selectedIds), isPermanentDelete);
    setShowDeleteModal(false);
    setIsPermanentDelete(false);
  };

  const handleExport = async () => {
    await exportTherapists(Array.from(selectedIds));
  };

  const handleAssignClients = () => {
    info('Bulk client assignment feature coming soon');
  };

  return (
    <>
      <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between animate-slideIn">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} therapist{selectedCount > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Activate Button */}
          <button
            onClick={() => {
              setNewStatus('active');
              setShowStatusModal(true);
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
            Activate
          </button>

          {/* Deactivate Button */}
          <button
            onClick={() => {
              setNewStatus('inactive');
              setShowStatusModal(true);
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            <XCircleIcon className="w-4 h-4 mr-1.5" />
            Deactivate
          </button>

          {/* Assign Clients Button */}
          <button
            onClick={handleAssignClients}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <UserGroupIcon className="w-4 h-4 mr-1.5" />
            Assign Clients
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
            Export
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Change Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
        title={`Change Status to ${newStatus === 'active' ? 'Active' : 'Inactive'}`}
        message={`Are you sure you want to change the status of ${selectedCount} therapist${selectedCount > 1 ? 's' : ''} to ${newStatus}?`}
        confirmText="Change Status"
        variant="warning"
        icon={ArrowPathIcon}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Therapists"
        message={`Are you sure you want to ${isPermanentDelete ? 'permanently delete' : 'deactivate'} ${selectedCount} therapist${selectedCount > 1 ? 's' : ''}?`}
        confirmText={isPermanentDelete ? "Permanently Delete" : "Deactivate"}
        variant="danger"
        icon={TrashIcon}
        showPermanentOption={true}
        isPermanent={isPermanentDelete}
        onPermanentChange={setIsPermanentDelete}
        additionalInfo={
          isPermanentDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. All data associated with these therapists will be permanently deleted.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-3">
              Deactivating will set the therapists' status to inactive. They can be reactivated later.
            </p>
          )
        }
      />
    </>
  );
};

export default BulkActions;