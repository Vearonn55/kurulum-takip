import { useMemo } from 'react';
import {
  Package,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/** -------- Mock metrics for a single store (replace with API later) -------- */
type PeriodMetrics = {
  success: number;
  total: number;
  prevSuccess: number;
  prevTotal: number;
};

const STORE_NAME = 'Girne-Lajivert'; // single-store manager; replace from auth/context if needed

const METRICS: { weekly: PeriodMetrics; monthly: PeriodMetrics } = {
  weekly: { success: 28, total: 32, prevSuccess: 22, prevTotal: 30 },
  monthly: { success: 118, total: 130, prevSuccess: 110, prevTotal: 126 },
};

/** KPI helpers */
function pct(n: number) {
  return Math.round(n * 100);
}
function safeRate(success: number, total: number) {
  return total > 0 ? success / total : 0;
}
function kpiFrom(metrics: PeriodMetrics) {
  const rateNow = safeRate(metrics.success, metrics.total);
  const ratePrev = safeRate(metrics.prevSuccess, metrics.prevTotal);
  const delta = rateNow - ratePrev;
  return {
    successCount: metrics.success,
    totalCount: metrics.total,
    ratePct: pct(rateNow),
    deltaPct: Math.round(delta * 1000) / 10, // one decimal place
    isUp: delta >= 0,
  };
}

export default function ManagerDashboard() {
  // derive KPIs for the single store
  const monthlyKpi = useMemo(() => kpiFrom(METRICS.monthly), []);
  const weeklyKpi  = useMemo(() => kpiFrom(METRICS.weekly),  []);

// mock recent activity (single store) — Turkish names + structured fields
type Activity = {
  id: number;
  type: 'installation_completed' | 'installation_failed' | 'reschedule' | 'new_installation';
  person: string;
  location: string;
  installNo: number;
  action: string; // short Turkish verb phrase
  time: string;
  icon: any;
  iconColor: string;
};

const recentActivities: Activity[] = [
  {
    id: 1,
    type: 'installation_completed',
    person: 'Ahmet Yılmaz',
    location: STORE_NAME,
    installNo: 1234,
    action: 'kurulumunu tamamladı',
    time: '2 dakika önce',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  {
    id: 2,
    type: 'installation_failed',
    person: 'Zeynep Demir',
    location: STORE_NAME,
    installNo: 1233,
    action: 'kurulumu başarısız oldu — eksik parça',
    time: '15 dakika önce',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  {
    id: 3,
    type: 'reschedule',
    person: 'Mehmet Kara',
    location: STORE_NAME,
    installNo: 1232,
    action: 'yarına ertelendi',
    time: '1 saat önce',
    icon: Calendar,
    iconColor: 'text-yellow-500',
  },
  {
    id: 4,
    type: 'new_installation',
    person: 'Elif Şahin',
    location: STORE_NAME,
    installNo: 1231,
    action: 'için yeni kurulum planlandı',
    time: '2 saat önce',
    icon: Package,
    iconColor: 'text-blue-500',
  },
];


  return (
    <div className="space-y-6">
      {/* Header (no store selector for manager) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of {STORE_NAME} installation operations
          </p>
        </div>
      </div>

      {/* ===== Enhanced KPI Cards Row ===== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Monthly */}
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-content py-6 px-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                  Monthly Installations
                </h3>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-extrabold text-gray-900 leading-none">
                    {monthlyKpi.successCount}
                  </div>
                  <div className="text-base text-gray-500 mb-1">
                    successful installations <span className="hidden sm:inline">•</span> of{' '}
                    {monthlyKpi.totalCount}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-3 mb-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {monthlyKpi.ratePct}%
                  </div>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                      monthlyKpi.isUp
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                    title="Change vs last month (percentage)"
                  >
                    {monthlyKpi.isUp ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {monthlyKpi.deltaPct}%
                  </div>
                </div>
                <div className="text-sm text-gray-500">vs last month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly */}
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-content py-6 px-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                  Weekly Installations
                </h3>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-extrabold text-gray-900 leading-none">
                    {weeklyKpi.successCount}
                  </div>
                  <div className="text-base text-gray-500 mb-1">
                    successful installations <span className="hidden sm:inline">•</span> of{' '}
                    {weeklyKpi.totalCount}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-3 mb-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {weeklyKpi.ratePct}%
                  </div>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                      weeklyKpi.isUp
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                    title="Change vs last week (percentage)"
                  >
                    {weeklyKpi.isUp ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {weeklyKpi.deltaPct}%
                  </div>
                </div>
                <div className="text-sm text-gray-500">vs last week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <p className="card-description">
            Latest updates from your installation operations
          </p>
        </div>
        <div className="card-content">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.iconColor === 'text-green-500'
                              ? 'bg-green-100'
                              : activity.iconColor === 'text-red-500'
                              ? 'bg-red-100'
                              : activity.iconColor === 'text-yellow-500'
                              ? 'bg-yellow-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">{activity.person}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-800">{activity.location}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          Kurulum #{activity.installNo} {activity.action}
                        </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <a
          href="/app/admin/orders"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <ShoppingCart className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Orders</h3>
            <p className="text-xs text-gray-500 mt-1">Manage and track orders</p>
          </div>
        </a>

        <a
          href="/app/installations"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Installations</h3>
            <p className="text-xs text-gray-500 mt-1">Manage all installations</p>
          </div>
        </a>
      </div>
    </div>
  );
}
