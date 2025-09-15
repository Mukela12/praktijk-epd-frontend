import React, { useEffect, useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ActivityItem } from '../shared/therapistTypes';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/dateFormatters';
import { realApiService } from '@/services/realApi';

interface ActivityTabProps {
  therapistId: string;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ therapistId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [therapistId]);

  const loadActivities = async () => {
    console.log('🔍 [ActivityTab] Loading activities for therapist:', therapistId);
    try {
      setLoading(true);
      // Use the audit logs endpoint filtered by userId
      const response = await realApiService.admin.getAuditLogs({
        userId: therapistId,
        limit: 20
      });
      
      console.log('📊 [ActivityTab] Audit logs response:', response);
      
      if (response.success && response.data) {
        // Handle both array and object with logs property
        const logs = Array.isArray(response.data) ? response.data : ((response.data as any).logs || []);
        console.log('📋 [ActivityTab] Extracted logs:', logs);
        
        // Transform audit logs to activity items
        const transformedActivities = logs.map((log: any) => ({
          id: log.id,
          type: mapEventTypeToActivityType(log.event_type),
          description: formatEventDescription(log),
          timestamp: log.created_at,
          metadata: log.event_data,
          actor: {
            id: log.user_id,
            name: log.user_name || 'System',
            role: log.user_role || 'system'
          }
        }));
        setActivities(transformedActivities);
      } else {
        // Fallback to empty array if no data
        setActivities([]);
      }
    } catch (error: any) {
      console.error('❌ [ActivityTab] Failed to load activities:', error);
      console.error('❌ [ActivityTab] Error response:', error.response?.data);
      console.error('❌ [ActivityTab] Error status:', error.response?.status);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const mapEventTypeToActivityType = (eventType: string): string => {
    const typeMap: { [key: string]: string } = {
      'user.status_changed': 'status_change',
      'user.profile_updated': 'profile_update',
      'therapist.profile_updated': 'profile_update',
      'client.assigned': 'client_assigned',
      'appointment.created': 'appointment',
      'user.login': 'login',
      'user.created': 'status_change',
      'user.deleted': 'status_change'
    };
    return typeMap[eventType] || 'profile_update';
  };

  const formatEventDescription = (log: any): string => {
    const descriptions: { [key: string]: string } = {
      'user.status_changed': `Status changed to ${log.event_data?.new_status || 'unknown'}`,
      'user.profile_updated': 'Profile information updated',
      'therapist.profile_updated': 'Professional information updated',
      'client.assigned': `Client ${log.event_data?.client_name || 'assigned'}`,
      'appointment.created': 'New appointment scheduled',
      'user.login': 'Logged into the system',
      'user.created': 'Account created',
      'user.deleted': 'Account deactivated'
    };
    return descriptions[log.event_type] || log.event_type.replace('.', ' ').replace(/_/g, ' ');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return '🔄';
      case 'profile_update':
        return '✏️';
      case 'client_assigned':
        return '👥';
      case 'appointment':
        return '📅';
      case 'login':
        return '🔐';
      default:
        return '📌';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {activity.actor && (
                        <p className="text-xs text-gray-500 mt-1">
                          by {activity.actor.name}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={activity.timestamp}>
                        {formatDate(activity.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityTab;