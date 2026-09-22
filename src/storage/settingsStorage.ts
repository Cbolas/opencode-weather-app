import type { Unit } from "../types/Weather.ts";

export const SETTINGS_FILE = "settings.json";

function defaultUnit(): Unit {
  return "celsius";
}

export async function loadUnit(): Promise<Unit> {
  const file = Bun.file(SETTINGS_FILE);
  if (!(await file.exists())) return defaultUnit();
  try {
    const data: unknown = await file.json();
    if (typeof data !== "object" || data === null) return defaultUnit();
    const raw = data as Record<string, unknown>;
    return raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
  } catch {
    return defaultUnit();
  }
}

export async function saveUnit(unit: Unit): Promise<void> {
  await Bun.file(SETTINGS_FILE).write(`${JSON.stringify({ unit }, null, 2)}\n`);
}
