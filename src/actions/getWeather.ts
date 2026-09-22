import { ask } from "../presentation/input.ts";
import { printWeather } from "../presentation/output.ts";
import { setDefaultCity } from "./setDefaultCity.ts";
import type { Config } from "../types/Config.ts";

export async function showDefaultWeather(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log("  Nenhuma cidade padrão definida.");
    const answer = ask("  Deseja definir agora? (s/n): ");
    if (answer !== null && answer.toLowerCase() === "s") await setDefaultCity(config);
    return;
  }
  await printWeather(config.defaultCity, config.unit);
}

export async function showAllWeather(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  Nenhuma cidade cadastrada. Use a opção 3 para adicionar.");
    return;
  }
  console.log("  Clima de todas as cidades:");
  await Promise.all(config.cities.map((city) => printWeather(city, config.unit)));
}
