import api from './api';
import { Appointment, Client } from '@/types/entities';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

/**
 * Therapist API endpoints based on the actual backend implementation
 * The backend uses general endpoints with role-based access control
 */

export const therapistApi = {
  // Dashboard - uses dedicated backend endpoint for optimized performance
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/therapist/dashboard');
    return response.data;
  },

  // Clients - Use therapist-specific endpoint
  getClients: async (params?: any): Promise<ApiResponse<Client[]>> => {
    console.log('[therapistApi.getClients] Request params:', params);
    try {
      // Use the therapist-specific clients endpoint
      const response = await api.get('/therapist/clients', { params });
      console.log('[therapistApi.getClients] Response:', {
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
        success: response.data?.success,
        clientCount: response.data?.data?.clients?.length || response.data?.data?.length || 0,
        dataStructure: response.data?.data ? Object.keys(response.data.data) : []
      });

      // Backend returns { success, data: { clients: [], pagination: {} } }
      // Frontend expects { success, data: [] }
      if (response.data?.data?.clients) {
        return {
          success: response.data.success,
          message: response.data.message || 'Clients loaded successfully',
          data: response.data.data.clients
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.getClients] ERROR:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      // If 404, get clients from appointments as fallback
      if (error?.response?.status === 404) {
        console.log('[therapistApi.getClients] 404 - using fallback from appointments');
        const appointmentsResponse = await api.get('/appointments');
        const appointments = appointmentsResponse.data.data || [];

        // Extract unique clients from appointments
        const clientsMap = new Map();
        appointments.forEach((apt: any) => {
          if (apt.client && apt.client.id) {
            clientsMap.set(apt.client.id, apt.client);
          }
        });

        const clients = Array.from(clientsMap.values());
        console.log('[therapistApi.getClients] Fallback loaded:', clients.length, 'clients');
        return {
          success: true,
          message: 'Clients loaded from appointments',
          data: clients
        };
      }
      throw error;
    }
  },

  getClient: async (clientId: string): Promise<ApiResponse<Client>> => {
    const response = await api.get(`/therapist/clients/${clientId}`);
    return response.data;
  },

  // Appointments
  getAppointments: async (params?: any): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments', { params });
    // Handle nested data structure from backend
    if (response.data && response.data.data) {
      return {
        success: true,
        message: response.data.message || 'Appointments loaded successfully',
        data: response.data.data.appointments || response.data.data || []
      };
    }
    return response.data;
  },

  createAppointment: async (data: any): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/therapist/appointments', data);
    // Handle nested response structure
    if (response.data && response.data.data) {
      return {
        success: true,
        message: response.data.message || 'Appointment created successfully',
        data: response.data.data
      };
    }
    return response.data;
  },

  updateAppointment: async (id: string, data: any): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  deleteAppointment: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Sessions - use therapist-specific endpoint
  getSessions: async (params?: any): Promise<ApiResponse<any>> => {
    console.log('[therapistApi.getSessions] Request params:', params);
    try {
      const response = await api.get('/therapist/sessions', { params });
      console.log('[therapistApi.getSessions] Response:', {
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
        success: response.data?.success,
        sessionCount: response.data?.data?.sessions?.length || 0,
        dataStructure: response.data?.data ? Object.keys(response.data.data) : []
      });

      // Backend returns { success, data: { sessions: [], pagination: {} } }
      // Frontend expects { success, data: [] } for some components
      if (response.data?.data?.sessions) {
        return {
          success: true,
          message: response.data.message || 'Sessions loaded successfully',
          data: response.data.data.sessions
        };
      }

      // Handle nested data structure
      if (response.data && response.data.data) {
        return {
          success: true,
          message: response.data.message || 'Sessions loaded successfully',
          data: response.data.data
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.getSessions] ERROR:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        stack: error?.stack?.split('\n').slice(0, 3)
      });
      throw error;
    }
  },

  startSession: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/sessions/start', data);
    return response.data;
  },

  endSession: async (sessionId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/sessions/${sessionId}/end`, data);
    return response.data;
  },

  // Session Notes
  getSessionNotes: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/therapist/session-notes', { params });
    return response.data;
  },

  getSessionNote: async (noteId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/therapist/session-notes/${noteId}`);
    return response.data;
  },

  createSessionNote: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/therapist/session-notes', data);
    return response.data;
  },

  updateSessionNote: async (noteId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/therapist/session-notes/${noteId}`, data);
    return response.data;
  },

  deleteSessionNote: async (noteId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/therapist/session-notes/${noteId}`);
    return response.data;
  },

  // Surveys
  getSurveys: async (): Promise<ApiResponse<{ surveys: any[] }>> => {
    const response = await api.get('/surveys');
    return {
      success: response.data.success,
      message: response.data.message || 'Surveys loaded successfully',
      data: {
        surveys: response.data.data || []
      }
    };
  },

  getSurvey: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  getSurveyResponses: async (surveyId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/surveys/${surveyId}/responses`);
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

  assignSurvey: async (surveyId: string, clientId: string, data?: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/surveys/${surveyId}/assign`, { 
      clientId, 
      ...data 
    });
    return response.data;
  },

  // Challenges
  getChallenges: async (): Promise<ApiResponse<{ challenges: any[] }>> => {
    const response = await api.get('/challenges');
    return {
      success: response.data.success,
      message: response.data.message || 'Challenges loaded successfully',
      data: {
        challenges: response.data.data || []
      }
    };
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

  assignChallenge: async (challengeId: string, clientId: string, data?: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/challenges/${challengeId}/assign`, { 
      clientId, 
      ...data 
    });
    return response.data;
  },

  // Resources
  getResources: async (): Promise<ApiResponse<{ resources: any[] }>> => {
    const response = await api.get('/resources');
    return {
      success: response.data.success,
      message: response.data.message || 'Resources loaded successfully',
      data: {
        resources: response.data.data || []
      }
    };
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

  assignResource: async (resourceId: string, clientId: string, data?: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/resources/${resourceId}/assign`, { 
      clientId, 
      ...data 
    });
    return response.data;
  },

  // Profile
  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/me');
    // Handle nested data structure from backend
    if (response.data && response.data.data) {
      return {
        success: true,
        message: 'Profile loaded successfully',
        data: response.data.data.user || response.data.data
      };
    }
    return response.data;
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // Psychological problems for therapist profile management
  getPsychologicalProblems: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/therapist/psychological-problems');
    return response.data;
  },

  // Single appointment
  getAppointment: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Calendar endpoints
  getCalendarAppointments: async (params?: any): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments/calendar', { params });
    // Handle nested data structure
    if (response.data && response.data.data) {
      return {
        success: true,
        message: response.data.message || 'Calendar appointments loaded',
        data: response.data.data.appointments || response.data.data || []
      };
    }
    return response.data;
  },

  getAvailableSlots: async (date: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/appointments/available-slots', {
      params: { date }
    });
    // Handle nested data structure
    if (response.data && response.data.data) {
      return {
        success: true,
        message: response.data.message || 'Available slots loaded',
        data: response.data.data.slots || response.data.data || []
      };
    }
    return response.data;
  },

  // Metrics endpoint for detailed performance data
  getMetrics: async (params?: { period?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<{
    revenue: {
      total: number;
      period: number;
      growth: number;
      projections: number;
    };
    sessions: {
      total: number;
      completed: number;
      cancelled: number;
      noShow: number;
      averageDuration: number;
    };
    clients: {
      active: number;
      new: number;
      completed: number;
      retention: number;
    };
    performance: {
      rating: number;
      reviews: number;
      satisfactionScore: number;
      completionRate: number;
    };
    availability: {
      utilizationRate: number;
      averageBookingLead: number;
      peakHours: string[];
    };
  }>> => {
    try {
      // Try dedicated metrics endpoint first
      const response = await api.get('/therapist/metrics', { params });
      return response.data;
    } catch (error: any) {
      // Fallback: Calculate metrics from available data
      if (error?.response?.status === 404) {
        const [appointmentsRes, sessionsRes, clientsRes] = await Promise.all([
          api.get('/appointments', { params }),
          api.get('/therapist/sessions', { params: { ...params, limit: 100 } }),
          api.get('/therapist/clients').catch(() => ({ data: { data: [] } }))
        ]);

        const appointments = appointmentsRes.data?.data?.appointments || appointmentsRes.data?.data || [];
        const sessions = sessionsRes.data?.data?.sessions || sessionsRes.data?.data || [];
        const clients = clientsRes.data?.data || [];

        // Calculate metrics from available data
        const completedSessions = sessions.filter((s: any) => s.status === 'completed');
        const cancelledSessions = sessions.filter((s: any) => s.status === 'cancelled');
        const activeClients = clients.filter((c: any) => c.status === 'active');
        
        // Calculate period (default to current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const periodSessions = sessions.filter((s: any) => {
          const sessionDate = new Date(s.date || s.created_at);
          return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
        });

        return {
          success: true,
          message: 'Metrics calculated from available data',
          data: {
            revenue: {
              total: completedSessions.length * 85, // Assuming €85 per session
              period: periodSessions.filter((s: any) => s.status === 'completed').length * 85,
              growth: 0, // Would need historical data
              projections: activeClients.length * 4 * 85 // Assuming 4 sessions per client per month
            },
            sessions: {
              total: sessions.length,
              completed: completedSessions.length,
              cancelled: cancelledSessions.length,
              noShow: sessions.filter((s: any) => s.status === 'no_show').length,
              averageDuration: 60 // Default to 60 minutes
            },
            clients: {
              active: activeClients.length,
              new: clients.filter((c: any) => {
                const createdDate = new Date(c.created_at);
                return createdDate >= startOfMonth && createdDate <= endOfMonth;
              }).length,
              completed: clients.filter((c: any) => c.status === 'completed').length,
              retention: activeClients.length > 0 ? 
                (activeClients.length / clients.length * 100) : 0
            },
            performance: {
              rating: 4.5, // Default rating
              reviews: 0,
              satisfactionScore: 90, // Default satisfaction
              completionRate: sessions.length > 0 ? 
                (completedSessions.length / sessions.length * 100) : 0
            },
            availability: {
              utilizationRate: 75, // Default utilization
              averageBookingLead: 3, // Days in advance
              peakHours: ['10:00', '14:00', '16:00']
            }
          }
        };
      }
      throw error;
    }
  },

  // Get notification counts for sidebar indicators
  getNotificationCounts: async (): Promise<ApiResponse<{
    clients: number;
    appointments: number;
    messages: number;
    total: number;
  }>> => {
    try {
      const response = await api.get('/therapist/notifications/counts');
      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.getNotificationCounts] ERROR:', error);
      // Return zeros on error to prevent UI breakage
      return {
        success: false,
        message: 'Failed to load notification counts',
        data: {
          clients: 0,
          appointments: 0,
          messages: 0,
          total: 0
        }
      };
    }
  },

  // Get recent notifications
  getNotifications: async (params?: {
    isRead?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      priority?: string;
      action_url?: string;
      is_read: boolean;
      created_at: string;
      related_entity_type?: string;
      related_entity_id?: string;
    }>;
  }>> => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.getNotifications] ERROR:', error);
      return {
        success: false,
        message: 'Failed to load notifications',
        data: { notifications: [] }
      };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.markNotificationRead] ERROR:', error);
      return {
        success: false,
        message: 'Failed to mark notification as read'
      };
    }
  }
};

export default therapistApi;