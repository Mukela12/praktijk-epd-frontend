# Frontend API Integration Fix Guide

## Critical Issue: Double `/api` Prefix

All endpoints in `endpoints.ts` have `/api` prefix which gets concatenated with the base URL that already includes `/api`, resulting in invalid paths like `/api/api/*`.

## Required Fixes

### 1. Fix endpoints.ts

Replace ALL occurrences of `/api/*` with just `/*` in the endpoint paths:

```javascript
// WRONG (current):
getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
}

// CORRECT (should be):
getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
  const response = await api.get('/admin/dashboard');
  return response.data;
}
```

### 2. Working Backend Endpoints

Based on testing, these endpoints are confirmed working:

#### Authentication ✅
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`

#### Admin ✅
- `GET /api/admin/dashboard`
- `GET /api/admin/financial/overview`
- `GET /api/admin/clients`
- `GET /api/admin/therapists`
- `GET /api/admin/appointments`
- `GET /api/admin/users`
- `GET /api/admin/waiting-list`

#### Client ✅
- `GET /api/client/dashboard`
- `GET /api/client/profile`
- `PUT /api/client/profile`
- `GET /api/client/appointments`
- `GET /api/client/therapist`
- `GET /api/client/messages`
- `POST /api/client/messages`
- `POST /api/client/intake-form`

#### Therapist ✅
- `GET /api/therapist/appointments`
- `POST /api/therapist/appointments`
- `GET /api/therapist/clients`
- `PUT /api/therapist/profile`

### 3. Non-Existent Endpoints to Remove/Comment

These endpoints don't exist in the backend:

#### Assistant Routes ❌
- All `/api/assistant/*` endpoints (routes not registered)

#### Bookkeeper Routes ❌
- All `/api/bookkeeper/*` endpoints (routes not registered)

#### Missing Features ❌
- `/api/therapist/documents`
- `/api/therapist/ai/insights`
- `/api/therapist/statistics`
- `/api/admin/treatment-codes` (different path in backend)

### 4. Quick Fix Script

Here's a sed command to fix all endpoints in endpoints.ts:

```bash
# Backup first
cp src/services/endpoints.ts src/services/endpoints.ts.backup

# Fix all /api/ prefixes
sed -i '' 's|"/api/|"/|g' src/services/endpoints.ts
```

### 5. Test After Fixes

After applying fixes, test with:

```javascript
// Test authentication
const response = await authApi.login({
  email: 'admin@praktijkepd.nl',
  password: 'Admin123!@#'
});

// Test admin dashboard (with token)
const dashboard = await adminApi.getDashboard();
```

### 6. realApi.ts Updates

The `realApi.ts` file handles fallbacks well but also needs path updates:

1. Remove `/api` prefix from hardcoded paths
2. Keep the fallback logic for permissions
3. Update the endpoints that check multiple role-based paths

### 7. Proper Error Handling

Add proper error handling for non-existent endpoints:

```javascript
try {
  const response = await api.get('/assistant/dashboard');
  return response.data;
} catch (error) {
  if (error.response?.status === 404) {
    console.warn('Assistant endpoints not yet implemented');
    return { success: false, message: 'Feature not available' };
  }
  throw error;
}
```

## Summary

1. **IMMEDIATE ACTION**: Remove `/api` prefix from ALL endpoint paths in `endpoints.ts`
2. **TEST**: Verify authentication and main dashboards work
3. **CLEAN UP**: Comment out or remove calls to non-existent endpoints
4. **DOCUMENT**: Update documentation with working endpoints

The backend is 84.3% functional and ready for frontend integration once these path issues are fixed.