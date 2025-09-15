import React, { useEffect, useState } from 'react';
import { UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { useNavigate } from 'react-router-dom';

interface ClientsTabProps {
  therapistId: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  therapy_type?: string;
  last_session?: string;
  next_appointment?: string;
  total_sessions?: number;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ therapistId }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTherapistClients();
  }, [therapistId]);

  const loadTherapistClients = async () => {
    try {
      setLoading(true);
      // Use the getClients endpoint with therapist filter
      const response = await realApiService.admin.getClients({ 
        therapistId: therapistId,
        limit: 100 // Get all clients for this therapist
      });
      
      if (response.success && response.data?.clients) {
        // Transform the data to match our interface
        const transformedClients = response.data.clients.map((client: any) => ({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          status: client.status || 'active',
          therapy_type: client.therapy_type,
          last_session: client.last_session,
          next_appointment: client.next_appointment,
          total_sessions: client.session_count || 0
        }));
        setClients(transformedClients);
      }
    } catch (error) {
      console.error('Failed to load therapist clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            This therapist doesn't have any clients assigned yet.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/clients')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Assign Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Assigned Clients ({clients.length})
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {clients.map((client) => (
          <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-sm">
                    {client.first_name[0]}{client.last_name[0]}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-900">{client.therapy_type}</p>
                  <p className="text-sm text-gray-500">
                    {client.total_sessions} sessions
                  </p>
                </div>
                <StatusBadge type="client" status={client.status} size="sm" />
                <button
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientsTab;