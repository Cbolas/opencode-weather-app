import { fetchJson } from "./client.ts";
import type { City } from "../types/City.ts";
import type { GeocodingResponse } from "../types/Geocoding.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

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
