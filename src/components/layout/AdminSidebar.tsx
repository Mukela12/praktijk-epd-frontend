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
      label: t('nav.dashboard'),
      icon: HomeIcon,
      path: '/admin/dashboard'
    },
    {
      label: t('nav.calendar'),
      icon: CalendarIcon,
      children: [
        { label: t('nav.myAgenda') || 'My Agenda', icon: CalendarIcon, path: '/admin/agenda/my' },
        { label: t('nav.fullPracticeAgenda') || 'Full Practice Agenda', icon: CalendarIcon, path: '/admin/agenda/full' }
      ]
    },
    {
      label: t('nav.clients'),
      icon: UsersIcon,
      children: [
        { label: t('nav.statusNewApplications') || 'Status of New Applications', icon: ClipboardDocumentListIcon, path: '/admin/waiting-list' },
        { label: t('nav.addClient') || 'Add Client', icon: UsersIcon, path: '/admin/clients/new' },
        { label: t('nav.allClients') || 'All Clients', icon: UsersIcon, path: '/admin/clients' },
        { label: t('nav.clientDashboardSettings') || 'Client Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/clients/settings' },
        { label: t('nav.clientInvoices') || 'Client Invoices', icon: DocumentTextIcon, path: '/admin/clients/invoices' },
        { label: t('nav.clientAgreementForms') || 'Client Agreement Forms', icon: DocumentTextIcon, path: '/admin/clients/agreements' },
        { label: t('nav.dashboardSettings') || 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/clients/dashboard-settings' },
        { label: t('nav.statistics') || 'Statistics', icon: ChartBarIcon, path: '/admin/clients/statistics' }
      ]
    },
    {
      label: t('nav.therapists'),
      icon: UserGroupIcon,
      children: [
        { label: t('nav.statusInOutOffices') || 'Status of In/Out Offices', icon: BuildingOfficeIcon, path: '/admin/therapists/status' },
        { label: t('nav.allTherapists') || 'All Therapists', icon: UserGroupIcon, path: '/admin/therapists' },
        { label: t('nav.addTherapist') || 'Add Therapist', icon: UserGroupIcon, path: '/admin/therapists/new' },
        { label: t('nav.therapistDashboardSettings') || 'Therapist Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/therapists/settings' },
        { label: t('nav.therapistInvoices') || 'Therapist Invoices', icon: DocumentTextIcon, path: '/admin/therapists/invoices' },
        { label: t('nav.therapistContracts') || 'Therapist Contracts', icon: DocumentTextIcon, path: '/admin/therapists/contracts' },
        { label: t('nav.dashboardSettings') || 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/therapists/dashboard-settings' },
        { label: t('nav.statistics') || 'Statistics', icon: ChartBarIcon, path: '/admin/therapists/statistics' }
      ]
    },
    {
      label: t('nav.financial'),
      icon: CurrencyEuroIcon,
      children: [
        { label: t('nav.totalRevenueDashboard') || 'Total Revenue Dashboard', icon: ChartBarIcon, path: '/admin/financial' },
        { label: t('nav.totalClientRevenue') || 'Total Client Revenue', icon: CurrencyEuroIcon, path: '/admin/financial/client-revenue' },
        { label: t('nav.totalTherapistCost') || 'Total Therapist Cost', icon: CurrencyEuroIcon, path: '/admin/financial/therapist-cost' },
        { label: t('nav.allUnpaidInvoices') || 'All Unpaid Invoices', icon: DocumentTextIcon, path: '/admin/financial/unpaid-invoices' },
        { label: t('nav.invoiceSettings') || 'Invoice Settings', icon: Cog6ToothIcon, path: '/admin/financial/invoice-settings' },
        { label: t('nav.settings'), icon: Cog6ToothIcon, path: '/admin/financial/settings' },
        { label: t('nav.statistics') || 'Statistics', icon: ChartBarIcon, path: '/admin/financial/statistics' }
      ]
    },
    {
      label: t('nav.messageCenter') || 'Message Center',
      icon: ChatBubbleLeftRightIcon,
      children: [
        { label: t('nav.myMessages') || 'My Messages', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/my' },
        { label: t('nav.fullMessages') || 'Full Messages', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/all' },
        { label: t('nav.sendMessage') || 'Send Message', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/new' },
        { label: t('nav.sendEmail') || 'Send E-mail', icon: ChatBubbleLeftRightIcon, path: '/admin/messages/email' },
        { label: t('nav.dashboardSettings') || 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/messages/settings' }
      ]
    },
    {
      label: t('nav.phonebook') || 'Phonebook',
      icon: PhoneIcon,
      children: [
        { label: t('nav.addContacts') || 'Add Contacts', icon: PhoneIcon, path: '/admin/phonebook/add' },
        { label: t('nav.dashboardSettings') || 'Dashboard Settings', icon: Cog6ToothIcon, path: '/admin/phonebook/settings' }
      ]
    },
    {
      label: t('nav.educationalResources') || 'Educational Resources',
      icon: BookOpenIcon,
      children: [
        { label: t('nav.resourceLibrary') || 'Resource Library', icon: BookOpenIcon, path: '/admin/resources' },
        { label: t('nav.challenges'), icon: PuzzlePieceIcon, path: '/admin/challenges' },
        { label: t('nav.surveys'), icon: ClipboardDocumentCheckIcon, path: '/admin/surveys' }
      ]
    },
    {
      label: t('nav.adminCompanySettings') || 'Admin Company Settings',
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
        <div className="mb-8 flex items-center space-x-3">
          <img 
            src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154559/PraktijkEPD-3-logoo_jlagdx.svg"
            alt="PraktijkEPD Logo"
            className="w-10 h-10"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('company.name')}</h2>
            <p className="text-sm text-gray-600">{t('dashboard.adminPortal') || 'Admin Portal'}</p>
          </div>
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