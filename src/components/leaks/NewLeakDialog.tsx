import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAK_MARKER_LABEL, LEAK_TYPE_LABEL, type LeakMarkerType, type LeakType } from "@/types/leak";
import { useCreateLeak } from "@/hooks/useLeaks";
import { fetchCurrentWeather } from "@/services/weather";
import { Camera, Crosshair, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRequestPickOnMap: () => void;
  pickedPoint: { lat: number; lng: number } | null;
}

const LEAK_TYPES: LeakType[] = ["cavalete", "ramal", "rede", "outros"];
const MARKER_TYPES: LeakMarkerType[] = ["medir_pressao", "pesquisa_haste", "pesquisa_geofone", "outros"];

export function NewLeakDialog({ open, onOpenChange, onRequestPickOnMap, pickedPoint }: Props) {
  const [type, setType] = useState<LeakType>("cavalete");
  const [markerType, setMarkerType] = useState<LeakMarkerType>("medir_pressao");
  const [pressure, setPressure] = useState<string>("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | undefined>();
  const [gpsLoading, setGpsLoading] = useState(false);
  const create = useCreateLeak();

  // Sync picked point from map
  useEffect(() => {
    if (pickedPoint) setCoords(pickedPoint);
  }, [pickedPoint]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setType("cavalete");
      setPressure("");
      setDescription("");
      setDatetime(new Date().toISOString().slice(0, 16));
      setCoords(null);
      setPhoto(undefined);
    }
  }, [open]);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS não disponível neste dispositivo");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast.success("Localização capturada");
      },
      () => {
        setGpsLoading(false);
        toast.error("Não foi possível obter localização");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      toast.error("Defina a localização do vazamento");
      return;
    }
    const p = Number(pressure);
    if (!pressure || Number.isNaN(p) || p < 0) {
      toast.error("Informe a pressão (mca)");
      return;
    }
    try {
      await create.mutateAsync({
        type,
        pressure: p,
        description: description || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
        createdAt: new Date(datetime).toISOString(),
        photos: photo ? { before: photo } : undefined,
      });
      toast.success("Vazamento registrado");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao registrar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar vazamento</DialogTitle>
          <DialogDescription>Preencha os dados do ponto de perda detectado.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as LeakType)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{LEAK_TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pressão (mca)</Label>
              <Input
                inputMode="decimal"
                placeholder="ex: 25"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Data e hora</Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Detalhes do vazamento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <Label className="flex items-center gap-1.5"><MapPin className="size-4" /> Localização</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" className="h-11" onClick={captureGPS} disabled={gpsLoading}>
                {gpsLoading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Crosshair className="mr-1.5 size-4" />}
                GPS
              </Button>
              <Button type="button" variant="secondary" className="h-11" onClick={() => { onOpenChange(false); onRequestPickOnMap(); }}>
                <MapPin className="mr-1.5 size-4" /> Mapa
              </Button>
            </div>
            {coords ? (
              <p className="text-xs text-muted-foreground">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma localização definida</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Camera className="size-4" /> Foto (antes)</Label>
            <Input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="h-11" />
            {photo && <img src={photo} alt="preview" className="mt-2 h-32 w-full rounded-md object-cover" />}
          </div>

          <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Registrar vazamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
