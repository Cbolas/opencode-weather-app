import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { removeCity } from "../../src/actions/removeCity.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import {
  installLogSpy,
  installPrompt,
  makeCity,
  makeConfig,
  makeLisboa,
  pathExists,
  restoreGlobals,
  stripAnsi,
  useTempDir,
} from "../helpers.ts";

let lines: string[];
let restoreDir: () => void;
beforeEach(() => {
  restoreDir = useTempDir();
  lines = installLogSpy();
});
afterEach(() => {
  restoreDir();
  restoreGlobals();
});

describe("removeCity", () => {
  test("avisa quando não há cidades cadastradas", async () => {
    const config = makeConfig();
    await removeCity(config);
    expect(lines.map(stripAnsi)).toContain("  Nenhuma cidade cadastrada.");
    expect(await pathExists("cities.json")).toBe(false);
  });

  test("remove a cidade escolhida e persiste o restante", async () => {
    installPrompt(["1"]);
    const saoPaulo = makeCity();
    const lisboa = makeLisboa();
    const config = makeConfig({ cities: [saoPaulo, lisboa] });
    await removeCity(config);
    expect(config.cities).toEqual([lisboa]);
    expect(await loadCities()).toEqual({ cities: [lisboa] });
    expect(lines.map(stripAnsi)).toContain("  Removida: São Paulo (São Paulo), Brasil");
  });

  test("limpa a cidade padrão quando ela é removida", async () => {
    installPrompt(["1"]);
    const saoPaulo = makeCity();
    const lisboa = makeLisboa();
    const config = makeConfig({ cities: [saoPaulo, lisboa], defaultCity: saoPaulo });
    await removeCity(config);
    expect(config.cities).toEqual([lisboa]);
    expect(config.defaultCity).toBeUndefined();
    expect((await loadCities()).defaultCity).toBeUndefined();
  });

  test("cancela com 0 sem alterar o arquivo", async () => {
    installPrompt(["0"]);
    const config = makeConfig({ cities: [makeCity()] });
    await removeCity(config);
    expect(config.cities).toEqual([makeCity()]);
    expect(await pathExists("cities.json")).toBe(false);
  });

  test("rejeita número fora da faixa ou não numérico", async () => {
    installPrompt(["5", "abc", null, "-1"]);
    const config = makeConfig({ cities: [makeCity(), makeLisboa()] });
    for (let run = 0; run < 4; run++) {
      await removeCity(config);
    }
    expect(config.cities).toHaveLength(2);
    expect(await pathExists("cities.json")).toBe(false);
    const invalid = lines.map(stripAnsi).filter((line) => line === "  Número inválido.");
    expect(invalid).toHaveLength(4);
  });
});
