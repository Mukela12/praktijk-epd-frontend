import React, { useState, useEffect } from 'react';
import {
  CurrencyEuroIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CreditCardIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  therapistCosts: number;
  netProfit: number;
}

const FinancialDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [therapistInvoices, setTherapistInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setIsLoading(true);
        const [invoicesResponse, therapistsResponse] = await Promise.all([
          realApiService.invoices.getAll(),
          realApiService.therapists.getAll()
        ]);

        if (invoicesResponse.success && invoicesResponse.data) {
          setInvoices(invoicesResponse.data);
          
          // Calculate stats from invoices
          const totalRevenue = invoicesResponse.data
            .filter((inv: any) => inv.status === 'paid')
            .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);
          
          const outstandingAmount = invoicesResponse.data
            .filter((inv: any) => ['sent', 'overdue'].includes(inv.status))
            .reduce((sum: number, inv: any) => sum + inv.balance_due, 0);
          
          const paidInvoices = invoicesResponse.data.filter((inv: any) => inv.status === 'paid').length;
          const unpaidInvoices = invoicesResponse.data.filter((inv: any) => ['sent', 'overdue'].includes(inv.status)).length;
          const overdueInvoices = invoicesResponse.data.filter((inv: any) => inv.status === 'overdue').length;
          
          // Mock therapist costs (in real app, this would come from therapist invoices)
          const therapistCosts = totalRevenue * 0.6; // Assume 60% goes to therapists
          const netProfit = totalRevenue - therapistCosts;
          
          setStats({
            totalRevenue,
            monthlyRevenue: totalRevenue * 0.2, // Mock monthly revenue
            outstandingAmount,
            paidInvoices,
            unpaidInvoices,
            overdueInvoices,
            therapistCosts,
            netProfit
          });
        }

        // Mock therapist invoices
        setTherapistInvoices([
          {
            id: 'ti1',
            therapist_name: 'Maria van der Berg',
            amount: 2400,
            status: 'pending_verification',
            sessions: 12,
            period: 'January 2025',
            submitted_date: '2025-01-15'
          },
          {
            id: 'ti2',
            therapist_name: 'Peter de Vries',
            amount: 1800,
            status: 'verified',
            sessions: 9,
            period: 'January 2025',
            submitted_date: '2025-01-14'
          }
        ]);

      } catch (error) {
        console.error('Failed to load financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getTherapistInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'paid_to_therapist':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'disputed':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

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
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('financial.title')}</h1>
            <p className="text-orange-100 mt-1">
              {t('financial.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:bg-white/30"
            >
              <option value="week" className="text-gray-800">This Week</option>
              <option value="month" className="text-gray-800">This Month</option>
              <option value="quarter" className="text-gray-800">This Quarter</option>
              <option value="year" className="text-gray-800">This Year</option>
            </select>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <DocumentTextIcon className="w-4 h-4" />
              <span>{t('financial.generateReport')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('financial.totalRevenue')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? formatCurrency(stats.totalRevenue) : '€0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('financial.outstandingAmount')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? formatCurrency(stats.outstandingAmount) : '€0'}
              </p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                {stats?.overdueInvoices || 0} overdue
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('financial.therapistCosts')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? formatCurrency(stats.therapistCosts) : '€0'}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <BanknotesIcon className="w-4 h-4 mr-1" />
                60% of revenue
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('financial.netProfit')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats ? formatCurrency(stats.netProfit) : '€0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                +8.2% margin
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Client Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ReceiptPercentIcon className="w-5 h-5 mr-2 text-orange-600" />
              {t('financial.clientInvoices')}
            </h2>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              {t('action.viewAll')}
            </button>
          </div>
          
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.client_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Invoice #{invoice.invoice_number}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                  </div>
                  {invoice.status === 'overdue' && (
                    <p className="text-xs text-red-600">
                      {Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                    </p>
                  )}
                </div>
                <button className="ml-4 text-orange-600 hover:text-orange-700">
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Therapist Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2 text-blue-600" />
              {t('financial.therapistInvoices')}
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('action.viewAll')}
            </button>
          </div>
          
          <div className="space-y-4">
            {therapistInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.therapist_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTherapistInvoiceStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {invoice.sessions} sessions • {invoice.period}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(invoice.submitted_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  {invoice.status === 'pending_verification' && (
                    <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                      Verify
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-700">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
            {t('financial.revenueChart')}
          </h2>
          <div className="flex items-center space-x-2">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Export Data
            </button>
          </div>
        </div>
        
        <div className="text-center py-16">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Revenue Analytics Chart</p>
          <p className="text-gray-400 text-sm">Interactive charts will be implemented here</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {t('financial.quickActions')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-orange-100 group-hover:bg-orange-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Generate Invoices</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-red-100 group-hover:bg-red-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Send Reminders</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Process Payments</span>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
            <div className="text-center">
              <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-lg mx-auto mb-3 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Financial Reports</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;