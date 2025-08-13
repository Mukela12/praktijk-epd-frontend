import React from 'react';
import { XMarkIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '@/utils/dateFormatters';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  reportType: string;
  onDownload: () => void;
  onPrint: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportData,
  reportType,
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
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(reportData.totalRevenue || 0)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Net Profit</h4>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(reportData.netProfit || 0)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Outstanding Amount</h4>
          <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(reportData.outstandingAmount || 0)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600">Profit Margin</h4>
          <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.profitMargin || 0}%</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 text-sm text-gray-600">Total Sessions</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{reportData.totalSessions || 0}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-600">Average Session Value</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(reportData.averageSessionValue || 0)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-600">Active Clients</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{reportData.activeClients || 0}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm text-gray-600">Active Therapists</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{reportData.activeTherapists || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInvoiceReport = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(reportData.invoices || []).slice(0, 10).map((invoice: any, index: number) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-900">#{invoice.id}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{formatDate(invoice.date)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{invoice.clientName}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(invoice.amount)}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reportData.invoices?.length > 10 && (
        <p className="text-sm text-gray-500 text-center">Showing first 10 of {reportData.invoices.length} invoices</p>
      )}
    </div>
  );

  const renderClientAnalysis = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">Total Clients</h4>
          <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.totalClients || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-900">Active Clients</h4>
          <p className="text-2xl font-bold text-green-600 mt-1">{reportData.activeClients || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900">New This Period</h4>
          <p className="text-2xl font-bold text-purple-600 mt-1">{reportData.newClients || 0}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(reportData.clients || []).slice(0, 10).map((client: any, index: number) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-900">{client.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{client.status}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{client.sessions}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(client.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTherapistPerformance = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Session Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(reportData.therapists || []).map((therapist: any, index: number) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-900">{therapist.name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{therapist.sessions}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(therapist.revenue)}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(therapist.avgSessionValue)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${therapist.utilization || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{therapist.utilization || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonthlyTrends = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue Trend</h4>
        <div className="space-y-2">
          {(reportData.monthlyData || []).map((month: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{month.month}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.max(10, (month.revenue / Math.max(...(reportData.monthlyData || []).map((m: any) => m.revenue))) * 100)}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-24 text-right">
                  {formatCurrency(month.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentAnalysis = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(reportData.paymentMethods || {}).map(([method, data]: [string, any]) => (
          <div key={method} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 capitalize">{method.replace('_', ' ')}</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.amount)}</p>
            <p className="text-sm text-gray-600">{data.percentage}% of total</p>
            <p className="text-xs text-gray-500 mt-1">{data.count} transactions</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">{getReportTitle()}</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onPrint}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Print Report"
                    >
                      <PrinterIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onDownload}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Report Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Generated on: {formatDate(new Date())}</span>
                    <span>Period: {reportData.period || 'Current'}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {renderReportContent()}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      This report contains confidential financial information
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        onClick={onDownload}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportPreviewModal;