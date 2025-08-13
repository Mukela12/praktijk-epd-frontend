import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TherapistInvoices: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('this_month');
  const [isLoading, setIsLoading] = useState(true);

  // Load invoices data
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await realApiService.invoices.getAll();
        
        if (response.success && response.data) {
          // Filter invoices for current therapist and add mock data
          const therapistInvoices = response.data
            .filter((inv: any) => inv.therapist_name === getDisplayName())
            .map((inv: any) => ({
              ...inv,
              session_count: Math.floor(Math.random() * 20) + 5,
              period_start: inv.date,
              period_end: new Date(new Date(inv.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hourly_rate: 85,
              total_hours: Math.floor(Math.random() * 40) + 20,
              description: `Professional services for ${inv.date.split('-')[1]}/${inv.date.split('-')[0]}`,
              submitted_date: inv.date,
              notes: Math.random() > 0.7 ? 'Includes overtime sessions' : undefined
            }));
          setInvoices(therapistInvoices);
        }
      } catch (error) {
        console.error('Failed to load invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [getDisplayName]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-4 h-4" />;
      case 'sent': return <ClockIcon className="w-4 h-4" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    if (searchTerm) {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== 'all' && invoice.status !== filterStatus) {
      return false;
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      
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
      }
    }

    return true;
  });

  // Calculate summary metrics
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices.filter(inv => ['sent', 'draft'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const totalHours = filteredInvoices.reduce((sum, inv) => sum + inv.total_hours, 0);
  const totalSessions = filteredInvoices.reduce((sum, inv) => sum + inv.session_count, 0);

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
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Invoices</h1>
            <p className="text-red-100 mt-1">
              Manage your billing and track payments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{paidAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Paid Amount</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                <span>Received</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center opacity-10">
              <CurrencyEuroIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{pendingAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Pending Payment</div>
              <div className="flex items-center text-sm text-blue-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Processing</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{totalHours}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Total Hours</div>
              <div className="flex items-center text-sm text-purple-600">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{totalSessions} sessions</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center opacity-10">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {overdueAmount > 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">€{overdueAmount.toLocaleString()}</div>
                <div className="text-sm font-medium text-gray-600 mb-2">Overdue</div>
                <div className="flex items-center text-sm text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  <span>Follow up needed</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center opacity-10">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">€{Math.round(totalAmount / (filteredInvoices.length || 1))}</div>
                <div className="text-sm font-medium text-gray-600 mb-2">Average Invoice</div>
                <div className="flex items-center text-sm text-orange-600">
                  <BanknotesIcon className="w-4 h-4 mr-1" />
                  <span>Per period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
                <BanknotesIcon className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Periods</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            My Invoices ({filteredInvoices.length})
          </h2>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPeriod !== 'all'
                ? "Try adjusting your search or filters" 
                : "Create your first invoice to get started"}
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Create New Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p><strong>Period:</strong> {invoice.period_start} - {invoice.period_end}</p>
                        <p><strong>Submitted:</strong> {invoice.submitted_date}</p>
                      </div>
                      <div>
                        <p><strong>Sessions:</strong> {invoice.session_count}</p>
                        <p><strong>Total Hours:</strong> {invoice.total_hours}h</p>
                      </div>
                      <div>
                        <p><strong>Hourly Rate:</strong> €{invoice.hourly_rate}</p>
                        <p><strong>Amount:</strong> <span className="font-semibold text-gray-900">€{invoice.amount}</span></p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Description:</strong> {invoice.description}
                    </p>

                    {invoice.notes && (
                      <p className="text-sm text-blue-600">
                        <strong>Notes:</strong> {invoice.notes}
                      </p>
                    )}

                    {invoice.payment_date && (
                      <p className="text-sm text-green-600 mt-2">
                        <strong>Paid on:</strong> {invoice.payment_date}
                      </p>
                    )}

                    {invoice.due_date && invoice.status !== 'paid' && (
                      <p className={`text-sm mt-2 ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-600'}`}>
                        <strong>Due:</strong> {invoice.due_date}
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
                    {invoice.status === 'draft' && (
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        Submit
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
            <div className="text-center">
              <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Create Invoice</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Time Tracking</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <BanknotesIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Payment Status</span>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <DocumentArrowDownIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Export Report</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistInvoices;