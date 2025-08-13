import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  PhoneIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface IntakeFormData {
  reasonForTherapy: string;
  therapyGoals: string[];
  medicalHistory: string;
  medications: string;
  previousTherapy: boolean;
  previousTherapyDetails?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage?: string;
  additionalNotes?: string;
}

const IntakeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, warning } = useAlert();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IntakeFormData>({
    reasonForTherapy: '',
    therapyGoals: [''],
    medicalHistory: '',
    medications: '',
    previousTherapy: false,
    previousTherapyDetails: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredLanguage: 'en',
    additionalNotes: ''
  });

  const steps = [
    { number: 1, title: 'Therapy Information', icon: HeartIcon },
    { number: 2, title: 'Medical History', icon: ClipboardDocumentCheckIcon },
    { number: 3, title: 'Emergency Contact', icon: PhoneIcon },
    { number: 4, title: 'Review & Submit', icon: CheckCircleIcon }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...formData.therapyGoals];
    newGoals[index] = value;
    setFormData(prev => ({ ...prev, therapyGoals: newGoals }));
  };

  const addGoal = () => {
    setFormData(prev => ({ ...prev, therapyGoals: [...prev.therapyGoals, ''] }));
  };

  const removeGoal = (index: number) => {
    if (formData.therapyGoals.length > 1) {
      const newGoals = formData.therapyGoals.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, therapyGoals: newGoals }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.reasonForTherapy || formData.reasonForTherapy.length < 20) {
          warning('Please provide a detailed reason for therapy (minimum 20 characters)');
          return false;
        }
        if (formData.therapyGoals.filter(g => g.trim()).length === 0) {
          warning('Please add at least one therapy goal');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.medicalHistory) {
          warning('Please provide your medical history');
          return false;
        }
        if (formData.previousTherapy && !formData.previousTherapyDetails) {
          warning('Please provide details about your previous therapy');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
          warning('Please provide emergency contact information');
          return false;
        }
        if (!/^\+?[1-9]\d{1,14}$/.test(formData.emergencyContactPhone.replace(/\s/g, ''))) {
          warning('Please provide a valid phone number');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setIsSubmitting(true);
      
      // Filter out empty goals
      const filteredGoals = formData.therapyGoals.filter(goal => goal.trim());
      
      const submitData = {
        ...formData,
        therapyGoals: filteredGoals
      };

      const response = await clientApi.submitIntakeForm(submitData);
      
      if (response.success) {
        success('Intake form submitted successfully. Your therapist will review your information.');
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit intake form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="reasonForTherapy" className="label-premium label-premium-required">
                Why are you seeking therapy?
              </label>
              <textarea
                id="reasonForTherapy"
                name="reasonForTherapy"
                value={formData.reasonForTherapy}
                onChange={handleInputChange}
                rows={4}
                className="input-premium"
                placeholder="Please describe what brings you to therapy and what you hope to address..."
              />
              <p className="form-help">Minimum 20 characters required</p>
            </div>

            <div>
              <label className="label-premium label-premium-required">
                What are your therapy goals?
              </label>
              <div className="space-y-3">
                {formData.therapyGoals.map((goal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => handleGoalChange(index, e.target.value)}
                      className="input-premium flex-1"
                      placeholder={`Goal ${index + 1}`}
                    />
                    {formData.therapyGoals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="btn-premium-danger p-2"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addGoal}
                className="btn-premium-secondary mt-3 text-sm"
              >
                Add Another Goal
              </button>
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="label-premium">
                Preferred Language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleInputChange}
                className="select-premium"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="medicalHistory" className="label-premium label-premium-required">
                Medical History
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows={4}
                className="input-premium"
                placeholder="Please describe any relevant medical conditions, diagnoses, or health concerns..."
              />
            </div>

            <div>
              <label htmlFor="medications" className="label-premium">
                Current Medications
              </label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                rows={3}
                className="input-premium"
                placeholder="List any medications you are currently taking (or write 'None' if applicable)..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="previousTherapy"
                  name="previousTherapy"
                  checked={formData.previousTherapy}
                  onChange={handleInputChange}
                  className="checkbox-premium"
                />
                <label htmlFor="previousTherapy" className="ml-2 text-body">
                  Have you been in therapy before?
                </label>
              </div>

              {formData.previousTherapy && (
                <div>
                  <label htmlFor="previousTherapyDetails" className="label-premium label-premium-required">
                    Previous Therapy Details
                  </label>
                  <textarea
                    id="previousTherapyDetails"
                    name="previousTherapyDetails"
                    value={formData.previousTherapyDetails}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-premium"
                    placeholder="Please describe your previous therapy experience..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="card-premium bg-amber-50 border-amber-200 p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-body-sm text-amber-800">
                    Emergency contact information is required for your safety and will only be used in case of emergencies.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="emergencyContactName" className="label-premium label-premium-required">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                className="input-premium"
                placeholder="Full name of emergency contact"
              />
            </div>

            <div>
              <label htmlFor="emergencyContactPhone" className="label-premium label-premium-required">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                className="input-premium"
                placeholder="+31 6 12345678"
              />
              <p className="form-help">Include country code (e.g., +31 for Netherlands)</p>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="label-premium">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={3}
                className="input-premium"
                placeholder="Any additional information you'd like your therapist to know..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="card-premium bg-green-50 border-green-200 p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-body-sm text-green-800">
                    Please review your information before submitting. You can go back to make changes if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-premium p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Therapy Information</h3>
                <div className="space-y-2 text-body-sm">
                  <div>
                    <span className="text-gray-600">Reason for therapy:</span>
                    <p className="mt-1">{formData.reasonForTherapy}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Goals:</span>
                    <ul className="mt-1 list-disc list-inside">
                      {formData.therapyGoals.filter(g => g.trim()).map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-gray-600">Preferred Language:</span> {formData.preferredLanguage?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="card-premium p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Medical Information</h3>
                <div className="space-y-2 text-body-sm">
                  <div>
                    <span className="text-gray-600">Medical History:</span>
                    <p className="mt-1">{formData.medicalHistory}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Medications:</span>
                    <p className="mt-1">{formData.medications || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Previous Therapy:</span> {formData.previousTherapy ? 'Yes' : 'No'}
                    {formData.previousTherapy && formData.previousTherapyDetails && (
                      <p className="mt-1">{formData.previousTherapyDetails}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-premium p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                <div className="space-y-2 text-body-sm">
                  <div>
                    <span className="text-gray-600">Name:</span> {formData.emergencyContactName}
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span> {formData.emergencyContactPhone}
                  </div>
                </div>
              </div>

              {formData.additionalNotes && (
                <div className="card-premium p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
                  <p className="text-body-sm">{formData.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-medical text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <DocumentTextIcon className="w-8 h-8" />
              </div>
              Client Intake Form
            </h1>
            <p className="text-body text-indigo-50 mt-2">
              Please provide information to help us understand your needs better
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-indigo-600 text-white shadow-premium' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <p className={`
                    text-xs mt-2 text-center
                    ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2 rounded transition-all duration-300
                    ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="card-premium p-8">
        <h2 className="heading-section mb-6">{steps[currentStep - 1].title}</h2>
        
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`btn-premium-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              className="btn-premium-ghost"
            >
              Save & Complete Later
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-premium-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-premium-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Submit Form</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;