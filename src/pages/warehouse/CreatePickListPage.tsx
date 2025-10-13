// src/pages/warehouse/CreatePickListPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  Package,
  ClipboardList,
  CheckSquare,
  ChevronRight,
  Search,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

/* ----------------------------- Mock types ----------------------------- */
type Zone = 'Nicosia' | 'Famagusta' | 'Kyrenia' | 'Morphou' | 'Iskele';
type InstallStatus = 'scheduled' | 'staged' | 'loaded';

type InstallItem = {
  product_id: string;
  sku: string;
  name: string;
  qty: number;
  unit_weight: number; // kg
};

type MockInstallation = {
  id: string;
  order_id: string;
  customer: string;
  zone: Zone;
  status: InstallStatus;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  address: string;
  items: InstallItem[];
};

/* ----------------------------- Mock data ----------------------------- */
const TODAY = toYMD(new Date());

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MOCK_INSTALLS: MockInstallation[] = (() => {
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  const TOMORROW = toYMD(tmr);

  return [
    {
      id: 'inst-5001',
      order_id: 'ORD-11001',
      customer: 'Ali Demir',
      zone: 'Nicosia',
      status: 'scheduled',
      date: TODAY,
      time: '09:00',
      address: 'Atatürk Cad. 18, Nicosia',
      items: [
        { product_id: 'p-ward-001', sku: 'WARD-2D', name: 'Wardrobe 2D', qty: 1, unit_weight: 42 },
        { product_id: 'p-chair-001', sku: 'CHR-STD', name: 'Chair Standard', qty: 2, unit_weight: 6 },
      ],
    },
    {
      id: 'inst-5002',
      order_id: 'ORD-11003',
      customer: 'Selin Kaya',
      zone: 'Famagusta',
      status: 'staged',
      date: TODAY,
      time: '11:30',
      address: 'Ece Sk. 12, Famagusta',
      items: [
        { product_id: 'p-kit-isl', sku: 'KIT-ISL', name: 'Kitchen Island', qty: 1, unit_weight: 55 },
        { product_id: 'p-stool-01', sku: 'BAR-STL', name: 'Bar Stool', qty: 2, unit_weight: 5.5 },
      ],
    },
    {
      id: 'inst-5003',
      order_id: 'ORD-11007',
      customer: 'Mete Aydın',
      zone: 'Kyrenia',
      status: 'loaded',
      date: TODAY,
      time: '15:00',
      address: 'Zeytinlik Mah., Kyrenia',
      items: [
        { product_id: 'p-sofa-02', sku: 'SOFA-3S', name: 'Sofa 3-Seater', qty: 1, unit_weight: 38 },
        { product_id: 'p-table-01', sku: 'TB-CT', name: 'Coffee Table', qty: 1, unit_weight: 12 },
      ],
    },
    {
      id: 'inst-5009',
      order_id: 'ORD-11012',
      customer: 'Deniz Arslan',
      zone: 'Nicosia',
      status: 'scheduled',
      date: TOMORROW,
      time: '10:00',
      address: 'Dr. Fazıl Küçük Bul., Nicosia',
      items: [
        { product_id: 'p-shelf-01', sku: 'SH-L', name: 'Shelf Large', qty: 1, unit_weight: 20 },
        { product_id: 'p-chair-001', sku: 'CHR-STD', name: 'Chair Standard', qty: 4, unit_weight: 6 },
      ],
    },
  ];
})();

/* ----------------------------- Component ----------------------------- */
export default function CreatePickListPage() {
  const navigate = useNavigate();

  // Filters
  const [date, setDate] = useState<string>(TODAY);
  const [zone, setZone] = useState<Zone | 'all'>('all');
  const [status, setStatus] = useState<InstallStatus | 'all'>('all');
  const [q, setQ] = useState('');

  // Selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const dayInstalls = useMemo(() => {
    let list = MOCK_INSTALLS.filter((i) => i.date === date);
    if (zone !== 'all') list = list.filter((i) => i.zone === zone);
    if (status !== 'all') list = list.filter((i) => i.status === status);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.customer.toLowerCase().includes(s) ||
          i.order_id.toLowerCase().includes(s) ||
          i.address.toLowerCase().includes(s) ||
          i.items.some((it) => it.sku.toLowerCase().includes(s) || it.name.toLowerCase().includes(s))
      );
    }
    // sort by time
    list.sort((a, b) => a.time.localeCompare(b.time));
    return list;
  }, [date, zone, status, q]);

  const allChecked = dayInstalls.length > 0 && dayInstalls.every((i) => selected[i.id]);
  const someChecked = dayInstalls.some((i) => selected[i.id]);
  const selectedInstalls = dayInstalls.filter((i) => selected[i.id]);

  const summary = useMemo(() => aggregateItems(selectedInstalls), [selectedInstalls]);

  function toggleAll() {
    if (allChecked) {
      // clear only current filtered list
      setSelected((prev) => {
        const copy = { ...prev };
        dayInstalls.forEach((i) => delete copy[i.id]);
        return copy;
      });
    } else {
      const add: Record<string, boolean> = {};
      dayInstalls.forEach((i) => (add[i.id] = true));
      setSelected((prev) => ({ ...prev, ...add }));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleCreate() {
    if (selectedInstalls.length === 0) {
      toast.error('Select at least one installation');
      return;
    }
    // Normally: POST to /picklists with chosen installs.
    // For now mock success + navigate.
    toast.success(
      `Pick list created with ${selectedInstalls.length} installation(s), ${summary.totalLines} lines (${summary.totalQty} pcs)`
    );
    navigate('/app/picklists');
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Pick List</h1>
        <p className="mt-1 text-sm text-gray-500">Select installations to generate a consolidated pick list.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-gray-600">Date</label>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="input w-full pl-8"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Zone</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select className="input w-full pl-8" value={zone} onChange={(e) => setZone(e.target.value as any)}>
              <option value="all">All zones</option>
              {(['Nicosia', 'Famagusta', 'Kyrenia', 'Morphou', 'Iskele'] as Zone[]).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Status</label>
          <div className="relative">
            <Truck className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <select className="input w-full pl-8" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All (Scheduled/Staged/Loaded)</option>
              <option value="scheduled">Scheduled</option>
              <option value="staged">Staged</option>
              <option value="loaded">Loaded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Customer, order, address, SKU…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Installations list */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-500" />
            <div className="text-sm font-semibold text-gray-900">Installations</div>
            <span className="text-xs text-gray-500">({dayInstalls.length} found)</span>
          </div>

          <button
            onClick={toggleAll}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs',
              someChecked ? 'bg-gray-100' : 'hover:bg-gray-50'
            )}
          >
            {allChecked ? 'Clear all' : 'Select all'}
          </button>
        </div>

        {dayInstalls.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No installations match the filters.</div>
        ) : (
          <ul className="divide-y">
            {dayInstalls.map((i) => (
              <li key={i.id} className="p-3">
                <label className="flex w-full cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={!!selected[i.id]}
                    onChange={() => toggleOne(i.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {i.customer}
                        <span className="ml-2 text-xs font-normal text-gray-500">{i.order_id}</span>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] capitalize',
                          pillTone(i.status)
                        )}
                      >
                        {i.status}
                      </span>
                    </div>

                    <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-600 md:grid-cols-6">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {i.date} {i.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {i.zone}
                      </div>
                      <div className="col-span-3 md:col-span-4 truncate">{i.address}</div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                      {i.items.map((it) => (
                        <div key={i.id + it.sku} className="flex items-center justify-between rounded-md border p-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm text-gray-900">
                              {it.name} <span className="text-gray-500">({it.sku})</span>
                            </div>
                            <div className="text-xs text-gray-500">#{it.product_id}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs">
                              Qty: {it.qty}
                            </span>
                            <span className="text-xs text-gray-500">{(it.unit_weight * it.qty).toFixed(1)} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary & Create */}
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-2">
          <ClipboardList className="h-4 w-4 text-gray-500" />
          <div className="text-sm font-semibold text-gray-900">Summary</div>
        </div>

        {/* Totals */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <Stat label="Installations" value={selectedInstalls.length} />
          <Stat label="Lines" value={summary.totalLines} />
          <Stat label="Total qty" value={summary.totalQty} />
          <Stat label="Weight (kg)" value={summary.totalWeight.toFixed(1)} />
        </div>

        {/* Aggregated lines */}
        <div className="mt-3 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary.lines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                    Select installations to see the pick list lines.
                  </td>
                </tr>
              ) : (
                summary.lines.map((ln) => (
                  <tr key={ln.product_id}>
                    <td className="px-3 py-2 font-mono text-xs">{ln.sku}</td>
                    <td className="px-3 py-2">{ln.name}</td>
                    <td className="px-3 py-2 text-right">{ln.qty}</td>
                    <td className="px-3 py-2 text-right">{ln.weight.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create button */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleCreate}
            className={cn(
              'inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700',
              selectedInstalls.length === 0 && 'opacity-70'
            )}
          >
            <Package className="mr-2 h-4 w-4" />
            Create pick list
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helpers/UI ----------------------------- */
function pillTone(s: InstallStatus) {
  switch (s) {
    case 'scheduled':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'staged':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'loaded':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

function aggregateItems(installs: MockInstallation[]) {
  const map = new Map<
    string,
    { product_id: string; sku: string; name: string; qty: number; weightPer: number }
  >();
  for (const ins of installs) {
    for (const it of ins.items) {
      const key = it.product_id;
      if (!map.has(key)) {
        map.set(key, {
          product_id: it.product_id,
          sku: it.sku,
          name: it.name,
          qty: 0,
          weightPer: it.unit_weight,
        });
      }
      const row = map.get(key)!;
      row.qty += it.qty;
    }
  }
  const lines = Array.from(map.values()).map((r) => ({
    product_id: r.product_id,
    sku: r.sku,
    name: r.name,
    qty: r.qty,
    weight: r.qty * r.weightPer,
  }));
  lines.sort((a, b) => a.sku.localeCompare(b.sku));

  const totalLines = lines.length;
  const totalQty = lines.reduce((s, r) => s + r.qty, 0);
  const totalWeight = lines.reduce((s, r) => s + r.weight, 0);

  return { lines, totalLines, totalQty, totalWeight };
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-gray-50 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
