// src/pages/admin/IntegrationsPage.tsx
import { useMemo, useState } from 'react';
import {
  Plus,
  Webhook,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
  Clock,
  CheckCheck,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

/* ---------------- Types (mock-only page) ---------------- */
type WebhookRow = {
  id: string;
  name: string;
  target_url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type WebhookEventRow = {
  id: string;
  event: string;
  webhook_id: string;
  delivered: boolean;
  attempt_count: number;
  last_attempt_at?: string;
  created_at: string;
  payload: Record<string, any>;
};

/* ---------------- Mock data ---------------- */
const ALL_EVENTS = [
  'installation.created',
  'installation.accepted',
  'installation.started',
  'installation.completed',
  'installation.failed',
  'picklist.created',
  'picklist.staged',
  'picklist.loaded',
  'order.imported',
];

function mockWebhooks(): WebhookRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'wh_001',
      name: 'Prod ERP Bridge',
      target_url: 'https://erp.example.com/hooks/installops',
      secret: 'whsec_prod_7d7c3e72f9',
      events: ['installation.completed', 'installation.failed', 'order.imported'],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'wh_002',
      name: 'Analytics (Segment)',
      target_url: 'https://api.segment.io/v1/webhook',
      secret: 'whsec_seg_10a0e812e1',
      events: ['installation.started', 'installation.completed', 'picklist.loaded'],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];
}

function mockEvents(): WebhookEventRow[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const ago = (min: number) => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() - min);
    return d;
  };
  return [
    {
      id: 'whe_101',
      event: 'installation.completed',
      webhook_id: 'wh_001',
      delivered: true,
      attempt_count: 1,
      last_attempt_at: iso(ago(2)),
      created_at: iso(ago(2)),
      payload: { installation_id: 'inst_3001', store_id: 'store_1', duration_min: 118 },
    },
    {
      id: 'whe_102',
      event: 'installation.failed',
      webhook_id: 'wh_001',
      delivered: false,
      attempt_count: 2,
      last_attempt_at: iso(ago(8)),
      created_at: iso(ago(9)),
      payload: { installation_id: 'inst_3004', reason: 'MISSING_PARTS' },
    },
    {
      id: 'whe_103',
      event: 'picklist.loaded',
      webhook_id: 'wh_002',
      delivered: true,
      attempt_count: 1,
      last_attempt_at: iso(ago(15)),
      created_at: iso(ago(16)),
      payload: { picklist_id: 'PL-0092', warehouse: 'WH_Nicosia' },
    },
  ];
}

/* ---------------- Component ---------------- */
export default function IntegrationsPage() {
  // data
  const [webhooks, setWebhooks] = useState<WebhookRow[]>(() => mockWebhooks());
  const [events, setEvents] = useState<WebhookEventRow[]>(() => mockEvents());

  // ui state
  const [tab, setTab] = useState<'webhooks' | 'events'>('webhooks');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'failed'>('all');

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ name: string; url: string; secret: string; events: string[] }>({
    name: '',
    url: '',
    secret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
    events: ['installation.completed'],
  });
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const filteredWebhooks = useMemo(() => {
    let list = [...webhooks];
    if (q.trim()) {
      const s = q.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.id.toLowerCase().includes(s) ||
          w.name.toLowerCase().includes(s) ||
          w.target_url.toLowerCase().includes(s) ||
          w.events.some((e) => e.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [webhooks, q]);

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (q.trim()) {
      const s = q.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.id.toLowerCase().includes(s) ||
          e.event.toLowerCase().includes(s) ||
          e.webhook_id.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      const wantDelivered = statusFilter === 'delivered';
      list = list.filter((e) => e.delivered === wantDelivered);
    }
    // newest first
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [events, q, statusFilter]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const mask = (s: string) => (s.length <= 6 ? '••••••' : `${s.slice(0, 5)}••••${s.slice(-2)}`);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.url.trim() || form.events.length === 0) {
      toast.error('Please fill name, URL and select at least one event');
      return;
    }
    setCreating(true);
    // simulate latency
    setTimeout(() => {
      const now = new Date().toISOString();
      const row: WebhookRow = {
        id: `wh_${Math.random().toString(36).slice(2, 7)}`,
        name: form.name.trim(),
        target_url: form.url.trim(),
        secret: form.secret,
        events: [...form.events],
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      setWebhooks((prev) => [...prev, row]);
      setOpenCreate(false);
      setCreating(false);
      setForm({
        name: '',
        url: '',
        secret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
        events: ['installation.completed'],
      });
      toast.success('Webhook created');
    }, 600);
  };

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success('Webhook deleted');
  };

  const handleSendTest = (wh: WebhookRow) => {
    toast('Sending test delivery…', { icon: '📮' });
    setTimeout(() => {
      const ok = Math.random() > 0.25;
      const now = new Date().toISOString();
      setEvents((prev) => [
        {
          id: `whe_${Math.random().toString(36).slice(2, 7)}`,
          event: 'installation.completed',
          webhook_id: wh.id,
          delivered: ok,
          attempt_count: ok ? 1 : 2,
          last_attempt_at: now,
          created_at: now,
          payload: { test: true, webhook: wh.id, ts: now },
        },
        ...prev,
      ]);
      toast[ok ? 'success' : 'error'](ok ? 'Test delivered' : 'Delivery failed');
      setTab('events');
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage webhooks and see recent delivery events.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
              tab === 'webhooks' ? 'bg-gray-100' : 'hover:bg-gray-50'
            )}
            onClick={() => setTab('webhooks')}
            aria-label="Webhooks"
          >
            <Webhook className="h-4 w-4" /> Webhooks
          </button>
          <button
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
              tab === 'events' ? 'bg-gray-100' : 'hover:bg-gray-50'
            )}
            onClick={() => setTab('events')}
            aria-label="Events"
          >
            <Clock className="h-4 w-4" /> Events
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="input w-[260px] pl-8"
            placeholder={tab === 'webhooks' ? 'Search name, url, event…' : 'Search id, event, webhook…'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {tab === 'events' && (
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All statuses</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        )}

        <div className="ml-auto flex items-center gap-2">
          {tab === 'webhooks' && (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
              onClick={() => setOpenCreate(true)}
            >
              <Plus className="h-4 w-4" /> New Webhook
            </button>
          )}
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              // mock "refresh"
              toast.success('Refreshed');
            }}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'webhooks' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredWebhooks.map((wh) => (
            <div key={wh.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-primary-600" />
                    <h3 className="text-sm font-semibold text-gray-900">{wh.name}</h3>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="truncate">{wh.target_url}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Events:{' '}
                    <span className="font-mono">
                      {wh.events.slice(0, 3).join(', ')}
                      {wh.events.length > 3 ? ` +${wh.events.length - 3}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      wh.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    )}
                  >
                    {wh.is_active ? (
                      <>
                        <CheckCheck className="mr-1 h-3.5 w-3.5" /> active
                      </>
                    ) : (
                      'inactive'
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Secret:</span>
                <span className="font-mono text-xs text-gray-800">
                  {reveal[wh.id] ? wh.secret : mask(wh.secret)}
                </span>
                <button
                  className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={() =>
                    setReveal((r) => ({ ...r, [wh.id]: !r[wh.id] }))
                  }
                >
                  {reveal[wh.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={() => copy(wh.secret)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() => handleSendTest(wh)}
                  >
                    <Send className="h-3.5 w-3.5" /> Send test
                  </button>
                  <button
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(wh.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredWebhooks.length === 0 && (
            <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
              No webhooks found.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Time</Th>
                <Th>Event</Th>
                <Th>Webhook</Th>
                <Th>Status</Th>
                <Th className="text-right">Attempts</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEvents.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <Td>{new Date(e.created_at).toLocaleString()}</Td>
                  <Td className="font-mono">{e.event}</Td>
                  <Td className="font-mono">{e.webhook_id}</Td>
                  <Td>
                    {e.delivered ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        failed
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">{e.attempt_count}</Td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                    No events found.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Webhook Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenCreate(false)} />
          <div className="relative z-50 w-full sm:max-w-xl rounded-lg bg-white shadow-lg">
            <div className="border-b px-4 py-3">
              <div className="text-lg font-semibold">Create Webhook</div>
              <div className="text-xs text-gray-500">Define a target URL, secret and subscribed events.</div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input
                  className="input mt-1 w-full"
                  placeholder="ERP Bridge / BI Sink / Slack Bot"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Target URL</label>
                <input
                  className="input mt-1 w-full"
                  placeholder="https://example.com/webhooks/installops"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Secret</label>
                <div className="flex items-center gap-2">
                  <input
                    className="input mt-1 w-full font-mono"
                    value={form.secret}
                    onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                  />
                  <button
                    className="mt-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        secret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
                      }))
                    }
                  >
                    Random
                  </button>
                  <button
                    className="mt-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() => copy(form.secret)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Events</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ALL_EVENTS.map((ev) => {
                    const checked = form.events.includes(ev);
                    return (
                      <label key={ev} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={(e) => {
                            setForm((f) => {
                              const next = new Set(f.events);
                              if (e.target.checked) next.add(ev);
                              else next.delete(ev);
                              return { ...f, events: Array.from(next) };
                            });
                          }}
                        />
                        <span className="font-mono">{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setOpenCreate(false)}>
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating && <RefreshCw className="h-4 w-4 animate-spin" />}
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Small helpers ---------------- */
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-medium uppercase text-gray-500', className)}>{children}</th>
  );
}
function Td({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td className={cn('px-4 py-3 text-sm text-gray-700', className)} colSpan={colSpan}>{children}</td>;
}
