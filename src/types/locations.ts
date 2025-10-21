/**
 * Location Constants
 * Available locations for appointments and sessions
 */

// Location enum
export enum Location {
  OFFICE = 'office',
  ONLINE = 'online',
  HOME_VISIT = 'home_visit'
}

// Location labels in Dutch and English
export const LOCATION_LABELS: Record<Location, { nl: string; en: string }> = {
  [Location.OFFICE]: { nl: 'Praktijk', en: 'Office' },
  [Location.ONLINE]: { nl: 'Online', en: 'Online' },
  [Location.HOME_VISIT]: { nl: 'Huisbezoek', en: 'Home Visit' }
};

// Array of location values for dropdowns
export const LOCATIONS = Object.values(Location);

// Helper function to get location label
export function getLocationLabel(location: string | Location, lang: 'nl' | 'en' = 'nl'): string {
  const locationKey = location as Location;
  return LOCATION_LABELS[locationKey]?.[lang] || location;
}
