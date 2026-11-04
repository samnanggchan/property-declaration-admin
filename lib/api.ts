import { LandDeclaration, PaginatedResponse, PaginationParams } from "./types";
import { InheritanceRequest } from "./inheritance-request-types";

const rawBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";
const API_BASE = rawBase.endsWith("/api/v1")
  ? rawBase
  : `${rawBase.replace(/\/+$/, "")}/api/v1`;

function buildQuery(params?: PaginationParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.order) q.set("order", params.order);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.status === 204 ? (undefined as T) : response.json();
  } catch (err) {
    if (url.startsWith(API_BASE)) {
      try {
        const fallbackUrl = url.replace(API_BASE, "/api/v1");
        const fallbackResp = await fetch(fallbackUrl, {
          ...options,
          headers: { "Content-Type": "application/json", ...options?.headers },
        });
        if (fallbackResp.ok) {
          return fallbackResp.status === 204
            ? (undefined as T)
            : fallbackResp.json();
        }
      } catch {
        // ignore fallback error and throw original
      }
    }
    throw err;
  }
}

export const declarationsApi = {
  list: (params?: PaginationParams) =>
    request<PaginatedResponse<LandDeclaration>>(
      `${API_BASE}/declarations${buildQuery(params)}`,
    ),
  get: (id: string) =>
    request<LandDeclaration>(`${API_BASE}/declarations/${id}`),
  create: (initial?: Partial<LandDeclaration>) =>
    request<LandDeclaration>(`${API_BASE}/declarations`, {
      method: "POST",
      body: JSON.stringify(initial ?? {}),
    }),
  update: (id: string, input: Partial<LandDeclaration>) =>
    request<LandDeclaration>(`${API_BASE}/declarations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`${API_BASE}/declarations/${id}`, { method: "DELETE" }),
};

export interface UserSummary {
  id: string;
  email: string;
  avatar?: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  list: (params?: PaginationParams) =>
    request<PaginatedResponse<UserSummary>>(
      `${API_BASE}/users${buildQuery(params)}`,
    ),
  get: (id: string) => request<UserSummary>(`${API_BASE}/users/${id}`),
};

export const inheritanceApi = {
  list: (params?: PaginationParams) =>
    request<PaginatedResponse<InheritanceRequest>>(
      `${API_BASE}/inheritance-requests${buildQuery(params)}`,
    ),
  get: (id: string) =>
    request<InheritanceRequest>(`${API_BASE}/inheritance-requests/${id}`),
  create: (initial: Partial<InheritanceRequest>) =>
    request<InheritanceRequest>(`${API_BASE}/inheritance-requests`, {
      method: "POST",
      body: JSON.stringify(initial),
    }),
  update: (id: string, input: Partial<InheritanceRequest>) =>
    request<InheritanceRequest>(`${API_BASE}/inheritance-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`${API_BASE}/inheritance-requests/${id}`, {
      method: "DELETE",
    }),
};


export interface BulkUpdateReport {
  success: boolean;
  dryRun: boolean;
  targetTable: string;
  targetColumn: string;
  totalRowsInExcel: number;
  validMappingRows: number;
  duplicateOldNumbersInExcel: number;
  duplicateNewNumbersInExcel: number;
  existingMatchesInDb: number;
  missingOldNumbersInDb: number;
  conflictingNewNumbersInDb: number;
  updatedCount: number;
  insertedCount?: number;
  operation?: "update" | "upsert" | "seed_old" | "insert_new";
  executionTimeMs: number;
  sampleMissingOldNumbers: string[];
  sampleConflictingNewNumbers: string[];
  sampleDuplicateOldNumbers: string[];
  sampleDuplicateNewNumbers: string[];
  message: string;
}

export interface BulkUpdateOptions {
  dryRun?: boolean;
  tableName?: string;
  columnName?: string;
  batchSize?: number;
  operation?: "update" | "upsert" | "seed_old" | "insert_new";
}

export const parcelsApi = {
  bulkUpdate: async (
    file: File,
    options?: BulkUpdateOptions,
  ): Promise<BulkUpdateReport> => {
    const formData = new FormData();
    formData.append("file", file);

    const q = new URLSearchParams();
    if (options?.dryRun !== undefined) q.set("dryRun", String(options.dryRun));
    if (options?.tableName) q.set("tableName", options.tableName);
    if (options?.columnName) q.set("columnName", options.columnName);
    if (options?.batchSize) q.set("batchSize", String(options.batchSize));
    if (options?.operation) q.set("operation", options.operation);

    const qs = q.toString() ? `?${q.toString()}` : "";
    const url = `${API_BASE}/parcels/bulk-update${qs}`;

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || `Update failed with status ${res.status}`);
    }
    return data as BulkUpdateReport;
  },

  getTemplateInfo: () =>
    request<{
      title: string;
      expectedColumns: { name: string; type: string; description: string; example: string }[];
      supportedFormats: string[];
      features: Record<string, string>;
    }>(`${API_BASE}/parcels/template-info`),
};
