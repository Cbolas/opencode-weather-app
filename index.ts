import {
  addCity,
  ask,
  openSettings,
  printMenu,
  removeCity,
  setDefaultCity,
  showAllWeather,
  showDefaultWeather,
} from "./src/menu.ts";
import { loadConfig } from "./src/storage.ts";

async function main(): Promise<void> {
  const config = await loadConfig();
  while (true) {
    printMenu(config);
    const option = ask("  Selecione uma opção: ");
    if (option === null) {
      console.log("  Até logo!");
      return;
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
      case "8":
        await openSettings(config);
        break;
      case "9":
        console.log("  Até logo!");
        return;
      default:
        console.log("  Opção inválida.");
    }
  }
}

await main();
