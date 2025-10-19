// src/pages/manager/CreateInstallationPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, Users as UsersIcon, FileText, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import type { User, Order } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

// ---------- helpers ----------
const toISODateTime = (date: string, time: string) => {
  // date: 'YYYY-MM-DD', time: 'HH:mm'
  if (!date || !time) return '';
  // Local → ISO; backend should handle timezone if needed
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

export default function CreateInstallationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const myStoreId = user?.role === 'STORE_MANAGER' ? user.store_id : undefined;

  // ----- form state -----
  const [orderSearch, setOrderSearch] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [timeStart, setTimeStart] = useState<string>('09:00');
  const [zone, setZone] = useState<string>('');
  const [crewIds, setCrewIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'' | 'easy' | 'intermediate' | 'hard'>('');

  // ----- data: orders (filter by store and optionally status) -----
  const ordersQuery = useQuery({
    queryKey: ['orders', { store_id: myStoreId ?? '', status: 'confirmed' }],
    queryFn: async () => {
      const res = await apiClient.getOrders({
        store_id: myStoreId,
        status: 'confirmed', // adjust if your backend uses different flow
      });
      return res.data as Order[];
    },
    staleTime: 60_000,
  });

  // quick client-side filter by order id
  const filteredOrders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    if (!orderSearch.trim()) return list.slice(0, 50);
    const s = orderSearch.trim().toLowerCase();
    return list.filter((o) => o.id.toLowerCase().includes(s)).slice(0, 50);
  }, [ordersQuery.data, orderSearch]);

  // ----- data: crew list -----
  const crewQuery = useQuery({
    queryKey: ['users', { role: 'CREW', store_id: myStoreId ?? '' }],
    queryFn: async () => {
      const res = await apiClient.getUsers({ role: 'CREW', store_id: myStoreId });
      return res.data as User[];
    },
    staleTime: 60_000,
  });

  // ----- mutation: create installation -----
  const createMutation = useMutation({
    mutationFn: async () => {
      const scheduled_start = toISODateTime(date, timeStart);

      if (!orderId) throw new Error('Order is required');
      if (!date) throw new Error('Date is required');
      if (!timeStart) throw new Error('Start time is required');
      if (!difficulty) throw new Error('Installation difficulty is required');

      // Append zone to notes so it shows downstream (Calendar/Detail)
      const finalNotes = zone
        ? `[Zone: ${ZONES.find((z) => z.value === zone)?.label ?? zone}] ${notes || ''}`.trim()
        : notes;

      return apiClient.createInstallation({
        order_id: orderId,
        scheduled_start,
        crew_user_ids: crewIds.length ? crewIds : undefined,
        notes: finalNotes || undefined,
         difficulty: difficulty || undefined,
        items: [], // If backend requires, supply actual order item mappings later
      });
    },
    onSuccess: async (res) => {
      // Invalidate calendar data & installations list so the new one shows up
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['installations'] }),
        queryClient.invalidateQueries({ queryKey: ['installations', { store_id: myStoreId }] }),
      ]);

      toast.success('Installation created');
      // Go to calendar week that includes selected date
      navigate('/app/calendar');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create installation');
    },
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
  
  const toggleTeamMember = (id: string) => {
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

  const canSubmit =
    !!orderId && !!date && !!timeStart && !createMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Installation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule a new installation for an order
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Order</h3>
              <p className="card-description">Select the order to install</p>
            </div>
            <div className="card-content space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search order by ID..."
                    className="pl-8 w-full input"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <select
                  className="input w-full"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                >
                  <option value="" disabled>
                    {ordersQuery.isLoading ? 'Loading orders…' : 'Select order'}
                  </option>
                  {filteredOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id}
                    </option>
                  ))}
                </select>
                {ordersQuery.isError && (
                  <p className="text-sm text-red-600 mt-1">
                    Failed to load orders.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Schedule</h3>
              <p className="card-description">Pick date and time</p>
            </div>
            <div className="card-content grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
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
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
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
              'px-3 py-1.5 rounded-md border text-sm transition',
              selected
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white hover:bg-gray-50 border-gray-300'
            )}
            aria-pressed={selected}
          >
            {d.label}
          </button>
        );
      })}
    </div>

    {/* Selected value */}
    <div className="mt-1">
      {difficulty ? (
        <p className="text-sm text-gray-700">
          Selected: <span className="font-medium">
            {DIFFICULTIES.find((x) => x.value === difficulty)?.label}
          </span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">No difficulty selected.</p>
      )}
    </div>
  </div>
</section>


          {/* Notes */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
              <p className="card-description">Special instructions for the crew</p>
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
  {/* Loading / errors / empty states */}
  {crewQuery.isLoading && (
    <p className="text-sm text-gray-500">Loading crew…</p>
  )}
  {crewQuery.isError && (
    <p className="text-sm text-red-600">Failed to load crew.</p>
  )}

  {/* Picker bar */}
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
            'px-3 py-1.5 rounded-md border text-sm transition',
            selected
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white hover:bg-gray-50 border-gray-300',
            atLimit && 'opacity-50 cursor-not-allowed'
          )}
          disabled={atLimit}
          title={atLimit ? 'Maximum 3 members' : undefined}
        >
          {c.name ?? c.email ?? c.id}
        </button>
      );
    })}
  </div>

  {/* Selected members */}
  <div className="mt-2">
    {crewIds.length === 0 ? (
      <p className="text-sm text-gray-500">No crew selected yet.</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {(crewQuery.data ?? [])
          .filter((c) => crewIds.includes(c.id))
          .map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white"
            >
              {c.name ?? c.email ?? c.id}
              <button
                type="button"
                onClick={() => toggleCrew(c.id)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${c.name ?? c.email ?? c.id}`}
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
                className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
                onClick={() => createMutation.mutate()}
                disabled={!canSubmit}
              >
                <Save className={cn('h-4 w-4', createMutation.isPending && 'animate-pulse')} />
                {createMutation.isPending ? 'Scheduling…' : 'Create Installation'}
              </button>
              {!canSubmit && (
                <p className="text-xs text-gray-500 mt-2">
                  Select order, date and time to enable.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
