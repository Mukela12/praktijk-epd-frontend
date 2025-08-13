import React, { useState } from 'react';
import StatusIndicator, { 
  StatusFilter, 
  StatusStats,
  type StatusType,
  type ClientStatus,
  type AppointmentStatus,
  type PriorityLevel,
  type InvoiceStatus,
  type TaskStatus,
  type WaitingListStatus,
  type UserStatus
} from '@/components/ui/StatusIndicator';

interface StatusDemoProps {
  className?: string;
}

export const StatusIndicatorDemo: React.FC<StatusDemoProps> = ({ className = '' }) => {
  const [selectedClientStatuses, setSelectedClientStatuses] = useState<string[]>(['active', 'new']);
  const [selectedAppointmentStatuses, setSelectedAppointmentStatuses] = useState<string[]>(['confirmed']);

  // Demo data for status counts
  const clientStatusCounts = {
    new: 12,
    viewed: 8,
    scheduled: 15,
    starting: 6,
    active: 45,
    discontinued: 3,
    completed: 22,
    archived: 7
  };

  const appointmentStatusCounts = {
    scheduled: 28,
    confirmed: 35,
    completed: 156,
    cancelled: 12,
    no_show: 4,
    rescheduled: 8
  };

  const invoiceStatusCounts = {
    draft: 5,
    sent: 23,
    paid: 187,
    overdue: 8,
    cancelled: 2
  };

  const statusTypes: { type: StatusType; statuses: string[]; title: string }[] = [
    {
      type: 'client',
      statuses: ['new', 'viewed', 'scheduled', 'starting', 'active', 'discontinued', 'completed', 'archived'],
      title: 'Client Status'
    },
    {
      type: 'appointment',
      statuses: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      title: 'Appointment Status'
    },
    {
      type: 'priority',
      statuses: ['low', 'normal', 'high', 'urgent', 'critical'],
      title: 'Priority Levels'
    },
    {
      type: 'invoice',
      statuses: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      title: 'Invoice Status'
    },
    {
      type: 'task',
      statuses: ['pending', 'in_progress', 'waiting', 'completed', 'cancelled'],
      title: 'Task Status'
    },
    {
      type: 'waiting_list',
      statuses: ['new', 'read', 'contacted', 'phoned', 'emailed', 'intake_planned', 'assigned'],
      title: 'Waiting List Status'
    },
    {
      type: 'user',
      statuses: ['active', 'inactive', 'pending', 'suspended', 'vacation'],
      title: 'User Status'
    }
  ];

  const sizeVariants = ['xs', 'sm', 'md', 'lg'] as const;
  const displayVariants = ['default', 'solid', 'outline', 'minimal'] as const;

  return (
    <div className={`space-y-8 p-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-primary mb-4">PraktijkEPD Status Indicator System</h1>
        <p className="text-body text-gray-600 max-w-3xl mx-auto">
          Comprehensive status indicators with consistent color coding across all system entities. 
          Based on Natalie's specifications for visual clarity and professional healthcare aesthetics.
        </p>
      </div>

      {/* All Status Types Overview */}
      <div className="grid grid-cols-1 gap-8">
        {statusTypes.map(({ type, statuses, title }) => (
          <div key={type} className="card-standard">
            <div className="card-header">
              <h2 className="heading-section">{title}</h2>
              <p className="text-body-sm text-gray-600">
                {statuses.length} status variants with consistent styling
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {statuses.map((status) => (
                  <div key={status} className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <StatusIndicator
                      type={type}
                      status={status}
                      size="md"
                    />
                    <code className="text-xs text-gray-500 text-center">{status}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Size Variants Demo */}
      <div className="card-standard">
        <div className="card-header">
          <h2 className="heading-section">Size Variants</h2>
          <p className="text-body-sm text-gray-600">
            Four size options for different use cases
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sizeVariants.map((size) => (
              <div key={size} className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 capitalize">{size}</h3>
                <StatusIndicator
                  type="client"
                  status="active"
                  size={size}
                />
                <StatusIndicator
                  type="appointment"
                  status="confirmed"
                  size={size}
                />
                <StatusIndicator
                  type="priority"
                  status="high"
                  size={size}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Display Variants Demo */}
      <div className="card-standard">
        <div className="card-header">
          <h2 className="heading-section">Display Variants</h2>
          <p className="text-body-sm text-gray-600">
            Different visual styles for various contexts
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayVariants.map((variant) => (
              <div key={variant} className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 capitalize">{variant}</h3>
                <StatusIndicator
                  type="client"
                  status="active"
                  variant={variant}
                />
                <StatusIndicator
                  type="invoice"
                  status="paid"
                  variant={variant}
                />
                <StatusIndicator
                  type="priority"
                  status="urgent"
                  variant={variant}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Icon Variants Demo */}
      <div className="card-standard">
        <div className="card-header">
          <h2 className="heading-section">Icon Options</h2>
          <p className="text-body-sm text-gray-600">
            With and without icons, outline and solid variants
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">With Icon (Outline)</h3>
              <StatusIndicator
                type="appointment"
                status="confirmed"
                showIcon={true}
                iconVariant="outline"
              />
            </div>
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">With Icon (Solid)</h3>
              <StatusIndicator
                type="appointment"
                status="confirmed"
                showIcon={true}
                iconVariant="solid"
              />
            </div>
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Text Only</h3>
              <StatusIndicator
                type="appointment"
                status="confirmed"
                showIcon={false}
                showText={true}
              />
            </div>
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Icon Only</h3>
              <StatusIndicator
                type="appointment"
                status="confirmed"
                showIcon={true}
                showText={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filters Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-standard">
          <div className="card-header">
            <h2 className="heading-section">Client Status Filter</h2>
            <p className="text-body-sm text-gray-600">
              Interactive filter component with multi-select
            </p>
          </div>
          <div className="card-body">
            <StatusFilter
              type="client"
              selectedStatuses={selectedClientStatuses}
              onStatusChange={setSelectedClientStatuses}
              className="mb-4"
            />
            <div className="text-sm text-gray-600">
              Selected: {selectedClientStatuses.length > 0 ? selectedClientStatuses.join(', ') : 'None'}
            </div>
          </div>
        </div>

        <div className="card-standard">
          <div className="card-header">
            <h2 className="heading-section">Appointment Status Filter</h2>
            <p className="text-body-sm text-gray-600">
              Another filter example with different status type
            </p>
          </div>
          <div className="card-body">
            <StatusFilter
              type="appointment"
              selectedStatuses={selectedAppointmentStatuses}
              onStatusChange={setSelectedAppointmentStatuses}
              className="mb-4"
            />
            <div className="text-sm text-gray-600">
              Selected: {selectedAppointmentStatuses.length > 0 ? selectedAppointmentStatuses.join(', ') : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Statistics Demo */}
      <div className="space-y-6">
        <div className="card-standard">
          <div className="card-header">
            <h2 className="heading-section">Client Status Statistics</h2>
            <p className="text-body-sm text-gray-600">
              Visual representation of status distribution with counts
            </p>
          </div>
          <div className="card-body">
            <StatusStats
              type="client"
              counts={clientStatusCounts}
              showPercentages={true}
            />
          </div>
        </div>

        <div className="card-standard">
          <div className="card-header">
            <h2 className="heading-section">Appointment Status Statistics</h2>
            <p className="text-body-sm text-gray-600">
              Another statistics example for appointment data
            </p>
          </div>
          <div className="card-body">
            <StatusStats
              type="appointment"
              counts={appointmentStatusCounts}
              showPercentages={true}
            />
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="card-standard">
        <div className="card-header">
          <h2 className="heading-section">Interactive Demo</h2>
          <p className="text-body-sm text-gray-600">
            Click on status indicators to see hover and focus states
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statusTypes.slice(0, 4).map(({ type, statuses }) => 
              statuses.slice(0, 3).map((status) => (
                <button
                  key={`${type}-${status}`}
                  onClick={() => alert(`Clicked: ${type} - ${status}`)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <StatusIndicator
                    type={type}
                    status={status}
                    size="sm"
                    tooltip={`${type}: ${status}`}
                  />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="card-standard">
        <div className="card-header">
          <h2 className="heading-section">Code Examples</h2>
          <p className="text-body-sm text-gray-600">
            Common usage patterns and implementations
          </p>
        </div>
        <div className="card-body space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Basic Usage:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<StatusIndicator type="client" status="active" />
<StatusIndicator type="appointment" status="confirmed" size="sm" />
<StatusIndicator type="priority" status="urgent" variant="solid" />`}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Advanced Usage:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<StatusIndicator 
  type="invoice" 
  status="overdue" 
  size="lg"
  variant="outline"
  showIcon={true}
  iconVariant="solid"
  onClick={() => handleInvoiceClick()}
  tooltip="Click to view invoice details"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Filter Component:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<StatusFilter
  type="client"
  selectedStatuses={selectedStatuses}
  onStatusChange={setSelectedStatuses}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Statistics Component:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<StatusStats
  type="client"
  counts={{ active: 45, new: 12, discontinued: 3 }}
  showPercentages={true}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-body-sm text-gray-600">
          This comprehensive status indicator system ensures consistent visual communication 
          across the entire PraktijkEPD application, following Natalie's design specifications.
        </p>
      </div>
    </div>
  );
};

export default StatusIndicatorDemo;