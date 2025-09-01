import React from 'react';
import { 
  CheckCircleIcon, 
  SparklesIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserRole } from '@/types/auth';
// import confetti from 'canvas-confetti'; // Uncomment after installing canvas-confetti

interface CompletionStepProps {
  onComplete: () => Promise<void>;
  userRole?: UserRole;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  onComplete,
  userRole
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Confetti animation placeholder
    // Uncomment the following code after installing canvas-confetti:
    /*
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
    */
  }, []);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const getNextSteps = () => {
    switch (userRole) {
      case UserRole.THERAPIST:
        return [
          {
            icon: CalendarIcon,
            title: 'Set Your Availability',
            description: 'Configure your working hours and appointment slots'
          },
          {
            icon: UserGroupIcon,
            title: 'Accept New Clients',
            description: 'Review and accept client requests that match your expertise'
          },
          {
            icon: DocumentTextIcon,
            title: 'Prepare Session Templates',
            description: 'Create templates for session notes and treatment plans'
          },
          {
            icon: ChartBarIcon,
            title: 'Track Your Progress',
            description: 'Use analytics to monitor your practice growth'
          }
        ];
      default:
        return [
          {
            icon: DocumentTextIcon,
            title: 'Explore Features',
            description: 'Discover all the tools available in your dashboard'
          },
          {
            icon: UserGroupIcon,
            title: 'Connect with Team',
            description: 'Collaborate with other healthcare professionals'
          }
        ];
    }
  };

  const nextSteps = getNextSteps();

  return (
    <div className="animate-fadeInUp">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="heading-primary text-gray-900 mb-2">
          Congratulations! 🎉
        </h2>
        <p className="text-body text-gray-600">
          Your account setup is complete. You're ready to get started!
        </p>
      </div>

      {/* What's Next */}
      <div className="card-premium p-8">
        <div className="text-center mb-8">
          <SparklesIcon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            What's Next?
          </h3>
          <p className="text-gray-600">
            Here are some things you can do to get the most out of PraktijkEPD
          </p>
        </div>

        {/* Next Steps Grid */}
        <div className="grid gap-4 mb-8">
          {nextSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Reminder */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Account Security</p>
              <p className="text-blue-800">
                Your account is now secured with a strong password
                {userRole === UserRole.THERAPIST && ' and ready for two-factor authentication'}.
                Remember to keep your login credentials safe.
              </p>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="btn-premium-primary w-full py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Getting Started...</span>
            </>
          ) : (
            <>
              Go to Dashboard
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Welcome Message */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Welcome to the PraktijkEPD community! We're excited to have you on board.
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;