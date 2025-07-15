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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  {t('company.name')}
                </span>
                <span className="text-xs text-gray-600 -mt-1">
                  {t('company.description')}
                </span>
              </div>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher className="ml-auto" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/50 backdrop-blur-md border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © {currentYear} {t('company.name')}. {t('company.copyright')}.
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6 text-sm">
              <a 
                href="/privacy" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Terms of Service
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
          <div className="w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;