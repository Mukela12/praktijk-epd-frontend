export type TherapistStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface Therapist {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: TherapistStatus;
  user_status: 'active' | 'inactive' | 'pending';
  therapist_status?: 'available' | 'on_leave' | 'unavailable';
  
  // Professional info
  license_number?: string;
  specializations: string[];
  languages: string[];
  bio?: string;
  qualifications?: string[];
  years_of_experience?: number;
  
  // Service info
  hourly_rate?: number;
  consultation_rate?: number;
  accepting_new_clients: boolean;
  online_therapy: boolean;
  in_person_therapy: boolean;
  max_clients?: number;
  max_clients_per_day?: number;
  session_duration?: number;
  break_between_sessions?: number;
  
  // Location
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  
  // Metadata
  client_count?: number;
  rating?: number;
  total_reviews?: number;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  // Additional fields
  kvk_number?: string;
  big_number?: string;
  therapy_types?: string[];
  available_days?: string[];
  available_hours?: string;
}

export interface FilterState {
  search: string;
  status: string[];
  specializations: string[];
  acceptingClients: boolean | null;
  dateRange: { start: Date; end: Date } | null;
  clientCount: { min: number; max: number } | null;
  rating: { min: number; max: number } | null;
}

export interface SortState {
  field: 'name' | 'email' | 'status' | 'clients' | 'rating' | 'created';
  direction: 'asc' | 'desc';
}

export interface BulkOperation {
  type: 'status' | 'delete' | 'export' | 'assign';
  ids: string[];
  payload?: any;
}

export interface TherapistFormData {
  // Basic info
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Professional info
  license_number: string;
  specializations: string[];
  languages: string[];
  bio: string;
  qualifications: string[];
  years_of_experience: number;
  
  // Service info
  hourly_rate: number;
  accepting_new_clients: boolean;
  online_therapy: boolean;
  in_person_therapy: boolean;
  max_clients: number;
  max_clients_per_day: number;
  session_duration: number;
  break_between_sessions: number;
  
  // Location
  street_address: string;
  postal_code: string;
  city: string;
  country: string;
  
  // Additional
  kvk_number: string;
  big_number: string;
  therapy_types: string[];
  available_days: string[];
  available_hours: string;
}

export interface ActivityItem {
  id: string;
  type: 'status_change' | 'profile_update' | 'client_assigned' | 'appointment' | 'login';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
}