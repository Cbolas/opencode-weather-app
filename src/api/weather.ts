import { fetchJson } from "./client.ts";
import type { City } from "../types/City.ts";
import type {
  DailyForecast,
  DailyForecastResponse,
  ForecastResponse,
  Unit,
} from "../types/Weather.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

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
