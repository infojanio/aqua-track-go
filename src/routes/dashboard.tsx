import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { useLeaks } from "@/hooks/useLeaks";
import { REGIONAL_CITIES, getCityById } from "@/lib/cities";
import { metricsService } from "@/services/metrics";
import { useQueries } from "@tanstack/react-query";
import { currentYM, lastNMonths, shortMonthLabel, formatMonthLabel } from "@/lib/dates";
import { Activity, Droplets, AlertTriangle, Gauge } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const PIE_COLORS = [
  "#1a73e8", "#ea4335", "#f9ab00", "#34a853", "#a142f4",
  "#00acc1", "#ff7043", "#5e35b1", "#43a047", "#fb8c00",
  "#3949ab", "#8e24aa",
];

const fmtM3 = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n) + " m³";

function DashboardPage() {
  const ym = currentYM();
  const { data: leaks = [] } = useLeaks();

  // Métricas do mês atual para todas as cidades
  const cityMetrics = useQueries({
    queries: REGIONAL_CITIES.map((c) => ({
      queryKey: ["metrics", "month", c.id, ym],
      queryFn: () => metricsService.getMonth(c.id, ym),
      staleTime: 1000 * 60 * 10,
    })),
  });

  // Série de perdas (12 meses) — agregada (média ponderada por produzido)
  const months = useMemo(() => lastNMonths(12).reverse(), []);
  const lossSeries = useQueries({
    queries: months.flatMap((m) =>
      REGIONAL_CITIES.map((c) => ({
        queryKey: ["metrics", "month", c.id, m],
        queryFn: () => metricsService.getMonth(c.id, m),
        staleTime: 1000 * 60 * 10,
      })),
    ),
  });

  const lossByMonth = useMemo(() => {
    const N = REGIONAL_CITIES.length;
    return months.map((m, idx) => {
      const slice = lossSeries.slice(idx * N, idx * N + N);
      let prod = 0;
      let lost = 0;
      for (const q of slice) {
        if (!q.data) continue;
        prod += q.data.producedVolumeM3;
        lost += q.data.producedVolumeM3 - q.data.billedVolumeM3;
      }
      return {
        month: shortMonthLabel(m),
        perdas: prod ? Number(((lost / prod) * 100).toFixed(1)) : 0,
      };
    });
  }, [lossSeries, months]);

  // Vazamentos do mês atual por cidade
  const monthLeaks = useMemo(
    () => leaks.filter((l) => l.createdAt.slice(0, 7) === ym),
    [leaks, ym],
  );
  const leaksByCity = useMemo(() => {
    return REGIONAL_CITIES.map((c) => ({
      city: c.name,
      total: monthLeaks.filter((l) => l.cityId === c.id).length,
    }));
  }, [monthLeaks]);

  // Índice de perdas (%) por cidade — mês atual, ordenado do menor ao maior
  const lossByCity = useMemo(() => {
    return REGIONAL_CITIES.map((c, i) => ({
      city: c.name,
      perdas: cityMetrics[i].data ? Number(cityMetrics[i].data!.lossPercent.toFixed(2)) : 0,
    }))
      .filter((x) => x.perdas > 0)
      .sort((a, b) => a.perdas - b.perdas);
  }, [cityMetrics]);

  // Volume perdido por cidade (m³): produzido - faturado
  const lostByCity = useMemo(() => {
    return REGIONAL_CITIES.map((c, i) => {
      const q = cityMetrics[i];
      const lost = q.data ? q.data.producedVolumeM3 - q.data.billedVolumeM3 : 0;
      return { name: c.name, value: lost };
    }).filter((x) => x.value > 0);
  }, [cityMetrics]);

  const totalLost = lostByCity.reduce((s, x) => s + x.value, 0);
  const totalLeaks = monthLeaks.length;
  const avgLoss =
    cityMetrics.filter((q) => q.data).length > 0
      ? (
          cityMetrics.reduce((s, q) => s + (q.data?.lossPercent ?? 0), 0) /
          Math.max(cityMetrics.filter((q) => q.data).length, 1)
        ).toFixed(1)
      : "—";
  const worstCity = useMemo<{ name: string; v: number } | null>(() => {
    let best: { name: string; v: number } | null = null;
    cityMetrics.forEach((q, i) => {
      if (!q.data) return;
      if (!best || q.data.lossPercent > best.v) {
        best = { name: REGIONAL_CITIES[i].name, v: q.data.lossPercent };
      }
    });
    return best;
  }, [cityMetrics]);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-4 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-sm text-muted-foreground capitalize">
                Indicadores de {formatMonthLabel(ym)} — Regional
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon={<Droplets className="size-4" />} label="Volume perdido (mês)" value={fmtM3(totalLost)} tone="primary" />
            <Kpi icon={<AlertTriangle className="size-4" />} label="Vazamentos identificados" value={String(totalLeaks)} tone="danger" />
            <Kpi icon={<Gauge className="size-4" />} label="Perda média (%)" value={typeof avgLoss === "string" ? `${avgLoss}%` : avgLoss} tone="warning" />
            <Kpi
              icon={<Activity className="size-4" />}
              label="Maior perda %"
              value={worstCity ? `${worstCity.name} (${worstCity.v.toFixed(1)}%)` : "—"}
              tone="warning"
            />
          </div>

          {/* Gráfico: perdas mensais */}
          <Card className="p-4">
            <h3 className="mb-1 text-sm font-semibold">Perdas mensais de água (Regional)</h3>
            <p className="mb-3 text-xs text-muted-foreground">Percentual médio nos últimos 12 meses</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="perdas" stroke="#1a73e8" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Vazamentos por cidade */}
            <Card className="p-4">
              <h3 className="mb-1 text-sm font-semibold">Vazamentos identificados por cidade</h3>
              <p className="mb-3 text-xs text-muted-foreground capitalize">{formatMonthLabel(ym)}</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaksByCity} margin={{ left: 0, right: 8, top: 8, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis dataKey="city" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#ea4335" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pizza de volume perdido */}
            <Card className="p-4">
              <h3 className="mb-1 text-sm font-semibold">Volume de água perdido por cidade</h3>
              <p className="mb-3 text-xs text-muted-foreground">Total: {fmtM3(totalLost)}</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(v: number) => fmtM3(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Pie
                      data={lostByCity}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={90}
                      paddingAngle={1}
                    >
                      {lostByCity.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Tabela compacta por cidade */}
          <Card className="overflow-hidden p-0">
            <div className="border-b p-4">
              <h3 className="text-sm font-semibold">Resumo por cidade</h3>
              <p className="text-xs text-muted-foreground capitalize">{formatMonthLabel(ym)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Cidade</th>
                    <th className="px-4 py-2 text-right">Produzido</th>
                    <th className="px-4 py-2 text-right">Faturado</th>
                    <th className="px-4 py-2 text-right">Perdido</th>
                    <th className="px-4 py-2 text-right">Perdas %</th>
                    <th className="px-4 py-2 text-right">Vazamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONAL_CITIES.map((c, i) => {
                    const m = cityMetrics[i].data;
                    const leaksCount = monthLeaks.filter((l) => l.cityId === c.id).length;
                    const lost = m ? m.producedVolumeM3 - m.billedVolumeM3 : 0;
                    return (
                      <tr key={c.id} className="border-t">
                        <td className="px-4 py-2 font-medium">{c.name}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m ? fmtM3(m.producedVolumeM3) : "—"}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m ? fmtM3(m.billedVolumeM3) : "—"}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m ? fmtM3(lost) : "—"}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m ? `${m.lossPercent.toFixed(1)}%` : "—"}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{leaksCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({
  icon, label, value, tone,
}: { icon: React.ReactNode; label: string; value: string; tone: "primary" | "danger" | "warning" }) {
  const toneCls: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    danger: "text-[var(--status-open)] bg-[color-mix(in_oklab,var(--status-open)_15%,transparent)]",
    warning: "text-[var(--status-progress)] bg-[color-mix(in_oklab,var(--status-progress)_15%,transparent)]",
  };
  return (
    <Card className="flex flex-col gap-1.5 p-3">
      <div className="flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-md ${toneCls[tone]}`}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-base font-bold leading-tight sm:text-lg">{value}</p>
    </Card>
  );
}

// Avoid unused import warning for getCityById in case future use
void getCityById;
