import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  FilmIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { unifiedApi } from '@/services/unifiedApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAlert } from '@/components/ui/CustomAlert';
import PageTransition from '@/components/ui/PageTransition';

interface ClientProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: string;
  assignedAt: string;
  intakeCompleted: boolean;
  sessionCount: number;
  lastSessionDate?: string;
  nextAppointmentDate?: string;
  therapyGoals: string[];
  hulpvragen: string[];
  medicalHistory: string;
  medications: string;
  previousTherapy: boolean;
  previousTherapyDetails?: string;
  profilePhotoUrl?: string;
}

const TherapistClientProfile: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error } = useAlert();

  const [client, setClient] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'progress' | 'documents'>('profile');

  useEffect(() => {
    if (clientId) {
      loadClientProfile();
    }
  }, [clientId]);

  const loadClientProfile = async () => {
    try {
      setIsLoading(true);
      const response = await unifiedApi.therapist.getClientProfile(clientId!);
      
      if (response.success && response.data) {
        setClient(response.data);
      } else {
        error('Failed to load client profile');
      }
    } catch (err) {
      console.error('Error loading client profile:', err);
      error('Failed to load client profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-6">The requested client profile could not be found.</p>
          <button
            onClick={() => navigate('/therapist/clients')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/therapist/clients')}
            className="flex items-center text-green-600 hover:text-green-700 transition-colors mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Clients
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              {client.profilePhotoUrl ? (
                <img
                  src={client.profilePhotoUrl}
                  alt={client.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserCircleIcon className="w-12 h-12 text-green-600" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                client.status === 'active' ? 'bg-green-500' : 
                client.status === 'inactive' ? 'bg-gray-400' : 
                client.status === 'on-hold' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="capitalize">{client.status}</span>
                <span>•</span>
                <span>{calculateAge(client.dateOfBirth)} years old</span>
                <span>•</span>
                <span>{client.sessionCount} sessions</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/therapist/messages?clientId=${client.id}`)}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Send Message"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate(`/therapist/appointments/new?clientId=${client.id}`)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: UserCircleIcon },
              { id: 'sessions', label: 'Sessions', icon: CalendarIcon },
              { id: 'progress', label: 'Progress', icon: HeartIcon },
              { id: 'documents', label: 'Documents', icon: DocumentTextIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-gray-900">{client.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="text-gray-900">{client.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Date of Birth</div>
                      <div className="text-gray-900">{formatDate(client.dateOfBirth)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Gender</div>
                      <div className="text-gray-900 capitalize">{client.gender}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="text-gray-900">{client.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="text-gray-900">{client.emergencyContactName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900">{client.emergencyContactPhone}</div>
                  </div>
                </div>
              </div>

              {/* Therapy Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Therapy Information</h3>
                
                {client.therapyGoals && Array.isArray(client.therapyGoals) && client.therapyGoals.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">Therapy Goals</div>
                    <div className="space-y-2">
                      {client.therapyGoals.map((goal, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="text-gray-900">{goal}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {client.hulpvragen && Array.isArray(client.hulpvragen) && client.hulpvragen.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">Areas of Concern</div>
                    <div className="flex flex-wrap gap-2">
                      {client.hulpvragen.map((hulpvraag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {hulpvraag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Medical History</div>
                    <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                      {client.medicalHistory || 'No medical history provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Medications</div>
                    <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                      {client.medications || 'No medications listed'}
                    </div>
                  </div>
                </div>

                {client.previousTherapy && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Previous Therapy Experience</div>
                    <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                      {client.previousTherapyDetails || 'Client has previous therapy experience'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sessions</span>
                    <span className="font-semibold text-gray-900">{client.sessionCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assigned Since</span>
                    <span className="font-semibold text-gray-900">{formatDate(client.assignedAt)}</span>
                  </div>
                  {client.lastSessionDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Session</span>
                      <span className="font-semibold text-gray-900">{formatDate(client.lastSessionDate)}</span>
                    </div>
                  )}
                  {client.nextAppointmentDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next Session</span>
                      <span className="font-semibold text-green-600">{formatDate(client.nextAppointmentDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Intake Status</span>
                    <span className={`font-semibold ${client.intakeCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {client.intakeCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/therapist/notes/new?clientId=${client.id}`)}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span>Add Session Note</span>
                  </button>
                  <button
                    onClick={() => navigate(`/therapist/resources?clientId=${client.id}`)}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5" />
                    <span>Assign Resource</span>
                  </button>
                  <button
                    onClick={() => navigate(`/therapist/challenges?clientId=${client.id}`)}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FilmIcon className="w-5 h-5" />
                    <span>Assign Challenge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Session History</h3>
            <p className="text-gray-600">This feature is coming soon. You'll be able to view all session history here.</p>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600">This feature is coming soon. You'll be able to track client progress here.</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Documents</h3>
            <p className="text-gray-600">This feature is coming soon. You'll be able to view client documents here.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default TherapistClientProfile;