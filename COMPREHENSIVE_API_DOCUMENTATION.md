# PraktijkEPD Backend - Comprehensive API Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Test Flow Analysis](#test-flow-analysis)
- [Security Features](#security-features)
- [External Integrations](#external-integrations)
- [Development Guidelines](#development-guidelines)

## Project Overview

**PraktijkEPD Backend** is a comprehensive Electronic Patient Dossier (EPD) system designed for therapy practices. Built with Node.js, Express.js, TypeScript, and PostgreSQL, it provides a complete solution for managing therapists, clients, appointments, sessions, billing, and administrative tasks.

### Key Features

- **Multi-role user management** (Admin, Therapist, Client, Assistant, Bookkeeper, Substitute)
- **Comprehensive appointment system** with calendar integration
- **Session management** with progress tracking
- **Integrated payment system** (Mollie & Moneybird)
- **Resource and challenge management**
- **Survey system** for client feedback
- **Smart pairing algorithm** for therapist-client matching
- **Notification system**
- **Document management**
- **Advanced security** with 2FA, audit logging, and role-based access control

### Technology Stack

- **Backend Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT with refresh tokens
- **Security:** bcrypt, Helmet, CORS, rate limiting
- **File Storage:** Cloudinary
- **Payment Processing:** Mollie
- **Accounting Integration:** Moneybird
- **Email Service:** Nodemailer
- **Deployment:** Railway (Production)

## Architecture Overview

The backend follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────┐
│                 API Layer                       │
│  - Express Routes                               │
│  - Middleware (Auth, Validation, Rate Limiting) │
└─────────────────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────┐
│              Controller Layer                   │
│  - Business Logic                               │
│  - Request/Response Handling                    │
│  - Data Transformation                          │
└─────────────────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────┐
│               Service Layer                     │
│  - External API Integrations                   │
│  - Email Services                               │
│  - Payment Processing                           │
│  - Notification Services                        │
└─────────────────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────┐
│               Data Layer                        │
│  - Database Queries                             │
│  - Connection Pool Management                   │
│  - Transaction Handling                         │
└─────────────────────────────────────────────────┘
```

### Core Components

1. **Routes (`src/routes/*.ts`)**: Define API endpoints and their middleware
2. **Controllers (`src/controllers/*.ts`)**: Handle business logic for each endpoint
3. **Middleware (`src/middleware/*.ts`)**: Handle authentication, validation, and cross-cutting concerns
4. **Services (`src/services/*.ts`)**: Manage external integrations and complex business processes
5. **Config (`src/config/*.ts`)**: Database connections and third-party service configurations
6. **Types (`src/types/*.ts`)**: TypeScript type definitions

## Authentication & Authorization

### Authentication Flow

The system uses JWT (JSON Web Tokens) with refresh token rotation for secure authentication:

1. **Login Process:**
   ```
   Client Login Request → Validate Credentials → Check 2FA (if enabled) → Generate Tokens → Return Access + Refresh Token
   ```

2. **Token Refresh:**
   ```
   Refresh Token Request → Validate Refresh Token → Generate New Access Token → Return New Token
   ```

3. **Two-Factor Authentication:**
   - TOTP (Time-based One-Time Password) using `speakeasy`
   - QR code generation for mobile authenticator apps
   - Backup codes for account recovery
   - Required for admin and therapist roles

### User Roles & Permissions

#### Role Hierarchy
- **Admin**: Full system access
- **Therapist**: Client management, session notes, appointments
- **Assistant**: Administrative tasks, appointment scheduling
- **Bookkeeper**: Financial management, invoicing
- **Substitute**: Temporary therapist access
- **Client**: Personal data access, appointment booking

#### Permission Matrix

| Resource | Admin | Therapist | Assistant | Bookkeeper | Client |
|----------|-------|-----------|-----------|------------|--------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Client Data (All) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Client Data (Assigned) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appointments (All) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Appointments (Own) | ✅ | ✅ | ❌ | ❌ | ✅ |
| Financial Data | ✅ | ❌ | ❌ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

### Security Middleware

1. **`authMiddleware`**: Validates JWT tokens and attaches user to request
2. **`requireRole`**: Ensures user has required role(s)
3. **`requirePermission`**: Checks specific permissions
4. **`requireOwnershipOrAdmin`**: Ensures resource ownership or admin access
5. **`require2FA`**: Enforces two-factor authentication for sensitive operations

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### Public Endpoints (No Authentication Required)

##### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+31612345678",
  "role": "client",
  "preferredLanguage": "nl"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "client"
    }
  }
}
```

##### POST `/api/auth/login`
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorCode": "123456", // Optional, required if 2FA enabled
  "rememberDevice": false // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "client"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

##### POST `/api/auth/register-client`
Enhanced client registration with immediate appointment booking.

**Request Body:**
```json
{
  "email": "client@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "preferredCity": "Amsterdam",
  "appointmentRequest": {
    "preferredDate": "2024-01-15",
    "preferredTime": "14:00",
    "therapyType": "individual",
    "location": "office"
  },
  "problemDescription": "Anxiety and stress management"
}
```

##### POST `/api/auth/forgot-password`
Request password reset email.

##### POST `/api/auth/reset-password`
Reset password with token from email.

##### GET `/api/auth/verify-email/:token`
Verify email address with token.

##### POST `/api/auth/refresh-token`
Refresh access token using refresh token.

#### Protected Endpoints (Authentication Required)

##### GET `/api/auth/me`
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client",
      "status": "active"
    }
  }
}
```

##### POST `/api/auth/setup-2fa`
Generate 2FA secret and QR code.

##### POST `/api/auth/verify-2fa`
Verify and enable 2FA with TOTP code.

##### POST `/api/auth/disable-2fa`
Disable two-factor authentication.

##### DELETE `/api/auth/logout`
Logout and invalidate tokens.

### Admin Endpoints (`/api/admin`)

All admin endpoints require `ADMIN` role.

#### Dashboard & Statistics

##### GET `/api/admin/dashboard`
Get admin dashboard with system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "activeClients": 980,
      "totalTherapists": 45,
      "monthlyRevenue": 125000,
      "totalSessions": 3200,
      "pendingAppointments": 23
    },
    "recentActivity": [...],
    "alerts": [...]
  }
}
```

#### User Management

##### GET `/api/admin/users`
Get paginated list of all users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalUsers": 1250,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

##### GET `/api/admin/users/:userId`
Get detailed user information by ID.

##### PUT `/api/admin/users/:userId`
Update user details.

##### PUT `/api/admin/users/:userId/role`
Change user role.

##### PUT `/api/admin/users/:userId/status`
Change user status.

#### Client & Therapist Management

##### GET `/api/admin/clients`
Get all clients with filtering options.

##### GET `/api/admin/therapists`
Get all therapists with their profiles.

##### POST `/api/admin/assign-therapist`
Assign therapist to client.

##### GET `/api/admin/appointment-requests`
Get unassigned appointment requests.

##### PUT `/api/admin/appointment-requests/:id/assign`
Assign appointment request to therapist.

#### System Management

##### GET `/api/admin/system/settings`
Get system configuration settings.

##### PUT `/api/admin/system/settings`
Update system settings.

##### GET `/api/admin/audit-logs`
Get system audit logs with filtering.

##### GET `/api/admin/statistics/global`
Get comprehensive system statistics.

### Therapist Endpoints (`/api/therapist`)

#### Dashboard & Profile

##### GET `/api/therapist/dashboard`
Get therapist dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalClients": 25,
      "sessionsThisWeek": 18,
      "sessionsThisMonth": 72,
      "averageRating": 4.8,
      "monthlyRevenue": 8500,
      "completionRate": 0.92
    },
    "upcomingAppointments": [...],
    "recentActivity": [...],
    "pendingTasks": [...]
  }
}
```

##### GET `/api/therapist/profile`
Get therapist profile details.

##### PUT `/api/therapist/profile`
Update therapist profile.

#### Client Management

##### GET `/api/therapist/clients`
Get assigned clients.

**Query Parameters:**
- `status`: Filter by client status
- `search`: Search by name

##### GET `/api/therapist/clients/:clientId/progress`
Get client progress analytics.

##### GET `/api/therapist/clients/:clientId/session-summary`
Get client session history summary.

##### GET `/api/therapist/clients/:clientId/medical-history`
Get client medical history.

##### GET `/api/therapist/clients/:clientId/therapy-goals`
Get client therapy goals.

##### POST `/api/therapist/clients/:clientId/complete`
Mark client treatment as completed.

#### Appointment Management

##### GET `/api/therapist/appointments`
Get therapist appointments.

**Query Parameters:**
- `date`: Specific date filter
- `startDate`, `endDate`: Date range filter
- `status`: Appointment status filter
- `client`: Specific client filter

##### POST `/api/therapist/appointments`
Create new appointment.

**Request Body:**
```json
{
  "clientId": "client-uuid",
  "appointmentDate": "2024-01-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "therapyType": "individual",
  "location": "office",
  "notes": "Follow-up session"
}
```

##### PUT `/api/therapist/appointments/:appointmentId`
Update appointment details.

##### DELETE `/api/therapist/appointments/:appointmentId`
Cancel appointment.

##### POST `/api/therapist/appointments/:appointmentId/no-show-policy`
Apply no-show policy to appointment.

### Client Endpoints (`/api/client`)

#### Dashboard & Profile

##### GET `/api/client/dashboard`
Get client dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "wellnessScore": 7.2,
      "treatmentProgress": 65,
      "totalSessions": 12,
      "nextAppointment": "2024-01-15T14:00:00Z"
    },
    "upcomingAppointments": [...],
    "assignedResources": [...],
    "activeChallenges": [...]
  }
}
```

##### GET `/api/client/profile`
Get client profile.

##### PUT `/api/client/profile`
Update client profile.

#### Appointment Management

##### POST `/api/client/appointment-request`
Create appointment request.

##### GET `/api/client/appointments`
Get client appointments.

##### POST `/api/client/appointments/book`
Book appointment with specific therapist.

#### Therapist Information

##### GET `/api/client/therapists`
Get all available therapists.

##### GET `/api/client/assigned-therapist`
Get assigned therapist information.

##### GET `/api/client/therapists/:therapistId/availability`
Get therapist availability.

#### Resources & Challenges

##### GET `/api/client/resources`
Get assigned resources.

##### GET `/api/client/challenges`
Get assigned challenges.

##### POST `/api/client/challenges/:challengeId/check-in`
Start challenge check-in.

##### PUT `/api/client/challenges/:challengeId/check-in/complete`
Complete challenge check-in.

#### Session & Medical Information

##### GET `/api/client/sessions`
Get session history.

##### GET `/api/client/session-summary`
Get session summary.

##### GET `/api/client/medical-history`
Get medical history.

##### GET `/api/client/therapy-goals`
Get therapy goals.

#### Other Services

##### GET `/api/client/messages`
Get client messages.

##### GET `/api/client/invoices`
Get client invoices.

##### POST `/api/client/address-change-request`
Request address change.

### Session Management (`/api/sessions`)

##### POST `/api/sessions/start`
Start a therapy session.

**Request Body:**
```json
{
  "appointmentId": "appointment-uuid",
  "clientPresent": true,
  "location": "office",
  "initialNotes": "Client arrived on time, appears calm"
}
```

##### POST `/api/sessions/:sessionId/progress`
Add session progress notes.

##### PUT `/api/sessions/:sessionId/progress`
Update session progress.

##### POST `/api/sessions/:sessionId/end`
End session with summary.

##### GET `/api/sessions`
Get session history.

##### GET `/api/sessions/statistics`
Get session statistics.

### Payment System (`/api/payments`)

#### Client Payment Endpoints

##### GET `/api/payments/client/booking-eligibility`
Check if client can book appointments (payment restrictions).

##### GET `/api/payments/client/invoices/unpaid`
Get unpaid invoices for client.

##### POST `/api/payments/immediate`
Process immediate payment.

**Request Body:**
```json
{
  "appointmentId": "appointment-uuid",
  "amount": 75.00,
  "paymentMethod": "ideal"
}
```

#### Admin Payment Endpoints

##### PUT `/api/admin/clients/:clientId/payment-limit`
Update client payment limit.

### Resource Management (`/api/resources`)

##### GET `/api/resources`
Get available resources with filtering.

**Query Parameters:**
- `category`: Filter by category
- `type`: Filter by resource type
- `search`: Search in title/description

##### GET `/api/resources/:resourceId`
Get specific resource details.

##### POST `/api/resources`
Create new resource (Admin only).

##### POST `/api/resources/:resourceId/assign`
Assign resource to client (Therapist only).

##### POST `/api/resources/:resourceId/engagement`
Track resource engagement.

##### GET `/api/resources/:resourceId/analytics`
Get resource analytics.

### Survey System (`/api/surveys`)

##### GET `/api/surveys`
Get available surveys.

##### GET `/api/surveys/templates`
Get survey templates (Therapist only).

##### POST `/api/surveys`
Create new survey (Therapist only).

##### POST `/api/surveys/:surveyId/assign`
Assign survey to client.

##### POST `/api/surveys/:surveyId/respond`
Submit survey response.

##### GET `/api/surveys/:surveyId/responses`
Get survey responses (Therapist only).

##### GET `/api/surveys/:surveyId/analytics`
Get survey analytics.

### Challenge System (`/api/challenges`)

##### GET `/api/challenges`
Get available challenges with filtering.

**Query Parameters:**
- `category`: Challenge category filter
- `difficulty`: Difficulty level filter
- `participationStatus`: User participation status

##### POST `/api/challenges`
Create new challenge (Therapist only).

##### POST `/api/challenges/:challengeId/assign`
Assign challenge to client.

##### GET `/api/challenges/:challengeId/analytics`
Get challenge analytics.

### Smart Pairing (`/api/admin/smart-pairing`)

##### GET `/api/admin/smart-pairing/recommendations`
Get therapist recommendations for client.

**Query Parameters:**
- `clientId`: Client UUID
- `problemCategory`: Problem category filter
- `includeScores`: Include matching scores

##### POST `/api/admin/smart-pairing/recommend`
Get recommendations with specific criteria.

##### GET `/api/admin/smart-pairing/score`
Calculate pairing score between client and therapist.

##### GET `/api/admin/smart-pairing/analytics`
Get pairing system analytics.

### Notification System (`/api/notifications`)

##### GET `/api/notifications`
Get user notifications.

##### GET `/api/notifications/unread-count`
Get unread notification count.

##### PUT `/api/notifications/:notificationId/read`
Mark notification as read.

##### PUT `/api/notifications/mark-all-read`
Mark all notifications as read.

##### GET `/api/notifications/preferences`
Get notification preferences.

##### PUT `/api/notifications/preferences`
Update notification preferences.

### Profile Photo Management (`/api/profile`)

##### GET `/api/profile/photo/:userId`
Get user profile photo.

##### POST `/api/profile/photo`
Upload profile photo.

##### DELETE `/api/profile/photo`
Delete profile photo.

### System Utilities

#### Health Check
##### GET `/health`
System health check (no /api prefix).

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "database": {
    "connected": true,
    "initialized": true,
    "hasUrl": true
  }
}
```

#### Database Migration
##### GET `/api/migration/check-schema`
Check database schema status.

##### POST `/api/migration/run-migrations`
Run database migrations.

## Database Schema

The system uses PostgreSQL with a comprehensive schema designed for healthcare practice management.

### Core Tables

#### Users Table
Central authentication table for all system users.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'pending_verification',
    preferred_language language_code DEFAULT 'nl',
    phone VARCHAR(20),
    two_factor_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    profile_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Client Profiles
Extended information for client users.

```sql
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender gender_type,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    insurance_company VARCHAR(200),
    insurance_number VARCHAR(100),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    assigned_therapist_id UUID REFERENCES users(id),
    -- Medical information
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    therapy_goals TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Therapist Profiles
Extended information for therapist users.

```sql
CREATE TABLE therapist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specializations TEXT[],
    therapy_types therapy_type[],
    languages language_code[],
    bio TEXT,
    qualifications TEXT,
    hourly_rate DECIMAL(10,2),
    session_duration INTEGER DEFAULT 60,
    accepts_emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Appointment & Session Management

#### Appointments
Core appointment scheduling table.

```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    therapist_id UUID NOT NULL REFERENCES users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    therapy_type therapy_type,
    location VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions
Therapy session records linked to appointments.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    status session_status DEFAULT 'scheduled',
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    summary TEXT,
    progress_notes TEXT,
    goals_discussed TEXT,
    homework TEXT,
    next_session_goals TEXT,
    client_mood_start INTEGER CHECK (client_mood_start >= 1 AND client_mood_start <= 10),
    client_mood_end INTEGER CHECK (client_mood_end >= 1 AND client_mood_end <= 10),
    techniques_used TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Resource & Challenge Management

#### Resources
Educational and therapeutic resources.

```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type resource_type NOT NULL,
    category VARCHAR(100),
    content_body TEXT,
    content_url VARCHAR(1000),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Challenges
Therapeutic challenges and exercises.

```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category challenge_category NOT NULL,
    difficulty difficulty_level DEFAULT 'beginner',
    duration INTEGER, -- in days
    target_value INTEGER,
    target_unit VARCHAR(50),
    instructions TEXT[],
    benefits TEXT[],
    tips TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Financial Management

#### Invoices
Billing and invoice management.

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id),
    therapist_id UUID REFERENCES users(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status invoice_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    description TEXT,
    line_items JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments
Payment transaction records.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    appointment_id UUID REFERENCES appointments(id),
    client_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    external_payment_id VARCHAR(255),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Communication & Notifications

#### Messages
Internal messaging system.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Notifications
System notification management.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Audit & Security

#### Audit Logs
Comprehensive audit trail for all system activities.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Sessions
Active session management for security.

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Test Flow Analysis

The comprehensive test suite (`test-all-endpoints-enhanced.js`) provides extensive API testing coverage with the following methodology:

### Test Structure

#### 1. Authentication Flow Testing
```javascript
// Test admin login with 2FA
const adminLogin = await apiRequest('POST', '/auth/login', {
  email: 'banturide5@gmail.com',
  password: 'Milan18$',
  twoFactorCode: '377671'
});

// Test therapist login with 2FA  
const therapistLogin = await apiRequest('POST', '/auth/login', {
  email: 'codelibrary21@gmail.com', 
  password: 'Milan18$',
  twoFactorCode: '188677'
});

// Test client login (no 2FA required)
const clientLogin = await apiRequest('POST', '/auth/login', {
  email: 'mukelathegreat@gmail.com',
  password: 'Milan18$'
});
```

#### 2. Profile Management Testing
- User profile retrieval and updates
- Role-based access testing
- Therapist specialization management
- Address change request workflows

#### 3. Dashboard Endpoint Testing
Tests all dashboard endpoints for different user roles:
- **Client Dashboard**: Wellness metrics, treatment progress, upcoming appointments
- **Therapist Dashboard**: Client statistics, session counts, revenue metrics
- **Admin Dashboard**: System-wide statistics, user counts, financial overview

#### 4. Appointment System Testing
Comprehensive appointment lifecycle testing:
- Appointment request creation
- Therapist assignment by admin
- Availability checking
- Appointment booking with conflict detection
- Calendar integration testing

#### 5. Session Management Testing
Full session workflow validation:
- Session initiation from appointments
- Progress note addition
- Session completion with summaries
- Session analytics and statistics

#### 6. Resource & Challenge System Testing
- Resource creation and assignment
- Challenge participation workflows
- Progress tracking and analytics
- Engagement metrics collection

#### 7. Survey System Testing
- Survey template creation
- Client assignment and responses
- Analytics and reporting validation

#### 8. Smart Pairing Algorithm Testing
- Therapist recommendation engine
- Matching score calculations
- Criteria-based filtering

### Test Data Management

The test suite uses predefined test accounts:
```javascript
const testUsers = {
  admin: {
    email: 'banturide5@gmail.com',
    password: 'Milan18$',
    twoFactorCode: '377671'
  },
  therapist: {
    email: 'codelibrary21@gmail.com', 
    password: 'Milan18$',
    twoFactorCode: '188677'
  },
  client: {
    email: 'mukelathegreat@gmail.com',
    password: 'Milan18$'
  }
};
```

### Result Analysis

The test suite provides detailed reporting:
- **Success/Failure Counts**: Total test statistics
- **Performance Metrics**: Response times for each endpoint
- **Error Analysis**: Detailed error information for failed tests
- **Categorized Results**: Tests grouped by functional area
- **File Output**: Results saved to `current-endpoints-results.txt`

## Security Features

### Authentication Security
- **JWT with Refresh Tokens**: Short-lived access tokens with secure refresh mechanism
- **Two-Factor Authentication**: TOTP-based 2FA for admin and therapist accounts
- **Password Requirements**: Strong password enforcement with complexity rules
- **Account Lockout**: Protection against brute force attacks

### Authorization Security
- **Role-Based Access Control**: Granular permissions per user role
- **Resource-Level Security**: Ownership verification for sensitive data
- **API Rate Limiting**: Protection against DoS attacks
- **Request Validation**: Comprehensive input validation and sanitization

### Data Security
- **Password Hashing**: bcrypt with configurable salt rounds
- **Sensitive Data Encryption**: Critical data encrypted at rest
- **Audit Logging**: Comprehensive activity tracking
- **Database Security**: Parameterized queries to prevent SQL injection

### Network Security
- **CORS Configuration**: Strict origin control
- **Helmet.js**: Security headers implementation
- **HTTPS Enforcement**: TLS encryption in production
- **IP-based Restrictions**: Configurable IP allow/deny lists

### Session Security
- **Secure Cookie Settings**: HttpOnly, Secure, SameSite attributes
- **Session Timeout**: Automatic session expiration
- **Device Fingerprinting**: Enhanced session security
- **Concurrent Session Limits**: Prevent session hijacking

## External Integrations

### Payment Processing (Mollie)
- **Payment Gateway**: Secure payment processing for therapy sessions
- **Multiple Payment Methods**: iDEAL, credit cards, SEPA transfers
- **Webhook Integration**: Real-time payment status updates
- **Refund Management**: Automated refund processing

### Accounting Integration (Moneybird)
- **Invoice Generation**: Automated invoice creation
- **Financial Reporting**: Integration with accounting workflows
- **Tax Calculation**: Automatic VAT/tax handling
- **Payment Reconciliation**: Automated payment matching

### File Storage (Cloudinary)
- **Profile Photos**: Secure image upload and storage
- **Document Management**: File upload with optimization
- **CDN Distribution**: Fast global content delivery
- **Image Transformations**: Automatic resizing and optimization

### Email Services (Nodemailer)
- **Transactional Emails**: Account verification, password resets
- **Appointment Notifications**: Automated appointment reminders
- **System Notifications**: Important system communications
- **Template Management**: HTML email template system

## Development Guidelines

### Code Structure
- **TypeScript**: Strict typing for better code quality
- **Modular Architecture**: Clear separation of concerns
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging for debugging and monitoring

### Database Best Practices
- **Connection Pooling**: Efficient database connection management
- **Transaction Support**: ACID compliance for critical operations
- **Migration System**: Version-controlled schema changes
- **Backup Strategy**: Automated database backups

### API Design Principles
- **RESTful Design**: Consistent API structure
- **Versioning Strategy**: API version management
- **Response Standardization**: Consistent response formats
- **Documentation**: Comprehensive API documentation

### Security Guidelines
- **Input Validation**: Validate all user inputs
- **Output Encoding**: Prevent XSS attacks
- **Authentication First**: Secure all sensitive endpoints
- **Principle of Least Privilege**: Minimal required permissions

### Testing Strategy
- **Comprehensive Coverage**: Test all critical paths
- **Role-based Testing**: Test all user roles and permissions
- **Integration Testing**: End-to-end workflow validation
- **Performance Testing**: Load testing for scalability

### Deployment & Monitoring
- **Environment Management**: Separate dev/staging/production configs
- **Health Monitoring**: System health checks and alerts
- **Performance Monitoring**: Response time and error tracking
- **Log Management**: Centralized logging and analysis

---

## API Response Standards

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

This documentation provides a comprehensive overview of the PraktijkEPD Backend system. For specific implementation details, refer to the source code and individual controller/service files.