import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeStepProps {
  onComplete: (data: PasswordFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PasswordChangeStep: React.FC<PasswordChangeStepProps> = ({
  onComplete,
  isLoading,
  error
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const newPassword = watch('newPassword');

  // Password strength requirements
  const requirements = [
    { regex: /.{8,}/, text: 'At least 8 characters', met: newPassword?.length >= 8 },
    { regex: /[A-Z]/, text: 'One uppercase letter', met: /[A-Z]/.test(newPassword || '') },
    { regex: /[a-z]/, text: 'One lowercase letter', met: /[a-z]/.test(newPassword || '') },
    { regex: /[0-9]/, text: 'One number', met: /[0-9]/.test(newPassword || '') },
    { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, text: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword || '') }
  ];

  const onSubmit = async (data: PasswordFormData) => {
    await onComplete(data);
  };

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-4">
          <LockClosedIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="heading-primary text-gray-900 mb-2">
          Change Your Password
        </h2>
        <p className="text-body text-gray-600">
          For your security, please create a new password to replace the temporary one
        </p>
      </div>

      {/* Form */}
      <div className="card-premium p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="label-premium">
              Current Password (Temporary)
            </label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                className={clsx(
                  'input-premium pr-12',
                  errors.currentPassword && 'border-red-300 bg-red-50'
                )}
                placeholder="Enter your temporary password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="form-error mt-1 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="label-premium">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                className={clsx(
                  'input-premium pr-12',
                  errors.newPassword && 'border-red-300 bg-red-50'
                )}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="form-error mt-1 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.newPassword.message}
              </p>
            )}

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-3 space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {req.met ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="label-premium">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={clsx(
                  'input-premium pr-12',
                  errors.confirmPassword && 'border-red-300 bg-red-50'
                )}
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error mt-1 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center">
                <XCircleIcon className="w-5 h-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>Your password is encrypted and stored securely. Make sure to remember it as you'll need it for future logins.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-premium-primary w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Changing Password...</span>
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeStep;