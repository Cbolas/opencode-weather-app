import type {
  City,
  DailyForecast,
  DailyForecastResponse,
  ForecastResponse,
  GeocodingResponse,
  Unit,
} from "./types.ts";

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

export async function getDailyForecast(city: City, unit: Unit): Promise<DailyForecast[]> {
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto&temperature_unit=${unit}`;
  const data: unknown = await fetchJson(url);
  if (typeof data !== "object" || data === null) {
    throw new Error("Resposta inesperada da API de previsão.");
  }
  const daily = (data as DailyForecastResponse).daily;
  const times = daily?.time;
  const maxes = daily?.temperature_2m_max;
  const mins = daily?.temperature_2m_min;
  const codes = daily?.weather_code;
  if (
    !Array.isArray(times) ||
    !Array.isArray(maxes) ||
    !Array.isArray(mins) ||
    !Array.isArray(codes) ||
    times.length !== maxes.length ||
    times.length !== mins.length ||
    times.length !== codes.length
  ) {
    throw new Error("Resposta inesperada da API de previsão.");
  }
  const forecast: DailyForecast[] = [];
  for (let index = 0; index < times.length; index++) {
    const date = times[index];
    const max = maxes[index];
    const min = mins[index];
    const weatherCode = codes[index];
    if (
      typeof date !== "string" ||
      typeof max !== "number" ||
      typeof min !== "number" ||
      typeof weatherCode !== "number"
    ) {
      throw new Error("Resposta inesperada da API de previsão.");
    }
    forecast.push({ date, min, max, weatherCode });
  }
  return forecast;
}
