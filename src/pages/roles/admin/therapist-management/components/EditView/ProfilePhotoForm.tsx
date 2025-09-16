import React, { useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { Therapist } from '../shared/therapistTypes';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { realApiService } from '@/services/realApi';

interface ProfilePhotoFormProps {
  therapist: Therapist;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

const ProfilePhotoForm: React.FC<ProfilePhotoFormProps> = ({ therapist, onSubmit, isSaving }) => {
  const { addNotification } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null | undefined>(therapist.profile_photo_url);

  const handlePhotoUpdate = async (photoUrl: string | null) => {
    try {
      setIsUploading(true);
      
      if (photoUrl) {
        // Photo was uploaded through ProfilePhotoUpload's internal mechanism
        // We need to manually upload it for the therapist
        console.log('📸 [ProfilePhotoForm] Handling photo update for therapist:', therapist.id);
        
        // Since ProfilePhotoUpload handles its own upload, we just need to update our state
        setCurrentPhotoUrl(photoUrl);
        await onSubmit({ profile_photo_url: photoUrl });
        
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Profile photo updated successfully!',
          duration: 5000
        });
      } else {
        // Photo was deleted
        console.log('🗑️ [ProfilePhotoForm] Deleting photo for therapist:', therapist.id);
        
        const response = await realApiService.admin.deleteTherapistPhoto(therapist.id);
        
        if (response.success) {
          setCurrentPhotoUrl(null);
          await onSubmit({ profile_photo_url: null });
          
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Profile photo removed successfully!',
            duration: 5000
          });
        } else {
          throw new Error(response.message || 'Delete failed');
        }
      }
    } catch (error: any) {
      console.error('❌ [ProfilePhotoForm] Photo update failed:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update profile photo',
        duration: 7000
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload a professional photo for the therapist's profile.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="max-w-sm w-full">
          <ProfilePhotoUpload
            userId={therapist.id}
            currentPhotoUrl={currentPhotoUrl}
            onPhotoUpdate={handlePhotoUpdate}
            size="large"
            editable={!isSaving && !isUploading}
          />
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500 text-center">
              Recommended: Professional headshot
            </p>
            <p className="text-xs text-gray-400 text-center">
              Minimum 400x400px • JPG, PNG, or WebP • Max 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Photo Guidelines */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <CameraIcon className="w-4 h-4 mr-2" />
          Photo Guidelines
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Use a professional, clear headshot</li>
          <li>Ensure good lighting and neutral background</li>
          <li>Face should be clearly visible</li>
          <li>Avoid group photos or distracting elements</li>
          <li>Maintain a professional appearance</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoForm;