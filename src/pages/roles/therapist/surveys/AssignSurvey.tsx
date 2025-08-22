import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { Client } from '@/types/entities';
import { formatDate } from '@/utils/dateFormatters';

// Client selection card
interface ClientCardProps {
  client: Client;
  isSelected: boolean;
  onToggle: () => void;
  hasExistingAssignment?: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ 
  client, 
  isSelected, 
  onToggle, 
  hasExistingAssignment 
}) => {
  return (
    <div 
      onClick={onToggle}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-green-600 bg-green-50' 
          : hasExistingAssignment
          ? 'border-orange-200 bg-orange-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-green-600' : 'bg-gray-200'
          }`}>
            {isSelected ? (
              <CheckIcon className="w-6 h-6 text-white" />
            ) : (
              <span className={`text-sm font-medium ${
                hasExistingAssignment ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {client.first_name.charAt(0)}{client.last_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {client.first_name} {client.last_name}
            </h4>
            <p className="text-sm text-gray-600">{client.email}</p>
          </div>
        </div>
        {hasExistingAssignment && (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            Already assigned
          </span>
        )}
      </div>
    </div>
  );
};

const AssignSurvey: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { surveyId } = useParams();
  
  const [survey, setSurvey] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Assignment settings
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [notes, setNotes] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  useEffect(() => {
    loadData();
  }, [surveyId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load survey details and clients in parallel
      const [surveyResponse, clientsResponse] = await Promise.all([
        realApiService.surveys.getSurveyById(surveyId!),
        realApiService.therapist.getClients()
      ]);
      
      if (surveyResponse.success && clientsResponse.success) {
        if (surveyResponse.data) {
          setSurvey(surveyResponse.data);
        } else {
          throw new Error('Survey not found');
        }
        
        // Filter active clients only
        const responseData = clientsResponse.data as any;
        const clientsData = responseData?.clients || responseData || [];
        const activeClients = (Array.isArray(clientsData) ? clientsData : []).filter(
          (client: any) => client.status === 'active'
        );
        setClients(activeClients as unknown as Client[]);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedClients.length === 0) {
      alert('Please select at least one client');
      return;
    }

    if (isRecurring && !dueDate) {
      alert('Please set a due date for recurring assignments');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Assign survey to each selected client
      const assignmentPromises = selectedClients.map(clientId => 
        realApiService.therapist.assignSurvey(surveyId!, clientId, {
          dueDate: dueDate || null,
          isRecurring,
          recurrencePattern: isRecurring ? recurrencePattern : null,
          notes: notes || null,
          sendNotification
        })
      );
      
      const results = await Promise.allSettled(assignmentPromises);
      
      // Count successful assignments
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      if (successCount > 0) {
        if (failCount > 0) {
          alert(`Survey assigned to ${successCount} clients. ${failCount} assignments failed.`);
        } else {
          alert(`Survey successfully assigned to ${successCount} clients!`);
        }
        navigate('/therapist/surveys');
      } else {
        throw new Error('All assignments failed');
      }
    } catch (error: any) {
      console.error('Error assigning survey:', error);
      alert('Failed to assign survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(search) ||
      client.last_name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAll = () => {
    const allClientIds = filteredClients.map(c => c.id);
    setSelectedClients(allClientIds);
  };

  const clearSelection = () => {
    setSelectedClients([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || 'Survey not found'}</p>
          <button
            onClick={() => navigate('/therapist/surveys')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/therapist/surveys')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Assign Survey</h1>
            <p className="text-gray-600 mt-1">Select clients to receive this survey</p>
          </div>
        </div>

        {/* Survey Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
              <p className="text-gray-600 mt-1">{survey.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>{survey.questions?.length || 0} questions</span>
                <span>•</span>
                <span>Type: {survey.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Clients</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedClients.length} of {filteredClients.length} selected
                  </span>
                  {selectedClients.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                  {selectedClients.length < filteredClients.length && (
                    <button
                      onClick={selectAll}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Select All
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
              
              {/* Client List */}
              {filteredClients.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredClients.map(client => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      isSelected={selectedClients.includes(client.id)}
                      onToggle={() => toggleClient(client.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No clients found' : 'No active clients available'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Settings</h3>
              
              <div className="space-y-4">
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                    />
                  </div>
                </div>

                {/* Recurring Assignment */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Recurring Assignment
                    </span>
                  </label>
                  
                  {isRecurring && (
                    <select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 resize-none"
                  />
                </div>

                {/* Send Notification */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Send notification to clients
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            {selectedClients.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-medium text-green-900 mb-2">Assignment Summary</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• {selectedClients.length} clients selected</li>
                  {dueDate && <li>• Due by {formatDate(dueDate)}</li>}
                  {isRecurring && <li>• Recurring {recurrencePattern}</li>}
                  {sendNotification && <li>• Notifications will be sent</li>}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/therapist/surveys')}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedClients.length === 0}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                Assign to {selectedClients.length} Client{selectedClients.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default AssignSurvey;