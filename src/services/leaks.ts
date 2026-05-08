import type { CreateLeakInput, Leak, UpdateLeakInput } from "@/types/leak";
import { mockLeaks } from "./leaks.mock";

// In-memory store simulating backend. Swap with `api` calls when backend is ready.
let store: Leak[] = [...mockLeaks];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const leaksService = {
  // GET /leaks
  async list(): Promise<Leak[]> {
    await delay();
    return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // return (await api.get<Leak[]>("/leaks")).data;
  },

  // POST /leaks
  async create(input: CreateLeakInput): Promise<Leak> {
    await delay();
    const leak: Leak = {
      id: crypto.randomUUID(),
      type: input.type,
      pressure: input.pressure,
      markerType: input.markerType,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      cityId: input.cityId,
      lostVolumeM3: input.lostVolumeM3,
      weather: input.weather,
      status: "open",
      createdAt: input.createdAt ?? new Date().toISOString(),
      photos: { before: input.photos?.before },
    };
    store = [leak, ...store];
    return leak;
  },

  // PATCH /leaks/:id
  async update(id: string, patch: UpdateLeakInput): Promise<Leak> {
    await delay();
    store = store.map((l) =>
      l.id === id
        ? {
            ...l,
            ...patch,
            photos: { ...l.photos, ...(patch.photos ?? {}) },
            updatedAt: new Date().toISOString(),
          }
        : l,
    );
    const found = store.find((l) => l.id === id);
    if (!found) throw new Error("Vazamento não encontrado");
    return found;
    // return (await api.patch<Leak>(`/leaks/${id}`, patch)).data;
  },
};

// TODO: priority system — calcular prioridade automática (pressão + tipo + tempo aberto)
// TODO: dashboard metrics — agregação por tipo/status/tempo médio resolução
// TODO: offline-first — cache via IndexedDB + fila de sincronização
