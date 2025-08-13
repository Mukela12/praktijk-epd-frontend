import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PrinterIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import { bookkeeperApi } from '@/services/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/dateFormatters';
import ReportNotification from '@/components/ui/ReportNotification';

const BookkeeperFinancialDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('this_month');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'details'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'generating' | 'success' | 'error' | 'preview',
    title: '',
    message: ''
  });

  // Load data function
  const loadFinancialData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // Try to use bookkeeper API first
      try {
        const financialOverview = await bookkeeperApi.getFinancialOverview(filterPeriod);
        if (financialOverview.success && financialOverview.data) {
          // Use API data if available
          setInvoices(financialOverview.data.invoices || []);
          setClients(financialOverview.data.clients || []);
          setTherapists(financialOverview.data.therapists || []);
          setLastUpdated(new Date());
          
          setNotification({
            show: true,
            type: 'success',
            title: 'Data Updated',
            message: 'Financial data has been refreshed successfully.'
          });
          return;
        }
      } catch (apiError) {
        console.error('Bookkeeper API error:', apiError);
        // Try alternative API endpoints
        const [invoicesResponse, clientsResponse, therapistsResponse] = await Promise.all([
          realApiService.bookkeeper.getInvoices(),
          realApiService.clients.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (invoicesResponse.success && invoicesResponse.data) {
          setInvoices(invoicesResponse.data);
        }

        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        if (therapistsResponse.success && therapistsResponse.data) {
          setTherapists(therapistsResponse.data);
        }
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error Loading Data',
        message: 'Failed to load financial data. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFinancialData();
  }, []);

  // Reload when filter period changes
  useEffect(() => {
    if (!isLoading) {
      loadFinancialData(false);
    }
  }, [filterPeriod]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFinancialData(false);
  };

  // Calculate financial metrics based on filters
  const getFilteredInvoices = () => {
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      
      // Filter by period
      switch (filterPeriod) {
        case 'this_month':
          if (invoiceDate.getMonth() !== now.getMonth() || invoiceDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
          break;
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          if (invoiceDate.getMonth() !== lastMonth.getMonth() || invoiceDate.getFullYear() !== lastMonth.getFullYear()) {
            return false;
          }
          break;
        case 'this_year':
          if (invoiceDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
          break;
        case 'last_year':
          if (invoiceDate.getFullYear() !== now.getFullYear() - 1) {
            return false;
          }
          break;
      }

      // Filter by type
      if (filterType !== 'all') {
        if (filterType === 'client' && !invoice.client_name) return false;
        if (filterType === 'therapist' && !invoice.therapist_name) return false;
      }

      // Filter by search term
      if (searchTerm) {
        const matchesSearch = 
          (invoice.client_name && invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.therapist_name && invoice.therapist_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }

      return true;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  // Calculate metrics
  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingAmount = filteredInvoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = filteredInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const clientRevenue = filteredInvoices
    .filter(inv => inv.client_name && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const therapistPayments = filteredInvoices
    .filter(inv => inv.therapist_name && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const netProfit = clientRevenue - therapistPayments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'insurance': return 'bg-green-100 text-green-800';
      case 'bank_transfer': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'cash': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group invoices by month for chart data
  const monthlyData = filteredInvoices.reduce((acc, invoice) => {
    if (invoice.status === 'paid') {
      const month = new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + invoice.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-green-100 mt-1">
              Complete financial overview and analytics
            </p>
            <p className="text-green-200 text-sm mt-2">
              Last updated: {formatRelativeTime(lastUpdated)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                isRefreshing ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedView(selectedView === 'overview' ? 'details' : 'overview')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>{selectedView === 'overview' ? 'Detailed View' : 'Overview'}</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PrinterIcon className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices, clients, or therapists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="client">Client Invoices</option>
              <option value="therapist">Therapist Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{totalRevenue.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Total Revenue</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>Collected payments</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CurrencyEuroIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Outstanding Amount Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{outstandingAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Outstanding</div>
              <div className="flex items-center text-sm text-blue-600">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Pending payment</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <BanknotesIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Overdue Amount Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{overdueAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Overdue</div>
              <div className="flex items-center text-sm text-red-600">
                <ArrowDownIcon className="w-4 h-4 mr-1" />
                <span>Requires action</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
              <DocumentTextIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{netProfit.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Net Profit</div>
              <div className="flex items-center text-sm text-purple-600">
                <ChartBarIcon className="w-4 h-4 mr-1" />
                <span>After expenses</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center opacity-10">
              <ReceiptPercentIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {selectedView === 'overview' ? (
        <>
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h2>
                <button className="text-sm text-green-600 hover:text-green-700">
                  View details
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="font-medium text-gray-900">Client Revenue</span>
                  </div>
                  <span className="font-semibold text-green-600">€{clientRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="font-medium text-gray-900">Therapist Payments</span>
                  </div>
                  <span className="font-semibold text-red-600">€{therapistPayments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="font-medium text-gray-900">Net Profit</span>
                  </div>
                  <span className="font-semibold text-purple-600">€{netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
                <button className="text-sm text-green-600 hover:text-green-700">
                  Manage payments
                </button>
              </div>
              <div className="space-y-3">
                {['paid', 'sent', 'overdue', 'draft'].map(status => {
                  const statusInvoices = filteredInvoices.filter(inv => inv.status === status);
                  const statusAmount = statusInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                  return (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                        <span className="text-sm text-gray-600">{statusInvoices.length} invoices</span>
                      </div>
                      <span className="font-semibold text-gray-900">€{statusAmount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Financial Performance</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                  Export CSV
                </button>
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {filteredInvoices.length}
                </div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-xs text-gray-500 mt-1">This period</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Math.round((totalRevenue / totalInvoiced) * 100) || 0}%
                </div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-xs text-gray-500 mt-1">Payment efficiency</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  €{Math.round(totalRevenue / (filteredInvoices.filter(inv => inv.status === 'paid').length || 1))}
                </div>
                <p className="text-sm text-gray-600">Average Invoice</p>
                <p className="text-xs text-gray-500 mt-1">Per transaction</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round((netProfit / clientRevenue) * 100) || 0}%
                </div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-xs text-gray-500 mt-1">After therapist costs</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Invoice List */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Invoices ({filteredInvoices.length})
            </h2>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Invoice #{invoice.invoice_number}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        {invoice.payment_method && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getPaymentMethodColor(invoice.payment_method)}`}>
                            {invoice.payment_method.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Client/Therapist:</strong> {invoice.client_name || invoice.therapist_name}</p>
                          <p><strong>Date:</strong> {invoice.date}</p>
                        </div>
                        <div>
                          <p><strong>Amount:</strong> €{invoice.amount}</p>
                          <p><strong>Due Date:</strong> {invoice.due_date}</p>
                        </div>
                        <div>
                          <p><strong>Type:</strong> {invoice.client_name ? 'Client Invoice' : 'Therapist Payment'}</p>
                          {invoice.payment_date && (
                            <p><strong>Paid:</strong> {invoice.payment_date}</p>
                          )}
                        </div>
                      </div>

                      {invoice.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Description:</strong> {invoice.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50">
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                      {invoice.status === 'sent' && (
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          Send Reminder
                        </button>
                      )}
                      {invoice.status === 'overdue' && (
                        <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                          Follow Up
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Notification Component */}
      <ReportNotification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default BookkeeperFinancialDashboard;