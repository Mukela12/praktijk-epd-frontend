# Bookkeeper User Flow Documentation

## Overview
The bookkeeper module provides comprehensive financial management, invoice handling, reporting, and communication features for practice financial operations.

## Main User Flows

### 1. Dashboard Overview
**Path:** `/bookkeeper/dashboard`

The dashboard provides a quick overview of:
- **Welcome Section**: Personalized greeting with quick action buttons
- **Financial Metrics**: 
  - Revenue Today (real-time income tracking)
  - Pending Payments (outstanding invoices requiring attention)
  - Monthly Revenue (total for current month)
  - Active Clients (currently engaged clients)
- **Recent Invoices**: Latest 5 invoices with status indicators
- **Overdue Invoices**: Priority list of overdue payments requiring action

### 2. Invoice Management
**Path:** `/bookkeeper/invoices`

#### Create Invoice Flow:
1. Click "New Invoice" button
2. Fill in invoice details:
   - Invoice number (auto-generated or custom)
   - Select client from dropdown
   - Select therapist (optional)
   - Set invoice date and due date
   - Choose status (draft, sent, paid, overdue, cancelled)
   - Add line items with description, quantity, rate
   - Select payment method
   - Add notes (optional)
3. Save as draft or send immediately

#### Edit Invoice Flow:
1. Click edit icon on any invoice in the list
2. Modify any fields in the inline form
3. Update invoice status
4. Save changes

#### Delete Invoice Flow:
1. Click delete icon on invoice
2. Confirm deletion in dialog
3. Invoice is permanently removed

#### Bulk Operations:
- Select multiple invoices using checkboxes
- Perform bulk actions: Send, Mark as Paid, Export

### 3. Financial Reports
**Path:** `/bookkeeper/reports`

#### Available Reports:
1. **Financial Summary**: Overall revenue, profit margins, and financial health
2. **Invoice Status Report**: Breakdown of invoices by status
3. **Client Analysis**: Revenue per client, payment patterns
4. **Therapist Performance**: Sessions and revenue by therapist
5. **Monthly Trends**: Month-over-month financial trends
6. **Payment Methods Analysis**: Revenue breakdown by payment type

#### Report Generation Flow:
1. Select report period (This Month, Last Month, Quarter, Year)
2. Click "Generate" on desired report type
3. View inline preview with charts and data
4. Export options: PDF, Excel, CSV

### 4. Messages & Communication
**Path:** `/bookkeeper/messages`

#### Features:
- **Inbox Management**: View all financial-related communications
- **Message Filtering**: By status, category, priority
- **Compose Messages**: Send billing inquiries, payment reminders
- **Message Actions**: Reply, Archive, Mark as Read/Unread

### 5. Financial Dashboard
**Path:** `/bookkeeper/financial`

Comprehensive financial analytics including:
- Revenue trends visualization
- Payment method distribution
- Outstanding balance tracking
- Cash flow analysis

### 6. Settings
**Path:** `/bookkeeper/settings`

Configure:
- Personal information
- Notification preferences
- Report settings
- Export preferences

## Key Features & Workflows

### Invoice Status Management
- **Draft**: Initial creation, can be edited freely
- **Sent**: Invoice delivered to client, awaiting payment
- **Paid**: Payment received and confirmed
- **Overdue**: Past due date, requires follow-up
- **Cancelled**: Voided invoice

### Payment Tracking
1. Monitor incoming payments through dashboard
2. Match payments to invoices
3. Update invoice status to "Paid"
4. Generate payment receipts

### Automated Reminders
- System tracks overdue invoices
- Send payment reminders with one click
- Track reminder history

### Financial Reporting Workflow
1. **Daily**: Check dashboard for new payments and overdue invoices
2. **Weekly**: Review pending payments, send reminders
3. **Monthly**: Generate comprehensive financial reports
4. **Quarterly**: Analyze trends, prepare tax documentation

## API Endpoints Used

### Bookkeeper Specific:
- `GET /bookkeeper/dashboard` - Dashboard metrics
- `GET /bookkeeper/invoices` - List invoices
- `POST /bookkeeper/invoices` - Create invoice
- `PUT /bookkeeper/invoices/:id` - Update invoice
- `DELETE /bookkeeper/invoices/:id` - Delete invoice
- `GET /bookkeeper/reports` - Generate reports
- `GET /bookkeeper/messages` - Get messages
- `POST /bookkeeper/messages` - Send message

### Shared Endpoints:
- `GET /clients` - Get client list
- `GET /therapists` - Get therapist list
- `GET /appointments` - Get appointments for billing

## Best Practices

### Daily Tasks:
1. Check dashboard for overnight payments
2. Review and address overdue invoices
3. Process new session invoices
4. Respond to billing inquiries

### Weekly Tasks:
1. Send payment reminders for overdue accounts
2. Generate weekly revenue report
3. Reconcile payments with bank statements
4. Review upcoming invoice due dates

### Monthly Tasks:
1. Generate comprehensive financial reports
2. Analyze payment trends and client patterns
3. Prepare summary for practice management
4. Archive completed transactions

## Error Handling

### Common Issues:
1. **Failed Invoice Creation**: Check all required fields are filled
2. **Payment Mismatch**: Verify invoice amount matches payment
3. **Report Generation Timeout**: Reduce date range or try again
4. **Message Send Failure**: Check recipient details

### Data Validation:
- Invoice amounts must be positive numbers
- Due dates must be future dates
- Client selection is required for invoices
- Payment methods must be selected for paid invoices

## Security Considerations

- All financial data is encrypted in transit
- Role-based access control ensures data privacy
- Audit logs track all financial transactions
- Sensitive payment information is masked
- Session timeout for security

## Mobile Considerations

The interface is fully responsive with:
- Touch-friendly controls
- Simplified mobile navigation
- Optimized table views for small screens
- Swipe actions for common tasks