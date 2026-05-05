import type { Leak, LeakType, LeakStatus } from "@/types/leak";
import { REGIONAL_CITIES } from "@/lib/cities";

const TYPES: LeakType[] = ["cavalete", "ramal", "rede", "outros"];
const STATUSES: LeakStatus[] = ["open", "in_progress", "done"];

// Gerador determinístico simples
function rand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function generate(): Leak[] {
  const r = rand(42);
  const list: Leak[] = [];
  const now = new Date();
  let id = 1;

  REGIONAL_CITIES.forEach((city, ci) => {
    // Para cada cidade, gera vazamentos dos últimos 6 meses
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const count = 2 + Math.floor(r() * 6); // 2~7 vazamentos por mês
      for (let i = 0; i < count; i++) {
        const type = TYPES[Math.floor(r() * TYPES.length)];
        const status = monthOffset === 0
          ? STATUSES[Math.floor(r() * STATUSES.length)]
          : (r() > 0.25 ? "done" : "in_progress");
        const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1 + Math.floor(r() * 27),
          Math.floor(r() * 24), Math.floor(r() * 60));
        const latJitter = (r() - 0.5) * 0.04;
        const lngJitter = (r() - 0.5) * 0.04;
        // Volume perdido estimado (m³): rede vaza mais; outros menos
        const baseVol = type === "rede" ? 220 : type === "ramal" ? 90 : type === "cavalete" ? 40 : 25;
        const lost = Math.round(baseVol * (0.6 + r() * 1.6));
        list.push({
          id: String(id++),
          type,
          pressure: Math.round(10 + r() * 40),
          description: `Vazamento ${type} em ${city.name}.`,
          status,
          latitude: city.lat + latJitter,
          longitude: city.lng + lngJitter,
          cityId: city.id,
          lostVolumeM3: lost,
          createdAt: d.toISOString(),
          updatedAt: status === "done" ? new Date(d.getTime() + 1000 * 60 * 60 * 24).toISOString() : undefined,
          photos: {},
        });
      }
    }
    // mantém ci usado
    void ci;
  });

  return list;
}

export const mockLeaks: Leak[] = generate();
