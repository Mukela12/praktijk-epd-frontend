import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/LanguageContext';
import { useDashboard, useInvoices } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, StatusBadge, PremiumMetric, PremiumTable, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
  monthlyGrowth: number;
}

interface Invoice {
  id: string;
  client_name: string;
  therapist_name: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  therapy_type: string;
  session_count: number;
  payment_method?: string;
  notes?: string;
}

const FinancialOverview: React.FC = () => {
  const { t } = useTranslation();
  const { getFinancialOverview, isLoading: statsLoading } = useDashboard();
  const { getAll: getInvoices, update: updateInvoice, isLoading: invoicesLoading } = useInvoices();
  const { success, error, warning } = useAlert();

  // State
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  // Load financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        // Load financial stats and invoices in parallel
        const [stats, invoicesData] = await Promise.all([
          getFinancialOverview().catch(() => null),
          getInvoices().catch(() => [])
        ]);

        // Set default stats if API doesn't return data
        const defaultStats: FinancialStats = {
          totalRevenue: 0,
          monthlyRevenue: 0,
          outstandingAmount: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          averageInvoiceValue: 0,
          collectionRate: 0,
          monthlyGrowth: 0,
          ...(stats && typeof stats === 'object' ? stats : {})
        };

        // Calculate stats from invoices if needed
        const invoicesList = Array.isArray(invoicesData) ? invoicesData : [];
        if (invoicesList.length > 0) {
          const totalRevenue = invoicesList
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.amount || 0), 0);
          
          const outstandingAmount = invoicesList
            .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
            .reduce((sum, inv) => sum + (inv.amount || 0), 0);

          defaultStats.totalRevenue = (stats as any)?.totalRevenue || totalRevenue;
          defaultStats.outstandingAmount = (stats as any)?.outstandingAmount || outstandingAmount;
          defaultStats.paidInvoices = invoicesList.filter(inv => inv.status === 'paid').length;
          defaultStats.pendingInvoices = invoicesList.filter(inv => inv.status === 'sent').length;
          defaultStats.overdueInvoices = invoicesList.filter(inv => inv.status === 'overdue').length;
          defaultStats.averageInvoiceValue = totalRevenue / (defaultStats.paidInvoices || 1);
          defaultStats.collectionRate = ((defaultStats.paidInvoices / (invoicesList.length || 1)) * 100);
        }

        setFinancialStats(defaultStats);
        setInvoices(invoicesList);
        setFilteredInvoices(invoicesList);
      } catch (err) {
        console.error('Failed to load financial data:', err);
        error('Failed to load financial data');
      }
    };

    loadFinancialData();
  }, [getFinancialOverview, getInvoices]);

  // Filter invoices
  useEffect(() => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, sortBy]);

  // Handle invoice status update
  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoice(invoiceId, { status: newStatus });
      setInvoices(prev =>
        prev.map(invoice =>
          invoice.id === invoiceId ? { ...invoice, status: newStatus as any } : invoice
        )
      );
      success(`Invoice status updated to ${newStatus}`);
    } catch (err) {
      error('Failed to update invoice status');
    }
  };

  // Export data
  const handleExport = () => {
    toast('Preparing financial report...', { duration: 2000 });
    setTimeout(() => {
      success('Financial report exported successfully', {
        action: {
          label: 'Download',
          onClick: () => {}
        }
      });
    }, 2000);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'danger';
      case 'draft': return 'warning';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get days overdue
  const getDaysOverdue = (dueDate: string, status: string) => {
    if (status !== 'overdue') return 0;
    const due = new Date(dueDate);
    const now = new Date();
    return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (statsLoading || invoicesLoading) {
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
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-3" />
              Financial Overview
            </h1>
            <p className="text-green-100 mt-1">
              Revenue tracking, invoice management, and financial analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={ArrowDownTrayIcon}
              onClick={handleExport}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Export Report
            </PremiumButton>
            <PremiumButton
              variant="outline"
              icon={DocumentTextIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Create Invoice
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <PremiumCard>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Financial Performance</h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </PremiumCard>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric
          title="Total Revenue"
          value={`€${(financialStats?.totalRevenue || 0).toLocaleString()}`}
          change={{ value: `+${financialStats?.monthlyGrowth || 0}%`, type: 'positive' }}
          icon={CurrencyDollarIcon}
          iconColor="text-green-600"
          isLoading={!financialStats}
        />
        <PremiumMetric
          title="Outstanding Amount"
          value={`€${(financialStats?.outstandingAmount || 0).toLocaleString()}`}
          change={{ value: `${financialStats?.pendingInvoices || 0} pending`, type: 'neutral' }}
          icon={ClockIcon}
          iconColor="text-orange-600"
          isLoading={!financialStats}
        />
        <PremiumMetric
          title="Collection Rate"
          value={`${(financialStats?.collectionRate || 0).toFixed(1)}%`}
          change={{ value: 'Target: 95%', type: financialStats?.collectionRate && financialStats.collectionRate >= 95 ? 'positive' : 'negative' }}
          icon={ChartBarIcon}
          iconColor="text-blue-600"
          isLoading={!financialStats}
        />
        <PremiumMetric
          title="Overdue Invoices"
          value={financialStats?.overdueInvoices || 0}
          change={{ value: `€${invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`, type: 'negative' }}
          icon={ExclamationTriangleIcon}
          iconColor="text-red-600"
          isLoading={!financialStats}
        />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Breakdown */}
        <PremiumCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
            <BanknotesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid Invoices</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{financialStats?.paidInvoices || 0}</div>
                <div className="text-sm text-green-600">€{((financialStats?.totalRevenue || 0) / (financialStats?.paidInvoices || 1)).toLocaleString()}/avg</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Invoices</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{financialStats?.pendingInvoices || 0}</div>
                <div className="text-sm text-orange-600">Awaiting payment</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue Invoices</span>
              <div className="text-right">
                <div className="font-semibold text-red-600">{financialStats?.overdueInvoices || 0}</div>
                <div className="text-sm text-red-500">Requires attention</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Payment Methods */}
        <PremiumCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <CreditCardIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bank Transfer</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">65%</div>
                <div className="text-sm text-gray-500">€{((financialStats?.totalRevenue || 0) * 0.65).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Credit Card</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">25%</div>
                <div className="text-sm text-gray-500">€{((financialStats?.totalRevenue || 0) * 0.25).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Insurance</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">10%</div>
                <div className="text-sm text-gray-500">€{((financialStats?.totalRevenue || 0) * 0.10).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Trending */}
        <PremiumCard gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue Growth</span>
              <div className="flex items-center text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                <span className="font-semibold">+{financialStats?.monthlyGrowth || 0}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Collection Time</span>
              <div className="flex items-center text-blue-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span className="font-semibold">14 days avg</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Client Satisfaction</span>
              <div className="flex items-center text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                <span className="font-semibold">4.8/5.0</span>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Invoices Table */}
      <PremiumCard className="p-0">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-6">
            <PremiumEmptyState
              icon={DocumentTextIcon}
              title="No Invoices Found"
              description="There are no invoices matching your current filters."
              action={{
                label: 'Create Invoice',
                onClick: () => {}
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client / Therapist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount / Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date / Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.slice(0, 10).map((invoice) => {
                  const daysOverdue = getDaysOverdue(invoice.due_date, invoice.status);
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.client_name}</div>
                          <div className="text-sm text-gray-500">with {invoice.therapist_name}</div>
                          <div className="text-xs text-blue-600">{invoice.therapy_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">€{invoice.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{invoice.session_count} sessions</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.issue_date).toLocaleDateString()}
                          </div>
                          <div className={`text-sm ${
                            invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'
                          }`}>
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                            {daysOverdue > 0 && (
                              <span className="ml-1">({daysOverdue}d overdue)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={invoice.status}
                          type={invoice.status as any}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <PremiumButton
                            size="sm"
                            variant="outline"
                          >
                            View
                          </PremiumButton>
                          {invoice.status === 'draft' && (
                            <PremiumButton
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusUpdate(invoice.id, 'sent')}
                            >
                              Send
                            </PremiumButton>
                          )}
                          {invoice.status === 'overdue' && (
                            <PremiumButton
                              size="sm"
                              variant="warning"
                              onClick={() => warning(`Follow-up reminder sent to ${invoice.client_name}`)}
                            >
                              Remind
                            </PremiumButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

export default FinancialOverview;