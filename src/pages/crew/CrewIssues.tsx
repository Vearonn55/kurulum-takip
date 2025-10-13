// src/pages/crew/CrewIssues.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  Clock,
  MessageSquareMore,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

/** ----------------------------- Types & mocks ----------------------------- */
type IssueStatus = 'open' | 'in_progress' | 'resolved';
type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
type IssueCategory = 'damage' | 'missing_parts' | 'scheduling' | 'other';

type Photo = { id: string; url: string; name?: string };
type IssueComment = { id: string; author: string; text: string; ts: string };

type CrewIssue = {
  id: string;
  title: string;
  description?: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  job_id?: string; // related installation id
  zone?: string;
  created_at: string;
  updated_at: string;
  photos: Photo[];
  comments: IssueComment[];
};

const STORAGE_KEY = 'crew_issues_v1';

function seedIssues(): CrewIssue[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const earlier = new Date(now.getTime() - 1000 * 60 * 60);

  return [
    {
      id: 'ISS-2001',
      title: 'Missing bolts for wardrobe',
      description: 'Wardrobe kit lacks 4x M6 bolts. Customer wants completion tomorrow.',
      category: 'missing_parts',
      severity: 'medium',
      status: 'open',
      job_id: 'inst-3001',
      zone: 'Nicosia',
      created_at: iso(earlier),
      updated_at: iso(earlier),
      photos: [],
      comments: [
        { id: 'c1', author: 'You', text: 'Confirmed missing from box B.', ts: iso(earlier) },
      ],
    },
    {
      id: 'ISS-2002',
      title: 'Table top scratch',
      description: 'Minor scratch visible under strong light. Customer accepted discount.',
      category: 'damage',
      severity: 'low',
      status: 'in_progress',
      job_id: 'inst-3002',
      zone: 'Famagusta',
      created_at: iso(now),
      updated_at: iso(now),
      photos: [],
      comments: [],
    },
    {
      id: 'ISS-2003',
      title: 'Customer unavailable',
      description: 'No answer at the door / phone. Neighbors confirm they left.',
      category: 'scheduling',
      severity: 'high',
      status: 'resolved',
      job_id: 'inst-3003',
      zone: 'Kyrenia',
      created_at: iso(now),
      updated_at: iso(now),
      photos: [],
      comments: [{ id: 'c2', author: 'You', text: 'Rescheduled for tomorrow 12:00', ts: iso(now) }],
    },
  ];
}

/** ----------------------------- Utilities ----------------------------- */
function loadIssues(): CrewIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedIssues();
    const data = JSON.parse(raw) as CrewIssue[];
    return Array.isArray(data) ? data : seedIssues();
  } catch {
    return seedIssues();
  }
}

function saveIssues(issues: CrewIssue[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch {
    /* noop */
  }
}

function chipColor(sev: IssueSeverity) {
  switch (sev) {
    case 'critical':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'high':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'medium':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

function statusColor(st: IssueStatus) {
  switch (st) {
    case 'open':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}

function fmtWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
}

/** ----------------------------- Component ----------------------------- */
export default function CrewIssues() {
  const [issues, setIssues] = useState<CrewIssue[]>(() => loadIssues());
  const [tab, setTab] = useState<'all' | IssueStatus>('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);

  // New issue form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('missing_parts');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [jobId, setJobId] = useState('');
  const [desc, setDesc] = useState('');
  const [formPhotos, setFormPhotos] = useState<Photo[]>([]);

  // Persist whenever issues change
  useEffect(() => {
    saveIssues(issues);
  }, [issues]);

  // Derived list
  const filtered = useMemo(() => {
    let list = [...issues];
    if (tab !== 'all') {
      list = list.filter((i) => i.status === tab);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          (i.description || '').toLowerCase().includes(s) ||
          (i.job_id || '').toLowerCase().includes(s) ||
          (i.zone || '').toLowerCase().includes(s)
      );
    }
    // sort newest first
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list;
  }, [issues, tab, q]);

  /** ----------------------------- Form handlers ----------------------------- */
  function fileToPhoto(file: File): Promise<Photo> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          url: String(reader.result),
          name: file.name,
        });
      reader.readAsDataURL(file);
    });
  }

  async function onFormPhotoPick(f?: File) {
    if (!f) return;
    const ph = await fileToPhoto(f);
    setFormPhotos((p) => [...p, ph]);
    toast.success('Photo attached');
  }

  function resetForm() {
    setTitle('');
    setCategory('missing_parts');
    setSeverity('medium');
    setJobId('');
    setDesc('');
    setFormPhotos([]);
  }

  function submitIssue() {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    const now = new Date().toISOString();
    const newIssue: CrewIssue = {
      id: `ISS-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: title.trim(),
      description: desc.trim() || undefined,
      category,
      severity,
      status: 'open',
      job_id: jobId || undefined,
      zone: undefined,
      created_at: now,
      updated_at: now,
      photos: formPhotos,
      comments: [],
    };
    setIssues((prev) => [newIssue, ...prev]);
    toast.success('Issue reported');
    resetForm();
    setShowForm(false);
  }

  /** ----------------------------- Item handlers ----------------------------- */
  function addComment(id: string, text: string) {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              comments: [
                ...i.comments,
                { id: `${Date.now()}`, author: 'You', text, ts: new Date().toISOString() },
              ],
              updated_at: new Date().toISOString(),
            }
          : i
      )
    );
  }

  function addPhoto(id: string, file: File) {
    fileToPhoto(file).then((ph) => {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, photos: [...i.photos, ph], updated_at: new Date().toISOString() }
            : i
        )
      );
      toast.success('Photo added');
    });
  }

  function setStatus(id: string, status: IssueStatus) {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, updated_at: new Date().toISOString() } : i))
    );
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  }

  /** ----------------------------- Render ----------------------------- */
  return (
    <div className="mx-auto w-full max-w-screen-sm">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary-600" />
            <div className="text-lg font-semibold text-gray-900">Issues</div>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus className="mr-1 h-4 w-4" />
            Report
          </button>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-2 pb-2">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((t) => {
            const count = issues.filter((i) => (t === 'all' ? true : i.status === t)).length;
            return (
              <button
                key={t}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1 text-xs',
                  tab === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-gray-50'
                )}
                onClick={() => setTab(t)}
              >
                {t.replace('_', ' ')} <span className="ml-1 rounded bg-black/5 px-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search title, job id, zone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* New Issue form */}
      {showForm && (
        <section className="m-3 rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-900">New issue</div>
          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Title</label>
              <input
                className="input w-full"
                placeholder="Short summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Category</label>
                <select
                  className="input w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                >
                  <option value="missing_parts">Missing parts</option>
                  <option value="damage">Damage</option>
                  <option value="scheduling">Scheduling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Severity</label>
                <select
                  className="input w-full"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">Related Job (optional)</label>
              <input
                className="input w-full"
                placeholder="e.g. inst-3001"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">Description</label>
              <textarea
                className="input w-full"
                rows={3}
                placeholder="Describe the problem…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">Photos</label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                  <Paperclip className="h-4 w-4" />
                  Attach
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFormPhotoPick(f);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
                {formPhotos.length > 0 && (
                  <span className="text-xs text-gray-500">{formPhotos.length} photo(s)</span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {formPhotos.map((p) => (
                  <div key={p.id} className="relative overflow-hidden rounded-md border">
                    <img src={p.url} className="h-20 w-full object-cover" />
                  </div>
                ))}
                {formPhotos.length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={submitIssue}
                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Submit
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* List */}
      <main className="space-y-2 p-3">
        {filtered.map((it) => (
          <IssueCard
            key={it.id}
            issue={it}
            onAddComment={(text) => addComment(it.id, text)}
            onAddPhoto={(file) => addPhoto(it.id, file)}
            onSetStatus={(st) => setStatus(it.id, st)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
            No issues to show.
          </div>
        )}
      </main>
    </div>
  );
}

/** ----------------------------- Card component ----------------------------- */
function IssueCard({
  issue,
  onAddComment,
  onAddPhoto,
  onSetStatus,
}: {
  issue: CrewIssue;
  onAddComment: (text: string) => void;
  onAddPhoto: (file: File) => void;
  onSetStatus: (s: IssueStatus) => void;
}) {
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-primary-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">{issue.title}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]', chipColor(issue.severity))}>
                  {issue.severity}
                </span>
                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]', statusColor(issue.status))}>
                  {issue.status.replace('_', ' ')}
                </span>
                {issue.job_id && (
                  <Link to={`/crew/jobs/${issue.job_id}`} className="text-xs text-primary-700 hover:underline">
                    Job {issue.job_id}
                  </Link>
                )}
              </div>
            </div>
            <button
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
              onClick={() => setMenuOpen((s) => !s)}
            >
              Status <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>

          {menuOpen && (
            <div className="mt-2 flex gap-1">
              {(['open', 'in_progress', 'resolved'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSetStatus(s);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs',
                    s === issue.status ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {issue.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{issue.description}</p>
          )}

          {/* Photos */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {issue.photos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-md border">
                <img src={p.url} alt={p.name || 'photo'} className="h-20 w-full object-cover" />
              </div>
            ))}
            {issue.photos.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-gray-400">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Meta & comments */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {fmtWhen(issue.created_at)}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquareMore className="h-3.5 w-3.5" />
              {issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Actions: add photo + comment */}
          <div className="mt-3 flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs hover:bg-gray-50">
              <Paperclip className="h-3.5 w-3.5" />
              Add photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onAddPhoto(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>

            <input
              className="input h-8 flex-1"
              placeholder="Write a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  onAddComment(comment.trim());
                  setComment('');
                }
              }}
            />
            <button
              className="rounded-md border px-2 py-1.5 text-xs hover:bg-gray-50"
              onClick={() => {
                if (!comment.trim()) return;
                onAddComment(comment.trim());
                setComment('');
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
Tailwind helpers referenced:
- .input => your app’s input control (border, rounded, focus)
------------------------------------------------------------ */
