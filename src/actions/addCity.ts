import { geocode } from "../api/geocoding.ts";
import { ask } from "../presentation/input.ts";
import { errorMessage } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

export async function addCity(config: Config): Promise<void> {
  const name = ask("  Nome da cidade: ");
  if (!name) return;
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`  Cidade não encontrada: "${name}"`));
      return;
    }
    if (config.cities.some((existing) => existing.id === city.id)) {
      console.log(`  Já cadastrada: ${formatCity(city)}`);
      return;
    }
    config.cities.push(city);
    await saveCities({ cities: config.cities, defaultCity: config.defaultCity });
    console.log(green(`  Adicionada: ${formatCity(city)}`));
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
  }
}
