import { printCityList } from "../presentation/output.ts";
import type { Config } from "../types/Config.ts";

export async function listCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  Nenhuma cidade cadastrada. Use a opção 3 para adicionar.");
    return;
  }
  console.log("  Cidades cadastradas:");
  printCityList(config);
}
