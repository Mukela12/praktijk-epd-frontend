import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  HeartIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate } from '@/utils/dateFormatters';
import { useAlert } from '@/components/ui/CustomAlert';

interface PsychologicalBehavior {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  symptoms: string[];
  treatmentApproach: string;
}

interface ClientBehaviorAssignment {
  id: string;
  behaviorId: string;
  behavior: PsychologicalBehavior;
  clientId: string;
  assignedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  status: 'active' | 'resolved' | 'monitoring';
  lastUpdated: string;
  progress: number;
}

const behaviorCategories = [
  'Anxiety Disorders',
  'Mood Disorders',
  'Personality Disorders',
  'Trauma-Related Disorders',
  'Substance-Related Disorders',
  'Neurodevelopmental Disorders',
  'Eating Disorders',
  'Sleep Disorders',
  'Behavioral Disorders',
  'Cognitive Disorders'
];

const availableBehaviors: PsychologicalBehavior[] = [
  {
    id: '1',
    name: 'Generalized Anxiety Disorder',
    category: 'Anxiety Disorders',
    severity: 'moderate',
    description: 'Excessive anxiety and worry occurring more days than not for at least 6 months',
    symptoms: ['Restlessness', 'Fatigue', 'Difficulty concentrating', 'Irritability', 'Muscle tension', 'Sleep disturbance'],
    treatmentApproach: 'CBT, relaxation techniques, medication if necessary'
  },
  {
    id: '2',
    name: 'Major Depressive Disorder',
    category: 'Mood Disorders',
    severity: 'severe',
    description: 'Persistent feeling of sadness and loss of interest lasting at least two weeks',
    symptoms: ['Depressed mood', 'Loss of interest', 'Weight changes', 'Sleep changes', 'Fatigue', 'Feelings of worthlessness'],
    treatmentApproach: 'CBT, IPT, medication, lifestyle changes'
  },
  {
    id: '3',
    name: 'Post-Traumatic Stress Disorder',
    category: 'Trauma-Related Disorders',
    severity: 'severe',
    description: 'Development of symptoms following exposure to traumatic events',
    symptoms: ['Intrusive memories', 'Avoidance', 'Negative mood changes', 'Hyperarousal', 'Flashbacks', 'Nightmares'],
    treatmentApproach: 'EMDR, CPT, PE therapy, medication support'
  },
  {
    id: '4',
    name: 'Social Anxiety Disorder',
    category: 'Anxiety Disorders',
    severity: 'moderate',
    description: 'Intense fear or anxiety in social situations',
    symptoms: ['Fear of judgment', 'Avoidance of social situations', 'Physical symptoms', 'Self-consciousness'],
    treatmentApproach: 'CBT, exposure therapy, social skills training'
  },
  {
    id: '5',
    name: 'Obsessive-Compulsive Disorder',
    category: 'Anxiety Disorders',
    severity: 'moderate',
    description: 'Presence of obsessions and/or compulsions that are time-consuming',
    symptoms: ['Intrusive thoughts', 'Repetitive behaviors', 'Distress', 'Time consumption', 'Functional impairment'],
    treatmentApproach: 'ERP, CBT, medication (SSRIs)'
  }
];

const severityColors = {
  mild: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  moderate: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  severe: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
};

const statusColors = {
  active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  resolved: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  monitoring: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
};

const ClientPsychologicalBehavior: React.FC = () => {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: errorAlert, warning } = useAlert();
  
  const [client, setClient] = useState<any>(null);
  const [assignments, setAssignments] = useState<ClientBehaviorAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newAssignment, setNewAssignment] = useState({
    behaviorId: '',
    severity: 'moderate' as 'mild' | 'moderate' | 'severe',
    notes: '',
    status: 'active' as 'active' | 'resolved' | 'monitoring'
  });

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API calls
      // Mock client data
      const mockClient = {
        id: clientId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      };
      
      // Mock assignments
      const mockAssignments: ClientBehaviorAssignment[] = [
        {
          id: '1',
          behaviorId: '1',
          behavior: availableBehaviors[0],
          clientId: clientId!,
          assignedDate: '2024-01-15',
          severity: 'moderate',
          notes: 'Client shows persistent worry about multiple life circumstances',
          status: 'active',
          lastUpdated: '2024-03-20',
          progress: 65
        },
        {
          id: '2',
          behaviorId: '4',
          behavior: availableBehaviors[3],
          clientId: clientId!,
          assignedDate: '2024-02-10',
          severity: 'mild',
          notes: 'Improving with exposure therapy',
          status: 'monitoring',
          lastUpdated: '2024-03-18',
          progress: 80
        }
      ];
      
      setClient(mockClient);
      setAssignments(mockAssignments);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!newAssignment.behaviorId) {
      warning('Please select a psychological behavior');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const selectedBehavior = availableBehaviors.find(b => b.id === newAssignment.behaviorId);
      if (!selectedBehavior) return;

      const assignment: ClientBehaviorAssignment = {
        id: Date.now().toString(),
        behaviorId: newAssignment.behaviorId,
        behavior: selectedBehavior,
        clientId: clientId!,
        assignedDate: new Date().toISOString().split('T')[0],
        severity: newAssignment.severity,
        notes: newAssignment.notes,
        status: newAssignment.status,
        lastUpdated: new Date().toISOString().split('T')[0],
        progress: 0
      };

      setAssignments([...assignments, assignment]);
      success('Psychological behavior assigned successfully');
      setIsAdding(false);
      setNewAssignment({
        behaviorId: '',
        severity: 'moderate',
        notes: '',
        status: 'active'
      });
    } catch (error: any) {
      console.error('Error adding assignment:', error);
      errorAlert('Failed to assign behavior');
    }
  };

  const handleUpdateStatus = async (assignmentId: string, newStatus: 'active' | 'resolved' | 'monitoring') => {
    try {
      // TODO: Replace with actual API call
      setAssignments(assignments.map(a => 
        a.id === assignmentId 
          ? { ...a, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
          : a
      ));
      success('Status updated successfully');
    } catch (error: any) {
      console.error('Error updating status:', error);
      errorAlert('Failed to update status');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      success('Assignment removed successfully');
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      errorAlert('Failed to remove assignment');
    }
  };

  const filteredBehaviors = selectedCategory === 'all' 
    ? availableBehaviors 
    : availableBehaviors.filter(b => b.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading psychological behaviors..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || 'Failed to load client'}</p>
          <button
            onClick={() => navigate('/therapist/clients')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/therapist/clients/${clientId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Psychological Behaviors</h1>
              <p className="text-gray-600 mt-1">
                {client.first_name} {client.last_name} - Manage assigned behaviors and conditions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Assign Behavior
          </button>
        </div>

        {/* Add New Assignment Section */}
        {isAdding && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign New Psychological Behavior</h2>
            
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                >
                  <option value="all">All Categories</option>
                  {behaviorCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Behavior Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Behavior/Condition
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {filteredBehaviors.map(behavior => (
                    <label
                      key={behavior.id}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        newAssignment.behaviorId === behavior.id 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="behavior"
                        value={behavior.id}
                        checked={newAssignment.behaviorId === behavior.id}
                        onChange={(e) => setNewAssignment({ ...newAssignment, behaviorId: e.target.value })}
                        className="mt-1 text-green-600 focus:ring-green-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{behavior.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{behavior.category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Severity and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={newAssignment.severity}
                    onChange={(e) => setNewAssignment({ ...newAssignment, severity: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Status
                  </label>
                  <select
                    value={newAssignment.status}
                    onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="active">Active</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  value={newAssignment.notes}
                  onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                  placeholder="Add any relevant observations or treatment considerations..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewAssignment({
                      behaviorId: '',
                      severity: 'moderate',
                      notes: '',
                      status: 'active'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAssignment}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Assign Behavior
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
          
          {assignments.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No psychological behaviors assigned yet</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Assign First Behavior
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.behavior.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[assignment.severity].bg} ${severityColors[assignment.severity].text} ${severityColors[assignment.severity].border}`}>
                          {assignment.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[assignment.status].bg} ${statusColors[assignment.status].text} ${statusColors[assignment.status].border}`}>
                          {assignment.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{assignment.behavior.description}</p>
                      
                      {/* Symptoms */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Common Symptoms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assignment.behavior.symptoms.map((symptom, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Treatment Approach */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Treatment Approach:</h4>
                        <p className="text-sm text-gray-600">{assignment.behavior.treatmentApproach}</p>
                      </div>
                      
                      {/* Notes */}
                      {assignment.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Clinical Notes:</h4>
                          <p className="text-sm text-gray-600 italic">{assignment.notes}</p>
                        </div>
                      )}
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Treatment Progress</span>
                          <span className="text-sm text-gray-600">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-green-600 rounded-full transition-all duration-300"
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Assigned: {formatDate(assignment.assignedDate)}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Updated: {formatDate(assignment.lastUpdated)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="ml-4 space-y-2">
                      <select
                        value={assignment.status}
                        onChange={(e) => handleUpdateStatus(assignment.id, e.target.value as any)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                      >
                        <option value="active">Active</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="w-full px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ClientPsychologicalBehavior;