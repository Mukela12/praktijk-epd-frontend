import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ClientSupportTicket {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  issue_type: 'scheduling' | 'billing' | 'technical' | 'general' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
}

const ClientSupport: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [supportTickets, setSupportTickets] = useState<ClientSupportTicket[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadSupportData = async () => {
      try {
        setIsLoading(true);
        const clientsResponse = await realApiService.clients.getAll();
        
        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
          
          // Create mock support tickets
          const mockTickets: ClientSupportTicket[] = clientsResponse.data.slice(0, 15).map((client: any, index: number) => ({
            id: `ticket-${index + 1}`,
            client_id: client.id,
            client_name: `${client.first_name} ${client.last_name}`,
            client_phone: client.phone,
            client_email: client.email,
            issue_type: ['scheduling', 'billing', 'technical', 'general', 'urgent'][index % 5] as any,
            priority: ['low', 'normal', 'high', 'urgent'][index % 4] as any,
            status: ['new', 'in_progress', 'waiting_client', 'resolved', 'closed'][index % 5] as any,
            subject: [
              'Unable to access patient portal',
              'Question about upcoming appointment',
              'Payment issue with last session',
              'Request to reschedule therapy session',
              'Technical difficulty with video call',
              'Insurance coverage question',
              'Need help with appointment booking',
              'Billing inquiry for multiple sessions',
              'Password reset request',
              'Cancellation and refund request',
              'Urgent: Missed important appointment',
              'Follow-up on treatment plan',
              'Request for session notes',
              'Problem with online payment',
              'Schedule change due to emergency'
            ][index],
            description: [
              'I am having trouble logging into the patient portal. The system says my credentials are invalid.',
              'I wanted to confirm the time for my appointment next Thursday with Dr. Smith.',
              'There seems to be a discrepancy in the billing for my last session. Can someone please help?',
              'I need to reschedule my Tuesday appointment due to a work conflict.',
              'The video call keeps disconnecting during my online therapy sessions.',
              'I want to understand what my insurance covers for therapy sessions.',
              'I am trying to book a follow-up appointment but the system is not working.',
              'I have questions about the charges for my recent therapy sessions.',
              'I forgot my password and the reset email is not coming through.',
              'I need to cancel my upcoming sessions due to personal reasons.',
              'I completely forgot about my appointment today. Can we reschedule urgently?',
              'I would like to discuss my treatment progress with my therapist.',
              'Can I get copies of my session notes for my records?',
              'My credit card payment failed and I need to update my payment method.',
              'I have a family emergency and need to change all my appointments this week.'
            ][index],
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
            assigned_to: index % 3 === 0 ? getDisplayName() : undefined
          }));
          
          setSupportTickets(mockTickets);
        }
      } catch (error) {
        console.error('Failed to load support data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSupportData();
  }, [getDisplayName]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting_client': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'scheduling': return 'bg-blue-100 text-blue-800';
      case 'billing': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'in_progress': return <ClockIcon className="w-4 h-4" />;
      case 'waiting_client': return <ClockIcon className="w-4 h-4" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'closed': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredTickets = supportTickets.filter(ticket => {
    if (searchTerm) {
      const matchesSearch = 
        ticket.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    if (filterStatus !== 'all' && ticket.status !== filterStatus) {
      return false;
    }

    if (filterPriority !== 'all' && ticket.priority !== filterPriority) {
      return false;
    }

    if (filterType !== 'all' && ticket.issue_type !== filterType) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const newTickets = supportTickets.filter(t => t.status === 'new');
  const urgentTickets = supportTickets.filter(t => t.priority === 'urgent' || t.priority === 'high');
  const myTickets = supportTickets.filter(t => t.assigned_to === getDisplayName());
  const resolvedToday = supportTickets.filter(t => 
    t.status === 'resolved' && 
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  );

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
            <h1 className="text-2xl sm:text-3xl font-bold">Client Support</h1>
            <p className="text-blue-100 mt-1">
              Manage client inquiries and support requests
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{newTickets.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">New Tickets</div>
              <div className="flex items-center text-sm text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span>Require attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{urgentTickets.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Urgent/High Priority</div>
              <div className="flex items-center text-sm text-orange-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>Immediate attention</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <ArrowUpIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{myTickets.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Assigned to Me</div>
              <div className="flex items-center text-sm text-blue-600">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>My workload</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <UsersIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{resolvedToday.length}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Resolved Today</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                <span>Daily progress</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets, clients, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_client">Waiting Client</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="urgent">Urgent</option>
              <option value="scheduling">Scheduling</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Support Tickets ({filteredTickets.length})
          </h2>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all' 
                ? "Try adjusting your search or filters" 
                : "All clients are being supported well"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.subject}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getTypeColor(ticket.issue_type)}`}>
                        {ticket.issue_type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p><strong>Client:</strong> {ticket.client_name}</p>
                        <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p><strong>Phone:</strong> {ticket.client_phone}</p>
                        <p><strong>Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>

                    {ticket.assigned_to && (
                      <p className="text-sm text-blue-600">
                        <strong>Assigned to:</strong> {ticket.assigned_to}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50">
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50">
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                    {ticket.status === 'new' && (
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        Take
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        Resolve
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSupport;