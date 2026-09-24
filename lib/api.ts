import { LandDeclaration } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error("Request failed");
  return response.status === 204 ? (undefined as T) : response.json();
}

export const declarationsApi = {
  list: () => request<LandDeclaration[]>("/api/declarations"),
  get: (id: string) => request<LandDeclaration>(`/api/declarations/${id}`),
  create: () => request<LandDeclaration>("/api/declarations", { method: "POST" }),
  update: (id: string, input: Partial<LandDeclaration>) =>
    request<LandDeclaration>(`/api/declarations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`/api/declarations/${id}`, { method: "DELETE" }),
};
