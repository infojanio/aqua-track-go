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

export const metricsService = {
  async getLastMonth(): Promise<MonthlyMetrics> {
    // TODO: substituir por chamada real ao backend
    const produced = 248_500;
    const billed = 168_980;
    const loss = ((produced - billed) / produced) * 100;
    return {
      city: "Campos Belos - GO",
      referenceMonth: lastMonthISO(),
      producedVolumeM3: produced,
      billedVolumeM3: billed,
      lossPercent: Number(loss.toFixed(1)),
    };
  },
};
