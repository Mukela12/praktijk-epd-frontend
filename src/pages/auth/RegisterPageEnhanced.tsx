import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole, LanguageCode } from '@/types/auth';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import SEPASetupStep from '@/components/auth/SEPASetupStep';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { AccessibleForm, AccessibleInput, AccessibleButton, AccessibleSelect } from '@/components/ui/AccessibleForm';
import { useAlert } from '@/components/ui/CustomAlert';

// Step 1: Basic Information
const basicInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().refine((val) => !val || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(val), 'Please enter a valid phone number'),
});

// Step 2: Account Setup
const accountSetupSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  preferredLanguage: z.nativeEnum(LanguageCode),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;
type AccountSetupData = z.infer<typeof accountSetupSchema>;

const RegisterPageEnhanced: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [accountSetup, setAccountSetup] = useState<AccountSetupData | null>(null);
  const [sepaData, setSepaData] = useState<any>(null);
  
  const { register: registerUser, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: errorAlert } = useAlert();

  const steps = [
    { number: 1, title: 'Basic Information', icon: UserIcon },
    { number: 2, title: 'Account Setup', icon: LockClosedIcon },
    { number: 3, title: 'Payment Method', icon: CheckCircleIcon, optional: true }
  ];

  const handleBasicInfoSubmit = (data: BasicInfoData) => {
    setBasicInfo(data);
    setCurrentStep(2);
  };

  const handleAccountSetupSubmit = (data: AccountSetupData) => {
    setAccountSetup(data);
    // Only show SEPA setup for clients
    if (data.role === UserRole.CLIENT) {
      setCurrentStep(3);
    } else {
      handleFinalSubmit(data);
    }
  };

  const handleSEPAComplete = (data: any) => {
    setSepaData(data);
    handleFinalSubmit();
  };

  const handleSEPASkip = () => {
    handleFinalSubmit();
  };

  const handleFinalSubmit = async (setupData?: AccountSetupData) => {
    if (!basicInfo || (!accountSetup && !setupData)) return;

    const accountData = setupData || accountSetup!;
    
    try {
      const registrationData = {
        email: basicInfo.email,
        password: accountData.password,
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        phone: basicInfo.phone || undefined,
        role: accountData.role,
        preferredLanguage: accountData.preferredLanguage,
        // Include SEPA data if provided
        ...(sepaData && {
          paymentMethod: {
            type: 'sepa',
            iban: sepaData.iban,
            accountHolder: sepaData.accountHolder
          }
        })
      };

      const result = await registerUser(registrationData);
      
      if (result) {
        success('Registration successful! Please check your email to verify your account.');
        navigate('/auth/email-verification-pending', { 
          state: { email: basicInfo.email } 
        });
      }
    } catch (error: any) {
      errorAlert(error.message || 'Registration failed. Please try again.');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        
        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.number} className={`text-xs ${
                currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step.title}
                {step.optional && ' (Optional)'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {currentStep === 1 && (
            <BasicInfoStep 
              onSubmit={handleBasicInfoSubmit}
              initialData={basicInfo}
            />
          )}
          
          {currentStep === 2 && (
            <AccountSetupStep
              onSubmit={handleAccountSetupSubmit}
              onBack={goToPreviousStep}
              initialData={accountSetup}
              isLoading={isLoading}
            />
          )}
          
          {currentStep === 3 && (
            <SEPASetupStep
              onComplete={handleSEPAComplete}
              onSkip={handleSEPASkip}
              isOptional={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1 Component
const BasicInfoStep: React.FC<{
  onSubmit: (data: BasicInfoData) => void;
  initialData: BasicInfoData | null;
}> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });

  return (
    <AccessibleForm onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <AccessibleInput
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          required
          autoComplete="given-name"
        />
        
        <AccessibleInput
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          required
          autoComplete="family-name"
        />
        
        <AccessibleInput
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
          autoComplete="email"
        />
        
        <AccessibleInput
          label="Phone Number"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="+31 6 12345678"
          autoComplete="tel"
        />
      </div>
      
      <div className="mt-6">
        <AccessibleButton
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          icon={ChevronRightIcon}
          iconPosition="right"
        >
          Continue
        </AccessibleButton>
      </div>
    </AccessibleForm>
  );
};

// Step 2 Component
const AccountSetupStep: React.FC<{
  onSubmit: (data: AccountSetupData) => void;
  onBack: () => void;
  initialData: AccountSetupData | null;
  isLoading: boolean;
}> = ({ onSubmit, onBack, initialData, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AccountSetupData>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: initialData || {
      password: '',
      confirmPassword: '',
      role: UserRole.CLIENT,
      preferredLanguage: LanguageCode.EN,
      acceptTerms: false
    }
  });

  const roleOptions = [
    { value: UserRole.CLIENT, label: 'Client' },
    { value: UserRole.THERAPIST, label: 'Therapist' },
    { value: UserRole.ADMIN, label: 'Administrator' }
  ];

  const languageOptions = [
    { value: LanguageCode.EN, label: 'English' },
    { value: LanguageCode.NL, label: 'Nederlands' }
  ];

  return (
    <AccessibleForm onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <AccessibleInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={errors.password?.message}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1"
          >
            {showPassword ? 'Hide' : 'Show'} password
          </button>
        </div>
        
        <div>
          <AccessibleInput
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1"
          >
            {showConfirmPassword ? 'Hide' : 'Show'} password
          </button>
        </div>
        
        <AccessibleSelect
          label="Account Type"
          options={roleOptions}
          {...register('role')}
          error={errors.role?.message}
          required
        />
        
        <AccessibleSelect
          label="Preferred Language"
          options={languageOptions}
          {...register('preferredLanguage')}
          error={errors.preferredLanguage?.message}
          required
        />
        
        <div className="flex items-start">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            I accept the{' '}
            <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700">
              terms and conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700">
              privacy policy
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>
      
      <div className="mt-6 flex gap-3">
        <AccessibleButton
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
          icon={ChevronLeftIcon}
        >
          Back
        </AccessibleButton>
        
        <AccessibleButton
          type="submit"
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          loading={isLoading}
          loadingText="Creating account..."
          icon={CheckCircleIcon}
          iconPosition="right"
        >
          Complete Registration
        </AccessibleButton>
      </div>
    </AccessibleForm>
  );
};

export default RegisterPageEnhanced;