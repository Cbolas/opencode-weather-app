import type { City, ForecastResponse, GeocodingResponse, Unit } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function fetchJson(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await Bun.sleep(400);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {}
  }
  throw new Error("Falha ao contatar o OpenMeteo. Verifique sua conexão.");
}

export async function geocode(name: string): Promise<City | null> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=pt&format=json`;
  const data: unknown = await fetchJson(url);
  if (typeof data !== "object" || data === null) {
    throw new Error("Resposta inesperada da API de geocoding.");
  }
  const { results } = data as GeocodingResponse;
  if (!Array.isArray(results) || results.length === 0) return null;
  const result = results[0];
  if (
    !result ||
    typeof result.id !== "number" ||
    typeof result.name !== "string" ||
    typeof result.latitude !== "number" ||
    typeof result.longitude !== "number"
  ) {
    throw new Error("Resposta inesperada da API de geocoding.");
  }
  const country =
    typeof result.country === "string" ? result.country : (result.country_code ?? "");
  return {
    id: result.id,
    name: result.name,
    country,
    admin1: typeof result.admin1 === "string" ? result.admin1 : undefined,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function getTemperature(city: City, unit: Unit): Promise<number> {
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${unit}`;
  const data: unknown = await fetchJson(url);
  if (typeof data !== "object" || data === null) {
    throw new Error("Resposta inesperada da API de previsão.");
  }
  const temperature = (data as ForecastResponse).current?.temperature_2m;
  if (typeof temperature !== "number") {
    throw new Error("Resposta inesperada da API de previsão.");
  }
  return temperature;
}
