import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

interface TherapistFilters {
  status: string;
  specialization: string;
  location: string;
  reimbursement: string;
  search: string;
}

type ViewMode = 'list' | 'grid';

const AllTherapists: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<any[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<TherapistFilters>({
    status: 'all',
    specialization: 'all',
    location: 'all',
    reimbursement: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadTherapists = async () => {
      try {
        setIsLoading(true);
        const response = await realApiService.therapists.getAll();

        if (response.success && response.data) {
          // Handle both response.data.therapists and response.data formats
          const therapistsData = response.data.therapists || response.data;
          const therapistsArray = Array.isArray(therapistsData) ? therapistsData : [];
          
          // Map the data to expected format
          const mappedTherapists = therapistsArray.map((therapist: any) => ({
            ...therapist,
            name: `${therapist.first_name} ${therapist.last_name}`,
            status: therapist.user_status || therapist.status || 'active',
            specializations: Array.isArray(therapist.specializations) ? therapist.specializations : [],
            reimbursement_type: therapist.reimbursement_type || 'no_reimbursement'
          }));
          
          console.log('Loaded therapists:', mappedTherapists.length);
          setTherapists(mappedTherapists);
          setFilteredTherapists(mappedTherapists);
        } else {
          console.log('No therapists data in response');
          setTherapists([]);
          setFilteredTherapists([]);
        }
      } catch (error) {
        console.error('Failed to load therapists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTherapists();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...therapists];

    if (filters.search) {
      filtered = filtered.filter(therapist =>
        therapist.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        therapist.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (therapist.specializations && therapist.specializations.some((spec: string) => 
          spec.toLowerCase().includes(filters.search.toLowerCase())
        ))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(therapist => therapist.status === filters.status);
    }

    if (filters.specialization !== 'all') {
      filtered = filtered.filter(therapist => 
        therapist.specializations && therapist.specializations.includes(filters.specialization)
      );
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(therapist => therapist.location === filters.location);
    }

    if (filters.reimbursement !== 'all') {
      filtered = filtered.filter(therapist => therapist.reimbursement_type === filters.reimbursement);
    }

    setFilteredTherapists(filtered);
  }, [therapists, filters]);

  // Reimbursement status colors (from specification)
  const getReimbursementColor = (type: string) => {
    switch (type) {
      case 'agb_reimbursed': // Green: Has AGB code, insurance reimbursed
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'basic_reimbursement': // Orange: Municipality/special programs
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'no_reimbursement': // Red: Client pays out of pocket
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'on_vacation': // Orange: Not available for sessions
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'day_off': // Yellow: Temporary unavailability
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getReimbursementLabel = (type: string) => {
    switch (type) {
      case 'agb_reimbursed':
        return t('therapistStatus.agbReimbursed');
      case 'basic_reimbursement':
        return t('therapistStatus.basicReimbursement');
      case 'no_reimbursement':
        return t('therapistStatus.noReimbursement');
      case 'on_vacation':
        return t('therapistStatus.onVacation');
      case 'day_off':
        return t('therapistStatus.dayOff');
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'vacation':
        return <ClockIcon className="w-5 h-5 text-orange-600" />;
      case 'inactive':
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get unique values for filters
  const specializations = [...new Set(Array.isArray(therapists) ? therapists.flatMap(t => Array.isArray(t.specializations) ? t.specializations : []) : [])];
  const locations = [...new Set(Array.isArray(therapists) ? therapists.map(t => t.location).filter(Boolean) : [])];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('therapists.title')}</h1>
            <p className="text-red-100 mt-1">
              {t('therapists.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-red-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-red-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => navigate('/admin/therapist-management')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>{t('therapists.addNewTherapist')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('therapists.totalTherapists')}</p>
              <p className="text-2xl font-semibold text-gray-900">{therapists.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('therapists.activeTherapists')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {therapists.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('therapists.onVacation')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {therapists.filter(t => t.status === 'vacation').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('therapists.agbReimbursed')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {therapists.filter(t => t.reimbursement_type === 'agb_reimbursed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('therapists.searchTherapists')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="vacation">On Vacation</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reimbursement</label>
                <select
                  value={filters.reimbursement}
                  onChange={(e) => setFilters({ ...filters, reimbursement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="agb_reimbursed">AGB Reimbursed</option>
                  <option value="basic_reimbursement">Basic Reimbursement</option>
                  <option value="no_reimbursement">No Reimbursement</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Therapists Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapists.map((therapist) => (
                <div 
                  key={therapist.id} 
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden group ${getReimbursementColor(therapist.reimbursement_type).replace('bg-', 'border-').replace('-100', '-200')}`}
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-100/0 group-hover:from-red-50/50 group-hover:to-red-100/30 transition-all duration-300 pointer-events-none" />
                  {/* Profile Header */}
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        {therapist.profile_photo || therapist.profile_photo_url ? (
                          <img 
                            src={therapist.profile_photo || therapist.profile_photo_url} 
                            alt={therapist.name}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                            <span className="text-xl font-bold text-white">
                              {therapist.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900">
                          {therapist.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{therapist.email}</p>
                        <div className="flex items-center flex-wrap gap-2">
                          {getStatusIcon(therapist.status)}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getReimbursementColor(therapist.reimbursement_type)}`}>
                            {getReimbursementLabel(therapist.reimbursement_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="relative z-10 space-y-3 mb-4 bg-gray-50 rounded-lg p-4">
                    {therapist.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{therapist.phone}</span>
                      </div>
                    )}
                    {therapist.location || therapist.city && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{therapist.location || therapist.city || 'Amsterdam'}</span>
                      </div>
                    )}
                    {therapist.agb_code && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ShieldCheckIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">AGB: {therapist.agb_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Specializations */}
                  {therapist.specializations && therapist.specializations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-start">
                        <AcademicCapIcon className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1">
                            {therapist.specializations.slice(0, 3).map((spec: string, index: number) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {spec}
                              </span>
                            ))}
                            {therapist.specializations.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                +{therapist.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-900">{therapist.current_clients || therapist.active_clients || 0}</p>
                      <p className="text-xs text-red-700 font-medium">Active Clients</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-rose-900">{therapist.max_clients || 20}</p>
                      <p className="text-xs text-rose-700 font-medium">Max Capacity</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => navigate(`/admin/therapist-management?view=${therapist.id}`)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/therapist-management?edit=${therapist.id}`)}
                        className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit Profile"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.alert('Message feature coming soon!')}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Send Message"
                      >
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => navigate(`/admin/therapist-management?view=${therapist.id}`)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // List view
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specializations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {therapist.profile_photo || therapist.profile_photo_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={therapist.profile_photo || therapist.profile_photo_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600">
                                {therapist.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{therapist.name}</div>
                          <div className="text-sm text-gray-500">{therapist.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{therapist.phone || 'No phone'}</div>
                      <div className="text-sm text-gray-500">{therapist.location || therapist.city || 'Amsterdam'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(therapist.specializations) && therapist.specializations.slice(0, 2).map((spec: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {spec}
                          </span>
                        ))}
                        {Array.isArray(therapist.specializations) && therapist.specializations.length > 2 && (
                          <span className="text-xs text-gray-500">+{therapist.specializations.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(therapist.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReimbursementColor(therapist.reimbursement_type)}`}>
                          {getReimbursementLabel(therapist.reimbursement_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {therapist.current_clients || therapist.active_clients || 0} / {therapist.max_clients || 20}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/therapist-management?view=${therapist.id}`)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/therapist-management?edit=${therapist.id}`)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTherapists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-full p-6 mb-6">
              <UsersIcon className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('therapists.noTherapistsFound') || 'No Therapists Found'}</h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              {filters.search || filters.status !== 'all' || filters.specialization !== 'all' || filters.location !== 'all' || filters.reimbursement !== 'all'
                ? t('therapists.adjustFilters') || 'Try adjusting your filters to find more therapists'
                : t('therapists.getStarted') || 'Get started by adding your first therapist to the system'}
            </p>
            {!(filters.search || filters.status !== 'all' || filters.specialization !== 'all' || filters.location !== 'all' || filters.reimbursement !== 'all') && (
              <button 
                onClick={() => navigate('/admin/therapist-management')}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add First Therapist
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTherapists;