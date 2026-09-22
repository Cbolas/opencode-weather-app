import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { migrateLegacyConfig } from "../../src/storage/migrate.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import { loadUnit } from "../../src/storage/settingsStorage.ts";
import { makeCity, pathExists, readJsonFile, useTempDir } from "../helpers.ts";

let restoreDir: () => void;
beforeEach(() => {
  restoreDir = useTempDir();
});
afterEach(() => restoreDir());

async function writeLegacy(data: unknown): Promise<void> {
  await Bun.write("weather.json", JSON.stringify(data));
}

describe("migrateLegacyConfig", () => {
  test("não faz nada quando não há arquivo legado", async () => {
    await migrateLegacyConfig();
    expect(await pathExists("cities.json")).toBe(false);
    expect(await pathExists("settings.json")).toBe(false);
  });

  test("não migra quando cities.json já existe", async () => {
    await writeLegacy({ unit: "fahrenheit" });
    await Bun.write("cities.json", JSON.stringify({ cities: [] }));
    await migrateLegacyConfig();
    expect(await pathExists("weather.json")).toBe(true);
    expect(await readJsonFile("cities.json")).toEqual({ cities: [] });
    expect(await pathExists("settings.json")).toBe(false);
    expect(await pathExists("weather.json.bak")).toBe(false);
  });

  test("migra cidades, cidade padrão e unidade do arquivo legado", async () => {
    const saoPaulo = makeCity();
    await writeLegacy({ unit: "fahrenheit", cities: [saoPaulo], defaultCity: saoPaulo });
    await migrateLegacyConfig();
    expect(await pathExists("weather.json")).toBe(false);
    expect(await loadCities()).toEqual({ cities: [saoPaulo], defaultCity: saoPaulo });
    expect(await loadUnit()).toBe("fahrenheit");
    expect(await readJsonFile("weather.json.bak")).toEqual({
      unit: "fahrenheit",
      cities: [saoPaulo],
      defaultCity: saoPaulo,
    });
  });

  test("aplica padrões seguros para conteúdo legado parcial", async () => {
    await writeLegacy({ cities: [{ id: "inválido" }] });
    await migrateLegacyConfig();
    expect(await loadCities()).toEqual({ cities: [] });
    expect(await loadUnit()).toBe("celsius");
  });

  test("mantém o legado intacto quando o JSON é inválido", async () => {
    await Bun.write("weather.json", "não é json");
    await migrateLegacyConfig();
    expect(await pathExists("weather.json")).toBe(true);
    expect(await pathExists("cities.json")).toBe(false);
    expect(await pathExists("settings.json")).toBe(false);
  });
});
