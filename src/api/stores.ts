// /api/stores.ts
import { apiGet, apiPost, apiPatch, UUID } from './http';
import type { Address } from './addresses';

export type Store = {
  id: UUID;
  name: string;
  external_store_id?: string | null;
  address_id: UUID;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  address?: Address;
};

export type StoreList = {
  data: Store[];
  limit: number;
  offset: number;
};

export type StoreCreate = {
  name: string;
  external_store_id?: string | null;
  address_id: UUID;
  phone?: string | null;
};

export type StoreUpdate = Partial<StoreCreate>;

export type ListStoresParams = {
  q?: string;
  external_store_id?: string;
  limit?: number;
  offset?: number;
};

export async function listStores(
  params?: ListStoresParams
): Promise<StoreList> {
  return apiGet<StoreList>('/stores', { params });
}

export async function createStore(payload: StoreCreate): Promise<Store> {
  return apiPost<Store>('/stores', payload);
}

export async function getStore(id: UUID): Promise<Store> {
  return apiGet<Store>(`/stores/${id}`);
}

export async function updateStore(
  id: UUID,
  payload: StoreUpdate
): Promise<Store> {
  return apiPatch<Store>(`/stores/${id}`, payload);
}
