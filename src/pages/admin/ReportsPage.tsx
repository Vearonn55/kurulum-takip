import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ---------- Filters ---------- */
type City = 'Nicosia' | 'Kyrenia' | 'Famagusta' | 'Iskele';
type Store = 'All Stores' | 'Main Store' | 'Downtown' | 'Warehouse' | 'Outlet';

/* ---------- Mock data ---------- */
type Installation = {
  id: string;             // installation number (shown as the name)
  order_id: string;       // for /app/orders/:id
  city: City;
  store: Exclude<Store, 'All Stores'>;
  date: string;           // ISO date (YYYY-MM-DD)
};

const MOCK_INSTALLATIONS: Installation[] = [
  { id: 'INS-001', order_id: '1001', city: 'Nicosia',  store: 'Main Store', date: '2025-10-24' },
  { id: 'INS-002', order_id: '1002', city: 'Kyrenia',  store: 'Downtown',   date: '2025-10-25' },
  { id: 'INS-003', order_id: '1003', city: 'Famagusta',store: 'Warehouse',  date: '2025-10-26' },
  { id: 'INS-004', order_id: '1004', city: 'Iskele',   store: 'Outlet',     date: '2025-10-27' },
  { id: 'INS-005', order_id: '1005', city: 'Nicosia',  store: 'Downtown',   date: '2025-10-28' },
  { id: 'INS-006', order_id: '1006', city: 'Kyrenia',  store: 'Main Store', date: '2025-10-29' },
];



/* ---------- Component ---------- */
export default function ReportsPage() {
  // default: last 7 days
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const weekAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = useState<string>(weekAgoStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [city, setCity] = useState<City>('Nicosia');
  const [store, setStore] = useState<Store>('All Stores');

  const navigate = useNavigate();

  // ensure start <= end
  const onStartChange = (val: string) => {
    if (endDate && val > endDate) setEndDate(val);
    setStartDate(val);
  };
  const onEndChange = (val: string) => {
    if (startDate && val < startDate) setStartDate(val);
    setEndDate(val);
  };

  // helpers
  const inDateRange = (iso: string, start: string, end: string) =>
    (!start || iso >= start) && (!end || iso <= end);

  // filter by date, city, and store
  const filtered = useMemo(() => {
    return MOCK_INSTALLATIONS.filter((ins) => {
      const matchDate = inDateRange(ins.date, startDate, endDate);
      const matchCity = ins.city === city;
      const matchStore = store === 'All Stores' ? true : ins.store === store;
      return matchDate && matchCity && matchStore;
    }).sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
  }, [startDate, endDate, city, store]);

  // --- Statistics mock calculation ---
const totalInstallations = filtered.length;
const successfulInstallations = Math.round(totalInstallations * 0.8); // mock: 80% success rate
const successRate =
  totalInstallations === 0 ? 0 : Math.round((successfulInstallations / totalInstallations) * 100);

  const fmt = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  return (
    <div className="p-4 md:p-6">
      {/* Top controls: Start, End, City, Store */}
        <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Filters</h2>
        </div>
        <div className="px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Start date */}
            <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="text-sm font-medium">Start</label>
                <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartChange(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
                max={endDate || undefined}
                />
            </div>

            {/* End date */}
            <div className="flex items-center gap-2">
                <label htmlFor="end-date" className="text-sm font-medium">End</label>
                <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => onEndChange(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
                min={startDate || undefined}
                />
            </div>

            {/* City */}
            <div className="flex items-center gap-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value as City)}
                className="border rounded-md px-2 py-1 text-sm"
                >
                <option value="Nicosia">Nicosia</option>
                <option value="Kyrenia">Kyrenia</option>
                <option value="Famagusta">Famagusta</option>
                <option value="Iskele">Iskele</option>
                </select>
            </div>

            {/* Store */}
            <div className="flex items-center gap-2">
                <label htmlFor="store" className="text-sm font-medium">Store</label>
                <select
                id="store"
                value={store}
                onChange={(e) => setStore(e.target.value as Store)}
                className="border rounded-md px-2 py-1 text-sm"
                >
                <option>All Stores</option>
                <option>Main Store</option>
                <option>Downtown</option>
                <option>Warehouse</option>
                <option>Outlet</option>
                </select>
            </div>
            </div>
        </div>
        </div>

                {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1 - Installation Success Rate */}
        <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700">Installation Success Rate</h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{successRate}%</div>
            <p className="mt-1 text-xs text-gray-500">
            {successfulInstallations} successful / {totalInstallations} total
            </p>
        </div>

        {/* Card 2 - placeholder */}
        <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700">[Card 2]</h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-500">Coming soon</p>
        </div>

        {/* Card 3 - placeholder */}
        <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700">[Card 3]</h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900">—</div>
            <p className="mt-1 text-xs text-gray-500">Coming soon</p>
        </div>
        </div>



      {/* Big Installations Card */}
      <div className="mt-6 rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="text-base font-semibold">Installations</h2>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''} for {city}
            {store !== 'All Stores' ? ` • ${store}` : ''} between {startDate} and {endDate}
          </p>
        </div>

        {/* List */}
        <div className="divide-y">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">No installations match the selected filters.</div>
          ) : (
            filtered.map((ins) => (
              <div key={ins.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{ins.id}</div>
                  <div className="text-xs text-gray-500">{fmt(ins.date)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/app/orders/${ins.order_id}`)}
                    className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                    title="Go to Order Detail"
                    type="button"
                  >
                    View Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug params (optional) */}
      <div className="mt-4 rounded-md border px-3 py-2 text-xs text-gray-500">
        Current params → start: <b>{startDate}</b>, end: <b>{endDate}</b>, city: <b>{city}</b>, store: <b>{store}</b>
      </div>
    </div>
  );
}
