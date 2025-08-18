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

const TherapistMessages: React.FC = () => {
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
        const [messagesResponse, clientsResponse] = await Promise.all([
          realApiService.messages.getInbox(user?.id || '1'),
          realApiService.clients.getAll()
        ]);

        if (messagesResponse.success && messagesResponse.data) {
          // Transform API messages to match our local Message interface
          const transformedMessages = (Array.isArray(messagesResponse.data) ? messagesResponse.data : []).map((msg: any) => ({
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

        if (clientsResponse.success && clientsResponse.data) {
          // Create mock conversations from clients
          const mockConversations: Conversation[] = clientsResponse.data
            .filter((client: any) => client.assigned_therapist_id === user?.id)
            .map((client: any) => ({
              id: client.id,
              participant_name: `${client.first_name} ${client.last_name}`,
              participant_role: 'client' as const,
              last_message: 'Thank you for the session today. I feel much better.',
              last_message_time: '2 hours ago',
              unread_count: Math.floor(Math.random() * 3),
              status: 'active' as const,
              priority: 'normal' as const
            }));

          // Add admin/assistant conversations
          mockConversations.push(
            {
              id: 'admin-1',
              participant_name: 'Practice Admin',
              participant_role: 'admin',
              last_message: 'Please review the updated client protocol.',
              last_message_time: '1 day ago',
              unread_count: 1,
              status: 'active',
              priority: 'high'
            },
            {
              id: 'assistant-1',
              participant_name: 'Lisa Müller (Assistant)',
              participant_role: 'assistant',
              last_message: 'Schedule confirmation for tomorrow.',
              last_message_time: '3 hours ago',
              unread_count: 0,
              status: 'active',
              priority: 'normal'
            }
          );

          setConversations(mockConversations);
        }
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
      case 'admin': return 'bg-green-100 text-green-800';
      case 'assistant': return 'bg-blue-100 text-blue-800';
      case 'therapist': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return '👤';
      case 'admin': return '👨‍💼';
      case 'assistant': return '👩‍💻';
      case 'therapist': return '👨‍⚕️';
      default: return '👤';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Mock send message
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
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('therapist.messages')}</h1>
            <p className="text-red-100 mt-1">
              {t('therapist.messagesSubtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t('therapist.composeMessage')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">{t('therapist.unreadMessages')}</div>
              <div className="flex items-center text-sm text-blue-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Need attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <ChatBubbleLeftIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.participant_role === 'client').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">{t('therapist.clientConversations')}</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckIcon className="w-4 h-4 mr-1" />
                <span>Active conversations</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <UserCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">{t('therapist.highPriorityMessages')}</div>
              <div className="flex items-center text-sm text-orange-600">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                <span>Urgent attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <ExclamationCircleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {conversations.filter(c => c.participant_role === 'admin' || c.participant_role === 'assistant').length}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">{t('therapist.practiceMessages')}</div>
              <div className="flex items-center text-sm text-purple-600">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                <span>Practice communications</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center opacity-10">
              <ChatBubbleLeftIcon className="w-8 h-8 text-purple-500" />
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
                  placeholder={t('therapist.searchMessages')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="high_priority">High Priority</option>
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
                    selectedConversation === conversation.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
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
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  <p className="text-gray-500">{t('therapist.noMessagesFound')}</p>
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
                          Hi Dr. {getDisplayName()}, I wanted to follow up on our session yesterday. 
                          The breathing exercises you taught me have been really helpful.
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-md">
                      <div className="bg-red-500 text-white rounded-lg p-3">
                        <p className="text-sm">
                          That's wonderful to hear! Keep practicing them daily. 
                          How are you feeling about our next session this week?
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-md">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-900">
                          I'm looking forward to it. Should I bring my journal entries?
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
                        placeholder={t('therapist.typeMessage')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    {t('therapist.selectConversation')}
                  </h3>
                  <p className="text-gray-500">
                    {t('therapist.selectConversationSubtitle')}
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

export default TherapistMessages;