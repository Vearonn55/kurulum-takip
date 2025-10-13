// src/pages/manager/CalendarPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  MapPin,
  Plus,
} from 'lucide-react';

import type { Installation, Store } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

// ---------- small date helpers ----------
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toISODate = (d: Date) => d.toISOString().split('T')[0];
const fmt = (d: Date, o?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(undefined, o).format(d);
// ----------------------------------------

const statusClass = (s: Installation['status']) => {
  switch (s) {
    case 'pending':
    case 'staged':
      return 'bg-gray-200 text-gray-800 border-gray-300';
    case 'accepted':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-200 text-gray-800 border-gray-300';
  }
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [anchor, setAnchor] = useState(startOfWeek(new Date()));
  const [storeId, setStoreId] = useState(
    user?.role === 'STORE_MANAGER' && user.store_id ? user.store_id : ''
  );

  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await apiClient.getStores();
      return res.data as Store[];
    },
    enabled: user?.role !== 'CREW',
  });

  const installsQuery = useQuery({
    queryKey: ['installations', { storeId, weekStart, weekEnd }],
    queryFn: async () => {
      const res = await apiClient.getInstallations({
        store_id: storeId || user?.store_id || undefined,
        from: toISODate(weekStart),
        to: toISODate(weekEnd),
      });
      return res.data as Installation[];
    },
    enabled: true,
  });

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const hours = Array.from({ length: 13 }, (_, i) => 7 + i);

  const installationsByDay = useMemo(() => {
    const map = new Map<string, Installation[]>();
    for (const d of days) map.set(toISODate(d), []);
    for (const inst of installsQuery.data ?? []) {
      const key = toISODate(new Date(inst.scheduled_start));
      map.set(key, [...(map.get(key) ?? []), inst]);
    }
    for (const k of map.keys())
      map.get(k)!.sort(
        (a, b) => +new Date(a.scheduled_start) - +new Date(b.scheduled_start)
      );
    return map;
  }, [days, installsQuery.data]);

  const goPrevWeek = () => setAnchor(addDays(anchor, -7));
  const goNextWeek = () => setAnchor(addDays(anchor, 7));
  const goToday = () => setAnchor(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Plan and track installations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <CalendarIcon className="h-4 w-4" />
            Today
          </button>
          <div className="inline-flex rounded-md shadow-sm isolate">
            <button
              onClick={goPrevWeek}
              className="rounded-l-md border px-2 py-2 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNextWeek}
              className="rounded-r-md border-t border-b border-r px-2 py-2 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {user?.role !== 'CREW' && (
            <select
              className="rounded-md border px-3 py-2 text-sm"
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
          )}

          <button
            onClick={() => installsQuery.refetch()}
            className="ml-2 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            disabled={installsQuery.isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', installsQuery.isFetching && 'animate-spin')} />
            Refresh
          </button>

          <button
            onClick={() => navigate('/app/installations/new')}
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New Installation
          </button>
        </div>
      </div>

      {/* Week label */}
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {fmt(weekStart, { month: 'long', day: 'numeric' })} –{' '}
          {fmt(weekEnd, { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[960px]">
          <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
            <div className="bg-gray-50 p-2 text-xs font-medium text-gray-500 border-b border-r">
              Time
            </div>
            {days.map((d) => {
              const isToday = toISODate(d) === toISODate(new Date());
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'p-2 text-xs font-medium border-b border-r',
                    isToday
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-gray-50 text-gray-600'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{fmt(d, { weekday: 'short' })}</span>
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        isToday ? 'bg-primary-600 text-white' : 'bg-white border'
                      )}
                    >
                      {fmt(d, { day: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hours.map((h) => (
            <div key={h} className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
              <div className="border-r p-2 text-xs text-gray-500 bg-white border-b">
                {String(h).padStart(2, '0')}:00
              </div>
              {days.map((d) => {
                const dayKey = toISODate(d);
                const items = installationsByDay.get(dayKey) ?? [];
                const itemsForHour = items.filter(
                  (inst) => new Date(inst.scheduled_start).getHours() === h
                );
                return (
                  <div
                    key={`${dayKey}-${h}`}
                    className={cn(
                      'relative border-b border-r bg-white hover:bg-gray-50 transition-colors'
                    )}
                    style={{ minHeight: 56 }}
                  >
                    {itemsForHour.map((inst) => {
                      const st = new Date(inst.scheduled_start);
                      const en = new Date(inst.scheduled_end);
                      const durHours = Math.max(1, Math.ceil((+en - +st) / 3600000));
                      return (
                        <button
                          key={inst.id}
                          onClick={() => navigate(`/app/installations/${inst.id}`)}
                          className={cn(
                            'absolute left-1 right-1 top-1 rounded-md border px-2 py-1 text-xs text-left shadow-sm',
                            statusClass(inst.status)
                          )}
                          style={{ height: 52 * durHours - 8 }}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {fmt(st, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] opacity-70">
                              → {fmt(en, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 opacity-70" />
                            <span className="truncate">
                              #{inst.order_id} &middot; {inst.status.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {installsQuery.isLoading && (
        <div className="text-sm text-gray-500">Loading installations…</div>
      )}
      {!installsQuery.isLoading && (installsQuery.data?.length ?? 0) === 0 && (
        <div className="text-sm text-gray-500">No installations for this week.</div>
      )}
      {installsQuery.isError && (
        <div className="text-sm text-red-600">Failed to load installations.</div>
      )}
    </div>
  );
}
