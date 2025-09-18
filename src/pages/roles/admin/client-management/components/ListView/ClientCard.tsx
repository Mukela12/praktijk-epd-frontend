import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useClientContext } from '../shared/ClientContext';
import { Client } from '../shared/ClientContext';
import { StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDate } from '@/utils/dateFormatters';

interface ClientCardProps {
  client: Client;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onView, onEdit }) => {
  const { selectedIds, toggleSelectClient } = useClientContext();
  
  const isSelected = selectedIds.has(client.id);
  
  // Format client name
  const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown';
  
  // Format therapist name
  const therapistName = client.therapist_first_name && client.therapist_last_name
    ? `Dr. ${client.therapist_first_name} ${client.therapist_last_name}`
    : client.assigned_therapist_id ? 'Assigned' : 'Unassigned';
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  };
  
  // Get insurance status
  const hasInsurance = client.insurance_company && client.insurance_number;
  
  return (
    <tr className={`${isSelected ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectClient(client.id)}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {client.profile_photo_url ? (
            <img
              className="h-10 w-10 rounded-full"
              src={client.profile_photo_url}
              alt={clientName}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {client.first_name?.[0]}{client.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{clientName}</div>
            <div className="text-sm text-gray-500 flex items-center space-x-3">
              {client.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-3 w-3 mr-1" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-3 w-3 mr-1" />
                  {client.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          type={getStatusColor(client.user_status)} 
          status={client.user_status}
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{therapistName}</div>
        {client.assigned_therapist_id && client.therapist_email && (
          <div className="text-xs text-gray-500">{client.therapist_email}</div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {hasInsurance ? (
          <div className="flex items-center text-sm">
            <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-gray-900">{client.insurance_company}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No insurance</span>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">{client.total_appointments || 0} total</span>
            {client.completed_appointments && (
              <span className="text-green-600">({client.completed_appointments} completed)</span>
            )}
          </div>
          {client.unpaid_appointments && client.unpaid_appointments > 0 && (
            <div className="text-xs text-red-600 mt-1">
              {client.unpaid_appointments} unpaid
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm">
          {client.intake_completed ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Completed</span>
            </>
          ) : (
            <>
              <ClockIcon className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-yellow-600">Pending</span>
            </>
          )}
        </div>
        {client.intake_date && (
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(client.intake_date)}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(client.id)}
            className="text-gray-600 hover:text-gray-900"
            title="View details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(client.id)}
            className="text-red-600 hover:text-red-900"
            title="Edit client"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientCard;