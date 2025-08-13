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
  currentClients?: number;
  maxClients?: number;
  licenseNumber?: string;
  yearsExperience?: number;
  therapy_types?: string;
  qualifications?: string;
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

// Real API service that connects to the backend
export const realApiService = {
  // Health check
  health: {
    check: async (): Promise<{ status: string; timestamp: string; uptime: number; environment: string }> => {
      const response = await api.get('/health', { baseURL: 'http://localhost:3000' });
      return response.data;
    }
  },

  // Admin endpoints
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

    // Users management
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

    // Client management with full CRUD operations
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

    createClient: async (clientData: any): Promise<ApiResponse<Client>> => {
      const response = await api.post('/admin/clients', clientData);
      return response.data;
    },

    updateClient: async (clientId: string, updates: any): Promise<ApiResponse<Client>> => {
      const response = await api.put(`/admin/clients/${clientId}`, updates);
      return response.data;
    },

    deleteClient: async (clientId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/admin/clients/${clientId}`);
      return response.data;
    },

    // Therapist management
    getTherapists: async (): Promise<ApiResponse<{ therapists: Therapist[]; pagination?: any }>> => {
      const response = await api.get('/admin/therapists');
      return response.data;
    },

    getTherapist: async (therapistId: string): Promise<ApiResponse<Therapist>> => {
      const response = await api.get(`/admin/therapists/${therapistId}`);
      return response.data;
    },

    createTherapist: async (therapistData: any): Promise<ApiResponse<Therapist>> => {
      const response = await api.post('/admin/therapists', therapistData);
      return response.data;
    },

    updateTherapist: async (therapistId: string, updates: any): Promise<ApiResponse<Therapist>> => {
      const response = await api.put(`/admin/therapists/${therapistId}`, updates);
      return response.data;
    },

    deleteTherapist: async (therapistId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/admin/therapists/${therapistId}`);
      return response.data;
    },

    // Waiting list
    getWaitingList: async (): Promise<ApiResponse<{ waitingList: any[]; pagination?: any }>> => {
      const response = await api.get('/admin/waiting-list');
      return response.data;
    },

    // Appointments
    getAppointments: async (params?: any): Promise<ApiResponse<{ appointments: Appointment[]; pagination?: any }>> => {
      const response = await api.get('/admin/appointments', { params });
      return response.data;
    },

    getAppointment: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
      const response = await api.get(`/admin/appointments/${appointmentId}`);
      return response.data;
    },

    createAppointment: async (appointmentData: any): Promise<ApiResponse<Appointment>> => {
      const response = await api.post('/admin/appointments', appointmentData);
      return response.data;
    },

    updateAppointment: async (appointmentId: string, updates: any): Promise<ApiResponse<Appointment>> => {
      const response = await api.put(`/admin/appointments/${appointmentId}`, updates);
      return response.data;
    },

    deleteAppointment: async (appointmentId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/admin/appointments/${appointmentId}`);
      return response.data;
    }
  },

  // Therapist endpoints
  therapist: {
    // Dashboard
    getDashboard: async (): Promise<ApiResponse<any>> => {
      const response = await api.get('/therapist/dashboard');
      return response.data;
    },

    // Profile
    getProfile: async (): Promise<ApiResponse<Therapist>> => {
      const response = await api.get('/therapist/profile');
      return response.data;
    },

    updateProfile: async (data: any): Promise<ApiResponse<Therapist>> => {
      const response = await api.put('/therapist/profile', data);
      return response.data;
    },

    // Clients
    getClients: async (): Promise<ApiResponse<{ clients: Client[] }>> => {
      const response = await api.get('/therapist/clients');
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
    }): Promise<ApiResponse<{ appointments: Appointment[] }>> => {
      const response = await api.get('/therapist/appointments', { params });
      return response.data;
    },

    createAppointment: async (appointmentData: any): Promise<ApiResponse<Appointment>> => {
      const response = await api.post('/therapist/appointments', appointmentData);
      return response.data;
    },

    updateAppointment: async (appointmentId: string, updates: any): Promise<ApiResponse<Appointment>> => {
      const response = await api.put(`/therapist/appointments/${appointmentId}`, updates);
      return response.data;
    },

    deleteAppointment: async (appointmentId: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/therapist/appointments/${appointmentId}`);
      return response.data;
    }
  },

  // Client endpoints
  client: {
    // Dashboard (✅ WORKING)
    getDashboard: async (): Promise<ApiResponse<{
      profile: any;
      metrics: {
        totalSessions: number;
        completedSessions: number;
        unreadMessages: number;
        nextAppointment: any;
      };
      upcomingAppointments: Appointment[];
      recentMessages: Message[];
      therapist: Therapist;
      progress: any;
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

    updateProfile: async (data: any): Promise<ApiResponse<Client>> => {
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
    }): Promise<ApiResponse<{ appointments: Appointment[] }>> => {
      const response = await api.get('/client/appointments', { params });
      return response.data;
    },

    requestAppointment: async (data: {
      preferredDate: string;
      preferredTime: string;
      reason: string;
      sessionType: string;
      urgency?: string;
    }): Promise<ApiResponse<any>> => {
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
    }): Promise<ApiResponse<Message>> => {
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
      language: string;
      timezone: string;
    }>> => {
      const response = await api.get('/client/preferences');
      return response.data;
    },

    updatePreferences: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.put('/client/preferences', data);
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
  },

  // Resources endpoints
  resources: {
    getResources: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/resources', { params });
      return response.data;
    },
    
    getResourceById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/resources/${id}`);
      return response.data;
    },
    
    createResource: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/resources', data);
      return response.data;
    },
    
    updateResource: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/resources/${id}`, data);
      return response.data;
    },
    
    deleteResource: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/resources/${id}`);
      return response.data;
    },
    
    assignResource: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(`/resources/${id}/assign`, data);
      return response.data;
    }
  },

  // Challenges endpoints
  challenges: {
    getChallenges: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/challenges', { params });
      return response.data;
    },
    
    getChallengeById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/challenges/${id}`);
      return response.data;
    },
    
    createChallenge: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/challenges', data);
      return response.data;
    },
    
    updateChallenge: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/challenges/${id}`, data);
      return response.data;
    },
    
    deleteChallenge: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/challenges/${id}`);
      return response.data;
    },
    
    joinChallenge: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.post(`/challenges/${id}/join`);
      return response.data;
    },
    
    updateProgress: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(`/challenges/${id}/progress`, data);
      return response.data;
    }
  },

  // Surveys endpoints
  surveys: {
    getSurveys: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await api.get('/surveys', { params });
      return response.data;
    },
    
    getSurveyById: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    },
    
    createSurvey: async (data: any): Promise<ApiResponse<any>> => {
      const response = await api.post('/surveys', data);
      return response.data;
    },
    
    updateSurvey: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.put(`/surveys/${id}`, data);
      return response.data;
    },
    
    deleteSurvey: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.delete(`/surveys/${id}`);
      return response.data;
    },
    
    submitResponse: async (id: string, data: any): Promise<ApiResponse<any>> => {
      const response = await api.post(`/surveys/${id}/respond`, data);
      return response.data;
    },
    
    getResponses: async (id: string): Promise<ApiResponse<any>> => {
      const response = await api.get(`/surveys/${id}/responses`);
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

// Export default for backward compatibility
export default realApiService;