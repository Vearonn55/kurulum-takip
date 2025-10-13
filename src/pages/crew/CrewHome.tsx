// src/pages/crew/CrewHome.tsx
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-simple';
import { cn } from '../../lib/utils';

/** ---------------------- Mock data (no API yet) ---------------------- */
type CrewJobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'failed';

type CrewJob = {
  id: string;
  order_id: string;
  start: string;     // ISO
  end: string;       // ISO
  customer: string;
  phone?: string;
  address: string;
  zone: 'Nicosia' | 'Famagusta' | 'Kyrenia' | 'Morphou' | 'Iskele';
  status: CrewJobStatus;
  notes?: string;
};

function mockTodayJobs(): CrewJob[] {
  const day = new Date();
  const todayISO = (h: number, m = 0) => {
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: 'inst-3001',
      order_id: 'ORD-10291',
      start: todayISO(9),
      end: todayISO(10, 30),
      customer: 'Ali Demir',
      phone: '0533 555 12 34',
      address: 'Atatürk Cad. No:18, Nicosia',
      zone: 'Nicosia',
      status: 'in_progress',
      notes: 'Flat pack wardrobe + 2 chairs',
    },
    {
      id: 'inst-3002',
      order_id: 'ORD-10295',
      start: todayISO(12),
      end: todayISO(13, 30),
      customer: 'Selin Kaya',
      address: 'Ece Sk. 12, Famagusta',
      zone: 'Famagusta',
      status: 'accepted',
      notes: 'Kitchen island assembly',
    },
    {
      id: 'inst-3003',
      order_id: 'ORD-10302',
      start: todayISO(15),
      end: todayISO(16, 30),
      customer: 'Mete Aydın',
      address: 'Zeytinlik Mah., Kyrenia',
      zone: 'Kyrenia',
      status: 'pending',
      notes: 'Sofa & coffee table',
    },
  ];
}

/** ---------------------- Small helpers ---------------------- */
function formatTimeRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(s)}–${fmt(e)}`;
}

function statusStyle(s: CrewJobStatus) {
  switch (s) {
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'accepted':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'failed':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}

function statusLabel(s: CrewJobStatus) {
  switch (s) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    case 'accepted':
      return 'Accepted';
    case 'failed':
      return 'Failed';
    default:
      return 'Pending';
  }
}

/** ---------------------- Component ---------------------- */
export default function CrewHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const jobs = useMemo(() => mockTodayJobs(), []);

  const inProgress = jobs.filter((j) => j.status === 'in_progress').length;
  const remaining = jobs.filter((j) => j.status === 'accepted' || j.status === 'pending').length;
  const completed = jobs.filter((j) => j.status === 'completed').length;

  const firstActionable = jobs.find((j) => j.status === 'accepted' || j.status === 'pending');

  return (
    <div className="mx-auto h-full w-full max-w-screen-sm">
      {/* Greeting / header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Welcome</div>
              <div className="text-lg font-semibold text-gray-900">{user?.name || 'Crew Member'}</div>
            </div>
            <Link
              to="/crew/jobs"
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Jobs
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-4 p-4">
        {/* Today quick stats */}
        <section className="grid grid-cols-3 gap-2">
          <Stat
            label="In Progress"
            value={inProgress}
            tone="blue"
            icon={<Loader2 className="h-4 w-4" />}
          />
          <Stat
            label="Remaining"
            value={remaining}
            tone="amber"
            icon={<Clock className="h-4 w-4" />}
          />
          <Stat
            label="Done"
            value={completed}
            tone="emerald"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </section>

        {/* Next action card */}
        {firstActionable && (
          <section className="rounded-xl border bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-900">Next job</h3>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                  statusStyle(firstActionable.status)
                )}
              >
                {statusLabel(firstActionable.status)}
              </span>
            </div>

            <JobCompact job={firstActionable} />

            <div className="mt-3 grid grid-cols-3 gap-2">
              <Link
                to={`/crew/jobs/${firstActionable.id}`}
                className="btn-soft"
              >
                Open
              </Link>
              <Link to={`/crew/jobs/${firstActionable.id}/checklist`} className="btn-soft">
                <ClipboardList className="mr-1 h-4 w-4" />
                Checklist
              </Link>
              <Link to={`/crew/jobs/${firstActionable.id}/capture`} className="btn-soft">
                <Camera className="mr-1 h-4 w-4" />
                Photos
              </Link>
            </div>
          </section>
        )}

        {/* Today’s schedule (mobile friendly list) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Today’s schedule</h3>
            <div className="text-xs text-gray-500 inline-flex items-center">
              <CalendarDays className="mr-1 h-3.5 w-3.5" />
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => navigate(`/crew/jobs/${job.id}`)}
              className="w-full rounded-lg border bg-white p-3 text-left shadow-sm active:scale-[0.99] transition"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900">{job.customer}</div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        statusStyle(job.status)
                      )}
                    >
                      {statusLabel(job.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimeRange(job.start, job.end)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{job.address} • {job.zone}</span>
                  </div>
                  {job.notes && (
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {job.notes}
                    </div>
                  )}
                </div>
                <ChevronRight className="ml-2 h-5 w-5 text-gray-400" />
              </div>
            </button>
          ))}
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-3 gap-2">
          <Link to="/crew/jobs" className="quick-tile">
            <ClipboardList className="h-5 w-5" />
            <span className="mt-1 text-xs">Jobs</span>
          </Link>
          <Link to="/crew/jobs/inst-3001/capture" className="quick-tile">
            <Camera className="h-5 w-5" />
            <span className="mt-1 text-xs">Capture</span>
          </Link>
          <Link to="/crew/issues" className="quick-tile">
            <AlertTriangle className="h-5 w-5" />
            <span className="mt-1 text-xs">Issues</span>
          </Link>
        </section>
      </main>
    </div>
  );
}

/** ---------------------- UI bits ---------------------- */
function Stat({
  label,
  value,
  icon,
  tone, // 'blue' | 'amber' | 'emerald'
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'emerald';
}) {
  const toneRing =
    tone === 'blue'
      ? 'bg-blue-100 text-blue-700'
      : tone === 'amber'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', toneRing)}>
          {icon}
        </div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

function JobCompact({ job }: { job: { id: string; order_id: string; start: string; end: string; customer: string; address: string; zone: string } }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <div className="text-sm font-medium text-gray-900">{job.customer}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatTimeRange(job.start, job.end)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate">{job.address} • {job.zone}</span>
      </div>
      <div className="mt-1 text-[11px] text-gray-500">Order: {job.order_id}</div>
    </div>
  );
}

/** ---------------------- Lightweight utility classes ----------------------
 * These rely on your Tailwind setup. If you don’t have `.btn-soft` or `.quick-tile`,
 * they’re included here as composition helpers.
 */
declare module 'react' {
  // allow className on ReactNode used above; not strictly necessary but keeps TS calm in some setups
  interface Attributes {
    className?: string;
  }
}

// Soft button style for compact actions
// Add to globals if you prefer; kept inline for drop-in ease
// .btn-soft could also be a component; using utility classes directly here:
const _noop = undefined;
// tailwind helpers via @apply (documented only)
// .btn-soft { @apply inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50; }
// .quick-tile { @apply flex flex-col items-center justify-center rounded-xl border bg-white p-3 text-gray-700 shadow-sm active:scale-[0.99] hover:bg-gray-50; }
