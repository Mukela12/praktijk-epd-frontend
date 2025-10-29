// Resource Management Types

export type ResourceType = 'article' | 'video' | 'pdf' | 'audio' | 'interactive' | 'external';
export type ResourceCategory = 'mental_health' | 'anxiety' | 'depression' | 'stress' | 'relationships' | 'trauma' | 'self_care' | 'mindfulness' | 'coping_skills' | 'other';
export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceAudience = 'all' | 'clients' | 'therapists' | 'specific';
export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource {
  id: string;
  title: string;
  description: string;
  short_description: string;
  type: ResourceType;
  category: ResourceCategory;
  content_url?: string;
  content_body?: string;
  duration_minutes?: number;
  difficulty: ResourceDifficulty;
  tags: string[];
  author_name: string;
  author_credentials?: string;
  is_public: boolean;
  target_audience: ResourceAudience;
  specific_client_ids?: string[];
  status: ResourceStatus;
  published_at?: string;
  view_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Additional fields from API
  creator_first_name?: string;
  creator_last_name?: string;
  personal_view_count?: number;
  personal_time_spent?: number;
  assigned_at?: string;
  due_date?: string;
  assignment_priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignment_status?: 'pending' | 'in_progress' | 'completed';
}

export interface ResourceAssignment {
  id: string;
  resource_id: string;
  client_id: string;
  therapist_id: string;
  assigned_at: string;
  due_date?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
  time_spent_minutes?: number;
  progress_data?: any;
}

export interface ResourceEngagement {
  action: 'view' | 'download' | 'complete' | 'bookmark';
  timeSpent?: number;
  progressData?: any;
}

export interface CreateResourceData {
  title: string;
  description: string;
  short_description: string;
  type: ResourceType;
  category: ResourceCategory;
  content_url?: string;
  content_body?: string;
  duration_minutes?: number;
  difficulty?: ResourceDifficulty;
  tags: string[];
  author_name: string;
  author_credentials?: string;
  is_public?: boolean;
  target_audience?: ResourceAudience;
  specific_client_ids?: string[];
}

export interface AssignResourceData {
  clientId: string;
  dueDate?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

// Challenge Types
export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  challengeType?: ChallengeType; // Deprecated, use 'type'
  category: string;
  difficultyLevel: ChallengeDifficulty;
  durationDays: number;
  targetValue?: number;
  targetUnit?: string;
  goals: {
    targetValue: number;
    targetUnit: string;
    description: string;
  };
  rules?: string[];
  milestones?: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    dueDay: number;
    day?: number; // Alternative property name
    achieved?: boolean;
  }[];
  status: ChallengeStatus;
  participant_count: number;
  completion_rate: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  rewards?: string;
  instructions?: string;
  tips?: string;
}

// Survey Types
export type SurveyType = 'assessment' | 'feedback' | 'progress' | 'satisfaction' | 'custom';
export type QuestionType = 'scale' | 'multiple_choice' | 'text' | 'boolean';

export interface SurveyQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  allowMultiple?: boolean;
  order?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  type: SurveyType;
  questions: SurveyQuestion[];
  isAnonymous?: boolean;
  validFrom?: string;
  validUntil?: string;
  status: 'draft' | 'published' | 'closed';
  response_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  responses: Record<string, any>;
  timeSpentMinutes?: number;
}