import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface HulpvragenExpertise {
  problem_category: string;
  expertise_level: number;
  years_experience: number;
  success_rate?: number;
  problem_name: string;
  problem_description: string;
  problem_name_en?: string;
  problem_description_en?: string;
}

interface AvailableHulpvraag {
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  category: string;
  is_active: boolean;
}

interface HulpvragenTabProps {
  therapistId: string;
  therapistName?: string;
}

const HulpvragenTab: React.FC<HulpvragenTabProps> = ({ therapistId, therapistName }) => {
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();
  
  const [expertise, setExpertise] = useState<HulpvragenExpertise[]>([]);
  const [availableHulpvragen, setAvailableHulpvragen] = useState<AvailableHulpvraag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadHulpvragenData();
  }, [therapistId]);

  const loadHulpvragenData = async () => {
    try {
      setIsLoading(true);
      const response = await realApiService.admin.getTherapistHulpvragen(therapistId);
      
      if (response.success && response.data) {
        setExpertise(response.data.expertise || []);
        setAvailableHulpvragen(response.data.availableHulpvragen || []);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load hulpvragen data',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (hulpvraag: AvailableHulpvraag): string => {
    return language === 'en' && hulpvraag.name_en ? hulpvraag.name_en : hulpvraag.name;
  };

  const getDisplayDescription = (hulpvraag: AvailableHulpvraag): string => {
    return language === 'en' && hulpvraag.description_en ? hulpvraag.description_en : hulpvraag.description;
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, { nl: string; en: string }> = {
      'physical': { nl: 'Lichamelijk', en: 'Physical' },
      'anxiety': { nl: 'Angst', en: 'Anxiety' },
      'mood': { nl: 'Stemming', en: 'Mood' },
      'stress': { nl: 'Stress', en: 'Stress' },
      'trauma': { nl: 'Trauma', en: 'Trauma' },
      'relationships': { nl: 'Relaties', en: 'Relationships' },
      'behavior': { nl: 'Gedrag', en: 'Behavior' },
      'addiction': { nl: 'Verslaving', en: 'Addiction' },
      'self_esteem': { nl: 'Zelfbeeld', en: 'Self-esteem' },
      'family': { nl: 'Familie', en: 'Family' },
      'life_transitions': { nl: 'Levensveranderingen', en: 'Life Transitions' },
      'emotional': { nl: 'Emotioneel', en: 'Emotional' },
      'personality': { nl: 'Persoonlijkheid', en: 'Personality' },
      'neurodevelopmental': { nl: 'Ontwikkeling', en: 'Development' },
      'eating': { nl: 'Eetstoornis', en: 'Eating' },
      'other': { nl: 'Overig', en: 'Other' }
    };
    
    return categoryNames[category] 
      ? categoryNames[category][language as keyof typeof categoryNames[typeof category]]
      : category;
  };

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(availableHulpvragen.map(h => h.category))).sort();
    return [
      { value: 'all', label: language === 'en' ? 'All Categories' : 'Alle Categorieën' },
      ...categories.map(cat => ({
        value: cat,
        label: getCategoryDisplayName(cat)
      }))
    ];
  };

  const filteredHulpvragen = availableHulpvragen.filter(hulpvraag => {
    // Category filter
    if (selectedCategory !== 'all' && hulpvraag.category !== selectedCategory) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const name = getDisplayName(hulpvraag);
      const description = getDisplayDescription(hulpvraag);
      
      return name.toLowerCase().includes(searchLower) ||
             description.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const getExpertiseLevel = (problemName: string): number => {
    const expertiseItem = expertise.find(e => e.problem_category === problemName);
    return expertiseItem ? expertiseItem.expertise_level : 0;
  };

  const getYearsExperience = (problemName: string): number => {
    const expertiseItem = expertise.find(e => e.problem_category === problemName);
    return expertiseItem ? expertiseItem.years_experience : 0;
  };

  const updateExpertise = (problemName: string, level: number, years: number = 0) => {
    if (level === 0) {
      // Remove expertise
      setExpertise(prev => prev.filter(e => e.problem_category !== problemName));
    } else {
      // Add or update expertise
      setExpertise(prev => {
        const existing = prev.find(e => e.problem_category === problemName);
        if (existing) {
          return prev.map(e => 
            e.problem_category === problemName 
              ? { ...e, expertise_level: level, years_experience: years }
              : e
          );
        } else {
          const hulpvraag = availableHulpvragen.find(h => h.name === problemName);
          return [...prev, {
            problem_category: problemName,
            expertise_level: level,
            years_experience: years,
            problem_name: hulpvraag?.name || problemName,
            problem_description: hulpvraag?.description || '',
            problem_name_en: hulpvraag?.name_en,
            problem_description_en: hulpvraag?.description_en
          }];
        }
      });
    }
  };

  const saveExpertise = async () => {
    try {
      setIsSaving(true);
      
      const hulpvragenExpertise = expertise.map(e => ({
        problem_category: e.problem_category,
        expertise_level: e.expertise_level,
        years_experience: e.years_experience,
        success_rate: e.success_rate
      }));

      const response = await realApiService.admin.updateTherapistHulpvragen(therapistId, hulpvragenExpertise);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Hulpvragen expertise updated successfully',
          duration: 5000
        });
        setIsEditing(false);
        await loadHulpvragenData(); // Reload to get fresh data
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update hulpvragen expertise',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getExpertiseLevelText = (level: number): { text: string; color: string } => {
    switch (level) {
      case 1: return { text: language === 'en' ? 'Basic' : 'Basis', color: 'text-gray-600' };
      case 2: return { text: language === 'en' ? 'Fair' : 'Redelijk', color: 'text-yellow-600' };
      case 3: return { text: language === 'en' ? 'Good' : 'Goed', color: 'text-blue-600' };
      case 4: return { text: language === 'en' ? 'Very Good' : 'Zeer Goed', color: 'text-green-600' };
      case 5: return { text: language === 'en' ? 'Expert' : 'Expert', color: 'text-purple-600' };
      default: return { text: language === 'en' ? 'No Expertise' : 'Geen Expertise', color: 'text-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AcademicCapIcon className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'en' ? 'Hulpvragen Expertise' : 'Hulpvragen Expertise'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en' 
                    ? `Manage ${therapistName || 'therapist'}'s expertise in different problem areas`
                    : `Beheer de expertise van ${therapistName || 'therapeut'} in verschillende probleemgebieden`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {expertise.length > 0 && (
                <span className="text-sm text-gray-500">
                  {expertise.length} {language === 'en' ? 'expertise areas' : 'expertisegebieden'}
                </span>
              )}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Edit Expertise' : 'Expertise Bewerken'}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadHulpvragenData(); // Reset changes
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    {language === 'en' ? 'Cancel' : 'Annuleren'}
                  </button>
                  <button
                    onClick={saveExpertise}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="small" className="mr-2" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                    )}
                    {language === 'en' ? 'Save Changes' : 'Wijzigingen Opslaan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Expertise Summary */}
        {expertise.length > 0 && !isEditing && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {language === 'en' ? 'Current Expertise Areas' : 'Huidige Expertisegebieden'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expertise.map((exp) => {
                const levelInfo = getExpertiseLevelText(exp.expertise_level);
                return (
                  <div key={exp.problem_category} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="font-medium text-sm text-gray-900">
                      {language === 'en' && exp.problem_name_en ? exp.problem_name_en : exp.problem_name}
                    </div>
                    <div className={`text-sm font-medium ${levelInfo.color}`}>
                      {levelInfo.text} ({exp.expertise_level}/5)
                    </div>
                    {exp.years_experience > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {exp.years_experience} {language === 'en' ? 'years experience' : 'jaar ervaring'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Editing Mode */}
        {isEditing && (
          <div className="px-6 py-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search hulpvragen...' : 'Zoek hulpvragen...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getUniqueCategories().map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hulpvragen List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredHulpvragen.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {language === 'en' 
                    ? 'No hulpvragen found matching your search.'
                    : 'Geen hulpvragen gevonden die overeenkomen met uw zoekopdracht.'
                  }
                </div>
              ) : (
                filteredHulpvragen.map((hulpvraag) => {
                  const currentLevel = getExpertiseLevel(hulpvraag.name);
                  const currentYears = getYearsExperience(hulpvraag.name);
                  
                  return (
                    <div key={hulpvraag.name} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="font-medium text-gray-900">
                            {getDisplayName(hulpvraag)}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {getDisplayDescription(hulpvraag)}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                            {getCategoryDisplayName(hulpvraag.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {language === 'en' ? 'Expertise Level' : 'Expertise Niveau'}
                            </label>
                            <select
                              value={currentLevel}
                              onChange={(e) => updateExpertise(hulpvraag.name, parseInt(e.target.value), currentYears)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="0">{language === 'en' ? 'No Expertise' : 'Geen Expertise'}</option>
                              <option value="1">{language === 'en' ? 'Basic (1)' : 'Basis (1)'}</option>
                              <option value="2">{language === 'en' ? 'Fair (2)' : 'Redelijk (2)'}</option>
                              <option value="3">{language === 'en' ? 'Good (3)' : 'Goed (3)'}</option>
                              <option value="4">{language === 'en' ? 'Very Good (4)' : 'Zeer Goed (4)'}</option>
                              <option value="5">{language === 'en' ? 'Expert (5)' : 'Expert (5)'}</option>
                            </select>
                          </div>
                          
                          {currentLevel > 0 && (
                            <div className="text-right">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'en' ? 'Years Experience' : 'Jaren Ervaring'}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={currentYears}
                                onChange={(e) => updateExpertise(hulpvraag.name, currentLevel, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {expertise.length === 0 && !isEditing && (
          <div className="px-6 py-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'en' ? 'No Expertise Defined' : 'Geen Expertise Gedefinieerd'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'en' 
                ? 'This therapist has no hulpvragen expertise areas defined yet.'
                : 'Deze therapeut heeft nog geen hulpvragen expertisegebieden gedefinieerd.'
              }
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Expertise' : 'Expertise Toevoegen'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HulpvragenTab;