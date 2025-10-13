// src/pages/shared/AuditPage.tsx
import { useMemo, useState } from 'react';
import {
  RefreshCw,
  Search,
  Calendar,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Copy,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

/* -------------------- Local types & mocks (NO API) -------------------- */
type AuditLog = {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string;
  data: Record<string, any>;
  ip: string;
  ts: string; // ISO timestamp
};

type SortKey = 'ts' | 'actor' | 'entity' | 'action' | 'ip';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

function mockAudit(): AuditLog[] {
  const iso = (d: Date) => d.toISOString();

  const now = new Date();
  const t = (mins: number) => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() - mins);
    return d;
  };

  return [
    {
      id: 'aud_0008',
      actor_id: 'user_admin',
      action: 'USER_UPDATE',
      entity: 'User',
      entity_id: 'usr_774',
      data: { changes: { role: ['CREW', 'WAREHOUSE_MANAGER'] } },
      ip: '10.0.0.15',
      ts: iso(t(2)),
    },
    {
      id: 'aud_0007',
      actor_id: 'user_mgr',
      action: 'INSTALLATION_SCHEDULE',
      entity: 'Installation',
      entity_id: 'inst_3011',
      data: { scheduled_start: '2025-10-16T09:00:00Z', zone: 'Kyrenia' },
      ip: '10.0.0.42',
      ts: iso(t(7)),
    },
    {
      id: 'aud_0006',
      actor_id: 'user_wh',
      action: 'PICKLIST_STAGE',
      entity: 'PickList',
      entity_id: 'PL-0092',
      data: { status_before: 'scheduled', status_after: 'staged' },
      ip: '10.0.0.23',
      ts: iso(t(14)),
    },
    {
      id: 'aud_0005',
      actor_id: 'user_admin',
      action: 'WEBHOOK_DELIVERED',
      entity: 'WebhookEvent',
      entity_id: 'wh_221',
      data: { event: 'installation.completed', attempt: 1, latency_ms: 312 },
      ip: '10.0.0.15',
      ts: iso(t(31)),
    },
    {
      id: 'aud_0004',
      actor_id: 'user_mgr',
      action: 'ORDER_IMPORT',
      entity: 'Order',
      entity_id: 'ord_5523',
      data: { source: 'ERP', item_count: 7 },
      ip: '10.0.0.42',
      ts: iso(t(55)),
    },
    {
      id: 'aud_0003',
      actor_id: 'user_wh',
      action: 'INVENTORY_ALLOCATE',
      entity: 'Stock',
      entity_id: 'sku-CHAIR-RED',
      data: { qty: 12, warehouse: 'WH_Nicosia' },
      ip: '10.0.0.23',
      ts: iso(t(75)),
    },
    {
      id: 'aud_0002',
      actor_id: 'user_crew',
      action: 'INSTALLATION_START',
      entity: 'Installation',
      entity_id: 'inst_3009',
      data: { geostamp: { lat: 35.180, lng: 33.365 }, timestamp: '2025-10-13T07:59:12Z' },
      ip: '10.0.0.61',
      ts: iso(t(95)),
    },
    {
      id: 'aud_0001',
      actor_id: 'user_crew',
      action: 'INSTALLATION_COMPLETE',
      entity: 'Installation',
      entity_id: 'inst_2991',
      data: { duration_min: 126, photos: 8 },
      ip: '10.0.0.61',
      ts: iso(t(130)),
    },
  ];
}

/* -------------------- Component -------------------- */
export default function AuditPage() {
  // Data (mock-only)
  const data = useMemo(() => mockAudit(), []);

  // Filters
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // Sorting & pagination
  const [sortKey, setSortKey] = useState<SortKey>('ts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // Row details
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const list = useMemo(() => {
    // base
    let l = [...data];

    // date range (inclusive)
    if (from) {
      const fromMs = new Date(from).setHours(0, 0, 0, 0);
      l = l.filter((r) => new Date(r.ts).getTime() >= fromMs);
    }
    if (to) {
      const toMs = new Date(to).setHours(23, 59, 59, 999);
      l = l.filter((r) => new Date(r.ts).getTime() <= toMs);
    }

    // actor/entity filters
    if (actor.trim()) {
      const s = actor.toLowerCase().trim();
      l = l.filter((r) => (r.actor_id || '').toLowerCase().includes(s));
    }
    if (entity.trim()) {
      const s = entity.toLowerCase().trim();
      l = l.filter((r) => (r.entity || '').toLowerCase().includes(s));
    }

    // free-text search across common fields
    if (search.trim()) {
      const s = search.toLowerCase().trim();
      l = l.filter((r) => {
        const inData = JSON.stringify(r.data || {}).toLowerCase();
        return (
          r.id.toLowerCase().includes(s) ||
          (r.actor_id || '').toLowerCase().includes(s) ||
          (r.action || '').toLowerCase().includes(s) ||
          (r.entity || '').toLowerCase().includes(s) ||
          (r.entity_id || '').toLowerCase().includes(s) ||
          (r.ip || '').toLowerCase().includes(s) ||
          inData.includes(s)
        );
      });
    }

    // sort
    l.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'ts':
          return (new Date(a.ts).getTime() - new Date(b.ts).getTime()) * dir;
        case 'actor':
          return ((a.actor_id || '').localeCompare(b.actor_id || '')) * dir;
        case 'entity':
          return ((a.entity || '').localeCompare(b.entity || '')) * dir;
        case 'action':
          return ((a.action || '').localeCompare(b.action || '')) * dir;
        case 'ip':
          return ((a.ip || '').localeCompare(b.ip || '')) * dir;
        default:
          return 0;
      }
    });

    return l;
  }, [data, search, actor, entity, from, to, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const fromIdx = (page - 1) * PAGE_SIZE;
    return list.slice(fromIdx, fromIdx + PAGE_SIZE);
  }, [list, page]);

  const toggleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const copyJSON = (obj: Record<string, any>) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(obj ?? {}, null, 2));
      toast.success('Copied payload to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mock data only. View security & operational events across InstallOps.
          </p>
        </div>

        <button
          onClick={() => {
            // No API, just a visual spinner tick
            // eslint-disable-next-line no-console
            console.log('Mock refresh');
          }}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search id, action, entity, data, ip…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <input
              className="input w-full"
              placeholder="Actor (user id/email)…"
              value={actor}
              onChange={(e) => {
                setPage(1);
                setActor(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <input
              className="input w-full"
              placeholder="Entity (User, Order, Installation…)"
              value={entity}
              onChange={(e) => {
                setPage(1);
                setEntity(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="input w-full"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              className="input w-full"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th label="Timestamp" active={sortKey === 'ts'} dir={sortDir} onClick={() => toggleSort('ts')} />
              <Th label="Actor" active={sortKey === 'actor'} dir={sortDir} onClick={() => toggleSort('actor')} />
              <Th label="Action" active={sortKey === 'action'} dir={sortDir} onClick={() => toggleSort('action')} />
              <Th label="Entity" active={sortKey === 'entity'} dir={sortDir} onClick={() => toggleSort('entity')} />
              <Th label="Entity ID" />
              <Th label="IP" active={sortKey === 'ip'} dir={sortDir} onClick={() => toggleSort('ip')} />
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paged.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(row.ts).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.actor_id || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.action || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.entity || '—'}</td>
                <td className="px-4 py-3 text-sm font-mono">{row.entity_id || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.ip || '—'}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() => setSelected(row)}
                  >
                    View JSON
                  </button>
                </td>
              </tr>
            ))}

            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                  No audit logs found.
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

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative z-50 w-full sm:max-w-2xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-lg font-semibold">{selected.action}</div>
                <div className="text-xs text-gray-500">
                  {selected.entity} • {selected.entity_id} • {new Date(selected.ts).toLocaleString()}
                </div>
              </div>
              <button
                className="rounded-full p-1 hover:bg-gray-100"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <InfoRow label="Actor" value={selected.actor_id || '—'} />
              <InfoRow label="IP" value={selected.ip || '—'} />

              <div className="flex items-center justify-between">
                <div className="text-xs uppercase text-gray-500">Payload</div>
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={() => copyJSON(selected.data || {})}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy JSON
                </button>
              </div>
              <pre className="max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                {JSON.stringify(selected.data ?? {}, null, 2)}
              </pre>
            </div>

            <div className="border-t px-4 py-3 text-right">
              <button
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Subcomponents -------------------- */
function Th({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  dir?: 'asc' | 'desc';
}) {
  const clickable = !!onClick;
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium uppercase text-gray-500',
        clickable && 'cursor-pointer select-none'
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {label} {active && <ArrowUpDown className={cn('h-3.5 w-3.5', dir === 'desc' && 'rotate-180')} />}
      </span>
    </th>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-xs uppercase text-gray-500 col-span-1">{label}</div>
      <div className="col-span-2 text-gray-900">{value}</div>
    </div>
  );
}
