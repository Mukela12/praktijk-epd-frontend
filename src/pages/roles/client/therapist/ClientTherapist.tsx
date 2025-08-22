import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  StarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  HeartIcon,
  CheckCircleIcon,
  BookOpenIcon,
  TrophyIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon, 
  HeartIcon as HeartSolidIcon,
  UserIcon as UserSolid,
  CalendarIcon as CalendarSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftSolid,
  CheckCircleIcon as CheckCircleSolid,
  SparklesIcon as SparklesSolid,
  TrophyIcon as TrophySolid
} from '@heroicons/react/24/solid';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '@/components/ui/CustomAlert';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';

const ClientTherapist: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { info, error: errorAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [therapist, setTherapist] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'communication' | 'resources'>('overview');

  // Load therapist data
  useEffect(() => {
    const loadTherapistData = async () => {
      try {
        setIsLoading(true);
        
        // Get therapist data from backend
        const response = await realApiService.client.getTherapist();
        if (response.success && response.data) {
          setTherapist(response.data);
        }
        
        // Get dashboard data for progress
        const dashboardResponse = await realApiService.client.getDashboard();
        if (dashboardResponse.success && dashboardResponse.data) {
          const metrics = dashboardResponse.data.metrics;
          setProgress({
            sessions_completed: metrics?.completedSessions || 0,
            total_sessions: metrics?.totalSessions || 0,
            treatment_progress: metrics?.totalSessions > 0 ? Math.round((metrics?.completedSessions || 0) / metrics.totalSessions * 100) : 0,
            next_appointment: metrics?.nextAppointment || null
          });
        }
      } catch (error: any) {
        if (error?.response?.status !== 404 && error?.response?.status !== 403) {
          errorAlert(t('therapist.loadError'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTherapistData();
  }, []);

  // Handle actions
  const handleBookSession = () => {
    navigate('/client/appointments/new');
  };

  const handleSendMessage = () => {
    navigate('/client/messages/new');
  };

  const handleVideoCall = () => {
    info('Video calling feature coming soon');
  };

  const handlePhoneCall = () => {
    if (therapist?.phone) {
      window.location.href = `tel:${therapist.phone}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If no therapist assigned
  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Therapist Assigned</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have a therapist assigned yet. Browse our therapists to find one that fits your needs, or contact the admin for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/client/therapists"
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
              >
                <UserIcon className="w-5 h-5" />
                <span>Browse All Therapists</span>
              </Link>
              <Link
                to="/client/messages/new"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Contact Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header with Glassmorphism */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/40 via-sky-100/40 to-rose-100/40"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <ProfilePhotoUpload
                    userId={therapist.id || therapist.user_id}
                    currentPhotoUrl={therapist.profile_photo_url || therapist.photo_url}
                    size="medium"
                    editable={false}
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    {therapist.first_name} {therapist.last_name}
                  </h1>
                  <p className="text-slate-600 text-lg font-medium mb-3">
                    {therapist.professional_title || 'Therapist'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleBookSession}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <CalendarSolid className="w-5 h-5" />
                  <span className="font-medium">Book Session</span>
                </button>
                
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span className="font-medium">Message</span>
                </button>
                
                {therapist.enable_video_calls && (
                  <button
                    onClick={handleVideoCall}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    <span className="font-medium">Video Call</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Link to browse all therapists */}
            <div className="mt-6 text-center">
              <Link
                to="/client/therapists"
                className="text-violet-600 hover:text-violet-700 font-medium text-sm inline-flex items-center space-x-1 smooth-transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t('therapist.browseOtherTherapists')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/20 via-white/20 to-slate-100/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 bg-white/40 backdrop-blur-sm rounded-2xl p-2">
              {[
                { id: 'overview', label: 'Overview', icon: UserIcon },
                { id: 'progress', label: 'My Progress', icon: TrophySolid },
                { id: 'communication', label: 'Communication', icon: ChatBubbleLeftSolid },
                { id: 'resources', label: 'Resources', icon: BookOpenIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* About Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-sky-100/20 to-emerald-100/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                      <UserSolid className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">About {therapist.first_name}</h3>
                  </div>
                  
                  <p className="text-slate-700 mb-6 leading-relaxed">
                    {therapist.bio || `${therapist.first_name} ${therapist.last_name} is a dedicated therapist committed to helping clients achieve their wellness goals.`}
                  </p>
                  
                  {therapist.approach && (
                    <div className="bg-gradient-to-r from-sky-50/80 to-blue-50/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl p-6">
                      <h4 className="font-semibold text-sky-800 mb-3 flex items-center">
                        <SparklesSolid className="w-5 h-5 mr-2 text-sky-600" />
                        Therapeutic Approach
                      </h4>
                      <p className="text-sky-700 leading-relaxed">{therapist.approach}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {therapist.specializations && therapist.specializations.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-green-100/20 to-teal-100/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                        <SparklesSolid className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Areas of Expertise</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {therapist.specializations.map((spec: string, index: number) => (
                        <span
                          key={index}
                          className="bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 px-4 py-2 rounded-2xl text-sm font-medium backdrop-blur-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Education & Certifications */}
              {(therapist.education || therapist.certifications) && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                        <AcademicCapIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Credentials & Education</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {therapist.education && (
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <AcademicCapIcon className="w-5 h-5 mr-2 text-sky-600" />
                            Education
                          </h4>
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                            <p className="text-slate-700 text-sm">{therapist.education}</p>
                          </div>
                        </div>
                      )}
                      
                      {therapist.certifications && (
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <CheckCircleSolid className="w-5 h-5 mr-2 text-emerald-600" />
                            Certifications
                          </h4>
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                            <p className="text-slate-700 text-sm">{therapist.certifications}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Info */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 via-blue-100/20 to-indigo-100/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Quick Info</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {therapist.years_of_experience && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                        <div className="flex items-center space-x-3 mb-2">
                          <ClockIcon className="w-5 h-5 text-sky-500" />
                          <span className="text-sm font-semibold text-slate-800">Experience</span>
                        </div>
                        <p className="text-slate-600">{therapist.years_of_experience} years of practice</p>
                      </div>
                    )}
                    
                    {therapist.languages && therapist.languages.length > 0 && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                        <div className="flex items-center space-x-3 mb-2">
                          <MapPinIcon className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-semibold text-slate-800">Languages</span>
                        </div>
                        <p className="text-slate-600">{therapist.languages.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-purple-100/20 to-pink-100/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                      <ChatBubbleLeftSolid className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Contact</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {therapist.phone && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <PhoneIcon className="w-5 h-5 text-slate-600" />
                            <span className="text-slate-700 text-sm">{therapist.phone}</span>
                          </div>
                          <button
                            onClick={handlePhoneCall}
                            className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg"
                          >
                            Call
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <PaperAirplaneIcon className="w-5 h-5 text-slate-600" />
                          <span className="text-slate-700 text-sm">Secure Message</span>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Therapy Progress */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-sky-100/20 to-emerald-100/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                    <TrophySolid className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Therapy Progress</h3>
                </div>
                
                {progress ? (
                  <>
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-700">Sessions Completed</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {progress.sessions_completed}/{progress.total_sessions || '∞'}
                        </span>
                      </div>
                      {progress.total_sessions > 0 && (
                        <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl h-4 border border-white/40 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-2xl transition-all duration-1000 ease-out shadow-lg"
                            style={{ width: `${(progress.sessions_completed / progress.total_sessions) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm border border-violet-200/50 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircleSolid className="w-6 h-6 text-violet-500" />
                          <h4 className="font-semibold text-violet-800">Sessions Completed</h4>
                        </div>
                        <p className="text-3xl font-bold text-violet-700">{progress.sessions_completed}</p>
                      </div>
                      <div className="bg-gradient-to-br from-sky-50/80 to-blue-50/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <ChartBarIcon className="w-6 h-6 text-sky-500" />
                          <h4 className="font-semibold text-sky-800">Treatment Progress</h4>
                        </div>
                        <p className="text-3xl font-bold text-sky-700">{progress.treatment_progress}%</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No progress data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Next Session */}
            {progress?.next_appointment && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 via-blue-100/20 to-indigo-100/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <CalendarSolid className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Next Session</h3>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-sky-50/80 to-blue-50/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CalendarSolid className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-bold text-slate-800 text-lg mb-2">
                      {new Date(progress.next_appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sky-600 font-semibold text-lg mb-4">
                      {progress.next_appointment.start_time}
                    </p>
                    <Link
                      to="/client/appointments"
                      className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto inline-flex"
                    >
                      <SparklesSolid className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-sky-100/20 to-emerald-100/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-400 to-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Secure Communication</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Communicate securely with your therapist through encrypted messaging
                {therapist.enable_video_calls && ', video calls,'} and phone sessions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Start Conversation</span>
                </button>
                
                {therapist.enable_video_calls && (
                  <button
                    onClick={handleVideoCall}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    <span>Video Call</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-sky-100/20 to-violet-100/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BookOpenIcon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Therapy Resources</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Access personalized resources, exercises, and materials recommended by your therapist.
              </p>
              
              <Link
                to="/client/resources"
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto inline-flex"
              >
                <SparklesSolid className="w-5 h-5" />
                <span>Browse Resources</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClientTherapist;