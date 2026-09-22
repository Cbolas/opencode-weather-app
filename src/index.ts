import { runMenu } from "./presentation/menu.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { migrateLegacyConfig } from "./storage/migrate.ts";
import { loadUnit } from "./storage/settingsStorage.ts";
import type { Config } from "./types/Config.ts";

await migrateLegacyConfig();
const [unit, savedCities] = await Promise.all([loadUnit(), loadCities()]);
const config: Config = {
  unit,
  cities: savedCities.cities,
  defaultCity: savedCities.defaultCity,
};
await runMenu(config);
