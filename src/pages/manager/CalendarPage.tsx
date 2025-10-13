// src/pages/manager/CalendarPage.tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  MapPin,
  Plus,
  LayoutGrid,
  Rows3,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Installation } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

/* =============== Date helpers =============== */
const MONDAY = 1;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  return startOfDay(x);
}
function endOfMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 0);
  return endOfDay(x);
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay() || 7; // Sunday -> 7
  const diff = day - MONDAY;
  x.setDate(x.getDate() - diff);
  return x;
}
function endOfWeek(d: Date) {
  const x = startOfWeek(d);
  x.setDate(x.getDate() + 6);
  return endOfDay(x);
}
function addWeeks(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n * 7);
  return x;
}
function eachDayGrid(monthDate: Date) {
  // 6 rows * 7 cols = 42
  const start = startOfMonth(monthDate);
  const startWeekday = (start.getDay() + 6) % 7; // Monday=0
  const first = new Date(start);
  first.setDate(first.getDate() - startWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    days.push(d);
  }
  return days;
}
function eachDayOfWeek(weekAnchor: Date) {
  const begin = startOfWeek(weekAnchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(begin);
    d.setDate(begin.getDate() + i);
    return d;
  });
}
function fmtYYYYMMDD(d: Date) {
  return d.toISOString().split('T')[0];
}
function toLocalHM(iso?: string) {
  if (!iso) return '';
  const dt = new Date(iso);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* =============== Week layout constants =============== */
const DAY_START = 8;      // 08:00
const DAY_END = 20;       // 20:00 (exclusive)
const HOUR_HEIGHT = 56;   // px per hour
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);
const COLUMN_HEIGHT = (DAY_END - DAY_START) * HOUR_HEIGHT;

/* =============== Dev mocks =============== */
function devMockInstallationsMonth(anchorMonth: Date): Installation[] {
  const ms = startOfMonth(anchorMonth);
  const block = (offset: number, sh = 9, eh = 12) => {
    const s = new Date(ms);
    s.setDate(ms.getDate() + offset);
    s.setHours(sh, 0, 0, 0);
    const e = new Date(ms);
    e.setDate(ms.getDate() + offset);
    e.setHours(eh, 0, 0, 0);
    return { s: s.toISOString(), e: e.toISOString() };
  };
  const nowISO = new Date().toISOString();
  const a = block(3, 9, 12);
  const b = block(8, 13, 15);
  const c = block(14, 10, 12);
  return [
    { id: 'mock_green',  order_id: 'ORD-MOCK-001', store_id: 'store_1', scheduled_start: a.s, scheduled_end: a.e, status: 'completed', capacity_slot_id: undefined, notes: 'Mock completed job (green)', created_at: nowISO, updated_at: nowISO },
    { id: 'mock_yellow', order_id: 'ORD-MOCK-002', store_id: 'store_2', scheduled_start: b.s, scheduled_end: b.e, status: 'accepted',  capacity_slot_id: undefined, notes: 'Mock accepted job (yellow)',  created_at: nowISO, updated_at: nowISO },
    { id: 'mock_red',    order_id: 'ORD-MOCK-003', store_id: 'store_3', scheduled_start: c.s, scheduled_end: c.e, status: 'failed',    capacity_slot_id: undefined, notes: 'Mock failed job (red)',      created_at: nowISO, updated_at: nowISO },
  ];
}
function devMockInstallationsWeek(weekAnchor: Date): Installation[] {
  const ws = startOfWeek(weekAnchor);
  const slot = (dowOffset: number, sh: number, eh: number, id: string, status: Installation['status'], order: string) => {
    const s = new Date(ws);
    s.setDate(ws.getDate() + dowOffset);
    s.setHours(sh, 0, 0, 0);
    const e = new Date(ws);
    e.setDate(ws.getDate() + dowOffset);
    e.setHours(eh, 0, 0, 0);
    const nowISO = new Date().toISOString();
    return {
      id,
      order_id: order,
      store_id: 'store_1',
      scheduled_start: s.toISOString(),
      scheduled_end: e.toISOString(),
      status,
      capacity_slot_id: undefined,
      notes: 'Mock (week)',
      created_at: nowISO,
      updated_at: nowISO,
    } as Installation;
  };
  // Mon / Thu / Sat
  return [
    slot(0, 9, 12, 'w_mock_green', 'completed', 'ORD-W-001'),
    slot(3, 13, 15, 'w_mock_yellow', 'accepted', 'ORD-W-002'),
    slot(5, 10, 12, 'w_mock_red', 'failed', 'ORD-W-003'),
  ];
}

/* =============== Status color classes =============== */
function statusClasses(s: Installation['status']) {
  switch (s) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'accepted':
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'staged':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/* =============== Component =============== */
type ViewMode = 'month' | 'week';

export default function CalendarPage() {
  const { user } = useAuthStore();

  const [mode, setMode] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));

  // Visible ranges
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const weekStart = startOfWeek(cursor);
  const weekEnd = endOfWeek(cursor);

  const from = mode === 'month' ? fmtYYYYMMDD(monthStart) : fmtYYYYMMDD(weekStart);
  const to = mode === 'month' ? fmtYYYYMMDD(monthEnd) : fmtYYYYMMDD(weekEnd);

  const storeFilter = user?.role === 'STORE_MANAGER' && user.store_id ? user.store_id : undefined;

  // Fetch installs for visible range
  const query = useQuery({
    queryKey: ['installations', { mode, store_id: storeFilter, from, to }],
    queryFn: async () => {
      const res = await apiClient.getInstallations({
        store_id: storeFilter,
        from,
        to,
      });
      return res.data as Installation[];
    },
  });

  // Merge dev mocks
  const merged = useMemo(() => {
    const base = query.data ?? [];
    if (!import.meta.env.DEV) return base;
    return mode === 'month'
      ? [...base, ...devMockInstallationsMonth(cursor)]
      : [...base, ...devMockInstallationsWeek(cursor)];
  }, [query.data, mode, cursor]);

  /* ---- Monthly prep ---- */
  const monthDays = useMemo(() => eachDayGrid(cursor), [cursor]);
  const monthLabel = useMemo(
    () => monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [monthStart]
  );
  const todayStr = fmtYYYYMMDD(new Date());
  const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

  const byDayMonth = useMemo(() => {
    const m = new Map<string, Installation[]>();
    for (const inst of merged) {
      if (!inst.scheduled_start) continue;
      const key = inst.scheduled_start.slice(0, 10);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(inst);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => (a.scheduled_start || '').localeCompare(b.scheduled_start || ''));
    }
    return m;
  }, [merged]);

  /* ---- Weekly prep ---- */
  const weekDays = useMemo(() => eachDayOfWeek(cursor), [cursor]);
  const weekLabel = `${fmtYYYYMMDD(weekStart)} – ${fmtYYYYMMDD(weekEnd)}`;

  const byDayWeek = useMemo(() => {
    const m = new Map<string, Installation[]>();
    for (const inst of merged) {
      if (!inst.scheduled_start) continue;
      const key = inst.scheduled_start.slice(0, 10);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(inst);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => (a.scheduled_start || '').localeCompare(b.scheduled_start || ''));
    }
    return m;
  }, [merged]);

  /* ---- Navigation ---- */
  const prevAction = () => setCursor((c) => (mode === 'month' ? addMonths(c, -1) : addWeeks(c, -1)));
  const nextAction = () => setCursor((c) => (mode === 'month' ? addMonths(c, +1) : addWeeks(c, +1)));
  const todayAction = () => setCursor(startOfMonth(new Date()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className="rounded-md border p-2 hover:bg-gray-50" onClick={prevAction} aria-label="Prev">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="rounded-md border p-2 hover:bg-gray-50" onClick={nextAction} aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="ml-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-gray-700" />
              {mode === 'month' ? monthLabel : 'Week View'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              {mode === 'month'
                ? `${fmtYYYYMMDD(monthStart)} – ${fmtYYYYMMDD(monthEnd)}`
                : weekLabel}
              {storeFilter && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" /> Store: {storeFilter}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border bg-white p-0.5">
            <button
              className={cn(
                'inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm',
                mode === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
              )}
              onClick={() => setMode('month')}
              title="Monthly"
            >
              <LayoutGrid className="h-4 w-4" /> Month
            </button>
            <button
              className={cn(
                'inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm',
                mode === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
              )}
              onClick={() => setMode('week')}
              title="Weekly"
            >
              <Rows3 className="h-4 w-4" /> Week
            </button>
          </div>

          <button
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            disabled={query.isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={todayAction}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            title="Jump to this month"
          >
            <Clock className="h-4 w-4" />
            Today
          </button>
          <Link
            to="/app/installations/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Create Installation
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border bg-emerald-100 border-emerald-200" />
          Completed
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border bg-amber-100 border-amber-200" />
          Accepted / Pending
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border bg-red-100 border-red-200" />
          Failed / Cancelled
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border bg-blue-100 border-blue-200" />
          In Progress
        </span>
      </div>

      {/* ===== Month View ===== */}
      {mode === 'month' ? (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="grid grid-cols-7 border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-3 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((d, idx) => {
              const key = fmtYYYYMMDD(d);
              const isCurrentMonth = isSameMonth(d, monthStart);
              const events = byDayMonth.get(key) ?? [];
              const isToday = key === todayStr;

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[120px] border-b border-r p-2 align-top',
                    (idx + 1) % 7 === 0 && 'border-r-0',
                    !isCurrentMonth && 'bg-gray-50'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday ? 'bg-primary-600 text-white' : 'text-gray-700'
                      )}
                      title={key}
                    >
                      {d.getDate()}
                    </span>
                    <span className="text-[10px] text-gray-400">{key}</span>
                  </div>

                  <div className="space-y-1">
                    {events.slice(0, 3).map((ev) => (
                      <Link
                        to={`/app/installations/${ev.id}`}
                        key={ev.id}
                        className={cn(
                          'block truncate rounded border px-2 py-1 text-[11px] font-medium hover:opacity-90',
                          statusClasses(ev.status)
                        )}
                        title={`#${ev.id} • ${ev.order_id}`}
                      >
                        #{ev.id} • {ev.order_id}
                      </Link>
                    ))}
                    {events.length > 3 && (
                      <div className="text-[11px] text-gray-500">+{events.length - 3} more…</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {query.isLoading && (
            <div className="px-4 py-6 text-sm text-gray-500">Loading installations…</div>
          )}
          {query.isError && (
            <div className="px-4 py-6 text-sm text-red-600">Failed to load installations.</div>
          )}
          {!query.isLoading && (merged?.length ?? 0) === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No installations in this month.</div>
          )}
        </div>
      ) : (
        /* ===== Week View ===== */
        <div className="overflow-hidden rounded-lg border bg-white">
          {/* Week header */}
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b bg-gray-50">
            <div className="px-2 py-2 text-xs font-medium uppercase text-gray-500">Time</div>
            {weekDays.map((d) => {
              const isToday = fmtYYYYMMDD(d) === todayStr;
              return (
                <div key={d.toISOString()} className="px-2 py-2 text-xs font-medium uppercase text-gray-500">
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 rounded px-2 py-1',
                      isToday && 'bg-primary-100 text-primary-800'
                    )}
                  >
                    {d.toLocaleDateString(undefined, { weekday: 'short' })}{' '}
                    <span className="text-gray-500">{d.getDate()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid: left time ruler + 7 day columns */}
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))]">
            {/* Left time ruler */}
            <div className="relative border-r" style={{ height: COLUMN_HEIGHT }}>
              {HOURS.slice(0, -1).map((h, i) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{ top: i * HOUR_HEIGHT }}
                />
              ))}
              {HOURS.map((h, i) => (
                <div
                  key={`label-${h}`}
                  className="absolute -translate-y-2 right-2 text-[11px] text-gray-500"
                  style={{ top: i * HOUR_HEIGHT }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const key = fmtYYYYMMDD(day);
              const events = byDayWeek.get(key) ?? [];

              return (
                <div
                  key={key}
                  className="relative border-r last:border-r-0 bg-white"
                  style={{ height: COLUMN_HEIGHT }}
                >
                  {/* Hour lines */}
                  {HOURS.slice(0, -1).map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-b border-gray-100"
                      style={{ top: i * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Events */}
                  {events.map((ev) => {
                    const s = new Date(ev.scheduled_start || day);
                    const e = new Date(ev.scheduled_end || s);

                    // decimal hours
                    const sh = s.getHours() + s.getMinutes() / 60;
                    const eh = e.getHours() + e.getMinutes() / 60;

                    // clamp to visible range
                    const startClamped = Math.max(DAY_START, Math.min(sh, DAY_END));
                    const endClamped = Math.max(DAY_START, Math.min(eh, DAY_END));
                    const duration = Math.max(0.25, endClamped - startClamped); // >= 15 min

                    const top = (startClamped - DAY_START) * HOUR_HEIGHT;
                    const height = Math.max(28, duration * HOUR_HEIGHT);

                    return (
                      <Link
                        to={`/app/installations/${ev.id}`}
                        key={ev.id}
                        className={cn(
                          'absolute left-1 right-1 rounded border px-2 py-1 text-[11px] font-medium shadow-sm hover:opacity-90',
                          'overflow-hidden transition-opacity',
                          statusClasses(ev.status)
                        )}
                        style={{ top, height }}
                        title={`#${ev.id} • ${ev.order_id} • ${toLocalHM(ev.scheduled_start)}–${toLocalHM(ev.scheduled_end)}`}
                      >
                        <div className="truncate">#{ev.id} • {ev.order_id}</div>
                        <div className="opacity-70 text-[10px]">
                          {toLocalHM(ev.scheduled_start)}–{toLocalHM(ev.scheduled_end)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {query.isLoading && (
            <div className="px-4 py-6 text-sm text-gray-500">Loading installations…</div>
          )}
          {query.isError && (
            <div className="px-4 py-6 text-sm text-red-600">Failed to load installations.</div>
          )}
          {!query.isLoading && (merged?.length ?? 0) === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No installations in this week.</div>
          )}
        </div>
      )}
    </div>
  );
}
