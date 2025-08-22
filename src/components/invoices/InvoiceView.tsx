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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/utils/dateFormatters';
import { PremiumButton } from '@/components/layout/PremiumLayout';

interface InvoiceViewProps {
  invoice: any;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ 
  invoice, 
  onClose, 
  onPrint,
  onDownload 
}) => {
  // Calculate due date (30 days from issue date)
  const dueDate = new Date(invoice.issue_date);
  dueDate.setDate(dueDate.getDate() + 30);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'sent':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Invoice #{invoice.invoice_number}</h2>
              <p className="text-purple-100">Issued on {formatDate(invoice.issue_date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
          <div className="flex space-x-3">
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

        {/* Invoice Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Practice Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-violet-600" />
                Practice Information
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">PraktijkEPD Mental Health</p>
                <p>Prinsengracht 123</p>
                <p>1015 DX Amsterdam, Netherlands</p>
                <p className="flex items-center mt-2">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  +31 20 123 4567
                </p>
                <p className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  billing@praktijkepd.nl
                </p>
                <p className="mt-2">
                  <span className="font-medium">KVK:</span> 12345678
                </p>
                <p>
                  <span className="font-medium">BTW:</span> NL123456789B01
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-violet-600" />
                Bill To
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {invoice.client?.first_name} {invoice.client?.last_name}
                </p>
                {invoice.client?.street_address && (
                  <>
                    <p>{invoice.client.street_address}</p>
                    <p>{invoice.client.postal_code} {invoice.client.city}</p>
                  </>
                )}
                <p className="flex items-center mt-2">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {invoice.client?.email}
                </p>
                {invoice.client?.phone && (
                  <p className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {invoice.client.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Therapist</p>
                <p className="font-medium text-gray-900">
                  {invoice.therapist?.first_name} {invoice.therapist?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Session Date</p>
                <p className="font-medium text-gray-900">
                  {invoice.appointment?.appointment_date 
                    ? formatDate(invoice.appointment.appointment_date)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-violet-50 rounded-xl p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">BTW (21%)</span>
                  <span className="text-gray-900">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-violet-200">
                <span className="text-gray-900">Total</span>
                <span className="text-violet-600">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.status !== 'paid' && (
            <div className="mt-8 p-6 bg-yellow-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Please transfer the amount to:</p>
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p><span className="font-medium">Bank:</span> ABN AMRO</p>
                  <p><span className="font-medium">IBAN:</span> NL12 ABNA 0123 4567 89</p>
                  <p><span className="font-medium">BIC:</span> ABNANL2A</p>
                  <p><span className="font-medium">Reference:</span> {invoice.invoice_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;