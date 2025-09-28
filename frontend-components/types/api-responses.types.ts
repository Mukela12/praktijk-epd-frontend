// Comprehensive TypeScript interfaces for all API responses
// Based on verified backend API responses from production Railway deployment

// Base API response structure
export interface BaseAPIResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Authentication responses
export interface AuthResponse extends BaseAPIResponse {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'client' | 'therapist' | 'admin';
    };
  };
}

// User profile responses
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'client' | 'therapist' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Related profile data
  clientProfile?: ClientProfile;
  therapistProfile?: TherapistProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  bsn?: string;
  initials?: string;
  namePrefix?: string;
  salutation?: string;
  mobilePhone?: string;
  streetName?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  mailingStreet?: string;
  mailingHouseNumber?: string;
  mailingPostalCode?: string;
  mailingCity?: string;
  insuranceNumber?: string;
  insuranceCompany?: string;
  generalPractitionerName?: string;
  bankAccountIban?: string;
  clientNumber?: string;
  additionalEmails?: string;
  youthBsn?: string;
  guardianName?: string;
  hasCompletedIntake: boolean;
  canBookAppointments: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  licenseNumber?: string;
  specializations?: string;
  bio?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  education?: string;
  certifications?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse extends BaseAPIResponse {
  data: UserProfile;
}

export interface UserListResponse extends BaseAPIResponse {
  data: {
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// CSV Import responses
export interface CSVImportResponse extends BaseAPIResponse {
  data: {
    importId: string;
    message: string;
  };
}

export interface CSVImportProgress {
  importId: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'processing' | 'completed' | 'failed';
  errors: Array<{
    row: number;
    field?: string;
    error: string;
  }>;
  startedAt: string;
  completedAt?: string;
}

export interface CSVImportProgressResponse extends BaseAPIResponse {
  data: CSVImportProgress;
}

// Intake Form responses
export interface IntakeFormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface IntakeFormSection {
  id: string;
  title: string;
  description?: string;
  fields: IntakeFormField[];
}

export interface IntakeFormStructure {
  sections: IntakeFormSection[];
  totalFields: number;
  requiredFields: number;
}

export interface IntakeFormData {
  // Personal Information
  educationLevel?: string;
  profession?: string;
  hobbiesSports?: string;
  relationshipStatus?: string;
  childrenCount?: number;
  childrenFromMultipleRelations?: boolean;
  familyBackground?: string;
  
  // Referral Information
  referralSource?: string;
  referralDetails?: string;
  
  // Health History
  smokingStatus?: boolean;
  smokingAmount?: string;
  alcoholUse?: boolean;
  alcoholAmount?: string;
  drugUse?: boolean;
  drugDetails?: string;
  currentMedications?: string;
  painkillersUse?: boolean;
  painkillersDetails?: string;
  
  // Therapy History
  previousTherapy?: boolean;
  previousTherapyDetails?: string;
  previousComplaints?: string;
  therapyDuration?: string;
  
  // Current Situation
  currentComplaints?: string;
  complaintSeverity?: 'light' | 'mild' | 'serious' | 'very_serious';
  complaintDuration?: string;
  complaintCause?: string;
  significantEvents?: boolean;
  significantEventsDetails?: string;
  traumaticEvents?: string;
  complaintsOnset?: string;
  
  // Therapy Goals
  therapyGoals?: string;
  stepsTaken?: string;
  expectedChanges?: string;
  observableChanges?: string;
  expectedObstacles?: string;
  mainFocus?: string;
  currentCoping?: string;
  selfHelpAttempts?: string;
  environmentReaction?: string;
  
  // Additional Information
  additionalInfo?: string;
  questionsRemarks?: string;
  therapistExpectations?: string;
  consultationPreference?: 'in_person' | 'online' | 'both';
  onlineTherapyInterest?: string;
  insuranceAcknowledgment?: boolean;
  
  // Meta fields
  isComplete?: boolean;
  completedAt?: string;
  lastSaved?: string;
  clientId?: string;
}

export interface IntakeFormStructureResponse extends BaseAPIResponse {
  data: IntakeFormStructure;
}

export interface IntakeFormDataResponse extends BaseAPIResponse {
  data: IntakeFormData;
  completed: boolean;
  completionPercentage: number;
}

export interface IntakeFormSaveResponse extends BaseAPIResponse {
  data: {
    saved: boolean;
    completionPercentage: number;
  };
}

export interface IntakeStatusResponse extends BaseAPIResponse {
  data: {
    canBookAppointments: boolean;
    completionPercentage: number;
    hasCompletedIntake: boolean;
  };
}

// Dashboard responses
export interface DashboardData {
  user: UserProfile;
  hasCompletedIntake: boolean;
  upcomingAppointments: number;
  totalAppointments: number;
  nextAppointment?: {
    id: string;
    datetime: string;
    therapistName: string;
    type: 'in_person' | 'online';
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface ClientDashboardResponse extends BaseAPIResponse {
  data: DashboardData;
}

// Admin management responses
export interface AdminStatsResponse extends BaseAPIResponse {
  data: {
    totalClients: number;
    totalTherapists: number;
    activeClients: number;
    completedIntakes: number;
    pendingIntakes: number;
    totalAppointments: number;
    recentRegistrations: number;
  };
}

// Appointment responses
export interface Appointment {
  id: string;
  clientId: string;
  therapistId: string;
  datetime: string;
  duration: number;
  type: 'in_person' | 'online';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specializations?: string;
  };
}

export interface AppointmentResponse extends BaseAPIResponse {
  data: Appointment;
}

export interface AppointmentListResponse extends BaseAPIResponse {
  data: {
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error response structure
export interface APIError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}

// Generic list response
export interface ListResponse<T> extends BaseAPIResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// File upload response
export interface FileUploadResponse extends BaseAPIResponse {
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
  };
}