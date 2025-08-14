import React, { useState, useEffect } from 'react';
import { 
  CurrencyEuroIcon, 
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, formatRelativeTime } from '@/utils/dateFormatters';

const BookkeeperDashboard: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
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
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Calculate financial metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingAmount = invoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  
  const thisMonthRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.date);
      const now = new Date();
      return inv.status === 'paid' && 
             invDate.getMonth() === now.getMonth() && 
             invDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const lastMonthRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return inv.status === 'paid' && 
             invDate.getMonth() === lastMonth.getMonth() && 
             invDate.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Recent financial activities
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const overdueInvoicesList = overdueInvoices.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Enhanced Welcome Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-2xl shadow-xl p-8 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {t('dashboard.welcome')}, {getDisplayName()}
              </h1>
              <p className="text-emerald-100 mt-2 text-lg">
                {t('bookkeeper.dashboardSubtitle') || 'Complete financial management and invoice tracking'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{t('action.create')} {t('nav.invoices').slice(0, -1)}</span>
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{t('financial.generateReport')}</span>
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200">
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{t('bookkeeper.paymentReminder') || 'Payment Reminder'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <p className="text-sm text-emerald-100">{t('bookkeeper.currentPeriod') || 'Current Period'}</p>
                <p className="text-2xl font-bold mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <p className="text-sm text-emerald-200 mt-2">{t('bookkeeper.lastUpdated') || 'Last updated'}: {formatRelativeTime(new Date())}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Metrics Grid with Glassmorphism Effects */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card - Enhanced Green */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <ArrowUpIcon className="w-3 h-3" />
                <span className="text-xs font-semibold">+{revenueGrowth}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('financial.totalRevenue')}</p>
              <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">{t('bookkeeper.vsLastMonth') || 'vs last month'}</p>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>

        {/* Outstanding Amount Card - Enhanced Orange */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-50"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <BanknotesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                <ClockIcon className="w-3 h-3" />
                <span className="text-xs font-semibold">Pending</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.outstanding')}</p>
              <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(outstandingAmount)}</p>
              <p className="text-xs text-gray-500 mt-2">{invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).length} {t('nav.invoices').toLowerCase()}</p>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>

        {/* Overdue Invoices Card - Enhanced Red */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-50"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-red-600 bg-red-100 px-2 py-1 rounded-full">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span className="text-xs font-semibold">Alert</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('bookkeeper.overdue') || 'Overdue'}</p>
              <p className="text-3xl font-extrabold text-gray-900">{overdueInvoices.length}</p>
              <p className="text-xs text-gray-500 mt-2">{t('bookkeeper.requireAttention') || 'Require attention'}</p>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200 to-rose-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>

        {/* This Month Revenue Card - Enhanced Blue */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                <CalendarIcon className="w-3 h-3" />
                <span className="text-xs font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short' })}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(thisMonthRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">Current period</p>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Modern Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Invoices - Modern Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            </div>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowUpIcon className="w-3 h-3 rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="group relative p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {invoice.client_name || invoice.therapist_name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>#{invoice.invoice_number}</span>
                        <span>•</span>
                        <span>{formatDate(invoice.date)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                        {invoice.payment_method && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                            invoice.payment_method === 'insurance' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                            invoice.payment_method === 'bank_transfer' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
                            invoice.payment_method === 'credit_card' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' :
                            'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                          }`}>
                            {invoice.payment_method.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Hover action overlay */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-emerald-600">
                      <ArrowUpIcon className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent invoices</p>
                <p className="text-sm text-gray-400 mt-1">New invoices will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Invoices Alert - Modern Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Overdue Invoices</h2>
            </div>
            <button className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowUpIcon className="w-3 h-3 rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            {overdueInvoicesList.length > 0 ? (
              overdueInvoicesList.map((invoice: any) => (
                <div key={invoice.id} className="group relative p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 hover:border-red-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                          {invoice.client_name || invoice.therapist_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>#{invoice.invoice_number}</span>
                        <span>•</span>
                        <span className="text-red-600 font-medium">Due: {formatDate(invoice.due_date)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(invoice.amount)}</p>
                          <p className="text-xs text-gray-500">
                            {Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all">
                            Send Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-500">No overdue invoices</p>
                <p className="text-xs text-gray-400 mt-1">All payments are up to date</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Financial Summary</h2>
          <button className="text-sm text-green-600 hover:text-green-700">
            Generate Report
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(thisMonthRevenue)}</div>
            <p className="text-sm text-gray-600">Revenue This Month</p>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(inv => {
                const invDate = new Date(inv.date);
                const now = new Date();
                return inv.status === 'paid' && 
                       invDate.getMonth() === now.getMonth() && 
                       invDate.getFullYear() === now.getFullYear();
              }).length} invoices paid
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{formatCurrency(outstandingAmount)}</div>
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).length} pending payments
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {((totalRevenue / (totalRevenue + outstandingAmount)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-xs text-gray-500 mt-1">Payment efficiency</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Create Invoice</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <CreditCardIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Record Payment</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Financial Report</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Follow Up</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookkeeperDashboard;