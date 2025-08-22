import React, { useState, useRef, useEffect } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth, useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';

interface ProfilePhotoUploadProps {
  userId?: string;
  currentPhotoUrl?: string | null;
  onPhotoUpdate?: (photoUrl: string | null) => void;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  userId,
  currentPhotoUrl,
  onPhotoUpdate,
  size = 'medium',
  editable = true
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, error: errorAlert, warning } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Size classes
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  // Load photo on mount
  useEffect(() => {
    if (userId || user?.id) {
      loadPhoto();
    }
  }, [userId, user?.id]);

  const loadPhoto = async () => {
    try {
      setIsLoadingPhoto(true);
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const response = await realApiService.profile.getPhoto(targetUserId);
      if (response.success && response.data) {
        setPhotoUrl(response.data.photoUrl);
      }
    } catch (error) {
      console.error('Failed to load profile photo:', error);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('profile.photo.invalidType') || 'Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(t('profile.photo.tooLarge') || 'Image must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await realApiService.profile.uploadPhoto(file);
      
      if (response.success && response.data) {
        setPhotoUrl(response.data.photoUrl);
        setPreview(null);
        success(t('profile.photo.uploadSuccess') || 'Profile photo updated successfully');
        onPhotoUpdate?.(response.data.photoUrl);
        
        // Update user in auth store if it's the current user
        if (!userId || userId === user?.id) {
          user && useAuthStore.getState().updateUser({ profile_photo_url: response.data.photoUrl });
        }
      }
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      setError(error.response?.data?.message || t('profile.photo.uploadError') || 'Failed to upload photo');
      setPreview(null);
      errorAlert(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm(t('profile.photo.deleteConfirm') || 'Are you sure you want to delete your profile photo?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await realApiService.profile.deletePhoto();
      
      if (response.success) {
        setPhotoUrl(null);
        setPreview(null);
        success(t('profile.photo.deleteSuccess') || 'Profile photo deleted successfully');
        onPhotoUpdate?.(null);
        
        // Update user in auth store if it's the current user
        if (!userId || userId === user?.id) {
          user && useAuthStore.getState().updateUser({ profile_photo_url: undefined });
        }
      }
    } catch (error: any) {
      console.error('Failed to delete photo:', error);
      setError(error.response?.data?.message || t('profile.photo.deleteError') || 'Failed to delete photo');
      errorAlert(error.response?.data?.message || 'Failed to delete photo');
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnProfile = !userId || userId === user?.id;
  const canEdit = editable && isOwnProfile;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo Display */}
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl`}>
          {isLoadingPhoto ? (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingSpinner size="small" />
            </div>
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt={t('profile.photo.alt') || 'Profile photo'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <UserCircleIcon className={`${iconSizes[size]} text-gray-400`} />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        {canEdit && !isLoading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                title={t('profile.photo.upload') || 'Upload photo'}
              >
                <CameraIcon className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationCircleIcon className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>{t('profile.photo.upload') || 'Upload Photo'}</span>
          </button>

          {photoUrl && (
            <button
              onClick={handleDeletePhoto}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              <span>{t('profile.photo.delete') || 'Delete'}</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      {canEdit && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          {t('profile.photo.helpText') || 'Upload a professional photo. Images will be automatically cropped to a square. Maximum file size: 5MB.'}
        </p>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;