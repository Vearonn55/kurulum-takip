// /api/media.ts
import { apiGet, apiPost, apiDelete, UUID } from './http';

export type MediaType = 'photo' | 'signature';

export type MediaAsset = {
  id: UUID;
  installation_id: UUID;
  url: string;
  type: MediaType;
  tags?: Record<string, unknown> | string[]; // union from oneOf
  sha256?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: UUID;
  created_at: string;
};

export type MediaAssetCreate = {
  url: string;
  type: MediaType;
  tags?: Record<string, unknown> | string[];
  sha256?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type MediaAssetList = {
  data: MediaAsset[];
  total: number;
  limit: number;
  offset: number;
};

// installation-scoped
export async function listInstallationMedia(
  installationId: UUID,
  params?: { limit?: number; offset?: number }
): Promise<MediaAssetList> {
  return apiGet<MediaAssetList>(`/installations/${installationId}/media`, {
    params,
  });
}

export async function createInstallationMedia(
  installationId: UUID,
  payload: MediaAssetCreate
): Promise<MediaAsset> {
  return apiPost<MediaAsset>(`/installations/${installationId}/media`, payload);
}

// global media record
export async function getMedia(id: UUID): Promise<MediaAsset> {
  return apiGet<MediaAsset>(`/media/${id}`);
}

export async function deleteMedia(id: UUID): Promise<void> {
  await apiDelete<void>(`/media/${id}`);
}
