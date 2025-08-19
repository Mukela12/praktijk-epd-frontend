import React, { useState } from 'react';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  SunIcon,
  HeartIcon,
  BoltIcon,
  BeakerIcon,
  UserGroupIcon,
  MoonIcon,
  FireIcon,
  BookOpenIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import realApiService from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';

// Challenge categories with icons
const categories = [
  { value: 'breathing', label: 'Breathing', icon: SunIcon },
  { value: 'gratitude', label: 'Gratitude', icon: HeartIcon },
  { value: 'mindfulness', label: 'Mindfulness', icon: BeakerIcon },
  { value: 'exercise', label: 'Exercise', icon: BoltIcon },
  { value: 'social', label: 'Social Connection', icon: UserGroupIcon },
  { value: 'sleep', label: 'Sleep', icon: MoonIcon },
  { value: 'meditation', label: 'Meditation', icon: SunIcon },
  { value: 'nutrition', label: 'Nutrition', icon: SparklesIcon }
];

// Milestone editor component
interface MilestoneProps {
  milestone: any;
  index: number;
  onUpdate: (index: number, milestone: any) => void;
  onDelete: (index: number) => void;
}

const MilestoneEditor: React.FC<MilestoneProps> = ({
  milestone,
  index,
  onUpdate,
  onDelete
}) => {
  const handleUpdate = (field: string, value: any) => {
    onUpdate(index, { ...milestone, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-700">Milestone {index + 1}</span>
        </div>
        <button
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      <input
        type="text"
        value={milestone.title}
        onChange={(e) => handleUpdate('title', e.target.value)}
        placeholder="Milestone title"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={milestone.target}
          onChange={(e) => handleUpdate('target', parseInt(e.target.value))}
          placeholder="Target value"
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
        />
        <input
          type="text"
          value={milestone.reward || ''}
          onChange={(e) => handleUpdate('reward', e.target.value)}
          placeholder="Reward (optional)"
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
        />
      </div>
    </div>
  );
};

// Challenge template cards
const ChallengeTemplates: React.FC<{ onSelect: (template: any) => void }> = ({ onSelect }) => {
  const templates = [
    {
      title: '21-Day Mindfulness Challenge',
      description: 'Daily mindfulness practice to reduce anxiety',
      category: 'mindfulness',
      difficulty: 'beginner',
      duration: 21,
      durationMinutes: 15,
      frequencyPerWeek: 7,
      instructions: [
        'Find a quiet place to sit comfortably',
        'Focus on your breath for 15 minutes',
        'Notice thoughts without judgment',
        'Return focus to breathing when distracted'
      ],
      milestones: [
        { title: 'Week 1 Complete', target: 7, reward: 'Mindfulness badge' },
        { title: 'Week 2 Complete', target: 14, reward: 'Consistency award' },
        { title: 'Challenge Complete', target: 21, reward: 'Master badge' }
      ]
    },
    {
      title: 'Gratitude Journal',
      description: 'Build a daily gratitude practice',
      category: 'gratitude',
      difficulty: 'beginner',
      duration: 30,
      durationMinutes: 10,
      frequencyPerWeek: 7,
      instructions: [
        'Write 3 things you\'re grateful for each day',
        'Be specific about why you\'re grateful',
        'Include different categories (people, experiences, things)',
        'Review past entries weekly'
      ],
      milestones: [
        { title: 'First Week', target: 7, reward: 'Gratitude starter' },
        { title: 'Two Weeks', target: 14, reward: 'Consistency badge' },
        { title: 'One Month', target: 30, reward: 'Gratitude master' }
      ]
    },
    {
      title: 'Progressive Exercise',
      description: 'Gradually increase physical activity',
      category: 'exercise',
      difficulty: 'intermediate',
      duration: 28,
      durationMinutes: 30,
      frequencyPerWeek: 4,
      instructions: [
        'Start with 15 minutes of light exercise',
        'Increase duration by 5 minutes each week',
        'Include both cardio and strength exercises',
        'Track your progress and how you feel'
      ],
      milestones: [
        { title: 'Week 1', target: 4, reward: 'Getting started' },
        { title: 'Week 2', target: 8, reward: 'Building momentum' },
        { title: 'Complete', target: 16, reward: 'Fitness achiever' }
      ]
    }
  ];

  return (
    <div className="bg-blue-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Start Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelect(template)}
            className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
          >
            <h4 className="font-medium text-blue-900">{template.title}</h4>
            <p className="text-sm text-blue-700 mt-1">{template.description}</p>
            <div className="flex items-center space-x-2 mt-2 text-xs text-blue-600">
              <span>{template.duration} days</span>
              <span>•</span>
              <span>{template.difficulty}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const CreateChallenge: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeData, setChallengeData] = useState({
    title: '',
    description: '',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 30,
    durationMinutes: 15,
    frequencyPerWeek: 7,
    totalWeeks: 4,
    targetValue: 30,
    targetUnit: 'days',
    isPublic: false,
    instructions: [''],
    tips: [''],
    milestones: [] as any[],
    rewards: {
      completion: '',
      milestones: []
    }
  });

  const handleAddInstruction = () => {
    setChallengeData({
      ...challengeData,
      instructions: [...challengeData.instructions, '']
    });
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    const newInstructions = [...challengeData.instructions];
    newInstructions[index] = value;
    setChallengeData({ ...challengeData, instructions: newInstructions });
  };

  const handleDeleteInstruction = (index: number) => {
    const newInstructions = challengeData.instructions.filter((_, i) => i !== index);
    setChallengeData({ ...challengeData, instructions: newInstructions });
  };

  const handleAddTip = () => {
    setChallengeData({
      ...challengeData,
      tips: [...challengeData.tips, '']
    });
  };

  const handleUpdateTip = (index: number, value: string) => {
    const newTips = [...challengeData.tips];
    newTips[index] = value;
    setChallengeData({ ...challengeData, tips: newTips });
  };

  const handleDeleteTip = (index: number) => {
    const newTips = challengeData.tips.filter((_, i) => i !== index);
    setChallengeData({ ...challengeData, tips: newTips });
  };

  const handleAddMilestone = () => {
    setChallengeData({
      ...challengeData,
      milestones: [...challengeData.milestones, { title: '', target: 0, reward: '' }]
    });
  };

  const handleUpdateMilestone = (index: number, milestone: any) => {
    const newMilestones = [...challengeData.milestones];
    newMilestones[index] = milestone;
    setChallengeData({ ...challengeData, milestones: newMilestones });
  };

  const handleDeleteMilestone = (index: number) => {
    const newMilestones = challengeData.milestones.filter((_, i) => i !== index);
    setChallengeData({ ...challengeData, milestones: newMilestones });
  };

  const handleLoadTemplate = (template: any) => {
    setChallengeData({
      ...challengeData,
      ...template,
      isPublic: false // Always start templates as private
    });
  };

  const handleSubmit = async () => {
    if (!challengeData.title.trim()) {
      alert('Please enter a challenge title');
      return;
    }

    if (!challengeData.description.trim()) {
      alert('Please enter a challenge description');
      return;
    }

    // Filter out empty instructions and tips
    const validInstructions = challengeData.instructions.filter(i => i.trim());
    const validTips = challengeData.tips.filter(t => t.trim());

    if (validInstructions.length === 0) {
      alert('Please add at least one instruction');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        ...challengeData,
        instructions: validInstructions,
        tips: validTips,
        milestones: challengeData.milestones.filter(m => m.title.trim())
      };

      const response = await realApiService.therapist.createChallenge(dataToSubmit);
      
      if (response.success) {
        navigate('/therapist/challenges');
      } else {
        throw new Error('Failed to create challenge');
      }
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategoryIcon = categories.find(c => c.value === challengeData.category)?.icon || SparklesIcon;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/therapist/challenges')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Challenge</h1>
              <p className="text-gray-600 mt-1">Design a therapeutic challenge to help clients build healthy habits</p>
            </div>
          </div>
        </div>

        {/* Templates */}
        <ChallengeTemplates onSelect={handleLoadTemplate} />

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Challenge Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Title
              </label>
              <input
                type="text"
                value={challengeData.title}
                onChange={(e) => setChallengeData({ ...challengeData, title: e.target.value })}
                placeholder="e.g., 21-Day Mindfulness Journey"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <CategoryIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={challengeData.category}
                  onChange={(e) => setChallengeData({ ...challengeData, category: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={challengeData.description}
              onChange={(e) => setChallengeData({ ...challengeData, description: e.target.value })}
              placeholder="Describe the purpose and benefits of this challenge..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={challengeData.difficulty}
                onChange={(e) => setChallengeData({ ...challengeData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                value={challengeData.duration}
                onChange={(e) => setChallengeData({ ...challengeData, duration: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minutes/Day
              </label>
              <input
                type="number"
                value={challengeData.durationMinutes}
                onChange={(e) => setChallengeData({ ...challengeData, durationMinutes: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Times/Week
              </label>
              <input
                type="number"
                value={challengeData.frequencyPerWeek}
                onChange={(e) => setChallengeData({ ...challengeData, frequencyPerWeek: parseInt(e.target.value) })}
                min="1"
                max="7"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
            <button
              onClick={handleAddInstruction}
              className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Instruction
            </button>
          </div>
          
          {challengeData.instructions.map((instruction, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={instruction}
                onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                placeholder="Enter instruction"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
              <button
                onClick={() => handleDeleteInstruction(index)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Success Tips (Optional)</h3>
            <button
              onClick={handleAddTip}
              className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Tip
            </button>
          </div>
          
          {challengeData.tips.map((tip, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={tip}
                onChange={(e) => handleUpdateTip(index, e.target.value)}
                placeholder="Enter success tip"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
              <button
                onClick={() => handleDeleteTip(index)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Milestones & Rewards (Optional)</h3>
            <button
              onClick={handleAddMilestone}
              className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Milestone
            </button>
          </div>
          
          {challengeData.milestones.length === 0 ? (
            <p className="text-sm text-gray-500">
              Add milestones to encourage progress and celebrate achievements
            </p>
          ) : (
            <div className="space-y-3">
              {challengeData.milestones.map((milestone, index) => (
                <MilestoneEditor
                  key={index}
                  milestone={milestone}
                  index={index}
                  onUpdate={handleUpdateMilestone}
                  onDelete={handleDeleteMilestone}
                />
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={challengeData.isPublic}
              onChange={(e) => setChallengeData({ ...challengeData, isPublic: e.target.checked })}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <span className="font-medium text-gray-900">Make this challenge public</span>
              <p className="text-sm text-gray-600 mt-1">
                Public challenges can be viewed and used by other therapists
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/therapist/challenges')}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Create Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateChallenge;