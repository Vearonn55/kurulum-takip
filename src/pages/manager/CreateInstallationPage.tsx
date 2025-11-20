// src/pages/manager/CreateInstallationPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Clock,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

import {
  createInstallation,
  assignCrew,
  type InstallationCreate,
} from '../../api/installations';
import { listUsers, type User } from '../../api/users';
import { listStores, type Store } from '../../api/stores';

// ---------- helpers ----------
const toISODateTime = (date: string, time: string) => {
  if (!date || !time) return '';
  const [h, m] = time.split(':').map((v) => parseInt(v, 10));
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

const ZONES = [
  { value: 'lefkosa', label: 'Lefkoşa' },
  { value: 'gazimagusa', label: 'Gazimağusa' },
  { value: 'girne', label: 'Girne (Kyrenia)' },
  { value: 'guzelyurt', label: 'Güzelyurt' },
  { value: 'iskele', label: 'İskele (Famagusta District)' },
  { value: 'lefke', label: 'Lefke' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'hard', label: 'Hard' },
] as const;

type DifficultyValue = (typeof DIFFICULTIES)[number]['value'];

export default function CreateInstallationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // store from auth (for managers)
  const myStoreId = (user as any)?.store_id as string | undefined;

  // ----- form state -----
  const [externalOrderId, setExternalOrderId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [timeStart, setTimeStart] = useState<string>('09:00');
  const [zone, setZone] = useState<string>('');
  const [crewIds, setCrewIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyValue | ''>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>(myStoreId ?? '');

  // ----- data: stores (for admins / multi-store setups) -----
  const storesQuery = useQuery({
    queryKey: ['stores', 'for-installation-create'],
    queryFn: async () => {
      const res = await listStores({ limit: 100, offset: 0 });
      return res.data as Store[];
    },
    staleTime: 60_000,
  });

  // ----- data: crew list -----
  const crewQuery = useQuery({
    queryKey: ['users', 'crew-picker'],
    queryFn: async () => {
      const res = await listUsers({ limit: 200, offset: 0 });
      return res.data as User[];
    },
    staleTime: 60_000,
  });

  const toggleCrew = (id: string) => {
    setCrewIds((prev) => {
      const already = prev.includes(id);
      if (already) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        toast.error('You can assign up to 3 crew members');
        return prev;
      }
      return [...prev, id];
    });
  };

  // ----- mutation: create installation + assign crew -----
  const createMutation = useMutation({
    mutationFn: async () => {
      const storeId = selectedStoreId || myStoreId;
      if (!storeId) {
        throw new Error('Store is required');
      }

      const scheduled_start = toISODateTime(date, timeStart);

      if (!externalOrderId) throw new Error('External order ID is required');
      if (!date) throw new Error('Date is required');
      if (!timeStart) throw new Error('Start time is required');
      if (!difficulty) throw new Error('Installation difficulty is required');

      // Build enriched notes (zone + difficulty + original notes)
      const meta: string[] = [];
      if (zone) {
        const label = ZONES.find((z) => z.value === zone)?.label ?? zone;
        meta.push(`Zone: ${label}`);
      }
      if (difficulty) {
        const label =
          DIFFICULTIES.find((d) => d.value === difficulty)?.label ??
          difficulty;
        meta.push(`Difficulty: ${label}`);
      }

      const metaPrefix = meta.length ? `[${meta.join(' | ')}] ` : '';
      const finalNotes =
        (metaPrefix + (notes || '')).trim() || undefined;

      const payload: InstallationCreate = {
        external_order_id: externalOrderId,
        store_id: storeId,
        scheduled_start,
        notes: finalNotes ?? null,
      };

      // 1) Create the installation
      const inst = await createInstallation(payload);

      // 2) Assign crew (if any)
      if (crewIds.length) {
        await Promise.all(
          crewIds.map((crewId) =>
            assignCrew(inst.id, {
              crew_user_id: crewId,
              role: null,
            })
          )
        );
      }

      return inst;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['installations'] }),
        queryClient.invalidateQueries({
          queryKey: ['installations', { store_id: selectedStoreId || myStoreId }],
        }),
        queryClient.invalidateQueries({ queryKey: ['calendar', 'installations'] }),
      ]);

      toast.success('Installation created');
      navigate('/app/calendar');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create installation';
      toast.error(msg);
    },
  });

  const canSubmit =
    !!externalOrderId &&
    !!date &&
    !!timeStart &&
    (!!selectedStoreId || !!myStoreId) &&
    !createMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Installation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule a new installation for an order
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Store selector (for admins) */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Store</h3>
              <p className="card-description">
                Select the store where this installation belongs
              </p>
            </div>
            <div className="card-content space-y-2">
              <select
                className="input w-full"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                disabled={!!myStoreId && !storesQuery.isError && !storesQuery.isLoading}
              >
                <option value="">
                  {storesQuery.isLoading
                    ? 'Loading stores…'
                    : myStoreId
                    ? 'Using your assigned store'
                    : 'Select store'}
                </option>
                {(storesQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {storesQuery.isError && (
                <p className="text-xs text-red-600">
                  Failed to load stores. You may not be able to create installations.
                </p>
              )}
            </div>
          </section>

          {/* External Order ID */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Order</h3>
              <p className="card-description">
                Enter the external order ID from the store system
              </p>
            </div>
            <div className="card-content space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">
                  External Order ID
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 1234, 2025-0001, POS-ABC-999…"
                  value={externalOrderId}
                  onChange={(e) => setExternalOrderId(e.target.value)}
                />
              </label>
            </div>
          </section>

          {/* Schedule */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Schedule</h3>
              <p className="card-description">Pick date and time</p>
            </div>
            <div className="card-content grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Date
                </span>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Start time
                </span>
                <input
                  type="time"
                  className="input"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
              </label>
            </div>
          </section>

          {/* Zone */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Zone</h3>
              <p className="card-description">Select the TRNC zone</p>
            </div>
            <div className="card-content">
              <select
                className="input w-full"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              >
                <option value="">Select zone</option>
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Installation Difficulty */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Installation Difficulty</h3>
              <p className="card-description">Select one option</p>
            </div>
            <div className="card-content space-y-3">
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => {
                  const selected = difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition',
                        selected
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      )}
                      aria-pressed={selected}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1">
                {difficulty ? (
                  <p className="text-sm text-gray-700">
                    Selected:{' '}
                    <span className="font-medium">
                      {
                        DIFFICULTIES.find(
                          (x) => x.value === difficulty
                        )?.label
                      }
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    No difficulty selected.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
              <p className="card-description">
                Special instructions for the crew
              </p>
            </div>
            <div className="card-content">
              <textarea
                className="textarea w-full"
                rows={4}
                placeholder="e.g., call customer before arrival, fragile items, building access notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* Right column: crew & actions */}
        <div className="space-y-6">
          {/* Crew */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Assign Crew</h3>
              <p className="card-description">Select up to 3 crew members</p>
            </div>
            <div className="card-content space-y-3">
              {crewQuery.isLoading && (
                <p className="text-sm text-gray-500">Loading crew…</p>
              )}
              {crewQuery.isError && (
                <p className="text-sm text-red-600">
                  Failed to load crew.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {(crewQuery.data ?? []).map((c) => {
                  const selected = crewIds.includes(c.id);
                  const atLimit = crewIds.length >= 3 && !selected;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCrew(c.id)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition',
                        selected
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 bg-white hover:bg-gray-50',
                        atLimit && 'cursor-not-allowed opacity-50'
                      )}
                      disabled={atLimit}
                      title={atLimit ? 'Maximum 3 members' : undefined}
                    >
                      {c.name ?? c.email ?? c.id}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2">
                {crewIds.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No crew selected yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(crewQuery.data ?? [])
                      .filter((c) => crewIds.includes(c.id))
                      .map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm"
                        >
                          {c.name ?? c.email ?? c.id}
                          <button
                            type="button"
                            onClick={() => toggleCrew(c.id)}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label={`Remove ${
                              c.name ?? c.email ?? c.id
                            }`}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Actions</h3>
              <p className="card-description">Save and schedule</p>
            </div>
            <div className="card-content">
              <button
                className="btn btn-primary inline-flex w-full items-center justify-center gap-2"
                onClick={() => createMutation.mutate()}
                disabled={!canSubmit}
              >
                <Save
                  className={cn(
                    'h-4 w-4',
                    createMutation.isPending && 'animate-pulse'
                  )}
                />
                {createMutation.isPending
                  ? 'Scheduling…'
                  : 'Create Installation'}
              </button>
              {!canSubmit && (
                <p className="mt-2 text-xs text-gray-500">
                  Select store, enter external order ID, date and time
                  to enable.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
