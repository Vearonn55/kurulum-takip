// /api/addresses.ts
import { apiGet, apiPost, apiPatch, UUID } from './http';

export type Address = {
  id: UUID;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal_code: string;
  country: string; // ISO-3166-1 alpha-2
  lat?: number | null;
  lng?: number | null;
  created_at: string;
  updated_at: string;
};

export type AddressList = {
  data: Address[];
  limit: number;
  offset: number;
};

export type AddressCreate = {
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
};

export type AddressUpdate = Partial<AddressCreate>;

export type ListAddressesParams = {
  q?: string;
  city?: string;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function listAddresses(
  params?: ListAddressesParams
): Promise<AddressList> {
  return apiGet<AddressList>('/addresses', { params });
}

export async function createAddress(
  payload: AddressCreate
): Promise<Address> {
  return apiPost<Address>('/addresses', payload);
}

export async function getAddress(id: UUID): Promise<Address> {
  return apiGet<Address>(`/addresses/${id}`);
}

export async function updateAddress(
  id: UUID,
  payload: AddressUpdate
): Promise<Address> {
  return apiPatch<Address>(`/addresses/${id}`, payload);
}
