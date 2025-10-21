/**
 * Location Constants
 * Available locations for appointments across Netherlands
 */

// Exact list of 17 locations matching backend validation
export const LOCATIONS = [
  'Amsterdam',
  'Amsterdam IJburg',
  'Amsterdam Zuid',
  'Bergeijk',
  'Den Haag',
  'Hillegom',
  'Hilversum',
  'Maastricht',
  'Nunspeet',
  'Online',
  'Online EMDR therapie',
  'Online Yoga',
  'Oosterhout',
  'Purmerend',
  'Utrecht (Tineke)',
  'Valkenburg/Leiden',
  'Woerdense Verlaat'
] as const;

export type LocationType = typeof LOCATIONS[number];

// Helper function to get location label (already in proper format)
export function getLocationLabel(location: string, lang: 'nl' | 'en' = 'nl'): string {
  // Locations are already in Dutch, return as-is for Dutch
  // For English, you could add translations here if needed
  return location;
}
