export type LeakType = "cavalete" | "ramal" | "rede" | "outros";
export type LeakStatus = "open" | "in_progress" | "done";

export interface Leak {
  id: string;
  type: LeakType;
  pressure: number;
  description?: string;
  status: LeakStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt?: string;
  photos: {
    before?: string;
    after?: string;
  };
}

export interface CreateLeakInput {
  type: LeakType;
  pressure: number;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  photos?: { before?: string };
}

export interface UpdateLeakInput {
  status?: LeakStatus;
  photos?: { before?: string; after?: string };
  description?: string;
}

export const LEAK_TYPE_LABEL: Record<LeakType, string> = {
  cavalete: "Cavalete",
  ramal: "Ramal",
  rede: "Rede",
  outros: "Outros",
};

export const LEAK_STATUS_LABEL: Record<LeakStatus, string> = {
  open: "Aberto",
  in_progress: "Em atendimento",
  done: "Concluído",
};

export const LEAK_TYPE_COLOR: Record<LeakType, string> = {
  cavalete: "var(--leak-cavalete)",
  ramal: "var(--leak-ramal)",
  rede: "var(--leak-rede)",
  outros: "var(--leak-outros)",
};
