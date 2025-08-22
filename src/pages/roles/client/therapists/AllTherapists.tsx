import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
  GlobeAltIcon,
  StarIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { realApiService } from '@/services/realApi';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import PageTransition from '@/components/ui/PageTransition';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specializations: string[];
  languages_spoken?: string[];
  therapy_types?: string;
  bio?: string;
  years_of_experience?: number;
  accepts_insurance?: boolean;
  online_therapy_available?: boolean;
  availability_status?: 'available' | 'busy' | 'unavailable';
  rating?: number;
  total_reviews?: number;
  city?: string;
  profile_image?: string;
  profile_photo_url?: string;
  photo_url?: string;
  user_id?: string;
}

const AllTherapists: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error: errorAlert, info } = useAlert();
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: 'all',
    language: 'all',
    availability: 'all',
    insuranceAccepted: 'all',
    onlineTherapy: 'all'
  });

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      // Get all therapists available for booking
      const response = await realApiService.therapists.getAll({ status: 'active' });
      
      if (response.success && response.data) {
        const therapistsList = response.data.therapists || response.data || [];
        // Enhance therapist data with additional info
        const enhancedTherapists = therapistsList.map((therapist: any) => ({
          ...therapist,
          availability_status: 'available', // All active therapists are available for booking
          rating: therapist.rating || 4.5,
          total_reviews: therapist.total_reviews || 0,
          city: therapist.city || therapist.location || 'Amsterdam',
          languages_spoken: therapist.languages_spoken || ['Dutch', 'English'],
          years_of_experience: therapist.years_of_experience || 5,
          accepts_insurance: therapist.accepts_insurance !== false,
          online_therapy_available: therapist.online_therapy_available === true
        }));
        setTherapists(enhancedTherapists);
      }
    } catch (err: any) {
      // If endpoint fails, show empty state
      setTherapists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockTherapists = (): Therapist[] => {
    return [
      {
        id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+31 6 12345678',
        specializations: ['Anxiety', 'Depression', 'Trauma'],
        languages_spoken: ['English', 'Dutch'],
        therapy_types: 'CBT, EMDR',
        bio: 'Experienced therapist specializing in anxiety and trauma treatment.',
        years_of_experience: 8,
        accepts_insurance: true,
        online_therapy_available: true,
        availability_status: 'available',
        rating: 4.8,
        total_reviews: 42,
        city: 'Amsterdam'
      },
      {
        id: '2',
        first_name: 'Michael',
        last_name: 'van der Berg',
        email: 'michael.vanderberg@example.com',
        phone: '+31 6 87654321',
        specializations: ['Relationship Issues', 'Family Therapy', 'Depression'],
        languages_spoken: ['Dutch', 'English', 'German'],
        therapy_types: 'Family Therapy, Couples Therapy',
        bio: 'Helping families and couples build stronger relationships.',
        years_of_experience: 12,
        accepts_insurance: true,
        online_therapy_available: false,
        availability_status: 'busy',
        rating: 4.6,
        total_reviews: 38,
        city: 'Utrecht'
      },
      {
        id: '3',
        first_name: 'Emma',
        last_name: 'de Vries',
        email: 'emma.devries@example.com',
        specializations: ['Stress Management', 'Burnout', 'Work-Life Balance'],
        languages_spoken: ['Dutch', 'English', 'French'],
        therapy_types: 'Mindfulness-Based Therapy',
        bio: 'Specializing in workplace stress and burnout prevention.',
        years_of_experience: 6,
        accepts_insurance: false,
        online_therapy_available: true,
        availability_status: 'available',
        rating: 4.9,
        total_reviews: 28,
        city: 'Rotterdam'
      }
    ];
  };

  const handleBookAppointment = (therapistId: string) => {
    // Navigate to book appointment with pre-selected therapist
    navigate('/client/appointments/new', { state: { preselectedTherapistId: therapistId } });
  };

  const handleViewProfile = (therapistId: string) => {
    info(t('therapists.profileViewComingSoon'));
  };

  // Get unique values for filters
  const allSpecializations = [...new Set(therapists.flatMap(t => t.specializations || []))];
  const allLanguages = [...new Set(therapists.flatMap(t => t.languages_spoken || []))];

  // Filter therapists
  const filteredTherapists = therapists.filter(therapist => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        therapist.first_name.toLowerCase().includes(query) ||
        therapist.last_name.toLowerCase().includes(query) ||
        therapist.specializations?.some(s => s.toLowerCase().includes(query)) ||
        therapist.bio?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Specialization filter
    if (filters.specialization !== 'all' && 
        !therapist.specializations?.includes(filters.specialization)) {
      return false;
    }

    // Language filter
    if (filters.language !== 'all' && 
        !therapist.languages_spoken?.includes(filters.language)) {
      return false;
    }

    // Availability filter
    if (filters.availability !== 'all' && 
        therapist.availability_status !== filters.availability) {
      return false;
    }

    // Insurance filter
    if (filters.insuranceAccepted !== 'all') {
      const acceptsInsurance = filters.insuranceAccepted === 'yes';
      if (therapist.accepts_insurance !== acceptsInsurance) return false;
    }

    // Online therapy filter
    if (filters.onlineTherapy !== 'all') {
      const offersOnline = filters.onlineTherapy === 'yes';
      if (therapist.online_therapy_available !== offersOnline) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <UserGroupIcon className="w-8 h-8 mr-3" />
                {t('nav.allTherapists') || 'All Therapists'}
              </h1>
              <p className="text-purple-100">
                Find and book appointments with our experienced therapists
              </p>
            </div>
            <div className="hidden lg:block">
              <SparklesIcon className="w-16 h-16 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <PremiumCard>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <PremiumButton
                variant="outline"
                icon={FunnelIcon}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </PremiumButton>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Specializations</option>
                    {allSpecializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Languages</option>
                    {allLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accepts Insurance
                  </label>
                  <select
                    value={filters.insuranceAccepted}
                    onChange={(e) => setFilters({ ...filters, insuranceAccepted: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Online Therapy
                  </label>
                  <select
                    value={filters.onlineTherapy}
                    onChange={(e) => setFilters({ ...filters, onlineTherapy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All</option>
                    <option value="yes">Available</option>
                    <option value="no">Not Available</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(searchQuery || Object.values(filters).some(v => v !== 'all')) && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    Search: {searchQuery}
                  </span>
                )}
                {Object.entries(filters).map(([key, value]) => 
                  value !== 'all' && (
                    <span key={key} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {key}: {value}
                    </span>
                  )
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      specialization: 'all',
                      language: 'all',
                      availability: 'all',
                      insuranceAccepted: 'all',
                      onlineTherapy: 'all'
                    });
                  }}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredTherapists.length} of {therapists.length} therapists
        </div>

        {/* Therapists Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredTherapists.length === 0 ? (
          <PremiumEmptyState
            icon={UserGroupIcon}
            title={t('therapists.viewNotAvailable') || 'Therapist Directory Not Available'}
            description={t('therapists.contactForInfo') || 'This feature requires backend implementation. Please contact your therapist for information about other practitioners.'}
            action={{
              label: t('nav.viewYourTherapist') || 'View Your Therapist',
              onClick: () => navigate('/client/therapist')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
              <PremiumCard key={therapist.id} hover className="overflow-hidden">
                <div className="space-y-4">
                  {/* Header with Avatar and Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <ProfilePhotoUpload
                        userId={therapist.user_id || therapist.id}
                        currentPhotoUrl={therapist.profile_photo_url || therapist.photo_url || therapist.profile_image}
                        size="small"
                        editable={false}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {therapist.first_name} {therapist.last_name}
                        </h3>
                        {therapist.years_of_experience && (
                          <p className="text-sm text-gray-600">
                            {therapist.years_of_experience} years experience
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      therapist.availability_status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {therapist.availability_status === 'available' ? 'Available' : 'Busy'}
                    </div>
                  </div>

                  {/* Rating */}
                  {therapist.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(therapist.rating!) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {therapist.rating.toFixed(1)} ({therapist.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {therapist.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {therapist.bio}
                    </p>
                  )}

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations?.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                    {therapist.specializations && therapist.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{therapist.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {therapist.city || 'Amsterdam'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <GlobeAltIcon className="w-4 h-4 mr-1" />
                      {therapist.languages_spoken?.join(', ') || 'Dutch, English'}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-center space-x-4 text-sm">
                    {therapist.accepts_insurance && (
                      <div className="flex items-center text-green-600">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Insurance
                      </div>
                    )}
                    {therapist.online_therapy_available && (
                      <div className="flex items-center text-blue-600">
                        <VideoCameraIcon className="w-4 h-4 mr-1" />
                        Online
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t">
                    <PremiumButton
                      variant="primary"
                      size="sm"
                      icon={CalendarIcon}
                      onClick={() => handleBookAppointment(therapist.id)}
                      className="flex-1"
                      disabled={therapist.availability_status !== 'available'}
                    >
                      Book Session
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(therapist.id)}
                      className="flex-1"
                    >
                      View Profile
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AllTherapists;