// Utility functions for consistent date and time formatting across the application

/**
 * Format date to a readable string (e.g., "Jan 15, 2024")
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date to a full readable string (e.g., "Monday, January 15, 2024")
 */
export const formatFullDate = (date: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time to 12-hour format (e.g., "2:30 PM")
 */
export const formatTime = (time: string): string => {
  if (!time) return '-';
  
  // Handle HH:MM format
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format date and time together (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (date: string | Date, time?: string): string => {
  if (!date) return '-';
  
  const formattedDate = formatDate(date);
  if (!time) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  const formattedTime = formatTime(time);
  return `${formattedDate} at ${formattedTime}`;
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const absDiffMins = Math.abs(diffMins);
  
  if (absDiffMins < 1) return 'just now';
  if (absDiffMins < 60) return `${absDiffMins} minute${absDiffMins !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : 'from now'}`;
  
  const diffHours = Math.round(absDiffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : 'from now'}`;
  
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : 'from now'}`;
  
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : 'from now'}`;
  
  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : 'from now'}`;
};

/**
 * Format currency (e.g., "€1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '€0.00';
  
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if date is in the past
 */
export const isPast = (date: string | Date): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: string | Date): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Get day of week (e.g., "Monday")
 */
export const getDayOfWeek = (date: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Format duration in minutes to readable string (e.g., "1h 30m")
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes < 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};