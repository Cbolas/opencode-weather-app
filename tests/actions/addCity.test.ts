import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { addCity } from "../../src/actions/addCity.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import {
  GEOCODING_RESULT,
  geocodingResponse,
  installFetch,
  installLogSpy,
  installPrompt,
  makeCity,
  makeConfig,
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

describe("addCity", () => {
  test("adiciona cidade encontrada e persiste no arquivo", async () => {
    installPrompt(["São Paulo"]);
    const fetchMock = installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    const config = makeConfig();
    await addCity(config);
    expect(config.cities).toEqual([makeCity()]);
    expect(await loadCities()).toEqual({ cities: [makeCity()] });
    expect(lines.map(stripAnsi)).toContain("  Adicionada: São Paulo (São Paulo), Brasil");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("não duplica cidade já cadastrada e não salva", async () => {
    installPrompt(["São Paulo"]);
    installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    const config = makeConfig({ cities: [makeCity()] });
    await addCity(config);
    expect(config.cities).toEqual([makeCity()]);
    expect(await pathExists("cities.json")).toBe(false);
    expect(lines.map(stripAnsi)).toContain("  Já cadastrada: São Paulo (São Paulo), Brasil");
  });

  test("avisa quando a cidade não é encontrada", async () => {
    installPrompt(["Atlantida"]);
    const fetchMock = installFetch(() => geocodingResponse([]));
    const config = makeConfig();
    await addCity(config);
    expect(config.cities).toEqual([]);
    expect(await pathExists("cities.json")).toBe(false);
    expect(lines.map(stripAnsi)).toContain('  Cidade não encontrada: "Atlantida"');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("ignora nome em branco sem chamar a API", async () => {
    installPrompt(["   "]);
    const fetchMock = installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    await addCity(makeConfig());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(lines).toEqual([]);
  });

  test("ignora EOF (null) no nome", async () => {
    installPrompt([null]);
    const fetchMock = installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    await addCity(makeConfig());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(lines).toEqual([]);
  });

  test("exibe mensagem de erro quando a API falha", async () => {
    installPrompt(["São Paulo"]);
    installFetch(() => new Response("erro", { status: 500 }));
    const config = makeConfig();
    await addCity(config);
    expect(config.cities).toEqual([]);
    expect(await pathExists("cities.json")).toBe(false);
    expect(lines.map(stripAnsi)).toContain("  Falha ao contatar o OpenMeteo. Verifique sua conexão.");
  });
});
