import { CITIES_FILE, isCity, saveCities } from "./citiesStorage.ts";
import { saveUnit } from "./settingsStorage.ts";
import type { City } from "../types/City.ts";
import type { Unit } from "../types/Weather.ts";

const LEGACY_FILE = "weather.json";
const BACKUP_FILE = "weather.json.bak";

export async function migrateLegacyConfig(): Promise<void> {
  const legacy = Bun.file(LEGACY_FILE);
  const cities = Bun.file(CITIES_FILE);
  if (!(await legacy.exists()) || (await cities.exists())) return;
  try {
    const data: unknown = await legacy.json();
    if (typeof data !== "object" || data === null) return;
    const raw = data as Record<string, unknown>;
    const unit: Unit = raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
    const cityList: City[] = Array.isArray(raw.cities) ? raw.cities.filter(isCity) : [];
    const defaultCity = isCity(raw.defaultCity) ? raw.defaultCity : undefined;
    await saveCities({ cities: cityList, defaultCity });
    await saveUnit(unit);
    await Bun.write(BACKUP_FILE, legacy);
    await legacy.unlink();
  } catch {
    // Mantém o arquivo legado intacto se a migração falhar.
  }
}
