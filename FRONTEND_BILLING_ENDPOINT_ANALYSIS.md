# Frontend Billing Endpoint Analysis

## Executive Summary

The frontend billing implementation is incomplete and uses incorrect API endpoints. Many billing features from the backend are not implemented in the frontend, and the endpoints that exist don't match the backend API structure.

## Current Frontend Billing Endpoints (in realApi.ts)

### 1. Treatment Codes
```javascript
// Frontend endpoints:
GET    /billing/treatment-codes
POST   /billing/treatment-codes
PUT    /billing/treatment-codes/{id}
DELETE /billing/treatment-codes/{id}
```

### 2. Invoices
```javascript
// Frontend endpoints:
GET    /billing/invoices
POST   /billing/invoices
GET    /billing/invoices/{id}
PUT    /billing/invoices/{id}
POST   /billing/invoices/{id}/send

// Client-specific:
GET    /client/invoices
GET    /client/invoices/{id}/download
```

### 3. Reports
```javascript
// Frontend endpoints:
GET    /billing/reports/revenue
GET    /billing/reports/tax
```

## Actual Backend Billing Endpoints

### 1. Treatment Codes (Therapist)
```javascript
// Backend endpoints:
GET    /api/billing/treatment-codes
POST   /api/billing/treatment-codes
PUT    /api/billing/treatment-codes/{id}
DELETE /api/billing/treatment-codes/{id}
```

### 2. Session Billing (Therapist)
```javascript
// Backend endpoints - NOT IMPLEMENTED IN FRONTEND:
POST   /api/billing/sessions/{appointmentId}/billing
GET    /api/billing/sessions/{sessionId}/billing-status
```

### 3. Client Billing Preferences
```javascript
// Backend endpoints - NOT IMPLEMENTED IN FRONTEND:
GET    /api/billing/client/preferences
PUT    /api/billing/client/preferences
```

### 4. Immediate Payment (Client)
```javascript
// Backend endpoints - NOT IMPLEMENTED IN FRONTEND:
POST   /api/billing/sessions/{sessionId}/pay-now
GET    /api/billing/sessions/{sessionId}/payment-status
```

### 5. Client Invoices
```javascript
// Backend endpoints:
GET    /api/payments/client/invoices
GET    /api/payments/client/invoices/unpaid
GET    /api/payments/client/invoices/{invoiceId}/download
```

### 6. Admin Billing Functions
```javascript
// Backend endpoints - NOT IMPLEMENTED IN FRONTEND:
GET    /api/billing/admin/pending-sessions
GET    /api/billing/admin/consolidated-preview
POST   /api/billing/admin/generate-invoices
PUT    /api/billing/admin/price-permissions
```

### 7. SEPA/Payment Methods
```javascript
// Frontend has these in endpoints.ts:
GET    /client/payment-methods
POST   /client/payment-methods/sepa
DELETE /client/payment-methods/{id}
PUT    /client/payment-methods/{id}/set-default

// But backend expects:
GET    /api/payments/client/payment-methods
POST   /api/payments/client/payment-methods/sepa
DELETE /api/payments/client/payment-methods/{id}
PUT    /api/payments/client/payment-methods/{id}/set-default
```

## Components Using Billing Features

### 1. TreatmentCodesManagement.tsx
- **Location**: `/src/pages/roles/therapist/treatment-codes/TreatmentCodesManagement.tsx`
- **Uses**: `realApiService.billing.getTreatmentCodes()` → `/billing/treatment-codes`
- **Issue**: Missing `/api` prefix

### 2. ClientInvoices.tsx
- **Location**: `/src/pages/roles/client/invoices/ClientInvoices.tsx`
- **Uses**: `clientApi.getInvoices()` → `/client/invoices`
- **Issue**: Should use `/api/payments/client/invoices`

### 3. PaymentMethods.tsx
- **Location**: `/src/pages/roles/client/PaymentMethods.tsx`
- **Uses**: `clientApi.getPaymentMethods()` → `/client/payment-methods`
- **Issue**: Should use `/api/payments/client/payment-methods`

### 4. TherapistInvoices.tsx
- **Location**: `/src/pages/roles/therapist/invoices/TherapistInvoices.tsx`
- **Uses**: `realApiService.invoices.getAll()` → `/invoices`
- **Issue**: Using generic endpoint, not role-specific

## Missing Frontend Features

### 1. Session Billing Submission
- No component for therapists to submit billing after sessions
- No UI for selecting treatment codes and adjusting prices
- No integration with appointment completion flow

### 2. Client Billing Preferences
- No UI for clients to set payment preferences
- No option to enable/disable immediate payment
- No consolidated invoicing settings

### 3. Immediate Payment Flow
- No "Pay Now" button after sessions
- No payment status tracking
- No Mollie payment integration

### 4. Admin Invoice Generation
- No UI for monthly invoice generation
- No preview of pending sessions
- No bulk invoice creation

### 5. Price Adjustment Permissions
- No UI for admin to set price permissions
- No conditional UI for therapists based on permissions

## API Endpoint Mismatches

| Feature | Frontend Endpoint | Backend Endpoint | Status |
|---------|------------------|------------------|---------|
| Treatment Codes | `/billing/treatment-codes` | `/api/billing/treatment-codes` | ❌ Missing prefix |
| Session Billing | Not implemented | `/api/billing/sessions/{id}/billing` | ❌ Missing |
| Client Preferences | Not implemented | `/api/billing/client/preferences` | ❌ Missing |
| Pay Now | Not implemented | `/api/billing/sessions/{id}/pay-now` | ❌ Missing |
| Client Invoices | `/client/invoices` | `/api/payments/client/invoices` | ❌ Wrong path |
| Payment Methods | `/client/payment-methods` | `/api/payments/client/payment-methods` | ❌ Missing prefix |
| Admin Billing | Not implemented | `/api/billing/admin/*` | ❌ Missing |

## Required Frontend Updates

### 1. Update realApi.ts
- Fix all billing endpoint paths to match backend
- Add missing billing endpoints
- Ensure proper error handling for 404s

### 2. Create Missing Components
- SessionBillingForm.tsx for post-session billing
- ClientBillingPreferences.tsx for payment settings
- PayNowButton.tsx for immediate payments
- AdminInvoiceGenerator.tsx for monthly invoices

### 3. Update Existing Components
- Fix API calls in TreatmentCodesManagement
- Update ClientInvoices to use correct endpoints
- Fix PaymentMethods endpoint calls

### 4. Add Billing to Workflows
- Integrate billing submission after appointment completion
- Add payment options to client dashboard
- Show billing status in appointment lists

## Recommended Implementation Order

1. **Phase 1: Fix Existing Endpoints**
   - Update all billing endpoints in realApi.ts
   - Fix treatment codes management
   - Fix client invoices and payment methods

2. **Phase 2: Session Billing**
   - Create session billing submission form
   - Integrate with appointment completion
   - Add billing status tracking

3. **Phase 3: Payment Features**
   - Implement client billing preferences
   - Add immediate payment flow
   - Integrate Mollie payment links

4. **Phase 4: Admin Features**
   - Create invoice generation UI
   - Add pending sessions view
   - Implement price permission management

## Testing Considerations

- All billing endpoints require authentication
- Role-based access control must be respected
- Test with Railway backend URL: `https://praktijk-epd-backend-production.up.railway.app/api`
- Ensure proper error handling for Moneybird/Mollie failures