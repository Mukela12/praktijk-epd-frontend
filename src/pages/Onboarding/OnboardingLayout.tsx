import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';

interface OnboardingStep {
  id: string;
  label: string;
  number: number;
}

interface OnboardingLayoutProps {
  children: React.ReactNode;
  steps: OnboardingStep[];
  currentStep: string;
  completedSteps: Set<string>;
  userName: string;
  progress: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  steps,
  currentStep,
  completedSteps,
  userName,
  progress
}) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154310/Logo_van_PraktijkEPD-3_3_xyr2pg.png"
                alt="PraktijkEPD Logo"
                className="h-10 w-auto"
              />
            </Link>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, <strong>{userName}</strong></span>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.has(step.id);
              const isPast = steps.findIndex(s => s.id === currentStep) > index;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                        {
                          'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg': isCompleted,
                          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg animate-pulse': isActive,
                          'bg-gray-200 text-gray-600': !isActive && !isCompleted
                        }
                      )}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-6 h-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={clsx(
                        'text-sm font-medium transition-colors',
                        {
                          'text-gray-900': isActive || isCompleted,
                          'text-gray-500': !isActive && !isCompleted
                        }
                      )}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={clsx(
                        'flex-1 h-0.5 mx-4 transition-all duration-500',
                        {
                          'bg-green-500': isCompleted && completedSteps.has(steps[index + 1].id),
                          'bg-blue-500': isCompleted && !completedSteps.has(steps[index + 1].id),
                          'bg-gray-300': !isCompleted
                        }
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-xs text-gray-600">
              © {currentYear} {t('company.name')}. {t('company.copyright')}.
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <a href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </a>
              <a href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;