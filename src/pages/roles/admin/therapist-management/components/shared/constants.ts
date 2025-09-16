// Language mapping for therapist management
// Maps display names to database enum codes
export const LANGUAGE_OPTIONS = [
  { display: 'Dutch', code: 'nl' },
  { display: 'English', code: 'en' },
  { display: 'German', code: 'de' },
  { display: 'French', code: 'fr' },
  { display: 'Spanish', code: 'es' }
] as const;

// Therapy types mapping
export const THERAPY_TYPES = [
  { value: 'individual', label: 'Individual Therapy' },
  { value: 'group', label: 'Group Therapy' },
  { value: 'couple', label: 'Couples Therapy' },
  { value: 'family', label: 'Family Therapy' },
  { value: 'child', label: 'Child Therapy' }
] as const;

// Common specializations
export const COMMON_SPECIALIZATIONS = [
  'CBT (Cognitive Behavioral Therapy)',
  'EMDR',
  'Trauma Therapy',
  'Anxiety Disorders',
  'Depression',
  'Couples Therapy',
  'Family Therapy',
  'Child Psychology',
  'Addiction Counseling',
  'Grief Counseling'
] as const;

// Helper functions
export const getLanguageDisplay = (code: string): string => {
  const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
  return lang?.display || code;
};

export const getLanguageCode = (display: string): string | undefined => {
  const lang = LANGUAGE_OPTIONS.find(l => l.display === display);
  return lang?.code;
};