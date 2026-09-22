import { geocode } from "../api/geocoding.ts";
import { ask } from "../presentation/input.ts";
import { errorMessage, printCityList } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

async function setDefaultBySearch(config: Config): Promise<void> {
  const name = ask("  Nome da cidade: ");
  if (!name) return;
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`  Cidade não encontrada: "${name}"`));
      return;
    }
    if (!config.cities.some((existing) => existing.id === city.id)) {
      config.cities.push(city);
      console.log(green(`  Adicionada: ${formatCity(city)}`));
    }
    config.defaultCity = city;
    await saveCities({ cities: config.cities, defaultCity: config.defaultCity });
    console.log(green(`  Cidade padrão definida: ${formatCity(city)}`));
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
  }
}

export async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    await setDefaultBySearch(config);
    return;
  }
  console.log("  Cidades cadastradas:");
  printCityList(config);
  console.log("   0. Buscar por nome");
  const answer = ask("  Escolha a cidade padrão: ");
  if (answer === "0") {
    await setDefaultBySearch(config);
    return;
  }
  const number = answer === null ? Number.NaN : Number(answer);
  const city = Number.isInteger(number) ? config.cities[number - 1] : undefined;
  if (!city || number < 1) {
    console.log(red("  Escolha inválida."));
    return;
  }
  config.defaultCity = city;
  await saveCities({ cities: config.cities, defaultCity: config.defaultCity });
  console.log(green(`  Cidade padrão definida: ${formatCity(city)}`));
}
