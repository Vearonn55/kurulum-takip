// src/pages/manager/OrdersPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Store as StoreIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* ------------------------------ Types ------------------------------ */
type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

type MockOrder = {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  placed_at: string; // ISO
  status: OrderStatus;
  items_count: number;
  total_weight: number; // kg
};

/* --------------------------- Mock generator --------------------------- */
const STORES = [
  { id: 'store_nicosia', name: 'Nicosia' },
  { id: 'store_famagusta', name: 'Famagusta' },
  { id: 'store_kyrenia', name: 'Kyrenia' },
];

function dFmt(iso: string) {
  return new Date(iso).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function makeMockOrders(): MockOrder[] {
  const now = new Date();
  const iso = (offsetDays: number, h: number): string => {
    const d = new Date(now);
    d.setDate(now.getDate() + offsetDays);
    d.setHours(h, Math.floor(Math.random() * 60), 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'ORD-10001',
      store_id: 'store_nicosia',
      store_name: 'Nicosia',
      customer_name: 'Ali Demir',
      customer_phone: '+90 533 000 0001',
      placed_at: iso(-1, 10),
      status: 'confirmed',
      items_count: 5,
      total_weight: 78,
    },
    {
      id: 'ORD-10002',
      store_id: 'store_famagusta',
      store_name: 'Famagusta',
      customer_name: 'Selin Kaya',
      customer_phone: '+90 533 000 0002',
      placed_at: iso(0, 12),
      status: 'pending',
      items_count: 3,
      total_weight: 41,
    },
    {
      id: 'ORD-10003',
      store_id: 'store_kyrenia',
      store_name: 'Kyrenia',
      customer_name: 'Mete Aydın',
      customer_phone: '+90 533 000 0003',
      placed_at: iso(-2, 14),
      status: 'cancelled',
      items_count: 2,
      total_weight: 25,
    },
    {
      id: 'ORD-10004',
      store_id: 'store_nicosia',
      store_name: 'Nicosia',
      customer_name: 'Deniz Arslan',
      customer_phone: '+90 533 000 0004',
      placed_at: iso(0, 9),
      status: 'confirmed',
      items_count: 4,
      total_weight: 64,
    },
    {
      id: 'ORD-10005',
      store_id: 'store_famagusta',
      store_name: 'Famagusta',
      customer_name: 'Ece Yıldız',
      customer_phone: '+90 533 000 0005',
      placed_at: iso(-3, 16),
      status: 'pending',
      items_count: 6,
      total_weight: 93,
    },
    {
      id: 'ORD-10006',
      store_id: 'store_kyrenia',
      store_name: 'Kyrenia',
      customer_name: 'Bora Kar',
      customer_phone: '+90 533 000 0006',
      placed_at: iso(1, 11),
      status: 'confirmed',
      items_count: 1,
      total_weight: 12,
    },
  ];
}

/* ------------------------------ Page ------------------------------ */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [store, setStore] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'placed_at' | 'customer' | 'weight'>('placed_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const data = useMemo(() => makeMockOrders(), []); // stable mock for session

  const filtered = useMemo(() => {
    let list = data.slice();

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.customer_name.toLowerCase().includes(s) ||
          o.customer_phone.toLowerCase().includes(s) ||
          o.store_name.toLowerCase().includes(s)
      );
    }
    if (status !== 'all') list = list.filter((o) => o.status === status);
    if (store !== 'all') list = list.filter((o) => o.store_id === store);

    list.sort((a, b) => {
      switch (sortBy) {
        case 'placed_at':
          return sortDir === 'asc'
            ? a.placed_at.localeCompare(b.placed_at)
            : b.placed_at.localeCompare(a.placed_at);
        case 'customer':
          return sortDir === 'asc'
            ? a.customer_name.localeCompare(b.customer_name)
            : b.customer_name.localeCompare(a.customer_name);
        case 'weight':
          return sortDir === 'asc' ? a.total_weight - b.total_weight : b.total_weight - a.total_weight;
      }
    });

    return list;
  }, [data, q, status, store, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(() => {
    return {
      all: data.length,
      pending: data.filter((o) => o.status === 'pending').length,
      confirmed: data.filter((o) => o.status === 'confirmed').length,
      cancelled: data.filter((o) => o.status === 'cancelled').length,
    };
  }, [data]);

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const goDetail = (id: string) => navigate(`/app/orders/${id}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Imported sales orders to schedule installations.</p>
        </div>
        <button
          onClick={() => navigate('/app/orders/new')}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create order
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-600">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Order ID, customer, phone, store…"
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
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Store</label>
          <div className="relative">
            <StoreIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select
              className="input w-full pl-8"
              value={store}
              onChange={(e) => {
                setStore(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All stores</option>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status quick filters */}
      <div className="flex flex-wrap gap-2">
        <QuickStat
          label="All"
          value={counts.all}
          active={status === 'all'}
          onClick={() => {
            setStatus('all');
            setPage(1);
          }}
        />
        <QuickStat
          icon={<Clock className="h-3.5 w-3.5" />}
          tone="amber"
          label="Pending"
          value={counts.pending}
          active={status === 'pending'}
          onClick={() => {
            setStatus('pending');
            setPage(1);
          }}
        />
        <QuickStat
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          label="Confirmed"
          value={counts.confirmed}
          active={status === 'confirmed'}
          onClick={() => {
            setStatus('confirmed');
            setPage(1);
          }}
        />
        <QuickStat
          icon={<XCircle className="h-3.5 w-3.5" />}
          tone="rose"
          label="Cancelled"
          value={counts.cancelled}
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
              <ThButton
                className="w-36"
                label="Placed at"
                active={sortBy === 'placed_at'}
                dir={sortDir}
                onClick={() => toggleSort('placed_at')}
              />
              <th className="px-3 py-2 text-left">Order</th>
              <ThButton
                label="Customer"
                active={sortBy === 'customer'}
                dir={sortDir}
                onClick={() => toggleSort('customer')}
              />
              <th className="px-3 py-2 text-left">Store</th>
              <ThButton
                className="w-28 text-right"
                label="Weight"
                active={sortBy === 'weight'}
                dir={sortDir}
                onClick={() => toggleSort('weight')}
              />
              <th className="w-28 px-3 py-2 text-left">Status</th>
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  No orders found with current filters.
                </td>
              </tr>
            ) : (
              paged.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {dFmt(o.placed_at)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{o.id}</div>
                    <div className="text-xs text-gray-500">{o.items_count} item(s)</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{o.customer_name}</div>
                    <div className="text-xs text-gray-500">{o.customer_phone}</div>
                  </td>
                  <td className="px-3 py-2">{o.store_name}</td>
                  <td className="px-3 py-2 text-right">{o.total_weight} kg</td>
                  <td className="px-3 py-2">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => goDetail(o.id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-3 text-sm">
          <div className="text-gray-600">
            Showing <span className="font-medium text-gray-900">{paged.length}</span> of{' '}
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
              Prev
            </button>
            <div>
              Page <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-md border px-3 py-1.5',
                page === totalPages ? 'opacity-50' : 'hover:bg-gray-50'
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Bits ------------------------------ */
function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === 'confirmed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'pending'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';
  const Icon = status === 'confirmed' ? CheckCircle2 : status === 'pending' ? Clock : XCircle;

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] capitalize', tone)}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function ThButton({
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
        className={cn(
          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100',
          active && 'text-primary-700'
        )}
        title="Sort"
      >
        {label} <ArrowUpDown className={cn('h-3.5 w-3.5', active && dir === 'asc' && 'rotate-180')} />
      </button>
    </th>
  );
}

function QuickStat({
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
  tone?: 'gray' | 'amber' | 'emerald' | 'rose';
}) {
  const tones: Record<string, string> = {
    gray: 'border-gray-200 bg-white text-gray-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
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
