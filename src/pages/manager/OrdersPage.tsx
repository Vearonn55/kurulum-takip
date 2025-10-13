// src/pages/manager/OrdersPage.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, RefreshCw, Plus, ChevronRight } from 'lucide-react';

import type { Order } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

const STATUSES = ['pending', 'confirmed', 'cancelled'] as const;

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const myStoreId = user?.role === 'STORE_MANAGER' ? user.store_id : undefined;

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');

  const ordersQuery = useQuery({
    queryKey: ['orders', { store_id: myStoreId ?? '', status }],
    queryFn: async () => {
      const res = await apiClient.getOrders({
        store_id: myStoreId,
        status: status || undefined,
      });
      return res.data as Order[];
    },
  });

  const orders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    if (!q.trim()) return list;
    const s = q.trim().toLowerCase();
    return list.filter((o) => o.id.toLowerCase().includes(s));
  }, [ordersQuery.data, q]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Imported from external system</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', ordersQuery.isFetching && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/app/installations/new')}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New Installation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search by Order ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placed At
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-primary-700">
                  <Link to={`/app/orders/${o.id}`} className="hover:underline">
                    {o.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{o.store_id || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      o.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {o.placed_at ? new Date(o.placed_at).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      to={`/app/orders/${o.id}`}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      onClick={() => navigate('/app/installations/new')}
                      title="Create Installation"
                    >
                      Create Installation
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!ordersQuery.isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {ordersQuery.isLoading && (
          <div className="px-4 py-6 text-sm text-gray-500">Loading orders…</div>
        )}
        {ordersQuery.isError && (
          <div className="px-4 py-6 text-sm text-red-600">Failed to load orders.</div>
        )}
      </div>
    </div>
  );
}
