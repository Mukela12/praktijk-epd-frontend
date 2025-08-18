import api from './api';
import { ApiResponse } from '@/types/auth';
import { 
  Client, 
  Therapist, 
  Appointment, 
  Invoice, 
  Message, 
  Task,
  WaitingListApplication,
  DashboardMetrics,
  FinancialOverview,
  SupportTicket,
  Document,
  CompanySettings
} from '@/types/entities';
import {
  Resource,
  Challenge,
  Survey
} from '@/types/resources';

// Admin API endpoints
export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getUsers: async (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ users: any[]; total: number }>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (userData: any): Promise<ApiResponse<{ userId: string }>> => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, updates: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  },

  // Client Management
  getClients: async (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ clients: Client[]; total: number }>> => {
    const response = await api.get('/admin/clients', { params });
    return response.data;
  },

  // Therapist Management
  getTherapists: async (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ therapists: Therapist[]; total: number }>> => {
    const response = await api.get('/admin/therapists', { params });
    return response.data;
  },

  // Waiting List
  getWaitingList: async (params?: { urgency?: string; status?: string }): Promise<ApiResponse<{ waitingList: WaitingListApplication[]; total: number }>> => {
    const response = await api.get('/admin/waiting-list', { params });
    return response.data;
  },

  updateWaitingListEntry: async (id: string, updates: any): Promise<ApiResponse> => {
    const response = await api.put(`/admin/waiting-list/${id}`, updates);
    return response.data;
  },

  // Financial Overview
  getFinancialOverview: async (period?: string): Promise<ApiResponse<FinancialOverview>> => {
    const response = await api.get('/admin/financial/overview', { params: { period } });
    return response.data;
  },

  // Appointments
  getAppointments: async (params?: any): Promise<ApiResponse<{ appointments: Appointment[]; total: number }>> => {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },

  // Reports
  getReports: async (reportType: string, params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/reports', { params: { reportType, ...params } });
    return response.data;
  },

  // System
  getSystemHealth: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // Company Settings
  getCompanySettings: async (): Promise<ApiResponse<CompanySettings>> => {
    const response = await api.get('/admin/company-settings');
    return response.data;
  },

  updateCompanySettings: async (settings: Partial<CompanySettings>): Promise<ApiResponse> => {
    const response = await api.put('/admin/company-settings', settings);
    return response.data;
  },

  // Address Change Management
  getAddressChangeRequests: async (params?: { status?: string }): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/address-change-requests', { params });
    return response.data;
  },

  approveAddressChange: async (id: string): Promise<ApiResponse> => {
    const response = await api.put(`/admin/address-changes/${id}/approve`);
    return response.data;
  },

  rejectAddressChange: async (id: string, reason: string): Promise<ApiResponse> => {
    const response = await api.put(`/admin/address-changes/${id}/reject`, { rejectionReason: reason });
    return response.data;
  }
};

// Therapist API endpoints
export const therapistApi = {
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

  updateProfile: async (updates: Partial<Therapist>): Promise<ApiResponse> => {
    const response = await api.put('/therapist/profile', updates);
    return response.data;
  },

  // Clients
  getClients: async (params?: { status?: string }): Promise<ApiResponse<{ clients: Client[] }>> => {
    const response = await api.get('/therapist/clients', { params });
    return response.data;
  },

  getClientDetails: async (clientId: string): Promise<ApiResponse<Client>> => {
    const response = await api.get(`/therapist/clients/${clientId}`);
    return response.data;
  },

  getClientProgress: async (clientId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/therapist/clients/${clientId}/progress`);
    return response.data;
  },

  getClientSessionNotes: async (clientId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/therapist/clients/${clientId}/session-notes`);
    return response.data;
  },

  // Appointments
  getAppointments: async (params?: { date?: string; status?: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/therapist/appointments', { params });
      return response.data;
    } catch (error: any) {
      console.error('[therapistApi.getAppointments] Error fetching appointments:', error);
      console.error('[therapistApi.getAppointments] Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config
      });
      throw error;
    }
  },

  createAppointment: async (appointmentData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/therapist/appointments', appointmentData);
    return response.data;
  },

  updateAppointment: async (appointmentId: string, updates: any): Promise<ApiResponse> => {
    const response = await api.put(`/therapist/appointments/${appointmentId}`, updates);
    return response.data;
  },

  // Schedule
  getSchedule: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> => {
    const response = await api.get('/therapist/schedule', { params });
    return response.data;
  },

  // Availability
  getAvailability: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/therapist/availability');
    return response.data;
  },

  setAvailability: async (availability: any): Promise<ApiResponse> => {
    const response = await api.post('/therapist/availability', availability);
    return response.data;
  },

  // Documents
  getDocuments: async (): Promise<ApiResponse<{ documents: Document[] }>> => {
    const response = await api.get('/therapist/documents');
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/therapist/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Resources
  getResources: async (params?: any): Promise<ApiResponse<{ resources: Resource[] }>> => {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  createResource: async (resourceData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },

  assignResource: async (resourceId: string, clientId: string): Promise<ApiResponse> => {
    const response = await api.post(`/resources/${resourceId}/assign`, { clientId });
    return response.data;
  },

  shareResource: async (resourceId: string, clientIds: string[]): Promise<ApiResponse> => {
    const response = await api.post(`/resources/${resourceId}/share`, { clientIds });
    return response.data;
  },

  // Challenges
  getChallenges: async (params?: any): Promise<ApiResponse<{ challenges: Challenge[] }>> => {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  createChallenge: async (challengeData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  },

  assignChallenge: async (challengeId: string, clientId: string, data?: any): Promise<ApiResponse> => {
    const response = await api.post(`/challenges/${challengeId}/assign`, { 
      clientId, 
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      notes: 'Challenge assigned by therapist',
      ...data 
    });
    return response.data;
  },

  // Surveys
  getSurveys: async (params?: any): Promise<ApiResponse<{ surveys: Survey[] }>> => {
    const response = await api.get('/surveys', { params });
    return response.data;
  },

  createSurvey: async (surveyData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  assignSurvey: async (surveyId: string, clientId: string, data?: any): Promise<ApiResponse> => {
    const response = await api.post(`/surveys/${surveyId}/assign`, { 
      clientId, 
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      notes: 'Survey assigned by therapist',
      ...data 
    });
    return response.data;
  },

  getSurveyResponses: async (surveyId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/surveys/${surveyId}/responses`);
    return response.data;
  }
};

// Client API endpoints
export const clientApi = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/client/dashboard');
    return response.data;
  },

  // Profile
  getProfile: async (): Promise<ApiResponse<Client>> => {
    const response = await api.get('/client/profile');
    return response.data;
  },

  updateProfile: async (updates: Partial<Client>): Promise<ApiResponse> => {
    const response = await api.put('/client/profile', updates);
    return response.data;
  },

  // Appointments
  getAppointments: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/client/appointments', { params });
      return response.data;
    } catch (error: any) {
      console.error('[clientApi.getAppointments] Error fetching appointments:', error);
      console.error('[clientApi.getAppointments] Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config
      });
      throw error;
    }
  },

  requestAppointment: async (requestData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/client/appointments/request', requestData);
    return response.data;
  },

  // Therapist
  getAssignedTherapist: async (): Promise<ApiResponse<Therapist>> => {
    const response = await api.get('/client/therapist');
    return response.data;
  },

  // Messages
  getMessages: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ messages: Message[] }>> => {
    const response = await api.get('/client/messages', { params });
    return response.data;
  },

  sendMessage: async (messageData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/client/messages', messageData);
    return response.data;
  },

  // Documents
  getDocuments: async (): Promise<ApiResponse<{ documents: Document[] }>> => {
    const response = await api.get('/client/documents');
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/client/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Invoices
  getInvoices: async (params?: { status?: string }): Promise<ApiResponse<{ invoices: Invoice[] }>> => {
    const response = await api.get('/client/invoices', { params });
    return response.data;
  },

  downloadInvoice: async (invoiceId: string): Promise<any> => {
    const response = await api.get(`/client/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Address Change Request
  requestAddressChange: async (data: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/client/profile/address-change', data);
    return response.data;
  },

  // Intake Form
  submitIntakeForm: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/client/intake-form', data);
    return response.data;
  },

  // Resources
  getAssignedResources: async (): Promise<ApiResponse<{ resources: Resource[] }>> => {
    const response = await api.get('/client/resources');
    return response.data;
  },

  updateResourceProgress: async (resourceId: string, progress: any): Promise<ApiResponse> => {
    const response = await api.post('/client/resources/progress', { resourceId, progress });
    return response.data;
  },

  // Challenges
  getAssignedChallenges: async (): Promise<ApiResponse<{ challenges: Challenge[] }>> => {
    const response = await api.get('/challenges/client/assigned');
    return response.data;
  },

  joinChallenge: async (challengeId: string): Promise<ApiResponse> => {
    const response = await api.post('/challenges/client/join', { challengeId });
    return response.data;
  },

  // Surveys
  getAssignedSurveys: async (): Promise<ApiResponse<{ surveys: Survey[] }>> => {
    const response = await api.get('/surveys/client/assigned');
    return response.data;
  },

  submitSurveyResponse: async (surveyId: string, responses: any): Promise<ApiResponse> => {
    const response = await api.post('/surveys/client/responses', { surveyId, responses });
    return response.data;
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<ApiResponse<{ paymentMethods: any[] }>> => {
    const response = await api.get('/client/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (data: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/client/payment-methods/sepa', data);
    return response.data;
  },

  removePaymentMethod: async (methodId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/client/payment-methods/${methodId}`);
    return response.data;
  },

  setDefaultPaymentMethod: async (methodId: string): Promise<ApiResponse> => {
    const response = await api.put(`/client/payment-methods/${methodId}/set-default`);
    return response.data;
  },

  // Session History
  getSessionHistory: async (params?: any): Promise<ApiResponse<{ sessions: any[] }>> => {
    const response = await api.get('/client/session-history', { params });
    return response.data;
  },

  submitSessionFeedback: async (sessionId: string, data: { rating: number; feedback?: string }): Promise<ApiResponse> => {
    const response = await api.post(`/client/sessions/${sessionId}/feedback`, data);
    return response.data;
  },

  downloadSessionReport: async (params?: any): Promise<any> => {
    const response = await api.get('/client/session-history/report', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Assistant API endpoints
export const assistantApi = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/assistant/dashboard');
    return response.data;
  },

  // Support Tickets
  getSupportTickets: async (params?: { status?: string; priority?: string }): Promise<ApiResponse<{ tickets: SupportTicket[] }>> => {
    const response = await api.get('/assistant/support-tickets', { params });
    return response.data;
  },

  createSupportTicket: async (ticketData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/assistant/support-tickets', ticketData);
    return response.data;
  },

  updateSupportTicket: async (ticketId: string, updates: any): Promise<ApiResponse> => {
    const response = await api.put(`/assistant/support-tickets/${ticketId}`, updates);
    return response.data;
  },

  // Appointments
  getAppointments: async (): Promise<ApiResponse<{ appointments: Appointment[] }>> => {
    const response = await api.get('/assistant/appointments');
    return response.data;
  },

  scheduleAppointment: async (appointmentData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/assistant/appointments', appointmentData);
    return response.data;
  },

  // Waiting List
  getWaitingList: async (): Promise<ApiResponse<{ waitingList: WaitingListApplication[] }>> => {
    const response = await api.get('/assistant/waiting-list');
    return response.data;
  },

  addToWaitingList: async (applicationData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/assistant/waiting-list', applicationData);
    return response.data;
  },

  // Messages
  sendMessage: async (messageData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/assistant/messages', messageData);
    return response.data;
  },

  // Therapist Availability
  getTherapistAvailability: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/assistant/therapists/availability', { params });
    return response.data;
  },

  // Search
  searchClients: async (query: string): Promise<ApiResponse<{ clients: Client[] }>> => {
    const response = await api.get('/assistant/clients/search', { params: { q: query } });
    return response.data;
  }
};

// Bookkeeper API endpoints
export const bookkeeperApi = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/bookkeeper/dashboard');
    return response.data;
  },

  // Invoices
  getInvoices: async (params?: { status?: string; clientId?: string; page?: number; limit?: number }): Promise<ApiResponse<{ invoices: Invoice[] }>> => {
    const response = await api.get('/bookkeeper/invoices', { params });
    return response.data;
  },

  createInvoice: async (invoiceData: any): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post('/bookkeeper/invoices', invoiceData);
    return response.data;
  },

  updateInvoiceStatus: async (invoiceId: string, status: string): Promise<ApiResponse> => {
    const response = await api.put(`/bookkeeper/invoices/${invoiceId}/status`, { status });
    return response.data;
  },

  sendPaymentReminder: async (invoiceId: string): Promise<ApiResponse> => {
    const response = await api.post(`/bookkeeper/invoices/${invoiceId}/reminder`);
    return response.data;
  },

  // Reports
  getReports: async (reportType: string, params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/bookkeeper/reports', { params: { reportType, ...params } });
    return response.data;
  },

  // Financial Overview
  getFinancialOverview: async (period?: string): Promise<ApiResponse<any>> => {
    const response = await api.get('/bookkeeper/financial-overview', { params: { period } });
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
  },

  // Messages
  messages: {
    getAll: async (): Promise<ApiResponse<{ messages: Message[] }>> => {
      const response = await api.get('/bookkeeper/messages');
      return response.data;
    },

    send: async (messageData: any): Promise<ApiResponse<Message>> => {
      const response = await api.post('/bookkeeper/messages', messageData);
      return response.data;
    }
  }
};

// Common API endpoints (available to multiple roles)
export const commonApi = {
  // Messages
  getMessages: async (): Promise<ApiResponse<{ messages: Message[] }>> => {
    const response = await api.get('/messages');
    return response.data;
  },

  markMessageRead: async (messageId: string): Promise<ApiResponse> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Documents
  downloadDocument: async (documentId: string): Promise<any> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  shareDocument: async (documentId: string, shareData: any): Promise<ApiResponse> => {
    const response = await api.post(`/documents/${documentId}/share`, shareData);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Health Check
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Resources endpoints
export const resourcesApi = {
  // Resources
  getResources: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/resources${queryString ? `?${queryString}` : ''}`);
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
  },
  
  trackEngagement: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/resources/${id}/engagement`, data);
    return response.data;
  },
  
  getAssignments: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/resources/assignments${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Challenges
  getChallenges: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/challenges${queryString ? `?${queryString}` : ''}`);
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
  
  updateChallengeProgress: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/challenges/${id}/progress`, data);
    return response.data;
  },

  // Surveys
  getSurveys: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/surveys${queryString ? `?${queryString}` : ''}`);
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
  
  submitSurveyResponse: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/surveys/${id}/respond`, data);
    return response.data;
  },
  
  getSurveyResponses: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/surveys/${id}/responses`);
    return response.data;
  },
};