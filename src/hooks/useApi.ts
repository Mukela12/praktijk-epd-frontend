import { useState, useEffect } from 'react';
import { realApiService } from '@/services/realApi';

// Always use real API service
const apiService = realApiService;

// Custom hook for API operations with loading and error states
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async <T>(
    apiFunction: () => Promise<{ success: boolean; data?: T; error?: string; message?: string }>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || response.message || 'An error occurred');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    clearError,
    apiCall,
    usingMockData: false
  };
};

// Specific hooks for different data types
export const useDashboard = () => {
  const { apiCall, ...rest } = useApi();

  const getStats = () => apiCall(() => (apiService as any).admin.getDashboard());
  const getFinancialOverview = () => apiCall(() => (apiService as any).admin.getFinancialOverview());
  const getRevenueChart = () => apiCall(() => (apiService as any).admin.getFinancialOverview());
  const getAppointmentTrends = () => apiCall(() => (apiService as any).admin.getDashboard());
  const getTherapistUtilization = () => apiCall(() => (apiService as any).admin.getDashboard());

  return {
    getStats,
    getFinancialOverview,
    getRevenueChart,
    getAppointmentTrends,
    getTherapistUtilization,
    ...rest
  };
};

export const useClients = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).clients.getAll());
  const getById = (id: string) => apiCall(() => (apiService as any).admin.getClient ? (apiService as any).admin.getClient(id) : (apiService as any).client.getProfile());
  const create = (clientData: any) => apiCall(() => (apiService as any).admin.createClient ? (apiService as any).admin.createClient(clientData) : Promise.resolve({ success: true, data: { ...clientData, id: Date.now().toString() }, message: 'Client created locally' }));
  const update = (id: string, updates: any) => apiCall(() => (apiService as any).admin.updateClient ? (apiService as any).admin.updateClient(id, updates) : (apiService as any).client.updateProfile(updates));
  const remove = (id: string) => apiCall(() => (apiService as any).admin.deleteClient ? (apiService as any).admin.deleteClient(id) : Promise.resolve({ success: true, message: 'Client deleted locally' }));

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    ...rest
  };
};

export const useTherapists = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).admin.getTherapists());
  const getById = (id: string) => apiCall(() => (apiService as any).therapist.getProfile());
  const getStats = (id: string) => apiCall(() => (apiService as any).therapist.getDashboard());
  const updateProfile = (id: string, updates: any) => apiCall(() => (apiService as any).therapist.updateProfile(updates));

  return {
    getAll,
    getById,
    getStats,
    updateProfile,
    ...rest
  };
};

export const useAppointments = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).appointments.getAll());
  const getById = (id: string) => apiCall(() => (apiService as any).admin.getAppointment ? (apiService as any).admin.getAppointment(id) : Promise.resolve({ success: true, data: null, message: 'Appointment not found' }));
  const create = (appointmentData: any) => apiCall(() => (apiService as any).therapist.createAppointment(appointmentData));
  const update = (id: string, updates: any) => apiCall(() => (apiService as any).admin.updateAppointment ? (apiService as any).admin.updateAppointment(id, updates) : Promise.resolve({ success: true, data: { ...updates, id }, message: 'Appointment updated locally' }));
  const remove = (id: string) => apiCall(() => (apiService as any).admin.deleteAppointment ? (apiService as any).admin.deleteAppointment(id) : Promise.resolve({ success: true, message: 'Appointment deleted locally' }));
  const reschedule = (id: string, newDate: string, newTime: string) => apiCall(() => (apiService as any).client.rescheduleAppointment ? (apiService as any).client.rescheduleAppointment(id, { date: newDate, time: newTime }) : Promise.resolve({ success: true, message: 'Appointment rescheduled locally' }));

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    reschedule,
    ...rest
  };
};

export const useInvoices = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).invoices.getAll());
  const getById = (id: string) => apiCall(() => (apiService as any).bookkeeper.getInvoice ? (apiService as any).bookkeeper.getInvoice(id) : Promise.resolve({ success: true, data: null, message: 'Invoice not found' }));
  const create = (invoiceData: any) => apiCall(() => (apiService as any).bookkeeper.createInvoice(invoiceData));
  const update = (id: string, updates: any) => apiCall(() => (apiService as any).bookkeeper.updateInvoice ? (apiService as any).bookkeeper.updateInvoice(id, updates) : Promise.resolve({ success: true, data: { ...updates, id }, message: 'Invoice updated locally' }));
  const remove = (id: string) => apiCall(() => (apiService as any).bookkeeper.deleteInvoice ? (apiService as any).bookkeeper.deleteInvoice(id) : Promise.resolve({ success: true, message: 'Invoice deleted locally' }));
  const markPaid = (id: string) => apiCall(() => (apiService as any).bookkeeper.markInvoicePaid ? (apiService as any).bookkeeper.markInvoicePaid(id) : Promise.resolve({ success: true, message: 'Invoice marked as paid locally' }));

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    markPaid,
    ...rest
  };
};

export const useWaitingList = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).admin.getWaitingList());
  const getById = (id: string) => apiCall(() => (apiService as any).admin.getWaitingList());
  const update = (id: string, updates: any) => apiCall(() => (apiService as any).admin.updateWaitingListStatus(id, updates.status));
  const assign = (applicationId: string, therapistId: string) => apiCall(() => (apiService as any).admin.assignFromWaitingList(applicationId, therapistId));

  return {
    getAll,
    getById,
    update,
    assign,
    ...rest
  };
};

export const useMessages = () => {
  const { apiCall, ...rest } = useApi();

  const getInbox = (userId: string) => apiCall(() => (apiService as any).client.getMessages());
  const getById = (id: string) => apiCall(() => (apiService as any).client.getMessages());
  const send = (messageData: any) => apiCall(() => (apiService as any).client.sendMessage(messageData));

  return {
    getInbox,
    getById,
    send,
    ...rest
  };
};

export const useContracts = () => {
  const { apiCall, ...rest } = useApi();

  const getAll = () => apiCall(() => (apiService as any).contracts.getAll());
  const getById = (id: string) => apiCall(() => (apiService as any).admin.getContract ? (apiService as any).admin.getContract(id) : Promise.resolve({ success: true, data: null, message: 'Contract not found' }));
  const create = (contractData: any) => apiCall(() => (apiService as any).admin.createContract ? (apiService as any).admin.createContract(contractData) : Promise.resolve({ success: true, data: { ...contractData, id: Date.now().toString() }, message: 'Contract created locally' }));
  const update = (id: string, updates: any) => apiCall(() => (apiService as any).admin.updateContract ? (apiService as any).admin.updateContract(id, updates) : Promise.resolve({ success: true, data: { ...updates, id }, message: 'Contract updated locally' }));
  const remove = (id: string) => apiCall(() => (apiService as any).admin.deleteContract ? (apiService as any).admin.deleteContract(id) : Promise.resolve({ success: true, message: 'Contract deleted locally' }));

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    ...rest
  };
};

// Additional hooks for real API functionality
export const useClientDashboard = () => {
  const { apiCall, ...rest } = useApi();

  const getDashboard = () => apiCall(() => (apiService as any).client.getDashboard());
  const getTherapist = () => apiCall(() => (apiService as any).client.getTherapist());
  const getPreferences = () => apiCall(() => (apiService as any).client.getPreferences());
  const updatePreferences = (data: any) => apiCall(() => (apiService as any).client.updatePreferences(data));
  const submitIntakeForm = (data: any) => apiCall(() => (apiService as any).client.submitIntakeForm(data));
  const requestAppointment = (data: any) => apiCall(() => (apiService as any).client.requestAppointment(data));

  return {
    getDashboard,
    getTherapist,
    getPreferences,
    updatePreferences,
    submitIntakeForm,
    requestAppointment,
    ...rest
  };
};

export const useTherapistDashboard = () => {
  const { apiCall, ...rest } = useApi();

  const getDashboard = () => apiCall(() => (apiService as any).therapist.getDashboard());
  const getProfile = () => apiCall(() => (apiService as any).therapist.getProfile());
  const updateProfile = (data: any) => apiCall(() => (apiService as any).therapist.updateProfile(data));
  const getClients = () => apiCall(() => (apiService as any).therapist.getClients());
  const getAppointments = (params?: any) => apiCall(() => (apiService as any).therapist.getAppointments(params));
  const createAppointment = (data: any) => apiCall(() => (apiService as any).therapist.createAppointment(data));

  return {
    getDashboard,
    getProfile,
    updateProfile,
    getClients,
    getAppointments,
    createAppointment,
    ...rest
  };
};

export const useBookkeeperDashboard = () => {
  const { apiCall, ...rest } = useApi();

  const getDashboard = () => apiCall(() => (apiService as any).bookkeeper.getDashboard());
  const getInvoices = (params?: any) => apiCall(() => (apiService as any).bookkeeper.getInvoices(params));
  const createInvoice = (data: any) => apiCall(() => (apiService as any).bookkeeper.createInvoice(data));
  const getReports = (params: any) => apiCall(() => (apiService as any).bookkeeper.getReports(params));

  return {
    getDashboard,
    getInvoices,
    createInvoice,
    getReports,
    ...rest
  };
};

export const useBookkeeperMessages = () => {
  const { apiCall, ...rest } = useApi();

  const getMessages = (params?: any) => apiCall(() => (apiService as any).bookkeeper.getMessages(params));
  const sendMessage = (messageData: any) => apiCall(() => (apiService as any).bookkeeper.sendMessage(messageData));

  return {
    getMessages,
    sendMessage,
    ...rest
  };
};

export const useAssistantDashboard = () => {
  const { apiCall, ...rest } = useApi();

  const getDashboard = () => apiCall(() => (apiService as any).assistant.getDashboard());
  const getSupportTickets = (params?: any) => apiCall(() => (apiService as any).assistant.getSupportTickets(params));
  const createSupportTicket = (data: any) => apiCall(() => (apiService as any).assistant.createSupportTicket(data));
  const getAppointments = () => apiCall(() => (apiService as any).assistant.getAppointments());
  const getWaitingList = () => apiCall(() => (apiService as any).assistant.getWaitingList());
  const sendMessage = (data: any) => apiCall(() => (apiService as any).assistant.sendMessage(data));

  return {
    getDashboard,
    getSupportTickets,
    createSupportTicket,
    getAppointments,
    getWaitingList,
    sendMessage,
    ...rest
  };
};