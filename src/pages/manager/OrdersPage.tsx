// src/pages/manager/OrdersPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar as CalendarIcon,
  User2,
  Package,
  Store,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* ------------------------------ Local types ----------------------------- */
type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

type MockOrder = {
  id: string;
  store: string;
  customer: string;
  items_count: number;
  status: OrderStatus;
  placed_at: string; // ISO
};

/* ------------------------------- Mock data ------------------------------ */
function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return d.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
const MOCK_ORDERS: MockOrder[] = (() => {
  const today = new Date();
  const iso = (offsetDay: number, hh: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDay);
    d.setHours(hh, Math.floor(Math.random() * 50), 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: 'ORD-10001',
      store: 'Store A (Nicosia)',
      customer: 'Ali Demir',
      items_count: 5,
      status: 'confirmed',
      placed_at: iso(0, 9),
    },
    {
      id: 'ORD-10002',
      store: 'Store B (Famagusta)',
      customer: 'Selin Kaya',
      items_count: 2,
      status: 'pending',
      placed_at: iso(1, 14),
    },
    {
      id: 'ORD-10003',
      store: 'Store C (Kyrenia)',
      customer: 'Mete Aydın',
      items_count: 7,
      status: 'confirmed',
      placed_at: iso(2, 11),
    },
    {
      id: 'ORD-10004',
      store: 'Store A (Nicosia)',
      customer: 'Deniz Arslan',
      items_count: 3,
      status: 'cancelled',
      placed_at: iso(4, 10),
    },
    {
      id: 'ORD-10005',
      store: 'Store D (Iskele)',
      customer: 'Ece Yıldız',
      items_count: 4,
      status: 'pending',
      placed_at: iso(5, 16),
    },
    {
      id: 'ORD-10006',
      store: 'Store B (Famagusta)',
      customer: 'Bora Kar',
      items_count: 1,
      status: 'confirmed',
      placed_at: iso(6, 12),
    },
    {
      id: 'ORD-10007',
      store: 'Store C (Kyrenia)',
      customer: 'Can Er',
      items_count: 6,
      status: 'confirmed',
      placed_at: iso(7, 15),
    },
  ];
})();

/* --------------------------------- Page -------------------------------- */
export default function OrdersPage() {
  const navigate = useNavigate();

  // Filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [store, setStore] = useState<string>('all');
  const [from, setFrom] = useState<string>(ymd());
  const [to, setTo] = useState<string>(ymd());

  // Sort & pagination
  const [sortBy, setSortBy] = useState<'placed_at' | 'id' | 'customer' | 'store' | 'items_count' | 'status'>('placed_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Derived options
  const storeOptions = useMemo(() => {
    const unique = Array.from(new Set(MOCK_ORDERS.map(o => o.store)));
    return unique.sort();
  }, []);

  const filtered = useMemo(() => {
    let list = MOCK_ORDERS.slice();

    // Date filter (placed_at between from and to inclusive)
    const fromD = new Date(from + 'T00:00:00');
    const toD = new Date(to + 'T23:59:59');

    list = list.filter(o => {
      const d = new Date(o.placed_at);
      return d >= fromD && d <= toD;
    });

    // Status & store
    if (status !== 'all') list = list.filter(o => o.status === status);
    if (store !== 'all') list = list.filter(o => o.store === store);

    // Text search
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.customer.toLowerCase().includes(s) ||
          o.store.toLowerCase().includes(s)
      );
    }

    // Sort
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'placed_at':
          return dir * (a.placed_at.localeCompare(b.placed_at));
        case 'id':
          return dir * a.id.localeCompare(b.id);
        case 'customer':
          return dir * a.customer.localeCompare(b.customer);
        case 'store':
          return dir * a.store.localeCompare(b.store);
        case 'items_count':
          return dir * (a.items_count - b.items_count);
        case 'status':
          return dir * (statusRank(a.status) - statusRank(b.status));
      }
    });

    return list;
  }, [q, status, store, from, to, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (k: typeof sortBy) => {
    if (sortBy === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(k);
      setSortDir('asc');
    }
  };

  const openDetail = (id: string) => navigate(`/app/orders/${id}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Read-only list imported from external system. Use orders to plan installations.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-600">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Order ID, customer, store…"
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
            <Store className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select
              className="input w-full pl-8"
              value={store}
              onChange={(e) => {
                setStore(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All stores</option>
              {storeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">From</label>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="input w-full pl-8"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">To</label>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="input w-full pl-8"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <Th label="Placed" active={sortBy === 'placed_at'} dir={sortDir} onClick={() => toggleSort('placed_at')} />
              <Th label="Order" active={sortBy === 'id'} dir={sortDir} onClick={() => toggleSort('id')} />
              <Th label="Customer" active={sortBy === 'customer'} dir={sortDir} onClick={() => toggleSort('customer')} />
              <Th label="Store" active={sortBy === 'store'} dir={sortDir} onClick={() => toggleSort('store')} />
              <Th label="Items" active={sortBy === 'items_count'} dir={sortDir} onClick={() => toggleSort('items_count')} className="w-24" />
              <Th label="Status" active={sortBy === 'status'} dir={sortDir} onClick={() => toggleSort('status')} className="w-36" />
              <th className="w-24 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">No orders match the filters.</td>
              </tr>
            ) : (
              paged.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {fmt(o.placed_at)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{o.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{o.customer}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{o.store}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] text-gray-700">
                      <Package className="h-3.5 w-3.5" />
                      {o.items_count}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => openDetail(o.id)} className="text-primary-600 hover:text-primary-800">
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

/* --------------------------------- Bits -------------------------------- */
function statusRank(s: OrderStatus) {
  const order: OrderStatus[] = ['pending', 'confirmed', 'cancelled'];
  return order.indexOf(s);
}

function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  };
  const label = status === 'confirmed' ? 'Confirmed' : status === 'pending' ? 'Pending' : 'Cancelled';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]', styles[status])}>
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
