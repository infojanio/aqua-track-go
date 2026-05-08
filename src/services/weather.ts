import type { WeatherInfo } from "@/types/leak";

// WMO weather code → label PT-BR
const WMO_LABEL: Record<number, string> = {
  0: "Céu limpo",
  1: "Predominantemente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina com geada",
  51: "Garoa fraca",
  53: "Garoa moderada",
  55: "Garoa intensa",
  61: "Chuva fraca",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante fraca",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Grãos de neve",
  80: "Pancadas de chuva fracas",
  81: "Pancadas de chuva moderadas",
  82: "Pancadas de chuva fortes",
  85: "Pancadas de neve fracas",
  86: "Pancadas de neve fortes",
  95: "Trovoada",
  96: "Trovoada com granizo fraco",
  99: "Trovoada com granizo forte",
};

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherInfo | undefined> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    const code = data?.current?.weather_code as number | undefined;
    const temp = data?.current?.temperature_2m as number | undefined;
    if (typeof temp !== "number" || typeof code !== "number") return undefined;
    return {
      condition: WMO_LABEL[code] ?? "Desconhecida",
      temperatureC: Math.round(temp * 10) / 10,
    };
  } catch {
    return undefined;
  }
}
