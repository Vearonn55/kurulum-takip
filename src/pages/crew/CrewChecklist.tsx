// src/pages/crew/CrewChecklist.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Camera,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

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

// A minimal mock template (extend freely)
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
        id: 'safety_ok',
        label: 'Safety check passed',
        type: 'boolean',
        required: true,
        hint: 'Area is safe to work, no hazards present',
      },
      {
        id: 'room_tag',
        label: 'Room / Area',
        type: 'text',
        required: true,
        hint: 'e.g., Living room, Bedroom 1',
      },
      {
        id: 'levelness',
        label: 'Levelness (mm)',
        type: 'number',
        required: true,
        hint: 'Measure the largest gap under furniture feet',
      },
      {
        id: 'customer_notes',
        label: 'Customer notes',
        type: 'text',
        required: false,
        hint: 'Anything the customer requested',
      },
      {
        id: 'photos',
        label: 'Completion photos',
        type: 'photo',
        required: true,
        hint: 'Take at least 2 clear photos',
      },
      {
        id: 'signature',
        label: 'Customer signature (photo)',
        type: 'photo',
        required: true,
        hint: 'Capture customer signature sheet',
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
        const parsed = JSON.parse(raw);
        setValues(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [jobId]);

  // Autosave
  useEffect(() => {
    if (!jobId) return;
    try {
      localStorage.setItem(storageKey(jobId), JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, jobId]);

  // progress calc
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

  function onAddPhoto(itemId: string, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const curr = (values[itemId] as PhotoValue[] | undefined) ?? [];
      const next: PhotoValue[] = [
        ...curr,
        { id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, url: String(reader.result), name: file.name },
      ];
      update(itemId, next);
      toast.success('Photo added');
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(itemId: string, pid: string) {
    const curr = (values[itemId] as PhotoValue[] | undefined) ?? [];
    update(
      itemId,
      curr.filter((p) => p.id !== pid)
    );
  }

  function clearDraft() {
    if (!jobId) return;
    localStorage.removeItem(storageKey(jobId));
    setValues({});
    toast('Draft cleared', { icon: '🗑️' });
  }

  function onSubmit() {
    if (!allRequiredOk) {
      toast.error('Please complete all required items');
      return;
    }
    setSubmitting(true);
    // Simulate latency
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Checklist submitted');
      // Normally: apiClient.submitChecklist(jobId, toPayload(values));
      // After submit we could clear draft:
      if (jobId) localStorage.removeItem(storageKey(jobId));
      navigate(`/crew/jobs/${jobId}`);
    }, 900);
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
            <div className="truncate text-sm font-semibold text-gray-900">Installation Checklist</div>
            <div className="text-[11px] text-gray-500">
              {template.name} • v{template.version}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] text-gray-500">Required</div>
            <div className="text-sm font-medium text-gray-900">
              {completedCount}/{template.items.length}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-3 p-3 pb-24">
        {template.items.map((item) => {
          const v = values[item.id];
          const filled = isFilled(item, v);
          return (
            <section key={item.id} className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {item.label}{' '}
                    {item.required && <span className="text-xs font-normal text-rose-600">*</span>}
                  </div>
                  {item.hint && <div className="mt-0.5 text-xs text-gray-500">{item.hint}</div>}
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]',
                    filled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  )}
                >
                  {filled ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> done
                    </>
                  ) : (
                    'pending'
                  )}
                </span>
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
                    <button
                      onClick={() => update(item.id, undefined)}
                      className="ml-auto rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {item.type === 'number' && (
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="decimal"
                      className="input w-32"
                      placeholder="0"
                      value={v ?? ''}
                      onChange={(e) => update(item.id, e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                    <span className="text-xs text-gray-500">mm</span>
                    <button
                      onClick={() => update(item.id, undefined)}
                      className="ml-auto rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {item.type === 'text' && (
                  <div className="space-y-2">
                    <input
                      className="input w-full"
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

                {item.type === 'photo' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                        <Camera className="h-4 w-4" />
                        Add photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onAddPhoto(item.id, f);
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                      <button
                        onClick={() => update(item.id, [])}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {((v as PhotoValue[]) ?? []).map((p) => (
                        <div key={p.id} className="relative overflow-hidden rounded-md border">
                          <img src={p.url} alt={p.name || 'photo'} className="h-24 w-full object-cover" />
                          <button
                            className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-600 shadow"
                            onClick={() => removePhoto(item.id, p.id)}
                            aria-label="Remove photo"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {((v as PhotoValue[]) ?? []).length === 0 && (
                        <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-gray-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      {/* Sticky footer actions */}
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t bg-white p-3">
        <div className="mx-auto grid w-full max-w-screen-sm grid-cols-3 gap-2">
          <button
            className="btn-soft"
            onClick={() => {
              clearDraft();
            }}
          >
            Clear
          </button>
          <button
            className="btn-soft"
            onClick={() => toast.success('Draft saved')}
          >
            Save draft
          </button>
          <button
            disabled={submitting}
            className={cn(
              'inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50'
            )}
            onClick={onSubmit}
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Submit
          </button>
        </div>

        {/* Helper row */}
        <div className="mx-auto mt-2 w-full max-w-screen-sm text-center text-[11px] text-gray-500">
          Required complete: <span className="font-medium text-gray-800">{requiredCount}</span> /{' '}
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

/* ---------------------------------------------------------------------------
Styles used:
- .input (from your design system)
- .btn-soft  => inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 active:scale-[0.99]
--------------------------------------------------------------------------- */
