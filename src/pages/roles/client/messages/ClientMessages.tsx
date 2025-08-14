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
  CalendarIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  ChatBubbleLeftIcon as ChatBubbleLeftSolid,
  SparklesIcon as SparklesSolid,
  HeartIcon as HeartSolid,
  CheckCircleIcon as CheckCircleSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
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

const ClientMessages: React.FC = () => {
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
        const [messagesResponse] = await Promise.all([
          realApiService.client.getMessages()
        ]);

        if (messagesResponse.success && messagesResponse.data) {
          // Transform API messages to match our local Message interface
          const rawMessages = messagesResponse.data.messages || messagesResponse.data || [];
          const transformedMessages = (Array.isArray(rawMessages) ? rawMessages : []).map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name || `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim(),
            sender_role: msg.sender_role as 'client' | 'therapist' | 'admin' | 'assistant',
            recipient_id: msg.recipient_id,
            recipient_name: msg.recipient_name || `${msg.recipient_first_name || ''} ${msg.recipient_last_name || ''}`.trim(),
            subject: msg.subject || 'No subject',
            content: msg.content || msg.message || '',
            status: (msg.is_read || msg.read ? 'read' : 'unread') as 'unread' | 'read' | 'replied' | 'archived',
            priority: msg.priority_level || msg.priority || 'normal',
            created_at: msg.created_at,
            thread_id: msg.parent_message_id || msg.thread_id,
            attachments: msg.attachments?.map((a: any) => typeof a === 'string' ? a : a.url) || []
          }));
          setMessages(transformedMessages);
        }

        // For now, create conversations based on the messages we have
        // In the future, this would come from a conversations API endpoint
        if (messagesResponse.success && messagesResponse.data && messagesResponse.data.messages) {
          const conversations = messagesResponse.data.messages.map((msg: any) => ({
            id: msg.id,
            participant_name: `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim() || msg.sender_name || 'Unknown',
            participant_role: msg.sender_role as 'client' | 'therapist' | 'admin' | 'assistant',
            last_message: (msg.content || msg.message || '').substring(0, 50) + '...',
            last_message_time: new Date(msg.created_at).toLocaleDateString(),
            unread_count: msg.is_read || msg.read ? 0 : 1,
            status: 'active' as const,
            priority: (msg.priority_level || msg.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent'
          }));
          setConversations(conversations);
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
      case 'urgent': return 'bg-rose-50/80 text-rose-700 border-rose-200/50';
      case 'high': return 'bg-amber-50/80 text-amber-700 border-amber-200/50';
      case 'normal': return 'bg-sky-50/80 text-sky-700 border-sky-200/50';
      case 'low': return 'bg-slate-50/80 text-slate-700 border-slate-200/50';
      default: return 'bg-slate-50/80 text-slate-700 border-slate-200/50';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'therapist': return 'bg-violet-50/80 text-violet-800 border-violet-200/50';
      case 'admin': return 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50';
      case 'assistant': return 'bg-sky-50/80 text-sky-800 border-sky-200/50';
      case 'client': return 'bg-slate-50/80 text-slate-800 border-slate-200/50';
      default: return 'bg-slate-50/80 text-slate-800 border-slate-200/50';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'therapist': return '👨‍⚕️';
      case 'admin': return '👨‍💼';
      case 'assistant': return '👩‍💻';
      case 'client': return '👤';
      default: return '👤';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // Find the selected conversation to get recipient details
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;
      
      // Get the therapist/recipient info from the backend
      const therapistResponse = await realApiService.client.getTherapist();
      let recipientId = '';
      
      if (therapistResponse.success && therapistResponse.data) {
        recipientId = therapistResponse.data.id;
      }
      
      // If we still don't have a recipient ID, we can't send the message
      if (!recipientId) {
        console.error('No recipient found for message');
        return;
      }
      
      // Send the message
      const response = await realApiService.client.sendMessage({
        recipient_id: recipientId,
        subject: 'Therapy Session Discussion',
        content: newMessage,
        priority_level: 'normal'
      });
      
      if (response.success) {
        // Clear the input
        setNewMessage('');
        
        // Reload messages to show the new one
        const messagesResponse = await realApiService.client.getMessages();
        if (messagesResponse.success && messagesResponse.data) {
          const rawMessages = messagesResponse.data.messages || messagesResponse.data || [];
          const transformedMessages = (Array.isArray(rawMessages) ? rawMessages : []).map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name || `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim(),
            sender_role: msg.sender_role as 'client' | 'therapist' | 'admin' | 'assistant',
            recipient_id: msg.recipient_id,
            recipient_name: msg.recipient_name || `${msg.recipient_first_name || ''} ${msg.recipient_last_name || ''}`.trim(),
            subject: msg.subject || 'No subject',
            content: msg.content || msg.message || '',
            status: (msg.is_read || msg.read ? 'read' : 'unread') as 'unread' | 'read' | 'replied' | 'archived',
            priority: msg.priority_level || msg.priority || 'normal',
            created_at: msg.created_at,
            thread_id: msg.parent_message_id || msg.thread_id,
            attachments: msg.attachments?.map((a: any) => typeof a === 'string' ? a : a.url) || []
          }));
          setMessages(transformedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header with Glassmorphism */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/40 via-sky-100/40 to-emerald-100/40"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChatBubbleLeftSolid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Secure Messages
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Connect with your care team in a safe space
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCompose(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <SparklesSolid className="w-5 h-5" />
                  <span className="font-medium">New Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Stats with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Unread Messages Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-200/40 to-blue-200/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 hover:bg-white/70 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChatBubbleLeftSolid className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800">{conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}</div>
                  <div className="text-slate-600 text-sm font-medium">unread</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">New Messages</h3>
                <div className="flex items-center text-sky-600 text-sm">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>Need attention</span>
                </div>
              </div>
            </div>
          </div>

          {/* Therapist Conversations Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200/40 to-purple-200/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 hover:bg-white/70 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <HeartSolid className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800">{conversations.filter(c => c.participant_role === 'therapist').length}</div>
                  <div className="text-slate-600 text-sm font-medium">therapists</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Care Team</h3>
                <div className="flex items-center text-violet-600 text-sm">
                  <UserSolid className="w-4 h-4 mr-2" />
                  <span>Primary support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Staff Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/40 to-green-200/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 hover:bg-white/70 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircleSolid className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800">{conversations.filter(c => c.participant_role === 'admin' || c.participant_role === 'assistant').length}</div>
                  <div className="text-slate-600 text-sm font-medium">staff</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Support Team</h3>
                <div className="flex items-center text-emerald-600 text-sm">
                  <CheckCircleSolid className="w-4 h-4 mr-2" />
                  <span>Administrative help</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Interface with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/20 via-white/20 to-slate-100/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px]">
              {/* Conversations List */}
              <div className="lg:col-span-4 border-r border-white/20">
                {/* Search and Filter */}
                <div className="p-6 border-b border-white/20">
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search your conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl text-sm focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700 placeholder-slate-500"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <FunnelIcon className="w-5 h-5 text-slate-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl text-sm focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700"
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
                      className={`p-4 border-b border-white/20 cursor-pointer hover:bg-white/30 transition-all duration-300 ${
                        selectedConversation === conversation.id ? 'bg-violet-50/60 backdrop-blur-sm border-l-4 border-l-violet-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-slate-200/80 to-slate-300/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-lg shadow-lg border border-white/40">
                            {getRoleIcon(conversation.participant_role)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-800 truncate">
                              {conversation.participant_name}
                            </h3>
                            {conversation.unread_count > 0 && (
                              <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg font-medium">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border backdrop-blur-sm ${getRoleColor(conversation.participant_role)}`}>
                              {conversation.participant_role}
                            </span>
                            {conversation.priority !== 'normal' && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border backdrop-blur-sm ${getPriorityColor(conversation.priority)}`}>
                                {conversation.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 truncate font-medium">
                            {conversation.last_message}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                            {conversation.last_message_time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredConversations.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-r from-slate-300/60 to-slate-400/60 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ChatBubbleLeftSolid className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-600 font-medium">No conversations found</p>
                      <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
          </div>

              {/* Message View */}
              <div className="lg:col-span-8 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Message Header */}
                    <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-slate-200/80 to-slate-300/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-lg shadow-lg border border-white/40">
                            {getRoleIcon(conversations.find(c => c.id === selectedConversation)?.participant_role || 'therapist')}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">
                              {conversations.find(c => c.id === selectedConversation)?.participant_name}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">
                              {conversations.find(c => c.id === selectedConversation)?.participant_role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-3 text-slate-500 hover:text-slate-700 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-white/40">
                            <PhoneIcon className="w-5 h-5" />
                          </button>
                          <button className="p-3 text-slate-500 hover:text-slate-700 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-white/40">
                            <CalendarIcon className="w-5 h-5" />
                          </button>
                          <button className="p-3 text-slate-500 hover:text-slate-700 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-white/40">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {messages
                        .filter(msg => msg.thread_id === selectedConversation || msg.id === selectedConversation)
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((message) => {
                          const isCurrentUser = message.sender_id === user?.id;
                          return (
                            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-md">
                                <div className={`rounded-3xl p-4 shadow-lg ${
                                  isCurrentUser
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                                    : 'bg-white/70 backdrop-blur-sm border border-white/40'
                                }`}>
                                  <p className={`text-sm leading-relaxed ${isCurrentUser ? '' : 'text-slate-800'}`}>
                                    {message.content}
                                  </p>
                                </div>
                                <p className={`text-xs text-slate-500 mt-2 ${isCurrentUser ? 'mr-4 text-right' : 'ml-4'} font-medium`}>
                                  {new Date(message.created_at).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      
                      {messages.filter(msg => msg.thread_id === selectedConversation || msg.id === selectedConversation).length === 0 && (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 bg-gradient-to-r from-slate-300/60 to-slate-400/60 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <ChatBubbleLeftSolid className="w-8 h-8 text-slate-500" />
                          </div>
                          <p className="text-slate-600 font-medium">No messages in this conversation</p>
                          <p className="text-slate-500 text-sm mt-1">Start the conversation by sending a message</p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/40 to-white/60 backdrop-blur-sm">
                      <div className="flex items-end space-x-4">
                        <button className="p-3 text-slate-500 hover:text-slate-700 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-white/40 shadow-lg">
                          <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Share your thoughts safely..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl resize-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all duration-300 text-slate-700 placeholder-slate-500 shadow-lg"
                          />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
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
                        Choose a conversation to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;