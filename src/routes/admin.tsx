import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONAL_CITIES, replaceRegionalCities, type City } from "@/lib/cities";
import { saveCitiesOverride, setMetricOverride, getMetricOverride } from "@/lib/adminStore";
import { lastNMonths, formatMonthLabel, currentYM } from "@/lib/dates";
import { metricsService } from "@/services/metrics";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth role="admin">
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 p-4">
          <div>
            <h2 className="text-2xl font-bold">Administração</h2>
            <p className="text-sm text-muted-foreground">
              Cadastro de dados que alimentam o dashboard.
            </p>
          </div>
          <Tabs defaultValue="metrics">
            <TabsList>
              <TabsTrigger value="metrics">Métricas mensais</TabsTrigger>
              <TabsTrigger value="cities">Cidades</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics" className="mt-4">
              <MetricsForm />
            </TabsContent>
            <TabsContent value="cities" className="mt-4">
              <CitiesForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}

function MetricsForm() {
  const qc = useQueryClient();
  const months = useMemo(() => lastNMonths(12), []);
  const [cityId, setCityId] = useState(REGIONAL_CITIES[0]?.id ?? "");
  const [ym, setYm] = useState(currentYM());
  const [produced, setProduced] = useState("");
  const [billed, setBilled] = useState("");

  const loadExisting = (c: string, m: string) => {
    const ov = getMetricOverride(c, m);
    if (ov) {
      setProduced(String(ov.producedVolumeM3));
      setBilled(String(ov.billedVolumeM3));
    } else {
      // Pré-carrega valores atuais (mock) para edição
      metricsService.getMonth(c, m).then((d) => {
        setProduced(String(d.producedVolumeM3));
        setBilled(String(d.billedVolumeM3));
      });
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(produced);
    const b = Number(billed);
    if (!cityId || !ym) return toast.error("Selecione cidade e mês.");
    if (!Number.isFinite(p) || p <= 0) return toast.error("Volume produzido inválido.");
    if (!Number.isFinite(b) || b < 0) return toast.error("Volume faturado inválido.");
    if (b > p) return toast.error("Faturado não pode ser maior que produzido.");
    setMetricOverride(cityId, ym, { producedVolumeM3: p, billedVolumeM3: b });
    qc.invalidateQueries({ queryKey: ["metrics"] });
    toast.success("Métrica salva com sucesso!");
  };

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Cidade</Label>
          <Select value={cityId} onValueChange={(v) => { setCityId(v); loadExisting(v, ym); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIONAL_CITIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Mês de referência</Label>
          <Select value={ym} onValueChange={(v) => { setYm(v); loadExisting(cityId, v); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">{formatMonthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Volume produzido (m³)</Label>
          <Input type="number" min={0} value={produced} onChange={(e) => setProduced(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Volume faturado (m³)</Label>
          <Input type="number" min={0} value={billed} onChange={(e) => setBilled(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit"><Save className="mr-1.5 size-4" />Salvar</Button>
        </div>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Perda calculada = (Produzido − Faturado) ÷ Produzido. Os valores são aplicados imediatamente no dashboard.
      </p>
    </Card>
  );
}

function CitiesForm() {
  const qc = useQueryClient();
  const [list, setList] = useState<City[]>(() => REGIONAL_CITIES.map((c) => ({ ...c })));

  const update = (i: number, patch: Partial<City>) => {
    setList((l) => l.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };
  const remove = (i: number) => setList((l) => l.filter((_, idx) => idx !== i));
  const add = () =>
    setList((l) => [
      ...l,
      { id: `cidade-${Date.now()}`, name: "", state: "GO", lat: 0, lng: 0 },
    ]);

  const save = () => {
    const cleaned = list
      .map((c) => ({ ...c, name: c.name.trim(), id: c.id.trim() }))
      .filter((c) => c.id && c.name);
    if (cleaned.length === 0) return toast.error("Adicione ao menos uma cidade.");
    const ids = new Set(cleaned.map((c) => c.id));
    if (ids.size !== cleaned.length) return toast.error("IDs de cidade duplicados.");
    saveCitiesOverride(cleaned);
    replaceRegionalCities(cleaned);
    qc.invalidateQueries();
    toast.success("Cidades atualizadas!");
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Edite, adicione ou remova cidades da regional.</p>
        <Button size="sm" variant="outline" onClick={add}><Plus className="mr-1.5 size-4" />Nova cidade</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Nome</th>
              <th className="px-2 py-1">UF</th>
              <th className="px-2 py-1">Lat</th>
              <th className="px-2 py-1">Lng</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1"><Input value={c.id} onChange={(e) => update(i, { id: e.target.value })} /></td>
                <td className="px-2 py-1"><Input value={c.name} onChange={(e) => update(i, { name: e.target.value })} /></td>
                <td className="px-2 py-1 w-20"><Input value={c.state} onChange={(e) => update(i, { state: e.target.value })} /></td>
                <td className="px-2 py-1 w-32"><Input type="number" step="any" value={c.lat} onChange={(e) => update(i, { lat: Number(e.target.value) })} /></td>
                <td className="px-2 py-1 w-32"><Input type="number" step="any" value={c.lng} onChange={(e) => update(i, { lng: Number(e.target.value) })} /></td>
                <td className="px-2 py-1">
                  <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="size-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={save}><Save className="mr-1.5 size-4" />Salvar alterações</Button>
      </div>
    </Card>
  );
}
