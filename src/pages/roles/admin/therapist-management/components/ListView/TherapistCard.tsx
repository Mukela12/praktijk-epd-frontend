import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Therapist } from '../shared/therapistTypes';
import { useTherapistContext } from '../shared/TherapistContext';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';

interface TherapistCardProps {
  therapist: Therapist;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onView, onEdit }) => {
  const { selectedIds, toggleSelection, loadTherapists } = useTherapistContext();
  const { success, error } = useAlert();
  const isSelected = selectedIds.has(therapist.id);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent row click when clicking on buttons or checkbox
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    onView(therapist.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await realApiService.admin.deleteUser(therapist.id, isPermanentDelete);
      
      if (response.success) {
        success(
          isPermanentDelete 
            ? `Therapist ${therapist.first_name} ${therapist.last_name} permanently deleted` 
            : `Therapist ${therapist.first_name} ${therapist.last_name} deactivated successfully`
        );
        await loadTherapists();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete therapist');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setIsPermanentDelete(false);
    }
  };

  const renderRating = () => {
    if (!therapist.rating) return null;
    
    const fullStars = Math.floor(therapist.rating);
    const hasHalfStar = therapist.rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIconSolid
            key={i}
            className={`w-4 h-4 ${
              i < fullStars ? 'text-yellow-400' : 'text-gray-200'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {therapist.rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <>
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          checked={isSelected}
          onChange={() => toggleSelection(therapist.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Therapist Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {therapist.profile_photo_url ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={therapist.profile_photo_url}
                alt=""
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium text-sm">
                  {therapist.first_name[0]}{therapist.last_name[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {therapist.first_name} {therapist.last_name}
            </div>
            <div className="text-sm text-gray-500">{therapist.email}</div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge
          type={therapist.user_status === 'active' ? 'active' : therapist.user_status === 'inactive' ? 'discontinued' : 'pending'}
          status={therapist.user_status}
          size="sm"
        />
      </td>

      {/* Clients */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {therapist.client_count || 0}
          </span>
          {therapist.accepting_new_clients && (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          )}
        </div>
      </td>

      {/* Specializations */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {therapist.specializations.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {spec}
            </span>
          ))}
          {therapist.specializations.length > 3 && (
            <span className="text-xs text-gray-500">
              +{therapist.specializations.length - 3} more
            </span>
          )}
        </div>
      </td>

      {/* Performance */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {renderRating()}
          {therapist.total_reviews && (
            <div className="text-xs text-gray-500">
              {therapist.total_reviews} reviews
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(therapist.id);
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(therapist.id);
            }}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
            title="Edit Therapist"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete Therapist"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
    
    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => {
        if (!isDeleting) {
          setShowDeleteModal(false);
          setIsPermanentDelete(false);
        }
      }}
      onConfirm={confirmDelete}
      title="Delete Therapist"
      message={`Are you sure you want to ${isPermanentDelete ? 'permanently delete' : 'deactivate'} ${therapist.first_name} ${therapist.last_name}?`}
      confirmText={isDeleting ? (isPermanentDelete ? "Deleting..." : "Deactivating...") : (isPermanentDelete ? "Permanently Delete" : "Deactivate")}
      cancelText="Cancel"
      variant={isPermanentDelete ? "danger" : "warning"}
      showPermanentOption={true}
      isPermanent={isPermanentDelete}
      onPermanentChange={setIsPermanentDelete}
      additionalInfo={
        <>
          {therapist.client_count && therapist.client_count > 0 && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This therapist has {therapist.client_count} assigned client(s).
              </p>
            </div>
          )}
          {isPermanentDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. All data will be permanently deleted.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Deactivating will set the therapist's status to inactive. They can be reactivated later.
            </p>
          )}
        </>
      }
    />
    </>
  );
};

export default TherapistCard;