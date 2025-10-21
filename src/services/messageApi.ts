/**
 * Unified Messaging API Service
 * Works for all roles: Client, Therapist, Admin, Assistant
 */

import api from './api';

export interface Message {
  id: string;
  sender_id: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_role: 'client' | 'therapist' | 'admin' | 'assistant';
  recipient_id: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_role: 'client' | 'therapist' | 'admin' | 'assistant';
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  conversation_id?: string;
  priority_level?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Conversation {
  conversation_id: string;
  participant_id: string;
  participant_first_name: string;
  participant_last_name: string;
  participant_role: 'client' | 'therapist' | 'admin' | 'assistant';
  last_message: string;
  last_message_time: string;
  is_read: boolean;
  unread_count: number;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'client' | 'therapist' | 'admin' | 'assistant';
}

export interface SendMessageData {
  recipientId: string;
  subject?: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  folder?: 'inbox' | 'sent' | 'all';
  unreadOnly?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class MessageApiService {
  /**
   * Send a message to another user
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<{ id: string; conversation_id: string }>> {
    try {
      const response = await api.post('/messages/send', data);
      return response.data;
    } catch (error: any) {
      console.error('Send message error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message'
      };
    }
  }

  /**
   * Get messages (inbox, sent, or all)
   */
  async getMessages(params?: GetMessagesParams): Promise<ApiResponse<{
    messages: Message[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      const response = await api.get('/messages', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get messages error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get messages',
        data: {
          messages: [],
          unreadCount: 0,
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };
    }
  }

  /**
   * Get all conversations
   */
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error: any) {
      console.error('Get conversations error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get conversations',
        data: { conversations: [] }
      };
    }
  }

  /**
   * Get conversation with a specific user
   */
  async getConversation(userId: string): Promise<ApiResponse<{ messages: Message[] }>> {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get conversation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get conversation',
        data: { messages: [] }
      };
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark as read'
      };
    }
  }

  /**
   * Archive a message
   */
  async archiveMessage(messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error: any) {
      console.error('Archive message error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to archive message'
      };
    }
  }

  /**
   * Get list of users the current user can message
   */
  async getAvailableContacts(): Promise<ApiResponse<{ contacts: Contact[] }>> {
    try {
      const response = await api.get('/messages/available-contacts');
      return response.data;
    } catch (error: any) {
      console.error('Get available contacts error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get contacts',
        data: { contacts: [] }
      };
    }
  }
}

export const messageApi = new MessageApiService();
export default messageApi;
