// src/pages/manager/InstallationsPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { cn } from '../../lib/utils';
import {
  listInstallations,
  type Installation,
  type InstallStatus,
} from '../../api/installations';
import { listStores, type Store } from '../../api/stores';
import { useTranslation } from 'react-i18next';

/* -------------------------------- Types -------------------------------- */
// UI status (we map backend → UI)
type InstallationStatus =
  | 'pending'
  | 'staged'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

// "Zone" here is effectively city name coming from store.address.city
type Zone = string;

type Row = {
  id: string;
  status: InstallationStatus;
  start: string | null;
  end: string | null;
  externalOrderId: string;
  storeName: string;
  city?: string;
  addressLine?: string;
  crewCount: number;
};

/* ----------------------------- Helpers ---------------------------- */
function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ymdFromIso(iso: string) {
  return iso.split('T')[0] ?? '';
}

function fmt(dtIso: string | null) {
  if (!dtIso) return '—';
  const d = new Date(dtIso);
  return d.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapBackendStatusToUi(status: InstallStatus | string): InstallationStatus {
  switch (status) {
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    case 'canceled':
      return 'cancelled';
    // backend has "scheduled"; UI shows that as "Pending"
    case 'scheduled':
    default:
      return 'pending';
  }
}

function makeRow(inst: Installation, store?: Store): Row {
  const uiStatus = mapBackendStatusToUi(inst.status);
  const addr = store?.address;

  return {
    id: inst.id,
    status: uiStatus,
    start: inst.scheduled_start ?? null,
    end: inst.scheduled_end ?? null,
    externalOrderId: inst.external_order_id,
    storeName: store?.name ?? inst.store_id,
    city: addr?.city,
    addressLine: addr?.line1,
    // if backend later embeds crew array, we’ll pick it up here
    crewCount: Array.isArray(inst.crew) ? inst.crew.length : 0,
  };
}

/* --------------------------------- Page -------------------------------- */
export default function InstallationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // Filters
  // Force-open date picker (Chrome / Edge / Safari)
  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement;
    if (typeof (input as any).showPicker === 'function') {
      (input as any).showPicker();
    }
  };

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<InstallationStatus | 'all'>('all');
  const [zone, setZone] = useState<Zone | 'all'>('all');
  const [from, setFrom] = useState<string>(ymd());
  const [to, setTo] = useState<string>(ymd());

  // Sort & pagination
  const [sortBy, setSortBy] = useState<'start' | 'customer' | 'zone' | 'status'>('start');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Fetch installations (we use a reasonable limit and filter locally by date/search)
  const installationsQuery = useQuery({
    queryKey: ['installations'],
    queryFn: async () => {
      // listInstallations returns InstallationList { data, limit, offset }
      const res = await listInstallations({ limit: 200, offset: 0 });
      return res;
    },
  });

  // Fetch stores (for name + address.city)
  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await listStores({ limit: 200, offset: 0 });
      return res;
    },
  });

  const storesById = useMemo(() => {
    const m = new Map<string, Store>();
    (storesQuery.data?.data ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [storesQuery.data]);

  // Build row objects from API data
  const allRows: Row[] = useMemo(() => {
    const insts: Installation[] = installationsQuery.data?.data ?? [];
    return insts.map((inst) => makeRow(inst, storesById.get(inst.store_id)));
  }, [installationsQuery.data, storesById]);

  // Zone options from store.address.city
  const zoneOptions: Zone[] = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRows) {
      if (r.city) set.add(r.city);
    }
    return Array.from(set).sort();
  }, [allRows]);

  const filtered = useMemo(() => {
    let list = allRows.slice();

    // Date filter (by scheduled_start)
    if (from) {
      list = list.filter((r) => !r.start || ymdFromIso(r.start) >= from);
    }
    if (to) {
      list = list.filter((r) => !r.start || ymdFromIso(r.start) <= to);
    }

    // Search text
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((r) => {
        return (
          r.id.toLowerCase().includes(s) ||
          r.externalOrderId.toLowerCase().includes(s) ||
          r.storeName.toLowerCase().includes(s) ||
          (r.addressLine ?? '').toLowerCase().includes(s) ||
          (r.city ?? '').toLowerCase().includes(s)
        );
      });
    }

    // Status filter
    if (status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    // Zone filter (by city)
    if (zone !== 'all') {
      list = list.filter((r) => r.city === zone);
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'start': {
          const as = a.start ?? '';
          const bs = b.start ?? '';
          return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
        }
        case 'customer': {
          const an = a.storeName;
          const bn = b.storeName;
          return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an);
        }
        case 'zone': {
          const az = a.city ?? '';
          const bz = b.city ?? '';
          return sortDir === 'asc' ? az.localeCompare(bz) : bz.localeCompare(az);
        }
        case 'status': {
          return sortDir === 'asc'
            ? statusRank(a.status) - statusRank(b.status)
            : statusRank(b.status) - statusRank(a.status);
        }
      }
    });

    return list;
  }, [allRows, q, status, zone, sortBy, sortDir, from, to]);

  const counts = useMemo(() => {
    const c: Record<InstallationStatus | 'all', number> = {
      all: allRows.length,
      pending: allRows.filter((r) => r.status === 'pending').length,
      staged: allRows.filter((r) => r.status === 'staged').length,
      in_progress: allRows.filter((r) => r.status === 'in_progress').length,
      completed: allRows.filter((r) => r.status === 'completed').length,
      failed: allRows.filter((r) => r.status === 'failed').length,
      cancelled: allRows.filter((r) => r.status === 'cancelled').length,
    };
    return c;
  }, [allRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (k: typeof sortBy) => {
    if (sortBy === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(k);
      setSortDir('asc');
    }
  };

  const goDetail = (id: string) => navigate(`/app/installations/${id}`);
  const goCreate = () => navigate('/app/installations/new');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('installationsPage.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('installationsPage.subtitle')}
          </p>
        </div>
        <button
          onClick={goCreate}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('installationsPage.createButton')}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-600">
            {t('installationsPage.filters.searchLabel')}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder={t('installationsPage.filters.searchPlaceholder')}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            {t('installationsPage.filters.statusLabel')}
          </label>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select
              className="input w-full pl-8"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">
                {t('installationsPage.filters.status.all')}
              </option>
              <option value="pending">
                {t('installationsPage.filters.status.pending')}
              </option>
              <option value="staged">
                {t('installationsPage.filters.status.staged')}
              </option>
              <option value="in_progress">
                {t('installationsPage.filters.status.in_progress')}
              </option>
              <option value="completed">
                {t('installationsPage.filters.status.completed')}
              </option>
              <option value="failed">
                {t('installationsPage.filters.status.failed')}
              </option>
              <option value="cancelled">
                {t('installationsPage.filters.status.cancelled')}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            {t('installationsPage.filters.zoneLabel')}
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select
              className="input w-full pl-8"
              value={zone}
              onChange={(e) => {
                setZone(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">
                {t('installationsPage.filters.allZones')}
              </option>
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              {t('installationsPage.filters.from')}
            </label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="input w-full pl-8"
                value={from}
                onClick={handleDateClick}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              {t('installationsPage.filters.to')}
            </label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="input w-full pl-8"
                value={to}
                onClick={handleDateClick}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex flex-wrap gap-2">
        <QuickChip
          label={t('installationsPage.chips.all')}
          value={counts.all}
          active={status === 'all'}
          onClick={() => {
            setStatus('all');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.pending')}
          value={counts.pending}
          tone="gray"
          icon={<Clock className="h-3.5 w-3.5" />}
          active={status === 'pending'}
          onClick={() => {
            setStatus('pending');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.staged')}
          value={counts.staged}
          tone="blue"
          icon={<Wrench className="h-3.5 w-3.5" />}
          active={status === 'staged'}
          onClick={() => {
            setStatus('staged');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.in_progress')}
          value={counts.in_progress}
          tone="amber"
          icon={<Clock className="h-3.5 w-3.5" />}
          active={status === 'in_progress'}
          onClick={() => {
            setStatus('in_progress');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.completed')}
          value={counts.completed}
          tone="emerald"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          active={status === 'completed'}
          onClick={() => {
            setStatus('completed');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.failed')}
          value={counts.failed}
          tone="rose"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          active={status === 'failed'}
          onClick={() => {
            setStatus('failed');
            setPage(1);
          }}
        />
        <QuickChip
          label={t('installationsPage.chips.cancelled')}
          value={counts.cancelled}
          tone="zinc"
          icon={<XCircle className="h-3.5 w-3.5" />}
          active={status === 'cancelled'}
          onClick={() => {
            setStatus('cancelled');
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <Th
                label={t('installationsPage.table.start')}
                active={sortBy === 'start'}
                dir={sortDir}
                onClick={() => toggleSort('start')}
              />
              <th className="px-3 py-2 text-left">
                {t('installationsPage.table.installation')}
              </th>
              <Th
                label={t('installationsPage.table.store')}
                active={sortBy === 'customer'}
                dir={sortDir}
                onClick={() => toggleSort('customer')}
              />
              <Th
                label={t('installationsPage.table.zone')}
                active={sortBy === 'zone'}
                dir={sortDir}
                onClick={() => toggleSort('zone')}
              />
              <Th
                label={t('installationsPage.table.status')}
                active={sortBy === 'status'}
                dir={sortDir}
                onClick={() => toggleSort('status')}
              />
              <th className="w-28 px-3 py-2 text-left">
                {t('installationsPage.table.crew')}
              </th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {installationsQuery.isLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  {t('installationsPage.loading')}
                </td>
              </tr>
            ) : installationsQuery.isError ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-red-600">
                  {t('installationsPage.loadError')}
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  {t('installationsPage.noResults')}
                </td>
              </tr>
            ) : (
              paged.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {fmt(r.start)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">
                      {r.externalOrderId || r.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('installationsPage.table.idPrefix')} {r.id}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{r.storeName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[220px]">
                      {r.addressLine || r.city || '—'}
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.city ?? '—'}</td>
                  <td className="px-3 py-2">
                    <StatusPill
                      status={r.status}
                      labelOverride={t(
                        `installationsPage.statusLabels.${r.status}`
                      )}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {r.crewCount > 0 ? (
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[11px] text-gray-700">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        {r.crewCount}{' '}
                        {t('installationsPage.crew.assigned')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => goDetail(r.id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      {t('installationsPage.actions.view')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-top p-3 text-sm border-t">
          <div className="text-gray-600">
            {t('installationsPage.pagination.showing')}{' '}
            <span className="font-medium text-gray-900">{paged.length}</span>{' '}
            {t('installationsPage.pagination.of')}{' '}
            <span className="font-medium text-gray-900">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                'rounded-md border px-3 py-1.5',
                page === 1 ? 'opacity-50' : 'hover:bg-gray-50'
              )}
            >
              {t('installationsPage.pagination.prev')}
            </button>
            <div>
              {t('installationsPage.pagination.page')}{' '}
              <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-md border px-3 py-1.5',
                page === totalPages ? 'opacity-50' : 'hover:bg-gray-50'
              )}
            >
              {t('installationsPage.pagination.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Bits -------------------------------- */
function statusRank(s: InstallationStatus) {
  const order: InstallationStatus[] = [
    'pending',
    'staged',
    'in_progress',
    'completed',
    'failed',
    'cancelled',
  ];
  return order.indexOf(s);
}

function StatusPill({
  status,
  labelOverride,
}: {
  status: InstallationStatus;
  labelOverride?: string;
}) {
  const cfg: Record<
    InstallationStatus,
    { tone: string; Icon: any; label: string }
  > = {
    pending: {
      tone: 'border-gray-200 bg-gray-50 text-gray-700',
      Icon: Clock,
      label: 'Pending',
    },
    staged: {
      tone: 'border-blue-200 bg-blue-50 text-blue-700',
      Icon: Wrench,
      label: 'Staged',
    },
    in_progress: {
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
      Icon: Clock,
      label: 'In progress',
    },
    completed: {
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      Icon: CheckCircle2,
      label: 'Completed',
    },
    failed: {
      tone: 'border-rose-200 bg-rose-50 text-rose-700',
      Icon: AlertTriangle,
      label: 'Failed',
    },
    cancelled: {
      tone: 'border-zinc-200 bg-zinc-50 text-zinc-700',
      Icon: XCircle,
      label: 'Cancelled',
    },
  };
  const { tone, Icon, label } = cfg[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
        tone
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {labelOverride ?? label}
    </span>
  );
}

function Th({
  label,
  onClick,
  active,
  dir,
  className,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: 'asc' | 'desc';
  className?: string;
}) {
  const { t } = useTranslation('common');
  return (
    <th className={cn('px-3 py-2 text-left font-semibold text-gray-700', className)}>
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100',
          active && 'text-primary-700'
        )}
        title={t('installationsPage.sort')}
      >
        {label}{' '}
        <ArrowUpDown
          className={cn(
            'h-3.5 w-3.5',
            active && dir === 'asc' && 'rotate-180'
          )}
        />
      </button>
    </th>
  );
}

function QuickChip({
  label,
  value,
  active,
  onClick,
  icon,
  tone = 'gray',
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  tone?: 'gray' | 'blue' | 'sky' | 'amber' | 'emerald' | 'rose' | 'zinc';
}) {
  const tones: Record<string, string> = {
    gray: 'border-gray-200 bg-white text-gray-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    zinc: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
        tones[tone],
        active && 'ring-2 ring-primary-200'
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-700">
        {value}
      </span>
    </button>
  );
}
