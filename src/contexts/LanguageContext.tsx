import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LanguageContextType } from '@/types/auth';

// Translation strings
const translations = {
  // Authentication
  'auth.login': { en: 'Login', nl: 'Inloggen' },
  'auth.register': { en: 'Register', nl: 'Registreren' },
  'auth.logout': { en: 'Logout', nl: 'Uitloggen' },
  'auth.email': { en: 'Email', nl: 'E-mail' },
  'auth.password': { en: 'Password', nl: 'Wachtwoord' },
  'auth.confirmPassword': { en: 'Confirm Password', nl: 'Bevestig Wachtwoord' },
  'auth.firstName': { en: 'First Name', nl: 'Voornaam' },
  'auth.lastName': { en: 'Last Name', nl: 'Achternaam' },
  'auth.phone': { en: 'Phone', nl: 'Telefoon' },
  'auth.role': { en: 'Role', nl: 'Rol' },
  'auth.forgotPassword': { en: 'Forgot Password?', nl: 'Wachtwoord Vergeten?' },
  'auth.rememberDevice': { en: 'Remember this device', nl: 'Onthoud dit apparaat' },
  'auth.twoFactorCode': { en: 'Two-Factor Code', nl: 'Twee-Factor Code' },
  'auth.backupCode': { en: 'Backup Code', nl: 'Backup Code' },
  'auth.acceptTerms': { en: 'I accept the terms and conditions', nl: 'Ik accepteer de algemene voorwaarden' },
  
  // Roles
  'role.admin': { en: 'Administrator', nl: 'Beheerder' },
  'role.therapist': { en: 'Therapist', nl: 'Therapeut' },
  'role.client': { en: 'Client', nl: 'Cliënt' },
  'role.assistant': { en: 'Assistant', nl: 'Assistent' },
  'role.bookkeeper': { en: 'Bookkeeper', nl: 'Boekhouder' },
  'role.substitute': { en: 'Substitute', nl: 'Vervanger' },
  
  // Navigation
  'nav.dashboard': { en: 'Dashboard', nl: 'Dashboard' },
  'nav.clients': { en: 'Clients', nl: 'Cliënten' },
  'nav.therapists': { en: 'Therapists', nl: 'Therapeuten' },
  'nav.appointments': { en: 'Appointments', nl: 'Afspraken' },
  'nav.calendar': { en: 'Calendar', nl: 'Agenda' },
  'nav.messages': { en: 'Messages', nl: 'Berichten' },
  'nav.financial': { en: 'Financial', nl: 'Financieel' },
  'nav.reports': { en: 'Reports', nl: 'Rapporten' },
  'nav.settings': { en: 'Settings', nl: 'Instellingen' },
  'nav.profile': { en: 'Profile', nl: 'Profiel' },
  'nav.help': { en: 'Help', nl: 'Help' },
  'nav.waitingList': { en: 'Waiting List', nl: 'Wachtlijst' },
  'nav.myClients': { en: 'My Clients', nl: 'Mijn Cliënten' },
  'nav.myAppointments': { en: 'My Appointments', nl: 'Mijn Afspraken' },
  'nav.myTherapist': { en: 'My Therapist', nl: 'Mijn Therapeut' },
  
  // Common actions
  'action.save': { en: 'Save', nl: 'Opslaan' },
  'action.cancel': { en: 'Cancel', nl: 'Annuleren' },
  'action.edit': { en: 'Edit', nl: 'Bewerken' },
  'action.delete': { en: 'Delete', nl: 'Verwijderen' },
  'action.view': { en: 'View', nl: 'Bekijken' },
  'action.add': { en: 'Add', nl: 'Toevoegen' },
  'action.create': { en: 'Create', nl: 'Aanmaken' },
  'action.update': { en: 'Update', nl: 'Bijwerken' },
  'action.search': { en: 'Search', nl: 'Zoeken' },
  'action.filter': { en: 'Filter', nl: 'Filteren' },
  'action.export': { en: 'Export', nl: 'Exporteren' },
  'action.import': { en: 'Import', nl: 'Importeren' },
  'action.submit': { en: 'Submit', nl: 'Verzenden' },
  'action.confirm': { en: 'Confirm', nl: 'Bevestigen' },
  'action.close': { en: 'Close', nl: 'Sluiten' },
  'action.back': { en: 'Back', nl: 'Terug' },
  'action.next': { en: 'Next', nl: 'Volgende' },
  'action.previous': { en: 'Previous', nl: 'Vorige' },
  'action.loading': { en: 'Loading...', nl: 'Laden...' },
  
  // Status
  'status.active': { en: 'Active', nl: 'Actief' },
  'status.inactive': { en: 'Inactive', nl: 'Inactief' },
  'status.pending': { en: 'Pending', nl: 'In behandeling' },
  'status.suspended': { en: 'Suspended', nl: 'Geschorst' },
  'status.vacation': { en: 'Vacation', nl: 'Vakantie' },
  'status.completed': { en: 'Completed', nl: 'Voltooid' },
  'status.cancelled': { en: 'Cancelled', nl: 'Geannuleerd' },
  'status.scheduled': { en: 'Scheduled', nl: 'Gepland' },
  'status.confirmed': { en: 'Confirmed', nl: 'Bevestigd' },
  
  // Messages and notifications
  'message.success': { en: 'Operation completed successfully', nl: 'Bewerking succesvol voltooid' },
  'message.error': { en: 'An error occurred', nl: 'Er is een fout opgetreden' },
  'message.warning': { en: 'Please check the information', nl: 'Controleer de informatie' },
  'message.info': { en: 'Information', nl: 'Informatie' },
  'message.noData': { en: 'No data available', nl: 'Geen gegevens beschikbaar' },
  'message.loading': { en: 'Loading data...', nl: 'Gegevens laden...' },
  'message.confirmDelete': { en: 'Are you sure you want to delete this item?', nl: 'Weet u zeker dat u dit item wilt verwijderen?' },
  'message.unsavedChanges': { en: 'You have unsaved changes. Do you want to continue?', nl: 'U heeft niet-opgeslagen wijzigingen. Wilt u doorgaan?' },
  
  // Form validation
  'validation.required': { en: 'This field is required', nl: 'Dit veld is verplicht' },
  'validation.email': { en: 'Please enter a valid email address', nl: 'Voer een geldig e-mailadres in' },
  'validation.phone': { en: 'Please enter a valid phone number', nl: 'Voer een geldig telefoonnummer in' },
  'validation.password': { en: 'Password must be at least 8 characters', nl: 'Wachtwoord moet minimaal 8 karakters zijn' },
  'validation.passwordMatch': { en: 'Passwords do not match', nl: 'Wachtwoorden komen niet overeen' },
  'validation.minLength': { en: 'Minimum length is {0} characters', nl: 'Minimale lengte is {0} karakters' },
  'validation.maxLength': { en: 'Maximum length is {0} characters', nl: 'Maximale lengte is {0} karakters' },
  
  // Date and time
  'date.today': { en: 'Today', nl: 'Vandaag' },
  'date.tomorrow': { en: 'Tomorrow', nl: 'Morgen' },
  'date.yesterday': { en: 'Yesterday', nl: 'Gisteren' },
  'date.thisWeek': { en: 'This Week', nl: 'Deze Week' },
  'date.nextWeek': { en: 'Next Week', nl: 'Volgende Week' },
  'date.thisMonth': { en: 'This Month', nl: 'Deze Maand' },
  'date.nextMonth': { en: 'Next Month', nl: 'Volgende Maand' },
  
  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', nl: 'Welkom terug' },
  'dashboard.overview': { en: 'Overview', nl: 'Overzicht' },
  'dashboard.recentActivity': { en: 'Recent Activity', nl: 'Recente Activiteit' },
  'dashboard.upcomingAppointments': { en: 'Upcoming Appointments', nl: 'Komende Afspraken' },
  'dashboard.stats': { en: 'Statistics', nl: 'Statistieken' },
  
  // 2FA
  'twofa.setup': { en: 'Setup Two-Factor Authentication', nl: 'Twee-Factor Authenticatie Instellen' },
  'twofa.verify': { en: 'Verify Two-Factor Authentication', nl: 'Twee-Factor Authenticatie Verifiëren' },
  'twofa.disable': { en: 'Disable Two-Factor Authentication', nl: 'Twee-Factor Authenticatie Uitschakelen' },
  'twofa.scanQR': { en: 'Scan the QR code with your authenticator app', nl: 'Scan de QR-code met uw authenticator-app' },
  'twofa.enterCode': { en: 'Enter the 6-digit code from your authenticator app', nl: 'Voer de 6-cijferige code in van uw authenticator-app' },
  'twofa.backupCodes': { en: 'Backup Codes', nl: 'Backup Codes' },
  'twofa.saveBackupCodes': { en: 'Save these backup codes in a safe place', nl: 'Bewaar deze backup codes op een veilige plaats' },
  'twofa.saveBackupCodesTitle': { en: 'Save Your Backup Codes', nl: 'Bewaar Uw Backup Codes' },
  'twofa.completeSetup': { en: 'Complete Setup & Continue', nl: 'Setup Voltooien & Doorgaan' },
  'twofa.step1': { en: 'Step 1: Scan QR Code', nl: 'Stap 1: Scan QR Code' },
  'twofa.step2': { en: 'Step 2:', nl: 'Stap 2:' },
  'twofa.qrFailed': { en: 'QR code failed to load', nl: 'QR code laden mislukt' },
  'twofa.verifyEnable': { en: 'Verify and Enable 2FA', nl: 'Verifiëren en 2FA Inschakelen' },
  'twofa.useBackupCode': { en: 'Use backup code instead', nl: 'Gebruik backup code' },
  'twofa.useAuthenticator': { en: 'Use authenticator app instead', nl: 'Gebruik authenticator app' },
  'twofa.verifyCode': { en: 'Verify Code', nl: 'Code Verifiëren' },
  'twofa.verifyBackupCode': { en: 'Verify Backup Code', nl: 'Backup Code Verifiëren' },
  'twofa.welcomeBack': { en: 'Welcome Back', nl: 'Welkom Terug' },
  'twofa.signInAccount': { en: 'Sign in to your PraktijkEPD account', nl: 'Log in op uw PraktijkEPD account' },
  'twofa.emailAddress': { en: 'Email Address', nl: 'E-mailadres' },
  'twofa.password': { en: 'Password', nl: 'Wachtwoord' },
  'twofa.rememberDevice': { en: 'Remember this device', nl: 'Onthoud dit apparaat' },
  'twofa.forgotPassword': { en: 'Forgot your password?', nl: 'Wachtwoord vergeten?' },
  'twofa.createAccount': { en: 'Create Account', nl: 'Account Aanmaken' },
  'twofa.alreadyAccount': { en: "Don't have an account?", nl: 'Heeft u nog geen account?' },
  'twofa.signIn': { en: 'Sign In', nl: 'Inloggen' },
  'twofa.signing': { en: 'Signing in...', nl: 'Bezig met inloggen...' },
  'twofa.preferredLanguage': { en: 'Preferred Language', nl: 'Voorkeurstaal' },
  'twofa.createAccountSubtitle': { en: 'Create your PraktijkEPD account', nl: 'Maak uw PraktijkEPD account aan' },
  
  // Company info
  'company.name': { en: 'PraktijkEPD', nl: 'PraktijkEPD' },
  'company.description': { en: 'Therapy Practice Management', nl: 'Praktijk Management Systeem' },
  'company.copyright': { en: 'All rights reserved', nl: 'Alle rechten voorbehouden' },
  
  // Language selection
  'language.en': { en: 'English', nl: 'Engels' },
  'language.nl': { en: 'Dutch', nl: 'Nederlands' },
  'language.select': { en: 'Select Language', nl: 'Selecteer Taal' },
  
  // Theme
  'theme.light': { en: 'Light', nl: 'Licht' },
  'theme.dark': { en: 'Dark', nl: 'Donker' },
  'theme.system': { en: 'System', nl: 'Systeem' },
  
  // Accessibility
  'accessibility.menu': { en: 'Main menu', nl: 'Hoofdmenu' },
  'accessibility.skipToContent': { en: 'Skip to main content', nl: 'Ga naar hoofdinhoud' },
  'accessibility.closeDialog': { en: 'Close dialog', nl: 'Dialoog sluiten' },
  'accessibility.openMenu': { en: 'Open menu', nl: 'Menu openen' },
  'accessibility.loading': { en: 'Loading', nl: 'Laden' },
} as const;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Get language from localStorage or user preference
    const stored = localStorage.getItem('language') as LanguageCode;
    if (stored && [LanguageCode.EN, LanguageCode.NL].includes(stored)) {
      return stored;
    }
    
    // Get from environment or default to English
    const defaultLang = import.meta.env.VITE_DEFAULT_LANGUAGE as LanguageCode;
    return defaultLang || LanguageCode.EN;
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update meta tags if needed
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) {
      metaLang.setAttribute('content', lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    let text: string = translation[language] || translation.en;
    
    // Replace parameters in format {0}, {1}, etc. or {param}
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // Set initial HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper hook for translations
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

// Component for language switcher
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
        aria-label={t('language.select')}
      >
        <option value={LanguageCode.EN}>🇺🇸 {t('language.en')}</option>
        <option value={LanguageCode.NL}>🇳🇱 {t('language.nl')}</option>
      </select>
    </div>
  );
};

// Helper function to get role translation
export const getRoleTranslation = (role: string, language: LanguageCode): string => {
  const roleKey = `role.${role.toLowerCase()}`;
  const translation = translations[roleKey as keyof typeof translations];
  return translation ? translation[language] : role;
};

// Helper function to get status translation
export const getStatusTranslation = (status: string, language: LanguageCode): string => {
  const statusKey = `status.${status.toLowerCase()}`;
  const translation = translations[statusKey as keyof typeof translations];
  return translation ? translation[language] : status;
};

// Export translation keys for TypeScript support
export type TranslationKey = keyof typeof translations;