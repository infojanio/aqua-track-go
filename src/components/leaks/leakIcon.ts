import L from "leaflet";
import type { LeakType } from "@/types/leak";

const COLORS: Record<LeakType, string> = {
  cavalete: "#2b7fd6",
  ramal: "#e0b13a",
  rede: "#dc3545",
  outros: "#6b7280",
};

// Ícone padrão (pin de gota destacado)
export function leakIcon(type: LeakType, pulse = false) {
  const color = COLORS[type];
  const html = `
    <div class="leak-pin-wrap">
      ${pulse ? `<span class="leak-pin-pulse" style="background:${color}"></span>` : ""}
      <span class="leak-pin-drop" style="--pin-color:${color}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.5c-3.6 4.2-6 7.4-6 10.4a6 6 0 0 0 12 0c0-3-2.4-6.2-6-10.4z"/>
        </svg>
      </span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "leak-pin-icon",
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -38],
  });
}

// Ícone para o ponto sendo posicionado (arrastável) — bem destacado
export function pickPinIcon() {
  const html = `
    <div class="leak-pick-wrap">
      <span class="leak-pick-pulse"></span>
      <span class="leak-pick-pin">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s-7-7.6-7-13a7 7 0 1 1 14 0c0 5.4-7 13-7 13z"/>
          <circle cx="12" cy="9" r="2.6" fill="white" stroke="none"/>
        </svg>
      </span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "leak-pin-icon",
    iconSize: [44, 56],
    iconAnchor: [22, 54],
  });
}
