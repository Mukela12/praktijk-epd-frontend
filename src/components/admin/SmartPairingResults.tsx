import React, { useState } from 'react';
import {
  SparklesIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  LanguageIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';

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

interface SmartPairingResultsProps {
  pairingResults: Array<{
    client: {
      id: string;
      client_name: string;
      email: string;
      hulpvragen?: string[];
      urgency?: string;
    };
    recommendations: TherapistRecommendation[];
  }>;
  onAssignTherapist: (clientId: string, therapistId: string) => void;
  onClose: () => void;
}

const SmartPairingResults: React.FC<SmartPairingResultsProps> = ({
  pairingResults,
  onAssignTherapist,
  onClose
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [assigningTherapists, setAssigningTherapists] = useState<Set<string>>(new Set());

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleAssign = async (clientId: string, therapistId: string) => {
    const key = `${clientId}-${therapistId}`;
    setAssigningTherapists(prev => new Set([...prev, key]));
    
    try {
      await onAssignTherapist(clientId, therapistId);
      setAssigningTherapists(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } catch (error) {
      setAssigningTherapists(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Calculate overall stats
  const totalRecommendations = pairingResults.reduce((sum, result) => sum + result.recommendations.length, 0);
  const averageScore = pairingResults.reduce((sum, result) => {
    const avgScore = result.recommendations.reduce((s, rec) => s + rec.score, 0) / (result.recommendations.length || 1);
    return sum + avgScore;
  }, 0) / (pairingResults.length || 1);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Pairing Results</h2>
              <p className="text-sm text-gray-600">AI-powered therapist recommendations</p>
            </div>
          </div>
          
          <PremiumButton
            variant="outline"
            onClick={onClose}
            className="text-gray-600"
          >
            Close Results
          </PremiumButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Clients Processed</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{pairingResults.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total Recommendations</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalRecommendations}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Average Match</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">{Math.round(averageScore)}%</p>
          </div>
        </div>
      </PremiumCard>

      {/* Client Results */}
      {pairingResults.map((result, index) => (
        <PremiumCard key={result.client.id}>
          {/* Client Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{result.client.client_name}</h3>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{result.client.email}</span>
                  {result.client.urgency && (
                    <StatusBadge 
                      status={result.client.urgency} 
                      type={result.client.urgency as any} 
                      size="sm" 
                    />
                  )}
                </div>
                {result.client.hulpvragen && result.client.hulpvragen.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.client.hulpvragen.slice(0, 3).map((problem, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {problem}
                      </span>
                    ))}
                    {result.client.hulpvragen.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                        +{result.client.hulpvragen.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {result.recommendations.length} recommendation{result.recommendations.length !== 1 ? 's' : ''}
              </span>
              <PremiumButton
                variant="outline"
                icon={expandedClients.has(result.client.id) ? ChevronUpIcon : ChevronDownIcon}
                onClick={() => toggleClientExpansion(result.client.id)}
                size="sm"
              >
                {expandedClients.has(result.client.id) ? 'Hide' : 'Show'} Recommendations
              </PremiumButton>
            </div>
          </div>

          {/* Recommendations Grid */}
          {expandedClients.has(result.client.id) && (
            <div className="border-t border-gray-200 pt-4">
              {result.recommendations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.recommendations.map((recommendation) => (
                    <div key={recommendation.therapistId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {/* Therapist Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Dr. {recommendation.therapistName}</h4>
                            <p className="text-xs text-gray-500">
                              {recommendation.details.yearsExperience} years • {recommendation.details.totalClients} clients
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreColor(recommendation.score)}`}>
                          {Math.round(recommendation.score)}%
                        </div>
                      </div>

                      {/* Key Factors */}
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Problem Match:</span>
                            <span className="font-medium">{Math.round(recommendation.factors.hulpvragen * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Availability:</span>
                            <span className="font-medium">{Math.round(recommendation.factors.availability * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Specialization:</span>
                            <span className="font-medium">{Math.round(recommendation.factors.specialization * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Experience:</span>
                            <span className="font-medium">{Math.round(recommendation.factors.experience * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Specializations */}
                      {recommendation.details.specializations.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {recommendation.details.specializations.slice(0, 2).map((spec, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rating */}
                      {recommendation.details.successRate && (
                        <div className="flex items-center space-x-1 mb-3">
                          <div className="flex">
                            {renderStarRating(recommendation.details.successRate)}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({recommendation.details.successRate.toFixed(1)})
                          </span>
                        </div>
                      )}

                      {/* Availability */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{recommendation.details.availableSlots} slots</span>
                        </span>
                        {recommendation.details.languages.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <LanguageIcon className="w-3 h-3" />
                            <span>{recommendation.details.languages.join(', ')}</span>
                          </span>
                        )}
                      </div>

                      {/* Assign Button */}
                      <PremiumButton
                        variant="primary"
                        icon={CheckCircleIcon}
                        onClick={() => handleAssign(result.client.id, recommendation.therapistId)}
                        disabled={assigningTherapists.has(`${result.client.id}-${recommendation.therapistId}`)}
                        className="w-full"
                        size="sm"
                      >
                        {assigningTherapists.has(`${result.client.id}-${recommendation.therapistId}`) 
                          ? 'Assigning...' 
                          : 'Assign Therapist'}
                      </PremiumButton>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No suitable therapist matches found for this client.</p>
                </div>
              )}
            </div>
          )}
        </PremiumCard>
      ))}
    </div>
  );
};

export default SmartPairingResults;