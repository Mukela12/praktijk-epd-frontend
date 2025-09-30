import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  StarIcon,
  LockClosedIcon,
  PrinterIcon,
  ShareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/contexts/LanguageContext';
import { therapistApi } from '@/services/therapistApi';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate, formatTime } from '@/utils/dateFormatters';

interface SessionNote {
  id: string;
  client_id: string;
  client_name: string;
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
  attachments?: string[];
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_important: boolean;
  hulpvragen_progress?: Record<string, {
    discussed: boolean;
    progress: number;
    notes: string;
  }>;
}

const SessionNoteView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { success, error } = useAlert();

  const [note, setNote] = useState<SessionNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const response = await therapistApi.getSessionNote(noteId!);
      
      if (response.success && response.data) {
        setNote(response.data);
      } else {
        setNote(null);
        error('Session note not found');
      }
    } catch (err: any) {
      console.error('Error loading note:', err);
      
      if (err.response?.status === 404) {
        error('Session note not found');
      } else if (err.response?.status === 401) {
        error('You are not authorized to view this note');
      } else {
        error('Failed to load session note');
      }
      
      navigate('/therapist/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this session note? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await therapistApi.deleteSessionNote(noteId!);
      
      if (response.success) {
        success('Session note deleted successfully');
        navigate('/therapist/notes');
      }
    } catch (err: any) {
      console.error('Error deleting note:', err);
      error('Failed to delete session note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Implementation for sharing (could be email, export PDF, etc.)
    success('Share functionality coming soon');
  };

  const getMoodLabel = (mood: number) => {
    const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Very Good'];
    return labels[mood - 1] || 'Unknown';
  };

  const getMoodColor = (mood: number) => {
    const colors = [
      'text-red-600 bg-red-50',
      'text-orange-600 bg-orange-50',
      'text-yellow-600 bg-yellow-50',
      'text-green-600 bg-green-50',
      'text-emerald-600 bg-emerald-50'
    ];
    return colors[mood - 1] || 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading session note..." />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Note Not Found</h3>
        <p className="text-gray-600 mb-6">The session note you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/therapist/notes')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/therapist/notes')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Session Notes
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              Session Note
              {note.is_important && (
                <StarIconSolid className="w-6 h-6 text-yellow-500 ml-3" />
              )}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            {!note.is_locked && (
              <>
                <button
                  onClick={() => navigate(`/therapist/notes/${noteId}/edit`)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  Edit Note
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="space-y-6 print:space-y-4">
          {/* Client and Session Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{note.client_name}</p>
                    <p className="text-sm text-gray-600">ID: {note.client_id}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Session Details</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-900">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(note.session_date)}
                  </p>
                  <p className="flex items-center text-gray-900">
                    <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {note.duration} minutes
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/10 text-green-600">
                      {note.session_type}
                    </span>
                    {note.is_locked && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <LockClosedIcon className="w-3 h-3 mr-1" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Assessment */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Before Session</p>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${getMoodColor(note.mood_before)}`}>
                    {note.mood_before}/5
                  </span>
                  <span className="text-gray-700">{getMoodLabel(note.mood_before)}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">After Session</p>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${getMoodColor(note.mood_after)}`}>
                    {note.mood_after}/5
                  </span>
                  <span className="text-gray-700">{getMoodLabel(note.mood_after)}</span>
                  {note.mood_after > note.mood_before && (
                    <span className="text-sm text-green-600 font-medium">
                      ↑ Improved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hulpvragen Progress */}
          {note.hulpvragen_progress && Object.keys(note.hulpvragen_progress).length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-6 print:border-0 print:shadow-none">
              <h2 className="text-lg font-semibold text-green-900 mb-4">Hulpvragen Progress Tracking</h2>
              <div className="space-y-4">
                {Object.entries(note.hulpvragen_progress)
                  .filter(([_, progress]) => progress.discussed)
                  .map(([hulpvraag, progress]) => (
                    <div key={hulpvraag} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-green-900">{hulpvraag}</h3>
                        <span className="text-sm font-medium text-green-700">
                          {progress.progress}% Progress
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-green-600 mt-1">
                          <span>No Progress</span>
                          <span>Moderate</span>
                          <span>Significant</span>
                        </div>
                      </div>
                      
                      {progress.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                          {progress.notes}
                        </p>
                      )}
                    </div>
                  ))
                }
                
                {Object.entries(note.hulpvragen_progress).filter(([_, progress]) => !progress.discussed).length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Not discussed in this session:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(note.hulpvragen_progress)
                        .filter(([_, progress]) => !progress.discussed)
                        .map(([hulpvraag]) => (
                          <span
                            key={hulpvraag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            {hulpvraag}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Points */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Points</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {note.key_points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Interventions */}
          {note.interventions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interventions Used</h2>
              <div className="flex flex-wrap gap-2">
                {note.interventions.map((intervention, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {intervention}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Homework */}
          {note.homework.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Homework Assigned</h2>
              <ul className="list-decimal list-inside space-y-2 text-gray-700">
                {note.homework.map((hw, index) => (
                  <li key={index}>{hw}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{note.progress_notes}</p>
          </div>

          {/* Private Notes (only visible to therapist) */}
          {note.private_notes && (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 print:hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Private Notes
              </h2>
              <p className="text-sm text-yellow-800 mb-3">These notes are only visible to you</p>
              <p className="text-gray-700 whitespace-pre-wrap">{note.private_notes}</p>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 print:border-0 print:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <TagIcon className="w-4 h-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 print:hidden">
            <div className="flex justify-between">
              <span>Created: {formatDate(note.created_at)} at {formatTime(note.created_at)}</span>
              <span>Last updated: {formatDate(note.updated_at)} at {formatTime(note.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SessionNoteView;