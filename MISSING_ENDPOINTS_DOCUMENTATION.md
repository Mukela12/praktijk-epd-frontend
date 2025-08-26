# Missing Backend Endpoints Documentation

## Overview
This document lists the backend endpoints that are needed for full functionality of the therapist frontend features but appear to be missing or not fully implemented.

## Missing Endpoints

### 1. Session Progress Update
**Endpoint:** `PUT /api/sessions/{sessionId}/progress`
**Purpose:** Update session progress in real-time during an active session
**Request Body:**
```json
{
  "progressNotes": "string",
  "goalsDiscussed": "string",
  "clientMoodCurrent": "number",
  "techniquesUsed": ["string"],
  "interventionsApplied": ["string"]
}
```
**Response:** Updated session object with progress data

### 2. Client Medical History
**Endpoint:** `GET /api/clients/{clientId}/medical-history`
**Purpose:** Retrieve comprehensive medical history for a client
**Response:**
```json
{
  "currentMedications": ["string"],
  "allergies": ["string"],
  "previousTherapy": "boolean",
  "previousTherapyDetails": "string",
  "medicalConditions": ["string"],
  "hospitalizations": ["string"]
}
```

### 3. Client Therapy Goals
**Endpoint:** `GET /api/clients/{clientId}/therapy-goals`
**Purpose:** Get current therapy goals for a client
**Response:**
```json
{
  "goals": [
    {
      "id": "string",
      "goal": "string",
      "status": "active|completed|paused",
      "progress": "number",
      "createdAt": "date",
      "targetDate": "date"
    }
  ]
}
```

### 4. Appointment Recurring Pattern Management
**Endpoint:** `POST /api/appointments/{appointmentId}/recurring`
**Purpose:** Set up recurring appointments
**Request Body:**
```json
{
  "pattern": "weekly|biweekly|monthly",
  "endDate": "date",
  "exceptions": ["date"]
}
```

### 5. No-Show Policy Application
**Endpoint:** `POST /api/appointments/{appointmentId}/no-show-policy`
**Purpose:** Apply practice's no-show policy (fees, notifications)
**Request Body:**
```json
{
  "reason": "string",
  "applyFee": "boolean",
  "feeAmount": "number",
  "notifyClient": "boolean"
}
```

### 6. Session Statistics
**Endpoint:** `GET /api/therapists/{therapistId}/session-stats`
**Purpose:** Get session statistics for a therapist
**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
**Response:**
```json
{
  "totalSessions": "number",
  "completedSessions": "number",
  "cancelledSessions": "number",
  "noShows": "number",
  "averageSessionDuration": "number",
  "clientRetentionRate": "number"
}
```

### 7. Client Session History Summary
**Endpoint:** `GET /api/clients/{clientId}/session-summary`
**Purpose:** Get summarized session history for a client
**Response:**
```json
{
  "totalSessions": "number",
  "lastSessionDate": "date",
  "averageMoodImprovement": "number",
  "commonThemes": ["string"],
  "progressSummary": "string"
}
```

### 8. Emergency Contact Update
**Endpoint:** `PUT /api/clients/{clientId}/emergency-contact`
**Purpose:** Update client's emergency contact information
**Request Body:**
```json
{
  "name": "string",
  "relationship": "string",
  "phone": "string",
  "alternatePhone": "string",
  "email": "string"
}
```

### 9. Session Templates
**Endpoint:** `GET /api/therapists/{therapistId}/session-templates`
**Purpose:** Get session templates for common session types
**Response:**
```json
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "defaultGoals": ["string"],
      "commonTechniques": ["string"],
      "duration": "number"
    }
  ]
}
```

### 10. Appointment Preparation Notes
**Endpoint:** `PUT /api/appointments/{appointmentId}/preparation`
**Purpose:** Add/update preparation notes for an upcoming appointment
**Request Body:**
```json
{
  "preparationNotes": "string",
  "reviewPreviousSession": "boolean",
  "focusAreas": ["string"]
}
```

## Additional Enhancements

### Existing Endpoints Needing Enhancement

1. **GET /api/appointments** - Should include more client details in response:
   - Client profile photo URL
   - Client email and phone
   - Last session date
   - Total sessions count
   - Emergency contact info

2. **POST /api/sessions/start** - Should accept additional parameters:
   - Initial mood assessment
   - Session goals
   - Client concerns
   - Session template ID (if using template)

3. **GET /api/sessions** - Should include:
   - Techniques used
   - Mood start/end values
   - Goals discussed
   - Homework assigned

## Implementation Priority

### High Priority
1. Session Progress Update
2. Client Session History Summary
3. No-Show Policy Application

### Medium Priority
1. Client Medical History
2. Client Therapy Goals
3. Session Statistics

### Low Priority
1. Session Templates
2. Appointment Recurring Pattern Management
3. Emergency Contact Update
4. Appointment Preparation Notes

## Notes
- All endpoints should follow RESTful conventions
- Authentication should be handled via JWT tokens
- Error responses should be consistent across all endpoints
- Consider implementing pagination for list endpoints
- Add rate limiting for sensitive endpoints