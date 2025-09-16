import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import BasicInfoStep from './BasicInfoStep';
import ProfessionalInfoStep from './ProfessionalInfoStep';
import ServiceSettingsStep from './ServiceSettingsStep';
import ReviewStep from './ReviewStep';
import { realApiService } from '@/services/realApi';
import { useNotifications } from '@/components/ui/NotificationProvider';

interface TherapistFormData {
  // Basic Info
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  
  // Professional Info
  license_number?: string;
  years_of_experience?: number;
  specializations: string[];
  therapy_types?: string[];
  languages: string[];
  bio?: string;
  qualifications: string[];
  
  // Business Info
  kvk_number?: string;
  big_number?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  
  // Service Settings
  hourly_rate?: number;
  session_duration?: number;
  break_between_sessions?: number;
  online_therapy?: boolean;
  in_person_therapy?: boolean;
  max_clients?: number;
  
  // Availability
  availability?: {
    [key: string]: { start: string; end: string; enabled: boolean };
  };
}

const CreateWizard: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TherapistFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specializations: [],
    therapy_types: [], // Initialize therapy types
    languages: [],
    qualifications: [],
    session_duration: 60,
    break_between_sessions: 15,
    online_therapy: true,
    in_person_therapy: true,
    max_clients: 20
  });

  const steps = [
    { number: 1, name: 'Basic Information', description: 'Personal details' },
    { number: 2, name: 'Professional Info', description: 'Qualifications & experience' },
    { number: 3, name: 'Service Settings', description: 'Rates & availability' },
    { number: 4, name: 'Review', description: 'Confirm details' }
  ];

  const updateFormData = (data: Partial<TherapistFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🆕 [CreateWizard] Creating therapist with data:', formData);
    
    try {
      setIsSubmitting(true);
      
      // Create user first
      const userPayload = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: 'therapist'
      };
      
      console.log('📤 [CreateWizard] Creating user:', userPayload);
      
      const userResponse = await realApiService.admin.createUser(userPayload);
      
      console.log('📥 [CreateWizard] User creation response:', userResponse);

      if (userResponse.success && userResponse.data) {
        // Extract therapist ID from response - backend returns it as userId
        const therapistId = userResponse.data.userId;
        
        console.log('🔍 [CreateWizard] Extracted therapist ID:', therapistId);
        
        if (!therapistId) {
          console.error('❌ [CreateWizard] No therapist ID found in response:', userResponse.data);
          addNotification({
            type: 'error',
            title: 'Creation Failed',
            message: 'Failed to get therapist ID from server response',
            duration: 7000
          });
          return;
        }
        
        // Update therapist profile with additional information
        const profilePayload = {
          licenseNumber: formData.license_number,
          specializations: formData.specializations,
          therapyTypes: formData.therapy_types || [], // Only send valid therapy types
          languages: formData.languages,
          bio: formData.bio,
          qualifications: formData.qualifications,
          hourlyRate: formData.hourly_rate,
          maxClientsPerDay: formData.max_clients,
          sessionDuration: formData.session_duration,
          breakBetweenSessions: formData.break_between_sessions,
          maxClients: formData.max_clients
        };
        
        console.log('📤 [CreateWizard] Updating therapist profile:', profilePayload);
        
        const profileResponse = await realApiService.admin.updateTherapistProfile(therapistId, profilePayload);
        
        console.log('📥 [CreateWizard] Profile update response:', profileResponse);

        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Therapist created successfully!',
          duration: 5000
        });
        // Delay navigation slightly to show success message
        setTimeout(() => {
          navigate(`/admin/therapists/${therapistId}`);
        }, 1000);
      } else {
        console.error('❌ [CreateWizard] User creation failed:', userResponse);
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: userResponse.message || 'Failed to create therapist user',
          duration: 7000
        });
      }
    } catch (err: any) {
      console.error('❌ [CreateWizard] Failed to create therapist:', err);
      console.error('❌ [CreateWizard] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error cases with user-friendly messages
      if (err.response?.status === 409) {
        addNotification({
          type: 'error',
          title: 'Duplicate Email',
          message: 'A user with this email already exists. Please use a different email address.',
          duration: 7000
        });
      } else if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          addNotification({
            type: 'error',
            title: 'Validation Error',
            message: `Validation error: ${validationErrors[0].msg || validationErrors[0].message}`,
            duration: 7000
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Invalid Data',
            message: err.response?.data?.message || 'Invalid data provided. Please check your inputs.',
            duration: 7000
          });
        }
      } else if (err.response?.status === 500) {
        addNotification({
          type: 'error',
          title: 'Server Error',
          message: 'Server error occurred. Please try again later.',
          duration: 7000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: err.response?.data?.message || 'Failed to create therapist. Please try again.',
          duration: 7000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/therapists')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Therapist</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}>
                <div className="flex items-center">
                  <div
                    className={`
                      relative flex h-10 w-10 items-center justify-center rounded-full
                      ${step.number < currentStep 
                        ? 'bg-red-600' 
                        : step.number === currentStep
                        ? 'bg-red-600'
                        : 'bg-gray-200'
                      }
                    `}
                  >
                    <span className={`text-sm font-medium ${
                      step.number <= currentStep ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.number}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className={`ml-8 flex-1 ${
                      step.number < currentStep ? 'bg-red-600' : 'bg-gray-200'
                    } h-0.5`} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && (
            <BasicInfoStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <ProfessionalInfoStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <ServiceSettingsStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <ReviewStep formData={formData} />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`
                inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium
                ${currentStep === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Therapist'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;