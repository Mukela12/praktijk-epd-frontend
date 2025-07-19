// Frontend authentication types

export enum UserRole {
    ADMIN = 'admin',
    THERAPIST = 'therapist',
    ASSISTANT = 'assistant',
    BOOKKEEPER = 'bookkeeper',
    SUBSTITUTE = 'substitute',
    CLIENT = 'client'
  }
  
  export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
    VACATION = 'VACATION'
  }
  
  export enum LanguageCode {
    EN = 'en',
    NL = 'nl'
  }
  
  export interface User {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    first_name: string;
    last_name: string;
    phone?: string;
    preferred_language: LanguageCode;
    two_factor_enabled: boolean;
    two_factor_setup_completed: boolean;
    email_verified: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
  }
  
  // Authentication state machine
  export enum AuthenticationState {
    IDLE = 'IDLE',
    AUTHENTICATING = 'AUTHENTICATING',
    AUTHENTICATED = 'AUTHENTICATED',
    REQUIRES_2FA_VERIFICATION = 'REQUIRES_2FA_VERIFICATION',
    REQUIRES_2FA_SETUP = 'REQUIRES_2FA_SETUP',
    AUTHENTICATED_COMPLETE = 'AUTHENTICATED_COMPLETE',
    ERROR = 'ERROR'
  }

  export interface AuthState {
    user: User | null;
    accessToken: string | null;
    authenticationState: AuthenticationState;
    error: string | null;
    // Navigation state
    pendingNavigation: string | null;
    // Legacy support (deprecated)
    isAuthenticated: boolean;
    isLoading: boolean;
    requiresTwoFactor: boolean;
    twoFactorSetupRequired: boolean;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    rememberDevice?: boolean;
    twoFactorCode?: string;
  }
  
  export interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    preferredLanguage?: LanguageCode;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    requiresTwoFactor?: boolean;
    twoFactorSetupRequired?: boolean;
    tempToken?: string;
    sessionToken?: string;
  }

  // Centralized navigation and auth helpers
  export interface AuthNavigation {
    /**
     * Get the dashboard path for a given role
     */
    getDashboardPath: (role: UserRole) => string;
    
    /**
     * Check if user requires 2FA setup
     */
    requires2FASetup: (user: User) => boolean;
    
    /**
     * Get the next navigation path based on auth state
     */
    getNextNavigationPath: (user: User, authState: AuthenticationState) => string;
    
    /**
     * Handle navigation with proper state management
     */
    navigateWithAuth: (path: string, replace?: boolean) => void;
  }
  
  export interface ApiError {
    success: false;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
    statusCode?: number;
  }
  
  export interface TwoFactorSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }
  
  export interface PasswordResetRequest {
    email: string;
  }
  
  export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface UserProfile extends User {
    // Extended profile information based on role
    therapistProfile?: TherapistProfile;
    clientProfile?: ClientProfile;
  }
  
  export interface TherapistProfile {
    id: string;
    user_id: string;
    license_number?: string;
    specializations: string[];
    therapy_types: string[];
    languages: LanguageCode[];
    bio?: string;
    qualifications?: string;
    hourly_rate?: number;
    working_hours?: Record<string, any>;
    max_clients_per_day: number;
    session_duration: number;
    break_between_sessions: number;
    kvk_number?: string;
    big_number?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ClientProfile {
    id: string;
    user_id: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    insurance_company?: string;
    insurance_number?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    street_address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    preferred_therapist_id?: string;
    preferred_gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    preferred_language?: LanguageCode;
    therapy_goals?: string;
    status: 'new' | 'viewed' | 'scheduled' | 'starting' | 'active' | 'discontinued' | 'completed' | 'archived';
    assigned_therapist_id?: string;
    intake_completed: boolean;
    intake_date?: string;
    created_at: string;
    updated_at: string;
  }
  
  // Form validation schemas
  export interface LoginFormData {
    email: string;
    password: string;
    rememberDevice?: boolean;
    twoFactorCode?: string;
  }
  
  export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    preferredLanguage: LanguageCode;
    acceptTerms: boolean;
  }
  
  export interface ForgotPasswordFormData {
    email: string;
  }
  
  export interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface TwoFactorFormData {
    code: string;
  }
  
  // Navigation and routing
  export interface RoleRouteConfig {
    role: UserRole;
    basePath: string;
    defaultRoute: string;
    allowedRoutes: string[];
  }
  
  export interface NavItem {
    name: string;
    nameNL: string;
    href: string;
    icon: any; // React component
    roles: UserRole[];
    children?: NavItem[];
  }
  
  // Language and localization
  export interface TranslationStrings {
    [key: string]: {
      en: string;
      nl: string;
    };
  }
  
  export interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
  }
  
  // API response types
  export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  }
  
  // Security and session
  export interface SecuritySettings {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    sessionTimeoutMinutes: number;
    require2FAForStaff: boolean;
    allowClientSelfRegistration: boolean;
  }
  
  export interface DeviceInfo {
    fingerprint: string;
    userAgent: string;
    ipAddress: string;
    trusted: boolean;
    lastUsed: string;
  }
  
  export interface SessionInfo {
    id: string;
    deviceFingerprint: string;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
  }
  
  // Role-specific dashboard data
  export interface DashboardData {
    role: UserRole;
    metrics: Record<string, number>;
    recentActivity: any[];
    notifications: any[];
    upcomingEvents: any[];
  }
  
  // Form field configurations
  export interface FormFieldConfig {
    name: string;
    label: string;
    labelNL: string;
    type: 'text' | 'email' | 'password' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'radio';
    placeholder?: string;
    placeholderNL?: string;
    required?: boolean;
    validation?: any;
    options?: Array<{ value: string; label: string; labelNL: string }>;
    rows?: number;
    helpText?: string;
    helpTextNL?: string;
  }
  
  // Color and theme mappings
  export interface RoleColorConfig {
    primary: string;
    secondary: string;
    background: string;
    border: string;
    text: string;
  }
  
  export interface StatusColorConfig {
    [status: string]: string;
  }
  
  export const ROLE_COLORS: Record<UserRole, RoleColorConfig> = {
    [UserRole.ADMIN]: {
      primary: 'admin-primary',
      secondary: 'admin-secondary',
      background: 'admin-background',
      border: 'admin-border',
      text: 'white'
    },
    [UserRole.THERAPIST]: {
      primary: 'therapist-primary',
      secondary: 'therapist-secondary',
      background: 'therapist-background',
      border: 'therapist-border',
      text: 'white'
    },
    [UserRole.CLIENT]: {
      primary: 'client-primary',
      secondary: 'client-secondary',
      background: 'client-background',
      border: 'client-border',
      text: 'white'
    },
    [UserRole.ASSISTANT]: {
      primary: 'assistant-primary',
      secondary: 'assistant-secondary',
      background: 'assistant-background',
      border: 'assistant-border',
      text: 'white'
    },
    [UserRole.BOOKKEEPER]: {
      primary: 'bookkeeper-primary',
      secondary: 'bookkeeper-secondary',
      background: 'bookkeeper-background',
      border: 'bookkeeper-border',
      text: 'white'
    },
    [UserRole.SUBSTITUTE]: {
      primary: 'therapist-primary',
      secondary: 'therapist-secondary',
      background: 'therapist-background',
      border: 'therapist-border',
      text: 'white'
    }
  };
  
  export const STATUS_COLORS: StatusColorConfig = {
    active: 'text-status-active',
    inactive: 'text-status-inactive',
    pending: 'text-status-pending',
    suspended: 'text-status-suspended',
    vacation: 'text-status-vacation'
  };