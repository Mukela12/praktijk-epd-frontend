import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserCircleIcon,
  BriefcaseIcon,
  LanguageIcon,
  AcademicCapIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

const profileSchema = z.object({
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must not exceed 1000 characters'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  qualifications: z.array(z.string()).optional(),
  years_of_experience: z.number()
    .min(0, 'Years must be 0 or more')
    .max(50, 'Years must be 50 or less'),
  consultation_rate: z.number()
    .min(0, 'Rate must be positive')
    .optional(),
  online_therapy: z.boolean().optional(),
  in_person_therapy: z.boolean().optional(),
  accepts_new_clients: z.boolean().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupStepProps {
  onComplete: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SPECIALIZATION_OPTIONS = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Relationship Issues',
  'Stress Management',
  'Addiction',
  'Eating Disorders',
  'Personality Disorders',
  'Child & Adolescent',
  'Family Therapy',
  'Couples Therapy',
  'Grief & Loss',
  'Career Counseling',
  'Life Transitions'
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Dutch' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' }
];

const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({
  onComplete,
  isLoading,
  error
}) => {
  const [customQualification, setCustomQualification] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      specializations: [],
      languages: [],
      qualifications: [],
      years_of_experience: 0,
      online_therapy: true,
      in_person_therapy: true,
      accepts_new_clients: true
    }
  });

  const watchedSpecializations = watch('specializations') || [];
  const watchedLanguages = watch('languages') || [];
  const watchedQualifications = watch('qualifications') || [];
  const bioLength = watch('bio')?.length || 0;

  const toggleSpecialization = (spec: string) => {
    const current = getValues('specializations') || [];
    if (current.includes(spec)) {
      setValue('specializations', current.filter(s => s !== spec));
    } else {
      setValue('specializations', [...current, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    const current = getValues('languages') || [];
    if (current.includes(lang)) {
      setValue('languages', current.filter(l => l !== lang));
    } else {
      setValue('languages', [...current, lang]);
    }
  };

  const addQualification = () => {
    if (customQualification.trim()) {
      const current = getValues('qualifications') || [];
      setValue('qualifications', [...current, customQualification.trim()]);
      setCustomQualification('');
    }
  };

  const removeQualification = (index: number) => {
    const current = getValues('qualifications') || [];
    setValue('qualifications', current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProfileFormData) => {
    await onComplete(data);
  };

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-4">
          <UserCircleIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="heading-primary text-gray-900 mb-2">
          Complete Your Professional Profile
        </h2>
        <p className="text-body text-gray-600">
          Help clients learn about your expertise and practice
        </p>
      </div>

      {/* Form */}
      <div className="card-premium p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="label-premium flex items-center justify-between">
              <span>Professional Bio</span>
              <span className="text-sm text-gray-500">{bioLength}/1000</span>
            </label>
            <textarea
              {...register('bio')}
              id="bio"
              rows={4}
              className={clsx(
                'input-premium resize-none',
                errors.bio && 'border-red-300 bg-red-50'
              )}
              placeholder="Introduce yourself to potential clients. Describe your approach, experience, and what makes your practice unique..."
            />
            {errors.bio && (
              <p className="form-error mt-1 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Specializations */}
          <div>
            <label className="label-premium flex items-center mb-3">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Areas of Specialization
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <label
                  key={spec}
                  className={clsx(
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                    watchedSpecializations.includes(spec)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={watchedSpecializations.includes(spec)}
                    onChange={() => toggleSpecialization(spec)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{spec}</span>
                  {watchedSpecializations.includes(spec) && (
                    <CheckCircleIcon className="w-4 h-4 ml-auto" />
                  )}
                </label>
              ))}
            </div>
            {errors.specializations && (
              <p className="form-error mt-2 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.specializations.message}
              </p>
            )}
          </div>

          {/* Languages */}
          <div>
            <label className="label-premium flex items-center mb-3">
              <LanguageIcon className="w-5 h-5 mr-2" />
              Languages Spoken
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label
                  key={lang.value}
                  className={clsx(
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                    watchedLanguages.includes(lang.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={watchedLanguages.includes(lang.value)}
                    onChange={() => toggleLanguage(lang.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{lang.label}</span>
                  {watchedLanguages.includes(lang.value) && (
                    <CheckCircleIcon className="w-4 h-4 ml-auto" />
                  )}
                </label>
              ))}
            </div>
            {errors.languages && (
              <p className="form-error mt-2 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1" />
                {errors.languages.message}
              </p>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <label className="label-premium flex items-center mb-3">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Qualifications & Certifications (Optional)
            </label>
            <div className="space-y-2">
              {watchedQualifications.map((qual, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm flex-1">{qual}</span>
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQualification}
                  onChange={(e) => setCustomQualification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                  placeholder="Add a qualification..."
                  className="input-premium flex-1"
                />
                <button
                  type="button"
                  onClick={addQualification}
                  className="btn-premium-secondary px-4"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Experience and Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="years_of_experience" className="label-premium flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Years of Experience
              </label>
              <input
                {...register('years_of_experience', { valueAsNumber: true })}
                type="number"
                id="years_of_experience"
                min="0"
                max="50"
                className={clsx(
                  'input-premium',
                  errors.years_of_experience && 'border-red-300 bg-red-50'
                )}
              />
              {errors.years_of_experience && (
                <p className="form-error mt-1 text-xs">
                  {errors.years_of_experience.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="consultation_rate" className="label-premium flex items-center">
                <CurrencyEuroIcon className="w-5 h-5 mr-2" />
                Hourly Rate (€)
              </label>
              <input
                {...register('consultation_rate', { valueAsNumber: true })}
                type="number"
                id="consultation_rate"
                min="0"
                step="5"
                className={clsx(
                  'input-premium',
                  errors.consultation_rate && 'border-red-300 bg-red-50'
                )}
                placeholder="85"
              />
              {errors.consultation_rate && (
                <p className="form-error mt-1 text-xs">
                  {errors.consultation_rate.message}
                </p>
              )}
            </div>
          </div>

          {/* Therapy Options */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Therapy Options</p>
            <label className="flex items-center">
              <input
                {...register('online_therapy')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">Offer online therapy sessions</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('in_person_therapy')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">Offer in-person therapy sessions</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('accepts_new_clients')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">Currently accepting new clients</span>
            </label>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-premium-primary w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Saving Profile...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Save and Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupStep;