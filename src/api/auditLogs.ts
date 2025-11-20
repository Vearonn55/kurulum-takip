// /api/auditLogs.ts
import { apiGet, UUID } from './http';

export type AuditLog = {
  id: number;
  actor_id: UUID;
  action: string;
  entity: string;
  entity_id?: UUID;
  data?: Record<string, unknown> | null;
  ip?: string | null;
  created_at: string;
};

export type AuditLogList = {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
};

export type ListAuditLogsParams = {
  q?: string;
  actor_id?: UUID;
  entity?: string;
  entity_id?: UUID;
  action?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export async function listAuditLogs(
  params?: ListAuditLogsParams
): Promise<AuditLogList> {
  return apiGet<AuditLogList>('/audit-logs', { params });
}

export async function getAuditLog(id: number): Promise<AuditLog> {
  return apiGet<AuditLog>(`/audit-logs/${id}`);
}
