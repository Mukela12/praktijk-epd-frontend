import React from 'react';
import { DocumentArrowDownIcon, PrinterIcon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/utils/dateFormatters';
import { PremiumCard, PremiumButton } from '@/components/layout/PremiumLayout';

interface ReportPreviewInlineProps {
  reportData: any;
  reportType: string;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export const ReportPreviewInline: React.FC<ReportPreviewInlineProps> = ({
  reportData,
  reportType,
  onClose,
  onDownload,
  onPrint
}) => {
  const getReportTitle = () => {
    switch (reportType) {
      case 'financial_summary':
        return 'Financial Summary Report';
      case 'invoice_report':
        return 'Invoice Status Report';
      case 'client_analysis':
        return 'Client Analysis Report';
      case 'therapist_performance':
        return 'Therapist Performance Report';
      case 'monthly_trends':
        return 'Monthly Trends Report';
      case 'payment_analysis':
        return 'Payment Methods Analysis';
      default:
        return 'Report Preview';
    }
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'financial_summary':
        return renderFinancialSummary();
      case 'invoice_report':
        return renderInvoiceReport();
      case 'client_analysis':
        return renderClientAnalysis();
      case 'therapist_performance':
        return renderTherapistPerformance();
      case 'monthly_trends':
        return renderMonthlyTrends();
      case 'payment_analysis':
        return renderPaymentAnalysis();
      default:
        return <p>No preview available for this report type.</p>;
    }
  };

  const renderFinancialSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(reportData.totalRevenue || 0)}</p>
          <p className="text-xs text-green-600 mt-1">+12.5% from last period</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800">Outstanding</h4>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.outstandingAmount || 0)}</p>
          <p className="text-xs text-blue-600 mt-1">{reportData.outstandingCount || 0} invoices</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800">Overdue</h4>
          <p className="text-2xl font-bold text-red-900">{formatCurrency(reportData.overdueAmount || 0)}</p>
          <p className="text-xs text-red-600 mt-1">{reportData.overdueCount || 0} invoices</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800">Net Profit</h4>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(reportData.netProfit || 0)}</p>
          <p className="text-xs text-purple-600 mt-1">{reportData.profitMargin || 0}% margin</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Client Payments</span>
            <span className="font-medium">{formatCurrency(reportData.clientRevenue || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Insurance Payments</span>
            <span className="font-medium">{formatCurrency(reportData.insuranceRevenue || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Other Revenue</span>
            <span className="font-medium">{formatCurrency(reportData.otherRevenue || 0)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center font-semibold">
            <span>Total Revenue</span>
            <span>{formatCurrency(reportData.totalRevenue || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceReport = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.invoicesByStatus?.map((status: any) => (
              <tr key={status.status}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status.status === 'paid' ? 'bg-green-100 text-green-800' :
                    status.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    status.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(status.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h4>
          <div className="space-y-2">
            {reportData.paymentMethods?.map((method: any) => (
              <div key={method.method} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{method.method}</span>
                <span className="font-medium">{formatCurrency(method.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h4>
          <div className="space-y-2">
            {reportData.topClients?.slice(0, 5).map((client: any) => (
              <div key={client.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{client.name}</span>
                <span className="font-medium">{formatCurrency(client.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800">Total Clients</h4>
          <p className="text-2xl font-bold text-blue-900">{reportData.totalClients || 0}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">Active Clients</h4>
          <p className="text-2xl font-bold text-green-900">{reportData.activeClients || 0}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800">Avg Revenue per Client</h4>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(reportData.avgRevenuePerClient || 0)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.clientDetails?.map((client: any) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.sessions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(client.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(client.outstanding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTherapistPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800">Total Therapists</h4>
          <p className="text-2xl font-bold text-blue-900">{reportData.totalTherapists || 0}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">Total Sessions</h4>
          <p className="text-2xl font-bold text-green-900">{reportData.totalSessions || 0}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800">Avg Sessions/Therapist</h4>
          <p className="text-2xl font-bold text-purple-900">{reportData.avgSessionsPerTherapist || 0}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800">Utilization Rate</h4>
          <p className="text-2xl font-bold text-orange-900">{reportData.utilizationRate || 0}%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.therapistDetails?.map((therapist: any) => (
              <tr key={therapist.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{therapist.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{therapist.clients}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{therapist.sessions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(therapist.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{therapist.utilization}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonthlyTrends = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h4>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <ChartBarIcon className="w-12 h-12 mr-2" />
          <span>Chart visualization would go here</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h4>
          <div className="space-y-3">
            {reportData.monthlyData?.map((month: any) => (
              <div key={month.month} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(month.revenue)}</p>
                  <p className="text-xs text-gray-500">{month.invoices} invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Year Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.currentYearRevenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Previous Year Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.previousYearRevenue || 0)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Growth</span>
              <span className={`font-semibold ${reportData.yearOverYearGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.yearOverYearGrowth || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">On-Time Payments</h4>
          <p className="text-2xl font-bold text-green-900">{reportData.onTimePayments || 0}%</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800">Average Days to Pay</h4>
          <p className="text-2xl font-bold text-yellow-900">{reportData.avgDaysToPay || 0}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800">Overdue Rate</h4>
          <p className="text-2xl font-bold text-red-900">{reportData.overdueRate || 0}%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days to Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.paymentMethodDetails?.map((method: any) => (
              <tr key={method.method}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{method.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{method.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(method.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{method.avgDays}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{method.successRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <PremiumCard className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{getReportTitle()}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Generated on {formatDate(new Date())} • Period: {reportData.period || 'Current'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <PremiumButton
            size="sm"
            variant="outline"
            icon={PrinterIcon}
            onClick={onPrint}
          >
            Print
          </PremiumButton>
          <PremiumButton
            size="sm"
            variant="primary"
            icon={DocumentArrowDownIcon}
            onClick={onDownload}
          >
            Download
          </PremiumButton>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderReportContent()}
      </div>

      <div className="border-t pt-4 mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Report ID: {reportData.id || `REP-${Date.now()}`}</p>
          <p>© {new Date().getFullYear()} PraktijkEPD - Financial Report</p>
        </div>
      </div>
    </PremiumCard>
  );
};

export default ReportPreviewInline;