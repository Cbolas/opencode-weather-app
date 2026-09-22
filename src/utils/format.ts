import { WEATHER_CODES } from "./constants.ts";
import type { City } from "../types/City.ts";
import type { Unit } from "../types/Weather.ts";

export function describeWeatherCode(code: number): string {
  return WEATHER_CODES[code] ?? "Condição desconhecida";
}

export function formatForecastDate(date: string): string {
  const day = new Date(`${date}T12:00:00`);
  if (Number.isNaN(day.getTime())) return date;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })
    .format(day)
    .replace(/[.,]/g, "");
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  const region = city.admin1 ? ` (${city.admin1})` : "";
  const country = city.country ? `, ${city.country}` : "";
  return `${city.name}${region}${country}`;
}
