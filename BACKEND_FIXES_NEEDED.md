# Remaining Backend Fixes Needed

## ✅ Fixed Issues
1. **Invoice Status Enum** - Backend now accepts `status=unpaid` and converts to `IN ('sent', 'overdue')`

## 🔧 Still Need Backend Fixes

### 1. Missing Endpoints (404 Errors)

#### `/api/client/messages`
```javascript
// Backend needs to implement this endpoint
router.get('/api/client/messages', authenticate, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  // Return messages for the authenticated client
  res.json({
    success: true,
    data: {
      messages: [],
      total: 0
    }
  });
});
```

#### `/api/client/therapist`
```javascript
// This endpoint exists but returns 401 "Access token required"
// Check the authenticate middleware - it might not be parsing the Bearer token correctly
```

### 2. Permission Issue (403 Error)

#### `/api/therapists?status=active`
```javascript
// Currently returns 403 for clients
// Update permissions to allow clients to view therapist list
// In the therapist routes, allow CLIENT role:
if (!['admin', 'therapist', 'client'].includes(req.user.role)) {
  return res.status(403).json({ 
    success: false, 
    message: 'Access denied' 
  });
}
```

### 3. Authentication Token Issue

The frontend is sending the token correctly:
```javascript
Authorization: Bearer <token>
```

But `/api/client/therapist` returns "Access token required". Check if the backend:
1. Is correctly parsing the Bearer token
2. Has the authenticate middleware applied to this route
3. Is checking for the token in the right header

### 4. Refresh Token Endpoint

The frontend is now calling `/api/auth/refresh` instead of `/api/auth/refresh-token`. Make sure this endpoint exists in the backend.

## Frontend Temporary Workarounds Applied

1. **Messages**: Skip loading messages until endpoint is implemented
2. **Therapist List**: Show empty state with helpful message for 403 error
3. **Calendar**: Fixed routing to work with query parameters

## Testing After Backend Fixes

1. Clear browser localStorage
2. Login fresh with a client account
3. Check Network tab to verify:
   - Token is included in Authorization header
   - Correct endpoints are being called
   - Proper responses are returned

## Quick Backend Checklist

- [ ] Implement `/api/client/messages` endpoint
- [ ] Fix authentication middleware for `/api/client/therapist`
- [ ] Allow clients to access `/api/therapists`
- [ ] Verify `/api/auth/refresh` endpoint exists
- [ ] Test with client role account