import type { City } from "../types/City.ts";

export const CITIES_FILE = "cities.json";

export interface CitiesState {
  cities: City[];
  defaultCity?: City;
}

export function isCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const city = value as Record<string, unknown>;
  return (
    typeof city.id === "number" &&
    typeof city.name === "string" &&
    typeof city.country === "string" &&
    (city.admin1 === undefined || typeof city.admin1 === "string") &&
    typeof city.latitude === "number" &&
    typeof city.longitude === "number"
  );
}

function defaultState(): CitiesState {
  return { cities: [] };
}

export async function loadCities(): Promise<CitiesState> {
  const file = Bun.file(CITIES_FILE);
  if (!(await file.exists())) return defaultState();
  try {
    const data: unknown = await file.json();
    if (typeof data !== "object" || data === null) return defaultState();
    const raw = data as Record<string, unknown>;
    const cities = Array.isArray(raw.cities) ? raw.cities.filter(isCity) : [];
    const defaultCity = isCity(raw.defaultCity) ? raw.defaultCity : undefined;
    return { cities, defaultCity };
  } catch {
    return defaultState();
  }
}

export async function saveCities(state: CitiesState): Promise<void> {
  await Bun.file(CITIES_FILE).write(`${JSON.stringify(state, null, 2)}\n`);
}
