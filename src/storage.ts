import type { City, Config, Unit } from "./types.ts";

const CONFIG_FILE = "weather.json";

function isCity(value: unknown): value is City {
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

function defaultConfig(): Config {
  return { unit: "celsius", cities: [] };
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_FILE);
  if (!(await file.exists())) return defaultConfig();
  try {
    const data: unknown = await file.json();
    if (typeof data !== "object" || data === null) return defaultConfig();
    const raw = data as Record<string, unknown>;
    const unit: Unit = raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
    const cities = Array.isArray(raw.cities) ? raw.cities.filter(isCity) : [];
    const defaultCity = isCity(raw.defaultCity) ? raw.defaultCity : undefined;
    return { unit, cities, defaultCity };
  } catch {
    return defaultConfig();
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.file(CONFIG_FILE).write(`${JSON.stringify(config, null, 2)}\n`);
}
