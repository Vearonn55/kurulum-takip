// src/pages/shared/ReportsPage.tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarRange, RefreshCw, TrendingUp, BarChart3, AlertTriangle, Store } from 'lucide-react';

import type { KPIMetrics, Store as StoreType } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

// ---- utils ----
const fmtPct = (n?: number) => (typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—');
const lastNDays = (n: number) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - n + 1);
  const iso = (d: Date) => d.toISOString().split('T')[0];
  return { from: iso(from), to: iso(to) };
};
// ---------------

export default function ReportsPage() {
  const { user } = useAuthStore();

  // Filters
  const initialRange = lastNDays(30);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [storeId, setStoreId] = useState(
    user?.role === 'STORE_MANAGER' && user.store_id ? user.store_id : ''
  );

  // Stores for filter (crew doesn’t need stores here, but this page is already role-guarded in routes)
  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await apiClient.getStores();
      return res.data as StoreType[];
    },
    enabled: user?.role !== 'CREW',
    staleTime: 5 * 60 * 1000,
  });

  // KPIs
  const kpisQuery = useQuery({
    queryKey: ['kpis', { from, to, store_id: storeId }],
    queryFn: async () => {
      const res = await apiClient.getKPIs({
        from,
        to,
        store_id: storeId || undefined,
      });
      return res.data as KPIMetrics;
    },
  });

  // SLA & Failures (no filters in spec; wire as-is)
  const slaQuery = useQuery({
    queryKey: ['sla-report'],
    queryFn: async () => {
      const res = await apiClient.getSLAReport();
      return res.data as any;
    },
  });

  const failuresQuery = useQuery({
    queryKey: ['failure-report'],
    queryFn: async () => {
      const res = await apiClient.getFailureReport();
      return res.data as any;
    },
  });

  const failurePairs = useMemo<[string, number][]>(() => {
    const freq = kpisQuery.data?.failure_reasons ?? {};
    return Object.entries(freq).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  }, [kpisQuery.data]);

  const maxFailure = useMemo(() => {
    return failurePairs.reduce((m, [, v]) => Math.max(m, v), 0);
  }, [failurePairs]);

  const stockout = kpisQuery.data?.stockout_trends ?? [];
  const maxStock = stockout.reduce((m, s) => Math.max(m, s.count), 0) || 1;

  const handleRefresh = () => {
    kpisQuery.refetch();
    slaQuery.refetch();
    failuresQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance metrics, trends, and failure insights
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          disabled={kpisQuery.isFetching || slaQuery.isFetching || failuresQuery.isFetching}
        >
          <RefreshCw
            className={cn(
              'h-4 w-4',
              (kpisQuery.isFetching || slaQuery.isFetching || failuresQuery.isFetching) && 'animate-spin'
            )}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600 flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-gray-500" />
              From
            </span>
            <input
              type="date"
              className="input w-full"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600 flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-gray-500" />
              To
            </span>
            <input
              type="date"
              className="input w-full"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          {user?.role !== 'CREW' && (
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-gray-600 flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-500" />
                Store
              </span>
              <select
                className="input w-full"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              >
                <option value="">
                  {user?.role === 'STORE_MANAGER' ? 'My store' : 'All stores'}
                </option>
                {storesQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="card">
          <div className="card-content flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-semibold text-gray-900">
                {fmtPct(kpisQuery.data?.completion_rate)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Reschedule Rate</div>
              <div className="text-2xl font-semibold text-gray-900">
                {fmtPct(kpisQuery.data?.reschedule_rate)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-violet-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Crew Utilization</div>
              <div className="text-2xl font-semibold text-gray-900">
                {fmtPct(kpisQuery.data?.crew_utilization)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Failure reasons + Stockout trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure reasons */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Failure Reasons
            </h3>
            <p className="card-description">Top reasons by count</p>
          </div>
          <div className="card-content">
            {kpisQuery.isLoading && (
              <div className="text-sm text-gray-500">Loading…</div>
            )}
            {kpisQuery.isError && (
              <div className="text-sm text-red-600">Failed to load.</div>
            )}
            {!kpisQuery.isLoading && failurePairs.length === 0 && (
              <div className="text-sm text-gray-500">No failures in this period.</div>
            )}
            <ul className="space-y-3">
              {failurePairs.map(([reason, count]) => (
                <li key={reason}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{reason}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-red-400"
                      style={{ width: `${(count / (maxFailure || 1)) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stockout trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Stockout Trends
            </h3>
            <p className="card-description">Daily count of stockouts</p>
          </div>
          <div className="card-content">
            {kpisQuery.isLoading && (
              <div className="text-sm text-gray-500">Loading…</div>
            )}
            {kpisQuery.isError && (
              <div className="text-sm text-red-600">Failed to load.</div>
            )}
            {!kpisQuery.isLoading && stockout.length === 0 && (
              <div className="text-sm text-gray-500">No data for this period.</div>
            )}
            {stockout.length > 0 && (
              <div className="mt-1 flex items-end gap-1 h-24 border-b pb-2">
                {stockout.map((s) => (
                  <div key={s.date} className="flex flex-col items-center">
                    <div
                      className="w-3 bg-blue-400 rounded-t"
                      style={{
                        height: `${Math.max(4, (s.count / (maxStock || 1)) * 96)}px`,
                      }}
                      title={`${s.date}: ${s.count}`}
                    />
                  </div>
                ))}
              </div>
            )}
            {stockout.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Start: {stockout[0].date}</div>
                <div className="text-right">End: {stockout[stockout.length - 1].date}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLA & Failures raw (optional summaries) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">SLA Overview</h3>
            <p className="card-description">Raw SLA metrics from backend</p>
          </div>
          <div className="card-content">
            {slaQuery.isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {slaQuery.isError && <div className="text-sm text-red-600">Failed to load.</div>}
            {!slaQuery.isLoading && !slaQuery.isError && (
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                {JSON.stringify(slaQuery.data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Failure Report</h3>
            <p className="card-description">Raw failure details from backend</p>
          </div>
          <div className="card-content">
            {failuresQuery.isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {failuresQuery.isError && <div className="text-sm text-red-600">Failed to load.</div>}
            {!failuresQuery.isLoading && !failuresQuery.isError && (
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                {JSON.stringify(failuresQuery.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
