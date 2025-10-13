// src/pages/warehouse/PickListsPage.tsx
import { useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Truck,
  CheckCircle2,
  Layers,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type PickListStatus = 'scheduled' | 'staged' | 'loaded' | 'completed';

interface PickList {
  id: string;
  date: string; // YYYY-MM-DD
  warehouse: string;
  status: PickListStatus;
  installation_count: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

const TABS: { key: PickListStatus | 'all'; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: ClipboardList },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar },
  { key: 'staged', label: 'Staged', icon: Layers },
  { key: 'loaded', label: 'Loaded', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const PAGE_SIZE = 10;

/* -------------------- STATIC MOCKS ONLY -------------------- */
function buildMocks(): PickList[] {
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const now = new Date();
  const iso = now.toISOString();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const day2 = new Date(now);
  day2.setDate(now.getDate() + 2);

  return [
    {
      id: 'PL-MOCK-001',
      date: fmt(tomorrow),
      warehouse: 'WH_Nicosia',
      status: 'scheduled',
      installation_count: 3,
      item_count: 24,
      created_at: iso,
      updated_at: iso,
    },
    {
      id: 'PL-MOCK-002',
      date: fmt(tomorrow),
      warehouse: 'WH_Famagusta',
      status: 'staged',
      installation_count: 2,
      item_count: 18,
      created_at: iso,
      updated_at: iso,
    },
    {
      id: 'PL-MOCK-003',
      date: fmt(day2),
      warehouse: 'WH_Kyrenia',
      status: 'loaded',
      installation_count: 4,
      item_count: 55,
      created_at: iso,
      updated_at: iso,
    },
  ];
}

function statusBadgeClass(s: PickListStatus) {
  switch (s) {
    case 'scheduled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'staged':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'loaded':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function PickListsPage() {
  const [tab, setTab] = useState<PickListStatus | 'all'>('all');
  const [q, setQ] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [page, setPage] = useState(1);

  // Static data only
  const data = useMemo(() => buildMocks(), []);

  const warehouses = useMemo(() => {
    const set = new Set(data.map((p) => p.warehouse));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    let l = data;

    if (tab !== 'all') l = l.filter((x) => x.status === tab);
    if (warehouse) l = l.filter((x) => x.warehouse === warehouse);
    if (q.trim()) {
      const s = q.toLowerCase().trim();
      l = l.filter(
        (x) =>
          x.id.toLowerCase().includes(s) ||
          x.warehouse.toLowerCase().includes(s) ||
          x.date.includes(s)
      );
    }

    // newest by date first
    return [...l].sort((a, b) => b.date.localeCompare(a.date));
  }, [data, tab, q, warehouse]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return filtered.slice(from, from + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pick Lists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mock view. Track progress from <b>Scheduled</b> → <b>Staged</b> → <b>Loaded</b> → <b>Completed</b>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // No API; just a visual refresh effect
              // eslint-disable-next-line no-console
              console.log('Mock refresh clicked');
            }}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            to="/app/picklists/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> New Pick List
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm',
              tab === t.key ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            )}
            onClick={() => {
              setPage(1);
              setTab(t.key as any);
            }}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input pl-8"
              placeholder="Search id, date, warehouse…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <select
            className="input"
            value={warehouse}
            onChange={(e) => {
              setPage(1);
              setWarehouse(e.target.value);
            }}
          >
            <option value="">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pick List</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Warehouse</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Installations</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paged.map((pl) => (
              <tr key={pl.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <Link to={`/app/picklists/${pl.id}`} className="hover:underline">
                    {pl.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{pl.date}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{pl.warehouse}</td>
                <td className="px-4 py-3 text-sm text-right">{pl.installation_count}</td>
                <td className="px-4 py-3 text-sm text-right">{pl.item_count}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      statusBadgeClass(pl.status)
                    )}
                  >
                    {pl.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link to={`/app/picklists/${pl.id}`} className="text-primary-600 hover:text-primary-800">
                    Open
                  </Link>
                </td>
              </tr>
            ))}

            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                  No pick lists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Page <span className="font-medium">{page}</span> / {totalPages}
        </div>
        <div className="inline-flex gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
