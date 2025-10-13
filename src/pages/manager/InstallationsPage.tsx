// src/pages/manager/InstallationsPage.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, RefreshCw, CalendarDays, ChevronRight } from 'lucide-react';

import type { Installation } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

const STATUSES: Installation['status'][] = [
  'pending',
  'staged',
  'accepted',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
];

const badge = (s: Installation['status']) =>
  s === 'completed'
    ? 'bg-emerald-100 text-emerald-800'
    : s === 'in_progress' || s === 'accepted'
    ? 'bg-blue-100 text-blue-800'
    : s === 'failed'
    ? 'bg-red-100 text-red-800'
    : s === 'cancelled'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800';

export default function InstallationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const myStoreId = user?.role === 'STORE_MANAGER' ? user.store_id : undefined;

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const query = useQuery({
    queryKey: ['installations', { store_id: myStoreId ?? '', status, from, to }],
    queryFn: async () => {
      const res = await apiClient.getInstallations({
        store_id: myStoreId,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      return res.data as Installation[];
    },
  });

  const list = useMemo(() => {
    const l = query.data ?? [];
    if (!q.trim()) return l;
    const s = q.trim().toLowerCase();
    return l.filter((x) => x.id.toLowerCase().includes(s) || x.order_id.toLowerCase().includes(s));
  }, [q, query.data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
          <p className="mt-1 text-sm text-gray-500">All scheduled installation jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/app/calendar')}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search by Installation ID / Order ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <input
            type="date"
            className="input w-full"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            className="input w-full"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(list ?? []).map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-primary-700">
                  <Link to={`/app/installations/${it.id}`} className="hover:underline">
                    {it.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <Link to={`/app/orders/${it.order_id}`} className="hover:underline">
                    {it.order_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{it.store_id || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badge(it.status))}>
                    {it.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {it.scheduled_start ? new Date(it.scheduled_start).toLocaleString() : '—'}
                  <span className="text-gray-400"> → </span>
                  {it.scheduled_end ? new Date(it.scheduled_end).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      to={`/app/installations/${it.id}`}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/app/calendar"
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      title="Open calendar"
                    >
                      Calendar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {!query.isLoading && (list?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No installations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {query.isLoading && <div className="px-4 py-6 text-sm text-gray-500">Loading installations…</div>}
        {query.isError && <div className="px-4 py-6 text-sm text-red-600">Failed to load installations.</div>}
      </div>
    </div>
  );
}
