import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  StarIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  InboxIcon,
  ArrowUturnLeftIcon,
  CurrencyEuroIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { formatDate, formatTime, formatRelativeTime } from '@/utils/dateFormatters';
import { useApiWithErrorHandling } from '@/hooks/useApiWithErrorHandling';
import { InlineCrudLayout, FilterBar, ListItemCard, FormSection, ActionButtons } from '@/components/crud/InlineCrudLayout';
import { TextField, TextareaField, SelectField } from '@/components/forms/FormFields';
import { handleApiError } from '@/utils/apiErrorHandler';

// Types
interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_starred?: boolean;
  is_archived?: boolean;
  priority_level: 'urgent' | 'high' | 'normal' | 'low';
  message_type: 'general' | 'appointment' | 'clinical' | 'billing' | 'emergency';
  created_at: string;
  updated_at: string;
  // Related data
  sender_first_name?: string;
  sender_last_name?: string;
  sender_role?: string;
  sender_email?: string;
  recipient_first_name?: string;
  recipient_last_name?: string;
  recipient_role?: string;
  recipient_email?: string;
  // Reply chain
  parent_message_id?: string;
  reply_count?: number;
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
    type: string;
  }>;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

type ViewMode = 'inbox' | 'sent' | 'archived' | 'compose' | 'detail';
type MessageFilter = 'all' | 'unread' | 'starred' | 'urgent';

interface MessagesManagementProps {
  userRole?: 'admin' | 'therapist' | 'client' | 'assistant' | 'bookkeeper';
}

const MessagesManagement: React.FC<MessagesManagementProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, info, warning, error: errorAlert, confirm } = useAlert();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  // Form state for composing
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    priority_level: 'normal' as Message['priority_level'],
    message_type: 'general' as Message['message_type']
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState(false);

  // API hooks
  const sendMessageApi = useApiWithErrorHandling(
    (data: any) => {
      // Use appropriate API based on user role
      switch (userRole || user?.role) {
        case 'admin':
          return realApiService.messages.send(data);
        case 'therapist':
          return realApiService.messages.send(data);
        case 'client':
          return realApiService.client.sendMessage(data);
        case 'bookkeeper':
          return realApiService.bookkeeper.sendMessage(data);
        default:
          return realApiService.messages.send(data);
      }
    },
    {
      successMessage: 'Message sent successfully',
      errorMessage: 'Failed to send message'
    }
  );

  // Load messages
  useEffect(() => {
    loadMessages();
    loadUsers();
  }, [viewMode]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      let response;
      
      // Load messages based on user role and view mode
      switch (userRole || user?.role) {
        case 'client':
          response = await realApiService.client.getMessages({
            unreadOnly: filter === 'unread'
          });
          break;
        case 'bookkeeper':
          response = await realApiService.bookkeeper.getMessages();
          break;
        default:
          response = await realApiService.messages.getAll();
      }
      
      if (response.success && response.data) {
        const messagesData = response.data.messages || response.data;
        
        // Filter based on view mode
        let filteredMessages = messagesData;
        if (viewMode === 'inbox') {
          filteredMessages = messagesData.filter((msg: Message) => msg.recipient_id === user?.id);
        } else if (viewMode === 'sent') {
          filteredMessages = messagesData.filter((msg: Message) => msg.sender_id === user?.id);
        } else if (viewMode === 'archived') {
          filteredMessages = messagesData.filter((msg: Message) => msg.is_archived);
        }
        
        setMessages(filteredMessages);
      }
    } catch (error) {
      handleApiError(error);
      errorAlert('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Load potential recipients based on user role
      let recipients: User[] = [];
      
      if (userRole === 'admin' || user?.role === 'admin') {
        // Admins can message anyone
        const response = await realApiService.admin.getUsers();
        if (response.success && response.data) {
          recipients = response.data.users || [];
        }
      } else if (userRole === 'therapist' || user?.role === 'therapist') {
        // Therapists can message their clients and admins
        const [clientsResponse, adminsResponse] = await Promise.all([
          realApiService.therapist.getClients(),
          realApiService.admin.getUsers({ role: 'admin' })
        ]);
        
        const clients = clientsResponse.data || [];
        const admins = adminsResponse.data?.users || [];
        recipients = [...clients, ...admins];
      } else if (userRole === 'client' || user?.role === 'client') {
        // Clients can message their therapist and admins
        const therapistResponse = await realApiService.client.getTherapist();
        const therapist = therapistResponse.data;
        recipients = therapist ? [{
          ...therapist,
          role: 'therapist' // Add the role property
        }] : [];
      }
      
      setUsers(recipients);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filter) {
      case 'unread':
        matchesFilter = !msg.is_read;
        break;
      case 'starred':
        matchesFilter = msg.is_starred || false;
        break;
      case 'urgent':
        matchesFilter = msg.priority_level === 'urgent' || msg.priority_level === 'high';
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort messages by date (newest first)
  const sortedMessages = filteredMessages.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Handle mark as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await realApiService.messages.markAsRead(messageId);
      await loadMessages();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle star/unstar
  const handleToggleStar = async (message: Message) => {
    try {
      // Note: Backend might not have star functionality yet
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, is_starred: !msg.is_starred } : msg
      ));
      info(message.is_starred ? 'Message unstarred' : 'Message starred');
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle archive
  const handleArchive = async (messageIds: string[]) => {
    try {
      // Note: Backend might not have archive functionality yet
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, is_archived: true } : msg
      ));
      success(`${messageIds.length} message(s) archived`);
      setSelectedMessages([]);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle delete
  const handleDelete = async (messageIds: string[]) => {
    const confirmed = await confirm({
      title: 'Delete Messages',
      message: `Are you sure you want to delete ${messageIds.length} message(s)?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      // Note: Backend might not have delete functionality yet
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
      success(`${messageIds.length} message(s) deleted`);
      setSelectedMessages([]);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recipient_id) {
      errors.recipient_id = 'Recipient is required';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Message content is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!validateForm()) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      await sendMessageApi.execute(formData);
      await loadMessages();
      setViewMode('sent');
      resetForm();
      setIsReplying(false);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      recipient_id: '',
      subject: '',
      content: '',
      priority_level: 'normal',
      message_type: 'general'
    });
    setFormErrors({});
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return CalendarIcon;
      case 'clinical': return DocumentTextIcon;
      case 'billing': return CurrencyEuroIcon;
      case 'emergency': return ExclamationCircleIcon;
      default: return EnvelopeIcon;
    }
  };

  // Render message detail
  const renderMessageDetail = () => {
    if (!selectedMessage) return null;

    return (
      <div className="space-y-6">
        <PremiumCard>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge
                    type="general"
                    status={selectedMessage.priority_level}
                    size="sm"
                  />
                  <span className="text-sm text-gray-500">
                    {selectedMessage.message_type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(selectedMessage.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={selectedMessage.is_starred ? StarIconSolid : StarIcon}
                  onClick={() => handleToggleStar(selectedMessage)}
                >
                  <span className="sr-only">Star</span>
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={ArchiveBoxIcon}
                  onClick={() => handleArchive([selectedMessage.id])}
                >
                  <span className="sr-only">Archive</span>
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => handleDelete([selectedMessage.id])}
                >
                  <span className="sr-only">Delete</span>
                </PremiumButton>
              </div>
            </div>

            {/* Sender/Recipient Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedMessage.sender_first_name?.[0]}{selectedMessage.sender_last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedMessage.sender_first_name} {selectedMessage.sender_last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">To:</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedMessage.recipient_first_name} {selectedMessage.recipient_last_name}
                </p>
              </div>
            </div>

            {/* Message Content */}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</p>
            </div>

            {/* Attachments */}
            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedMessage.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <PaperClipIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{attachment.filename}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <PremiumButton
                variant="secondary"
                icon={ArrowUturnLeftIcon}
                onClick={() => {
                  setIsReplying(true);
                  setFormData({
                    recipient_id: selectedMessage.sender_id,
                    subject: `Re: ${selectedMessage.subject}`,
                    content: '',
                    priority_level: 'normal',
                    message_type: selectedMessage.message_type
                  });
                  setViewMode('compose');
                }}
              >
                Reply
              </PremiumButton>
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setSelectedMessage(null);
                  setViewMode('inbox');
                }}
              >
                Back to Messages
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>
    );
  };

  // Render compose form
  const renderComposeForm = () => {
    return (
      <div className="space-y-6">
        <FormSection
          title={isReplying ? 'Reply to Message' : 'New Message'}
          description={isReplying ? 'Send a reply to this message' : 'Compose and send a new message'}
        >
          <SelectField
            label="Recipient"
            name="recipient_id"
            value={formData.recipient_id}
            onChange={(value) => setFormData(prev => ({ ...prev, recipient_id: value }))}
            options={users.map(user => ({
              value: user.id,
              label: `${user.first_name} ${user.last_name} (${user.role})`
            }))}
            error={formErrors.recipient_id}
            disabled={isReplying}
            required
          />

          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
            error={formErrors.subject}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Priority"
              name="priority_level"
              value={formData.priority_level}
              onChange={(value) => setFormData(prev => ({ ...prev, priority_level: value as Message['priority_level'] }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />

            <SelectField
              label="Message Type"
              name="message_type"
              value={formData.message_type}
              onChange={(value) => setFormData(prev => ({ ...prev, message_type: value as Message['message_type'] }))}
              options={[
                { value: 'general', label: 'General' },
                { value: 'appointment', label: 'Appointment' },
                { value: 'clinical', label: 'Clinical' },
                { value: 'billing', label: 'Billing' },
                { value: 'emergency', label: 'Emergency' }
              ]}
            />
          </div>

          <TextareaField
            label="Message"
            name="content"
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            error={formErrors.content}
            rows={8}
            placeholder="Type your message here..."
            required
          />
        </FormSection>

        <ActionButtons
          onCancel={() => {
            setViewMode('inbox');
            resetForm();
            setIsReplying(false);
          }}
          onSubmit={handleSendMessage}
          submitText="Send Message"
          submitIcon={PaperAirplaneIcon}
          isSubmitting={sendMessageApi.isLoading}
        />
      </div>
    );
  };

  // Render messages list
  const renderMessagesList = () => {
    if (sortedMessages.length === 0) {
      return (
        <PremiumEmptyState
          icon={InboxIcon}
          title={`No ${viewMode} messages`}
          description={searchTerm || filter !== 'all' 
            ? "Try adjusting your search or filters" 
            : viewMode === 'inbox' 
              ? "You don't have any messages yet" 
              : "You haven't sent any messages yet"}
          action={viewMode !== 'compose' ? {
            label: "Compose Message",
            onClick: () => setViewMode('compose')
          } : undefined}
        />
      );
    }

    return (
      <div className="space-y-2">
        {sortedMessages.map((message) => {
          const TypeIcon = getMessageTypeIcon(message.message_type);
          const isSelected = selectedMessages.includes(message.id);
          
          return (
            <ListItemCard
              key={message.id}
              onClick={() => {
                setSelectedMessage(message);
                setViewMode('detail');
                if (!message.is_read && message.recipient_id === user?.id) {
                  handleMarkAsRead(message.id);
                }
              }}
              className={`${!message.is_read && message.recipient_id === user?.id ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedMessages([...selectedMessages, message.id]);
                    } else {
                      setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-shrink-0">
                  <TypeIcon className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${!message.is_read && message.recipient_id === user?.id ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                          {viewMode === 'sent' 
                            ? `To: ${message.recipient_first_name} ${message.recipient_last_name}`
                            : `${message.sender_first_name} ${message.sender_last_name}`}
                        </p>
                        {message.priority_level !== 'normal' && (
                          <StatusBadge
                            type="general"
                            status={message.priority_level}
                            size="sm"
                          />
                        )}
                      </div>
                      <p className={`${!message.is_read && message.recipient_id === user?.id ? 'font-semibold' : ''} text-gray-900 truncate`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {message.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {message.is_starred && (
                        <StarIconSolid className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ListItemCard>
          );
        })}
      </div>
    );
  };

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate unread count
  const unreadCount = messages.filter(msg => !msg.is_read && msg.recipient_id === user?.id).length;

  return (
    <InlineCrudLayout
      title="Messages"
      subtitle={viewMode === 'compose' ? 'Compose a new message' : `Manage your ${viewMode} messages`}
      icon={ChatBubbleLeftRightIcon}
      viewMode={viewMode === 'detail' ? 'detail' : viewMode === 'compose' ? 'create' : 'list'}
      onViewModeChange={() => {}}
      showCreateButton={viewMode !== 'compose' && viewMode !== 'detail'}
      createButtonText="Compose"
      onBack={viewMode === 'detail' || viewMode === 'compose' ? () => {
        setViewMode('inbox');
        setSelectedMessage(null);
        resetForm();
        setIsReplying(false);
      } : undefined}
      isLoading={isLoading}
      headerActions={
        <>
          {unreadCount > 0 && viewMode === 'inbox' && (
            <StatusBadge
              type="general"
              status={`${unreadCount} unread`}
            />
          )}
          {viewMode !== 'detail' && viewMode !== 'compose' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('inbox')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === 'inbox' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => setViewMode('sent')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === 'sent' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setViewMode('archived')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === 'archived' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Archived
              </button>
            </div>
          )}
        </>
      }
    >
      {viewMode === 'compose' && renderComposeForm()}
      {viewMode === 'detail' && renderMessageDetail()}
      {(viewMode === 'inbox' || viewMode === 'sent' || viewMode === 'archived') && (
        <>
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as MessageFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="starred">Starred</option>
                <option value="urgent">Urgent</option>
              </select>
            }
            actions={
              selectedMessages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedMessages.length} selected
                  </span>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    icon={ArchiveBoxIcon}
                    onClick={() => handleArchive(selectedMessages)}
                  >
                    Archive
                  </PremiumButton>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    icon={TrashIcon}
                    onClick={() => handleDelete(selectedMessages)}
                  >
                    Delete
                  </PremiumButton>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    icon={XMarkIcon}
                    onClick={() => setSelectedMessages([])}
                  >
                    Clear
                  </PremiumButton>
                </div>
              )
            }
          />
          {renderMessagesList()}
        </>
      )}
    </InlineCrudLayout>
  );
};

export default MessagesManagement;