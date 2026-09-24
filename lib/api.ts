import { CoupleRecord } from "./types"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } })
  if (!response.ok) throw new Error("Request failed")
  return response.status === 204 ? (undefined as T) : response.json()
}

export const recordsApi = {
  list: () => request<CoupleRecord[]>("/api/records"),
  get: (id: string) => request<CoupleRecord>(`/api/records/${id}`),
  create: () => request<CoupleRecord>("/api/records", { method: "POST" }),
  update: (id: string, input: Partial<CoupleRecord>) => request<CoupleRecord>(`/api/records/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/records/${id}`, { method: "DELETE" }),
}