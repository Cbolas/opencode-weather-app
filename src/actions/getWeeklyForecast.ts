import { geocode } from "../api/geocoding.ts";
import { getDailyForecast } from "../api/weather.ts";
import { ask } from "../presentation/input.ts";
import { errorMessage, printCityList, printDailyForecast } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";

async function searchForecastCity(): Promise<City | null> {
  const name = ask("  Nome da cidade: ");
  if (!name) return null;
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`  Cidade não encontrada: "${name}"`));
      return null;
    }
    return city;
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
    return null;
  }
}

async function chooseForecastCity(config: Config): Promise<City | null> {
  if (config.cities.length === 0) return searchForecastCity();
  console.log("  Cidades cadastradas:");
  printCityList(config);
  console.log("   0. Buscar por nome");
  const answer = ask("  Escolha a cidade para a previsão: ");
  if (answer === "0") return searchForecastCity();
  const number = answer === null ? Number.NaN : Number(answer);
  const city = Number.isInteger(number) ? config.cities[number - 1] : undefined;
  if (!city || number < 1) {
    console.log(red("  Escolha inválida."));
    return null;
  }
  return city;
}

export async function showWeeklyForecast(config: Config): Promise<void> {
  const city = await chooseForecastCity(config);
  if (!city) return;
  try {
    const forecast = await getDailyForecast(city, config.unit);
    console.log(`  Previsão para 7 dias — ${formatCity(city)}:`);
    forecast.forEach((day) => printDailyForecast(day, config.unit));
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
  }
}
