import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '@/contexts/LanguageContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-none">
                  {t('company.name')}
                </span>
                <span className="text-xs text-gray-600 leading-none">
                  {t('company.description')}
                </span>
              </div>
              <span className="sm:hidden text-lg font-bold text-gray-900">
                {t('company.name')}
              </span>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher className="ml-auto" />
          </div>
        </div>
      </header>

      {/* Main Content - Full height minus header and footer */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
        <div className="w-full max-w-lg max-h-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            {/* Copyright */}
            <div className="text-xs text-gray-600">
              © {currentYear} {t('company.name')}. {t('company.copyright')}.
            </div>

            {/* Links */}
            <div className="flex items-center space-x-4 text-xs">
              <a 
                href="/privacy" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Privacy
              </a>
              <a 
                href="/terms" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Terms
              </a>
              <a 
                href="/contact" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;