import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import { Invoice as InvoiceEntity, InvoiceItem as InvoiceItemEntity } from '@/types/entities';
import { formatDate, formatCurrency } from '@/utils/dateFormatters';
import InvoiceView from '@/components/invoices/InvoiceView';
import InvoiceViewInline from '@/components/invoices/InvoiceViewInline';

// Extend the Invoice type to include computed fields
interface Invoice extends InvoiceEntity {
  therapistName?: string;
  sessionDate?: string;
  sessionType?: string;
  therapist?: any;
  appointment?: any;
  payment_method?: string;
}

interface InvoiceItem extends InvoiceItemEntity {}

const ClientInvoices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, info } = useAlert();
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInlineView, setShowInlineView] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await clientApi.getInvoices(params);
      
      if (response.success && response.data) {
        const invoiceData = response.data.invoices || [];
        // Process invoices to add computed fields
        const processedInvoices = invoiceData.map((inv: any) => ({
          ...inv,
          therapistName: inv.therapist ? `${inv.therapist.first_name} ${inv.therapist.last_name}` : 'Unknown Therapist',
          sessionDate: inv.appointment?.appointment_date || inv.issue_date,
          sessionType: inv.items?.[0]?.description || 'Therapy Session'
        }));
        setInvoices(processedInvoices);
        calculateStats(processedInvoices);
      }
    } catch (err) {
      error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const stats = invoiceList.reduce((acc, invoice) => {
      acc.totalInvoices++;
      
      if (invoice.status === 'paid') {
        acc.paidAmount += Number(invoice.total_amount);
      } else if (invoice.status === 'overdue') {
        acc.overdueAmount += Number(invoice.total_amount);
        acc.unpaidAmount += Number(invoice.total_amount);
      } else if (invoice.status === 'sent') {
        acc.unpaidAmount += Number(invoice.total_amount);
      }
      
      return acc;
    }, {
      totalInvoices: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      overdueAmount: 0
    });
    
    setStats(stats);
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      // Navigate to payment page or trigger payment flow
      info('Redirecting to payment...');
      // In a real app, this would integrate with payment provider
      navigate(`/client/pay-invoice/${invoice.id}`);
    } catch (err) {
      error('Failed to process payment');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setIsDownloading(true);
      // In a real app, this would call an API to get the PDF
      const response = await clientApi.downloadInvoice(invoiceId);
      
      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      success('Invoice downloaded successfully');
    } catch (err) {
      error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'sent':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'draft':
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-client-active';
      case 'overdue':
        return 'status-client-discontinued';
      case 'sent':
        return 'status-priority-medium';
      case 'draft':
        return 'status-concept';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        (invoice.therapistName?.toLowerCase().includes(searchLower) || false) ||
        (invoice.sessionType?.toLowerCase().includes(searchLower) || false)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If showing inline invoice view
  if (showInlineView && selectedInvoice) {
    return (
      <InvoiceViewInline
        invoice={selectedInvoice}
        onBack={() => {
          setShowInlineView(false);
          setSelectedInvoice(null);
        }}
        onDownload={() => handleDownloadInvoice(selectedInvoice.id)}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <DocumentTextIcon className="w-8 h-8" />
              </div>
              Invoices
            </h1>
            <p className="text-body text-blue-50 mt-2">
              View and manage your therapy session invoices
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Unpaid</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.unpaidAmount)}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number, therapist, or session type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="select-premium"
              >
                <option value="all">All Invoices</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">No invoices found</h3>
          <p className="text-body-sm text-gray-600">
            {filter === 'all' ? 'You don\'t have any invoices yet' : `No ${filter} invoices found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="heading-section">Invoice #{invoice.invoice_number}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-body-sm">
                      <div>
                        <p className="text-caption mb-1">Session Date</p>
                        <p className="text-gray-700">{invoice.sessionDate ? new Date(invoice.sessionDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-caption mb-1">Therapist</p>
                        <p className="text-gray-700">{invoice.therapistName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-caption mb-1">Session Type</p>
                        <p className="text-gray-700">{invoice.sessionType || 'Therapy Session'}</p>
                      </div>
                      <div>
                        <p className="text-caption mb-1">Amount</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(Number(invoice.total_amount))}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-body-sm text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                      {invoice.paid_date && (
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowInlineView(true);
                      }}
                      className="btn-premium-ghost text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      disabled={isDownloading}
                      className="btn-premium-secondary text-sm flex items-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {invoice.status === 'sent' || invoice.status === 'overdue' ? (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="btn-premium-primary text-sm flex items-center space-x-1"
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        <span>Pay Now</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => setShowInvoiceModal(false)}
          onDownload={() => handleDownloadInvoice(selectedInvoice.id)}
          onPrint={() => {
            window.print();
          }}
        />
      )}

      {/* Payment Methods Notice */}
      {stats.unpaidAmount > 0 && (
        <div className="mt-8 card-premium bg-blue-50 border-blue-200 p-6">
          <div className="flex items-start">
            <BanknotesIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Automatic Payments</h3>
              <p className="text-body-sm text-blue-800 mb-3">
                Set up automatic payments to ensure your invoices are paid on time and avoid late fees.
              </p>
              <button
                onClick={() => navigate('/client/payment-methods')}
                className="btn-premium-primary text-sm"
              >
                Manage Payment Methods
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInvoices;