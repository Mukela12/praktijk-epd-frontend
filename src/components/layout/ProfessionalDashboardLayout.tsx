import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation, LanguageSwitcher } from '@/contexts/LanguageContext';
import AdminSidebar from './AdminSidebar';
import { Transition } from '@headlessui/react';

interface ProfessionalDashboardLayoutProps {
  children?: React.ReactNode;
}

const ProfessionalDashboardLayout: React.FC<ProfessionalDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Get role-specific sidebar component
  const getSidebarComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminSidebar />;
      // Add other role sidebars here
      default:
        return <AdminSidebar />; // Fallback for now
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={React.Fragment}>
        <div className="relative z-50 lg:hidden">
          <Transition.Child
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                {getSidebarComponent()}
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {getSidebarComponent()}
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search bar */}
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
                name="search"
              />
            </form>

            {/* Right side items */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Language switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Help */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Help</span>
                <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </span>
                </button>

                {/* User menu dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left flex items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                      Your profile
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left flex items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboardLayout;