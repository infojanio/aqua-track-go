import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { AppShell } from "@/components/layout/AppShell";
import { LeakMapClient as LeakMap } from "@/components/leaks/LeakMapClient";
import { NewLeakDialog } from "@/components/leaks/NewLeakDialog";
import { LeakDetailsSheet } from "@/components/leaks/LeakDetailsSheet";
import { MetricsBar } from "@/components/dashboard/MetricsBar";
import { useLeaks } from "@/hooks/useLeaks";
import { getCurrentPosition } from "@/lib/location";
import { REGIONAL_CITIES, DEFAULT_CITY_ID, getCityById, cityFullName } from "@/lib/cities";
import { LEAK_TYPE_LABEL, LEAK_TYPE_COLOR, type Leak, type LeakType } from "@/types/leak";
import { Plus, X, Loader2, MapPin, Filter, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/")({
  component: MapPage,
});

function MapPage() {
  const { data: leaks = [], isLoading } = useLeaks();
  const [selected, setSelected] = useState<Leak | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(null);

  const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);
  const city = getCityById(cityId);
  const [center, setCenter] = useState<LatLngExpression>([city.lat, city.lng]);
  const [usingGps, setUsingGps] = useState(false);

  // Filtros do mapa
  const ALL_TYPES: LeakType[] = ["cavalete", "ramal", "rede", "outros"];
  const [selectedTypes, setSelectedTypes] = useState<LeakType[]>(ALL_TYPES);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filteredLeaks = useMemo(() => {
    return leaks.filter((l) => {
      if (!selectedTypes.includes(l.type)) return false;
      const day = l.createdAt.slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [leaks, selectedTypes, dateFrom, dateTo]);

  const toggleType = (t: LeakType) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const filtersActive =
    selectedTypes.length !== ALL_TYPES.length || !!dateFrom || !!dateTo;

  // Tenta obter geolocalização apenas inicialmente; ao trocar a cidade, centraliza nela.
  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then((pos) => {
        if (cancelled) return;
        setCenter([pos.lat, pos.lng]);
        setUsingGps(true);
      })
      .catch(() => {
        // mantém centro da cidade selecionada
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Quando o usuário troca a cidade, recentralizamos o mapa nela
  const handleCityChange = (id: string) => {
    setCityId(id);
    const c = getCityById(id);
    setCenter([c.lat, c.lng]);
    setUsingGps(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPickedPoint({ lat, lng });
    setPickMode(false);
    setDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 sm:p-4">
        {/* Seletor de cidade da Regional */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-1 flex-col">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cidade da Regional
            </Label>
            <Select value={cityId} onValueChange={handleCityChange}>
              <SelectTrigger className="h-9 border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_CITIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {cityFullName(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicadores do último mês */}
        <MetricsBar cityId={cityId} />

        {/* Mapa em card */}
        <section className="relative flex-1 min-h-[420px] overflow-hidden rounded-xl border bg-card shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
          <LeakMap
            leaks={filteredLeaks}
            center={center}
            selectedId={selected?.id}
            onSelect={setSelected}
            onMapClick={handleMapClick}
            pickMode={pickMode}
            pickedPoint={pickedPoint}
          />

          {/* Botão de Filtros */}
          <div className="absolute left-3 bottom-3 z-[400]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant={filtersActive ? "default" : "secondary"}
                  className="h-9 gap-1.5 shadow-lg"
                >
                  <Filter className="size-4" />
                  Filtros
                  {filtersActive && (
                    <span className="ml-0.5 rounded-full bg-background/30 px-1.5 text-[10px] font-bold">
                      {filteredLeaks.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="z-[600] w-72 space-y-4">
                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipo de vazamento
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_TYPES.map((t) => {
                      const active = selectedTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleType(t)}
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            active
                              ? "border-transparent bg-foreground text-background"
                              : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                          }`}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: LEAK_TYPE_COLOR[t] }}
                          />
                          {LEAK_TYPE_LABEL[t]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Período
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="from" className="text-[11px] text-muted-foreground">De</Label>
                      <Input
                        id="from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="to" className="text-[11px] text-muted-foreground">Até</Label>
                      <Input
                        id="to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">
                    {filteredLeaks.length} de {leaks.length}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTypes(ALL_TYPES);
                      setDateFrom("");
                      setDateTo("");
                    }}
                    disabled={!filtersActive}
                  >
                    Limpar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
            <StatPill label="Total" value={filteredLeaks.length} />
            <StatPill label="Abertos" value={filteredLeaks.filter((l) => l.status === "open").length} accent="open" />
          </div>

          {/* Indicador de localização */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] -translate-x-1/2 rounded-full border bg-card/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-md backdrop-blur">
            <MapPin className="mr-1 inline size-3 text-primary" />
            {usingGps ? "Sua localização atual" : `Exibindo ${cityFullName(city)}`}
          </div>

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
