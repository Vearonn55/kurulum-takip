// src/api/roles.ts
import { apiGet, UUID } from './http';

export type Role = {
  id: UUID;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type RoleList = {
  data: Role[];
  limit: number;
  offset: number;
};

export type ListRolesParams = {
  q?: string;
  limit?: number;
  offset?: number;
};

export async function listRoles(
  params?: ListRolesParams
): Promise<RoleList> {
  return apiGet<RoleList>('/roles', { params });
}
