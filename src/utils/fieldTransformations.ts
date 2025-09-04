// Field transformation utilities for therapist management
// Handles conversion between frontend (camelCase) and backend (snake_case) field names

// Mapping of frontend field names to backend field names
export const therapistFieldMapping: Record<string, string> = {
  // Basic info
  firstName: 'firstName',  // These stay the same
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  
  // Profile fields - need transformation
  consultationRate: 'hourly_rate',
  hourlyRate: 'hourly_rate',
  acceptingNewClients: 'accepts_new_clients',
  acceptsNewClients: 'accepts_new_clients',
  
  // Address fields
  streetAddress: 'street_address',
  postalCode: 'postal_code',
  city: 'city',
  country: 'country',
  
  // Professional info
  licenseNumber: 'license_number',
  bigNumber: 'big_number',
  kvkNumber: 'kvk_number',
  
  // Practice settings
  sessionDuration: 'session_duration',
  breakBetweenSessions: 'break_between_sessions',
  maxClients: 'max_clients',
  maxClientsPerDay: 'max_clients_per_day',
  
  // Experience and modalities
  yearsOfExperience: 'years_of_experience',
  onlineTherapy: 'online_therapy',
  inPersonTherapy: 'in_person_therapy',
  
  // Arrays (stay the same)
  specializations: 'specializations',
  languages: 'languages',
  qualifications: 'qualifications',
  
  // Text fields
  bio: 'bio',
  profilePhotoUrl: 'profile_photo_url'
};

// Transform frontend data to backend format
export const transformToBackend = (frontendData: Record<string, any>): Record<string, any> => {
  const backendData: Record<string, any> = {};
  
  Object.keys(frontendData).forEach(key => {
    const backendKey = therapistFieldMapping[key] || key;
    const value = frontendData[key];
    
    // Skip undefined or null values
    if (value !== undefined && value !== null) {
      backendData[backendKey] = value;
    }
  });
  
  return backendData;
};

// Transform backend data to frontend format
export const transformToFrontend = (backendData: Record<string, any>): Record<string, any> => {
  const reverseMapping: Record<string, string> = {};
  
  // Create reverse mapping
  Object.entries(therapistFieldMapping).forEach(([frontend, backend]) => {
    reverseMapping[backend] = frontend;
  });
  
  const frontendData: Record<string, any> = {};
  
  Object.keys(backendData).forEach(key => {
    const frontendKey = reverseMapping[key] || key;
    const value = backendData[key];
    
    if (value !== undefined && value !== null) {
      // Handle special cases
      if (frontendKey === 'consultationRate' && key === 'hourly_rate') {
        // Always use consultationRate for frontend consistency
        frontendData['consultationRate'] = value;
      } else if (frontendKey === 'acceptingNewClients' && key === 'accepts_new_clients') {
        // Always use acceptingNewClients for frontend consistency
        frontendData['acceptingNewClients'] = value;
      } else {
        frontendData[frontendKey] = value;
      }
    }
  });
  
  return frontendData;
};

// Separate user fields from profile fields for API calls
export const separateUserAndProfileData = (data: Record<string, any>) => {
  const userFields = ['firstName', 'lastName', 'email', 'phone', 'status'];
  const userData: Record<string, any> = {};
  const profileData: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (userFields.includes(key)) {
      userData[key] = value;
    } else {
      profileData[key] = value;
    }
  });
  
  return {
    userData,
    profileData: transformToBackend(profileData)
  };
};