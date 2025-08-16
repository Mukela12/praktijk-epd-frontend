# PraktijkEPD Backend-Frontend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Role-Based Operations](#role-based-operations)
4. [API Endpoints by Feature](#api-endpoints-by-feature)
5. [Missing Endpoints & Implementation Status](#missing-endpoints--implementation-status)
6. [Operation Flows](#operation-flows)
7. [Theme & UI Consistency](#theme--ui-consistency)
8. [Testing Guide](#testing-guide)

## Overview

This guide documents the complete integration between the PraktijkEPD frontend and backend systems, including all CRUD operations, role-based access, and feature implementations.

### System Architecture
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io (for messaging - pending implementation)

### User Roles
1. **Admin**: Full system management
2. **Therapist**: Client sessions and therapy management
3. **Client**: Personal portal and appointments
4. **Assistant**: Administrative support
5. **Bookkeeper**: Financial management
6. **Substitute**: Temporary therapist access

## Authentication Flow

### Login Process
```typescript
// Frontend: realApi.ts
POST /api/auth/login
Body: { email, password }
Response: { accessToken, refreshToken, user }

// Store tokens
localStorage.setItem('accessToken', response.accessToken)
localStorage.setItem('refreshToken', response.refreshToken)
```

### Token Refresh
```typescript
POST /api/auth/refresh
Headers: { Authorization: 'Bearer <refreshToken>' }
Response: { accessToken, refreshToken }
```

### Logout
```typescript
POST /api/auth/logout
Headers: { Authorization: 'Bearer <accessToken>' }
```

## Role-Based Operations

### Admin Operations

#### 1. Client Management (CRUD)
```typescript
// List all clients
GET /api/admin/clients
Query params: ?status=active&page=1&limit=10&search=john

// Create client (inline form, no modal)
POST /api/admin/users
Body: {
  email: string,
  password: string, // Temporary, user must change
  firstName: string,
  lastName: string,
  phone: string,
  role: 'client',
  additionalData: {
    dateOfBirth: string,
    address: string,
    city: string,
    postalCode: string,
    therapistId: string,
    insuranceCompany: string,
    insuranceNumber: string,
    therapyType: string,
    urgencyLevel: string,
    reasonForTherapy: string,
    referredBy: string,
    emergencyContactName: string,
    emergencyContactPhone: string,
    notes: string
  }
}

// Update client
PUT /api/admin/users/:userId
Body: { ...updated fields }

// Delete client
DELETE /api/admin/users/:userId

// Get client details
GET /api/admin/users/:userId
```

#### 2. Therapist Management
```typescript
// List all therapists
GET /api/admin/therapists
Query params: ?status=active&specialization=anxiety

// Create therapist
POST /api/admin/users
Body: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'therapist',
  additionalData: {
    licenseNumber: string,
    specializations: string[], // Now "therapies"
    maxClientsPerDay: number
  }
}
```

#### 3. Therapy & Psychological Problems Management
```typescript
// Therapies (Therapieën)
GET /api/admin/therapies
POST /api/admin/therapies
Body: {
  name: string,
  description: string,
  category: string,
  isActive: boolean
}
PUT /api/admin/therapies/:id
DELETE /api/admin/therapies/:id

// Psychological Problems (Hulpvragen)
GET /api/admin/psychological-problems
POST /api/admin/psychological-problems
Body: {
  name: string,
  description: string,
  category: string,
  severity: 'mild' | 'moderate' | 'severe',
  isActive: boolean
}
PUT /api/admin/psychological-problems/:id
DELETE /api/admin/psychological-problems/:id
```

#### 4. Resources Management
```typescript
// List resources
GET /api/resources?role=admin
Query params: ?category=anxiety&type=article&page=1&limit=10

// Create resource
POST /api/resources
Body: {
  title: string,
  description: string,
  shortDescription: string,
  type: 'article' | 'video' | 'document' | 'exercise',
  category: string,
  contentUrl?: string,
  contentBody?: string,
  targetAudience: string[],
  tags: string[],
  duration?: number,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

// Update resource
PUT /api/resources/:id

// Delete resource
DELETE /api/resources/:id

// Assign resource to client
POST /api/resources/:id/assign
Body: {
  clientId: string,
  assignedBy: string,
  notes?: string
}
```

#### 5. Challenges Management
```typescript
// List challenges
GET /api/challenges?role=admin

// Create challenge
POST /api/challenges
Body: {
  title: string,
  description: string,
  shortDescription: string,
  category: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  duration: number, // days
  points: number,
  tasks: Array<{
    day: number,
    title: string,
    description: string,
    requiredProof?: string
  }>,
  rewards?: Array<{
    type: string,
    value: string,
    description: string
  }>
}

// Assign challenge to client
POST /api/challenges/:id/assign
Body: {
  clientId: string,
  startDate: string
}
```

#### 6. Surveys Management
```typescript
// List surveys
GET /api/surveys?role=admin

// Create survey
POST /api/surveys
Body: {
  title: string,
  description: string,
  type: 'progress' | 'satisfaction' | 'intake' | 'feedback',
  purpose: string,
  questions: Array<{
    questionId: string,
    type: 'text' | 'number' | 'scale' | 'multipleChoice' | 'checkbox',
    question: string,
    required: boolean,
    options?: string[],
    scaleMin?: number,
    scaleMax?: number,
    scaleLabels?: { min: string, max: string }
  }>,
  frequency?: 'once' | 'weekly' | 'monthly',
  status: 'draft' | 'published'
}

// Assign survey to client
POST /api/surveys/:id/assign
Body: {
  clientId: string,
  dueDate?: string,
  recurringSchedule?: {
    frequency: 'weekly' | 'monthly',
    startDate: string,
    endDate?: string
  }
}
```

### Therapist Operations

#### 1. Client Management
```typescript
// Get assigned clients
GET /api/therapist/clients
Query params: ?status=active

// Get client details
GET /api/therapist/clients/:clientId

// Update client treatment
PUT /api/therapist/clients/:clientId/treatment
Body: {
  therapyGoals: string[],
  treatmentPlan: string,
  progressNotes: string
}
```

#### 2. Appointments
```typescript
// Get appointments
GET /api/therapist/appointments
Query params: ?date=2025-08-08&status=scheduled

// Create appointment
POST /api/therapist/appointments
Body: {
  clientId: string,
  date: string,
  time: string,
  duration: number,
  type: 'therapy' | 'intake' | 'follow_up',
  location: 'office' | 'online' | 'phone',
  notes?: string
}

// Update appointment
PUT /api/therapist/appointments/:id

// Cancel appointment
PUT /api/therapist/appointments/:id/cancel
```

#### 3. Profile Management
```typescript
// Get profile
GET /api/therapist/profile

// Update profile
PUT /api/therapist/profile
Body: {
  bio: string,
  therapies: string[], // Selected from admin-managed list
  psychologicalProblems: string[], // Selected from admin-managed list
  maxClientsPerDay: number,
  availability: {
    monday: { start: string, end: string, available: boolean },
    // ... other days
  }
}
```

### Client Operations

#### 1. Appointments
```typescript
// Get my appointments
GET /api/client/appointments

// Request appointment
POST /api/client/appointments/request
Body: {
  preferredDates: string[],
  preferredTimes: string[],
  type: string,
  urgency: string,
  notes?: string
}

// Cancel appointment
PUT /api/client/appointments/:id/cancel
```

#### 2. Resources
```typescript
// Get assigned resources
GET /api/client/resources
GET /api/resources?assignedToMe=true

// Update resource progress
POST /api/client/resources/progress
Body: {
  resourceId: string,
  progress: number, // 0-100
  completed: boolean,
  notes?: string
}
```

#### 3. Challenges
```typescript
// Get my challenges
GET /api/challenges/client/assigned

// Join challenge
POST /api/challenges/client/join
Body: {
  challengeId: string
}

// Update challenge progress
POST /api/challenges/client/progress
Body: {
  challengeId: string,
  taskId: string,
  completed: boolean,
  proofUrl?: string,
  notes?: string
}
```

#### 4. Surveys
```typescript
// Get assigned surveys
GET /api/surveys/client/assigned

// Submit survey response
POST /api/surveys/client/responses
Body: {
  surveyId: string,
  responses: Array<{
    questionId: string,
    answer: any // Based on question type
  }>
}
```

#### 5. Profile & Settings
```typescript
// Get profile
GET /api/client/profile

// Update profile
PUT /api/client/profile
Body: {
  phone?: string,
  emergencyContact?: {
    name: string,
    phone: string,
    relationship: string
  },
  preferences?: {
    language: string,
    communicationPreference: string
  }
}

// Request address change
POST /api/client/address-change
Body: {
  newAddress: string,
  newCity: string,
  newPostalCode: string,
  effectiveDate: string,
  reason: string
}
```

### Assistant Operations

#### 1. Support Tickets
```typescript
// Get tickets
GET /api/assistant/support-tickets
Query params: ?status=new&priority=high

// Create ticket
POST /api/assistant/support-tickets
Body: {
  title: string,
  description: string,
  category: string,
  priority: 'low' | 'medium' | 'high',
  assignedTo?: string
}

// Update ticket
PUT /api/assistant/support-tickets/:id
```

#### 2. Appointment Coordination
```typescript
// Get therapist availability
GET /api/assistant/therapists/availability
Query params: ?date=2025-08-09&therapistId=xxx&duration=60

// Schedule appointment
POST /api/assistant/appointments
Body: {
  clientId: string,
  therapistId: string,
  date: string,
  time: string,
  duration: number,
  type: string
}
```

### Bookkeeper Operations

#### 1. Invoice Management
```typescript
// Get invoices
GET /api/bookkeeper/invoices
Query params: ?status=unpaid&dateFrom=2025-01-01

// Update invoice
PUT /api/bookkeeper/invoices/:id
Body: {
  status: 'paid' | 'partially_paid',
  paidAmount?: number,
  paymentDate?: string,
  paymentMethod?: string
}

// Export invoices
GET /api/bookkeeper/invoices/export
Query params: ?format=csv&dateFrom=2025-01-01&dateTo=2025-12-31
```

## Missing Endpoints & Implementation Status

### Currently Missing in Backend:
1. **Real-time Messaging** (Socket.io)
   - `/api/messages/send`
   - `/api/messages/history`
   - WebSocket events for real-time updates

2. **Admin Endpoints**:
   - `/api/admin/therapies` (CRUD)
   - `/api/admin/psychological-problems` (CRUD)
   
3. **File Upload**:
   - `/api/upload/document`
   - `/api/upload/image`

4. **Notifications**:
   - `/api/notifications`
   - `/api/notifications/preferences`

### Endpoints Returning 501 (Not Implemented):
- `/api/admin/reports/users`
- `/api/client/notes`
- `/api/assistant/clients` (full list)

## Operation Flows

### 1. Adding a Client (Admin)
```
1. Admin navigates to /dashboard/admin/client-management
2. Clicks "Add Client" button
3. View changes to inline create form (no modal)
4. Admin fills in:
   - Basic information
   - Assigns therapist
   - Insurance details
   - Emergency contact
5. Submits form → POST /api/admin/users
6. Backend creates user with temporary password
7. Sends welcome email to client
8. Updates client list view
```

### 2. Creating and Assigning a Resource (Admin/Therapist)
```
1. Admin/Therapist navigates to Resources section
2. Clicks "Create Resource"
3. Fills inline form with:
   - Title, description
   - Type (article/video/document)
   - Category and tags
   - Content (URL or body)
4. Submits → POST /api/resources
5. To assign to client:
   - Select resource from list
   - Click "Assign to Client"
   - Select client(s)
   - Add notes
   - Submit → POST /api/resources/:id/assign
```

### 3. Client Completing a Survey
```
1. Client sees assigned surveys in dashboard
2. Clicks on survey to open
3. Answers all questions
4. Submits → POST /api/surveys/client/responses
5. Therapist can view responses
6. Analytics updated automatically
```

### 4. Challenge Assignment and Progress
```
1. Therapist assigns challenge to client
   → POST /api/challenges/:id/assign
2. Client sees challenge in dashboard
3. Client joins challenge
   → POST /api/challenges/client/join
4. Daily tasks appear
5. Client completes tasks
   → POST /api/challenges/client/progress
6. Progress tracked and points awarded
```

## Theme & UI Consistency

### Design System
- **Primary Colors**: Blue (#3B82F6) for primary actions
- **Role Colors**:
  - Admin: Blue gradient
  - Therapist: Green/Teal gradient
  - Client: Purple gradient
  - Assistant: Orange gradient
  - Bookkeeper: Indigo gradient

### Component Patterns
1. **InlineCrudLayout**: Used for all CRUD operations
2. **PremiumLayout**: Consistent card and button styles
3. **StatusBadge**: Consistent status indicators
4. **DataTable**: Unified table component with sorting/filtering

### Form Patterns
- All forms use inline editing (no modals)
- Consistent validation and error messages
- Loading states with spinners
- Success/error notifications via toast

## Testing Guide

### 1. Test User Credentials
```javascript
// From backend test file
admin: admin@praktijkepd.nl / Admin123!@#
therapist: emma.dejong@example.com / TherapistPass123!
client: client@example.com / ClientPass123!
assistant: sophie.williams@example.com / AssistantPass123!
bookkeeper: lucas.martin@example.com / BookkeeperPass123!
```

### 2. Testing CRUD Operations
For each role, test:
1. **Create**: Add new records via inline forms
2. **Read**: View lists with filtering/sorting
3. **Update**: Edit existing records inline
4. **Delete**: Remove records with confirmation

### 3. Integration Testing
1. Run backend: `npm run dev` in backend directory
2. Run frontend: `npm run dev` in frontend directory
3. Execute test suite: `node comprehensive-backend-test-full.js`
4. Check console for any 404/500 errors
5. Verify data persistence across sessions

### 4. Key Test Scenarios
1. **Client Registration Flow**:
   - Admin creates client
   - Client receives email
   - Client logs in and changes password
   - Client completes intake form

2. **Resource Assignment**:
   - Admin/Therapist creates resource
   - Assigns to client
   - Client views and completes resource
   - Progress tracked in system

3. **Survey Workflow**:
   - Admin creates survey
   - Therapist assigns to client
   - Client completes survey
   - Results visible to therapist

## Common Issues & Solutions

### 1. Authentication Errors
- **401 Unauthorized**: Token expired, refresh needed
- **403 Forbidden**: Role doesn't have permission
- Solution: Check token validity and user role

### 2. CORS Issues
- Ensure backend allows frontend origin
- Check `cors` middleware configuration

### 3. Missing Data
- Some endpoints return empty arrays for new accounts
- Populate test data using admin interface

### 4. Rate Limiting
- Backend has rate limiting (100 requests/15 min)
- Add delays between bulk operations

## Next Steps

1. **Implement Missing Endpoints**:
   - Therapies and Psychological Problems APIs
   - Real-time messaging with Socket.io
   - File upload functionality

2. **Complete UI Components**:
   - Resources management screens
   - Challenges management screens
   - Survey builder interface

3. **Add Real-time Features**:
   - Live notifications
   - Real-time messaging
   - Live appointment updates

4. **Enhance Error Handling**:
   - Better error messages
   - Retry mechanisms
   - Offline support

5. **Performance Optimization**:
   - Implement caching
   - Lazy loading for large lists
   - Image optimization

## API Response Format

All API responses follow this format:
```typescript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Error Codes
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Invalid/expired token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **429**: Too Many Requests - Rate limited
- **500**: Internal Server Error
- **501**: Not Implemented - Feature pending