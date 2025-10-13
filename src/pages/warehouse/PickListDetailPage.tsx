import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, Layers, Save, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CreatePayload {
  date: string;            // YYYY-MM-DD
  warehouse: string;
  installation_ids: string[];
}

export default function CreatePickListPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState<string>('WH_Nicosia');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const installsQuery = useQuery({
    queryKey: ['installations_for_pick', { date }],
    queryFn: async () => {
      const res = await apiClient.getInstallations({
        status: 'scheduled', // adjust if your API uses different filtering
        from: date,
        to: date,
      });
      return res.data ?? [];
    },
  });

  // Select all by default when date changes
  useEffect(() => {
    const ids = Object.fromEntries((installsQuery.data ?? []).map((x: any) => [x.id, true]));
    setSelected(ids);
  }, [date, installsQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const res = await apiClient.createPickList(payload as any);
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success('Pick list created');
      const id = data?.id ?? '';
      if (id) navigate(`/app/picklists/${id}`);
      else navigate('/app/picklists');
    },
    onError: () => toast.error('Failed to create pick list'),
  });

  const allChecked = useMemo(() => {
    const arr = installsQuery.data ?? [];
    if (arr.length === 0) return false;
    return arr.every((x: any) => selected[x.id]);
  }, [installsQuery.data, selected]);

  const toggleAll = () => {
    const arr = installsQuery.data ?? [];
    const next = !allChecked;
    const obj = Object.fromEntries(arr.map((x: any) => [x.id, next]));
    setSelected(obj);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!date || !warehouse || ids.length === 0) {
      toast.error('Please select date, warehouse, and at least one installation.');
      return;
    }
    createMutation.mutate({ date, warehouse, installation_ids: ids });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Pick List</h1>
        <p className="mt-1 text-sm text-gray-500">Choose date, warehouse, and which <b>scheduled installations</b> to include.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Date
            </span>
            <input
              type="date"
              className="input mt-1 w-full"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Warehouse
            </span>
            <select
              className="input mt-1 w-full"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              <option value="WH_Nicosia">WH_Nicosia</option>
              <option value="WH_Famagusta">WH_Famagusta</option>
              <option value="WH_Kyrenia">WH_Kyrenia</option>
            </select>
          </label>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scheduled Installations on {date}</h3>
            <p className="card-description">Select which installations to include.</p>
          </div>
          <div className="card-content overflow-x-auto">
            {installsQuery.isLoading && <div className="text-sm text-gray-500">Loading installations…</div>}
            {installsQuery.isError && (
              <div className="text-sm text-red-600 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Failed to load installations.
              </div>
            )}
            {!installsQuery.isLoading && (installsQuery.data ?? []).length === 0 && (
              <div className="text-sm text-gray-500">No scheduled installations on this date.</div>
            )}

            {(installsQuery.data ?? []).length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Installation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(installsQuery.data as any[]).map((inst) => (
                    <tr key={inst.id}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[inst.id]}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [inst.id]: e.target.checked }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{inst.id}</td>
                      <td className="px-4 py-3 text-sm">{inst.order_id ?? '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {inst.scheduled_start
                          ? new Date(inst.scheduled_start).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">{inst.status ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Create Pick List
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
