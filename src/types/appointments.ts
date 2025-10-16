/**
 * Appointment Types and Therapy Types Constants
 * Used for the booking flow and appointment management
 */

// Appointment type enum matching the backend
export enum AppointmentType {
  INTAKE = 'intake',
  INDIVIDUAL = 'individual',
  RELATION = 'relation',
  GROUP = 'group',
  FAMILY = 'family',
  CRISIS = 'crisis'
}

// Appointment type labels in Dutch and English
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, { nl: string; en: string }> = {
  [AppointmentType.INTAKE]: { nl: 'Intake/Kennismaking', en: 'Intake/Introduction' },
  [AppointmentType.INDIVIDUAL]: { nl: 'Individuele therapie', en: 'Individual therapy' },
  [AppointmentType.RELATION]: { nl: 'Relatietherapie', en: 'Relationship therapy' },
  [AppointmentType.GROUP]: { nl: 'Groepstherapie', en: 'Group therapy' },
  [AppointmentType.FAMILY]: { nl: 'Gezinstherapie', en: 'Family therapy' },
  [AppointmentType.CRISIS]: { nl: 'Crisistherapie', en: 'Crisis therapy' }
};

// Appointment durations (in minutes)
export const APPOINTMENT_DURATIONS: Record<AppointmentType, number[]> = {
  [AppointmentType.INTAKE]: [20], // Free intake session
  [AppointmentType.INDIVIDUAL]: [50, 80],
  [AppointmentType.RELATION]: [50, 80],
  [AppointmentType.GROUP]: [50, 80],
  [AppointmentType.FAMILY]: [50, 80],
  [AppointmentType.CRISIS]: [50, 80]
};

// Appointment pricing (intake is free)
export const APPOINTMENT_IS_FREE: Record<AppointmentType, boolean> = {
  [AppointmentType.INTAKE]: true,
  [AppointmentType.INDIVIDUAL]: false,
  [AppointmentType.RELATION]: false,
  [AppointmentType.GROUP]: false,
  [AppointmentType.FAMILY]: false,
  [AppointmentType.CRISIS]: false
};

// Therapy types/methods
export const THERAPY_TYPES = [
  'EMDR',
  'CGT (Cognitieve Gedragstherapie)',
  'Schematherapie',
  'ACT (Acceptance and Commitment Therapy)',
  'Psychodynamische therapie',
  'Systeemtherapie',
  'Mindfulness',
  'Oplossingsgerichte therapie',
  'Interpersoonlijke therapie',
  'Traumatherapie',
  'Speltherapie',
  'Gezinstherapie'
] as const;

export type TherapyType = typeof THERAPY_TYPES[number];

// Helper function to check if intake form is required
export function isIntakeFormRequired(appointmentType: AppointmentType): boolean {
  return appointmentType === AppointmentType.INTAKE;
}

// Helper function to get default duration for appointment type
export function getDefaultDuration(appointmentType: AppointmentType): number {
  const durations = APPOINTMENT_DURATIONS[appointmentType];
  return durations[0]; // Return first (default) duration
}

// Helper function to check if appointment type is free
export function isAppointmentFree(appointmentType: AppointmentType): boolean {
  return APPOINTMENT_IS_FREE[appointmentType];
}

// Helper function to get available durations for appointment type
export function getAvailableDurations(appointmentType: AppointmentType): number[] {
  return APPOINTMENT_DURATIONS[appointmentType];
}

// Helper function to format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} uur`;
  }
  return `${hours} uur ${remainingMinutes} min`;
}
