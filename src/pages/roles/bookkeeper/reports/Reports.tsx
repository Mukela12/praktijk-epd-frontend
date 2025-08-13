import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ReceiptPercentIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { realApiService } from "@/services/realApi";
import { bookkeeperApi } from '@/services/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReportNotification from '@/components/ui/ReportNotification';
import ReportPreviewInline from '@/components/bookkeeper/ReportPreviewInline';
import { formatCurrency } from '@/utils/dateFormatters';

const Reports: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  
  // State management
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reportPeriod, setReportPeriod] = useState<string>('this_month');
  const [reportType, setReportType] = useState<string>('financial');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'generating' as 'generating' | 'success' | 'error' | 'preview',
    title: '',
    message: ''
  });
  
  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    reportType: '',
    reportData: {} as any
  });
  
  // Report generation state
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  // Get date range for period
  const getDateRangeForPeriod = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  // Load data - reload when period changes
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setIsLoading(true);
        
        // Get date range for the selected period
        const { startDate, endDate } = getDateRangeForPeriod(reportPeriod);
        
        // Load data with period filters
        const [invoicesResponse, clientsResponse, therapistsResponse, appointmentsResponse] = await Promise.all([
          realApiService.bookkeeper.getInvoices({}),
          realApiService.clients.getAll(),
          realApiService.therapists.getAll(),
          realApiService.appointments.getAll()
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

        if (appointmentsResponse.success && appointmentsResponse.data) {
          setAppointments(appointmentsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, [reportPeriod]); // Reload when period changes

  // Filter data based on selected period
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (reportPeriod) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= startDate && invDate <= endDate;
    });

    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });

    return { filteredInvoices, filteredAppointments, startDate, endDate };
  };

  const { filteredInvoices, filteredAppointments } = getFilteredData();

  // Calculate financial metrics
  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstandingAmount = filteredInvoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const clientRevenue = filteredInvoices
    .filter(inv => inv.client_name && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const therapistPayments = filteredInvoices
    .filter(inv => inv.therapist_name && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const netProfit = clientRevenue - therapistPayments;
  const profitMargin = clientRevenue > 0 ? (netProfit / clientRevenue * 100).toFixed(1) : '0';

  // Calculate session metrics
  const totalSessions = filteredAppointments.filter(apt => apt.status === 'completed').length;
  const averageSessionValue = totalSessions > 0 ? Math.round(clientRevenue / totalSessions) : 0;

  // Client metrics
  const activeClients = clients.filter(client => client.status === 'active_treatment').length;
  const newClients = clients.filter(client => {
    const regDate = new Date(client.registration_date);
    const { startDate, endDate } = getFilteredData();
    return regDate >= startDate && regDate <= endDate;
  }).length;

  // Therapist metrics
  const activeTherapists = therapists.filter(therapist => therapist.status === 'active').length;

  // Payment method breakdown
  const paymentMethods = filteredInvoices
    .filter(inv => inv.status === 'paid' && inv.payment_method)
    .reduce((acc, inv) => {
      acc[inv.payment_method] = (acc[inv.payment_method] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.date);
        return inv.status === 'paid' && invDate >= monthStart && invDate <= monthEnd;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    monthlyRevenue.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: monthRevenue
    });
  }

  // Available reports
  const availableReports = [
    {
      id: 'financial_summary',
      name: 'Financial Summary Report',
      description: 'Complete overview of revenue, expenses, and profit',
      icon: CurrencyEuroIcon,
      color: 'bg-green-500'
    },
    {
      id: 'invoice_report',
      name: 'Invoice Status Report',
      description: 'Detailed breakdown of all invoices and payment status',
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'client_analysis',
      name: 'Client Analysis Report',
      description: 'Client demographics, retention, and revenue analysis',
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      id: 'therapist_performance',
      name: 'Therapist Performance Report',
      description: 'Therapist productivity and revenue generation',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    },
    {
      id: 'monthly_trends',
      name: 'Monthly Trends Report',
      description: 'Revenue and session trends over time',
      icon: ArrowTrendingUpIcon,
      color: 'bg-indigo-500'
    },
    {
      id: 'payment_analysis',
      name: 'Payment Methods Analysis',
      description: 'Breakdown of payment methods and collection rates',
      icon: BanknotesIcon,
      color: 'bg-teal-500'
    }
  ];

  const handleGenerateReport = async (reportId: string) => {
    try {
      // Mark report as generating
      setGeneratingReports(prev => new Set([...prev, reportId]));
      
      // Show generating notification
      const reportTitle = availableReports.find(r => r.id === reportId)?.name || 'Report';
      setNotification({
        show: true,
        type: 'generating',
        title: `Generating ${reportTitle}`,
        message: 'Please wait while we prepare your report...'
      });
      
      // Call backend API to generate report
      try {
        const response = await bookkeeperApi.getReports(reportId, {
          period: reportPeriod,
          format: 'detailed'
        });
        
        if (response.success && response.data) {
          // Process report data
          const reportData = prepareReportData(reportId, response.data);
          
          // Show success notification
          setNotification({
            show: true,
            type: 'success',
            title: `${reportTitle} Ready`,
            message: 'Your report has been generated successfully.'
          });
          
          // Automatically show preview after generation
          setTimeout(() => {
            setPreviewModal({
              isOpen: true,
              reportType: reportId,
              reportData: reportData
            });
          }, 500);
        }
      } catch (apiError) {
        console.error('Backend API error:', apiError);
        throw new Error('Backend API is required for report generation');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Report Generation Failed',
        message: 'An error occurred while generating the report. Please try again.'
      });
    } finally {
      // Remove from generating set
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const summaryData = generateSummaryReport();
      
      if (format === 'csv') {
        // Download CSV
        const blob = new Blob([summaryData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_summary_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For PDF and Excel, show message (would require additional libraries)
        alert(`Export to ${format.toUpperCase()} format coming soon!`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Helper functions to generate CSV content
  const generateFinancialSummaryCSV = () => {
    let csv = 'Financial Summary Report\n';
    csv += `Period: ${reportPeriod}\n\n`;
    csv += 'Metric,Value\n';
    csv += `Total Revenue,€${totalRevenue}\n`;
    csv += `Net Profit,€${netProfit}\n`;
    csv += `Profit Margin,${profitMargin}%\n`;
    csv += `Outstanding Amount,€${outstandingAmount}\n`;
    csv += `Client Revenue,€${clientRevenue}\n`;
    csv += `Therapist Payments,€${therapistPayments}\n`;
    csv += `Total Sessions,${totalSessions}\n`;
    csv += `Average Session Value,€${averageSessionValue}\n`;
    csv += `Active Clients,${activeClients}\n`;
    csv += `New Clients,${newClients}\n`;
    csv += `Active Therapists,${activeTherapists}\n`;
    return csv;
  };

  const generateInvoiceReportCSV = () => {
    let csv = 'Invoice Report\n';
    csv += `Period: ${reportPeriod}\n\n`;
    csv += 'Invoice ID,Date,Client,Amount,Status,Payment Method\n';
    filteredInvoices.forEach(inv => {
      csv += `${inv.id},${inv.date},${inv.client_name || 'N/A'},€${inv.amount},${inv.status},${inv.payment_method || 'N/A'}\n`;
    });
    return csv;
  };

  const generateClientAnalysisCSV = () => {
    let csv = 'Client Analysis Report\n';
    csv += `Period: ${reportPeriod}\n\n`;
    csv += 'Client Name,Status,Registration Date,Total Sessions,Total Revenue\n';
    clients.forEach(client => {
      const clientInvoices = filteredInvoices.filter(inv => inv.client_id === client.id);
      const clientRevenue = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const clientSessions = filteredAppointments.filter(apt => apt.client_id === client.id).length;
      csv += `${client.name},${client.status},${client.registration_date},${clientSessions},€${clientRevenue}\n`;
    });
    return csv;
  };

  const generateTherapistPerformanceCSV = () => {
    let csv = 'Therapist Performance Report\n';
    csv += `Period: ${reportPeriod}\n\n`;
    csv += 'Therapist Name,Status,Total Sessions,Total Revenue,Average Session Value\n';
    therapists.forEach(therapist => {
      const therapistInvoices = filteredInvoices.filter(inv => inv.therapist_id === therapist.id);
      const therapistRevenue = therapistInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const therapistSessions = filteredAppointments.filter(apt => apt.therapist_id === therapist.id).length;
      const avgValue = therapistSessions > 0 ? Math.round(therapistRevenue / therapistSessions) : 0;
      csv += `${therapist.name},${therapist.status},${therapistSessions},€${therapistRevenue},€${avgValue}\n`;
    });
    return csv;
  };

  const generateMonthlyTrendsCSV = () => {
    let csv = 'Monthly Trends Report\n';
    csv += 'Month,Revenue\n';
    monthlyRevenue.forEach(month => {
      csv += `${month.month},€${month.revenue}\n`;
    });
    return csv;
  };

  const generatePaymentAnalysisCSV = () => {
    let csv = 'Payment Methods Analysis\n';
    csv += `Period: ${reportPeriod}\n\n`;
    csv += 'Payment Method,Amount,Percentage\n';
    Object.entries(paymentMethods).forEach(([method, amount]) => {
      const percentage = (((amount as number) / totalRevenue) * 100).toFixed(1);
      csv += `${method},€${amount},${percentage}%\n`;
    });
    return csv;
  };

  const generateSummaryReport = () => {
    let csv = 'Financial Summary Export\n';
    csv += `Generated on: ${new Date().toLocaleDateString()}\n`;
    csv += `Period: ${reportPeriod}\n\n`;
    
    csv += 'KEY METRICS\n';
    csv += generateFinancialSummaryCSV();
    csv += '\n\nMONTHLY TRENDS\n';
    csv += generateMonthlyTrendsCSV();
    csv += '\n\nPAYMENT METHODS\n';
    csv += generatePaymentAnalysisCSV();
    
    return csv;
  };

  const prepareReportData = (reportId: string, apiData: any) => {
    // Process API data into report format
    const baseData = {
      reportId,
      period: reportPeriod,
      generatedAt: new Date(),
      totalRevenue,
      netProfit,
      outstandingAmount,
      profitMargin,
      totalSessions,
      averageSessionValue,
      activeClients,
      newClients,
      activeTherapists
    };
    
    switch (reportId) {
      case 'financial_summary':
        return { ...baseData, ...apiData };
      case 'invoice_report':
        return { ...baseData, invoices: filteredInvoices, ...apiData };
      case 'client_analysis':
        return { 
          ...baseData, 
          clients: clients.map(c => ({
            ...c,
            revenue: filteredInvoices
              .filter(inv => inv.client_id === c.id && inv.status === 'paid')
              .reduce((sum, inv) => sum + inv.amount, 0),
            sessions: filteredAppointments
              .filter(apt => apt.client_id === c.id)
              .length
          })),
          ...apiData 
        };
      case 'therapist_performance':
        return { 
          ...baseData,
          therapists: therapists.map(t => ({
            ...t,
            revenue: filteredInvoices
              .filter(inv => inv.therapist_id === t.id && inv.status === 'paid')
              .reduce((sum, inv) => sum + inv.amount, 0),
            sessions: filteredAppointments
              .filter(apt => apt.therapist_id === t.id)
              .length,
            avgSessionValue: 0,
            utilization: 0 // Will be calculated from actual session data when backend provides it
          })),
          ...apiData 
        };
      case 'monthly_trends':
        return { ...baseData, monthlyData: monthlyRevenue, ...apiData };
      case 'payment_analysis':
        return { 
          ...baseData, 
          paymentMethods: Object.entries(paymentMethods).reduce((acc, [method, amount]) => {
            acc[method] = {
              amount,
              percentage: ((amount as number / totalRevenue) * 100).toFixed(1),
              count: filteredInvoices.filter(inv => inv.payment_method === method).length
            };
            return acc;
          }, {} as any),
          ...apiData 
        };
      default:
        return baseData;
    }
  };

  const generateReportData = (reportId: string) => {
    return prepareReportData(reportId, {});
  };

  // Handle report preview
  const handlePreviewReport = (reportId: string) => {
    const reportData = generateReportData(reportId);
    setPreviewModal({
      isOpen: true,
      reportType: reportId,
      reportData: reportData
    });
  };

  // Handle download from preview
  const handleDownloadFromPreview = () => {
    const { reportType, reportData } = previewModal;
    
    // Generate CSV content based on report type
    let csvContent = '';
    switch (reportType) {
      case 'financial_summary':
        csvContent = generateFinancialSummaryCSV();
        break;
      case 'invoice_report':
        csvContent = generateInvoiceReportCSV();
        break;
      case 'client_analysis':
        csvContent = generateClientAnalysisCSV();
        break;
      case 'therapist_performance':
        csvContent = generateTherapistPerformanceCSV();
        break;
      case 'monthly_trends':
        csvContent = generateMonthlyTrendsCSV();
        break;
      case 'payment_analysis':
        csvContent = generatePaymentAnalysisCSV();
        break;
    }
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    setNotification({
      show: true,
      type: 'success',
      title: 'Report Downloaded',
      message: 'Your report has been downloaded successfully.'
    });
  };

  // Handle print from preview
  const handlePrintFromPreview = () => {
    window.print();
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Reports</h1>
            <p className="text-green-100 mt-1">
              Comprehensive business intelligence and financial analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-white/50"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
            </select>
            <button 
              onClick={() => handleExportReport('pdf')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{totalRevenue.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Total Revenue</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span>Period total</span>
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
              <div className="text-4xl font-extrabold text-gray-900 mb-1">€{netProfit.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Net Profit</div>
              <div className="flex items-center text-sm text-blue-600">
                <ReceiptPercentIcon className="w-4 h-4 mr-1" />
                <span>{profitMargin}% margin</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center opacity-10">
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{totalSessions}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Completed Sessions</div>
              <div className="flex items-center text-sm text-purple-600">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>€{averageSessionValue} avg value</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center opacity-10">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">{activeClients}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Active Clients</div>
              <div className="flex items-center text-sm text-orange-600">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>+{newClients} new this period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center opacity-10">
              <UsersIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend and Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend (6 Months)</h2>
            <button className="text-sm text-green-600 hover:text-green-700">
              View detailed chart
            </button>
          </div>
          <div className="space-y-3">
            {monthlyRevenue.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max(10, (month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    €{month.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
            <button className="text-sm text-green-600 hover:text-green-700">
              View breakdown
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, amount]) => {
              const percentage = (((amount as number) / totalRevenue) * 100).toFixed(1);
              return (
                <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">{percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900">
                      €{(amount as number).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {Object.keys(paymentMethods).length === 0 && (
              <p className="text-center text-gray-500 py-4">No payment data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleExportReport('excel')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Export to Excel
            </button>
            <button 
              onClick={() => handleExportReport('csv')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Export to CSV
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableReports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generatingReports.has(report.id)}
                      className={`px-3 py-1 text-xs rounded transition-all duration-200 flex items-center space-x-1 ${
                        generatingReports.has(report.id) 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {generatingReports.has(report.id) ? (
                        <>
                          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="w-3 h-3" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handlePreviewReport(report.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                    >
                      <EyeIcon className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Period Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{filteredInvoices.length}</div>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round((filteredInvoices.filter(inv => inv.status === 'paid').length / filteredInvoices.length) * 100) || 0}%
            </div>
            <p className="text-sm text-gray-600">Collection Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">€{outstandingAmount.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Outstanding</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{activeTherapists}</div>
            <p className="text-sm text-gray-600">Active Therapists</p>
          </div>
        </div>
      </div>
      
      {/* Report Preview Inline */}
      {previewModal.isOpen && (
        <div className="mt-6">
          <ReportPreviewInline
            reportData={previewModal.reportData}
            reportType={previewModal.reportType}
            onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
            onDownload={handleDownloadFromPreview}
            onPrint={handlePrintFromPreview}
          />
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

export default Reports;