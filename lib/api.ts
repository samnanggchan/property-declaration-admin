import { LandDeclaration } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.status === 204 ? (undefined as T) : response.json();
}

export const declarationsApi = {
  list: () =>
    request<LandDeclaration[]>(`${API_BASE}/declarations`),
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
