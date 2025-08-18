# PraktijkEPD API Documentation for Frontend Development

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Roles & Permissions](#user-roles--permissions)
4. [API Endpoints by Feature](#api-endpoints-by-feature)
5. [User Flow Implementations](#user-flow-implementations)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Overview

The PraktijkEPD backend provides a comprehensive API for managing therapy sessions, appointments, and client-therapist interactions. The API uses JWT-based authentication with role-based access control.

**Base URL**: `https://praktijk-epd-backend-production.up.railway.app/api`

## Authentication

### Login Flow

All users authenticate through the same endpoint, with role-specific features:

```javascript
POST /auth/login
Body: {
  email: string,
  password: string,
  twoFactorCode?: string // Required for admin and therapist roles
}

Response: {
  success: true,
  message: "Login successful",
  token: string, // JWT token - include in Authorization header
  user: {
    id: string,
    email: string,
    role: "admin" | "therapist" | "client" | "assistant" | "bookkeeper",
    firstName: string,
    lastName: string,
    isActive: boolean,
    isTwoFactorEnabled: boolean
  }
}
```

### Token Management

Include the JWT token in all authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

**Token Refresh**:
```javascript
POST /auth/refresh
// Refreshes the current token before expiration
```

## User Roles & Permissions

### Admin
- Full system access
- User management (create, edit, suspend, activate)
- Assign therapists to clients
- View all sessions and progress
- Manage resources, surveys, and challenges
- Approve address change requests

### Therapist
- View assigned clients
- Manage appointments and sessions
- Create and assign surveys/challenges
- View client progress
- Update specializations

### Client
- Book appointments
- View assigned therapist
- Complete surveys and challenges
- Access resources
- Submit address change requests

## API Endpoints by Feature

### 1. User Profile Management

#### Get Current User Profile
```javascript
GET /auth/me
// Returns the logged-in user's profile
```

#### Admin: User Management
```javascript
// Get all users with pagination
GET /admin/users?page=1&limit=10&role=therapist&search=john

// Get specific user
GET /admin/users/:userId

// Create new user
POST /admin/users
Body: {
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string,
  phone?: string
}

// Update user
PUT /admin/users/:userId
Body: {
  firstName?: string,
  lastName?: string,
  phone?: string,
  isActive?: boolean
}

// Suspend/Activate user
PUT /admin/users/:userId/status
Body: {
  isActive: boolean,
  reason?: string
}
```

#### Therapist Specializations
```javascript
// Update therapist specializations (max 5)
PUT /admin/therapists/:therapistId/specializations
Body: {
  specializations: ["anxiety", "depression", "trauma", "relationship_issues", "addiction"]
}

// Get therapist profile (public info)
GET /therapists/:therapistId
```

#### Address Change Requests
```javascript
// Client: Submit request
POST /client/address-change-request
Body: {
  type: "address" | "bank_account",
  newValue: string,
  reason: string
}

// Admin: Get all requests
GET /admin/address-change-requests

// Admin: Approve/Reject request
PUT /admin/address-change-requests/:requestId
Body: {
  status: "approved" | "rejected",
  adminNotes?: string
}
```

### 2. Appointment System

#### Client: Book Appointment

**Step 1: Create Appointment Request**
```javascript
POST /client/appointment-request
Body: {
  preferredDate: "YYYY-MM-DD",
  preferredTime: "HH:mm",
  problemDescription: string,
  urgency: "normal" | "urgent" | "emergency",
  preferredTherapistId?: string // Optional - if client wants specific therapist
}
```

**Step 2: Admin Assigns Therapist (if no preferred therapist)**
```javascript
// Admin: Get unassigned requests
GET /admin/appointment-requests

// Admin: Use smart pairing to get recommendations
POST /admin/smart-pairing/recommendations
Body: {
  clientId: string,
  preferredDate: string,
  preferredTime: string,
  problemDescription: string
}

// Admin: Assign therapist
PUT /admin/appointment-requests/:requestId/assign
Body: {
  therapistId: string
}
```

#### Therapist: Direct Appointment Creation
```javascript
POST /therapist/appointments
Body: {
  clientId: string,
  appointmentDate: "YYYY-MM-DDTHH:mm:ss.sssZ",
  startTime: "HH:mm",
  endTime: "HH:mm",
  therapyType: "individual" | "group" | "family",
  location: "office" | "online" | "phone",
  notes?: string
}
```

#### Appointment Management
```javascript
// Get appointments (filtered by role)
GET /appointments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// Update appointment
PUT /appointments/:appointmentId
Body: {
  status?: "scheduled" | "confirmed" | "cancelled" | "completed",
  notes?: string
}

// Cancel appointment
DELETE /appointments/:appointmentId

// Get calendar view
GET /appointments/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&view=month

// Get available slots for a therapist
GET /appointments/available-slots?therapistId=xxx&date=YYYY-MM-DD
```

#### Client: Check Therapist Availability
```javascript
GET /client/therapists/:therapistId/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns available time slots for booking
```

### 3. Session Management

Sessions are created from appointments when the therapist confirms client attendance.

#### Start Session
```javascript
POST /sessions/start
Body: {
  appointmentId: string,
  clientPresent: boolean,
  location: "office" | "online" | "phone",
  initialNotes?: string
}
```

#### During Session
```javascript
// Add progress notes
POST /sessions/:sessionId/progress
Body: {
  progressNotes: string,
  goalsDiscussed?: string,
  clientMoodStart?: number, // 1-10
  clientMoodEnd?: number,   // 1-10
  techniquesUsed?: string[]
}
```

#### End Session
```javascript
POST /sessions/:sessionId/end
Body: {
  summary: string,
  homework?: string,
  nextSessionRecommendation?: string,
  duration?: number // in minutes
}
```

#### View Sessions
```javascript
// Get session history
GET /sessions?clientId=xxx&therapistId=xxx&startDate=YYYY-MM-DD

// Get session statistics
GET /sessions/statistics?period=month

// Client: Get their session history
GET /client/sessions
```

### 4. Notification System

Notifications are sent for:
- New appointments
- Therapist assignments
- Survey/challenge assignments
- Session reminders

```javascript
// Get notifications
GET /notifications?unreadOnly=true

// Get unread count
GET /notifications/unread-count

// Mark as read
PUT /notifications/:notificationId/read

// Mark all as read
PUT /notifications/mark-all-read

// Get/Update notification preferences
GET /notifications/preferences
PUT /notifications/preferences
Body: {
  emailNotifications: boolean,
  appointmentReminders: boolean,
  surveyReminders: boolean,
  challengeReminders: boolean
}
```

### 5. Survey System

#### Therapist: Create and Assign Surveys

```javascript
// Create survey template
POST /surveys
Body: {
  title: string,
  description: string,
  questions: [
    {
      question: string,
      type: "text" | "multiple_choice" | "scale" | "yes_no",
      options?: string[], // for multiple choice
      required: boolean
    }
  ],
  isTemplate: boolean
}

// Get survey templates
GET /surveys/templates

// Assign survey to client
POST /surveys/assign
Body: {
  surveyId: string,
  clientId: string,
  dueDate?: string,
  notes?: string
}
```

#### Client: Complete Surveys

```javascript
// Get assigned surveys
GET /client/surveys?status=pending

// Submit survey response
POST /client/surveys/:surveyId/submit
Body: {
  responses: [
    {
      questionId: string,
      answer: string | number | boolean
    }
  ]
}
```

#### View Survey Results

```javascript
// Therapist: Get client's survey responses
GET /surveys/responses?clientId=xxx&surveyId=xxx

// Export survey responses
GET /surveys/:surveyId/export?format=pdf

// Admin: Get survey analytics
GET /admin/surveys/analytics
```

### 6. Challenge System

Challenges are daily tasks with timed check-ins.

#### Create and Assign Challenges

```javascript
// Create challenge
POST /challenges
Body: {
  title: string,
  description: string,
  category: "breathing" | "gratitude" | "mindfulness" | "exercise" | "social",
  durationMinutes: number,
  frequencyPerWeek: number,
  totalWeeks: number
}

// Assign to client
POST /challenges/assign
Body: {
  challengeId: string,
  clientId: string,
  startDate: string,
  customInstructions?: string
}
```

#### Client: Participate in Challenges

```javascript
// Get assigned challenges
GET /client/challenges?status=active

// Start daily check-in
POST /client/challenges/:challengeId/checkin
Body: {
  date: string
}
Response: {
  checkinId: string,
  timerStarted: boolean
}

// Complete check-in (after timer)
PUT /client/challenges/checkin/:checkinId/complete
Body: {
  notes?: string,
  moodRating?: number // 1-10
}

// Get challenge progress
GET /client/challenges/:challengeId/progress
```

### 7. Resource Management

Resources are educational materials (articles, videos, etc.).

#### Admin: Manage Resources

```javascript
// Create resource
POST /resources
Body: {
  title: string,
  content: string,
  category: string,
  type: "article" | "video" | "pdf" | "link",
  isPublic: boolean,
  tags?: string[]
}

// Update resource
PUT /resources/:resourceId

// Delete resource
DELETE /resources/:resourceId

// Assign to specific client
POST /resources/:resourceId/assign
Body: {
  clientId: string,
  notes?: string
}
```

#### Access Resources

```javascript
// Get resources (filtered by access)
GET /resources?category=anxiety&type=article

// Client: Get assigned resources
GET /client/resources

// Track engagement
POST /resources/:resourceId/track
Body: {
  action: "view" | "complete",
  timeSpent?: number // in seconds
}

// Get resource analytics
GET /admin/resources/analytics
```

### 8. Smart Pairing System

Helps admins match clients with suitable therapists.

```javascript
// Get therapist recommendations
POST /admin/smart-pairing/recommendations
Body: {
  clientId: string,
  preferredDate: string,
  preferredTime: string,
  problemDescription: string,
  urgency?: string
}

Response: {
  recommendations: [
    {
      therapistId: string,
      therapistName: string,
      matchScore: number, // 0-100
      matchReasons: string[],
      availability: boolean,
      specializations: string[]
    }
  ]
}

// Get pairing analytics
GET /admin/smart-pairing/analytics

// Calculate match score
POST /admin/smart-pairing/calculate-score
Body: {
  therapistId: string,
  clientId: string
}
```

## User Flow Implementations

### 1. First-Time Client Booking Flow

```javascript
// 1. Client submits appointment request
const requestData = {
  preferredDate: "2025-01-20",
  preferredTime: "14:00",
  problemDescription: "Experiencing anxiety and panic attacks",
  urgency: "normal"
};
const response = await axios.post('/api/client/appointment-request', requestData);

// 2. Admin receives notification and views request
const requests = await axios.get('/api/admin/appointment-requests');

// 3. Admin uses smart pairing for recommendations
const recommendations = await axios.post('/api/admin/smart-pairing/recommendations', {
  clientId: request.clientId,
  ...requestData
});

// 4. Admin assigns therapist
await axios.put(`/api/admin/appointment-requests/${requestId}/assign`, {
  therapistId: selectedTherapistId
});

// 5. Both client and therapist receive notifications
// Notifications are automatically created by the backend
```

### 2. Returning Client Booking with Previous Therapist

```javascript
// 1. Client checks therapist availability
const availability = await axios.get(
  `/api/client/therapists/${therapistId}/availability?startDate=2025-01-20&endDate=2025-01-27`
);

// 2. Client books appointment with preferred therapist
const booking = await axios.post('/api/client/appointment-request', {
  preferredDate: "2025-01-22",
  preferredTime: "15:00",
  problemDescription: "Follow-up session",
  urgency: "normal",
  preferredTherapistId: therapistId
});

// 3. Appointment is automatically created (no admin intervention needed)
```

### 3. Session Flow

```javascript
// 1. Therapist views today's appointments
const appointments = await axios.get('/api/appointments?date=' + today);

// 2. Client arrives, therapist starts session
const session = await axios.post('/api/sessions/start', {
  appointmentId: appointmentId,
  clientPresent: true,
  location: "office"
});

// 3. During session, add progress notes
await axios.post(`/api/sessions/${session.id}/progress`, {
  progressNotes: "Client showing improvement...",
  clientMoodStart: 5,
  clientMoodEnd: 7,
  techniquesUsed: ["CBT", "Mindfulness"]
});

// 4. End session
await axios.post(`/api/sessions/${session.id}/end`, {
  summary: "Productive session, worked on anxiety management techniques",
  homework: "Practice breathing exercises daily",
  duration: 50
});

// 5. Assign follow-up survey
await axios.post('/api/surveys/assign', {
  surveyId: anxietySurveyId,
  clientId: clientId,
  dueDate: nextWeek
});
```

### 4. Therapist Dashboard Implementation

```javascript
// Load dashboard data
async function loadTherapistDashboard() {
  // Check if assigned any clients
  const appointments = await axios.get('/api/appointments');
  
  if (appointments.data.length === 0) {
    // Show "No clients assigned" message
    showEmptyState("You haven't been assigned any clients yet. The administrator will assign clients to you based on your specializations and availability.");
    return;
  }
  
  // Load today's appointments
  const todayAppointments = await axios.get('/api/appointments?date=' + today);
  
  // Load notifications
  const notifications = await axios.get('/api/notifications?unreadOnly=true');
  
  // Load active sessions
  const activeSessions = await axios.get('/api/sessions?status=active');
  
  // Display dashboard with data
  displayDashboard({
    appointments: todayAppointments.data,
    notifications: notifications.data,
    activeSessions: activeSessions.data
  });
}
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  error: "Detailed error message",
  code: "ERROR_CODE" // e.g., "UNAUTHORIZED", "NOT_FOUND"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., time slot already booked)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Best Practices

### 1. Authentication
- Store JWT tokens securely (httpOnly cookies or secure storage)
- Implement token refresh before expiration
- Clear tokens on logout

### 2. Error Handling
```javascript
try {
  const response = await axios.get('/api/appointments');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show permission denied message
  } else {
    // Show generic error message
    console.error('API Error:', error.response?.data?.message);
  }
}
```

### 3. Loading States
Always implement loading states for better UX:
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await axios.get('/api/appointments');
    setData(response.data);
  } finally {
    setLoading(false);
  }
};
```

### 4. Pagination
Use pagination for list endpoints:
```javascript
const [page, setPage] = useState(1);
const limit = 10;

const fetchUsers = async () => {
  const response = await axios.get(`/api/admin/users?page=${page}&limit=${limit}`);
  // response.data includes: { users: [], total: 100, currentPage: 1, totalPages: 10 }
};
```

### 5. Real-time Updates
Consider implementing WebSocket connections for:
- Live notifications
- Session status updates
- Appointment changes

### 6. Date/Time Handling
- Always use ISO 8601 format for dates: `YYYY-MM-DD`
- Use 24-hour format for times: `HH:mm`
- Store and transmit in UTC, display in user's timezone

### 7. File Uploads
For resources and documents:
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Resource Title');

const response = await axios.post('/api/resources/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

## Security Considerations

1. **CORS**: The API is configured to accept requests from authorized frontends only
2. **Rate Limiting**: API has rate limits to prevent abuse (10,000 requests per 15 minutes)
3. **Input Validation**: All inputs are validated server-side
4. **SQL Injection**: Protected through parameterized queries
5. **XSS Protection**: All outputs are sanitized
6. **HTTPS**: Always use HTTPS in production

## Testing

Use the provided test credentials for development:
- Admin: `banturide5@gmail.com` (requires 2FA)
- Therapist: `codelibrary21@gmail.com` (requires 2FA)
- Client: `mukelathegreat@gmail.com`

## Support

For API issues or questions:
- Check the health endpoint: `GET /health`
- Review error messages and codes
- Contact the backend team with specific error details