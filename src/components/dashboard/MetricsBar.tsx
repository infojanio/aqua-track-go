import { Droplet, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { useLastMonthMetrics } from "@/hooks/useMetrics";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fmtM3 = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n) + " m³";

const fmtMonth = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export function MetricsBar({ cityId }: { cityId: string }) {
  const { data, isLoading } = useLastMonthMetrics(cityId);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">
          {data?.city ?? "Campos Belos - GO"}
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {data ? fmtMonth(data.referenceMonth) : "Último mês"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          icon={<Droplet className="size-4" />}
          label="Produzido"
          value={data ? fmtM3(data.producedVolumeM3) : "—"}
          loading={isLoading}
          tone="primary"
        />
        <MetricCard
          icon={<Receipt className="size-4" />}
          label="Faturado"
          value={data ? fmtM3(data.billedVolumeM3) : "—"}
          loading={isLoading}
          tone="success"
        />
        <MetricCard
          icon={
            data && data.lossPercent > 25 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )
          }
          label="Perdas"
          value={data ? `${data.lossPercent.toFixed(1)}%` : "—"}
          loading={isLoading}
          tone={data && data.lossPercent > 30 ? "danger" : "warning"}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  loading,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
  tone: "primary" | "success" | "warning" | "danger";
}) {
  const toneClasses: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-[var(--status-done)] bg-[color-mix(in_oklab,var(--status-done)_15%,transparent)]",
    warning: "text-[var(--status-progress)] bg-[color-mix(in_oklab,var(--status-progress)_15%,transparent)]",
    danger: "text-[var(--status-open)] bg-[color-mix(in_oklab,var(--status-open)_15%,transparent)]",
  };
  return (
    <Card className="flex flex-col gap-1.5 p-3">
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          {icon}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={cn("text-base font-bold leading-tight sm:text-lg", loading && "opacity-50")}>
        {value}
      </p>
    </Card>
  );
}
