# Missing Backend Endpoints for PraktijkEPD

## Overview
After reviewing the backend code, the following endpoints are missing and need to be implemented for full functionality.

## 1. Therapies Management (Admin)
These endpoints are needed for admin to manage the list of therapies (formerly specializations):

```typescript
// Therapies CRUD
GET    /api/admin/therapies                 // Get all therapies
POST   /api/admin/therapies                 // Create new therapy
PUT    /api/admin/therapies/:id             // Update therapy
DELETE /api/admin/therapies/:id             // Delete therapy

// Expected payload for POST/PUT:
{
  name: string,
  description: string,
  category: string,
  isActive: boolean
}
```

## 2. Psychological Problems Management (Admin)
These endpoints are needed for admin to manage the list of psychological problems (hulpvragen):

```typescript
// Psychological Problems CRUD
GET    /api/admin/psychological-problems    // Get all problems
POST   /api/admin/psychological-problems    // Create new problem
PUT    /api/admin/psychological-problems/:id // Update problem
DELETE /api/admin/psychological-problems/:id // Delete problem

// Expected payload for POST/PUT:
{
  name: string,
  description: string,
  category: string,
  severity: 'mild' | 'moderate' | 'severe',
  isActive: boolean
}
```

## 3. Address Change Request Management
```typescript
// Client endpoints
POST   /api/client/address-change           // Request address change
GET    /api/client/address-change-requests  // Get my requests

// Admin endpoints  
GET    /api/admin/address-change-requests   // Get all requests
PUT    /api/admin/address-change-requests/:id/approve
PUT    /api/admin/address-change-requests/:id/reject

// Expected payload for POST:
{
  newAddress: string,
  newCity: string,
  newPostalCode: string,
  effectiveDate: string,
  reason: string
}
```

## 4. Real-time Messaging
Currently missing Socket.io implementation for real-time messaging:

```typescript
// WebSocket events needed:
- 'message:send'      // Send message
- 'message:receive'   // Receive message
- 'message:typing'    // Typing indicator
- 'message:read'      // Mark as read
- 'user:online'       // User online status
- 'user:offline'      // User offline status
```

## 5. File Upload Endpoints
```typescript
POST   /api/upload/document     // Upload documents
POST   /api/upload/image        // Upload images
GET    /api/files/:id           // Retrieve uploaded files
DELETE /api/files/:id           // Delete uploaded files
```

## 6. Enhanced Client Endpoints
```typescript
// Update client with additional data
PUT    /api/admin/users/:userId
Body: {
  // Basic info
  first_name: string,
  last_name: string,
  phone: string,
  
  // Additional client-specific data
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
```

## 7. Notification System
```typescript
GET    /api/notifications              // Get user notifications
PUT    /api/notifications/:id/read     // Mark as read
PUT    /api/notifications/read-all     // Mark all as read
GET    /api/notifications/preferences  // Get preferences
PUT    /api/notifications/preferences  // Update preferences
```

## 8. Analytics Enhancements
```typescript
// Admin analytics
GET    /api/admin/analytics/client-retention
GET    /api/admin/analytics/therapist-utilization
GET    /api/admin/analytics/revenue-trends
GET    /api/admin/analytics/appointment-trends

// Therapist analytics
GET    /api/therapist/analytics/client-progress
GET    /api/therapist/analytics/session-outcomes
```

## Database Tables Needed

### 1. therapies
```sql
CREATE TABLE therapies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. psychological_problems
```sql
CREATE TABLE psychological_problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. therapist_therapies (junction table)
```sql
CREATE TABLE therapist_therapies (
  therapist_id UUID REFERENCES users(id),
  therapy_id UUID REFERENCES therapies(id),
  PRIMARY KEY (therapist_id, therapy_id)
);
```

### 4. therapist_psychological_problems (junction table)
```sql
CREATE TABLE therapist_psychological_problems (
  therapist_id UUID REFERENCES users(id),
  problem_id UUID REFERENCES psychological_problems(id),
  PRIMARY KEY (therapist_id, problem_id)
);
```

### 5. address_change_requests
```sql
CREATE TABLE address_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  current_address VARCHAR(255),
  current_city VARCHAR(100),
  current_postal_code VARCHAR(20),
  new_address VARCHAR(255) NOT NULL,
  new_city VARCHAR(100) NOT NULL,
  new_postal_code VARCHAR(20) NOT NULL,
  effective_date DATE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Priority

1. **High Priority** (Blocking current functionality):
   - Therapies management endpoints
   - Psychological problems management endpoints
   - Enhanced client update endpoint with additionalData

2. **Medium Priority** (Important but workarounds exist):
   - Address change request system
   - File upload endpoints
   - Notification system

3. **Lower Priority** (Nice to have):
   - Real-time messaging
   - Enhanced analytics endpoints

## Frontend Updates Needed

After implementing these endpoints, update:
1. `realApi.ts` - Add the new endpoint calls
2. Remove any mock data fallbacks
3. Update types/interfaces to match backend responses
4. Test all CRUD operations end-to-end

## Testing

Create integration tests for:
1. Admin creating/managing therapies
2. Admin creating/managing psychological problems
3. Therapist selecting from admin-managed lists
4. Client address change workflow
5. File upload/download functionality