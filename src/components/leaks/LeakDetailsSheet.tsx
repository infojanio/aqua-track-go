import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LEAK_MARKER_LABEL, LEAK_STATUS_LABEL, LEAK_TYPE_LABEL, type Leak, type LeakMarkerType, type LeakStatus, type LeakType } from "@/types/leak";
import { useDeleteLeak, useUpdateLeak } from "@/hooks/useLeaks";
import { useAuth } from "@/lib/auth";
import { StatusBadge, TypeBadge } from "./Badges";
import { Camera, Cloud, Gauge, Loader2, MapPin, Save, Thermometer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

interface Props {
  leak: Leak | null;
  onClose: () => void;
}

const LEAK_TYPES: LeakType[] = ["cavalete", "ramal", "rede", "outros"];

export function LeakDetailsSheet({ leak, onClose }: Props) {
  const update = useUpdateLeak();
  const remove = useDeleteLeak();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<LeakType>("cavalete");
  const [pressure, setPressure] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (leak) {
      setType(leak.type);
      setPressure(String(leak.pressure));
      setDescription(leak.description ?? "");
    }
  }, [leak]);

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

  const saveDetails = async () => {
    const p = Number(pressure);
    if (pressure === "" || Number.isNaN(p) || p < 0) {
      toast.error("Pressão inválida");
      return;
    }
    try {
      await update.mutateAsync({
        id: leak.id,
        patch: { type, pressure: p, description: description || undefined },
      });
      toast.success("Detalhes atualizados");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(leak.id);
      toast.success("Pino removido");
      onClose();
    } catch {
      toast.error("Erro ao remover");
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

          <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Editar detalhes</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as LeakType)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAK_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{LEAK_TYPE_LABEL[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Gauge className="size-3.5" /> Pressão (mca)</Label>
                <Input
                  inputMode="decimal"
                  value={pressure}
                  onChange={(e) => setPressure(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detalhes do vazamento..."
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-full"
              onClick={saveDetails}
              disabled={update.isPending}
            >
              {update.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Salvar alterações
            </Button>
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

          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={uploadAfter} />
          <Button
            variant="secondary"
            className="h-11 w-full"
            onClick={() => fileRef.current?.click()}
            disabled={update.isPending}
          >
            {update.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Camera className="mr-2 size-4" />}
            {leak.photos.after ? "Substituir foto do reparo" : "Adicionar foto do reparo"}
          </Button>

          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11 w-full" disabled={remove.isPending}>
                  {remove.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
                  Remover pino
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover este vazamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O pino será removido permanentemente do mapa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
