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
import { cn } from '../../lib/utils';

/* -------------------------------- Types -------------------------------- */
type InstallationStatus =
  | 'pending'
  | 'staged'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

type Zone = 'Nicosia' | 'Famagusta' | 'Kyrenia' | 'Morphou' | 'Iskele';

type MockInstallation = {
  id: string;
  order_id: string;
  customer: string;
  zone: Zone;
  status: InstallationStatus;
  start: string; // ISO
  end: string;   // ISO
  address: string;
  crew: string[]; // names
};

/* ----------------------------- Mock helpers ---------------------------- */
function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function at(d: Date, h: number, m = 0) {
  const n = new Date(d);
  n.setHours(h, m, 0, 0);
  return n.toISOString();
}
function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return d.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------- Mock data ------------------------------ */
function makeMock(dayISO: string): MockInstallation[] {
  const day = new Date(dayISO);
  return [
    {
      id: 'INST-20001',
      order_id: 'ORD-10001',
      customer: 'Ali Demir',
      zone: 'Nicosia',
      status: 'completed',
      start: at(day, 9, 0),
      end: at(day, 11, 0),
      address: 'Atatürk Cad. 18, Nicosia',
      crew: ['Team A'],
    },
    {
      id: 'INST-20002',
      order_id: 'ORD-10002',
      customer: 'Selin Kaya',
      zone: 'Famagusta',
      status: 'in_progress',
      start: at(day, 11, 30),
      end: at(day, 13, 0),
      address: 'Ece Sk. 12, Famagusta',
      crew: ['Team B'],
    },
    {
      id: 'INST-20003',
      order_id: 'ORD-10004',
      customer: 'Mete Aydın',
      zone: 'Kyrenia',
      status: 'staged',
      start: at(day, 14, 0),
      end: at(day, 16, 0),
      address: 'Zeytinlik Mah., Kyrenia',
      crew: ['Team C'],
    },
    {
      id: 'INST-20004',
      order_id: 'ORD-10005',
      customer: 'Deniz Arslan',
      zone: 'Nicosia',
      status: 'pending',
      start: at(day, 16, 30),
      end: at(day, 18, 0),
      address: 'Dr. Fazıl Küçük Bul., Nicosia',
      crew: [],
    },
    {
      id: 'INST-20005',
      order_id: 'ORD-10006',
      customer: 'Bora Kar',
      zone: 'Morphou',
      status: 'failed',
      start: at(day, 10, 0),
      end: at(day, 12, 0),
      address: 'Şht. Sk. 5, Morphou',
      crew: ['Team A'],
    },
    {
      id: 'INST-20006',
      order_id: 'ORD-10007',
      customer: 'Ece Yıldız',
      zone: 'Iskele',
      status: 'cancelled',
      start: at(day, 9, 30),
      end: at(day, 10, 30),
      address: 'Sahil Yolu, Iskele',
      crew: [],
    },
    {
      id: 'INST-20007',
      order_id: 'ORD-10008',
      customer: 'Can Er',
      zone: 'Nicosia',
      status: 'staged',
      start: at(day, 12, 30),
      end: at(day, 14, 0),
      address: 'Girne Kapısı, Nicosia',
      crew: ['Team D'],
    },
  ];
}

/* --------------------------------- Page -------------------------------- */
export default function InstallationsPage() {
  const navigate = useNavigate();

  // Filters
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

  // Build a mock list for each day in range
  const data = useMemo(() => {
    const start = new Date(from);
    const end = new Date(to);
    const list: MockInstallation[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      list.push(...makeMock(ymd(d)));
    }
    return list;
  }, [from, to]);

  const filtered = useMemo(() => {
    let list = data.slice();

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.order_id.toLowerCase().includes(s) ||
          r.customer.toLowerCase().includes(s) ||
          r.address.toLowerCase().includes(s) ||
          r.crew.join(',').toLowerCase().includes(s)
      );
    }
    if (status !== 'all') list = list.filter((r) => r.status === status);
    if (zone !== 'all') list = list.filter((r) => r.zone === zone);

    list.sort((a, b) => {
      switch (sortBy) {
        case 'start':
          return sortDir === 'asc' ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start);
        case 'customer':
          return sortDir === 'asc' ? a.customer.localeCompare(b.customer) : b.customer.localeCompare(a.customer);
        case 'zone':
          return sortDir === 'asc' ? a.zone.localeCompare(b.zone) : b.zone.localeCompare(a.zone);
        case 'status':
          return sortDir === 'asc' ? statusRank(a.status) - statusRank(b.status) : statusRank(b.status) - statusRank(a.status);
      }
    });

    return list;
  }, [data, q, status, zone, sortBy, sortDir]);

  const counts = useMemo(() => {
    const c: Record<InstallationStatus | 'all', number> = {
      all: data.length,
      pending: data.filter((r) => r.status === 'pending').length,
      staged: data.filter((r) => r.status === 'staged').length,
      in_progress: data.filter((r) => r.status === 'in_progress').length,
      completed: data.filter((r) => r.status === 'completed').length,
      failed: data.filter((r) => r.status === 'failed').length,
      cancelled: data.filter((r) => r.status === 'cancelled').length,
    };
    return c;
  }, [data]);

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
          <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
          <p className="mt-1 text-sm text-gray-500">Schedule status and progress for upcoming jobs.</p>
        </div>
        <button
          onClick={goCreate}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create installation
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-600">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Installation ID, order ID, customer, address, crew…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Status</label>
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
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="staged">Staged</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Zone</label>
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
              <option value="all">All zones</option>
              {(['Nicosia', 'Famagusta', 'Kyrenia', 'Morphou', 'Iskele'] as Zone[]).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">From</label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input type="date" className="input w-full pl-8" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">To</label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input type="date" className="input w-full pl-8" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex flex-wrap gap-2">
        <QuickChip label="All" value={counts.all} active={status === 'all'} onClick={() => { setStatus('all'); setPage(1); }} />
        <QuickChip label="Pending" value={counts.pending} tone="gray" icon={<Clock className="h-3.5 w-3.5" />} active={status === 'pending'} onClick={() => { setStatus('pending'); setPage(1); }} />
        <QuickChip label="Staged" value={counts.staged} tone="blue" icon={<Wrench className="h-3.5 w-3.5" />} active={status === 'staged'} onClick={() => { setStatus('staged'); setPage(1); }} />
        <QuickChip label="In progress" value={counts.in_progress} tone="amber" icon={<Clock className="h-3.5 w-3.5" />} active={status === 'in_progress'} onClick={() => { setStatus('in_progress'); setPage(1); }} />
        <QuickChip label="Completed" value={counts.completed} tone="emerald" icon={<CheckCircle2 className="h-3.5 w-3.5" />} active={status === 'completed'} onClick={() => { setStatus('completed'); setPage(1); }} />
        <QuickChip label="Failed" value={counts.failed} tone="rose" icon={<AlertTriangle className="h-3.5 w-3.5" />} active={status === 'failed'} onClick={() => { setStatus('failed'); setPage(1); }} />
        <QuickChip label="Cancelled" value={counts.cancelled} tone="zinc" icon={<XCircle className="h-3.5 w-3.5" />} active={status === 'cancelled'} onClick={() => { setStatus('cancelled'); setPage(1); }} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <Th label="Start" active={sortBy === 'start'} dir={sortDir} onClick={() => toggleSort('start')} />
              <th className="px-3 py-2 text-left">Installation</th>
              <Th label="Customer" active={sortBy === 'customer'} dir={sortDir} onClick={() => toggleSort('customer')} />
              <Th label="Zone" active={sortBy === 'zone'} dir={sortDir} onClick={() => toggleSort('zone')} />
              <Th label="Status" active={sortBy === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
              <th className="w-28 px-3 py-2 text-left">Crew</th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">No installations match the filters.</td>
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
                    <div className="font-medium text-gray-900">{r.id}</div>
                    <div className="text-xs text-gray-500">{r.order_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{r.customer}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[220px]">{r.address}</div>
                  </td>
                  <td className="px-3 py-2">{r.zone}</td>
                  <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                  <td className="px-3 py-2">
                    {r.crew.length > 0 ? (
                      <span className="inline-flex items-center rounded border px-2 py-0.5 text-[11px] text-gray-700">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        {r.crew.join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => goDetail(r.id)} className="text-primary-600 hover:text-primary-800">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-top p-3 text-sm border-t">
          <div className="text-gray-600">
            Showing <span className="font-medium text-gray-900">{paged.length}</span> of{' '}
            <span className="font-medium text-gray-900">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn('rounded-md border px-3 py-1.5', page === 1 ? 'opacity-50' : 'hover:bg-gray-50')}
            >
              Prev
            </button>
            <div>
              Page <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn('rounded-md border px-3 py-1.5', page === totalPages ? 'opacity-50' : 'hover:bg-gray-50')}
            >
              Next
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

function StatusPill({ status }: { status: InstallationStatus }) {
  const cfg: Record<InstallationStatus, { tone: string; Icon: any; label: string }> = {
    pending:    { tone: 'border-gray-200 bg-gray-50 text-gray-700', Icon: Clock, label: 'Pending' },
    staged:     { tone: 'border-blue-200 bg-blue-50 text-blue-700', Icon: Wrench, label: 'Staged' },
    in_progress:{ tone: 'border-amber-200 bg-amber-50 text-amber-700', Icon: Clock, label: 'In progress' },
    completed:  { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', Icon: CheckCircle2, label: 'Completed' },
    failed:     { tone: 'border-rose-200 bg-rose-50 text-rose-700', Icon: AlertTriangle, label: 'Failed' },
    cancelled:  { tone: 'border-zinc-200 bg-zinc-50 text-zinc-700', Icon: XCircle, label: 'Cancelled' },
  };
  const { tone, Icon, label } = cfg[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]', tone)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
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
  return (
    <th className={cn('px-3 py-2 text-left font-semibold text-gray-700', className)}>
      <button
        onClick={onClick}
        className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100', active && 'text-primary-700')}
        title="Sort"
      >
        {label} <ArrowUpDown className={cn('h-3.5 w-3.5', active && dir === 'asc' && 'rotate-180')} />
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
      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-700">{value}</span>
    </button>
  );
}
