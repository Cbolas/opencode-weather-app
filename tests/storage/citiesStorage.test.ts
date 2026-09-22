import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { isCity, loadCities, saveCities } from "../../src/storage/citiesStorage.ts";
import { makeCity, makeLisboa, useTempDir } from "../helpers.ts";
import type { CitiesState } from "../../src/storage/citiesStorage.ts";

let restoreDir: () => void;
beforeEach(() => {
  restoreDir = useTempDir();
});
afterEach(() => restoreDir());

describe("isCity", () => {
  test("aceita objeto City válido", () => {
    expect(isCity(makeCity())).toBe(true);
    expect(isCity(makeLisboa())).toBe(true);
  });

  test("aceita admin1 ausente", () => {
    expect(isCity(makeCity({ admin1: undefined }))).toBe(true);
  });

  test("rejeita valores que não são cidades", () => {
    expect(isCity(null)).toBe(false);
    expect(isCity(undefined)).toBe(false);
    expect(isCity("São Paulo")).toBe(false);
    expect(isCity(42)).toBe(false);
    expect(isCity({})).toBe(false);
    expect(isCity({ ...makeCity(), id: "1" })).toBe(false);
    expect(isCity({ ...makeCity(), name: 42 })).toBe(false);
    expect(isCity({ ...makeCity(), country: null })).toBe(false);
    expect(isCity({ ...makeCity(), latitude: "0" })).toBe(false);
    expect(isCity({ ...makeCity(), longitude: undefined })).toBe(false);
    expect(isCity({ ...makeCity(), admin1: 10 })).toBe(false);
  });
});

describe("loadCities", () => {
  test("devolve estado padrão quando não há arquivo", async () => {
    expect(await loadCities()).toEqual({ cities: [] });
  });

  test("carrega cidades e cidade padrão salvas", async () => {
    const saoPaulo = makeCity();
    const lisboa = makeLisboa();
    await Bun.write(
      "cities.json",
      `${JSON.stringify({ cities: [saoPaulo, lisboa], defaultCity: lisboa }, null, 2)}\n`,
    );
    const state = await loadCities();
    expect(state.cities).toEqual([saoPaulo, lisboa]);
    expect(state.defaultCity).toEqual(lisboa);
  });

  test("filtra entradas inválidas do arquivo", async () => {
    const saoPaulo = makeCity();
    await Bun.write(
      "cities.json",
      JSON.stringify({ cities: [saoPaulo, { id: "x" }, null], defaultCity: { quebra: true } }),
    );
    const state = await loadCities();
    expect(state.cities).toEqual([saoPaulo]);
    expect(state.defaultCity).toBeUndefined();
  });

  test("ignora JSON corrompido e devolve estado padrão", async () => {
    await Bun.write("cities.json", "não é json");
    expect(await loadCities()).toEqual({ cities: [] });
  });

  test("trata corpo não-objeto como estado padrão", async () => {
    await Bun.write("cities.json", "[1, 2]");
    expect(await loadCities()).toEqual({ cities: [] });
  });
});

describe("saveCities", () => {
  test("grava o estado com indentação e quebra de linha final", async () => {
    const saoPaulo = makeCity();
    await saveCities({ cities: [saoPaulo], defaultCity: saoPaulo });
    const text = await Bun.file("cities.json").text();
    expect(text).toBe(`${JSON.stringify({ cities: [saoPaulo], defaultCity: saoPaulo }, null, 2)}\n`);
  });

  test("roundtrip save → load preserva o estado", async () => {
    const state: CitiesState = {
      cities: [makeCity(), makeLisboa()],
      defaultCity: makeLisboa(),
    };
    await saveCities(state);
    expect(await loadCities()).toEqual(state);
  });
});
