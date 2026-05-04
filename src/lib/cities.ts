// Cidades da Regional — coordenadas aproximadas (centro urbano)
export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const REGIONAL_CITIES: City[] = [
  { id: "campos-belos", name: "Campos Belos", state: "GO", lat: -13.0356, lng: -46.7728 },
  { id: "alto-paraiso", name: "Alto Paraíso", state: "GO", lat: -14.1326, lng: -47.5103 },
  { id: "cavalcante", name: "Cavalcante", state: "GO", lat: -13.7975, lng: -47.4558 },
  { id: "teresina", name: "Teresina de Goiás", state: "GO", lat: -13.7725, lng: -47.2664 },
  { id: "sao-jorge", name: "São Jorge", state: "GO", lat: -14.0667, lng: -47.7833 },
  { id: "monte-alegre", name: "Monte Alegre de Goiás", state: "GO", lat: -13.2547, lng: -46.8917 },
  { id: "divinopolis", name: "Divinópolis de Goiás", state: "GO", lat: -13.2925, lng: -46.4078 },
  { id: "pouso-alto", name: "Pouso Alto", state: "GO", lat: -13.1333, lng: -46.6333 },
  { id: "sao-domingos", name: "São Domingos", state: "GO", lat: -13.3989, lng: -46.3175 },
  { id: "posse", name: "Posse", state: "GO", lat: -14.0894, lng: -46.3692 },
  { id: "iaciara", name: "Iaciara", state: "GO", lat: -14.0911, lng: -46.6336 },
  { id: "guarani", name: "Guarani de Goiás", state: "GO", lat: -13.9419, lng: -46.5311 },
];

export const DEFAULT_CITY_ID = "campos-belos";

export function getCityById(id: string): City {
  return REGIONAL_CITIES.find((c) => c.id === id) ?? REGIONAL_CITIES[0];
}

export function cityFullName(c: City) {
  return `${c.name} - ${c.state}`;
}
