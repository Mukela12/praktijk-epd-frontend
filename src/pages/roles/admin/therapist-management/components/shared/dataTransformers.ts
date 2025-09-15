import { Therapist, TherapistStatus } from './therapistTypes';

/**
 * Transform backend user data to frontend Therapist type
 */
export function transformBackendToTherapist(backendData: any): Therapist {
  // Handle the nested profile data from backend
  const profile = backendData.profile || {};
  
  return {
    // Basic user fields
    id: backendData.id,
    email: backendData.email,
    first_name: backendData.first_name,
    last_name: backendData.last_name,
    phone: backendData.phone || backendData.phone_number || '',
    role: backendData.role || 'therapist',
    status: (backendData.status || 'active') as TherapistStatus,
    user_status: backendData.status || 'active',
    
    // Professional info - from therapist profile
    license_number: profile.license_number || '',
    specializations: profile.specializations || [],
    languages: profile.languages || profile.languages_spoken || [],
    bio: profile.bio || '',
    qualifications: profile.qualifications || [],
    years_of_experience: profile.years_of_experience || 0,
    
    // Service info
    hourly_rate: profile.hourly_rate || profile.session_rate || 0,
    consultation_rate: profile.consultation_rate || profile.session_rate || 0,
    accepting_new_clients: profile.accepting_new_clients !== false,
    online_therapy: profile.online_therapy || profile.online_therapy_available || false,
    in_person_therapy: profile.in_person_therapy !== false,
    max_clients: profile.max_clients || 20,
    max_clients_per_day: profile.max_clients_per_day || 8,
    session_duration: profile.session_duration || profile.min_session_duration || 60,
    break_between_sessions: profile.break_between_sessions || 15,
    
    // Location
    street_address: profile.street_address || profile.address || '',
    postal_code: profile.postal_code || '',
    city: profile.city || '',
    country: profile.country || 'Netherlands',
    
    // Metadata
    client_count: profile.current_clients || 0,
    rating: profile.rating || 0,
    total_reviews: profile.total_reviews || 0,
    profile_photo_url: profile.profile_photo_url || null,
    created_at: backendData.created_at,
    updated_at: backendData.updated_at || backendData.created_at,
    last_login: backendData.last_login || null,
    
    // Additional fields
    kvk_number: profile.kvk_number || '',
    big_number: profile.big_number || '',
    therapy_types: profile.therapy_types || [],
    available_days: profile.available_days || [],
    available_hours: profile.available_hours || ''
  };
}

/**
 * Transform frontend therapist data to backend format
 */
export function transformTherapistToBackend(therapist: Partial<Therapist>): any {
  return {
    // Basic fields
    firstName: therapist.first_name,
    lastName: therapist.last_name,
    email: therapist.email,
    phone: therapist.phone,
    status: therapist.status,
    
    // Profile fields for update
    licenseNumber: therapist.license_number,
    specializations: therapist.specializations,
    languages: therapist.languages,
    bio: therapist.bio,
    qualifications: therapist.qualifications,
    yearsOfExperience: therapist.years_of_experience,
    hourlyRate: therapist.hourly_rate,
    maxClients: therapist.max_clients,
    maxClientsPerDay: therapist.max_clients_per_day,
    sessionDuration: therapist.session_duration,
    breakBetweenSessions: therapist.break_between_sessions,
    onlineTherapyAvailable: therapist.online_therapy,
    acceptsInsurance: therapist.in_person_therapy
  };
}