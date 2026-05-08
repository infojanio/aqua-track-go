export type LeakType = "cavalete" | "ramal" | "rede" | "outros";
export type LeakStatus = "open" | "in_progress" | "done";
export type LeakMarkerType = "medir_pressao" | "pesquisa_haste" | "pesquisa_geofone" | "outros";

export interface WeatherInfo {
  condition: string;
  temperatureC: number;
}

export interface Leak {
  id: string;
  type: LeakType;
  pressure: number;
  markerType?: LeakMarkerType;
  description?: string;
  status: LeakStatus;
  latitude: number;
  longitude: number;
  cityId?: string;
  /** Volume estimado de água perdida em m³ */
  lostVolumeM3?: number;
  weather?: WeatherInfo;
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
  markerType?: LeakMarkerType;
  description?: string;
  latitude: number;
  longitude: number;
  cityId?: string;
  lostVolumeM3?: number;
  weather?: WeatherInfo;
  createdAt?: string;
  photos?: { before?: string };
}

export interface UpdateLeakInput {
  status?: LeakStatus;
  markerType?: LeakMarkerType;
  photos?: { before?: string; after?: string };
  description?: string;
}

export const LEAK_MARKER_LABEL: Record<LeakMarkerType, string> = {
  medir_pressao: "Medir pressão",
  pesquisa_haste: "Pesquisa com haste",
  pesquisa_geofone: "Pesquisa com geofone",
  outros: "Outros",
};

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
