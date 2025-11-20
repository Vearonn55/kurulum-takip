// src/api/orders.ts
import { apiGet, UUID } from './http';
import type { Store } from './stores';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export type Order = {
  id: string;
  external_order_id?: string | null;

  store_id?: UUID | null;
  store?: Store;

  customer_name?: string | null;
  customer?: string | null;

  status: OrderStatus | string;

  items_count?: number | null;
  items?: Array<{
    id: UUID;
    external_product_id?: string | null;
    quantity?: number | null;
  }>;

  created_at?: string;
  placed_at?: string;
};

export type OrderList = {
  data: Order[];
  limit: number;
  offset: number;
};

export type ListOrdersParams = {
  store_id?: UUID;
  status?: OrderStatus | string;
  external_order_id?: string;
  limit?: number;
  offset?: number;
};

/**
 * List orders (read-only).
 * Backend should expose GET /orders with pagination + optional filters.
 */
export async function listOrders(
  params?: ListOrdersParams
): Promise<OrderList> {
  return apiGet<OrderList>('/orders', { params });
}
