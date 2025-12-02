// src/pages/crew/CrewChecklist.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { cn } from '../../lib/utils';
import { isAxiosError } from '../../api/http';
import {
  updateInstallationStatus,
  type InstallStatus,
} from '../../api/installations';

/* --------------------------- Mock template & helpers --------------------------- */
type ItemType = 'boolean' | 'text' | 'number' | 'photo';

type ChecklistItem = {
  id: string;
  label: string;
  type: ItemType;
  required: boolean;
  hint?: string;
};

type ChecklistTemplate = {
  id: string;
  name: string;
  version: string;
  items: ChecklistItem[];
};

// Base template: only the two main cards
function mockTemplate(): ChecklistTemplate {
  return {
    id: 'tmpl_basic_1',
    name: 'Standard Install Handover',
    version: '1.0.0',
    items: [
      {
        id: 'arrived_on_time',
        label: 'Arrived on time',
        type: 'boolean',
        required: false,
      },
      {
        id: 'customer_notes',
        label: 'Customer notes',
        type: 'text',
        required: false,
        hint: 'Anything the customer requested',
      },
    ],
  };
}

function storageKey(jobId: string) {
  return `crew_checklist_${jobId}`;
}

type PhotoValue = { id: string; url: string; name?: string };
type ItemValue = boolean | string | number | PhotoValue[];

type Values = Record<string, ItemValue | undefined>;

/* --------------------------------- Component --------------------------------- */
export default function CrewChecklist() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const template = useMemo(() => mockTemplate(), []);
  const [values, setValues] = useState<Values>({});
  const [submitting, setSubmitting] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    if (!jobId) return;
    try {
      const raw = localStorage.getItem(storageKey(jobId));
      if (raw) {
        const parsed = JSON.parse(raw) as Values;
        setValues(sanitizeValues(template, parsed));
      }
    } catch {
      /* ignore */
    }
  }, [jobId, template]);

  // Autosave
  useEffect(() => {
    if (!jobId) return;
    try {
      localStorage.setItem(storageKey(jobId), JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, jobId]);

  // progress calc (kept for future, not shown in header)
  const { completedCount, requiredCount } = useMemo(() => {
    let comp = 0;
    let req = 0;
    for (const it of template.items) {
      if (it.required) req += 1;
      const v = values[it.id];
      const ok = isFilled(it, v);
      if (ok) comp += 1;
    }
    return { completedCount: comp, requiredCount: req };
  }, [template.items, values]);

  const allRequiredOk = useMemo(
    () =>
      template.items
        .filter((i) => i.required)
        .every((i) => isFilled(i, values[i.id])),
    [template.items, values]
  );

  function update(id: string, v: ItemValue | undefined) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function clearDraft() {
    if (!jobId) return;
    localStorage.removeItem(storageKey(jobId));
    setValues({});
    toast('Draft cleared');
  }

  // New outcome states
  const installStatus = values['install_status'] as 'successful' | 'failed' | undefined;
  const handoverDocs = values['handover_docs'] as boolean | undefined;
  const failureReason = (values['failure_reason'] as string | undefined) ?? '';

  // New “successful” extras
  const paymentNotes = (values['payment_notes'] as string | undefined) ?? '';
  const googleRecoGiven = values['google_reco_given'] as boolean | undefined;

  // Map UI outcome → backend InstallStatus
  function mapInstallStatusForApi(
    status: 'successful' | 'failed'
  ): InstallStatus {
    return status === 'successful' ? 'completed' : 'failed';
  }

  async function onSubmit() {
    // Only template "required" are validated; outcome cards are optional
    if (!allRequiredOk) {
      toast.error('Please complete all required items');
      return;
    }
    if (!jobId) {
      toast.error('Missing job ID');
      return;
    }

    setSubmitting(true);
    try {
      // For now the only backend integration from this page:
      // - Installation result → /installations/{id}/status
      if (installStatus === 'successful' || installStatus === 'failed') {
        const apiStatus = mapInstallStatusForApi(installStatus);
        await updateInstallationStatus(jobId, { status: apiStatus });
      }

      // NOTE: These are still local-only (NOT sent to backend):
      // - arrived_on_time (boolean)
      // - customer_notes (text)
      // - handover_docs
      // - payment_notes
      // - failure_reason
      // - google_reco_given
      // To persist them, we need real ChecklistItem records (UUIDs) and an
      // installation→template link, otherwise item_id will not match backend.

      toast.success('Checklist submitted');

      // Clear local draft after successful submit
      localStorage.removeItem(storageKey(jobId));

      navigate(`/crew/jobs/${jobId}`);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to submit checklist';
        toast.error(msg);
      } else {
        toast.error('Failed to submit checklist');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-screen-sm">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-3 px-3 py-2">
          <button className="rounded-md p-1 hover:bg-gray-50" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              Installation Checklist
            </div>
            <div className="text-[11px] text-gray-500">
              {template.name} • v{template.version}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-3 p-3 pb-24">
        {/* Base cards from template */}
        {template.items.map((item) => {
          const v = values[item.id];
          return (
            <section key={item.id} className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {item.label}{' '}
                    {item.required && (
                      <span className="text-xs font-normal text-rose-600">*</span>
                    )}
                  </div>
                  {item.hint && (
                    <div className="mt-0.5 text-xs text-gray-500">{item.hint}</div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                {item.type === 'boolean' && (
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={item.id}
                        checked={v === true}
                        onChange={() => update(item.id, true)}
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={item.id}
                        checked={v === false}
                        onChange={() => update(item.id, false)}
                      />
                      No
                    </label>
                  </div>
                )}

                {item.type === 'text' && (
                  <div className="space-y-2">
                    {/* Use textarea (compact notebox style) */}
                    <textarea
                      className="input w-full min-h-[72px]"
                      placeholder="Type here…"
                      value={(typeof v === 'string' ? v : '') as string}
                      onChange={(e) => update(item.id, e.target.value)}
                    />
                    <div className="text-right">
                      <button
                        onClick={() => update(item.id, undefined)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {/* ---- Outcome selector buttons ---- */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-sm font-medium text-gray-900">Installation result</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn(
                'rounded-md border px-3 py-2 text-sm',
                installStatus === 'successful'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
              onClick={() => {
                update('install_status', 'successful');
                // clear opposite field(s)
                update('failure_reason', undefined);
              }}
            >
              Installation successful
            </button>
            <button
              type="button"
              className={cn(
                'rounded-md border px-3 py-2 text-sm',
                installStatus === 'failed'
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
              onClick={() => {
                update('install_status', 'failed');
                // clear opposite field(s)
                update('handover_docs', undefined);
                update('payment_notes', undefined);
                update('google_reco_given', undefined);
              }}
            >
              Installation failed
            </button>
          </div>
        </section>

        {/* ---- Revealed when Successful ---- */}
        {installStatus === 'successful' && (
          <>
            {/* Handover docs checkbox (local-only for now) */}
            <section className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="text-sm font-medium text-gray-900">
                Insurance document and User instructions given
              </div>

              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={handoverDocs === true}
                    onChange={(e) => update('handover_docs', e.target.checked)}
                  />
                  Confirmed
                </label>
              </div>
            </section>

            {/* About customer payment (local-only for now) */}
            <section className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="text-sm font-medium text-gray-900">About customer payment</div>
              <div className="mt-2 space-y-2">
                <textarea
                  className="input w-full min-h-[72px]"
                  placeholder="Write any notes about payment method, receipt, balance, or follow-up…"
                  value={paymentNotes}
                  onChange={(e) => update('payment_notes', e.target.value)}
                />
                <div className="text-right">
                  <button
                    onClick={() => update('payment_notes', undefined)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            {/* Google recommendation given (explicitly left as local-only, as requested) */}
            <section className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  Google recommendation given
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  Ask customer to scan and leave a quick Google review.
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={googleRecoGiven === true}
                    onChange={(e) => update('google_reco_given', e.target.checked)}
                  />
                  Confirmed
                </label>

                <button
                  type="button"
                  className="ml-auto inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => toast('Opening QR generator (mock)…')}
                >
                  Open QR generator
                </button>
              </div>
            </section>
          </>
        )}

        {/* ---- Revealed when Failed (local-only failure notes) ---- */}
        {installStatus === 'failed' && (
          <section className="rounded-xl border bg-white p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-900">Failure reason</div>
            <div className="mt-2 space-y-2">
              <textarea
                className="input w-full min-h-[72px]"
                placeholder="Describe the failure reason…"
                value={failureReason}
                onChange={(e) => update('failure_reason', e.target.value)}
              />
              <div className="text-right">
                <button
                  onClick={() => update('failure_reason', undefined)}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Sticky footer actions */}
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t bg-white p-3">
        <div className="mx-auto grid w-full max-w-screen-sm grid-cols-2 gap-2">
          <button
            className="btn-soft"
            onClick={() => {
              clearDraft();
            }}
          >
            Clear All
          </button>
          <button
            disabled={submitting}
            className={cn(
              'inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50'
            )}
            onClick={onSubmit}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Submit
          </button>
        </div>

        {/* Helper row (optional to keep) */}
        <div className="mx-auto mt-2 w-full max-w-screen-sm text-center text-[11px] text-gray-500">
          Required complete:{' '}
          <span className="font-medium text-gray-800">{requiredCount}</span> /{' '}
          {template.items.filter((i) => i.required).length}
        </div>
      </footer>
    </div>
  );
}

/* --------------------------------- utilities --------------------------------- */
function isFilled(item: ChecklistItem, v: ItemValue | undefined): boolean {
  if (v === undefined || v === null) return false;
  switch (item.type) {
    case 'boolean':
      return typeof v === 'boolean';
    case 'number':
      return typeof v === 'number' && !Number.isNaN(v);
    case 'text':
      return typeof v === 'string' && v.trim().length > 0;
    case 'photo':
      return Array.isArray(v) && v.length > 0;
    default:
      return false;
  }
}

function sanitizeValues(
  tpl: ChecklistTemplate,
  vals: Values | undefined
): Values {
  if (!vals) return {};
  const out: Values = {};
  const tplIds = new Set(tpl.items.map((i) => i.id));

  // Keep recognized template fields with type checks
  for (const it of tpl.items) {
    const v = vals[it.id];
    switch (it.type) {
      case 'boolean':
        out[it.id] = typeof v === 'boolean' ? v : undefined;
        break;
      case 'number':
        out[it.id] =
          typeof v === 'number' && !Number.isNaN(v) ? v : undefined;
        break;
      case 'text':
        out[it.id] = typeof v === 'string' ? v : undefined;
        break;
      case 'photo':
        out[it.id] = Array.isArray(v)
          ? (v as PhotoValue[]).filter(
              (p) => p && typeof (p as PhotoValue).url === 'string'
            )
          : [];
        break;
    }
  }

  // Preserve non-template extras so draft retains outcome fields
  for (const k of Object.keys(vals)) {
    if (!tplIds.has(k)) {
      out[k] = vals[k];
    }
  }

  return out;w
}
