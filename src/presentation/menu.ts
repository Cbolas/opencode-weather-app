import { addCity } from "../actions/addCity.ts";
import { showAllWeather, showDefaultWeather } from "../actions/getWeather.ts";
import { showWeeklyForecast } from "../actions/getWeeklyForecast.ts";
import { listCities } from "../actions/listCities.ts";
import { openSettings } from "../actions/openSettings.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { isMenuOption } from "../types/MenuOption.ts";
import { ask } from "./input.ts";
import { bold, cyan, red } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

const LINE = "═".repeat(40);

export function printMenu(config: Config): void {
  console.log("");
  console.log(cyan(LINE));
  console.log(`         ${cyan(bold("WEATHER CLI"))}`);
  console.log(cyan(LINE));
  console.log(`  ${cyan("1.")} Clima da cidade padrão`);
  console.log(`  ${cyan("2.")} Clima de todas as cidades (${config.cities.length})`);
  console.log(`  ${cyan("3.")} Buscar e adicionar cidade`);
  console.log(`  ${cyan("4.")} Remover cidade`);
  console.log(`  ${cyan("5.")} Definir cidade padrão`);
  console.log(`  ${cyan("6.")} Previsão para 7 dias`);
  console.log(`  ${cyan("7.")} Listar cidades`);
  console.log(`  ${cyan("8.")} Configurações (${unitSymbol(config.unit)})`);
  console.log(`  ${cyan("9.")} Sair`);
  console.log(cyan(LINE));
}

export async function runMenu(config: Config): Promise<void> {
  while (true) {
    printMenu(config);
    const option = ask("  Selecione uma opção: ");
    if (option === null) {
      console.log("  Até logo!");
      return;
    }
    if (!isMenuOption(option)) {
      console.log(red("  Opção inválida."));
      continue;
    }
    switch (option) {
      case "1":
        await showDefaultWeather(config);
        break;
      case "2":
        await showAllWeather(config);
        break;
      case "3":
        await addCity(config);
        break;
      case "4":
        await removeCity(config);
        break;
      case "5":
        await setDefaultCity(config);
        break;
      case "6":
        await showWeeklyForecast(config);
        break;
      case "7":
        await listCities(config);
        break;
      case "8":
        await openSettings(config);
        break;
      case "9":
        console.log("  Até logo!");
        return;
    }
  }
}
