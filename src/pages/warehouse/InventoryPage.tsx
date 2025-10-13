// src/pages/warehouse/InventoryPage.tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Search, Filter, Package, Warehouse as WarehouseIcon, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { apiClient } from '../../lib/api';
import type { StockItem, Product } from '../../types';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

/* -------------------- DEV MOCKS -------------------- */
type InventoryRow = StockItem & {
  product?: Pick<Product, 'id' | 'sku' | 'name' | 'hazardous' | 'weight' | 'dimensions'>;
  free_qty?: number; // quantity - reserved
};

const DEV_WAREHOUSES = ['WH_Nicosia', 'WH_Famagusta', 'WH_Kyrenia'];
function devMockInventory(): InventoryRow[] {
  const now = new Date().toISOString();
  const mk = (i: number, wh: string, sku: string, name: string, qty: number, reserved: number): InventoryRow => ({
    id: `inv_${wh}_${sku}`,
    product_id: `prod_${sku}`,
    warehouse: wh,
    quantity: qty,
    reserved,
    created_at: now,
    updated_at: now,
    product: {
      id: `prod_${sku}`,
      sku,
      name,
      weight: 12 + i,
      hazardous: sku.endsWith('HZ'),
      dimensions: { length: 120, width: 60 },
      created_at: now,
      updated_at: now,
    },
    free_qty: qty - reserved,
  });

  return [
    mk(1, 'WH_Nicosia', 'CHAIR-100', 'Dining Chair Oak', 42, 10),
    mk(2, 'WH_Nicosia', 'TABLE-200', 'Extendable Table', 8, 3),
    mk(3, 'WH_Famagusta', 'SOFA-3S-300', '3-Seat Sofa Grey', 5, 4),
    mk(4, 'WH_Famagusta', 'BED-QUEEN-400', 'Queen Bed Frame', 18, 2),
    mk(5, 'WH_Kyrenia', 'LIGHT-CEIL-HZ', 'Ceiling Light (Haz)', 60, 0),
    mk(6, 'WH_Kyrenia', 'WARD-2D-500', 'Wardrobe 2 Doors', 12, 5),
  ];
}

/* -------------------- SMALL HELPERS -------------------- */
const PAGE_SIZE = 10;

function badgeClassesByFreeQty(free?: number) {
  if (typeof free !== 'number') return 'bg-gray-100 text-gray-800';
  if (free <= 0) return 'bg-red-100 text-red-800';
  if (free <= 5) return 'bg-amber-100 text-amber-800';
  return 'bg-emerald-100 text-emerald-800';
}
function levelText(free?: number) {
  if (typeof free !== 'number') return 'Unknown';
  if (free <= 0) return 'Out of stock';
  if (free <= 5) return 'Low';
  return 'OK';
}

type SortKey = 'sku' | 'name' | 'warehouse' | 'qty' | 'reserved' | 'free';
type SortState = { key: SortKey; dir: 'asc' | 'desc' };

export default function InventoryPage() {
  // Filters
  const [warehouse, setWarehouse] = useState<string>('');
  const [skuFilter, setSkuFilter] = useState<string>('');
  const [q, setQ] = useState<string>('');

  // Sorting & Pagination
  const [sort, setSort] = useState<SortState>({ key: 'sku', dir: 'asc' });
  const [page, setPage] = useState<number>(1);

  // Row details
  const [selected, setSelected] = useState<InventoryRow | null>(null);

  const invQuery = useQuery({
    queryKey: ['inventory', { warehouse, sku: skuFilter }],
    queryFn: async () => {
      const res = await apiClient.getInventory({
        warehouse: warehouse || undefined,
        sku: skuFilter || undefined,
      });
      // Expecting array of StockItem with optional embedded product, adapt as needed
      const arr = (res.data as any[] | undefined) ?? [];
      let rows: InventoryRow[] = arr.map((it: any) => ({
        ...it,
        free_qty: (it.quantity ?? 0) - (it.reserved ?? 0),
      }));
      // If API is empty in dev, show mocks so the UI is visible
      if (!rows.length && import.meta.env.DEV) {
        rows = devMockInventory();
      }
      return rows;
    },
  });

  const uniqueWarehouses = useMemo<string[]>(() => {
    const fromApi = Array.from(new Set((invQuery.data ?? []).map((r) => r.warehouse)));
    return fromApi.length ? fromApi : DEV_WAREHOUSES;
  }, [invQuery.data]);

  const list = useMemo<InventoryRow[]>(() => {
    let l = invQuery.data ?? [];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((r) =>
        (r.product?.sku || '').toLowerCase().includes(s) ||
        (r.product?.name || '').toLowerCase().includes(s) ||
        (r.warehouse || '').toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s)
      );
    }

    // sorting
    l = [...l].sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'sku':
          return (a.product?.sku || '').localeCompare(b.product?.sku || '') * dir;
        case 'name':
          return (a.product?.name || '').localeCompare(b.product?.name || '') * dir;
        case 'warehouse':
          return (a.warehouse || '').localeCompare(b.warehouse || '') * dir;
        case 'qty':
          return ((a.quantity ?? 0) - (b.quantity ?? 0)) * dir;
        case 'reserved':
          return ((a.reserved ?? 0) - (b.reserved ?? 0)) * dir;
        case 'free':
          return ((a.free_qty ?? 0) - (b.free_qty ?? 0)) * dir;
        default:
          return 0;
      }
    });
    return l;
  }, [invQuery.data, q, sort]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return list.slice(from, from + PAGE_SIZE);
  }, [list, page]);

  const setSortKey = (key: SortKey) => {
    setPage(1);
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Check stock, filter by warehouse/SKU, and view item details.</p>
        </div>
        <button
          onClick={() => invQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          disabled={invQuery.isFetching}
        >
          <RefreshCw className={cn('h-4 w-4', invQuery.isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search SKU, name, warehouse, id…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="input w-full"
              value={warehouse}
              onChange={(e) => {
                setPage(1);
                setWarehouse(e.target.value);
              }}
            >
              <option value="">All warehouses</option>
              {uniqueWarehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <input
            className="input w-full"
            placeholder="Exact SKU…"
            value={skuFilter}
            onChange={(e) => {
              setPage(1);
              setSkuFilter(e.target.value);
            }}
          />

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <WarehouseIcon className="h-4 w-4" />
            {list.length} items
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th onClick={() => setSortKey('sku')} active={sort.key === 'sku'} dir={sort.dir} label="SKU" />
              <Th onClick={() => setSortKey('name')} active={sort.key === 'name'} dir={sort.dir} label="Product" />
              <Th onClick={() => setSortKey('warehouse')} active={sort.key === 'warehouse'} dir={sort.dir} label="Warehouse" />
              <Th onClick={() => setSortKey('qty')} active={sort.key === 'qty'} dir={sort.dir} label="Qty" right />
              <Th onClick={() => setSortKey('reserved')} active={sort.key === 'reserved'} dir={sort.dir} label="Reserved" right />
              <Th onClick={() => setSortKey('free')} active={sort.key === 'free'} dir={sort.dir} label="Free" right />
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paged.map((row) => {
              const free = row.free_qty ?? (row.quantity ?? 0) - (row.reserved ?? 0);
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected(row)}
                >
                  <td className="px-4 py-3 text-sm font-mono">{row.product?.sku || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{row.product?.name || '—'}</span>
                    {row.product?.hazardous && (
                      <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">Haz</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.warehouse}</td>
                  <td className="px-4 py-3 text-sm text-right">{row.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-right">{row.reserved ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-right">{free}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border', badgeClassesByFreeQty(free))}>
                      {levelText(free)}
                    </span>
                  </td>
                </tr>
              );
            })}

            {!invQuery.isLoading && paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                  No inventory found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {invQuery.isLoading && <div className="px-4 py-6 text-sm text-gray-500">Loading inventory…</div>}
        {invQuery.isError && <div className="px-4 py-6 text-sm text-red-600">Failed to load inventory.</div>}
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

      {/* Details Drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative z-50 w-full sm:max-w-xl rounded-lg bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                {selected.product?.name || selected.product_id}
              </div>
              <div className="text-sm text-gray-500">SKU: <span className="font-mono">{selected.product?.sku}</span></div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Warehouse" value={selected.warehouse} />
                <Info label="Status" value={levelText(selected.free_qty)} pillClass={badgeClassesByFreeQty(selected.free_qty)} />
                <Info label="Quantity" value={String(selected.quantity ?? 0)} />
                <Info label="Reserved" value={String(selected.reserved ?? 0)} />
                <Info label="Free" value={String(selected.free_qty ?? (selected.quantity ?? 0) - (selected.reserved ?? 0))} />
                <Info label="Hazardous" value={selected.product?.hazardous ? 'Yes' : 'No'} />
                <Info label="Weight (kg)" value={String(selected.product?.weight ?? '—')} />
                <Info label="Dimensions" value={`${selected.product?.dimensions?.length ?? '—'}x${selected.product?.dimensions?.width ?? '—'} cm`} />
              </div>
              <div className="text-xs text-gray-400">
                Updated: {new Date(selected.updated_at).toLocaleString()}
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end">
              <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setSelected(null)}>
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
  right,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: 'asc' | 'desc';
  right?: boolean;
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-medium uppercase text-gray-500',
        right ? 'text-right' : 'text-left',
        'cursor-pointer select-none'
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {label} {active && <ArrowUpDown className={cn('h-3.5 w-3.5', dir === 'desc' && 'rotate-180')} />}
      </span>
    </th>
  );
}

function Info({ label, value, pillClass }: { label: string; value: string; pillClass?: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
      {pillClass ? (
        <div className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', pillClass)}>
          {value}
        </div>
      ) : (
        <div className="text-sm text-gray-900">{value}</div>
      )}
    </div>
  );
}
