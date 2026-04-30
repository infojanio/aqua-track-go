import L from "leaflet";
import type { LeakType } from "@/types/leak";

const COLORS: Record<LeakType, string> = {
  cavalete: "#2b7fd6",
  ramal: "#e0b13a",
  rede: "#dc3545",
  outros: "#6b7280",
};

export function leakIcon(type: LeakType, pulse = false) {
  const color = COLORS[type];
  const html = `
    <div class="leak-pin-wrap">
      ${pulse ? `<span class="leak-pin-pulse" style="background:${color}"></span>` : ""}
      <span class="leak-pin" style="background:${color}">
        <span class="leak-pin-dot"></span>
      </span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "leak-pin-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
