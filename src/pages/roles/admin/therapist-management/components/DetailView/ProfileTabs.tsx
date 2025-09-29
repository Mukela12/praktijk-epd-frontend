import React from 'react';
import { 
  InformationCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  therapistId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange, therapistId }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon },
    { id: 'hulpvragen', name: 'Hulpvragen', icon: AcademicCapIcon },
    { id: 'schedule', name: 'Schedule', icon: CalendarDaysIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon },
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id
                      ? 'text-red-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProfileTabs;