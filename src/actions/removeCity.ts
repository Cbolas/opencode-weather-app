import { ask } from "../presentation/input.ts";
import { printCityList } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

export async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  Nenhuma cidade cadastrada.");
    return;
  }
  console.log("  Cidades cadastradas:");
  printCityList(config);
  const answer = ask("  Número da cidade a remover (0 para cancelar): ");
  const number = answer === null ? Number.NaN : Number(answer);
  if (!Number.isInteger(number) || number < 0 || number > config.cities.length) {
    console.log(red("  Número inválido."));
    return;
  }
  if (number === 0) return;
  const city = config.cities[number - 1];
  if (!city) {
    console.log(red("  Número inválido."));
    return;
  }
  config.cities = config.cities.filter((existing) => existing.id !== city.id);
  if (config.defaultCity?.id === city.id) config.defaultCity = undefined;
  await saveCities({ cities: config.cities, defaultCity: config.defaultCity });
  console.log(green(`  Removida: ${formatCity(city)}`));
}
