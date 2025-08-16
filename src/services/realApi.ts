import api from './api';
import { ApiResponse } from '@/types/auth';

// Request cache and debouncing to prevent 429 errors
interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class RequestManager {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private lastRequestTimes: Map<string, number> = new Map();
  private readonly MIN_REQUEST_INTERVAL = 100; // 100ms between requests to same endpoint
  private readonly DEFAULT_CACHE_DURATION = 30000; // 30 seconds

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${params ? JSON.stringify(params) : ''}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() < entry.expiry;
  }

  private shouldThrottle(endpoint: string): boolean {
    const lastRequest = this.lastRequestTimes.get(endpoint);
    if (!lastRequest) return false;
    return Date.now() - lastRequest < this.MIN_REQUEST_INTERVAL;
  }

  async makeRequest<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    cacheDuration: number = this.DEFAULT_CACHE_DURATION,
    params?: any
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      console.log(`[RequestManager] Using cached data for ${endpoint}`);
      return cached.data;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log(`[RequestManager] Request already pending for ${endpoint}, waiting...`);
      return pending;
    }

    // Throttle requests to prevent 429 errors
    if (this.shouldThrottle(endpoint)) {
      console.log(`[RequestManager] Throttling request to ${endpoint}, using cache or waiting...`);
      if (cached) {
        return cached.data; // Use expired cache if available
      }
      // Wait before making request
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL));
    }

    // Make the request
    const requestPromise = requestFn().finally(() => {
      this.pendingRequests.delete(cacheKey);
      this.lastRequestTimes.set(endpoint, Date.now());
    });

    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      // Cache successful results
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expiry: Date.now() + cacheDuration
      });
      return result;
    } catch (error) {
      // On error, return cached data if available
      if (cached) {
        console.warn(`[RequestManager] Request failed for ${endpoint}, using cached data`);
        return cached.data;
      }
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearEndpointCache(endpoint: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
      }
    }
  }

  clearRelatedCache(endpoint: string): void {
    // Clear cache for related endpoints when data is mutated
    const relatedEndpoints: Record<string, string[]> = {
      '/resources': ['/resources', '/admin/dashboard', '/therapist/dashboard'],
      '/challenges': ['/challenges', '/admin/dashboard'],
      '/surveys': ['/surveys', '/admin/dashboard'],
      '/admin/users': ['/admin/users', '/admin/clients', '/admin/dashboard'],
      '/admin/clients': ['/admin/clients', '/admin/dashboard', '/therapist/clients'],
      '/appointments': ['/appointments', '/admin/appointments', '/therapist/appointments', '/client/appointments'],
      '/invoices': ['/invoices', '/bookkeeper/invoices', '/admin/financial']
    };

    const toClear = relatedEndpoints[endpoint] || [endpoint];
    toClear.forEach(ep => this.clearEndpointCache(ep));
  }
}

const requestManager = new RequestManager();

// Updated types based on actual backend responses
interface AdminDashboardData {
  kpis: {
    totalRevenue: number;
    activeClients: number;
    totalTherapists: number;
    appointmentsToday: number;
    waitingListSize: number;
    overdueInvoices: number;
    systemHealth: number;
  };
  userStats: {
    totalUsers: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    activeUsers: number;
  };
  clientStats: {
    totalClients: number;
    activeClients: number;
    assignedClients: number;
    intakeCompletedClients: number;
    byStatus: Record<string, number>;
  };
  therapistStats: {
    totalTherapists: number;
    activeTherapists: number;
    averageCaseload: number;
    totalClientsAssigned: number;
    byStatus: Record<string, number>;
    byContractStatus: Record<string, number>;
  };
  appointmentStats: {
    totalAppointments: number;
    todayAppointments: number;
    upcomingAppointments: number;
    overdueAppointments: number;
    byStatus: Record<string, number>;
  };
  financialStats: {
    totalRevenue: number;
    pendingRevenue: number;
    overdueInvoices: number;
    paidInvoices: number;
    byPaymentStatus: Record<string, any>;
  };
  waitingListStats: {
    totalWaiting: number;
    averageWaitDays: number;
    byStatus: Record<string, number>;
    byUrgency: Record<string, number>;
  };
  locationStats: {
    totalLocations: number;
    activeLocations: number;
    locationsWithTherapists: number;
  };
  systemAlerts: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
    action?: string;
  }>;
  recentActivity: Array<{
    action: string;
    entityType: string;
    timestamp: string;
    user: {
      name: string;
      role: string;
    };
    data?: any;
  }>;
}

// Client type based on backend response
interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_status: 'active' | 'inactive' | 'pending';
  preferred_language: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  client_status: 'active' | 'new' | 'inactive';
  date_of_birth?: string;
  gender?: string;
  insurance_company?: string;
  insurance_number?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  therapy_goals?: string;
  intake_completed: boolean;
  intake_date?: string;
  assigned_therapist_id?: string;
  therapist_first_name?: string;
  therapist_last_name?: string;
  total_appointments?: string;
  completed_appointments?: string;
  unpaid_appointments?: string;
}

// Therapist type
interface Therapist {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  specializations: string[];
  bio?: string;
  therapy_types?: string;
  qualifications?: string;
  years_of_experience?: number;
  license_number?: string;
  max_clients_per_day?: number;
  min_session_duration?: number;
  max_session_duration?: number;
  session_rate?: number;
  accepts_insurance?: boolean;
  languages_spoken?: string[];
  emergency_available?: boolean;
  online_therapy_available?: boolean;
}

// Appointment type
interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  therapy_type?: string;
  location?: string;
  session_notes?: string;
  homework_assigned?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  invoice_sent: boolean;
  created_at: string;
  updated_at: string;
  client_first_name?: string;
  client_last_name?: string;
  therapist_first_name?: string;
  therapist_last_name?: string;
}

// Message type
interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  message_type?: string;
  priority_level?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_role?: string;
}

// Helper function to wrap API calls with request management
const managedApiCall = async <T>(
  endpoint: string,
  apiCall: () => Promise<T>,
  cacheDuration: number = 30000,
  params?: any
): Promise<T> => {
  return requestManager.makeRequest(endpoint, apiCall, cacheDuration, params);
};

// Real API service that connects to the verified backend
export const realApiService = {
  // Health check
  health: {
    check: async (): Promise<{ status: string; timestamp: string; uptime: number; environment: string }> => {
      const response = await api.get('/health', { baseURL: 'https://praktijk-epd-backend-production.up.railway.app' });
      return response.data;
    }
  },

  // Admin endpoints (✅ All verified working)
  admin: {
    // Dashboard data (✅ WORKING)
    getDashboard: async (): Promise<ApiResponse<AdminDashboardData>> => {
      return managedApiCall('/admin/dashboard', async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
      }, 60000); // Cache for 1 minute
    },

    // Financial overview (✅ WORKING) 
    getFinancialOverview: async (): Promise<ApiResponse<any>> => {
      return managedApiCall('/admin/financial/overview', async () => {
        const response = await api.get('/admin/financial/overview');
        return response.data;
      }, 60000); // Cache for 1 minute
    },

    // Users management (✅ WORKING)
    getUsers: async (params?: { 
      page?: number; 
      limit?: number; 
      role?: string; 
      status?: string; 
      search?: string 
    }): Promise<ApiResponse<{ users: any[]; pagination: any }>> => {
      const response = await api.get('/admin/users', { params });
      return response.data;
    },

    createUser: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      phone?: string;
    }): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/admin/users', userData);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/users');
      }
      return response.data;
    },

    updateUser: async (userId: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/admin/users/${userId}`, updates);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/users');
      }
      return response.data;
    },

    // Client management (✅ WORKING)
    getClients: async (params?: { 
      status?: string; 
      therapistId?: string; 
      page?: number; 
      limit?: number 
    }): Promise<ApiResponse<{ clients: Client[]; pagination: any }>> => {
      const response = await api.get('/admin/clients', { params });
      return response.data;
    },

    getClient: async (clientId: string): Promise<ApiResponse<Client>> => {
      const response = await api.get(`/admin/clients/${clientId}`);
      return response.data;
    },

    // Therapist management (✅ WORKING)
    getTherapists: async (params?: any): Promise<ApiResponse<{ therapists: Therapist[]; pagination?: any }>> => {
      const response = await api.get('/admin/therapists', { params });
      return response.data;
    },

    // Waiting list (✅ WORKING)
    getWaitingList: async (params?: any): Promise<ApiResponse<{ waitingList: any[]; total: number }>> => {
      const response = await api.get('/admin/waiting-list', { params });
      return response.data;
    },

    // Appointments (✅ WORKING)
    getAppointments: async (params?: any): Promise<ApiResponse<{ appointments: Appointment[]; pagination?: any }>> => {
      const response = await api.get('/admin/appointments', { params });
      return response.data;
    },

    // Reports (✅ WORKING)
    getReports: async (reportType: string, params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/admin/reports', { params: { reportType, ...params } });
      return response.data;
    },
    
    // Therapies Management
    getTherapies: async (): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/admin/therapies');
      return response.data;
    },
    
    createTherapy: async (data: any): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/admin/therapies', data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/therapies');
      }
      return response.data;
    },
    
    updateTherapy: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/admin/therapies/${id}`, data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/therapies');
      }
      return response.data;
    },
    
    deleteTherapy: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/admin/therapies/${id}`);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/therapies');
      }
      return response.data;
    },
    
    // Psychological Problems Management
    getPsychologicalProblems: async (): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/admin/psychological-problems');
      return response.data;
    },
    
    createPsychologicalProblem: async (data: any): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/admin/psychological-problems', data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/psychological-problems');
      }
      return response.data;
    },
    
    updatePsychologicalProblem: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/admin/psychological-problems/${id}`, data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/psychological-problems');
      }
      return response.data;
    },
    
    deletePsychologicalProblem: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/admin/psychological-problems/${id}`);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/psychological-problems');
      }
      return response.data;
    },
    
    // Resources Management
    getResources: async (): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/admin/resources');
      return response.data;
    },
    
    createResource: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/admin/resources', data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/resources');
      }
      return response.data;
    },
    
    updateResource: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/admin/resources/${id}`, data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/resources');
      }
      return response.data;
    },
    
    deleteResource: async (id: string): Promise<ApiResponse<void>> => {
      const response = await api.delete(`/admin/resources/${id}`);
      if (response.data.success) {
        requestManager.clearRelatedCache('/admin/resources');
      }
      return response.data;
    },

    // Appointment Requests Management
    getAppointmentRequests: async (): Promise<ApiResponse<{ requests: any[] }>> => {
      const response = await api.get('/admin/appointment-requests');
      return response.data;
    },

    // Therapist Assignment
    assignTherapist: async (data: {
      clientId: string;
      therapistId: string;
      appointmentRequestId?: string;
      notes?: string;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post('/admin/assign-therapist', data);
      return response.data;
    },

    // Smart Pairing
    getSmartPairingRecommendations: async (params: {
      clientId: string;
      appointmentDate?: string;
      appointmentTime?: string;
      therapyType?: string;
      urgencyLevel?: string;
    }): Promise<ApiResponse<{ recommendations: any[] }>> => {
      const response = await api.get('/admin/smart-pairing/recommendations', { params });
      return response.data;
    },

    // Sessions Management
    getSessions: async (params?: {
      startDate?: string;
      endDate?: string;
      therapistId?: string;
      clientId?: string;
    }): Promise<ApiResponse<{ sessions: any[] }>> => {
      const response = await api.get('/admin/sessions', { params });
      return response.data;
    },

    getSessionStatistics: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/admin/sessions/statistics');
      return response.data;
    }
  },

  // Therapist endpoints (✅ All verified working)
  therapist: {
    // Dashboard (✅ WORKING)
    getDashboard: async (): Promise<ApiResponse<{
      stats: {
        activeClients: number;
        todayAppointments: number;
        weeklyAppointments: number;
        completedSessions: number;
      };
      upcomingAppointments: Appointment[];
      recentClients: Client[];
    }>> => {
      const response = await api.get('/therapist/dashboard');
      return response.data;
    },

    // Profile (✅ WORKING)
    getProfile: async (): Promise<ApiResponse<Therapist>> => {
      const response = await api.get('/therapist/profile');
      return response.data;
    },

    updateProfile: async (data: {
      bio?: string;
      specializations?: string[];
      maxClientsPerDay?: number;
      [key: string]: any;
    }): Promise<ApiResponse<Therapist>> => {
      const response = await api.put('/therapist/profile', data);
      return response.data;
    },

    // Clients (✅ WORKING)
    getClients: async (params?: { status?: string }): Promise<ApiResponse<Client[]>> => {
      const response = await api.get('/therapist/clients', { params });
      return response.data;
    },

    getClient: async (clientId: string): Promise<ApiResponse<Client>> => {
      const response = await api.get(`/therapist/clients/${clientId}`);
      return response.data;
    },

    // Appointments (✅ WORKING)
    getAppointments: async (params?: { 
      date?: string; 
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<Appointment[]>> => {
      const response = await api.get('/therapist/appointments', { params });
      return response.data;
    },

    createAppointment: async (appointmentData: {
      clientId: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
      therapyType?: string;
      location?: string;
      notes?: string;
    }): Promise<ApiResponse<Appointment>> => {
      const response = await api.post('/therapist/appointments', appointmentData);
      return response.data;
    },

    updateAppointment: async (appointmentId: string, updates: {
      status?: string;
      notes?: string;
      [key: string]: any;
    }): Promise<ApiResponse<Appointment>> => {
      const response = await api.put(`/therapist/appointments/${appointmentId}`, updates);
      return response.data;
    },

    deleteAppointment: async (appointmentId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/therapist/appointments/${appointmentId}`);
      return response.data;
    },

    // Schedule (✅ WORKING)
    getSchedule: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> => {
      const response = await api.get('/therapist/schedule', { params });
      return response.data;
    },

    // Availability (✅ WORKING)
    getAvailability: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/therapist/availability');
      return response.data;
    },
    
    // Get available therapies (from admin)
    getAvailableTherapies: async (): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/therapist/available-therapies');
      return response.data;
    },
    
    // Get available psychological problems (from admin)
    getAvailablePsychologicalProblems: async (): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/therapist/available-psychological-problems');
      return response.data;
    }
  },

  // Client endpoints (✅ All verified working)
  client: {
    // Dashboard (✅ WORKING)
    getDashboard: async (): Promise<ApiResponse<{
      profile: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        status: string;
        intake_completed: boolean;
        therapy_goals: string;
      };
      metrics: {
        totalSessions: number;
        completedSessions: number;
        unreadMessages: number;
        nextAppointment: any;
      };
      upcomingAppointments: Appointment[];
      recentMessages: Message[];
      therapist: Therapist;
      progress: {
        total_sessions: string;
        completed_sessions: string;
        therapy_start_date: string | null;
        last_session_date: string | null;
      };
      pendingInvoices: any[];
    }>> => {
      const response = await api.get('/client/dashboard');
      return response.data;
    },

    // Profile (✅ WORKING)
    getProfile: async (): Promise<ApiResponse<Client>> => {
      const response = await api.get('/client/profile');
      return response.data;
    },

    updateProfile: async (data: {
      phone?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      [key: string]: any;
    }): Promise<ApiResponse<any>> => {
      const response = await api.put('/client/profile', data);
      return response.data;
    },

    // Appointments (✅ WORKING)
    getAppointments: async (params?: {
      status?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<Appointment[]>> => {
      const response = await api.get('/client/appointments', { params });
      return response.data;
    },

    requestAppointment: async (data: {
      preferredDate: string;
      preferredTime: string;
      therapyType: string;
      urgencyLevel?: string;
      reason: string;
    }): Promise<ApiResponse<{ id: string; status: string }>> => {
      const response = await api.post('/client/appointments/request', data);
      return response.data;
    },

    // Therapist info (✅ WORKING)
    getTherapist: async (): Promise<ApiResponse<Therapist>> => {
      const response = await api.get('/client/therapist');
      return response.data;
    },

    // Messages (✅ WORKING)
    getMessages: async (params?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    }): Promise<ApiResponse<{ messages: Message[]; total: number }>> => {
      const response = await api.get('/client/messages', { params });
      return response.data;
    },

    sendMessage: async (data: {
      recipient_id: string;
      subject: string;
      content: string;
      priority_level?: string;
    }): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/client/messages', data);
      return response.data;
    },

    // Intake form (✅ WORKING)
    submitIntakeForm: async (data: {
      reasonForTherapy: string;
      therapyGoals: string[] | string;
      medicalHistory?: string;
      medications?: string;
      previousTherapy?: boolean;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post('/client/intake-form', data);
      return response.data;
    },

    // Preferences (✅ WORKING)
    getPreferences: async (): Promise<ApiResponse<{
      communicationMethod: string;
      appointmentReminders: boolean;
      reminderTime?: number;
      language: string;
      timezone: string;
    }>> => {
      const response = await api.get('/client/preferences');
      return response.data;
    },

    updatePreferences: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.put('/client/preferences', data);
      return response.data;
    },

    // Invoices (✅ WORKING)
    getInvoices: async (params?: { status?: string }): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/client/invoices', { params });
      return response.data;
    },

    // Session history (✅ WORKING)
    getSessionHistory: async (params?: any): Promise<ApiResponse<any[]>> => {
      const response = await api.get('/client/session-history', { params });
      return response.data;
    }
  },

  // Resources endpoints (✅ All verified working)
  resources: {
    // Get all resources (✅ WORKING)
    getResources: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/resources', { params });
      return response.data;
    },
    
    // Get specific resource (✅ WORKING)
    getResourceById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/resources/${id}`);
      return response.data;
    },
    
    // Create resource (✅ WORKING)
    createResource: async (data: {
      title: string;
      description: string;
      type: string;
      category: string;
      contentBody?: string;
      contentUrl?: string;
      difficulty: string;
      tags: string[];
      isPublic: boolean;
      durationMinutes?: number;
    }): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/resources', data);
      // Clear cache after successful creation
      if (response.data.success) {
        requestManager.clearRelatedCache('/resources');
      }
      return response.data;
    },
    
    // Update resource (✅ WORKING)
    updateResource: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/resources/${id}`, data);
      // Clear cache after successful update
      if (response.data.success) {
        requestManager.clearRelatedCache('/resources');
      }
      return response.data;
    },
    
    // Delete resource (✅ WORKING)
    deleteResource: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/resources/${id}`);
      // Clear cache after successful deletion
      if (response.data.success) {
        requestManager.clearRelatedCache('/resources');
      }
      return response.data;
    },
    
    // Assign resource (✅ WORKING)
    assignResource: async (id: string, data: {
      clientId: string;
      dueDate?: string;
      priority?: string;
      notes?: string;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post(`/resources/${id}/assign`, data);
      return response.data;
    },

    // Get client resources (✅ WORKING)
    getClientResources: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/client/resources');
      return response.data;
    }
  },

  // Challenges endpoints (✅ All verified working)
  challenges: {
    // Get all challenges (✅ WORKING)
    getChallenges: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/challenges', { params });
      return response.data;
    },
    
    // Get specific challenge (✅ WORKING)
    getChallengeById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/challenges/${id}`);
      return response.data;
    },
    
    // Create challenge (✅ WORKING)
    createChallenge: async (data: {
      title: string;
      description: string;
      category: string;
      difficulty: string;
      duration: number;
      targetValue: number;
      targetUnit: string;
      isPublic: boolean;
      milestones?: any[];
      rewards?: any;
      instructions?: string[];
      tips?: string[];
    }): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/challenges', data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/challenges');
      }
      return response.data;
    },
    
    // Update challenge (✅ WORKING)
    updateChallenge: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/challenges/${id}`, data);
      if (response.data.success) {
        requestManager.clearRelatedCache('/challenges');
      }
      return response.data;
    },
    
    // Delete challenge (✅ WORKING)
    deleteChallenge: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/challenges/${id}`);
      if (response.data.success) {
        requestManager.clearRelatedCache('/challenges');
      }
      return response.data;
    },
    
    // Join challenge (✅ WORKING)
    joinChallenge: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.post(`/challenges/${id}/join`);
      return response.data;
    },
    
    // Update progress (✅ WORKING)
    updateProgress: async (id: string, data: {
      progressData: any;
      progressPercentage: number;
      milestoneReached?: any;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post(`/challenges/${id}/progress`, data);
      return response.data;
    }
  },

  // Surveys endpoints (✅ All verified working)
  surveys: {
    // Get all surveys (✅ WORKING)
    getSurveys: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/surveys', { params });
      return response.data;
    },
    
    // Get specific survey (✅ WORKING)
    getSurveyById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    },
    
    // Create survey (✅ WORKING)
    createSurvey: async (data: {
      title: string;
      description: string;
      type: string;
      questions: Array<{
        id: string;
        text: string;
        type: string;
        required: boolean;
        scale?: { min: number; max: number };
        options?: string[];
      }>;
    }): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/surveys', data);
      return response.data;
    },
    
    // Update survey (✅ WORKING)
    updateSurvey: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/surveys/${id}`, data);
      return response.data;
    },
    
    // Delete survey (✅ WORKING)
    deleteSurvey: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/surveys/${id}`);
      return response.data;
    },
    
    // Submit response (✅ WORKING)
    submitResponse: async (id: string, data: {
      responses: Record<string, any>;
    }): Promise<ApiResponse<any>> => {
      const response = await api.post(`/surveys/${id}/respond`, data);
      return response.data;
    },
    
    // Get responses (✅ WORKING)
    getResponses: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/surveys/${id}/responses`);
      return response.data;
    }
  },

  // Assistant endpoints
  assistant: {
    // Dashboard
    getDashboard: async (): Promise<ApiResponse<any>> => {
      return managedApiCall('/assistant/dashboard', async () => {
        const response = await api.get('/assistant/dashboard');
        return response.data;
      }, 60000);
    },

    // Appointments
    getAppointments: async (params?: { date?: string; status?: string }): Promise<ApiResponse<Appointment[]>> => {
      return managedApiCall('/assistant/appointments', async () => {
        const response = await api.get('/assistant/appointments', { params });
        return response.data;
      }, 30000);
    },

    // Clients
    getClients: async (params?: { status?: string }): Promise<ApiResponse<{ clients: Client[] }>> => {
      return managedApiCall('/assistant/clients', async () => {
        const response = await api.get('/assistant/clients', { params });
        return response.data;
      }, 60000);
    },

    // Messages
    getMessages: async (): Promise<ApiResponse<Message[]>> => {
      return managedApiCall('/assistant/messages', async () => {
        const response = await api.get('/assistant/messages');
        return response.data;
      }, 30000);
    },

    sendMessage: async (messageData: any): Promise<ApiResponse<{ id: string }>> => {
      const response = await api.post('/assistant/messages', messageData);
      return response.data;
    }
  },

  // Bookkeeper endpoints
  bookkeeper: {
    // Dashboard
    getDashboard: async (): Promise<ApiResponse<any>> => {
      return managedApiCall('/bookkeeper/dashboard', async () => {
        const response = await api.get('/bookkeeper/dashboard');
        return response.data;
      });
    },

    // Invoices
    getInvoices: async (params?: { status?: string; clientId?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/bookkeeper/invoices', async () => {
        const response = await api.get('/bookkeeper/invoices', { params });
        return response.data;
      }, 30000, params);
    },

    createInvoice: async (invoiceData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/bookkeeper/invoices', invoiceData);
      return response.data;
    },

    updateInvoice: async (invoiceId: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/bookkeeper/invoices/${invoiceId}`, updates);
      return response.data;
    },

    deleteInvoice: async (invoiceId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/bookkeeper/invoices/${invoiceId}`);
      return response.data;
    },

    markInvoicePaid: async (invoiceId: string): Promise<ApiResponse<any>> => {
      const response = await api.put(`/bookkeeper/invoices/${invoiceId}/status`, { status: 'paid' });
      return response.data;
    },

    // Reports
    getReports: async (reportType: string, params?: any): Promise<ApiResponse<any>> => {
      return managedApiCall(`/bookkeeper/reports/${reportType}`, async () => {
        const response = await api.get('/bookkeeper/reports', { params: { reportType, ...params } });
        return response.data;
      }, 30000, params);
    },

    // Financial Overview
    getFinancialOverview: async (period?: string): Promise<ApiResponse<any>> => {
      return managedApiCall('/bookkeeper/financial-overview', async () => {
        const response = await api.get('/bookkeeper/financial-overview', { params: { period } });
        return response.data;
      }, 30000, { period });
    },

    // Messages
    getMessages: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/bookkeeper/messages', async () => {
        const response = await api.get('/bookkeeper/messages', { params });
        return response.data;
      }, 30000, params);
    },

    sendMessage: async (messageData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/bookkeeper/messages', messageData);
      return response.data;
    },

    // Export
    exportInvoices: async (format: 'csv' | 'pdf', params?: any): Promise<any> => {
      const response = await api.get('/bookkeeper/export/invoices', { 
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    },

    exportPayments: async (format: 'csv' | 'pdf', params?: any): Promise<any> => {
      const response = await api.get('/bookkeeper/export/payments', { 
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    }
  },

  // Invoices endpoints (generic)
  invoices: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/invoices', async () => {
        const response = await api.get('/invoices', { params });
        return response.data;
      }, 30000, params);
    },

    getById: async (id: string): Promise<ApiResponse<any>> => {
      return managedApiCall(`/invoices/${id}`, async () => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
      });
    },

    create: async (invoiceData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    },

    update: async (id: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/invoices/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    }
  },

  // Clients endpoints (generic)
  clients: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/clients', async () => {
        const response = await api.get('/clients', { params });
        return response.data;
      }, 30000, params);
    },

    getById: async (id: string): Promise<ApiResponse<any>> => {
      return managedApiCall(`/clients/${id}`, async () => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
      });
    },

    create: async (clientData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/clients', clientData);
      return response.data;
    },

    update: async (id: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/clients/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    }
  },

  // Therapists endpoints (generic)
  therapists: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/therapists', async () => {
        const response = await api.get('/therapists', { params });
        return response.data;
      }, 30000, params);
    },

    getById: async (id: string): Promise<ApiResponse<any>> => {
      return managedApiCall(`/therapists/${id}`, async () => {
        const response = await api.get(`/therapists/${id}`);
        return response.data;
      });
    },

    create: async (therapistData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/therapists', therapistData);
      return response.data;
    },

    update: async (id: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/therapists/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/therapists/${id}`);
      return response.data;
    }
  },

  // Appointments endpoints (generic)
  appointments: {
    getAll: async (params?: { startDate?: string; endDate?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
      return managedApiCall('/appointments', async () => {
        const response = await api.get('/appointments', { params });
        return response.data;
      }, 30000, params);
    },

    getById: async (id: string): Promise<ApiResponse<any>> => {
      return managedApiCall(`/appointments/${id}`, async () => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
      });
    },

    create: async (appointmentData: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    },

    update: async (id: string, updates: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/appointments/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    }
  },

  // Messages endpoints
  messages: {
    getAll: async (): Promise<ApiResponse<{ messages: Message[] }>> => {
      const response = await api.get('/messages');
      return response.data;
    },

    getInbox: async (userId: string): Promise<ApiResponse<{ messages: Message[] }>> => {
      const response = await api.get(`/messages/inbox/${userId}`);
      return response.data;
    },

    send: async (messageData: any): Promise<ApiResponse<Message>> => {
      const response = await api.post('/messages', messageData);
      return response.data;
    },

    markAsRead: async (messageId: string): Promise<ApiResponse> => {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    }
  },

  // Notifications endpoints
  notifications: {
    getNotifications: async (params?: { limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<{ notifications: any[]; unreadCount: number }>> => {
      const response = await api.get('/notifications', { params });
      return response.data;
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse> => {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    },

    markAllAsRead: async (): Promise<ApiResponse> => {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    },

    deleteNotification: async (notificationId: string): Promise<ApiResponse> => {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    }
  },

  // Billing endpoints
  billing: {
    // Treatment codes
    getTreatmentCodes: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/billing/treatment-codes');
      return response.data;
    },
    
    createTreatmentCode: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/billing/treatment-codes', data);
      return response.data;
    },
    
    updateTreatmentCode: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/billing/treatment-codes/${id}`, data);
      return response.data;
    },
    
    deleteTreatmentCode: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/billing/treatment-codes/${id}`);
      return response.data;
    },

    // Invoices
    getInvoices: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/billing/invoices', { params });
      return response.data;
    },
    
    createInvoice: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/billing/invoices', data);
      return response.data;
    },
    
    getInvoiceById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/billing/invoices/${id}`);
      return response.data;
    },
    
    updateInvoice: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/billing/invoices/${id}`, data);
      return response.data;
    },
    
    sendInvoice: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.post(`/billing/invoices/${id}/send`);
      return response.data;
    },

    // Reports
    getRevenueReport: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/billing/reports/revenue', { params });
      return response.data;
    },
    
    getTaxReport: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/billing/reports/tax', { params });
      return response.data;
    }
  },

  // Common endpoints available to all authenticated users
  common: {
    // Health check
    healthCheck: async (): Promise<any> => {
      const response = await api.get('/health');
      return response.data;
    }
  }
};

// Helper function to check if an endpoint is available
export const checkEndpointAvailability = async (endpoint: string): Promise<{
  available: boolean;
  status?: number;
  error?: string;
}> => {
  try {
    const response = await api.get(endpoint);
    return {
      available: true,
      status: response.status
    };
  } catch (error: any) {
    return {
      available: false,
      status: error.response?.status || 0,
      error: error.message || 'Unknown error'
    };
  }
};

// Cache management utilities
export const cacheUtils = {
  clearAll: () => requestManager.clearCache(),
  clearEndpoint: (endpoint: string) => requestManager.clearEndpointCache(endpoint)
};

// Export default for backward compatibility
export default realApiService;