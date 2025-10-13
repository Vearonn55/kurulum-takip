// src/pages/manager/InstallationDetailPage.tsx
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ClipboardList, Package, Users, Info, FileText } from 'lucide-react';

import type { Installation } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';

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

export default function InstallationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['installation', id],
    queryFn: async () => {
      const res = await apiClient.getInstallation(id as string);
      return res.data as Installation & {
        items?: Array<{ id: string; order_item_id: string; room_tag?: string; special_instructions?: string }>;
        crew?: Array<{ id: string; crew_user_id: string; role: string; accepted_at?: string; declined_at?: string }>;
        order?: { id: string };
      };
    },
    enabled: !!id,
  });

  const inst = query.data;
  const items = useMemo(() => inst?.items ?? [], [inst]);
  const crew = useMemo(() => inst?.crew ?? [], [inst]);

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
            <h1 className="text-2xl font-bold text-gray-900">Installation #{id}</h1>
            <p className="mt-1 text-sm text-gray-500">Detailed overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/calendar"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Open Calendar
          </Link>
          {inst?.order && (
            <Link
              to={`/app/orders/${inst.order_id}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              View Order
            </Link>
          )}
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Info className="h-4 w-4" />
              Status
            </h3>
            <p className="card-description">State & schedule</p>
          </div>
          <div className="card-content space-y-2 text-sm">
            <div>
              <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', inst ? badge(inst.status) : 'bg-gray-100 text-gray-800')}>
                {inst?.status ?? '—'}
              </span>
            </div>
            <div>Store: <span className="text-gray-700">{inst?.store_id ?? '—'}</span></div>
            <div>
              Start:{' '}
              <span className="text-gray-700">
                {inst?.scheduled_start ? new Date(inst.scheduled_start).toLocaleString() : '—'}
              </span>
            </div>
            <div>
              End:{' '}
              <span className="text-gray-700">
                {inst?.scheduled_end ? new Date(inst.scheduled_end).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="h-4 w-4" />
              Crew
            </h3>
            <p className="card-description">Assigned team</p>
          </div>
          <div className="card-content">
            {crew.length === 0 ? (
              <div className="text-sm text-gray-500">No crew assigned.</div>
            ) : (
              <ul className="space-y-2">
                {crew.map((c) => (
                  <li key={c.id} className="rounded-md border px-3 py-2 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{c.role || 'Crew'}</div>
                      <div className="text-xs text-gray-500">
                        {c.accepted_at ? 'Accepted' : c.declined_at ? 'Declined' : 'Pending'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{c.crew_user_id}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h3>
            <p className="card-description">Special instructions</p>
          </div>
          <div className="card-content">
            <div className="rounded-md border bg-white p-3 text-sm text-gray-800 min-h-[64px]">
              {inst?.notes?.trim() ? inst.notes : <span className="text-gray-400">No notes.</span>}
            </div>
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
          <p className="card-description">Order items scoped to this installation</p>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{it.order_item_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.room_tag ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.special_instructions ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                    No installation items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {query.isLoading && <div className="px-4 py-6 text-sm text-gray-500">Loading installation…</div>}
          {query.isError && <div className="px-4 py-6 text-sm text-red-600">Failed to load installation.</div>}
        </div>
      </div>
    </div>
  );
}
