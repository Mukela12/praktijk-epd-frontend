import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useLanguage } from '@/contexts/LanguageContext';
import notifications from '@/utils/notifications';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PsychologicalProblem {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  category: string;
  is_active: boolean;
}

interface HulpvragenSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelection?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const HulpvragenSelector: React.FC<HulpvragenSelectorProps> = ({
  value = [],
  onChange,
  maxSelection = 5,
  required = true,
  className = '',
  placeholder
}) => {
  const { language, t } = useLanguage();
  const [hulpvragen, setHulpvragen] = useState<PsychologicalProblem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load hulpvragen from API
  useEffect(() => {
    loadHulpvragen();
  }, []);

  const loadHulpvragen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Using client API which points to /public/psychological-problems endpoint
      const response = await realApiService.client.getPsychologicalProblems();
      
      if (response.success && response.data) {
        // Filter only active problems and sort alphabetically
        const activeProblems = response.data
          .filter((problem: PsychologicalProblem) => problem.is_active)
          .sort((a: PsychologicalProblem, b: PsychologicalProblem) => {
            const nameA = language === 'en' && a.name_en ? a.name_en : a.name;
            const nameB = language === 'en' && b.name_en ? b.name_en : b.name;
            return nameA.localeCompare(nameB);
          });
        
        setHulpvragen(activeProblems);
        
        if (activeProblems.length === 0) {
          notifications.warning('No psychological problems available at the moment.', {
            title: 'No Data',
            duration: 4000
          });
        }
      } else {
        throw new Error('Failed to load psychological problems');
      }
    } catch (error: any) {
      console.error('Failed to load hulpvragen:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message ||
                          t('errors.failedToLoadHulpvragen') || 
                          'Failed to load help questions. Please try again.';
      setError(errorMessage);
      notifications.error(errorMessage, {
        title: 'Loading Error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions - defined before useMemo to avoid TDZ errors

  // Get display name for category
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

  // Get display name for hulpvraag
  const getHulpvraagDisplayName = (hulpvraag: PsychologicalProblem): string => {
    return language === 'en' && hulpvraag.name_en ? hulpvraag.name_en : hulpvraag.name;
  };

  // Get description for hulpvraag
  const getHulpvraagDescription = (hulpvraag: PsychologicalProblem): string => {
    return language === 'en' && hulpvraag.description_en ? hulpvraag.description_en : hulpvraag.description;
  };

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(hulpvragen.map(h => h.category))).sort();
    return [
      { value: 'all', label: language === 'en' ? 'All Categories' : 'Alle Categorieën' },
      ...uniqueCategories.map(cat => ({
        value: cat,
        label: getCategoryDisplayName(cat)
      }))
    ];
  }, [hulpvragen, language]);

  // Filter hulpvragen based on search term and category
  const filteredHulpvragen = useMemo(() => {
    return hulpvragen.filter(hulpvraag => {
      // Category filter
      if (selectedCategory !== 'all' && hulpvraag.category !== selectedCategory) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const name = language === 'en' && hulpvraag.name_en ? hulpvraag.name_en : hulpvraag.name;
        const description = language === 'en' && hulpvraag.description_en ? hulpvraag.description_en : hulpvraag.description;
        
        return name.toLowerCase().includes(searchLower) ||
               (description && description.toLowerCase().includes(searchLower));
      }
      
      return true;
    });
  }, [hulpvragen, searchTerm, selectedCategory, language]);

  // Handle selection toggle
  const handleToggle = (hulpvraag: PsychologicalProblem) => {
    const hulpvraagName = hulpvraag.name; // Always use Dutch name as identifier
    
    if (value.includes(hulpvraagName)) {
      // Remove from selection
      onChange(value.filter(v => v !== hulpvraagName));
    } else if (value.length < maxSelection) {
      // Add to selection
      onChange([...value, hulpvraagName]);
    }
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'en' ? 'Select your concerns' : 'Selecteer uw hulpvragen'} {required && '*'}
          </label>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="medium" />
            <p className="mt-4 text-gray-600 text-sm">
              {language === 'en' ? 'Loading available help topics...' : 'Beschikbare hulponderwerpen laden...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'en' ? 'Select your concerns' : 'Selecteer uw hulpvragen'} {required && '*'}
          </label>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button 
                onClick={loadHulpvragen}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {language === 'en' ? 'Try again' : 'Probeer opnieuw'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {language === 'en' ? 'Select your concerns' : 'Selecteer uw hulpvragen'} {required && '*'}
        </label>
        <p className="text-sm text-gray-500">
          {language === 'en' 
            ? `Choose up to ${maxSelection} problems you'd like help with. This helps us find the best therapist for you.`
            : `Kies maximaal ${maxSelection} problemen waarmee u hulp wilt. Dit helpt ons de beste therapeut voor u te vinden.`
          }
        </p>
      </div>

      {/* Selection counter and clear button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className={value.length === maxSelection ? 'text-amber-600 font-medium' : ''}>
            {value.length} / {maxSelection} {language === 'en' ? 'selected' : 'geselecteerd'}
          </span>
        </div>
        {value.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {language === 'en' ? 'Clear all' : 'Alles wissen'}
          </button>
        )}
      </div>

      {/* Selected hulpvragen chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(hulpvraagName => {
            const hulpvraag = hulpvragen.find(h => h.name === hulpvraagName);
            if (!hulpvraag) return null;
            
            return (
              <div
                key={hulpvraagName}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
              >
                <CheckIcon className="w-3 h-3 mr-1.5" />
                <span>{getHulpvraagDisplayName(hulpvraag)}</span>
                <button
                  onClick={() => handleToggle(hulpvraag)}
                  className="ml-2 hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and category filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder || (language === 'en' ? 'Search concerns...' : 'Zoek hulpvragen...')}
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
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hulpvragen list */}
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md">
        {filteredHulpvragen.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {language === 'en' 
              ? 'No concerns found matching your search.'
              : 'Geen hulpvragen gevonden die overeenkomen met uw zoekopdracht.'
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredHulpvragen.map((hulpvraag) => {
              const isSelected = value.includes(hulpvraag.name);
              const isDisabled = !isSelected && value.length >= maxSelection;
              
              return (
                <label 
                  key={hulpvraag.id}
                  className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isDisabled && handleToggle(hulpvraag)}
                    disabled={isDisabled}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {getHulpvraagDisplayName(hulpvraag)}
                    </div>
                    {getHulpvraagDescription(hulpvraag) && (
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {getHulpvraagDescription(hulpvraag)}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {getCategoryDisplayName(hulpvraag.category)}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500">
        {language === 'en' 
          ? 'Your selections are private and will only be used to match you with the most suitable therapist.'
          : 'Uw selecties zijn privé en worden alleen gebruikt om u te koppelen aan de meest geschikte therapeut.'
        }
      </div>
    </div>
  );
};

export default HulpvragenSelector;