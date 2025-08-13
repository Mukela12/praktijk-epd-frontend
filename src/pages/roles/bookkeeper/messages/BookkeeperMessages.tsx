import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  InboxIcon,
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useBookkeeperMessages } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState, PremiumListItem } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface Message {
  id: string;
  sender_name: string;
  sender_role: 'admin' | 'therapist' | 'client' | 'assistant';
  recipient_name: string;
  subject: string;
  content: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'billing' | 'invoice' | 'payment' | 'report' | 'general';
  has_attachments: boolean;
  thread_id?: string;
}

const BookkeeperMessages: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { getMessages, sendMessage, isLoading } = useBookkeeperMessages();
  const { success, info, warning } = useAlert();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [replyContent, setReplyContent] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMessages({ page: 1, limit: 50 });
        if (data && (data as any).messages && Array.isArray((data as any).messages)) {
          // Map API data to message format
          const mappedMessages = (data as any).messages.map((msg: any) => ({
            id: msg.id || msg.message_id,
            sender_name: msg.sender_name || msg.from_name || 'Unknown',
            sender_role: msg.sender_role || 'admin',
            recipient_name: msg.recipient_name || getDisplayName(),
            subject: msg.subject || 'No Subject',
            content: msg.content || msg.message || '',
            created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
            status: msg.status || 'unread',
            priority: msg.priority || 'normal',
            category: msg.category || 'general',
            has_attachments: msg.has_attachments || false,
            thread_id: msg.thread_id
          }));
          setMessages(mappedMessages);
        } else if (Array.isArray(data)) {
          // Handle case where data is directly an array
          const mappedMessages = data.map((msg: any) => ({
            id: msg.id || msg.message_id,
            sender_name: msg.sender_name || msg.from_name || 'Unknown',
            sender_role: msg.sender_role || 'admin',
            recipient_name: msg.recipient_name || getDisplayName(),
            subject: msg.subject || 'No Subject',
            content: msg.content || msg.message || '',
            created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
            status: msg.status || 'unread',
            priority: msg.priority || 'normal',
            category: msg.category || 'general',
            has_attachments: msg.has_attachments || false,
            thread_id: msg.thread_id
          }));
          setMessages(mappedMessages);
        } else {
          // No messages from backend
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Keep empty state on error
        setMessages([]);
      }
    };

    loadMessages();
  }, [getMessages]);

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Handle message actions
  const handleMessageAction = (messageId: string, action: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      switch (action) {
        case 'read':
          setMessages(prev => 
            prev.map(m => m.id === messageId ? { ...m, status: 'read' } : m)
          );
          setSelectedMessage(message);
          break;
        case 'reply':
          setSelectedMessage(message);
          setReplyContent('');
          break;
        case 'archive':
          setMessages(prev => 
            prev.map(m => m.id === messageId ? { ...m, status: 'archived' } : m)
          );
          success(`Message from ${message.sender_name} archived`);
          break;
        case 'mark_unread':
          setMessages(prev => 
            prev.map(m => m.id === messageId ? { ...m, status: 'unread' } : m)
          );
          break;
      }
    }
  };

  // Handle reply
  const handleReply = () => {
    if (selectedMessage && replyContent.trim()) {
      setMessages(prev => 
        prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m)
      );
      success(`Reply sent to ${selectedMessage.sender_name}`);
      setReplyContent('');
      setSelectedMessage(null);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'billing': return CurrencyDollarIcon;
      case 'invoice': return DocumentTextIcon;
      case 'payment': return CurrencyDollarIcon;
      case 'report': return DocumentTextIcon;
      case 'general': return ChatBubbleLeftRightIcon;
      default: return ChatBubbleLeftRightIcon;
    }
  };

  // Get stats
  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const urgentCount = messages.filter(m => m.priority === 'urgent').length;

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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3" />
              Messages
            </h1>
            <p className="text-orange-100 mt-1">
              Financial communications and billing inquiries
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="flex space-x-4 text-sm">
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <span className="font-medium">{unreadCount}</span> unread
              </div>
              {urgentCount > 0 && (
                <div className="bg-red-500/30 rounded-lg px-3 py-1">
                  <span className="font-medium">{urgentCount}</span> urgent
                </div>
              )}
            </div>
            <PremiumButton
              variant="outline"
              icon={PlusIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowCompose(true)}
            >
              Compose
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PremiumCard>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="billing">Billing</option>
              <option value="invoice">Invoices</option>
              <option value="payment">Payments</option>
              <option value="report">Reports</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* Messages List and Compose/Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={showCompose ? "lg:col-span-1" : "lg:col-span-2"}>
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Inbox ({filteredMessages.length})
              </h3>
              <div className="flex space-x-2">
                <PremiumButton size="sm" variant="outline" icon={ArchiveBoxIcon}>
                  Archive All Read
                </PremiumButton>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <PremiumEmptyState
                icon={InboxIcon}
                title="No Messages Found"
                description="No messages match your current filters."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }
                }}
              />
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((message) => {
                  const CategoryIcon = getCategoryIcon(message.category);
                  
                  return (
                    <PremiumListItem
                      key={message.id}
                      avatar={{ 
                        initials: message.sender_name.split(' ').map(n => n[0]).join(''), 
                        color: 'bg-orange-500' 
                      }}
                      priority={message.priority as any}
                      status={{ 
                        status: message.status, 
                        type: message.status === 'unread' ? 'pending' :
                              message.status === 'replied' ? 'paid' :
                              message.status === 'archived' ? 'discontinued' : 'active'
                      }}
                      actions={
                        <div className="flex space-x-2">
                          <PremiumButton
                            size="sm"
                            variant="primary"
                            onClick={() => handleMessageAction(message.id, 'read')}
                          >
                            View
                          </PremiumButton>
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            icon={PaperAirplaneIcon}
                            onClick={() => handleMessageAction(message.id, 'reply')}
                          >
                            Reply
                          </PremiumButton>
                          <PremiumButton
                            size="sm"
                            variant="outline"
                            icon={ArchiveBoxIcon}
                            onClick={() => handleMessageAction(message.id, 'archive')}
                          >
                            Archive
                          </PremiumButton>
                        </div>
                      }
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-semibold ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                                {message.sender_name}
                              </h4>
                              <CategoryIcon className="w-4 h-4 text-gray-400" />
                              {message.has_attachments && (
                                <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className={`text-sm mb-1 ${message.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs">
                            {message.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                            {message.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {message.sender_role}
                          </span>
                        </div>
                      </div>
                    </PremiumListItem>
                  );
                })}
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Message Detail/Reply/Compose Panel */}
        <div className={showCompose ? "lg:col-span-2" : ""}>
          <PremiumCard>
            {showCompose ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Compose New Message</h3>
                  <button
                    onClick={() => {
                      setShowCompose(false);
                      setComposeData({ to: '', subject: '', message: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                    <input
                      type="text"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      placeholder="Recipient name or email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      placeholder="Message subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                    <textarea
                      value={composeData.message}
                      onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                      placeholder="Type your message here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-600 hover:text-gray-800">
                        <DocumentTextIcon className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-500">Attach files</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <PremiumButton
                        variant="outline"
                        onClick={() => {
                          setShowCompose(false);
                          setComposeData({ to: '', subject: '', message: '' });
                        }}
                      >
                        Cancel
                      </PremiumButton>
                      <PremiumButton
                        variant="primary"
                        icon={PaperAirplaneIcon}
                        onClick={async () => {
                          try {
                            await sendMessage({
                              recipient: composeData.to,
                              subject: composeData.subject,
                              content: composeData.message,
                              category: 'general'
                            });
                            success('Message sent successfully');
                            setShowCompose(false);
                            setComposeData({ to: '', subject: '', message: '' });
                            // Reload messages
                            const data = await getMessages({ page: 1, limit: 50 });
                            if (data && (data as any).messages) {
                              setMessages((data as any).messages);
                            }
                          } catch (error) {
                            warning('Failed to send message');
                          }
                        }}
                        disabled={!composeData.to || !composeData.subject || !composeData.message}
                      >
                        Send Message
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedMessage ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    From: {selectedMessage.sender_name} • {new Date(selectedMessage.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700">{selectedMessage.content}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Reply</h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <div className="flex space-x-2 mt-3">
                    <PremiumButton
                      size="sm"
                      variant="primary"
                      icon={PaperAirplaneIcon}
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                    >
                      Send Reply
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMessage(null)}
                    >
                      Close
                    </PremiumButton>
                  </div>
                </div>
              </div>
            ) : (
              <PremiumEmptyState
                icon={ChatBubbleLeftRightIcon}
                title="Select a Message"
                description="Choose a message from the list to view and reply to it."
              />
            )}
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default BookkeeperMessages;