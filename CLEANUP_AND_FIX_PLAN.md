# Frontend Cleanup and Fix Plan

## Current Issues Identified

### 1. Authentication Issues
- Backend returning 401 errors
- No refresh token in cookies
- CORS/Cookie configuration issues with deployed backend
- Token refresh mechanism not working properly

### 2. UI Glitching
- Appointment tab making excessive API calls
- Multiple components fetching data redundantly
- Missing debouncing/caching mechanisms

### 3. Navigation/Sidebar Issues
- Some tabs showing incorrect labels
- Inconsistent navigation items across roles

### 4. CRUD Operations Not Working
- Admin operations not fully functional
- Create/Edit/Delete buttons not working in production
- API endpoints not being called correctly

### 5. Missing Features
- Real-time messaging not implemented
- Some screens showing mock data instead of real data
- Therapist settings incomplete

## Fix Plan (3 Phases)

### Phase 1: Authentication & API Integration
1. Fix authentication flow with production backend
2. Implement proper token storage and refresh
3. Update API configuration for production
4. Add proper error handling for all API calls

### Phase 2: UI Cleanup & Component Fixes
1. Fix appointment tab infinite loops
2. Implement proper data caching
3. Remove all mock data
4. Fix navigation labels
5. Ensure all CRUD operations work

### Phase 3: Feature Completion & Testing
1. Complete therapist settings
2. Implement missing features
3. Add proper loading states
4. Test all endpoints with production backend
5. Clean up unused files

## Files to Update

### High Priority
- `/src/services/api.ts` - Fix authentication
- `/src/store/authStore.tsx` - Fix token management
- `/src/pages/roles/therapist/appointments/TherapistAppointments.tsx` - Fix infinite loops
- `/src/components/layout/DashboardLayout.tsx` - Fix navigation labels

### Medium Priority
- All admin management screens (resources, challenges, surveys)
- Client management screens
- Therapist profile/settings

### Low Priority
- Remove unused mock data files
- Clean up duplicate components
- Optimize bundle size

## Backend Endpoints to Test
Based on comprehensive-backend-test-full.js:
- Auth: login, logout, refresh-token
- Admin: users, clients, therapists, dashboard
- Resources: CRUD operations
- Challenges: CRUD operations
- Surveys: CRUD operations
- Appointments: CRUD operations
- Messages: send, receive, list