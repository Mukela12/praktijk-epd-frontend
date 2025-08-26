import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { therapistApi } from '@/services/therapistApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

interface SessionNoteFormData {
  client_id: string;
  appointment_id: string;
  session_date: string;
  session_type: string;
  duration: number;
  mood_before: number;
  mood_after: number;
  key_points: string[];
  interventions: string[];
  homework: string[];
  progress_notes: string;
  private_notes: string;
  tags: string[];
  is_important: boolean;
}

const SessionNoteForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { success, error } = useAlert();
  const isEditMode = !!noteId;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<SessionNoteFormData>({
    client_id: '',
    appointment_id: '',
    session_date: new Date().toISOString().split('T')[0],
    session_type: 'Regular Session',
    duration: 50,
    mood_before: 3,
    mood_after: 3,
    key_points: [''],
    interventions: [''],
    homework: [''],
    progress_notes: '',
    private_notes: '',
    tags: [],
    is_important: false
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [noteId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load clients
      const clientsResponse = await therapistApi.getClients();
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }

      // Load appointments
      const appointmentsResponse = await therapistApi.getAppointments();
      if (appointmentsResponse.success && appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data);
      }

      // Load existing note if in edit mode
      if (isEditMode) {
        const noteResponse = await therapistApi.getSessionNote(noteId);
        if (noteResponse.success && noteResponse.data) {
          setFormData(noteResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_id) {
      error('Please select a client');
      return;
    }
    
    if (formData.key_points.filter(p => p.trim()).length === 0) {
      error('Please add at least one key point');
      return;
    }

    try {
      setIsSaving(true);
      
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        key_points: formData.key_points.filter(p => p.trim()),
        interventions: formData.interventions.filter(i => i.trim()),
        homework: formData.homework.filter(h => h.trim())
      };

      let response;
      if (isEditMode) {
        response = await therapistApi.updateSessionNote(noteId, cleanedData);
      } else {
        response = await therapistApi.createSessionNote(cleanedData);
      }

      if (response.success) {
        success(isEditMode ? 'Session note updated successfully' : 'Session note created successfully');
        navigate('/therapist/notes');
      }
    } catch (err: any) {
      console.error('Error saving note:', err);
      error(err.response?.data?.message || 'Failed to save session note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayFieldChange = (field: 'key_points' | 'interventions' | 'homework', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'key_points' | 'interventions' | 'homework') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'key_points' | 'interventions' | 'homework', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const sessionTypes = [
    'Initial Assessment',
    'Regular Session',
    'CBT Session',
    'EMDR Session',
    'Crisis Intervention',
    'Family Therapy',
    'Group Therapy',
    'Progress Review',
    'Termination Session'
  ];

  const moodOptions = [
    { value: 1, label: 'Very Low', color: 'text-red-600' },
    { value: 2, label: 'Low', color: 'text-orange-600' },
    { value: 3, label: 'Neutral', color: 'text-yellow-600' },
    { value: 4, label: 'Good', color: 'text-green-600' },
    { value: 5, label: 'Very Good', color: 'text-emerald-600' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/therapist/notes')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Session Notes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Session Note' : 'New Session Note'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Date *
                </label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type *
                </label>
                <select
                  value={formData.session_type}
                  onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                >
                  {sessionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="15"
                  max="180"
                  step="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                />
              </div>
            </div>

            {/* Important Flag */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-600"
                />
                <span className="ml-2 flex items-center text-sm text-gray-700">
                  <StarIcon className="w-4 h-4 mr-1" />
                  Mark as important
                </span>
              </label>
            </div>
          </div>

          {/* Mood Assessment */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mood Before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood Before Session
                </label>
                <div className="flex space-x-2">
                  {moodOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood_before: option.value })}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        formData.mood_before === option.value
                          ? `${option.color} bg-gray-100`
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {moodOptions.find(o => o.value === formData.mood_before)?.label}
                </p>
              </div>

              {/* Mood After */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood After Session
                </label>
                <div className="flex space-x-2">
                  {moodOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood_after: option.value })}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        formData.mood_after === option.value
                          ? `${option.color} bg-gray-100`
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {moodOptions.find(o => o.value === formData.mood_after)?.label}
                </p>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Points *</h2>
            <div className="space-y-2">
              {formData.key_points.map((point, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayFieldChange('key_points', index, e.target.value)}
                    placeholder="Enter key point"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  />
                  {formData.key_points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('key_points', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('key_points')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Key Point
              </button>
            </div>
          </div>

          {/* Interventions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interventions Used</h2>
            <div className="space-y-2">
              {formData.interventions.map((intervention, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={intervention}
                    onChange={(e) => handleArrayFieldChange('interventions', index, e.target.value)}
                    placeholder="Enter intervention"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField('interventions', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('interventions')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Intervention
              </button>
            </div>
          </div>

          {/* Homework */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Homework Assigned</h2>
            <div className="space-y-2">
              {formData.homework.map((hw, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={hw}
                    onChange={(e) => handleArrayFieldChange('homework', index, e.target.value)}
                    placeholder="Enter homework assignment"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField('homework', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('homework')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Homework
              </button>
            </div>
          </div>

          {/* Progress Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Notes</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Notes *
                </label>
                <textarea
                  value={formData.progress_notes}
                  onChange={(e) => setFormData({ ...formData, progress_notes: e.target.value })}
                  rows={4}
                  placeholder="Document the client's progress, observations, and session outcomes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Notes (Not shared with client)
                </label>
                <textarea
                  value={formData.private_notes}
                  onChange={(e) => setFormData({ ...formData, private_notes: e.target.value })}
                  rows={3}
                  placeholder="Personal observations, considerations for future sessions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                >
                  <TagIcon className="w-4 h-4 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/therapist/notes')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  {isEditMode ? 'Update Note' : 'Create Note'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default SessionNoteForm;