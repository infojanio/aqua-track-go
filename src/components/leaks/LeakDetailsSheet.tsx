import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAK_MARKER_LABEL, LEAK_STATUS_LABEL, LEAK_TYPE_LABEL, type Leak, type LeakMarkerType, type LeakStatus } from "@/types/leak";
import { useUpdateLeak } from "@/hooks/useLeaks";
import { StatusBadge, TypeBadge } from "./Badges";
import { Camera, Cloud, Gauge, Loader2, MapPin, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

interface Props {
  leak: Leak | null;
  onClose: () => void;
}

export function LeakDetailsSheet({ leak, onClose }: Props) {
  const update = useUpdateLeak();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!leak) return null;

  const setStatus = async (status: LeakStatus) => {
    try {
      await update.mutateAsync({ id: leak.id, patch: { status } });
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const setMarkerType = async (markerType: LeakMarkerType) => {
    try {
      await update.mutateAsync({ id: leak.id, patch: { markerType } });
      toast.success("Tipo de marcador atualizado");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const uploadAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await update.mutateAsync({
          id: leak.id,
          patch: { photos: { after: reader.result as string } },
        });
        toast.success("Foto enviada");
      } catch {
        toast.error("Erro no upload");
      }
    };
    reader.readAsDataURL(f);
  };

  return (
    <Sheet open={!!leak} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes do vazamento</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={leak.type} />
            <StatusBadge status={leak.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Tipo" value={LEAK_TYPE_LABEL[leak.type]} />
            <Stat
              label="Pressão (mca)"
              value={String(leak.pressure)}
              icon={<Gauge className="size-4" />}
            />
            <Stat
              label="Registrado"
              value={new Date(leak.createdAt).toLocaleString("pt-BR")}
            />
            <Stat
              label="Coordenadas"
              value={`${leak.latitude.toFixed(4)}, ${leak.longitude.toFixed(4)}`}
              icon={<MapPin className="size-4" />}
            />
            {leak.weather && (
              <>
                <Stat
                  label="Condição"
                  value={leak.weather.condition}
                  icon={<Cloud className="size-4" />}
                />
                <Stat
                  label="Temperatura"
                  value={`${leak.weather.temperatureC} ºC`}
                  icon={<Thermometer className="size-4" />}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo de marcador</p>
            <Select value={leak.markerType ?? ""} onValueChange={(v) => setMarkerType(v as LeakMarkerType)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione o tipo de marcador" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LEAK_MARKER_LABEL) as LeakMarkerType[]).map((m) => (
                  <SelectItem key={m} value={m}>{LEAK_MARKER_LABEL[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {leak.description && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Descrição</p>
              <p className="text-sm">{leak.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
            <Select value={leak.status} onValueChange={(v) => setStatus(v as LeakStatus)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LEAK_STATUS_LABEL) as LeakStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{LEAK_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PhotoBlock label="Antes" src={leak.photos.before} />
            <PhotoBlock label="Depois" src={leak.photos.after} />
          </div>

          {leak.status === "done" && !leak.photos.after && (
            <>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={uploadAfter} />
              <Button
                variant="secondary"
                className="h-11 w-full"
                onClick={() => fileRef.current?.click()}
                disabled={update.isPending}
              >
                {update.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Camera className="mr-2 size-4" />}
                Adicionar foto do reparo
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
        {icon}{value}
      </p>
    </div>
  );
}

function PhotoBlock({ label, src }: { label: string; src?: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {src ? (
        <img src={src} alt={label} className="h-32 w-full rounded-md object-cover" />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
          Sem foto
        </div>
      )}
    </div>
  );
}
