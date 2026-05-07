import type { City } from "./cities";

const CITIES_KEY = "aqualoss:cities";
const METRICS_KEY = "aqualoss:metrics";

export interface MetricOverride {
  producedVolumeM3: number;
  billedVolumeM3: number;
}

// ---- Cities ----
export function loadCitiesOverride(): City[] | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CITIES_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as City[];
  } catch {
    return null;
  }
}

export function saveCitiesOverride(cities: City[]) {
  localStorage.setItem(CITIES_KEY, JSON.stringify(cities));
}

export function clearCitiesOverride() {
  localStorage.removeItem(CITIES_KEY);
}

// ---- Metrics overrides ----
type MetricsMap = Record<string, MetricOverride>; // key: `${cityId}:${ym}`

function readMetrics(): MetricsMap {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(METRICS_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getMetricOverride(cityId: string, ym: string): MetricOverride | null {
  return readMetrics()[`${cityId}:${ym}`] ?? null;
}

export function setMetricOverride(cityId: string, ym: string, m: MetricOverride) {
  const all = readMetrics();
  all[`${cityId}:${ym}`] = m;
  localStorage.setItem(METRICS_KEY, JSON.stringify(all));
}

export function deleteMetricOverride(cityId: string, ym: string) {
  const all = readMetrics();
  delete all[`${cityId}:${ym}`];
  localStorage.setItem(METRICS_KEY, JSON.stringify(all));
}

export function listMetricOverrides(): Array<{ cityId: string; ym: string } & MetricOverride> {
  const all = readMetrics();
  return Object.entries(all).map(([k, v]) => {
    const [cityId, ym] = k.split(":");
    return { cityId, ym, ...v };
  });
}
