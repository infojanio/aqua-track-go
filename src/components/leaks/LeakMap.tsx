import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { leakIcon, pickPinIcon } from "./leakIcon";
import { LEAK_TYPE_LABEL, type Leak } from "@/types/leak";
import { StatusBadge, TypeBadge } from "./Badges";
import { Droplets, Gauge, ImageIcon } from "lucide-react";

interface Props {
  leaks: Leak[];
  center?: LatLngExpression;
  selectedId?: string | null;
  onSelect?: (leak: Leak) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
  pickedPoint?: { lat: number; lng: number } | null;
  onPickedPointChange?: (p: { lat: number; lng: number }) => void;
}

function ClickHandler({ onMapClick, enabled }: { onMapClick?: (lat: number, lng: number) => void; enabled: boolean }) {
  useMapEvents({
    click(e) {
      if (enabled && onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ position, zoom = 16 }: { position: LatLngExpression | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), zoom), { duration: 0.8 });
  }, [position, zoom, map]);
  return null;
}

function CenterOn({ center }: { center: LatLngExpression }) {
  const map = useMap();
  const key = Array.isArray(center) ? `${center[0]},${center[1]}` : JSON.stringify(center);
  useEffect(() => {
    map.flyTo(center, 14, { duration: 0.9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

export function LeakMap({
  leaks,
  center = [-23.5505, -46.6333],
  selectedId,
  onSelect,
  onMapClick,
  pickMode = false,
  pickedPoint,
  onPickedPointChange,
}: Props) {
  const pickMarkerRef = useRef<LeafletMarker | null>(null);
  const selected = leaks.find((l) => l.id === selectedId);
  const flyPos: LatLngExpression | null = selected
    ? [selected.latitude, selected.longitude]
    : pickedPoint
    ? [pickedPoint.lat, pickedPoint.lng]
    : null;

  return (
    <div className={`relative h-full w-full ${pickMode ? "cursor-crosshair" : ""}`}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} enabled={pickMode} />
        <CenterOn center={center} />
        <FlyTo position={flyPos} />

        {leaks.map((leak) => (
          <Marker
            key={leak.id}
            position={[leak.latitude, leak.longitude]}
            icon={leakIcon(leak.type, leak.status === "open")}
            eventHandlers={{ click: () => onSelect?.(leak) }}
          >
            <Popup>
              <div className="min-w-[200px] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <TypeBadge type={leak.type} />
                  <StatusBadge status={leak.status} />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {LEAK_TYPE_LABEL[leak.type]}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="size-3.5" /> {leak.pressure} mca
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="size-3.5" />
                    {new Date(leak.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {leak.description && (
                  <p className="text-xs text-muted-foreground">{leak.description}</p>
                )}
                {leak.photos.before && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <ImageIcon className="size-3.5" /> Foto anexada
                  </div>
                )}
                <button
                  onClick={() => onSelect?.(leak)}
                  className="mt-1 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Ver detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {pickedPoint && (
          <Marker
            position={[pickedPoint.lat, pickedPoint.lng]}
            icon={pickPinIcon()}
            draggable
            autoPan
            ref={(ref) => {
              pickMarkerRef.current = ref as unknown as LeafletMarker | null;
            }}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as LeafletMarker;
                const ll = m.getLatLng();
                onPickedPointChange?.({ lat: ll.lat, lng: ll.lng });
              },
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Local do vazamento</p>
                <p className="text-muted-foreground">Arraste para ajustar a posição</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {pickMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-medium text-background shadow-lg">
          Toque no mapa para marcar a localização
        </div>
      )}

      {pickedPoint && !pickMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-medium text-background shadow-lg">
          Arraste o pino vermelho para ajustar a posição
        </div>
      )}
    </div>
  );
}
