// src/pages/crew/CrewJobs.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* --------------------------- Mock types & data --------------------------- */
type CrewJobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'failed';
type Zone = 'Nicosia' | 'Famagusta' | 'Kyrenia' | 'Morphou' | 'Iskele';

type CrewJob = {
  id: string;
  order_id: string;
  start: string; // ISO
  end: string;   // ISO
  customer: string;
  address: string;
  zone: Zone;
  status: CrewJobStatus;
  notes?: string;
};

function startOfWeek(d = new Date(), weekStartsOn: 0 | 1 = 1) {
  // 0 = Sunday, 1 = Monday
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  res.setDate(d.getDate() - diff);
  return res;
}
function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function setHM(base: Date, h: number, m = 0) {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function jobsForDate(day: Date): CrewJob[] {
  // Deterministic-ish variation by weekday so the list looks real.
  // Make a seed based on yyyy-mm-dd
  const key = day.toISOString().slice(0, 10);
  const wd = day.getDay(); // 0..6

  // Helper to make a job
  const J = (
    idx: number,
    h1: number,
    m1: number,
    h2: number,
    m2: number,
    who: string,
    address: string,
    zone: Zone,
    status: CrewJobStatus,
    note?: string
  ): CrewJob => {
    const s = setHM(day, h1, m1).toISOString();
    const e = setHM(day, h2, m2).toISOString();
    return {
      id: `inst-${key.replace(/-/g, '')}-${idx}`,
      order_id: `ORD-${(10000 + wd * 50 + idx * 7).toString()}`,
      start: s,
      end: e,
      customer: who,
      address,
      zone,
      status,
      notes: note,
    };
  };

  // Vary # of jobs by weekday
  // Mon/Tue/Thu/Fri busy; Wed moderate; Sat light; Sun sometimes empty
  const sets: Record<number, CrewJob[]> = {
    1: [ // Mon
      J(1, 9, 0, 10, 30, 'Ali Demir', 'Atatürk Cad. No:18, Nicosia', 'Nicosia', 'in_progress', 'Wardrobe + 2 chairs'),
      J(2, 12, 0, 13, 30, 'Selin Kaya', 'Ece Sk. 12, Famagusta', 'Famagusta', 'accepted', 'Kitchen island'),
      J(3, 15, 0, 16, 30, 'Mete Aydın', 'Zeytinlik Mah., Kyrenia', 'Kyrenia', 'pending', 'Sofa & coffee table'),
    ],
    2: [ // Tue
      J(1, 9, 30, 11, 0, 'Deniz Arslan', 'Dr. Fazıl Küçük Bul., Nicosia', 'Nicosia', 'accepted'),
      J(2, 13, 0, 14, 0, 'Can Bora', 'İskele Sahil Yolu, Iskele', 'Iskele', 'pending'),
      J(3, 15, 30, 17, 0, 'Ege Öztürk', 'Gazimağusa Merkez', 'Famagusta', 'completed'),
    ],
    3: [ // Wed
      J(1, 10, 0, 11, 30, 'Elif Kar', 'Girne Merkez', 'Kyrenia', 'in_progress'),
      J(2, 14, 0, 15, 0, 'Bora Kılıç', 'Güzelyurt', 'Morphou', 'accepted'),
    ],
    4: [ // Thu
      J(1, 9, 0, 10, 0, 'Seda Şen', 'Nicosia', 'Nicosia', 'accepted'),
      J(2, 11, 30, 13, 0, 'Mert Ak', 'Famagusta', 'Famagusta', 'in_progress'),
      J(3, 15, 0, 16, 0, 'Aylin Öz', 'Kyrenia', 'Kyrenia', 'pending'),
      J(4, 17, 0, 18, 0, 'Cem Yiğit', 'Iskele', 'Iskele', 'failed'),
    ],
    5: [ // Fri
      J(1, 9, 0, 10, 30, 'Tuğçe Şen', 'Nicosia', 'Nicosia', 'accepted'),
      J(2, 12, 0, 13, 0, 'Burak U.', 'Kyrenia', 'Kyrenia', 'pending'),
      J(3, 14, 30, 16, 0, 'Selçuk E.', 'Famagusta', 'Famagusta', 'completed'),
    ],
    6: [ // Sat
      J(1, 10, 0, 11, 0, 'Cenk D.', 'Morphou', 'Morphou', 'accepted'),
      J(2, 12, 30, 13, 30, 'Oya B.', 'Nicosia', 'Nicosia', 'pending'),
    ],
    0: [ // Sun
      // sometimes off day: 1 light job
      J(1, 11, 0, 12, 0, 'Emir S.', 'Kyrenia', 'Kyrenia', 'pending', 'Small coffee table'),
    ],
  };

  // clone to avoid shared refs
  return (sets[wd] || []).map((j) => ({ ...j }));
}

/* --------------------------- Helpers --------------------------- */
function fmtTimeRange(sISO: string, eISO: string) {
  const s = new Date(sISO);
  const e = new Date(eISO);
  const f = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${f(s)}–${f(e)}`;
}
function statusTone(s: CrewJobStatus) {
  switch (s) {
    case 'completed': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'in_progress': return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'accepted': return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'failed': return 'border-red-200 bg-red-50 text-red-700';
    default: return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}
function statusLabel(s: CrewJobStatus) {
  switch (s) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'In progress';
    case 'accepted': return 'Accepted';
    case 'failed': return 'Failed';
    default: return 'Pending';
  }
}

/* --------------------------- Component --------------------------- */
export default function CrewJobs() {
  const navigate = useNavigate();

  // Build current week (Mon–Sun)
  const weekStart = useMemo(() => startOfWeek(new Date(), 1), []);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Default selected day: today
  const todayKey = new Date().toDateString();
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  // UI state
  const [q, setQ] = useState('');

  // Active day’s jobs
  const activeDate = useMemo(
    () => weekDays.find((d) => d.toDateString() === selectedKey) || weekDays[0],
    [weekDays, selectedKey]
  );
  const raw = useMemo(() => jobsForDate(activeDate), [activeDate]);

  const jobs = useMemo(() => {
    let list = raw.map((j) => ({ ...j }));
    // search
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (j) =>
          j.customer.toLowerCase().includes(s) ||
          j.order_id.toLowerCase().includes(s) ||
          j.address.toLowerCase().includes(s) ||
          j.zone.toLowerCase().includes(s)
      );
    }
    // sort by start asc
    list.sort((a, b) => a.start.localeCompare(b.start));
    return list;
  }, [raw, q]);

  return (
    <div className="mx-auto w-full max-w-screen-sm">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">Jobs</div>
            <div className="inline-flex items-center text-xs text-gray-500">
              <CalendarDays className="mr-1 h-3.5 w-3.5" />
              Week of {weekStart.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex flex-wrap justify-center gap-1.5 overflow-x-hidden px-2 pb-2">
          {weekDays.map((d) => {
            const isToday = d.toDateString() === new Date().toDateString();
            const isActive = d.toDateString() === selectedKey;
            return (
              <button
                key={d.toDateString()}
                className={cn(
                  'min-w-[52px] rounded-lg border px-1 py-1 text-center',
                  isActive ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-gray-50'
                )}
                onClick={() => setSelectedKey(d.toDateString())}
              >
                <div className="text-[10px] uppercase tracking-wide">
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className={cn('text-xs font-semibold', isActive ? 'text-white' : 'text-gray-900')}>
                  {d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </header>

      {/* List */}
      <main className="space-y-2 p-3">
        {jobs.map((j) => {
          const s = j.status;
          return (
            <div key={j.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <button
                onClick={() => navigate(`/crew/jobs/${j.id}`)}
                className="flex w-full items-start justify-between text-left"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-lg font-semibold text-gray-900">{j.customer}</div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                        statusTone(s)
                      )}
                    >
                      {statusLabel(s)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span>{fmtTimeRange(j.start, j.end)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {j.address} • {j.zone}
                    </span>
                  </div>
                  {j.notes && <div className="mt-1 text-xs text-gray-500 line-clamp-2">{j.notes}</div>}
                </div>
                <ChevronRight className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
              </button>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
            No jobs for this day.
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------------
Utility classes used:
- .input      => your app’s input style
- .btn-soft   => inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 active:scale-[0.99]
--------------------------------------------------------------------------- */
