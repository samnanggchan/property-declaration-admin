import { LandDeclaration, PaginatedResponse, PaginationParams } from "./types";

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
    request<PaginatedResponse<LandDeclaration>>(`${API_BASE}/declarations${buildQuery(params)}`),
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
    request<PaginatedResponse<UserSummary>>(`${API_BASE}/users${buildQuery(params)}`),
  get: (id: string) =>
    request<UserSummary>(`${API_BASE}/users/${id}`),
};

