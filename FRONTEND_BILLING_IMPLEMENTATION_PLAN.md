# Frontend Billing Implementation Plan

## Overview

This plan outlines the required changes to fully integrate the frontend with the backend billing system. The implementation is divided into phases to ensure a systematic rollout.

## Phase 1: Fix Existing Endpoints (Priority: HIGH)

### 1.1 Update realApi.ts Billing Endpoints

**File**: `/src/services/realApi.ts`

```javascript
// Update billing object with correct endpoints
billing: {
  // Treatment codes
  getTreatmentCodes: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/billing/treatment-codes');
    return response.data;
  },
  
  createTreatmentCode: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/billing/treatment-codes', data);
    requestManager.clearRelatedCache('/api/billing/treatment-codes');
    return response.data;
  },
  
  updateTreatmentCode: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/billing/treatment-codes/${id}`, data);
    requestManager.clearRelatedCache('/api/billing/treatment-codes');
    return response.data;
  },
  
  deleteTreatmentCode: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/api/billing/treatment-codes/${id}`);
    requestManager.clearRelatedCache('/api/billing/treatment-codes');
    return response.data;
  },

  // Session billing
  submitSessionBilling: async (appointmentId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/api/billing/sessions/${appointmentId}/billing`, data);
    return response.data;
  },
  
  getSessionBillingStatus: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/billing/sessions/${sessionId}/billing-status`);
    return response.data;
  },

  // Client preferences
  getClientPreferences: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/billing/client/preferences');
    return response.data;
  },
  
  updateClientPreferences: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/api/billing/client/preferences', data);
    return response.data;
  },

  // Immediate payment
  createPaymentLink: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/api/billing/sessions/${sessionId}/pay-now`);
    return response.data;
  },
  
  getPaymentStatus: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/billing/sessions/${sessionId}/payment-status`);
    return response.data;
  },

  // Admin functions
  getPendingSessions: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/billing/admin/pending-sessions', { params });
    return response.data;
  },
  
  getConsolidatedPreview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/billing/admin/consolidated-preview', { params });
    return response.data;
  },
  
  generateInvoices: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/billing/admin/generate-invoices', data);
    return response.data;
  },
  
  setPricePermissions: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/api/billing/admin/price-permissions', data);
    return response.data;
  }
}
```

### 1.2 Update Client API Endpoints

**File**: `/src/services/endpoints.ts`

```javascript
// Update clientApi with correct payment endpoints
getInvoices: async (params?: { status?: string }): Promise<ApiResponse<any>> => {
  const response = await api.get('/api/payments/client/invoices', { params });
  return response.data;
},

getUnpaidInvoices: async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/api/payments/client/invoices/unpaid');
  return response.data;
},

downloadInvoice: async (invoiceId: string): Promise<any> => {
  const response = await api.get(`/api/payments/client/invoices/${invoiceId}/download`, {
    responseType: 'blob'
  });
  return response.data;
},

// Payment methods
getPaymentMethods: async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/api/payments/client/payment-methods');
  return response.data;
},

addPaymentMethod: async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post('/api/payments/client/payment-methods/sepa', data);
  return response.data;
},

removePaymentMethod: async (methodId: string): Promise<ApiResponse<any>> => {
  const response = await api.delete(`/api/payments/client/payment-methods/${methodId}`);
  return response.data;
},

setDefaultPaymentMethod: async (methodId: string): Promise<ApiResponse<any>> => {
  const response = await api.put(`/api/payments/client/payment-methods/${methodId}/set-default`);
  return response.data;
}
```

### 1.3 Fix Existing Components

1. **TreatmentCodesManagement.tsx** - Already uses realApiService.billing, just needs endpoint fixes
2. **ClientInvoices.tsx** - Update to use correct endpoint path
3. **PaymentMethods.tsx** - Update to use correct endpoint paths
4. **TherapistInvoices.tsx** - Create proper therapist-specific invoice view

## Phase 2: Session Billing (Priority: HIGH)

### 2.1 Create SessionBillingForm Component

**New File**: `/src/pages/roles/therapist/appointments/SessionBillingForm.tsx`

```jsx
interface SessionBillingFormProps {
  appointmentId: string;
  clientName: string;
  appointmentDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Component features:
// - Treatment code dropdown (filtered by therapist)
// - Duration input with default from appointment
// - Price display with adjustment option (if permitted)
// - Price adjustment reason textarea (required if adjusted)
// - Submit and cancel buttons
```

### 2.2 Integrate with Appointment Completion

**Update**: `/src/pages/roles/therapist/appointments/AppointmentDetail.tsx`

Add billing submission step after marking appointment as completed:
```jsx
// After appointment completion
if (appointment.status === 'completed' && !appointment.is_billed) {
  setShowBillingForm(true);
}
```

### 2.3 Add Billing Status Indicators

Update appointment lists to show billing status:
- ✅ Billed
- ⏳ Pending billing
- 💰 Paid
- 📧 Invoice sent

## Phase 3: Client Payment Features (Priority: MEDIUM)

### 3.1 Create ClientBillingPreferences Component

**New File**: `/src/pages/roles/client/settings/BillingPreferences.tsx`

Features:
- Payment method selection (SEPA/Manual)
- Enable/disable immediate payment
- Consolidated invoicing toggle
- Invoice language preference
- Save preferences button

### 3.2 Create PayNowButton Component

**New File**: `/src/components/billing/PayNowButton.tsx`

```jsx
interface PayNowButtonProps {
  sessionId: string;
  amount: number;
  onSuccess?: () => void;
}

// Features:
// - Generate payment link on click
// - Redirect to Mollie
// - Poll payment status
// - Show success/error state
```

### 3.3 Update Client Dashboard

Add billing widgets:
- Unpaid invoices alert
- Quick pay buttons for recent sessions
- Payment method status
- Link to billing preferences

## Phase 4: Admin Invoice Generation (Priority: MEDIUM)

### 4.1 Create AdminInvoiceGenerator Component

**New File**: `/src/pages/roles/admin/billing/InvoiceGenerator.tsx`

Features:
- Month selector
- Preview pending sessions
- Dry run option
- Generate invoices button
- Progress indicator
- Results summary

### 4.2 Create PendingSessionsView Component

**New File**: `/src/pages/roles/admin/billing/PendingSessionsView.tsx`

Features:
- Filter by month
- Group by client
- Show totals
- Export to CSV
- Mark exceptions

### 4.3 Create PricePermissionsManager Component

**New File**: `/src/pages/roles/admin/billing/PricePermissionsManager.tsx`

Features:
- Client-therapist permission grid
- Enable/disable price adjustments
- Set max discount percentage
- Set expiration date

## Phase 5: Enhanced Features (Priority: LOW)

### 5.1 Billing Dashboard

Create comprehensive billing dashboard for each role:

**Therapist**: 
- Monthly revenue
- Pending billings
- Treatment code usage
- Average session price

**Client**:
- Payment history
- Upcoming payments
- Total spent
- Payment methods

**Admin**:
- Revenue overview
- Outstanding invoices
- Payment success rate
- SEPA collection status

### 5.2 Reporting Features

- Export invoices to CSV/PDF
- Generate tax reports
- Revenue by therapist
- Client payment history

## Implementation Steps

### Week 1: Phase 1
1. Update all API endpoints in realApi.ts
2. Fix existing components to use correct endpoints
3. Test treatment codes management
4. Test client invoices and payment methods
5. Deploy and verify with backend

### Week 2: Phase 2
1. Create SessionBillingForm component
2. Integrate with appointment workflow
3. Add billing status indicators
4. Test end-to-end billing flow
5. Deploy and monitor

### Week 3: Phase 3
1. Create billing preferences UI
2. Implement immediate payment flow
3. Update client dashboard
4. Test payment integration
5. Deploy with feature flags

### Week 4: Phase 4
1. Create admin billing components
2. Test invoice generation
3. Implement price permissions
4. Full system testing
5. Production deployment

## Testing Requirements

### Unit Tests
- Test all new API service methods
- Test form validations
- Test error handling
- Test role-based access

### Integration Tests
- Test billing submission flow
- Test payment redirect flow
- Test invoice generation
- Test webhook handling

### E2E Tests
- Complete therapy session to payment
- Monthly invoice generation
- SEPA mandate creation
- Payment failure scenarios

## Environment Variables

Add to `.env`:
```
VITE_ENABLE_BILLING=true
VITE_ENABLE_IMMEDIATE_PAYMENT=true
VITE_ENABLE_SEPA=true
VITE_MOLLIE_PROFILE_ID=your_profile_id
```

## Migration Considerations

1. **Existing Sessions**: Add UI to bill historical sessions
2. **Payment Methods**: Migrate existing SEPA mandates
3. **Invoices**: Import historical invoices if needed
4. **Preferences**: Set default preferences for existing clients

## Success Metrics

- All billing endpoints properly connected
- 100% of completed sessions are billed
- Payment success rate > 95%
- Invoice generation time < 5 minutes
- Zero billing-related errors in production

## Risk Mitigation

1. **Payment Failures**: Implement retry logic and notifications
2. **API Errors**: Add comprehensive error handling
3. **Data Loss**: Implement billing audit log
4. **Performance**: Add caching for treatment codes
5. **Security**: Validate all price adjustments server-side