# Final API Fixes Documentation

## Issues Identified

1. **Access Token Not Sent**: The backend is returning "Access token required" for `/client/therapist`
2. **Missing Translations**: The translations are added but not being found
3. **Calendar View Not Working**: The calendar routing is not functioning properly
4. **Endpoint Issues**:
   - `/client/messages` - Returns 404 (not implemented)
   - `/client/therapist` - Returns 401 (access token required)
   - `/therapists` - Returns 403 (forbidden for clients)

## Solutions Applied

### 1. Fix Access Token Issue

The access token is being added to requests, but the backend might expect a different header format. Common possibilities:
- `Authorization: Bearer <token>` (current implementation)
- `Authorization: <token>` (without Bearer prefix)
- `x-access-token: <token>` (custom header)

### 2. Fix Calendar Navigation

Updated the navigation to properly handle calendar view:
```javascript
// In DashboardLayout.tsx
href: user?.role === UserRole.CLIENT ? '/client/appointments?view=calendar' : ...

// In ClientAppointments.tsx
const [searchParams] = useSearchParams();
const initialView = searchParams.get('view') as 'list' | 'calendar' || 'list';
```

### 3. Backend Endpoint Requirements

The backend needs to implement or fix these endpoints:

```javascript
// 1. Client Messages Endpoint
GET /api/client/messages
- Should return paginated messages for the logged-in client
- Expected response: { success: true, data: { messages: [], total: 0 } }

// 2. Client Therapist Endpoint  
GET /api/client/therapist
- Should return the assigned therapist for the logged-in client
- Expected response: { success: true, data: { therapist object } }
- Note: Currently returns 401 - check authentication middleware

// 3. Therapists List Endpoint
GET /api/therapists
- Should allow clients to view available therapists
- Currently returns 403 (Forbidden) for client role
- Need to update permissions to allow client access
```

### 4. Invoice Status Enum

The backend expects uppercase enum values:
- Changed `status: 'unpaid'` to `status: 'UNPAID'`

### 5. Translation Keys Fix

Added missing translations:
```javascript
'therapists.viewNotAvailable': { en: 'Therapist Directory Not Available', nl: 'Therapeutenoverzicht Niet Beschikbaar' },
'therapists.contactForInfo': { en: 'This feature requires backend implementation...', nl: 'Deze functie vereist...' },
'nav.viewYourTherapist': { en: 'View Your Therapist', nl: 'Bekijk Uw Therapeut' },
```

## Backend Changes Required

1. **Fix Authentication Middleware**:
   - Ensure `/client/therapist` accepts Bearer token authentication
   - Check if the middleware is correctly parsing the Authorization header

2. **Implement Missing Endpoints**:
   ```javascript
   // GET /api/client/messages
   router.get('/client/messages', authenticate, async (req, res) => {
     // Return client's messages
   });

   // Fix permissions for /api/therapists
   router.get('/therapists', authenticate, async (req, res) => {
     // Allow clients to view therapist list
   });
   ```

3. **Fix Enum Values**:
   - Update invoice status enum to accept both lowercase and uppercase values
   - Or document the expected values clearly

## Testing Steps

1. Clear browser cache and localStorage
2. Login with a client account
3. Check Network tab for:
   - Authorization header presence in requests
   - Exact error messages from backend
4. Test calendar navigation by clicking Calendar menu item
5. Verify translations are loading correctly