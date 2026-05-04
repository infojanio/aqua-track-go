import { getCityById, cityFullName } from "@/lib/cities";

// Indicadores mensais da cidade (mockado — pronto para troca por API real)
export interface MonthlyMetrics {
  city: string;
  referenceMonth: string; // ISO yyyy-mm
  producedVolumeM3: number; // volume produzido (m³)
  billedVolumeM3: number; // volume faturado (m³)
  lossPercent: number; // índice de perdas (%)
}

function lastMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Hash simples e determinístico p/ variar mocks por cidade
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const metricsService = {
  async getLastMonth(cityId: string): Promise<MonthlyMetrics> {
    // TODO: substituir por chamada real ao backend (passar cityId)
    const city = getCityById(cityId);
    const seed = hash(city.id);
    const produced = 80_000 + (seed % 220_000);
    const lossRate = 0.18 + ((seed >> 4) % 25) / 100; // 18% ~ 43%
    const billed = Math.round(produced * (1 - lossRate));
    const loss = ((produced - billed) / produced) * 100;
    return {
      city: cityFullName(city),
      referenceMonth: lastMonthISO(),
      producedVolumeM3: produced,
      billedVolumeM3: billed,
      lossPercent: Number(loss.toFixed(1)),
    };
  },
};
