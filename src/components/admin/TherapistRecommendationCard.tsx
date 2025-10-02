import React from 'react';
import {
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  LanguageIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface TherapistRecommendation {
  therapistId: string;
  therapistName: string;
  score: number;
  factors: {
    availability: number;
    hulpvragen: number;
    specialization: number;
    experience: number;
    successRate: number;
    distance: number;
    language: number;
    gender: number;
  };
  details: {
    specializations: string[];
    hulpvragenExpertise: string[];
    availableSlots: number;
    languages: string[];
    yearsExperience: number;
    totalClients: number;
    successRate?: number;
    distanceKm?: number;
  };
}

interface TherapistRecommendationCardProps {
  recommendation: TherapistRecommendation;
  onAssign: (therapistId: string) => void;
  isLoading?: boolean;
  clientName?: string;
}

const TherapistRecommendationCard: React.FC<TherapistRecommendationCardProps> = ({
  recommendation,
  onAssign,
  isLoading = false,
  clientName
}) => {
  const { therapistId, therapistName, score, factors, details } = recommendation;

  // Get score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Get factor color and icon
  const getFactorDisplay = (factorKey: string, value: number) => {
    const percentage = Math.round(value * 100);
    const isHigh = percentage >= 75;
    const isMedium = percentage >= 50;
    
    const icons = {
      hulpvragen: '🧠',
      availability: '⏰', 
      specialization: '🎯',
      experience: '📚',
      successRate: '⭐',
      distance: '📍',
      language: '🌐',
      gender: '👤'
    };

    return {
      icon: icons[factorKey as keyof typeof icons] || '•',
      color: isHigh ? 'text-green-600' : isMedium ? 'text-blue-600' : 'text-gray-500',
      percentage
    };
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header with therapist info and score */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Dr. {therapistName}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{details.yearsExperience} years experience</span>
                <span>•</span>
                <span>{details.totalClients} clients</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {Math.round(score)}% match
          </div>
        </div>
        
        {/* Success rate */}
        {details.successRate && (
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-sm text-gray-600">Rating:</span>
            <div className="flex items-center space-x-1">
              {renderStarRating(details.successRate)}
              <span className="text-sm text-gray-500 ml-1">
                ({details.successRate.toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Matching factors */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Matching Factors</h4>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(factors).map(([factorKey, value]) => {
            const display = getFactorDisplay(factorKey, value);
            return (
              <div key={factorKey} className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <span>{display.icon}</span>
                  <span className="capitalize text-gray-600">
                    {factorKey === 'hulpvragen' ? 'Problem Match' : factorKey}
                  </span>
                </span>
                <span className={`font-medium ${display.color}`}>
                  {display.percentage}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Specializations */}
        {details.specializations.length > 0 && (
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-600">Specializations:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {details.specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
              {details.specializations.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{details.specializations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Hulpvragen expertise */}
        {details.hulpvragenExpertise.length > 0 && (
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-600">Problem Expertise:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {details.hulpvragenExpertise.slice(0, 2).map((expertise, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                >
                  {expertise}
                </span>
              ))}
              {details.hulpvragenExpertise.length > 2 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{details.hulpvragenExpertise.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Additional info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{details.availableSlots} slots available</span>
            </span>
            
            {details.languages.length > 0 && (
              <span className="flex items-center space-x-1">
                <LanguageIcon className="w-3 h-3" />
                <span>{details.languages.join(', ')}</span>
              </span>
            )}
          </div>
          
          {details.distanceKm && (
            <span className="flex items-center space-x-1">
              <MapPinIcon className="w-3 h-3" />
              <span>{details.distanceKm}km away</span>
            </span>
          )}
        </div>

        {/* Assignment button */}
        <button
          onClick={() => onAssign(therapistId)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Assigning...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              <span>
                Assign {clientName ? `to ${clientName}` : 'This Therapist'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TherapistRecommendationCard;