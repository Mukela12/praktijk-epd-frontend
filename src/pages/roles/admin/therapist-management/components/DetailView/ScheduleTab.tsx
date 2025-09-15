import React from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ScheduleTabProps {
  therapistId: string;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ therapistId }) => {
  return (
    <div className="space-y-6">
      {/* Availability Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">{day}</div>
              <div className="bg-green-100 rounded-lg p-2 text-xs text-green-700">
                9:00 - 17:00
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Appointments
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">Schedule integration coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTab;