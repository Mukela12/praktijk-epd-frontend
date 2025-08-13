import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  children?: MenuItem[];
}

const AdminSidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['client-management', 'therapist-management']);

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/admin/dashboard'
    },
    {
      label: 'Agenda',
      icon: CalendarIcon,
      children: [
        { label: 'My Agenda', icon: CalendarIcon, path: '/admin/agenda/my' },
        { label: 'Full Practice Agenda', icon: CalendarIcon, path: '/admin/agenda/full' }
      ]
    },
    {
      label: 'Client Management',
      icon: UsersIcon,
      children: [
        { label: 'Status of New Applications', icon: ClipboardDocumentListIcon, path: '/admin/waiting-list' },
        { label: 'Add Client', icon: UsersIcon, path: '/admin/clients/new' },
        { label: 'All Clients', icon: UsersIcon, path: '/admin/clients' },
        { label: 'Client Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/clients/settings' },
        { label: 'Client Invoices', icon: DocumentTextIcon, path: '/admin/clients/invoices' },
        { label: 'Client Agreement Forms', icon: DocumentTextIcon, path: '/admin/clients/agreements' },
        { label: 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/clients/dashboard-settings' },
        { label: 'Statistics', icon: ChartBarIcon, path: '/admin/clients/statistics' }
      ]
    },
    {
      label: 'Therapist Management',
      icon: UserGroupIcon,
      children: [
        { label: 'Status of In/Out Offices', icon: BuildingOfficeIcon, path: '/admin/therapists/status' },
        { label: 'All Therapists', icon: UserGroupIcon, path: '/admin/therapists' },
        { label: 'Add Therapist', icon: UserGroupIcon, path: '/admin/therapists/new' },
        { label: 'Therapist Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/therapists/settings' },
        { label: 'Therapist Invoices', icon: DocumentTextIcon, path: '/admin/therapists/invoices' },
        { label: 'Therapist Contracts', icon: DocumentTextIcon, path: '/admin/therapists/contracts' },
        { label: 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/therapists/dashboard-settings' },
        { label: 'Statistics', icon: ChartBarIcon, path: '/admin/therapists/statistics' }
      ]
    },
    {
      label: 'Financial Management',
      icon: CurrencyEuroIcon,
      children: [
        { label: 'Total Revenue Dashboard', icon: ChartBarIcon, path: '/admin/financial' },
        { label: 'Total Client Revenue', icon: CurrencyEuroIcon, path: '/admin/financial/client-revenue' },
        { label: 'Total Therapist Cost', icon: CurrencyEuroIcon, path: '/admin/financial/therapist-cost' },
        { label: 'All Unpaid Invoices', icon: DocumentTextIcon, path: '/admin/financial/unpaid-invoices' },
        { label: 'Invoice Settings', icon: Cog6ToothIcon, path: '/admin/financial/invoice-settings' },
        { label: 'Settings', icon: Cog6ToothIcon, path: '/admin/financial/settings' },
        { label: 'Statistics', icon: ChartBarIcon, path: '/admin/financial/statistics' }
      ]
    },
    {
      label: 'Message Center',
      icon: ChatBubbleLeftRightIcon,
      children: [
        { label: 'My Messages', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/my' },
        { label: 'Full Messages', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/all' },
        { label: 'Send Message', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/new' },
        { label: 'Send E-mail', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/email' },
        { label: 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/messages/settings' }
      ]
    },
    {
      label: 'Phonebook',
      icon: PhoneIcon,
      children: [
        { label: 'Add Contacts', icon: PhoneIcon, path: '/admin/phonebook/add' },
        { label: 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/phonebook/settings' }
      ]
    },
    {
      label: 'Educational Resources',
      icon: BookOpenIcon,
      children: [
        { label: 'Resource Library', icon: BookOpenIcon, path: '/admin/resources' },
        { label: 'Challenges', icon: PuzzlePieceIcon, path: '/admin/challenges' },
        { label: 'Surveys', icon: ClipboardDocumentCheckIcon, path: '/admin/surveys' }
      ]
    },
    {
      label: 'Admin Company Settings',
      icon: Cog6ToothIcon,
      path: '/admin/company-settings'
    }
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
              transition-colors duration-150
              ${depth > 0 ? 'ml-6' : ''}
              hover:bg-gray-100 hover:text-gray-900
              text-gray-700
            `}
          >
            <div className="flex items-center">
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path!}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-lg
          transition-colors duration-150
          ${depth > 0 ? 'ml-6' : ''}
          ${active
            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        <item.icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-700' : ''}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-sm h-full overflow-y-auto">
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">PraktijkEPD</h2>
          <p className="text-sm text-gray-600">Admin Portal</p>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
      
      {/* User info at bottom */}
      <div className="border-t border-gray-200 p-4 mt-auto">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;