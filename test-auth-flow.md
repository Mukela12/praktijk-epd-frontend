# Authentication Flow Test Guide

## Test Scenarios

### 1. Therapist Login with 2FA
1. Navigate to `/auth/login`
2. Enter therapist credentials
3. Submit login form
4. Should be redirected to `/auth/2fa` for verification
5. Enter 2FA code
6. Should be redirected to `/therapist/dashboard`

### 2. Client Login (No 2FA)
1. Navigate to `/auth/login`
2. Enter client credentials
3. Submit login form
4. Should be redirected directly to `/client/dashboard`

### 3. Bookkeeper Login with 2FA
1. Navigate to `/auth/login`
2. Enter bookkeeper credentials
3. Submit login form
4. Should be redirected to `/auth/2fa` for verification
5. Enter 2FA code
6. Should be redirected to `/bookkeeper/dashboard`

## What to Check in Console

1. After login, check for:
   - `[complete2FALogin] Setting auth state with token:`
   - `[complete2FALogin] Storing token in localStorage`
   - `[complete2FALogin] Auth state stored successfully`

2. After 2FA verification:
   - `[TwoFactorPage] 2FA verification successful`
   - `[TwoFactorPage] Forcing navigation to: /[role]/dashboard`

3. Check localStorage:
   - `accessToken` should be present
   - `praktijk-epd-auth` should contain user data and auth state
   - No infinite loops or repeated logout messages

## Fixed Issues

1. **Removed useAuthMonitor** - Was causing infinite logout loops
2. **Created SimpleProtectedRoute** - Cleaner implementation without complex useEffect dependencies
3. **Fixed 2FA navigation** - Now uses `window.location.replace()` for clean navigation
4. **Improved auth state persistence** - Manually stores auth state in localStorage
5. **Removed problematic useEffect dependencies** - TwoFactorPage now has minimal dependencies

## If Issues Persist

1. Clear localStorage: `localStorage.clear()`
2. Hard refresh the page: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. Check network tab for repeated API calls
4. Look for any remaining infinite loop warnings in console