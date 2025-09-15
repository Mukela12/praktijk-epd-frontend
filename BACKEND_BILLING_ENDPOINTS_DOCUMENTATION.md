# Backend Billing Endpoints Documentation

## Base URL
```
https://praktijk-epd-backend-production.up.railway.app/api
```

## Authentication
All billing endpoints require authentication via Bearer token:
```
Authorization: Bearer {accessToken}
```

## 1. Treatment Codes Management (Therapist)

### Get All Treatment Codes
```http
GET /api/billing/treatment-codes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treatmentCodes": [
      {
        "id": "uuid",
        "code": "12345",
        "description": "Individual Therapy Session",
        "duration_minutes": 60,
        "base_price": 85.00,
        "is_active": true,
        "is_insurance_covered": true,
        "insurance_percentage": 80,
        "category": "individual",
        "notes": "Standard therapy session",
        "usage_count": 45,
        "last_used": "2025-01-15T10:00:00Z",
        "total_revenue": 3825.00,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Create Treatment Code
```http
POST /api/billing/treatment-codes
```

**Request Body:**
```json
{
  "code": "12345",
  "description": "Individual Therapy Session",
  "duration_minutes": 60,
  "base_price": 85.00,
  "is_active": true,
  "is_insurance_covered": false,
  "insurance_percentage": 0,
  "category": "individual",
  "notes": "Optional notes"
}
```

**Validation Rules:**
- `code`: Required, exactly 5 digits
- `description`: Required, max 255 characters
- `duration_minutes`: Required, 15-180
- `base_price`: Required, positive number
- `category`: Optional, one of: individual, couples, family, group, assessment, consultation, emergency, other

### Update Treatment Code
```http
PUT /api/billing/treatment-codes/{id}
```

**Request Body:** Same as create, all fields optional

### Delete Treatment Code
```http
DELETE /api/billing/treatment-codes/{id}
```

## 2. Session Billing (Therapist)

### Submit Session Billing
```http
POST /api/billing/sessions/{appointmentId}/billing
```

**Request Body:**
```json
{
  "treatment_code_id": "uuid",
  "duration_minutes": 60,
  "adjusted_price": 85.00,
  "price_adjustment_reason": "Extended session"
}
```

**Validation:**
- Appointment must be completed
- Treatment code must belong to therapist
- Price adjustment requires permission
- Reason required if price adjusted

**Response:**
```json
{
  "success": true,
  "data": {
    "session_billing_id": "uuid",
    "status": "pending",
    "amount": 85.00,
    "invoice_date": null
  }
}
```

### Check Billing Status
```http
GET /api/billing/sessions/{sessionId}/billing-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_billed": true,
    "billing_status": "pending",
    "billed_amount": 85.00,
    "treatment_code": "12345",
    "invoice_id": null,
    "billed_at": "2025-01-15T11:00:00Z"
  }
}
```

## 3. Client Billing Preferences

### Get Preferences
```http
GET /api/billing/client/preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferred_payment_method": "sepa",
    "enable_direct_debit": true,
    "enable_immediate_payment": false,
    "consolidated_invoicing": true,
    "invoice_language": "nl",
    "invoice_delivery_method": "email",
    "payment_terms_accepted": true,
    "updated_at": "2025-01-15T00:00:00Z"
  }
}
```

### Update Preferences
```http
PUT /api/billing/client/preferences
```

**Request Body:**
```json
{
  "preferred_payment_method": "sepa",
  "enable_direct_debit": true,
  "enable_immediate_payment": false,
  "consolidated_invoicing": true,
  "invoice_language": "nl"
}
```

**Validation:**
- `preferred_payment_method`: "sepa" or "manual"
- `invoice_language`: "nl" or "en"

## 4. Immediate Payment (Client)

### Create Payment Link
```http
POST /api/billing/sessions/{sessionId}/pay-now
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_url": "https://www.mollie.com/checkout/select-method/7UhSN1zuXS",
    "payment_id": "tr_WDqYK6vllg",
    "amount": 85.00,
    "expires_at": "2025-01-15T12:00:00Z"
  }
}
```

### Check Payment Status
```http
GET /api/billing/sessions/{sessionId}/payment-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_status": "paid",
    "paid_at": "2025-01-15T11:30:00Z",
    "payment_method": "ideal",
    "amount": 85.00
  }
}
```

## 5. Client Invoices

### Get All Invoices
```http
GET /api/payments/client/invoices
```

**Query Parameters:**
- `start_date`: ISO date (2025-01-01)
- `end_date`: ISO date (2025-12-31)
- `status`: draft, sent, paid, overdue, cancelled
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoice_number": "2025-0001",
        "client_id": "uuid",
        "amount": 340.00,
        "tax_amount": 0.00,
        "total_amount": 340.00,
        "status": "sent",
        "issue_date": "2025-01-31",
        "due_date": "2025-02-14",
        "payment_link": "https://payment.link",
        "moneybird_id": "123456",
        "items": [
          {
            "description": "Therapy Session - 2025-01-15",
            "quantity": 1,
            "unit_price": 85.00,
            "total": 85.00
          }
        ],
        "created_at": "2025-01-31T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

### Get Unpaid Invoices
```http
GET /api/payments/client/invoices/unpaid
```

### Download Invoice PDF
```http
GET /api/payments/client/invoices/{invoiceId}/download
```

**Response:** PDF file stream

## 6. Payment Methods (Client)

### Get Payment Methods
```http
GET /api/payments/client/payment-methods
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_methods": [
      {
        "id": "uuid",
        "type": "sepa",
        "iban": "NL91ABNA0417164300",
        "mandate_id": "mdt_h3gAaWNktR",
        "mandate_status": "active",
        "is_default": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Add SEPA Mandate
```http
POST /api/payments/client/payment-methods/sepa
```

**Request Body:**
```json
{
  "iban": "NL91ABNA0417164300",
  "account_holder": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mandate_url": "https://www.mollie.com/checkout/mandate/mdt_h3gAaWNktR",
    "mandate_id": "mdt_h3gAaWNktR"
  }
}
```

### Remove Payment Method
```http
DELETE /api/payments/client/payment-methods/{methodId}
```

### Set Default Payment Method
```http
PUT /api/payments/client/payment-methods/{methodId}/set-default
```

## 7. Admin Billing Functions

### View Pending Sessions
```http
GET /api/billing/admin/pending-sessions
```

**Query Parameters:**
- `month`: YYYY-MM format (e.g., "2025-01")
- `therapist_id`: Filter by therapist
- `client_id`: Filter by client

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_sessions": [
      {
        "session_id": "uuid",
        "appointment_date": "2025-01-15",
        "client_name": "John Doe",
        "therapist_name": "Dr. Smith",
        "treatment_code": "12345",
        "amount": 85.00,
        "billing_status": "pending"
      }
    ],
    "summary": {
      "total_sessions": 45,
      "total_amount": 3825.00,
      "by_therapist": {
        "Dr. Smith": 2000.00,
        "Dr. Jones": 1825.00
      }
    }
  }
}
```

### Preview Invoice Generation
```http
GET /api/billing/admin/consolidated-preview
```

**Query Parameters:**
- `month`: YYYY-MM format (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "preview": {
      "total_clients": 25,
      "total_invoices": 25,
      "total_amount": 3825.00,
      "clients": [
        {
          "client_id": "uuid",
          "client_name": "John Doe",
          "session_count": 4,
          "total_amount": 340.00,
          "payment_method": "sepa",
          "has_mandate": true
        }
      ]
    }
  }
}
```

### Generate Monthly Invoices
```http
POST /api/billing/admin/generate-invoices
```

**Request Body:**
```json
{
  "month": "2025-01",
  "dry_run": false,
  "send_emails": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generated": 25,
    "failed": 0,
    "total_amount": 3825.00,
    "sepa_scheduled": 20,
    "manual_payment": 5,
    "errors": []
  }
}
```

### Set Price Adjustment Permission
```http
PUT /api/billing/admin/price-permissions
```

**Request Body:**
```json
{
  "client_id": "uuid",
  "therapist_id": "uuid",
  "can_adjust_price": true,
  "max_discount_percentage": 20,
  "valid_until": "2025-12-31"
}
```

## 8. Bookkeeper Endpoints

### Get All Invoices (Bookkeeper View)
```http
GET /api/bookkeeper/invoices
```

**Additional fields in response:**
- Client payment history
- Outstanding balance
- Payment reminders sent

### Send Payment Reminder
```http
POST /api/bookkeeper/invoices/{invoiceId}/reminder
```

**Request Body:**
```json
{
  "reminder_type": "friendly",
  "custom_message": "Optional custom message"
}
```

### Process Manual Payment
```http
POST /api/bookkeeper/payments
```

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "amount": 85.00,
  "payment_method": "bank_transfer",
  "payment_date": "2025-01-15",
  "reference": "Payment reference",
  "notes": "Optional notes"
}
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": [
    {
      "field": "code",
      "message": "Code must be 5 digits"
    }
  ]
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Webhook Endpoints

### Mollie Payment Webhook
```http
POST /api/webhooks/mollie
```

### Moneybird Invoice Webhook
```http
POST /api/webhooks/moneybird
```

**Header:** `X-Moneybird-Signature` for HMAC verification