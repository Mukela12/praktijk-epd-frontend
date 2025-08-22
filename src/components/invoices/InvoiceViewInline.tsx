import React from 'react';
import {
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/utils/dateFormatters';
import { PremiumCard, PremiumButton } from '@/components/layout/PremiumLayout';
import PageTransition from '@/components/ui/PageTransition';

interface InvoiceViewInlineProps {
  invoice: any;
  onBack?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

const InvoiceViewInline: React.FC<InvoiceViewInlineProps> = ({ 
  invoice, 
  onBack,
  onPrint,
  onDownload 
}) => {
  // Calculate due date (30 days from issue date)
  const dueDate = new Date(invoice.issue_date);
  dueDate.setDate(dueDate.getDate() + 30);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'overdue':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'sent':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'sent':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Invoices
          </button>
        )}

        {/* Invoice Header */}
        <PremiumCard className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invoice #{invoice.invoice_number}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  <span className="ml-2 capitalize">{invoice.status}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Issued: {formatDate(invoice.issue_date)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {onPrint && (
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={PrinterIcon}
                  onClick={onPrint}
                >
                  Print
                </PremiumButton>
              )}
              {onDownload && (
                <PremiumButton
                  variant="primary"
                  size="sm"
                  icon={ArrowDownTrayIcon}
                  onClick={onDownload}
                >
                  Download PDF
                </PremiumButton>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Practice & Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Practice Information */}
          <PremiumCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Practice Information</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-900">PraktijkEPD Mental Health</p>
                <p className="text-gray-600">Keizersgracht 123</p>
                <p className="text-gray-600">1015 CJ Amsterdam</p>
                <p className="text-gray-600">Netherlands</p>
                
                <div className="pt-2 space-y-1">
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    +31 20 123 4567
                  </div>
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    billing@praktijkepd.nl
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-gray-600">KVK: 12345678</p>
                  <p className="text-gray-600">BTW: NL123456789B01</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Billing Information */}
          <PremiumCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Billing To</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-900">
                  {invoice.client_name || 'Client Name'}
                </p>
                {invoice.client_address && (
                  <>
                    <p className="text-gray-600">{invoice.client_address}</p>
                    <p className="text-gray-600">{invoice.client_city} {invoice.client_postal_code}</p>
                  </>
                )}
                
                <div className="pt-2 space-y-1">
                  {invoice.client_email && (
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      {invoice.client_email}
                    </div>
                  )}
                  {invoice.client_phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {invoice.client_phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Invoice Details */}
        <PremiumCard className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-semibold text-gray-900">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-semibold text-gray-900">{formatDate(dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Therapist</p>
              <p className="font-semibold text-gray-900">{invoice.therapist_name || 'N/A'}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Rate</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.line_items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                      {item.date && (
                        <span className="block text-xs text-gray-500 mt-1">
                          Session date: {formatDate(item.date)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity || 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.rate || item.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.total || item.amount)}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      Therapy Session
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.total_amount / 1.21)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                    BTW (21%)
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.total_amount - (invoice.total_amount / 1.21))}
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={3} className="px-4 py-3 text-base font-semibold text-gray-900 text-right">
                    Total Amount
                  </td>
                  <td className="px-4 py-3 text-base font-bold text-blue-600 text-right">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions */}
          {invoice.status !== 'paid' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CurrencyEuroIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">Payment Instructions</p>
                  <p className="text-yellow-800">
                    Please pay within 30 days of the invoice date. You can pay via bank transfer to:
                  </p>
                  <div className="mt-2 space-y-1 text-yellow-800">
                    <p><strong>Bank:</strong> ABN AMRO</p>
                    <p><strong>IBAN:</strong> NL12 ABNA 0123 4567 89</p>
                    <p><strong>Reference:</strong> {invoice.invoice_number}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </PremiumCard>
      </div>
    </PageTransition>
  );
};

export default InvoiceViewInline;