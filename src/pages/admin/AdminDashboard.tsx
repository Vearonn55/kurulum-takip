import { useMemo, useState } from 'react';
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

type Store =
  | 'All Stores'
  | 'Girne-Lajivert'
  | 'Lefkosa-Weltew'
  | 'Magusa-Weltew'
  | 'Lefkosa-Lajivert';

const STORES: Store[] = [
  'All Stores',
  'Girne-Lajivert',
  'Lefkosa-Weltew',
  'Magusa-Weltew',
  'Lefkosa-Lajivert',
];

/** ---------- Mock metrics (replace with API later) ---------- */
type PeriodKey = 'weekly' | 'monthly';
type PeriodMetrics = {
  success: number;
  total: number;
  prevSuccess: number;
  prevTotal: number;
};
type StoreMetrics = Record<Store, Record<PeriodKey, PeriodMetrics>>;

const MOCK_STORE_METRICS_BASE: Omit<StoreMetrics, 'All Stores'> = {
  'Girne-Lajivert': {
    weekly: { success: 28, total: 32, prevSuccess: 22, prevTotal: 30 },
    monthly: { success: 118, total: 130, prevSuccess: 110, prevTotal: 126 },
  },
  'Lefkosa-Weltew': {
    weekly: { success: 19, total: 22, prevSuccess: 17, prevTotal: 21 },
    monthly: { success: 83, total: 92, prevSuccess: 80, prevTotal: 94 },
  },
  'Magusa-Weltew': {
    weekly: { success: 15, total: 18, prevSuccess: 16, prevTotal: 20 },
    monthly: { success: 69, total: 78, prevSuccess: 72, prevTotal: 85 },
  },
  'Lefkosa-Lajivert': {
    weekly: { success: 12, total: 14, prevSuccess: 10, prevTotal: 13 },
    monthly: { success: 55, total: 61, prevSuccess: 49, prevTotal: 59 },
  },
} as const;

/** Aggregate helper to compute "All Stores" */
function aggregateAllStores(
  stores: Omit<StoreMetrics, 'All Stores'>
): StoreMetrics {
  const sum = (key: PeriodKey) => {
    let success = 0,
      total = 0,
      prevSuccess = 0,
      prevTotal = 0;
    for (const s of Object.values(stores)) {
      success += s[key].success;
      total += s[key].total;
      prevSuccess += s[key].prevSuccess;
      prevTotal += s[key].prevTotal;
    }
    return { success, total, prevSuccess, prevTotal };
  };

  return {
    ...stores,
    'All Stores': {
      weekly: sum('weekly'),
      monthly: sum('monthly'),
    },
  } as StoreMetrics;
}

/** KPI compute helpers */
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
    deltaPctPoints: Math.round(delta * 1000) / 10,
    isUp: delta >= 0,
  };
}

/** ---------------- Component ---------------- */
export default function AdminDashboard() {
  const [selectedStore, setSelectedStore] = useState<Store>('All Stores');

  const storeMetrics = useMemo(
    () => aggregateAllStores(MOCK_STORE_METRICS_BASE),
    []
  );

  const monthlyKpi = useMemo(
    () => kpiFrom(storeMetrics[selectedStore].monthly),
    [selectedStore, storeMetrics]
  );
  const weeklyKpi = useMemo(
    () => kpiFrom(storeMetrics[selectedStore].weekly),
    [selectedStore, storeMetrics]
  );

 // mock recent activity — Turkish names, English text
type Activity = {
  id: number;
  type: 'installation_completed' | 'installation_failed' | 'reschedule' | 'new_installation';
  person: string;    // Turkish name (highlighted)
  location: string;  // e.g., 'Girne-Lajivert'
  installNo: number; // installation number
  action: string;    // English description that follows the number
  time: string;
  icon: any;
  iconColor: string;
  store: Store;      // keep for the store filter dropdown (same as location)
};

const recentActivities: Activity[] = [
  {
    id: 1,
    type: 'installation_completed',
    person: 'Ahmet Yılmaz',
    location: 'Girne-Lajivert',
    installNo: 1234,
    action: 'completed the installation successfully',
    time: '2 minutes ago',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    store: 'Girne-Lajivert',
  },
  {
    id: 2,
    type: 'installation_failed',
    person: 'Zeynep Demir',
    location: 'Lefkosa-Weltew',
    installNo: 1233,
    action: 'installation failed – missing parts',
    time: '15 minutes ago',
    icon: XCircle,
    iconColor: 'text-red-500',
    store: 'Lefkosa-Weltew',
  },
  {
    id: 3,
    type: 'reschedule',
    person: 'Mehmet Kara',
    location: 'Magusa-Weltew',
    installNo: 1232,
    action: 'was rescheduled to tomorrow',
    time: '1 hour ago',
    icon: Calendar,
    iconColor: 'text-yellow-500',
    store: 'Magusa-Weltew',
  },
  {
    id: 4,
    type: 'new_installation',
    person: 'Elif Şahin',
    location: 'Lefkosa-Lajivert',
    installNo: 1231,
    action: 'was scheduled as a new installation',
    time: '2 hours ago',
    icon: Package,
    iconColor: 'text-blue-500',
    store: 'Lefkosa-Lajivert',
  },
];


  const filteredActivities = useMemo(
    () =>
      selectedStore === 'All Stores'
        ? recentActivities
        : recentActivities.filter((a) => a.store === selectedStore),
    [selectedStore]
  );

  return (
    <div className="space-y-6">
      {/* Header + Store Filter */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your furniture installation operations
          </p>
        </div>

        {/* Store dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="storeFilter" className="text-sm text-gray-600">
            Store
          </label>
          <select
            id="storeFilter"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value as Store)}
            className="block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== Enhanced KPI Cards Row ===== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Monthly Success */}
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
                    {monthlyKpi.deltaPctPoints}%
                  </div>
                </div>
                <div className="text-sm text-gray-500">vs last month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Success */}
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
                    {weeklyKpi.deltaPctPoints}%
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
              {filteredActivities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== filteredActivities.length - 1 ? (
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
                            Installation #{activity.installNo} {activity.action}
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

              {filteredActivities.length === 0 && (
                <li className="py-6 text-sm text-gray-500">No activity for this store.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        <a
          href="/app/admin/users"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Manage Users</h3>
            <p className="text-xs text-gray-500 mt-1">Add and edit users</p>
          </div>
        </a>

        <a
          href="/app/admin/reports"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
            <p className="text-xs text-gray-500 mt-1">Analytics and insights</p>
          </div>
        </a>
      </div>
    </div>
  );
}
