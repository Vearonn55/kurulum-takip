// src/pages/manager/OrderDetailPage.tsx
import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, Package, User, CalendarDays } from 'lucide-react';

import type { Order } from '../../types';
import { apiClient } from '../../lib/api';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await apiClient.getOrder(id as string);
      return res.data as any; // backend shape may include customer/items
    },
    enabled: !!id,
  });

  const order = orderQuery.data as Order | (Order & {
    customer?: { full_name?: string; phone?: string; email?: string };
    items?: Array<{ id: string; product_id: string; quantity: number; name?: string; sku?: string }>;
  });

  const items = useMemo(() => order?.items ?? [], [order]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border px-2 py-1.5 text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{id}</h1>
            <p className="mt-1 text-sm text-gray-500">Imported order details</p>
          </div>
        </div>
        <Link
          to="/app/installations/new"
          className="rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
        >
          Create Installation
        </Link>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Status</h3>
            <p className="card-description">Order state</p>
          </div>
          <div className="card-content">
            <span
              className={
                order?.status === 'confirmed'
                  ? 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
                  : order?.status === 'pending'
                  ? 'inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800'
                  : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800'
              }
            >
              {order?.status ?? '—'}
            </span>
            <div className="mt-2 text-sm text-gray-600">
              Placed: {order?.placed_at ? new Date(order.placed_at).toLocaleString() : '—'}
            </div>
            <div className="mt-1 text-sm text-gray-600">Store: {order?.store_id ?? '—'}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </h3>
            <p className="card-description">Contact details</p>
          </div>
          <div className="card-content text-sm">
            <div className="text-gray-900">{order?.customer?.full_name ?? '—'}</div>
            <div className="text-gray-600">{order?.customer?.phone ?? '—'}</div>
            <div className="text-gray-600">{order?.customer?.email ?? '—'}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Next steps
            </h3>
            <p className="card-description">Plan installation</p>
          </div>
          <div className="card-content space-y-2">
            <Link
              to="/app/installations/new"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <ClipboardList className="h-4 w-4" />
              Create Installation
            </Link>
            <Link
              to="/app/calendar"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </h3>
          <p className="card-description">Products in this order</p>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{it.name || it.product_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.sku || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.quantity}</td>
                </tr>
              ))}
              {(items?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {orderQuery.isLoading && (
            <div className="px-4 py-6 text-sm text-gray-500">Loading order…</div>
          )}
          {orderQuery.isError && (
            <div className="px-4 py-6 text-sm text-red-600">Failed to load order.</div>
          )}
        </div>
      </div>
    </div>
  );
}
