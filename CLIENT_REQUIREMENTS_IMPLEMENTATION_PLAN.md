# Client Requirements Implementation Plan

## Overview
This document outlines the implementation plan for the client-requested changes based on adjustment.txt feedback.

## Required Changes

### 1. Translation (EN/NL) Fixes
**Issue**: Some English-Dutch translations are inaccurate and some functions are not working.
**Solution**:
- Review and fix all translations in `LanguageContext.tsx`
- Add missing translations for new features
- Test language switching functionality thoroughly
- Ensure all UI elements update when language is changed

### 2. Delete Account Option Removal
**Issue**: Delete account option must be removed under Dutch law.
**Location**: `/src/pages/roles/client/settings/ClientSettings.tsx` (lines 654-667)
**Solution**:
- Remove the delete account section completely
- Keep data export functionality as it's GDPR compliant

### 3. Completion Survey for Clients
**Issue**: Add survey triggered when therapist marks client as "completed"
**Solution**:
- Create completion survey template
- Add endpoint integration for completion surveys
- Trigger survey notification when client status changes to completed
- Add survey to client dashboard if pending

### 4. Challenge Filters
**Issue**: Add filter options to challenges page
**Location**: `/src/pages/roles/client/challenges/ClientChallenges.tsx`
**Solution**:
- Add filter UI for:
  - Category
  - Difficulty level
  - Status (active/completed)
  - Date range
- Implement filter logic

### 5. View Invoice Feature
**Issue**: Need to see actual invoice display
**Solution**:
- Create invoice preview component
- Add PDF generation/viewing capability
- Integrate with invoice endpoints

### 6. All Therapists Grid
**Issue**: Add full list/grid of all therapists for clients to book
**Location**: `/src/pages/roles/client/therapist/ClientTherapist.tsx`
**Solution**:
- Create new route `/client/therapists` for all therapists
- Add grid view with therapist cards showing:
  - Name and photo
  - Specializations
  - Languages
  - Availability status
  - Book appointment button
- Add search and filter functionality

### 7. Multiple Therapist Booking
**Issue**: When multiple therapists linked, client should choose which to book with
**Location**: `/src/pages/roles/client/appointments/BookAppointment.tsx`
**Solution**:
- Modify booking flow to show therapist selection step
- Link therapy types to therapist modalities
- Show only available therapists for selected date/time

### 8. Fix Agenda
**Issue**: Agenda currently not working
**Solution**:
- Debug and fix calendar view issues
- Ensure proper date formatting
- Test appointment display

### 9. Enhanced Registration Workflow
**Issue**: New registration should allow immediate session booking
**Components needed**:
- Enhanced registration flow with:
  1. Email/password entry
  2. Therapist and location selection
  3. Immediate session booking
  4. Redirect to intake form
  5. Notification for personal details completion
  6. Contract agreement
  7. SEPA payment setup

### 10. Unpaid Invoice Popups
**Issue**: Show unpaid invoices on login, persistent after 30 days
**Solution**:
- Create invoice reminder component
- Check unpaid invoices on dashboard load
- Show modal for overdue invoices
- Implement €300 limit check for booking restriction

### 11. Automatic Therapist Assignment
**Issue**: Auto-assign therapist when client books appointment
**Solution**:
- Filter therapists by city and availability
- Auto-assign on appointment booking if client not yet assigned
- Update backend integration to support this flow

## Implementation Priority

### Phase 1 - Critical Fixes (Immediate)
1. Remove delete account option ✓
2. Fix translation issues
3. Fix agenda functionality

### Phase 2 - Core Features (Week 1)
4. All therapists grid view
5. Multiple therapist booking selection
6. Challenge filters
7. Invoice viewing

### Phase 3 - Enhanced Features (Week 2)
8. Completion survey system
9. Enhanced registration workflow
10. Unpaid invoice popups
11. Automatic therapist assignment

## Technical Approach

### UI Consistency
- Use existing design system components
- Follow established patterns:
  - Card styles: `card-professional`, `PremiumCard`
  - Buttons: `PremiumButton`, gradient buttons
  - Colors: Gradient themes (violet/purple, sky/blue, emerald/green)
  - Animations: `animate-fadeIn`, `smooth-transition`

### API Integration
- Use `realApiService` for all API calls
- Implement proper error handling
- Add loading states with `LoadingSpinner`
- Cache responses where appropriate

### State Management
- Use React hooks for local state
- Leverage `useAuth` for user context
- Implement `useTranslation` for all text

### Professional Polish
- Smooth transitions and animations
- Glassmorphism effects where appropriate
- Consistent spacing and typography
- Responsive design for all screen sizes
- Loading states for all async operations
- Error boundaries and fallbacks

## Testing Plan
1. Test each feature in isolation
2. Verify language switching works
3. Test booking flows end-to-end
4. Verify invoice display and limits
5. Test registration workflow
6. Validate all API integrations