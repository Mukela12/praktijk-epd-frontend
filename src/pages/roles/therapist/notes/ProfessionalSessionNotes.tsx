import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  LockClosedIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { formatDate, formatTime } from '@/utils/dateFormatters';

// Session note interface
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
}

// Note card component
const NoteCard: React.FC<{ 
  note: SessionNote, 
  onView: () => void,
  onEdit: () => void 
}> = ({ note, onView, onEdit }) => {
  const moodColors = {
    1: 'text-red-600 bg-red-50',
    2: 'text-orange-600 bg-orange-50',
    3: 'text-yellow-600 bg-yellow-50',
    4: 'text-green-600 bg-green-50',
    5: 'text-emerald-600 bg-emerald-50'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-green-600/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {note.client_name}
              {note.is_important && (
                <StarIconSolid className="w-5 h-5 text-yellow-500 ml-2" />
              )}
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {formatDate(note.session_date)}
              <ClockIcon className="w-4 h-4 ml-3 mr-1" />
              {note.duration} min
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {note.is_locked && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <LockClosedIcon className="w-3 h-3 mr-1" />
              Locked
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/10 text-green-600">
            {note.session_type}
          </span>
        </div>
      </div>

      {/* Mood indicators */}
      <div className="flex items-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mood before:</span>
          <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
            moodColors[note.mood_before as keyof typeof moodColors] || moodColors[3]
          }`}>
            {note.mood_before}/5
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mood after:</span>
          <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
            moodColors[note.mood_after as keyof typeof moodColors] || moodColors[3]
          }`}>
            {note.mood_after}/5
          </span>
        </div>
        {note.mood_after > note.mood_before && (
          <span className="text-sm text-green-600 font-medium">
            ↑ Improved
          </span>
        )}
      </div>

      {/* Key points */}
      {note.key_points.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {note.key_points.slice(0, 3).map((point, index) => (
              <li key={index} className="truncate">{point}</li>
            ))}
            {note.key_points.length > 3 && (
              <li className="text-green-600">+{note.key_points.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          Updated {formatDate(note.updated_at)}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="px-3 py-1 text-sm text-green-600 hover:bg-green-600/10 rounded-lg transition-colors flex items-center"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </button>
          {!note.is_locked && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats overview
const StatsOverview: React.FC<{ notes: SessionNote[] }> = ({ notes }) => {
  const totalNotes = notes.length;
  const importantNotes = notes.filter(n => n.is_important).length;
  const averageMoodImprovement = notes.reduce((sum, n) => {
    return sum + (n.mood_after - n.mood_before);
  }, 0) / (notes.length || 1);
  const uniqueClients = new Set(notes.map(n => n.client_id)).size;

  const stats = [
    {
      label: 'Total Notes',
      value: totalNotes,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Important Notes',
      value: importantNotes,
      icon: StarIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      label: 'Unique Clients',
      value: uniqueClients,
      icon: UserIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Avg. Mood Change',
      value: `+${averageMoodImprovement.toFixed(1)}`,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

const ProfessionalSessionNotes: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<SessionNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterImportant, setFilterImportant] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchTerm, filterClient, filterTag, filterImportant, notes]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockNotes: SessionNote[] = [
        {
          id: '1',
          client_id: 'c1',
          client_name: 'Emma Thompson',
          appointment_id: 'a1',
          session_date: '2025-01-15',
          session_type: 'CBT Session',
          duration: 50,
          mood_before: 3,
          mood_after: 4,
          key_points: [
            'Discussed anxiety triggers at work',
            'Practiced breathing exercises',
            'Identified negative thought patterns'
          ],
          interventions: ['Cognitive restructuring', 'Mindfulness techniques'],
          homework: ['Daily mood journal', 'Practice breathing exercises 2x daily'],
          progress_notes: 'Client shows improvement in recognizing triggers. Good engagement with exercises.',
          private_notes: 'Consider introducing exposure therapy in next session',
          is_locked: false,
          created_at: '2025-01-15T14:00:00Z',
          updated_at: '2025-01-15T15:00:00Z',
          tags: ['anxiety', 'work-stress'],
          is_important: true
        },
        {
          id: '2',
          client_id: 'c2',
          client_name: 'John Davis',
          appointment_id: 'a2',
          session_date: '2025-01-14',
          session_type: 'Initial Assessment',
          duration: 60,
          mood_before: 2,
          mood_after: 3,
          key_points: [
            'First session - building rapport',
            'Explored presenting concerns',
            'Set initial therapy goals'
          ],
          interventions: ['Active listening', 'Goal setting'],
          homework: ['Complete PHQ-9 questionnaire'],
          progress_notes: 'Client presenting with moderate depression symptoms. Motivated for treatment.',
          private_notes: 'May benefit from combined therapy approach',
          is_locked: true,
          created_at: '2025-01-14T10:00:00Z',
          updated_at: '2025-01-14T11:00:00Z',
          tags: ['depression', 'initial-assessment'],
          is_important: false
        }
      ];
      
      setNotes(mockNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load session notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.progress_notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.key_points.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply client filter
    if (filterClient !== 'all') {
      filtered = filtered.filter(note => note.client_id === filterClient);
    }

    // Apply tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(note => note.tags.includes(filterTag));
    }

    // Apply important filter
    if (filterImportant) {
      filtered = filtered.filter(note => note.is_important);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

    setFilteredNotes(filtered);
  };

  const exportNotes = () => {
    // Implementation for exporting notes
    console.log('Exporting notes...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading session notes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <DocumentTextIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Notes</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadNotes}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get unique clients and tags for filters
  const uniqueClients = Array.from(new Set(notes.map(n => ({ id: n.client_id, name: n.client_name }))))
    .map(({ id, name }) => ({ id, name }));
  const uniqueTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Notes</h1>
            <p className="text-gray-600 mt-1">Document and track client session progress</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportNotes}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </button>
            <button
              onClick={() => navigate('/therapist/notes/new')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Note
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview notes={notes} />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
              
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Clients</option>
                {uniqueClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="all">All Tags</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterImportant}
                  onChange={(e) => setFilterImportant(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-600"
                />
                <span className="text-sm text-gray-700">Important only</span>
              </label>
              
              <button
                onClick={loadNotes}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={() => navigate(`/therapist/notes/${note.id}`)}
                onEdit={() => navigate(`/therapist/notes/${note.id}/edit`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterClient !== 'all' || filterTag !== 'all' || filterImportant
                ? 'No notes found' 
                : 'No session notes yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterClient !== 'all' || filterTag !== 'all' || filterImportant
                ? 'Try adjusting your search or filters'
                : 'Start documenting your client sessions'
              }
            </p>
            {(!searchTerm && filterClient === 'all' && filterTag === 'all' && !filterImportant) && (
              <button
                onClick={() => navigate('/therapist/notes/new')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Create Your First Note
              </button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfessionalSessionNotes;