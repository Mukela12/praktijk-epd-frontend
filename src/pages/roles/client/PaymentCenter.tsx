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
  DocumentArrowDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { clientApi } from '@/services/endpoints';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/store/authStore';
import { Invoice } from '@/types/entities';
import { formatDate, formatCurrency, isPast } from '@/utils/dateFormatters';

const PaymentCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error, info, warning } = useAlert();
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('unpaid');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pendingCount: 0,
    overdueCount: 0,
    nextPaymentDate: null as Date | null,
    hasSepaMandate: false
  });

  useEffect(() => {
    loadInvoices();
    checkPaymentMethods();
  }, [filter]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const params = filter === 'all' ? {} : 
        filter === 'unpaid' ? { status: 'sent' } : 
        { status: filter };
      const response = await clientApi.getInvoices(params);
      
      if (response.success && response.data) {
        const invoiceData = response.data.invoices || [];
        setInvoices(invoiceData);
        calculateStats(invoiceData);
      }
    } catch (err) {
      error(t('errors.loadInvoices'));
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentMethods = async () => {
    try {
      const response = await clientApi.getPaymentMethods();
      if (response.success && response.data) {
        const hasSepaMethods = response.data.paymentMethods?.some((m: any) => m.type === 'sepa');
        setStats(prev => ({ ...prev, hasSepaMandate: hasSepaMethods }));
      }
    } catch (err) {
      // Payment methods endpoint might not exist yet
      console.error('Error checking payment methods:', err);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const now = new Date();
    let totalDue = 0;
    let totalPaid = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let nextPaymentDate: Date | null = null;

    invoiceList.forEach(invoice => {
      const amount = typeof invoice.total_amount === 'string' ? parseFloat(invoice.total_amount) : invoice.total_amount || 0;
      
      if (invoice.status === 'paid') {
        totalPaid += amount;
      } else if (invoice.status === 'overdue') {
        totalDue += amount;
        overdueCount++;
      } else if (invoice.status === 'draft' || invoice.status === 'sent') {
        totalDue += amount;
        pendingCount++;
        
        // Find next payment date
        const dueDate = new Date(invoice.due_date);
        if (dueDate > now && (!nextPaymentDate || dueDate < nextPaymentDate)) {
          nextPaymentDate = dueDate;
        }
      }
    });
    
    setStats(prev => ({
      ...prev,
      totalDue,
      totalPaid,
      pendingCount,
      overdueCount,
      nextPaymentDate
    }));
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;

    try {
      setProcessingPayment(true);
      
      // Check if SEPA is available
      if (stats.hasSepaMandate) {
        info('Deze factuur wordt automatisch geïncasseerd via SEPA');
        setShowPaymentModal(false);
        return;
      }

      // Otherwise, create payment link
      info('U wordt doorgestuurd naar de betaalpagina...');
      
      // In a real implementation, this would call the backend to create a Mollie payment
      // For now, we'll simulate the payment process
      setTimeout(() => {
        success('Betaling gestart. U ontvangt een bevestiging per e-mail.');
        setShowPaymentModal(false);
        loadInvoices(); // Refresh invoices
      }, 2000);
    } catch (err) {
      error('Fout bij het starten van de betaling');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const blob = await clientApi.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factuur-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Factuur gedownload');
    } catch (err) {
      error('Fout bij het downloaden van de factuur');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'sent':
      case 'pending':
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
      case 'pending':
        return 'status-priority-medium';
      case 'draft':
        return 'status-concept';
      default:
        return '';
    }
  };


  const filteredInvoices = invoices.filter(invoice => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return invoice.invoice_number?.toLowerCase().includes(searchLower);
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

  return (
    <div className="container-standard animate-fadeInUp">
      {/* Header */}
      <div className="card-premium gradient-healthcare text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-primary text-white flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <CurrencyEuroIcon className="w-8 h-8" />
              </div>
              Betalingen & Facturen
            </h1>
            <p className="text-body text-blue-50 mt-2">
              Beheer uw betalingen en bekijk uw facturen
            </p>
          </div>
          <button
            onClick={() => navigate('/client/payment-methods')}
            className="btn-premium-white flex items-center space-x-2"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Betaalmethoden</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Te betalen</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDue)}</p>
            </div>
            <CurrencyEuroIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Betaald</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">In afwachting</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pendingCount}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Achterstallig</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Payment Notice */}
      {stats.nextPaymentDate && (
        <div className="card-premium bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6 mb-6">
          <div className="flex items-start">
            <CalendarIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Volgende betaling</h3>
              <p className="text-body-sm text-blue-800">
                Uw volgende factuur vervalt op {formatDate(stats.nextPaymentDate)}.
                {stats.hasSepaMandate && ' Deze wordt automatisch geïncasseerd via SEPA.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-premium mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op factuurnummer..."
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
                <option value="all">Alle facturen</option>
                <option value="unpaid">Onbetaald</option>
                <option value="paid">Betaald</option>
                <option value="overdue">Achterstallig</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-section text-gray-900 mb-2">Geen facturen gevonden</h3>
          <p className="text-body-sm text-gray-600">
            {filter === 'all' ? 'U heeft nog geen facturen' : `Geen ${filter === 'unpaid' ? 'onbetaalde' : filter === 'paid' ? 'betaalde' : 'achterstallige'} facturen`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="card-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="heading-section">Factuur #{invoice.invoice_number}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">
                          {invoice.status === 'draft' ? 'Concept' : 
                           invoice.status === 'sent' || invoice.status === 'pending' ? 'In afwachting' :
                           invoice.status === 'paid' ? 'Betaald' :
                           invoice.status === 'overdue' ? 'Achterstallig' : invoice.status}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-caption mb-1">Vervaldatum</p>
                        <p className="text-body-sm text-gray-700">
                          <CalendarIcon className="w-4 h-4 inline-block mr-1" />
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-caption mb-1">Bedrag</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(typeof invoice.total_amount === 'string' ? parseFloat(invoice.total_amount) : invoice.total_amount || 0)}
                        </p>
                      </div>
                      {(invoice.payment_date || invoice.paid_date) && (
                        <div>
                          <p className="text-caption mb-1">Betaald op</p>
                          <p className="text-body-sm text-green-600">
                            {new Date(invoice.payment_date || invoice.paid_date!).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="btn-premium-ghost text-sm flex items-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {(invoice.status === 'draft' || invoice.status === 'pending' || invoice.status === 'sent' || invoice.status === 'overdue') && (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="btn-premium-primary text-sm flex items-center space-x-1"
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        <span>Betalen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-premium max-w-md w-full animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="heading-section">Factuur betalen</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Sluiten</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-caption mb-1">Factuurnummer</p>
                  <p className="font-semibold">{selectedInvoice.invoice_number}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-caption mb-1">Te betalen bedrag</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(typeof selectedInvoice.total_amount === 'string' ? parseFloat(selectedInvoice.total_amount) : selectedInvoice.total_amount || 0)}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Veilige betaling</p>
                      <p className="text-body-sm text-blue-800">
                        U wordt doorgestuurd naar onze betaalprovider Mollie voor een veilige betaling via iDEAL.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="btn-premium-secondary"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="btn-premium-primary flex items-center space-x-2"
                  >
                    {processingPayment ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Verwerken...</span>
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="w-5 h-5" />
                        <span>Betalen via iDEAL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEPA Notice */}
      {!stats.hasSepaMandate && stats.totalDue > 0 && (
        <div className="mt-8 card-premium bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 p-6">
          <div className="flex items-start">
            <BanknotesIcon className="w-6 h-6 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 mb-2">Automatische betalingen instellen</h3>
              <p className="text-body-sm text-indigo-800 mb-3">
                Stel SEPA automatische incasso in om uw facturen automatisch te laten betalen. 
                Geen gedoe meer met handmatige betalingen!
              </p>
              <button
                onClick={() => navigate('/client/payment-methods')}
                className="btn-premium-primary text-sm"
              >
                SEPA instellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCenter;