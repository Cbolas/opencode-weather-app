import { getTemperature } from "../api/weather.ts";
import { bold, cyan, red, yellow } from "../utils/colors.ts";
import {
  describeWeatherCode,
  formatCity,
  formatForecastDate,
  unitSymbol,
} from "../utils/format.ts";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import type { DailyForecast, Unit } from "../types/Weather.ts";

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

export function printCityList(config: Config): void {
  config.cities.forEach((city, index) => {
    const marker = config.defaultCity?.id === city.id ? " (padrão)" : "";
    console.log(`   ${index + 1}. ${formatCity(city)}${marker}`);
  });
}

export async function printWeather(city: City, unit: Unit): Promise<void> {
  try {
    const temperature = await getTemperature(city, unit);
    console.log(`  ${formatCity(city)} — ${yellow(bold(`${temperature} ${unitSymbol(unit)}`))}`);
  } catch (error) {
    console.log(`  ${formatCity(city)} — ${red(`indisponível (${errorMessage(error)})`)}`);
  }
}

export function printDailyForecast(day: DailyForecast, unit: Unit): void {
  const temps = `${cyan(`${day.min}°`)} / ${yellow(bold(`${day.max} ${unitSymbol(unit)}`))}`;
  console.log(
    `  ${formatForecastDate(day.date)} — ${describeWeatherCode(day.weatherCode)}, ${temps}`,
  );
}
