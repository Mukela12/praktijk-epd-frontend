import React, { useState, useEffect, useRef } from 'react';
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
  PaperAirplaneIcon
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

// Types
interface TherapistInfo {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  experience_years: number;
  education: string[];
  certifications: string[];
  bio: string;
  approach: string;
  rating: number;
  total_reviews: number;
  phone: string;
  email: string;
  availability: {
    next_available: string;
    preferred_times: string[];
  };
  session_types: string[];
  profile_image?: string;
}

interface TherapyProgress {
  sessions_completed: number;
  total_sessions: number;
  start_date: string;
  current_goals: string[];
  progress_notes: string[];
  next_session: string;
}

const ClientTherapist: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [progress, setProgress] = useState<TherapyProgress | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'communication' | 'resources'>('overview');
  const hasErrorRef = useRef(false);
  const loadingRef = useRef(false);

  // Mock therapist data
  const mockTherapist: TherapistInfo = {
    id: 'therapist_1',
    name: 'Dr. Sarah Wilson',
    title: 'Clinical Psychologist & Psychotherapist',
    specializations: [
      'Cognitive Behavioral Therapy (CBT)',
      'EMDR Therapy',
      'Anxiety Disorders',
      'Depression Treatment',
      'Trauma Therapy'
    ],
    languages: ['Dutch', 'English', 'German'],
    experience_years: 12,
    education: [
      'PhD in Clinical Psychology, University of Amsterdam',
      'Master of Science in Psychology, VU Amsterdam',
      'Bachelor of Psychology, Utrecht University'
    ],
    certifications: [
      'Licensed Clinical Psychologist (BIG Register)',
      'EMDR Europe Certified Therapist',
      'CBT Specialist Certification',
      'Trauma-Informed Care Certificate'
    ],
    bio: 'Dr. Sarah Wilson is a dedicated clinical psychologist with over 12 years of experience helping individuals overcome anxiety, depression, and trauma. She specializes in evidence-based approaches including CBT and EMDR, providing compassionate and effective treatment in a safe, supportive environment.',
    approach: 'My therapeutic approach combines evidence-based techniques with a warm, collaborative relationship. I believe in empowering clients with practical tools while providing a safe space to explore and heal. Together, we will work towards your goals at a pace that feels comfortable for you.',
    rating: 4.8,
    total_reviews: 127,
    phone: '+31 20 123 4567',
    email: 'dr.wilson@praktijkepd.nl',
    availability: {
      next_available: '2024-08-05T10:00:00',
      preferred_times: ['Morning (9:00-12:00)', 'Afternoon (13:00-17:00)']
    },
    session_types: ['Individual Therapy', 'EMDR Sessions', 'Assessment', 'Follow-up']
  };

  const mockProgress: TherapyProgress = {
    sessions_completed: 8,
    total_sessions: 12,
    start_date: '2024-06-01',
    current_goals: [
      'Reduce anxiety in social situations',
      'Develop healthy coping mechanisms',
      'Improve sleep quality',
      'Build self-confidence'
    ],
    progress_notes: [
      'Significant improvement in managing anxiety symptoms',
      'Successfully implemented daily mindfulness practice',
      'Better sleep routine established',
      'Increased participation in social activities'
    ],
    next_session: '2024-08-02T14:00:00'
  };

  // Load therapist data
  useEffect(() => {
    const loadTherapistData = async () => {
      // Don't retry if we already have an error or are already loading
      if (hasErrorRef.current || loadingRef.current) return;
      
      try {
        loadingRef.current = true;
        setIsLoading(true);
        hasErrorRef.current = false;
        // Try to get real therapist data
        const response = await realApiService.client.getTherapist();
        if (response.success && response.data) {
          setTherapist({ ...mockTherapist, ...response.data });
        } else {
          setTherapist(mockTherapist);
        }
        setProgress(mockProgress);
        setIsFavorite(true);
      } catch (error: any) {
        console.error('Failed to load therapist data:', error);
        
        // Don't keep retrying if it's a rate limit or auth error
        if (error?.response?.status === 429 || error?.response?.status === 403) {
          hasErrorRef.current = true;
        }
        
        setTherapist(mockTherapist);
        setProgress(mockProgress);
        setIsFavorite(true);
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    loadTherapistData();
  }, []);

  // Handle actions
  const handleBookSession = () => {
    console.log('Redirecting to appointment booking...');
  };

  const handleSendMessage = () => {
    console.log('Opening secure messaging...');
  };

  const handleVideoCall = () => {
    console.log('Starting video session...');
  };

  const handlePhoneCall = () => {
    console.log(`Calling ${therapist?.phone}...`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating} ({therapist?.total_reviews} reviews)
        </span>
      </div>
    );
  };

  if (isLoading || !therapist || !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
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
                  <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <UserSolid className="w-12 h-12 text-white" />
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-5 h-5 text-rose-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    {therapist.name}
                  </h1>
                  <p className="text-slate-600 text-lg font-medium mb-3">{therapist.title}</p>
                  {renderRating(therapist.rating)}
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
                
                <button
                  onClick={handleVideoCall}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  <span className="font-medium">Video Call</span>
                </button>
              </div>
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
                    <h3 className="text-xl font-bold text-slate-800">About {therapist.name.split(' ')[1]}</h3>
                  </div>
                  
                  <p className="text-slate-700 mb-6 leading-relaxed">{therapist.bio}</p>
                  
                  <div className="bg-gradient-to-r from-sky-50/80 to-blue-50/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl p-6">
                    <h4 className="font-semibold text-sky-800 mb-3 flex items-center">
                      <SparklesSolid className="w-5 h-5 mr-2 text-sky-600" />
                      My Therapeutic Approach
                    </h4>
                    <p className="text-sky-700 leading-relaxed">{therapist.approach}</p>
                  </div>
                </div>
              </div>

              {/* Specializations */}
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
                    {therapist.specializations?.map((spec, index) => (
                      <span
                        key={index}
                        className="bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 px-4 py-2 rounded-2xl text-sm font-medium backdrop-blur-sm"
                      >
                        {spec}
                      </span>
                    )) || (
                      <span className="text-slate-500 italic">No specializations available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Education & Certifications */}
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
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                        <AcademicCapIcon className="w-5 h-5 mr-2 text-sky-600" />
                        Education
                      </h4>
                      <div className="space-y-2">
                        {therapist.education?.map((edu, index) => (
                          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                            <p className="text-slate-700 text-sm">{edu}</p>
                          </div>
                        )) || (
                          <p className="text-slate-500 italic text-sm">No education information available</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                        <CheckCircleSolid className="w-5 h-5 mr-2 text-emerald-600" />
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {therapist.certifications?.map((cert, index) => (
                          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                            <p className="text-slate-700 text-sm">{cert}</p>
                          </div>
                        )) || (
                          <p className="text-slate-500 italic text-sm">No certifications available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                      <div className="flex items-center space-x-3 mb-2">
                        <ClockIcon className="w-5 h-5 text-sky-500" />
                        <span className="text-sm font-semibold text-slate-800">Experience</span>
                      </div>
                      <p className="text-slate-600">{therapist.experience_years} years of practice</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPinIcon className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-800">Languages</span>
                      </div>
                      <p className="text-slate-600">{therapist.languages.join(', ')}</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                      <div className="flex items-center space-x-3 mb-2">
                        <CalendarSolid className="w-5 h-5 text-violet-500" />
                        <span className="text-sm font-semibold text-slate-800">Next Available</span>
                      </div>
                      <p className="text-slate-600">
                        {new Date(therapist.availability.next_available).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
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

              {/* Session Types */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-green-100/20 to-teal-100/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                      <CheckCircleSolid className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Session Types</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {therapist.session_types?.map((type, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                        <CheckCircleSolid className="w-5 h-5 text-emerald-500" />
                        <span className="text-slate-700 font-medium">{type}</span>
                      </div>
                    )) || (
                      <p className="text-slate-500 italic">No session types available</p>
                    )}
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
                
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-700">Sessions Completed</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {progress.sessions_completed}/{progress.total_sessions}
                    </span>
                  </div>
                  <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl h-4 border border-white/40 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-2xl transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${(progress.sessions_completed / progress.total_sessions) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    Journey started: {new Date(progress.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
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
                      <CalendarSolid className="w-6 h-6 text-sky-500" />
                      <h4 className="font-semibold text-sky-800">Remaining Sessions</h4>
                    </div>
                    <p className="text-3xl font-bold text-sky-700">
                      {progress.total_sessions - progress.sessions_completed}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Goals */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-green-100/20 to-teal-100/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                    <TrophySolid className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Current Goals</h3>
                </div>
                
                <div className="space-y-4">
                  {progress?.current_goals?.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 hover:bg-white/70 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrophySolid className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium leading-relaxed">{goal}</span>
                    </div>
                  )) || (
                    <p className="text-slate-500 italic">No current goals available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Next Session */}
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
                    {new Date(progress.next_session).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sky-600 font-semibold text-lg mb-4">
                    {new Date(progress.next_session).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <button
                    onClick={() => console.log('Session details and preparation')}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                  >
                    <SparklesSolid className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Notes */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-green-100/20 to-teal-100/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                    <CheckCircleSolid className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Progress Notes</h3>
                </div>
                
                <div className="space-y-4">
                  {progress?.progress_notes?.map((note, index) => (
                    <div key={index} className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircleSolid className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-emerald-800 font-medium text-sm leading-relaxed">{note}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-slate-500 italic">No progress notes available</p>
                  )}
                </div>
              </div>
            </div>
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
                Communicate securely with your therapist through encrypted messaging, video calls, and phone sessions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Start Conversation</span>
                </button>
                
                <button
                  onClick={handleVideoCall}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  <span>Video Call</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Secure Messaging</h4>
                  <p className="text-slate-600 text-sm">End-to-end encrypted messages between you and your therapist</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Video Sessions</h4>
                  <p className="text-slate-600 text-sm">High-quality video calls for remote therapy sessions</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Phone Support</h4>
                  <p className="text-slate-600 text-sm">Direct phone line for urgent communication needs</p>
                </div>
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
              
              <button
                onClick={() => console.log('Resources feature coming soon')}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto mb-12"
              >
                <SparklesSolid className="w-5 h-5" />
                <span>Browse Resources</span>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Worksheets</h4>
                  <p className="text-slate-600 text-sm">Interactive exercises and reflection tools for your healing journey</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HeartSolidIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Self-Care Tools</h4>
                  <p className="text-slate-600 text-sm">Mindfulness practices and wellness activities for daily life</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Reading Materials</h4>
                  <p className="text-slate-600 text-sm">Curated articles and guides selected just for you</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SparklesSolid className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Guided Exercises</h4>
                  <p className="text-slate-600 text-sm">Step-by-step therapeutic exercises for skill building</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrophySolid className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Progress Tracking</h4>
                  <p className="text-slate-600 text-sm">Tools to monitor your growth and celebrate achievements</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Session Prep</h4>
                  <p className="text-slate-600 text-sm">Materials to help you prepare for upcoming sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClientTherapist;