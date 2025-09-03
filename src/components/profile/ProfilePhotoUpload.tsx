import React, { useState, useRef, useEffect } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth, useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';

interface ProfilePhotoUploadProps {
  userId?: string;
  currentPhotoUrl?: string | null;
  onPhotoUpdate?: (photoUrl: string | null) => void;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
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
    xsmall: 'w-8 h-8',
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const iconSizes = {
    xsmall: 'w-4 h-4',
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

      // If admin is editing another user's photo
      if (userId && userId !== user?.id && user?.role === 'admin') {
        // Use the admin upload endpoint
        const response = await realApiService.admin.uploadTherapistPhoto(userId, file);
        
        if (response.success && response.data) {
          setPhotoUrl(response.data.photoUrl);
          setPreview(null);
          success(t('profile.photo.uploadSuccess') || 'Profile photo updated successfully');
          onPhotoUpdate?.(response.data.photoUrl);
          
          // No need to update auth store for other users
        }
      } else {
        // Regular user uploading their own photo
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

      // If admin is deleting another user's photo
      if (userId && userId !== user?.id && user?.role === 'admin') {
        const response = await realApiService.admin.deleteTherapistPhoto(userId);
        
        if (response.success) {
          setPhotoUrl(null);
          setPreview(null);
          success(t('profile.photo.deleteSuccess') || 'Profile photo deleted successfully');
          onPhotoUpdate?.(null);
        }
      } else {
        // Regular user deleting their own photo
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
  const isAdmin = user?.role === 'admin';
  const canEdit = editable && (isOwnProfile || isAdmin);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo Display */}
      <div className="relative group">
        <div className={`
          ${sizeClasses[size]} rounded-full overflow-hidden
          ${size !== 'xsmall' ? 'ring-4 ring-white shadow-2xl' : 'ring-2 ring-gray-200 shadow-md'}
          ${canEdit && !isLoading ? 'group-hover:ring-red-400 group-hover:shadow-red-200' : ''}
          transition-all duration-300 transform group-hover:scale-105
          bg-gradient-to-br from-gray-50 to-gray-100
        `}>
          {isLoadingPhoto ? (
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-rose-400 animate-spin" style={{ padding: '2px' }}>
                  <div className="w-full h-full rounded-full bg-white"></div>
                </div>
                <LoadingSpinner size="small" />
              </div>
            </div>
          ) : preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50"></div>
            </div>
          ) : photoUrl ? (
            <div className="relative w-full h-full">
              <img
                src={photoUrl}
                alt={t('profile.photo.alt') || 'Profile photo'}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
              <UserCircleIcon className={`${iconSizes[size]} text-red-300 opacity-70`} />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        {canEdit && !isLoading && size !== 'xsmall' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl hover:shadow-red-500/25 transform hover:scale-110 transition-all duration-200 border border-white/50"
                title={t('profile.photo.upload') || 'Upload photo'}
              >
                <CameraIcon className="w-6 h-6 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <LoadingSpinner size="small" />
              <p className="text-xs text-gray-600 mt-2 font-medium">Uploading...</p>
            </div>
          </div>
        )}

        {/* Status Badge for Size > xsmall */}
        {size !== 'xsmall' && photoUrl && canEdit && (
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
            <CheckCircleIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="animate-shake bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      {canEdit && size !== 'xsmall' && (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-red-600 transition duration-300 ease-out border-2 border-red-600 rounded-full shadow-md hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-red-600 group-hover:translate-x-0 ease">
              <ArrowUpTrayIcon className="w-5 h-5" />
            </span>
            <span className="absolute flex items-center justify-center w-full h-full text-red-600 transition-all duration-300 transform group-hover:translate-x-full ease">
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              {t('profile.photo.upload') || 'Upload Photo'}
            </span>
            <span className="relative invisible">
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              {t('profile.photo.upload') || 'Upload Photo'}
            </span>
          </button>

          {photoUrl && (
            <button
              onClick={handleDeletePhoto}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-red-600 transition duration-300 ease-out border-2 border-red-600 rounded-full shadow-md hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-red-600 group-hover:translate-x-0 ease">
                <TrashIcon className="w-5 h-5" />
              </span>
              <span className="absolute flex items-center justify-center w-full h-full text-red-600 transition-all duration-300 transform group-hover:translate-x-full ease">
                <TrashIcon className="w-4 h-4 mr-2" />
                {t('profile.photo.delete') || 'Delete'}
              </span>
              <span className="relative invisible">
                <TrashIcon className="w-4 h-4 mr-2" />
                {t('profile.photo.delete') || 'Delete'}
              </span>
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
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-rose-400 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">
              {t('profile.photo.helpText') || 'Upload a professional photo. Images will be automatically cropped to a square. Maximum file size: 5MB.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;