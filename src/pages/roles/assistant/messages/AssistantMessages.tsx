import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'therapist' | 'admin' | 'assistant';
  recipient_id: string;
  recipient_name: string;
  subject: string;
  content: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  thread_id?: string;
  attachments?: string[];
}

interface Conversation {
  id: string;
  participant_name: string;
  participant_role: 'client' | 'therapist' | 'admin' | 'assistant';
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const AssistantMessages: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  // Load data
  useEffect(() => {
    const loadMessagesData = async () => {
      try {
        setIsLoading(true);
        const [messagesResponse, clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.messages.getInbox(user?.id || '1'),
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (messagesResponse.success && messagesResponse.data) {
          // Transform API messages to match our local Message interface
          const transformedMessages = messagesResponse.data.map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            sender_role: msg.sender_role as 'client' | 'therapist' | 'admin' | 'assistant',
            recipient_id: msg.recipient_id,
            recipient_name: msg.recipient_name,
            subject: msg.subject || 'No subject',
            content: msg.content,
            status: (msg.read ? 'read' : 'unread') as 'unread' | 'read' | 'replied' | 'archived',
            priority: msg.priority || 'normal',
            created_at: msg.created_at,
            thread_id: msg.parent_message_id,
            attachments: msg.attachments?.map((a: any) => a.url) || []
          }));
          setMessages(transformedMessages);
        }

        // Create conversations with clients, therapists, and admin
        const mockConversations: Conversation[] = [];

        if (clientsResponse.success && clientsResponse.data) {
          // Add client conversations
          clientsResponse.data.slice(0, 8).forEach((client: any, index: number) => {
            mockConversations.push({
              id: `client-${client.id}`,
              participant_name: `${client.first_name} ${client.last_name}`,
              participant_role: 'client',
              last_message: [
                'Thank you for helping me reschedule my appointment.',
                'I have a question about my upcoming session.',
                'Can you help me with my payment method?',
                'I need to update my contact information.',
                'When is my next appointment scheduled?',
                'I received a reminder but need to confirm.',
                'Can you explain my insurance coverage?',
                'I want to book an additional session.'
              ][index] || 'Thank you for your assistance.',
              last_message_time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
              unread_count: Math.floor(Math.random() * 3),
              status: 'active',
              priority: ['normal', 'high'][Math.floor(Math.random() * 2)] as any
            });
          });
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          // Add therapist conversations
          therapistsResponse.data.slice(0, 4).forEach((therapist: any, index: number) => {
            mockConversations.push({
              id: `therapist-${therapist.id}`,
              participant_name: therapist.name,
              participant_role: 'therapist',
              last_message: [
                'Can you schedule a follow-up for Sarah Johnson?',
                'Please confirm the room booking for tomorrow.',
                'I need the client files for my 2 PM appointment.',
                'Can you help coordinate with the billing department?'
              ][index] || 'Please coordinate the scheduling.',
              last_message_time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
              unread_count: Math.floor(Math.random() * 2),
              status: 'active',
              priority: 'normal'
            });
          });
        }

        // Add admin conversations
        mockConversations.push(
          {
            id: 'admin-1',
            participant_name: 'Practice Administrator',
            participant_role: 'admin',
            last_message: 'Please update the client records for insurance verification.',
            last_message_time: '3 hours ago',
            unread_count: 1,
            status: 'active',
            priority: 'high'
          },
          {
            id: 'admin-2',
            participant_name: 'HR Department',
            participant_role: 'admin',
            last_message: 'Staff meeting scheduled for Friday at 10 AM.',
            last_message_time: '1 day ago',
            unread_count: 0,
            status: 'active',
            priority: 'normal'
          }
        );

        setConversations(mockConversations);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessagesData();
  }, [user?.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-purple-100 text-purple-800';
      case 'therapist': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'assistant': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return '👤';
      case 'therapist': return '👨‍⚕️';
      case 'admin': return '👨‍💼';
      case 'assistant': return '👩‍💻';
      default: return '👤';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Mock send message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv => {
    if (searchTerm) {
      const matchesName = conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMessage = conv.last_message.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesName && !matchesMessage) return false;
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'unread' && conv.unread_count === 0) return false;
      if (filterStatus === 'high_priority' && conv.priority !== 'high' && conv.priority !== 'urgent') return false;
      if (filterStatus === 'clients' && conv.participant_role !== 'client') return false;
      if (filterStatus === 'therapists' && conv.participant_role !== 'therapist') return false;
      if (filterStatus === 'admin' && conv.participant_role !== 'admin') return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
            <p className="text-blue-100 mt-1">
              Coordinate communication between clients, therapists, and administration
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Unread Messages</div>
              <div className="flex items-center text-sm text-red-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Need attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
              <ChatBubbleLeftIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.participant_role === 'client').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Client Conversations</div>
              <div className="flex items-center text-sm text-purple-600">
                <UserCircleIcon className="w-4 h-4 mr-1" />
                <span>Support requests</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center opacity-10">
              <UserCircleIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.participant_role === 'therapist').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Therapist Coordination</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span>Professional coordination</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">High Priority</div>
              <div className="flex items-center text-sm text-blue-600">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                <span>Urgent coordination</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <ExclamationCircleIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-4 border-r border-gray-200">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="high_priority">High Priority</option>
                  <option value="clients">Clients</option>
                  <option value="therapists">Therapists</option>
                  <option value="admin">Administration</option>
                </select>
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto h-full">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                        {getRoleIcon(conversation.participant_role)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.participant_name}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(conversation.participant_role)}`}>
                          {conversation.participant_role}
                        </span>
                        {conversation.priority !== 'normal' && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.last_message_time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Message View */}
          <div className="lg:col-span-8 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                        {getRoleIcon(conversations.find(c => c.id === selectedConversation)?.participant_role || 'client')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {conversations.find(c => c.id === selectedConversation)?.participant_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {conversations.find(c => c.id === selectedConversation)?.participant_role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <PhoneIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <CalendarIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Mock messages */}
                  <div className="flex justify-start">
                    <div className="max-w-md">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          Hi {getDisplayName()}, I need help rescheduling my appointment for next week. 
                          Are there any available slots on Thursday afternoon?
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-md">
                      <div className="bg-blue-500 text-white rounded-lg p-3">
                        <p className="text-sm">
                          Hi! I can definitely help you with that. Let me check Dr. Smith's availability 
                          for Thursday afternoon and get back to you shortly with options.
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-md">
                      <div className="bg-blue-500 text-white rounded-lg p-3">
                        <p className="text-sm">
                          Good news! Dr. Smith has availability on Thursday at 2:00 PM and 3:30 PM. 
                          Which time works better for you?
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">45 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-md">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          Perfect! 2:00 PM on Thursday works great for me. Thank you so much for your help!
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation to coordinate communication
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantMessages;