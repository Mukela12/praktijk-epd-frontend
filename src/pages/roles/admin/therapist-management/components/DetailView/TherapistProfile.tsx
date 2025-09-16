import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import OverviewTab from './OverviewTab';
import ClientsTab from './ClientsTab';
import ScheduleTab from './ScheduleTab';
import ActivityTab from './ActivityTab';
import { realApiService } from '@/services/realApi';
import { useNotifications } from '@/components/ui/NotificationProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Therapist, TherapistStatus } from '../shared/therapistTypes';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { transformBackendToTherapist } from '../shared/dataTransformers';

const TherapistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTherapistDetails();
    }
  }, [id]);

  const loadTherapistDetails = async () => {
    try {
      setLoading(true);
      const response = await realApiService.admin.getTherapistById(id!);
      if (response.success && response.data) {
        const therapistData = transformBackendToTherapist(response.data);
        setTherapist(therapistData);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load therapist details',
        duration: 7000
      });
      navigate('/admin/therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/therapists/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!therapist) return;
    
    try {
      setIsDeleting(true);
      const response = await realApiService.admin.deleteUser(therapist.id);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: isPermanentDelete ? 'Therapist permanently deleted' : 'Therapist deactivated successfully',
          duration: 5000
        });
        navigate('/admin/therapists');
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete therapist',
        duration: 7000
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Not Found</h2>
          <p className="text-gray-600 mb-4">The therapist you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/therapists')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/admin/therapists')}
            className="inline-flex items-center py-4 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Therapists
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader 
        therapist={therapist}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Tab Navigation */}
      <ProfileTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        therapistId={therapist.id}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab therapist={therapist} />}
        {activeTab === 'clients' && <ClientsTab therapistId={therapist.id} />}
        {activeTab === 'schedule' && <ScheduleTab therapistId={therapist.id} />}
        {activeTab === 'activity' && <ActivityTab therapistId={therapist.id} />}
      </div>

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
                  <strong>Warning:</strong> This action cannot be undone. All data associated with this therapist will be permanently deleted.
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
    </div>
  );
};

export default TherapistProfile;