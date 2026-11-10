import {
  TransferApplication,
  normalizeTransferApplication,
  emptyTransferApplication,
} from "./transfer-application-types";

/* ═════════════════════════ Storage Keys ═════════════════════════ */

const DRAFT_KEY = "transfer_app_draft_v2";
const RECORDS_KEY = "transfer_app_records_v2";

/* ═════════════════════════ Draft Storage ═════════════════════════ */

export function saveTransferDraft(app: TransferApplication): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(app));
  } catch (err) {
    console.warn("Could not save transfer application draft:", err);
  }
}

export function loadTransferDraft(): TransferApplication {
  if (typeof window === "undefined") return emptyTransferApplication();
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyTransferApplication();
    const parsed = JSON.parse(raw);
    return normalizeTransferApplication(parsed);
  } catch (err) {
    console.warn("Could not load transfer application draft:", err);
    return emptyTransferApplication();
  }
}

export function clearTransferDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.warn("Could not clear transfer application draft:", err);
  }
}

/* ═════════════════════════ Records Helpers ═════════════════════════ */

function readRecords(): TransferApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTransferApplication);
  } catch (err) {
    console.warn("Could not read transfer records:", err);
    return [];
  }
}

function writeRecords(items: TransferApplication[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Could not write transfer records:", err);
  }
}

/* ═════════════════════════ Standalone CRUD API ═════════════════════════ */

export const transferApplicationApi = {
  async list(options?: {
    limit?: number;
    search?: string;
  }): Promise<{ data: TransferApplication[]; total: number }> {
    const all = readRecords();
    let filtered = all;

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const parcel = (item.parcel_and_property.parcel_number || "").toLowerCase();
        const loc = (item.parcel_and_property.location || "").toLowerCase();
        const sNames = item.sellers
          .map((s) => `${s.husband.full_name} ${s.wife.full_name} ${s.person.full_name} ${s.legal_entity.entity_name}`)
          .join(" ")
          .toLowerCase();
        const bNames = item.buyers
          .map((b) => `${b.husband.full_name} ${b.wife.full_name} ${b.person.full_name} ${b.legal_entity.entity_name}`)
          .join(" ")
          .toLowerCase();

        return title.includes(q) || parcel.includes(q) || loc.includes(q) || sNames.includes(q) || bNames.includes(q);
      });
    }

    if (options?.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit);
    }

    return { data: filtered, total: all.length };
  },

  async get(id: string): Promise<TransferApplication | null> {
    const all = readRecords();
    const found = all.find((item) => item.id === id);
    return found ? normalizeTransferApplication(found) : null;
  },

  async create(payload: Omit<TransferApplication, "id">): Promise<TransferApplication> {
    const all = readRecords();
    const now = new Date().toISOString();
    const id = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created: TransferApplication = {
      ...normalizeTransferApplication(payload),
      id,
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(created);
    writeRecords(all);
    return created;
  },

  async update(id: string, payload: Partial<TransferApplication>): Promise<TransferApplication> {
    const all = readRecords();
    const idx = all.findIndex((item) => item.id === id);
    const now = new Date().toISOString();
    if (idx === -1) {
      // Upsert: Create record if it doesn't exist yet (e.g. sample data or newly assigned id)
      const created: TransferApplication = normalizeTransferApplication({
        ...payload,
        id,
        createdAt: (payload as TransferApplication).createdAt || now,
        updatedAt: now,
      });
      all.unshift(created);
      writeRecords(all);
      return created;
    }
    const updated: TransferApplication = {
      ...all[idx],
      ...payload,
      id,
      updatedAt: now,
    };
    all[idx] = normalizeTransferApplication(updated);
    writeRecords(all);
    return all[idx];
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const all = readRecords();
    const next = all.filter((item) => item.id !== id);
    writeRecords(next);
    return { success: true };
  },
};

