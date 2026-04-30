// Localização padrão: Campos Belos - GO
export const DEFAULT_CENTER = {
  lat: -13.0356,
  lng: -46.7728,
  label: "Campos Belos - GO",
} as const;

export function getCurrentPosition(timeoutMs = 6000): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("GPS indisponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
