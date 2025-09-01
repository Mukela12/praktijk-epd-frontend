import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingLayout from './OnboardingLayout';
import PasswordChangeStep from './steps/PasswordChangeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import TwoFactorSetupStep from './steps/TwoFactorSetupStep';
import CompletionStep from './steps/CompletionStep';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserRole } from '@/types/auth';

const OnboardingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    status,
    currentStep,
    isLoading,
    error,
    refreshStatus,
    changePassword,
    updateProfile,
    completeOnboarding
  } = useOnboarding();

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Update completed steps based on status
    if (status) {
      const completed = new Set<string>();
      if (!status.mustChangePassword) completed.add('password');
      if (status.steps?.profileCompleted) completed.add('profile');
      if (status.steps?.twoFactorEnabled) completed.add('2fa');
      setCompletedSteps(completed);
    }
  }, [status]);

  // Show loading spinner while fetching status
  if (isLoading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Loading onboarding status..." />
      </div>
    );
  }

  // Redirect if onboarding is already complete
  if (status?.onboardingCompleted) {
    const redirectPath = user?.role === UserRole.THERAPIST 
      ? '/therapist/dashboard' 
      : `/${user?.role}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'password':
        return (
          <PasswordChangeStep
            onComplete={async (data) => {
              await changePassword(data);
              await refreshStatus();
            }}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case 'profile':
        // Only show profile step for therapists
        if (user?.role !== UserRole.THERAPIST) {
          // Skip to 2FA for non-therapists
          return (
            <TwoFactorSetupStep
              onComplete={async () => {
                await refreshStatus();
              }}
              onSkip={async () => {
                await completeOnboarding();
              }}
            />
          );
        }
        return (
          <ProfileSetupStep
            onComplete={async (data) => {
              await updateProfile(data);
              await refreshStatus();
            }}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case '2fa':
        return (
          <TwoFactorSetupStep
            onComplete={async () => {
              await refreshStatus();
            }}
            onSkip={async () => {
              // For now, skip 2FA and complete onboarding
              // In production, you might want to enforce 2FA for therapists
              await completeOnboarding();
            }}
          />
        );
      
      case 'complete':
        return (
          <CompletionStep
            onComplete={async () => {
              await completeOnboarding();
            }}
            userRole={user?.role}
          />
        );
      
      default:
        return null;
    }
  };

  const steps = user?.role === UserRole.THERAPIST
    ? [
        { id: 'password', label: 'Change Password', number: 1 },
        { id: 'profile', label: 'Complete Profile', number: 2 },
        { id: '2fa', label: 'Setup 2FA', number: 3 },
        { id: 'complete', label: 'Finish', number: 4 }
      ]
    : [
        { id: 'password', label: 'Change Password', number: 1 },
        { id: '2fa', label: 'Setup 2FA', number: 2 },
        { id: 'complete', label: 'Finish', number: 3 }
      ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      completedSteps={completedSteps}
      userName={user?.firstName || user?.email || 'User'}
      progress={(currentStepIndex + 1) / steps.length * 100}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default OnboardingPage;