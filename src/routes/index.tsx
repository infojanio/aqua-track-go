import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { AppShell } from "@/components/layout/AppShell";
import { LeakMapClient as LeakMap } from "@/components/leaks/LeakMapClient";
import { NewLeakDialog } from "@/components/leaks/NewLeakDialog";
import { LeakDetailsSheet } from "@/components/leaks/LeakDetailsSheet";
import { MetricsBar } from "@/components/dashboard/MetricsBar";
import { useLeaks } from "@/hooks/useLeaks";
import { DEFAULT_CENTER, getCurrentPosition } from "@/lib/location";
import { LEAK_TYPE_LABEL, LEAK_TYPE_COLOR, type Leak, type LeakType } from "@/types/leak";
import { Plus, X, Loader2, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: MapPage,
});

function MapPage() {
  const { data: leaks = [], isLoading } = useLeaks();
  const [selected, setSelected] = useState<Leak | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(null);

  const [center, setCenter] = useState<LatLngExpression>([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
  const [usingDefault, setUsingDefault] = useState(true);

  // Tenta obter geolocalização; mantém Campos Belos-GO como fallback
  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then((pos) => {
        if (cancelled) return;
        setCenter([pos.lat, pos.lng]);
        setUsingDefault(false);
      })
      .catch(() => {
        // mantém DEFAULT_CENTER (Campos Belos - GO)
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setPickedPoint({ lat, lng });
    setPickMode(false);
    setDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 sm:p-4">
        {/* Indicadores do último mês */}
        <MetricsBar />

        {/* Mapa em card */}
        <section className="relative flex-1 min-h-[420px] overflow-hidden rounded-xl border bg-card shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
          <LeakMap
            leaks={leaks}
            center={center}
            selectedId={selected?.id}
            onSelect={setSelected}
            onMapClick={handleMapClick}
            pickMode={pickMode}
            pickedPoint={pickedPoint}
          />

          {/* Legenda */}
          <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-xl border bg-card/95 p-2.5 shadow-lg backdrop-blur">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Tipos</p>
            <div className="space-y-1">
              <Legend color="var(--leak-cavalete)" label="Cavalete" />
              <Legend color="var(--leak-ramal)" label="Ramal" />
              <Legend color="var(--leak-rede)" label="Rede" />
              <Legend color="var(--leak-outros)" label="Outros" />
            </div>
          </div>

          {/* Stats */}
          <div className="pointer-events-none absolute right-3 top-3 z-[400] flex gap-2">
            <StatPill label="Total" value={leaks.length} />
            <StatPill label="Abertos" value={leaks.filter((l) => l.status === "open").length} accent="open" />
          </div>

          {/* Indicador de localização padrão */}
          {usingDefault && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] -translate-x-1/2 rounded-full border bg-card/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-md backdrop-blur">
              <MapPin className="mr-1 inline size-3 text-primary" />
              Exibindo {DEFAULT_CENTER.label} (padrão)
            </div>
          )}

          {/* FAB */}
          {pickMode ? (
            <Button
              onClick={() => setPickMode(false)}
              size="lg"
              variant="destructive"
              className="absolute bottom-5 right-5 z-[500] h-14 rounded-full px-5 shadow-2xl"
            >
              <X className="mr-2 size-5" /> Cancelar
            </Button>
          ) : (
            <button
              onClick={() => { setPickedPoint(null); setDialogOpen(true); }}
              className="absolute bottom-5 right-5 z-[500] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl ring-4 ring-primary/20 transition-transform hover:scale-105 active:scale-95"
              aria-label="Novo vazamento"
            >
              <Plus className="size-7" />
            </button>
          )}
        </section>
      </div>

      <NewLeakDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRequestPickOnMap={() => { setPickMode(true); setPickedPoint(null); }}
        pickedPoint={pickedPoint}
      />
      <LeakDetailsSheet leak={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="size-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
      <span className="text-foreground">{label}</span>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: "open" }) {
  return (
    <div className="pointer-events-auto rounded-xl border bg-card/95 px-3 py-1.5 text-center shadow-lg backdrop-blur">
      <p className={`text-base font-bold leading-none ${accent === "open" ? "text-[var(--status-open)]" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
