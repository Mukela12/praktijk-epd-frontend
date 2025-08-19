import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  ClockIcon,
  CameraIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { useAuth } from '@/store/authStore';

interface TherapistProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  specializations: string[];
  qualifications: {
    degree: string;
    institution: string;
    year: number;
  }[];
  languages: string[];
  yearsOfExperience: number;
  bio: string;
  profileImage?: string;
  registrationNumber: string;
  insuranceAccepted: string[];
  sessionTypes: string[];
  targetAge: string[];
  availability: {
    days: string[];
    hours: string;
  };
  rating: number;
  totalReviews: number;
  totalClients: number;
  completedSessions: number;
}

// Stat card component
const StatCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  color: string;
  gradient: string;
}> = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);

// Section component for profile sections
const ProfileSection: React.FC<{
  title: string;
  icon: any;
  children: React.ReactNode;
  onEdit?: () => void;
}> = ({ title, icon: Icon, children, onEdit }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const ProfessionalTherapistProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editedProfile, setEditedProfile] = useState<TherapistProfile | null>(null);
  const [availableSpecializations] = useState([
    'Cognitive Behavioral Therapy (CBT)',
    'Trauma Therapy',
    'Anxiety Disorders',
    'Depression',
    'EMDR',
    'Couples Therapy',
    'Family Therapy',
    'Child & Adolescent Therapy',
    'Addiction Counseling',
    'Grief Counseling',
    'Stress Management',
    'Anger Management',
    'Eating Disorders',
    'PTSD',
    'Bipolar Disorder',
    'Personality Disorders',
    'Psychodynamic Therapy',
    'Solution-Focused Therapy',
    'Mindfulness-Based Therapy',
    'Art Therapy',
    'Play Therapy',
    'Group Therapy',
    'Career Counseling',
    'LGBTQ+ Affirmative Therapy'
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockProfile: TherapistProfile = {
        id: user?.id || '1',
        email: user?.email || 'therapist@example.com',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        phone: '+31 6 12345678',
        address: {
          street: 'Therapielaan 123',
          city: 'Amsterdam',
          postalCode: '1234 AB',
          country: 'Netherlands'
        },
        specializations: ['Cognitive Behavioral Therapy', 'Trauma Therapy', 'Anxiety Disorders', 'Depression'],
        qualifications: [
          { degree: 'PhD in Clinical Psychology', institution: 'University of Amsterdam', year: 2015 },
          { degree: 'MSc in Psychology', institution: 'Utrecht University', year: 2010 }
        ],
        languages: ['Dutch', 'English', 'German'],
        yearsOfExperience: 12,
        bio: 'Experienced clinical psychologist specializing in evidence-based treatments for anxiety, depression, and trauma. I believe in creating a safe, supportive environment where clients can explore their thoughts and feelings while developing practical coping strategies.',
        registrationNumber: 'BIG: 12345678901',
        insuranceAccepted: ['Zilveren Kruis', 'CZ', 'VGZ', 'Menzis'],
        sessionTypes: ['Individual Therapy', 'Couples Therapy', 'Online Sessions'],
        targetAge: ['Adults (18-65)', 'Seniors (65+)'],
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '9:00 AM - 5:00 PM'
        },
        rating: 4.8,
        totalReviews: 127,
        totalClients: 89,
        completedSessions: 1234
      };
      
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    
    try {
      // TODO: Replace with actual API call
      const response = await realApiService.therapist.updateProfile(editedProfile);
      
      if (response.success) {
        setProfile(editedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    if (!editedProfile) return;
    
    const newSpecializations = editedProfile.specializations.includes(specialization)
      ? editedProfile.specializations.filter(s => s !== specialization)
      : [...editedProfile.specializations, specialization];
    
    setEditedProfile({
      ...editedProfile,
      specializations: newSpecializations
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Uploading image:', file.name);
      // Update profile with new image URL
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <UserCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h3>
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={loadProfile}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: StarIcon,
      label: 'Average Rating',
      value: profile.rating,
      color: 'text-yellow-600',
      gradient: 'bg-gradient-to-r from-yellow-50 to-amber-50'
    },
    {
      icon: UserCircleIcon,
      label: 'Total Clients',
      value: profile.totalClients,
      color: 'text-purple-600',
      gradient: 'bg-gradient-to-r from-purple-50 to-pink-50'
    },
    {
      icon: CheckCircleIcon,
      label: 'Completed Sessions',
      value: profile.completedSessions.toLocaleString(),
      color: 'text-green-600',
      gradient: 'bg-gradient-to-r from-green-50 to-emerald-50'
    },
    {
      icon: CalendarIcon,
      label: 'Years Experience',
      value: profile.yearsOfExperience,
      color: 'text-blue-600',
      gradient: 'bg-gradient-to-r from-blue-50 to-cyan-50'
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-20 h-20 text-white/80" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                <CameraIcon className="w-5 h-5 text-green-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-white/90 mb-1">{profile.registrationNumber}</p>
              <p className="text-white/80 mb-4">Clinical Psychologist</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile.specializations.slice(0, 3).map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {spec}
                  </span>
                ))}
                {profile.specializations.length > 3 && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    +{profile.specializations.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={loadProfile}
                className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bio Section */}
          <ProfileSection
            title="About Me"
            icon={SparklesIcon}
            onEdit={() => setIsEditing(true)}
          >
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </ProfileSection>

          {/* Contact Information */}
          <ProfileSection
            title="Contact Information"
            icon={EnvelopeIcon}
            onEdit={() => setIsEditing(true)}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{profile.phone}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-gray-700">
                  <p>{profile.address.street}</p>
                  <p>{profile.address.postalCode} {profile.address.city}</p>
                  <p>{profile.address.country}</p>
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Qualifications */}
          <ProfileSection
            title="Qualifications"
            icon={AcademicCapIcon}
            onEdit={() => setIsEditing(true)}
          >
            <div className="space-y-4">
              {profile.qualifications.map((qual, index) => (
                <div key={index} className="border-l-4 border-green-600 pl-4">
                  <h4 className="font-semibold text-gray-900">{qual.degree}</h4>
                  <p className="text-sm text-gray-600">{qual.institution}</p>
                  <p className="text-sm text-gray-500">{qual.year}</p>
                </div>
              ))}
            </div>
          </ProfileSection>

          {/* Services & Availability */}
          <ProfileSection
            title="Services & Availability"
            icon={ClockIcon}
            onEdit={() => setIsEditing(true)}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Session Types</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.sessionTypes.map((type, index) => (
                    <span key={index} className="px-3 py-1 bg-green-600/10 text-green-600 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Working Hours</h4>
                <p className="text-gray-700">{profile.availability.hours}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.availability.days.join(', ')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Target Age Groups</h4>
                <p className="text-gray-700">{profile.targetAge.join(', ')}</p>
              </div>
            </div>
          </ProfileSection>

          {/* Languages & Insurance */}
          <ProfileSection
            title="Languages & Insurance"
            icon={LanguageIcon}
            onEdit={() => setIsEditing(true)}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Insurance Accepted</h4>
                <div className="grid grid-cols-2 gap-2">
                  {profile.insuranceAccepted.map((insurance, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{insurance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Reviews Summary */}
          <ProfileSection
            title="Client Reviews"
            icon={StarIcon}
          >
            <div className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-gray-900 mr-2">{profile.rating}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(profile.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600">Based on {profile.totalReviews} reviews</p>
              <button className="mt-4 text-green-600 hover:text-emerald-600 transition-colors text-sm font-medium">
                View All Reviews →
              </button>
            </div>
          </ProfileSection>
        </div>

        {/* Specializations Edit Section */}
        {isEditing && editedProfile && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Specializations</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditedProfile(profile);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Select your areas of specialization. This helps clients find therapists who match their specific needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSpecializations.map((specialization) => (
                    <label
                      key={specialization}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editedProfile.specializations.includes(specialization)}
                        onChange={() => handleSpecializationToggle(specialization)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
                      />
                      <span className="text-sm text-gray-700">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Selected specializations ({editedProfile.specializations.length}):</strong>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedProfile.specializations.map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-green-600/10 text-green-700 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-gradient-to-r from-green-600/5 to-emerald-600/5 rounded-xl p-6 border border-green-600/10">
          <div className="flex items-start space-x-3">
            <LightBulbIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Development</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Continuously updating skills through workshops, conferences, and supervision. 
                Member of the Dutch Association of Psychologists (NIP) and certified in EMDR therapy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfessionalTherapistProfile;