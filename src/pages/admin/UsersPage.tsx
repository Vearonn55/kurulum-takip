// src/pages/admin/UsersPage.tsx
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Search, Filter, Shield, Store, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import type { User, UserRole, Store as StoreType } from '../../types';
import { apiClient } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-simple';

const ROLES: UserRole[] = ['ADMIN', 'STORE_MANAGER', 'CREW'];

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();

  // Filters
  const [role, setRole] = useState<string>('');
  const [storeId, setStoreId] = useState<string>('');
  const [status, setStatus] = useState<string>(''); // 'active' | 'inactive'
  const [q, setQ] = useState('');

  // Create/Edit state
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await apiClient.getStores();
      return res.data as StoreType[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const usersQuery = useQuery({
    queryKey: ['users', { role, storeId }],
    queryFn: async () => {
      const res = await apiClient.getUsers({
        role: role || undefined,
        store_id: storeId || undefined,
      });
      return res.data as User[];
    },
  });

  const list = useMemo(() => {
    let l = usersQuery.data ?? [];
    if (status) l = l.filter((u) => u.status === status);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s) ||
          u.id.toLowerCase().includes(s)
      );
    }
    return l;
  }, [usersQuery.data, status, q]);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<User>) => {
      return apiClient.createUser(payload);
    },
    onSuccess: () => {
      toast.success('User created');
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<User> }) => {
      return apiClient.updateUser(payload.id, payload.data);
    },
    onSuccess: () => {
      toast.success('User updated');
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update user'),
  });

  const toggleStatus = (u: User) => {
    updateMutation.mutate({
      id: u.id,
      data: { status: u.status === 'active' ? 'inactive' : 'active' },
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Partial<User> = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      role: (fd.get('role') as UserRole) || 'CREW',
      store_id: (fd.get('store_id') as string) || undefined,
      status: 'active',
    };
    if (!payload.name || !payload.email) {
      toast.error('Name and email are required');
      return;
    }
    createMutation.mutate(payload);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    const fd = new FormData(e.currentTarget);
    const data: Partial<User> = {
      name: String(fd.get('name') || editUser.name),
      email: String(fd.get('email') || editUser.email),
      phone: String(fd.get('phone') || editUser.phone || ''),
      role: (fd.get('role') as UserRole) || editUser.role,
      store_id: (fd.get('store_id') as string) || undefined,
      status: (fd.get('status') as 'active' | 'inactive') || editUser.status,
    };
    updateMutation.mutate({ id: editUser.id, data });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage access and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => usersQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            disabled={usersQuery.isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', usersQuery.isFetching && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              className="input w-full pl-8"
              placeholder="Search by name, email, phone, id…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="input w-full" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <select className="input w-full" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">All stores</option>
            {storesQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    <Shield className="h-3.5 w-3.5" />
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.store_id || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      onClick={() => setEditUser(u)}
                    >
                      Edit
                    </button>
                    {u.id !== me?.id && (
                      <button
                        className={cn(
                          'rounded-md border px-2 py-1 text-xs hover:bg-gray-50',
                          u.status === 'active' ? 'text-red-600' : 'text-emerald-600'
                        )}
                        onClick={() => toggleStatus(u)}
                        disabled={updateMutation.isPending}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {!usersQuery.isLoading && list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {usersQuery.isLoading && <div className="px-4 py-6 text-sm text-gray-500">Loading users…</div>}
        {usersQuery.isError && <div className="px-4 py-6 text-sm text-red-600">Failed to load users.</div>}
      </div>

      {/* Create Drawer */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div className="relative z-50 w-full sm:max-w-lg rounded-lg bg-white shadow-lg">
            <form onSubmit={handleCreate}>
              <div className="p-4 border-b">
                <div className="text-lg font-semibold">New User</div>
                <div className="text-sm text-gray-500">Create a new account</div>
              </div>
              <div className="p-4 space-y-3">
                <input name="name" className="input w-full" placeholder="Full name" />
                <input name="email" className="input w-full" placeholder="Email" type="email" />
                <input name="phone" className="input w-full" placeholder="Phone" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select name="role" className="input w-full" defaultValue="CREW">
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select name="store_id" className="input w-full" defaultValue="">
                    <option value="">No store</option>
                    {storesQuery.data?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary inline-flex items-center gap-2"
                  disabled={createMutation.isPending}
                >
                  <Plus className="h-4 w-4" /> Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      {editUser && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditUser(null)} />
          <div className="relative z-50 w-full sm:max-w-lg rounded-lg bg-white shadow-lg">
            <form onSubmit={handleEdit}>
              <div className="p-4 border-b">
                <div className="text-lg font-semibold">Edit User</div>
                <div className="text-sm text-gray-500">Update account settings</div>
              </div>
              <div className="p-4 space-y-3">
                <input name="name" className="input w-full" defaultValue={editUser.name} />
                <input name="email" className="input w-full" type="email" defaultValue={editUser.email} />
                <input name="phone" className="input w-full" defaultValue={editUser.phone} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select name="role" className="input w-full" defaultValue={editUser.role}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select name="store_id" className="input w-full" defaultValue={editUser.store_id || ''}>
                    <option value="">No store</option>
                    {storesQuery.data?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <select name="status" className="input w-full" defaultValue={editUser.status}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setEditUser(null)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary inline-flex items-center gap-2"
                  disabled={updateMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
