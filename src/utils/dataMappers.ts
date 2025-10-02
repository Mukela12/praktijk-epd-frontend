// Centralized data transformation utilities
// Handles standardization of data from various API endpoints and response structures

// Types for better type safety
export interface NormalizedAppointment {
  id: string;
  clientName: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  therapistName: string;
  therapistFirstName: string;
  therapistLastName: string;
  therapistEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  paymentStatus: string;
  location: string;
  sessionNumber: number;
  notes: string;
  therapyType: string;
  urgencyLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedClient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  preferredLanguage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Therapy-specific fields
  therapyGoals?: string;
  intakeCompleted?: boolean;
  intakeDate?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  urgencyLevel?: string;
  hulpvragen?: string[];
}

export interface NormalizedTherapist {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  status: string;
  specializations: string[];
  languages: string[];
  hourlyRate: number;
  maxClients: number;
  currentClients: number;
  acceptsNewClients: boolean;
  bio: string;
  licenseNumber: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalize appointment data from various API response formats
 * Handles multiple field naming patterns and nested structures
 */
export const normalizeAppointmentData = (rawData: any): NormalizedAppointment => {
  // Handle nested response structures (response.data.data vs response.data)
  const appointment = rawData.appointment || rawData;
  
  // Client name handling - multiple fallback patterns
  const clientFirstName = appointment.client_first_name || 
                         appointment.clientFirstName || 
                         appointment.client?.first_name || 
                         appointment.client?.firstName || 
                         appointment.client_name?.split(' ')[0] ||
                         '';
                         
  const clientLastName = appointment.client_last_name || 
                        appointment.clientLastName || 
                        appointment.client?.last_name || 
                        appointment.client?.lastName || 
                        appointment.client_name?.split(' ').slice(1).join(' ') ||
                        '';
  
  const clientName = appointment.client_name || 
                    appointment.clientName || 
                    `${clientFirstName} ${clientLastName}`.trim() ||
                    'Unknown Client';
  
  // Therapist name handling - multiple fallback patterns  
  const therapistFirstName = appointment.therapist_first_name || 
                            appointment.therapistFirstName || 
                            appointment.therapist?.first_name || 
                            appointment.therapist?.firstName ||
                            appointment.therapist_name?.split(' ')[0] ||
                            '';
                            
  const therapistLastName = appointment.therapist_last_name || 
                           appointment.therapistLastName || 
                           appointment.therapist?.last_name || 
                           appointment.therapist?.lastName ||
                           appointment.therapist_name?.split(' ').slice(1).join(' ') ||
                           '';
  
  const therapistName = appointment.therapist_name || 
                       appointment.therapistName || 
                       `${therapistFirstName} ${therapistLastName}`.trim() ||
                       'Dr. Unknown Therapist';
  
  // Date and time handling
  const appointmentDate = appointment.appointment_date || 
                         appointment.appointmentDate || 
                         appointment.date ||
                         '';
                         
  const appointmentTime = appointment.appointment_time || 
                         appointment.appointmentTime || 
                         appointment.start_time ||
                         appointment.startTime ||
                         appointment.time ||
                         '';
  
  return {
    id: appointment.id || '',
    clientName,
    clientFirstName,
    clientLastName,
    clientEmail: appointment.client_email || appointment.clientEmail || appointment.client?.email || '',
    therapistName,
    therapistFirstName,
    therapistLastName,
    therapistEmail: appointment.therapist_email || appointment.therapistEmail || appointment.therapist?.email || '',
    appointmentDate,
    appointmentTime,
    startTime: appointment.start_time || appointment.startTime || appointmentTime,
    endTime: appointment.end_time || appointment.endTime || '',
    duration: appointment.duration || 60,
    status: appointment.status || 'scheduled',
    paymentStatus: appointment.payment_status || appointment.paymentStatus || 'pending',
    location: appointment.location || 'office',
    sessionNumber: appointment.session_number || appointment.sessionNumber || 1,
    notes: appointment.notes || appointment.session_notes || '',
    therapyType: appointment.therapy_type || appointment.therapyType || 'counseling',
    urgencyLevel: appointment.urgency_level || appointment.urgencyLevel || 'normal',
    createdAt: appointment.created_at || appointment.createdAt || '',
    updatedAt: appointment.updated_at || appointment.updatedAt || ''
  };
};

/**
 * Normalize client data from various API response formats
 */
export const normalizeClientData = (rawData: any): NormalizedClient => {
  const client = rawData.client || rawData;
  
  const firstName = client.first_name || client.firstName || '';
  const lastName = client.last_name || client.lastName || '';
  const name = client.name || `${firstName} ${lastName}`.trim() || 'Unknown Client';
  
  return {
    id: client.id || '',
    name,
    firstName,
    lastName,
    email: client.email || '',
    phone: client.phone || '',
    dateOfBirth: client.date_of_birth || client.dateOfBirth || '',
    gender: client.gender || '',
    preferredLanguage: client.preferred_language || client.preferredLanguage || 'nl',
    status: client.status || 'active',
    createdAt: client.created_at || client.createdAt || '',
    updatedAt: client.updated_at || client.updatedAt || '',
    // Therapy-specific fields
    therapyGoals: client.therapy_goals || client.therapyGoals || '',
    intakeCompleted: client.intake_completed || client.intakeCompleted || false,
    intakeDate: client.intake_date || client.intakeDate || '',
    assignedTherapistId: client.assigned_therapist_id || client.assignedTherapistId || '',
    assignedTherapistName: client.assigned_therapist_name || client.assignedTherapistName || '',
    urgencyLevel: client.urgency_level || client.urgencyLevel || 'normal',
    hulpvragen: client.hulpvragen || []
  };
};

/**
 * Normalize therapist data from various API response formats
 */
export const normalizeTherapistData = (rawData: any): NormalizedTherapist => {
  const therapist = rawData.therapist || rawData;
  
  const firstName = therapist.first_name || therapist.firstName || '';
  const lastName = therapist.last_name || therapist.lastName || '';
  const name = therapist.name || `${firstName} ${lastName}`.trim() || 'Unknown Therapist';
  
  return {
    id: therapist.id || '',
    name,
    firstName,
    lastName,
    email: therapist.email || '',
    phone: therapist.phone || '',
    preferredLanguage: therapist.preferred_language || therapist.preferredLanguage || 'nl',
    status: therapist.status || 'active',
    specializations: therapist.specializations || [],
    languages: therapist.languages || ['nl'],
    hourlyRate: therapist.hourly_rate || therapist.hourlyRate || therapist.consultation_rate || 85,
    maxClients: therapist.max_clients || therapist.maxClients || 20,
    currentClients: therapist.current_clients || therapist.currentClients || 0,
    acceptsNewClients: therapist.accepts_new_clients ?? therapist.acceptsNewClients ?? true,
    bio: therapist.bio || '',
    licenseNumber: therapist.license_number || therapist.licenseNumber || '',
    city: therapist.city || '',
    createdAt: therapist.created_at || therapist.createdAt || '',
    updatedAt: therapist.updated_at || therapist.updatedAt || ''
  };
};

/**
 * Normalize API response structure - handles nested responses
 */
export const normalizeApiResponse = (response: any) => {
  // Handle various response structures:
  // 1. { data: { data: [...] } } - nested structure
  // 2. { data: [...] } - flat structure  
  // 3. { success: true, data: [...] } - success wrapper
  
  if (response.data?.data) {
    return response.data.data;
  }
  
  if (response.data) {
    return response.data;
  }
  
  return response;
};

/**
 * Normalize paginated response structure
 */
export const normalizePaginatedResponse = (response: any) => {
  const data = normalizeApiResponse(response);
  
  // Handle different pagination structures
  if (Array.isArray(data)) {
    return {
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  if (data.data && data.pagination) {
    return data;
  }
  
  // Extract pagination from various formats
  const pagination = data.pagination || data.meta || {
    page: 1,
    limit: Array.isArray(data) ? data.length : 0,
    total: Array.isArray(data) ? data.length : 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };
  
  return {
    data: Array.isArray(data) ? data : (data.data || []),
    pagination
  };
};

/**
 * Bulk normalize appointment list
 */
export const normalizeAppointmentList = (appointments: any[]): NormalizedAppointment[] => {
  return appointments.map(normalizeAppointmentData);
};

/**
 * Bulk normalize client list
 */
export const normalizeClientList = (clients: any[]): NormalizedClient[] => {
  return clients.map(normalizeClientData);
};

/**
 * Bulk normalize therapist list
 */
export const normalizeTherapistList = (therapists: any[]): NormalizedTherapist[] => {
  return therapists.map(normalizeTherapistData);
};

/**
 * Smart fallback for missing data - provides sensible defaults
 */
export const withSmartDefaults = <T extends Record<string, any>>(data: T, entityType: 'appointment' | 'client' | 'therapist'): T => {
  const defaults = {
    appointment: {
      clientName: 'Client',
      therapistName: 'Therapist',
      appointmentTime: 'TBD',
      status: 'scheduled',
      duration: 60
    },
    client: {
      name: 'Client',
      status: 'active',
      preferredLanguage: 'nl'
    },
    therapist: {
      name: 'Therapist',
      status: 'active',
      preferredLanguage: 'nl',
      hourlyRate: 85,
      maxClients: 20,
      currentClients: 0
    }
  };
  
  const entityDefaults = defaults[entityType];
  
  return {
    ...entityDefaults,
    ...data
  };
};