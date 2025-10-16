import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyEuroIcon, 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  TrophyIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  BellIcon,
  InboxIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAdminDashboard, useAdminWaitingList, useAdminFinancialOverview } from '@/hooks/useRealApi';
import { realApiService } from '@/services/realApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PremiumCard, PremiumButton, StatusBadge, PremiumEmptyState } from '@/components/layout/PremiumLayout';
import PageTransition from '@/components/ui/PageTransition';
import { DashboardMetrics, WaitingListApplication, FinancialOverview } from '@/types/entities';
import { formatDate, formatCurrency, formatFullDate } from '@/utils/dateFormatters';

// Enhanced Metric Card with Premium Design
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  iconColor: string;
  link?: string;
  isLoading?: boolean;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  link,
  isLoading,
  description
}) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="cursor-pointer"
      onClick={() => link && navigate(link)}
    >
      <PremiumCard 
        className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group card-hover-lift"
      >
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
        <div className={`w-full h-full ${iconColor} opacity-10 rounded-full`} />
      </div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconColor} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {changeType === 'positive' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
              {changeType === 'negative' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="flex items-center space-x-2 mt-2">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </>
          )}
        </div>
        
        {link && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </PremiumCard>
    </div>
  );
};

// Management Module Card
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color?: string;
  link: string;
  stats?: { label: string; value: string | number }[];
  isNew?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  link,
  stats,
  isNew
}) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="cursor-pointer"
      onClick={() => navigate(link)}
    >
      <PremiumCard 
        className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 card-hover-lift animate-fade-in"
      >
      {isNew && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <SparklesIcon className="w-3 h-3 mr-1" />
            New
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className={`inline-flex p-4 rounded-2xl ${color} mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </PremiumCard>
    </div>
  );
};

// Quick Action Widget
interface QuickActionProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  color?: string;
  badge?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, label, onClick, color, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-6 rounded-xl ${color} hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg`}
    >
      {badge && badge > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {badge}
        </span>
      )}
      <Icon className="w-8 h-8 text-white mb-2" />
      <span className="text-sm font-medium text-white text-center">{label}</span>
    </button>
  );
};

const ProfessionalAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // API hooks
  const { execute: getDashboard, data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboard();
  const { getWaitingList, waitingList, isLoading: isWaitingListLoading } = useAdminWaitingList();
  const { execute: getFinancialOverview, data: financialData, isLoading: isFinancialLoading } = useAdminFinancialOverview();

  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [financial, setFinancial] = useState<FinancialOverview | null>(null);
  const [recentWaitingList, setRecentWaitingList] = useState<WaitingListApplication[]>([]);
  const [autoMatchStatus, setAutoMatchStatus] = useState<{
    enabled: boolean;
    todayAssigned: number;
    pendingRequests: number;
    lastRunAt: string | null;
  }>({
    enabled: false,
    todayAssigned: 0,
    pendingRequests: 0,
    lastRunAt: null
  });

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardResult, financialResult, autoMatchResult] = await Promise.all([
          getDashboard(),
          getFinancialOverview(),
          realApiService.admin.getAutoMatchingStatus()
        ]);

        await getWaitingList();

        if (dashboardResult) {
          setMetrics(dashboardResult);
        }
        if (financialResult) {
          setFinancial(financialResult);
        }
        if (autoMatchResult && autoMatchResult.success && autoMatchResult.data) {
          setAutoMatchStatus({
            enabled: autoMatchResult.data.autoMatchingEnabled,
            todayAssigned: autoMatchResult.data.todayStats?.assigned || 0,
            pendingRequests: autoMatchResult.data.statistics?.pendingRequests || 0,
            lastRunAt: autoMatchResult.data.todayStats?.lastRunAt || null
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, []);

  // Update recent waiting list when data changes
  useEffect(() => {
    if (waitingList && waitingList.length > 0) {
      setRecentWaitingList(waitingList.slice(0, 5));
    }
  }, [waitingList]);

  const isLoading = isDashboardLoading || isFinancialLoading || isWaitingListLoading;

  // Management modules
  const managementModules = [
    {
      title: t('nav.clients'),
      description: t('dashboard.clientManagementDesc') || 'Manage client profiles, sessions, and treatment plans',
      icon: UserGroupIcon,
      color: 'bg-blue-600',
      link: '/admin/clients',
      stats: [
        { label: t('dashboard.activeClients'), value: metrics?.activeClients || 0 },
        { label: t('dashboard.newThisMonth'), value: metrics?.newClientsThisMonth || 0 }
      ]
    },
    {
      title: t('nav.therapists'),
      description: t('dashboard.therapistManagementDesc') || 'Manage therapist profiles, schedules, and assignments',
      icon: UsersIcon,
      color: 'bg-purple-600',
      link: '/admin/therapists',
      stats: [
        { label: t('dashboard.activeTherapists'), value: metrics?.therapistCount || 0 },
        { label: t('dashboard.sessionsToday') || 'Sessions Today', value: metrics?.sessionsToday || 0 }
      ]
    },
    {
      title: t('nav.financial'),
      description: t('dashboard.financialOverviewDesc') || 'Track revenue, invoices, and payment status',
      icon: CurrencyEuroIcon,
      color: 'bg-green-600',
      link: '/admin/financial',
      stats: [
        { label: t('dashboard.monthlyRevenue'), value: `€${financial?.totalRevenue?.toLocaleString() || '0'}` },
        { label: t('dashboard.outstanding') || 'Outstanding', value: `€${financial?.outstandingAmount?.toLocaleString() || '0'}` }
      ]
    },
    {
      title: 'Auto-Match System',
      description: 'Automatically match pending appointment requests to best available therapists',
      icon: SparklesIcon,
      color: 'bg-purple-600',
      link: '/admin/appointment-requests',
      stats: [
        { label: 'Status', value: autoMatchStatus.enabled ? 'Active' : 'Inactive' },
        { label: 'Today Assigned', value: autoMatchStatus.todayAssigned },
        { label: 'Pending Requests', value: autoMatchStatus.pendingRequests }
      ],
      badge: autoMatchStatus.enabled ? { text: 'ON', color: 'bg-green-100 text-green-800' } : undefined,
      isNew: true
    },
    {
      title: t('nav.addressChanges'),
      description: t('dashboard.addressChangesDesc') || 'Review and approve client address change requests',
      icon: HomeIcon,
      color: 'bg-indigo-600',
      link: '/admin/address-changes',
      stats: [
        { label: t('status.pending'), value: metrics?.pendingAddressChanges || 0 },
        { label: t('dashboard.totalRequests') || 'Total Requests', value: metrics?.totalAddressChanges || 0 }
      ],
      isNew: true
    },
    {
      title: t('nav.challenges'),
      description: t('dashboard.challengesDesc') || 'Create and manage therapeutic challenges',
      icon: TrophyIcon,
      color: 'bg-emerald-600',
      link: '/admin/challenges',
      stats: [
        { label: t('status.active'), value: metrics?.activeChallenges || 0 },
        { label: t('dashboard.participants') || 'Participants', value: metrics?.challengeParticipants || 0 }
      ],
      isNew: true
    },
    {
      title: t('nav.resources'),
      description: t('dashboard.resourcesDesc') || 'Manage therapeutic resources and materials',
      icon: BookOpenIcon,
      color: 'bg-blue-600',
      link: '/admin/resources',
      stats: [
        { label: t('nav.resources'), value: metrics?.totalResources || 0 },
        { label: t('dashboard.assignments') || 'Assignments', value: metrics?.resourceAssignments || 0 }
      ],
      isNew: true
    },
    {
      title: t('nav.surveys'),
      description: t('dashboard.surveysDesc') || 'Create and manage client feedback surveys',
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-teal-600',
      link: '/admin/surveys',
      stats: [
        { label: t('dashboard.activeSurveys') || 'Active Surveys', value: metrics?.activeSurveys || 0 },
        { label: t('dashboard.responses') || 'Responses', value: metrics?.surveyResponses || 0 }
      ],
      isNew: true
    },
    {
      title: t('nav.settings'),
      description: t('dashboard.systemSettingsDesc') || 'Configure practice settings and integrations',
      icon: Cog6ToothIcon,
      color: 'bg-gray-600',
      link: '/admin/settings',
      stats: [
        { label: t('dashboard.users') || 'Users', value: metrics?.totalUsers || 0 },
        { label: t('dashboard.integrations') || 'Integrations', value: metrics?.activeIntegrations || 0 }
      ]
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center">
                <ShieldCheckIcon className="w-10 h-10 mr-3" />
                {t('nav.dashboard')}
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">
                {t('dashboard.welcome')}, {user?.first_name || t('role.admin')}
              </p>
              <p className="text-indigo-200 mt-1">
                {formatFullDate(new Date())}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <PremiumButton
                onClick={() => navigate('/admin/reports')}
                className="bg-white/20 border border-white/30 text-white hover:bg-white/30 btn-enhanced"
                icon={DocumentChartBarIcon}
              >
                {t('nav.reports')}
              </PremiumButton>
              <PremiumButton
                onClick={() => navigate('/admin/notifications')}
                className="bg-white text-indigo-600 hover:bg-gray-100 btn-enhanced"
                icon={BellIcon}
              >
                {t('nav.notifications') || 'Notifications'}
                {metrics?.unreadNotifications && metrics.unreadNotifications > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {metrics.unreadNotifications}
                  </span>
                )}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('dashboard.activeClients') || 'Active Clients'}
            value={metrics?.activeClients || 0}
            change={`${metrics?.newClientsThisMonth || 0} ${t('dashboard.newThisMonth') || 'new this month'}`}
            changeType={metrics?.newClientsThisMonth ? "positive" : "neutral"}
            icon={UsersIcon}
            iconColor="bg-blue-600"
            link="/admin/clients"
            isLoading={isLoading}
            description={t('dashboard.totalActiveClientAccounts') || "Total active client accounts"}
          />
          <MetricCard
            title={t('dashboard.monthlyRevenue')}
            value={`€${financial?.totalRevenue?.toLocaleString() || '0'}`}
            change={financial?.revenueGrowth ? `${financial.revenueGrowth}% ${t('dashboard.growth') || 'growth'}` : "YTD"}
            changeType={financial?.revenueGrowth && financial.revenueGrowth > 0 ? "positive" : "neutral"}
            icon={CurrencyEuroIcon}
            iconColor="bg-green-600"
            link="/admin/financial"
            isLoading={isLoading}
            description={t('dashboard.totalRevenueThisMonth') || "Total revenue this month"}
          />
          <MetricCard
            title={t('dashboard.todayAppointments') || "Today's Appointments"}
            value={metrics?.appointmentsToday || 0}
            change={`${metrics?.upcomingAppointments || 0} ${t('dashboard.upcoming') || 'upcoming'}`}
            changeType={metrics?.appointmentsToday ? "positive" : "neutral"}
            icon={CalendarIcon}
            iconColor="bg-purple-600"
            link="/admin/agenda"
            isLoading={isLoading}
            description={t('dashboard.scheduledForToday') || "Scheduled for today"}
          />
          <MetricCard
            title={t('nav.waitingList')}
            value={metrics?.waitingListCount || 0}
            change={metrics?.criticalWaitingList ? `${metrics.criticalWaitingList} ${t('dashboard.critical') || 'critical'}` : t('dashboard.normal') || "Normal"}
            changeType={metrics?.criticalWaitingList ? "negative" : "neutral"}
            icon={ClockIcon}
            iconColor="bg-orange-600"
            link="/admin/waiting-list"
            isLoading={isLoading}
            description={t('dashboard.pendingApplications') || "Pending applications"}
          />
        </div>

        {/* Quick Actions */}
        <PremiumCard>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction
                icon={UserGroupIcon}
                label={t('dashboard.addNewClient')}
                onClick={() => navigate('/admin/clients/new')}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
              />
              <QuickAction
                icon={CalendarIcon}
                label={t('dashboard.viewSchedule')}
                onClick={() => navigate('/admin/agenda')}
                color="bg-gradient-to-br from-green-600 to-green-700"
                badge={metrics?.appointmentsToday}
              />
              <QuickAction
                icon={BanknotesIcon}
                label={t('dashboard.createInvoice')}
                onClick={() => navigate('/admin/financial/invoices/new')}
                color="bg-gradient-to-br from-purple-600 to-purple-700"
              />
              <QuickAction
                icon={InboxIcon}
                label={t('nav.waitingList')}
                onClick={() => navigate('/admin/waiting-list')}
                color="bg-gradient-to-br from-orange-600 to-orange-700"
                badge={metrics?.waitingListCount}
              />
            </div>
          </div>
        </PremiumCard>

        {/* Management Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.managementModules')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementModules.map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Waiting List */}
          <PremiumCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentApplications')}</h3>
                <Link 
                  to="/admin/waiting-list" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  {t('dashboard.viewAll')}
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {isWaitingListLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentWaitingList.length > 0 ? (
                <div className="space-y-3">
                  {recentWaitingList.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {application.first_name} {application.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('dashboard.applied')} {formatDate(application.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge
                          type="waiting_list"
                          status={application.status}
                          size="sm"
                        />
                        {application.urgency_level === 'critical' && (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('dashboard.noPendingApplications')}</p>
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Financial Insights */}
          <PremiumCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.financialInsights')}</h3>
                <Link 
                  to="/admin/financial" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  {t('dashboard.viewDetails')}
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {isFinancialLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{t('dashboard.totalRevenueMTD')}</span>
                      <span className="text-xl font-bold text-green-600">
                        €{financial?.totalRevenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{t('dashboard.outstandingAmount')}</span>
                      <span className="text-xl font-bold text-orange-600">
                        €{financial?.outstandingAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{t('dashboard.paidThisMonth')}</span>
                      <span className="text-xl font-bold text-blue-600">
                        €{financial?.paidThisMonth?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{t('dashboard.projectedRevenue')}</span>
                      <span className="text-2xl font-bold text-gray-900">
                        €{financial?.projectedRevenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min((financial?.paidThisMonth || 0) / (financial?.projectedRevenue || 1) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((financial?.paidThisMonth || 0) / (financial?.projectedRevenue || 1) * 100)}% {t('dashboard.ofProjectedRevenueAchieved')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfessionalAdminDashboard;