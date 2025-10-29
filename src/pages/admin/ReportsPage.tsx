import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ---------- Filters ---------- */
type City = 'Nicosia' | 'Kyrenia' | 'Famagusta' | 'Iskele' | 'All Cities';
type Store = 'All Stores' | 'Girne-Lajivert' | 'Lefkosa-Weltew' | 'Magusa-Weltew' | 'Lefkosa-Lajivert';
type Difficulty = 'Easy' | 'Intermediate' | 'Hard';

/* ---------- Mock data ---------- */
type Installation = {
  id: string;             // installation number (shown as the name)
  order_id: string;       // for /app/orders/:id
  city: City;
  store: Exclude<Store, 'All Stores'>;
  date: string;           // ISO date (YYYY-MM-DD)
  difficulty: Difficulty;
  serviceAfter: boolean;
};

const MOCK_INSTALLATIONS: Installation[] = [
  { id: 'INS-001', order_id: '1001', city: 'Nicosia',  store: 'Girne-Lajivert', date: '2025-10-24', difficulty: 'Easy',          serviceAfter: true },
  { id: 'INS-002', order_id: '1002', city: 'Kyrenia',  store: 'Lefkosa-Weltew',   date: '2025-10-25', difficulty: 'Intermediate',  serviceAfter: false },
  { id: 'INS-003', order_id: '1003', city: 'Famagusta',store: 'Magusa-Weltew',  date: '2025-10-26', difficulty: 'Hard',         serviceAfter: true },
  { id: 'INS-004', order_id: '1004', city: 'Iskele',   store: 'Lefkosa-Lajivert',     date: '2025-10-27', difficulty: 'Intermediate',  serviceAfter: false },
  { id: 'INS-005', order_id: '1005', city: 'Nicosia',  store: 'Magusa-Weltew',   date: '2025-10-28', difficulty: 'Easy',          serviceAfter: true },
  { id: 'INS-006', order_id: '1006', city: 'Kyrenia',  store: 'Girne-Lajivert', date: '2025-10-29', difficulty: 'Hard',         serviceAfter: false },
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
  const [city, setCity] = useState<City>('All Cities');
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
      const matchCity = city === 'All Cities' ? true : ins.city === city;
      const matchStore = store === 'All Stores' ? true : ins.store === store;
      return matchDate && matchCity && matchStore;
    }).sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
  }, [startDate, endDate, city, store]);

  // --- Difficulty stats (based on filtered list) ---
const weight: Record<Difficulty, number> = { Easy: 0, Intermediate: 0.5, Hard: 1 };

let easyCount = 0, intermediateCount = 0, hardCount = 0, weightedSum = 0;
for (const ins of filtered) {
  if (ins.difficulty === 'Easy') easyCount++;
  else if (ins.difficulty === 'Intermediate') intermediateCount++;
  else hardCount++;
  weightedSum += weight[ins.difficulty];
}

const totalForDifficulty = filtered.length;
const avgDifficulty = totalForDifficulty ? (weightedSum / totalForDifficulty) * 100 : 0; // 0–100%
const avgMarkerLeft = `${Math.min(Math.max(avgDifficulty, 0), 100)}%`; // keep within bounds



// --- Service After Installation stats ---
const totalInstallations = filtered.length;
const serviceAfterCount = filtered.filter((ins) => ins.serviceAfter).length;


  // --- Statistics mock calculation ---
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
                <option value="All Cities">All Cities</option>
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
                <option>Girne-Lajivert</option>
                <option>Lefkosa-Weltew</option>
                <option>Lefkosa-Lajivert</option>
                <option>Magusa-Weltew</option>
                </select>
            </div>
            </div>
        </div>
        </div>

                {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Card 1 - Installation Success Rate */}
            <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Installations</h3>

            {/* Successful installations number + label */}
            <div className="flex flex-col">
                <div className="text-5xl font-semibold text-gray-900 leading-tight">
                {successfulInstallations}
                </div>
                <span className="text-sm text-gray-500 mt-1">
                Total Successful Installations
                </span>
            </div>

            {/* Divider line for clarity */}
            <div className="my-3 border-t border-gray-200" />

            {/* Percentage + label */}
            <div className="flex items-end gap-2">
                <div
                className={`text-4xl font-semibold leading-none ${
                    successRate >= 75
                    ? 'text-green-600'
                    : successRate >= 50
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
                >
                {successRate}%
                </div>
                <span className="text-sm text-gray-500 mb-1">Success rate</span>
            </div>
            </div>




 {/* Card 2 - Installation Difficulty Total */}
<div className="rounded-lg border bg-white p-4 sm:col-span-1">
  <h3 className="text-sm font-medium text-gray-700">Installation Difficulty Total</h3>

  {/* Counts */}
  <div className="mt-3 grid grid-cols-3 gap-2">
    <div className="rounded-md border p-2 text-center">
      <div className="text-xs font-medium text-gray-600">Easy</div>
      <div className="mt-1 text-2xl font-semibold text-green-600">{easyCount}</div>
    </div>
    <div className="rounded-md border p-2 text-center">
      <div className="text-xs font-medium text-gray-600">Intermediate</div>
      <div className="mt-1 text-2xl font-semibold text-yellow-500">{intermediateCount}</div>
    </div>
    <div className="rounded-md border p-2 text-center">
      <div className="text-xs font-medium text-gray-600">Hard</div>
      <div className="mt-1 text-2xl font-semibold text-red-600">{hardCount}</div>
    </div>
  </div>

  {/* Difficulty bar with percentage indicator */}
  <div className="mt-5 relative h-5 w-full rounded-full overflow-hidden">
    {/* Segments */}
    <div className="absolute inset-0 flex">
      <div className="flex-1 bg-green-500" title="Easy" />
      <div className="flex-1 bg-yellow-400" title="Intermediate" />
      <div className="flex-1 bg-red-500" title="Hard" />
    </div>

    {/* Average indicator */}
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-gray-900"
      style={{ left: avgMarkerLeft }}
      title={`Average: ${avgDifficulty.toFixed(0)}%`}
    />

    {/* Overlayed percentage text */}
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-sm font-medium text-white drop-shadow-sm">
        {avgDifficulty.toFixed(0)}%
      </span>
    </div>
  </div>
</div>

            {/* Card 3 - Service After Installation */}
            <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700">Service After Installation</h3>

            <div className="mt-2 text-3xl font-semibold text-gray-900">
                {totalInstallations} / {serviceAfterCount}
            </div>

            <p className="mt-1 text-xs text-gray-500">
                Total Installations / With Service After Installation
            </p>
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
