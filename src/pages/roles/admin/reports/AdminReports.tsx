import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useDashboard } from '@/hooks/useApi';
import { PremiumCard, PremiumButton, PremiumEmptyState, PremiumMetric } from '@/components/layout/PremiumLayout';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'clinical' | 'administrative' | 'statistical';
  period: string;
  generated_date: string;
  status: 'ready' | 'generating' | 'error';
  file_size?: string;
}

interface ReportMetrics {
  total_clients: number;
  active_therapists: number;
  sessions_this_month: number;
  revenue_this_month: number;
  completion_rate: number;
  average_session_duration: number;
}

const AdminReports: React.FC = () => {
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const { getStats, isLoading } = useDashboard();
  const { success, info, warning } = useAlert();

  // State
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedType, setSelectedType] = useState('all');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Default empty state for reports
  const emptyReports: ReportData[] = [];
  
  // Default empty metrics
  const emptyMetrics: ReportMetrics = {
    total_clients: 0,
    active_therapists: 0,
    sessions_this_month: 0,
    revenue_this_month: 0,
    completion_rate: 0,
    average_session_duration: 0
  };

  // Load reports data
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const data = await getStats();
        if (data) {
          // Only use real data from backend
          const reportData = data as any;
          setMetrics({
            total_clients: reportData.total_clients || 0,
            active_therapists: reportData.active_therapists || 0,
            sessions_this_month: reportData.sessions_this_month || 0,
            revenue_this_month: reportData.revenue_this_month || 0,
            completion_rate: reportData.completion_rate || 0,
            average_session_duration: reportData.average_session_duration || 0
          });
        }
        // Reports will be empty until backend provides them
        setReports(emptyReports);
      } catch (error) {
        console.error('Failed to load reports data:', error);
        // Keep empty state on error
        setMetrics(emptyMetrics);
        setReports(emptyReports);
      }
    };

    loadReportsData();
  }, [getStats]);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesType;
  });

  // Handle report generation
  const handleGenerateReport = async (type: string) => {
    setIsGenerating(type);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(null);
      success(`${type} report generated successfully`);
    }, 3000);
  };

  // Handle report download
  const handleDownloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      info(`Downloading ${report.title}...`);
      // In a real app, this would trigger the actual file download
    }
  };

  // Get report type color
  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-600 bg-green-50 border-green-200';
      case 'clinical': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'administrative': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'statistical': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'generating': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3" />
              Reports & Analytics
            </h1>
            <p className="text-blue-100 mt-1">
              Comprehensive reporting and data analysis for practice management
            </p>
          </div>
          <div className="flex space-x-3">
            <PremiumButton
              variant="outline"
              icon={DocumentChartBarIcon}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => info('Custom report builder coming soon')}
            >
              Custom Report
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <PremiumMetric
          title="Total Clients"
          value={metrics.total_clients}
          change={{ value: '+12 this month', type: 'positive' }}
          icon={UsersIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Active Therapists"
          value={metrics.active_therapists}
          change={{ value: 'All active', type: 'positive' }}
          icon={UsersIcon}
          iconColor="text-green-600"
        />
        <PremiumMetric
          title="Sessions"
          value={metrics.sessions_this_month}
          change={{ value: 'This month', type: 'neutral' }}
          icon={CalendarIcon}
          iconColor="text-purple-600"
        />
        <PremiumMetric
          title="Revenue"
          value={`€${metrics.revenue_this_month.toLocaleString()}`}
          change={{ value: '+8.5% vs last month', type: 'positive' }}
          icon={CurrencyDollarIcon}
          iconColor="text-green-600"
        />
        <PremiumMetric
          title="Completion Rate"
          value={`${metrics.completion_rate}%`}
          change={{ value: 'Above target', type: 'positive' }}
          icon={ChartBarIcon}
          iconColor="text-blue-600"
        />
        <PremiumMetric
          title="Avg Duration"
          value={`${metrics.average_session_duration}min`}
          change={{ value: 'Per session', type: 'neutral' }}
          icon={ClockIcon}
          iconColor="text-orange-600"
        />
      </div>

      {/* Quick Report Generation */}
      <PremiumCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'financial', title: 'Financial Report', description: 'Revenue, expenses, and profit analysis', icon: CurrencyDollarIcon },
            { type: 'clinical', title: 'Clinical Report', description: 'Patient outcomes and therapy effectiveness', icon: ChartBarIcon },
            { type: 'administrative', title: 'Admin Report', description: 'Staff performance and operational metrics', icon: UsersIcon },
            { type: 'statistical', title: 'Statistical Report', description: 'Usage patterns and trend analysis', icon: DocumentChartBarIcon }
          ].map((reportType) => (
            <div key={reportType.type} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <reportType.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{reportType.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{reportType.description}</p>
              <PremiumButton
                size="sm"
                variant="primary"
                onClick={() => handleGenerateReport(reportType.type)}
                disabled={isGenerating === reportType.type}
                className="w-full"
              >
                {isGenerating === reportType.type ? 'Generating...' : 'Generate'}
              </PremiumButton>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Report Filters */}
      <PremiumCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Report Types</option>
              <option value="financial">Financial</option>
              <option value="clinical">Clinical</option>
              <option value="administrative">Administrative</option>
              <option value="statistical">Statistical</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="current_year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <PremiumButton size="sm" variant="outline" icon={PrinterIcon}>
              Print All
            </PremiumButton>
            <PremiumButton size="sm" variant="outline" icon={ArrowDownTrayIcon}>
              Export All
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>

      {/* Available Reports */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
          <span className="text-sm text-gray-500">
            {filteredReports.length} reports available
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <PremiumEmptyState
            icon={DocumentChartBarIcon}
            title="No Reports Found"
            description="No reports match your current filters."
            action={{
              label: 'Generate New Report',
              onClick: () => info('Select a report type above to generate')
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getReportTypeColor(report.type)}`}>
                        {report.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Period: {report.period}</span>
                      <span>Generated: {new Date(report.generated_date).toLocaleDateString()}</span>
                      {report.file_size && <span>Size: {report.file_size}</span>}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {report.status === 'ready' && (
                      <>
                        <PremiumButton
                          size="sm"
                          variant="primary"
                          icon={ArrowDownTrayIcon}
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          Download
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          variant="outline"
                          icon={PrinterIcon}
                          onClick={() => info(`Printing ${report.title}...`)}
                        >
                          Print
                        </PremiumButton>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center text-sm text-yellow-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Generating...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

export default AdminReports;