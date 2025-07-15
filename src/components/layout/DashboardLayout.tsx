import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation, LanguageSwitcher } from '@/contexts/LanguageContext';
import { UserRole } from '@/types/auth';
import { ROLE_COLORS } from '@/types/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  current?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, getDisplayName, getRoleColor } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Navigation items based on user role
  const getNavigationItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        name: 'Dashboard',
        nameKey: 'nav.dashboard',
        href: getDashboardPath(),
        icon: HomeIcon,
        roles: [UserRole.ADMIN, UserRole.THERAPIST, UserRole.CLIENT, UserRole.ASSISTANT, UserRole.BOOKKEEPER, UserRole.SUBSTITUTE],
      },
      {
        name: 'Calendar',
        nameKey: 'nav.calendar',
        href: `${getRoleBasePath()}/calendar`,
        icon: CalendarIcon,
        roles: [UserRole.ADMIN, UserRole.THERAPIST, UserRole.CLIENT, UserRole.ASSISTANT, UserRole.SUBSTITUTE],
      },
    ];

    // Role-specific navigation
    const roleSpecificItems: NavItem[] = [];

    if (user?.role === UserRole.ADMIN) {
      roleSpecificItems.push(
        {
          name: 'Clients',
          nameKey: 'nav.clients',
          href: '/admin/clients',
          icon: UsersIcon,
          roles: [UserRole.ADMIN],
        },
        {
          name: 'Therapists',
          nameKey: 'nav.therapists',
          href: '/admin/therapists',
          icon: UserGroupIcon,
          roles: [UserRole.ADMIN],
        },
        {
          name: 'Waiting List',
          nameKey: 'nav.waitingList',
          href: '/admin/waiting-list',
          icon: ClipboardDocumentListIcon,
          roles: [UserRole.ADMIN],
        },
        {
          name: 'Financial',
          nameKey: 'nav.financial',
          href: '/admin/financial',
          icon: CurrencyDollarIcon,
          roles: [UserRole.ADMIN],
        },
        {
          name: 'Reports',
          nameKey: 'nav.reports',
          href: '/admin/reports',
          icon: ChartBarIcon,
          roles: [UserRole.ADMIN],
        }
      );
    }

    if (user?.role === UserRole.THERAPIST || user?.role === UserRole.SUBSTITUTE) {
      roleSpecificItems.push(
        {
          name: 'My Clients',
          nameKey: 'nav.myClients',
          href: '/therapist/clients',
          icon: UsersIcon,
          roles: [UserRole.THERAPIST, UserRole.SUBSTITUTE],
        },
        {
          name: 'Appointments',
          nameKey: 'nav.appointments',
          href: '/therapist/appointments',
          icon: CalendarIcon,
          roles: [UserRole.THERAPIST, UserRole.SUBSTITUTE],
        }
      );
    }

    if (user?.role === UserRole.CLIENT) {
      roleSpecificItems.push(
        {
          name: 'My Appointments',
          nameKey: 'nav.myAppointments',
          href: '/client/appointments',
          icon: CalendarIcon,
          roles: [UserRole.CLIENT],
        },
        {
          name: 'My Therapist',
          nameKey: 'nav.myTherapist',
          href: '/client/therapist',
          icon: UserCircleIcon,
          roles: [UserRole.CLIENT],
        }
      );
    }

    // Common items for all roles
    const commonItems: NavItem[] = [
      {
        name: 'Messages',
        nameKey: 'nav.messages',
        href: `${getRoleBasePath()}/messages`,
        icon: ChatBubbleLeftIcon,
        roles: [UserRole.ADMIN, UserRole.THERAPIST, UserRole.CLIENT, UserRole.ASSISTANT, UserRole.SUBSTITUTE],
      },
    ];

    // Settings (available to all)
    const settingsItems: NavItem[] = [
      {
        name: 'Settings',
        nameKey: 'nav.settings',
        href: `${getRoleBasePath()}/settings`,
        icon: Cog6ToothIcon,
        roles: [UserRole.ADMIN, UserRole.THERAPIST, UserRole.CLIENT, UserRole.ASSISTANT, UserRole.BOOKKEEPER, UserRole.SUBSTITUTE],
      },
    ];

    return [...baseItems, ...roleSpecificItems, ...commonItems, ...settingsItems].filter(item =>
      item.roles.includes(user?.role || UserRole.CLIENT)
    );
  };

  const getDashboardPath = (): string => {
    if (!user) return '/';
    return `${getRoleBasePath()}/dashboard`;
  };

  const getRoleBasePath = (): string => {
    if (!user) return '';
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.THERAPIST:
      case UserRole.SUBSTITUTE:
        return '/therapist';
      case UserRole.CLIENT:
        return '/client';
      case UserRole.ASSISTANT:
        return '/assistant';
      case UserRole.BOOKKEEPER:
        return '/bookkeeper';
      default:
        return '/';
    }
  };

  const navigationItems = getNavigationItems().map(item => ({
    ...item,
    current: location.pathname === item.href || location.pathname.startsWith(item.href + '/'),
  }));

  const roleColors = user?.role ? ROLE_COLORS[user.role] : ROLE_COLORS[UserRole.CLIENT];
  
  // Color mapping for different roles
  const getLogoColorClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-gradient-to-r from-blue-600 to-blue-700';
      case UserRole.THERAPIST:
        return 'bg-gradient-to-r from-green-600 to-green-700';
      case UserRole.CLIENT:
        return 'bg-gradient-to-r from-purple-600 to-purple-700';
      case UserRole.ASSISTANT:
        return 'bg-gradient-to-r from-indigo-600 to-indigo-700';
      case UserRole.BOOKKEEPER:
        return 'bg-gradient-to-r from-orange-600 to-orange-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const getActiveColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '#3B82F6';
      case UserRole.THERAPIST:
        return '#10B981';
      case UserRole.CLIENT:
        return '#8B5CF6';
      case UserRole.ASSISTANT:
        return '#6366F1';
      case UserRole.BOOKKEEPER:
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to={getDashboardPath()} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getLogoColorClass(user?.role || UserRole.CLIENT)}`}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">PraktijkEPD</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={item.current ? { backgroundColor: getActiveColor(user?.role || UserRole.CLIENT) } : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {t(item.nameKey)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <Link to={getDashboardPath()} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getLogoColorClass(user?.role || UserRole.CLIENT)}`}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">PraktijkEPD</span>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={item.current ? { backgroundColor: getActiveColor(user?.role || UserRole.CLIENT) } : undefined}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {t(item.nameKey)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Notifications */}
              <button className="text-gray-400 hover:text-gray-600 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Language switcher */}
              <LanguageSwitcher />

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className={`text-xs ${getRoleColor()}`}>
                    {t(`role.${user?.role?.toLowerCase() || 'client'}`)}
                  </p>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center text-gray-400 hover:text-gray-600">
                    <UserCircleIcon className="w-8 h-8" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to={`${getRoleBasePath()}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircleIcon className="w-4 h-4 mr-3" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to={`${getRoleBasePath()}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        {t('nav.settings')}
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        {t('auth.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;