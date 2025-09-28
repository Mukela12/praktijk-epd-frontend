// Complete client dashboard example with intake form banner
// Shows how to integrate intake status checking and completion banner

import React, { useState, useEffect } from 'react';
import { useIntakeStatus } from '../hooks/useIntakeStatus';
import { IntakeFormWizard } from '../components/IntakeFormWizard';

interface ClientDashboardProps {
  clientId: string;
}

export const ClientDashboardWithIntakeBanner: React.FC<ClientDashboardProps> = ({ 
  clientId 
}) => {
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const {
    intakeStatus,
    isLoading: isLoadingIntake,
    hasCompletedIntake,
    canBookAppointments,
    completionPercentage,
    refetchStatus
  } = useIntakeStatus(clientId);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoadingDashboard(true);
      
      const response = await fetch('/api/client/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleIntakeComplete = () => {
    setShowIntakeForm(false);
    refetchStatus(); // Refresh intake status
    loadDashboardData(); // Refresh dashboard
  };

  useEffect(() => {
    loadDashboardData();
  }, [clientId]);

  // Show intake form if requested
  if (showIntakeForm) {
    return (
      <IntakeFormWizard
        clientId={clientId}
        onComplete={handleIntakeComplete}
        onCancel={() => setShowIntakeForm(false)}
      />
    );
  }

  // Loading state
  if (isLoadingDashboard || isLoadingIntake) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData?.user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your appointments and therapy journey.
          </p>
        </div>

        {/* Intake Completion Banner */}
        {!isLoadingIntake && !hasCompletedIntake && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        Complete Your Intake Form
                      </h3>
                      <p className="text-amber-700 mb-4">
                        Please complete your intake form to book appointments with our therapists. 
                        This helps us understand your needs and provide the best possible care.
                      </p>
                      
                      {/* Progress indicator if partially completed */}
                      {completionPercentage > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-amber-700 mb-1">
                            <span>Progress: {completionPercentage}% complete</span>
                            <span>Continue where you left off</span>
                          </div>
                          <div className="w-full bg-amber-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowIntakeForm(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          {completionPercentage > 0 ? '📝 Continue Intake Form' : '🚀 Start Intake Form'}
                        </button>
                        
                        <button className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg border border-amber-300 hover:border-amber-400 transition-colors duration-200">
                          ℹ️ Learn More
                        </button>
                      </div>
                    </div>
                    
                    {/* Close button */}
                    <button 
                      className="text-amber-400 hover:text-amber-600 ml-4"
                      onClick={() => {/* Add logic to dismiss temporarily */}}
                      title="Dismiss (you'll still need to complete the intake form)"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Blocking Notice */}
        {!hasCompletedIntake && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-blue-500 text-xl mr-3">🔒</span>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Appointment booking is currently disabled
                </p>
                <p className="text-sm text-blue-600">
                  Complete your intake form to unlock appointment scheduling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Completed Intake */}
        {hasCompletedIntake && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Your intake form has been completed!
                </p>
                <p className="text-sm text-green-600">
                  You can now book appointments with our therapists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  disabled={!canBookAppointments}
                  className={`
                    p-4 rounded-lg border-2 border-dashed text-center transition-colors
                    ${canBookAppointments
                      ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-medium">Book Appointment</div>
                  <div className="text-sm opacity-75">
                    {canBookAppointments ? 'Schedule your session' : 'Complete intake first'}
                  </div>
                </button>

                <button className="p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 text-center text-green-700 transition-colors">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-medium">Message Therapist</div>
                  <div className="text-sm opacity-75">Send a message</div>
                </button>

                <button className="p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-center text-purple-700 transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">View Progress</div>
                  <div className="text-sm opacity-75">Track your journey</div>
                </button>

                <button 
                  onClick={() => setShowIntakeForm(true)}
                  className="p-4 rounded-lg border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 text-center text-orange-700 transition-colors"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium">
                    {hasCompletedIntake ? 'Review Intake' : 'Complete Intake'}
                  </div>
                  <div className="text-sm opacity-75">
                    {hasCompletedIntake ? 'View your responses' : `${completionPercentage}% complete`}
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              
              {!canBookAppointments ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-sm">Complete your intake form to book appointments</p>
                </div>
              ) : dashboardData?.upcomingAppointments === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-sm mb-4">No upcoming appointments</p>
                  <button className="btn-premium-primary">
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Sample upcoming appointment */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-blue-900">
                          Session with Dr. Smith
                        </p>
                        <p className="text-sm text-blue-700">
                          Tomorrow, 2:00 PM - 3:00 PM
                        </p>
                        <p className="text-sm text-blue-600">
                          📍 In-person appointment
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Reschedule
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${hasCompletedIntake ? 'text-green-600' : 'text-amber-600'}`}>
                    {hasCompletedIntake ? 'Active' : 'Setup Required'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intake:</span>
                  <span className={`font-medium ${hasCompletedIntake ? 'text-green-600' : 'text-amber-600'}`}>
                    {hasCompletedIntake ? 'Completed' : `${completionPercentage}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {new Date(dashboardData?.user?.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button className="w-full mt-4 btn-secondary">
                Edit Profile
              </button>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">📞 Contact Support</div>
                  <div className="text-sm text-gray-600">Get help with your account</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">❓ FAQ</div>
                  <div className="text-sm text-gray-600">Common questions answered</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">🔒 Privacy & Security</div>
                  <div className="text-sm text-gray-600">Your data protection</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardWithIntakeBanner;