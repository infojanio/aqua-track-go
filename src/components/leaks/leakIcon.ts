import L from "leaflet";
import type { LeakType } from "@/types/leak";

const COLORS: Record<LeakType, string> = {
  cavalete: "#1a73e8", // Google blue
  ramal: "#f9ab00",    // Google amber
  rede: "#ea4335",     // Google red
  outros: "#5f6368",   // Google gray
};

// Pushpin clássico estilo Google Earth/Maps:
// cabeça arredondada com brilho + haste fina + sombra no chão.
function pushpinSVG(color: string, size = { w: 28, h: 42 }) {
  const { w, h } = size;
  return `
    <svg viewBox="0 0 28 42" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="white" stop-opacity="0.85"/>
          <stop offset="35%" stop-color="${color}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${color}"/>
        </radialGradient>
      </defs>
      <!-- haste -->
      <path d="M14 14 L14 40" stroke="rgba(0,0,0,0.55)" stroke-width="2" stroke-linecap="round"/>
      <!-- cabeça -->
      <circle cx="14" cy="12" r="10" fill="url(#g)" stroke="rgba(0,0,0,0.45)" stroke-width="1.2"/>
      <!-- brilho -->
      <ellipse cx="10.5" cy="8" rx="3.2" ry="2" fill="white" fill-opacity="0.7"/>
    </svg>
  `;
}

// Ícone padrão (pushpin estilo Google Earth)
export function leakIcon(type: LeakType, pulse = false) {
  const color = COLORS[type];
  const html = `
    <div class="gpin-wrap">
      ${pulse ? `<span class="gpin-pulse" style="background:${color}"></span>` : ""}
      <span class="gpin-shadow"></span>
      <span class="gpin-svg">${pushpinSVG(color)}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "leak-pin-icon",
    iconSize: [28, 44],
    iconAnchor: [14, 42],
    popupAnchor: [0, -36],
  });
}

// Ícone para o ponto sendo posicionado (arrastável) — pushpin maior em vermelho.
export function pickPinIcon() {
  const color = "#ea4335";
  const html = `
    <div class="gpin-wrap gpin-wrap--pick">
      <span class="gpin-pulse" style="background:${color}"></span>
      <span class="gpin-shadow"></span>
      <span class="gpin-svg gpin-bounce">${pushpinSVG(color, { w: 36, h: 54 })}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "leak-pin-icon",
    iconSize: [36, 56],
    iconAnchor: [18, 54],
  });
}
