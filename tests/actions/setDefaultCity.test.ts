import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setDefaultCity } from "../../src/actions/setDefaultCity.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import {
  GEOCODING_RESULT,
  LISBOA_RESULT,
  geocodingResponse,
  installFetch,
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

describe("setDefaultCity", () => {
  test("com lista vazia, busca por nome, adiciona e define como padrão", async () => {
    installPrompt(["São Paulo"]);
    const fetchMock = installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    const config = makeConfig();
    await setDefaultCity(config);
    expect(config.cities).toEqual([makeCity()]);
    expect(config.defaultCity).toEqual(makeCity());
    expect(await loadCities()).toEqual({ cities: [makeCity()], defaultCity: makeCity() });
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  Adicionada: São Paulo (São Paulo), Brasil");
    expect(stripped).toContain("  Cidade padrão definida: São Paulo (São Paulo), Brasil");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("define padrão por número na lista", async () => {
    installPrompt(["2"]);
    const saoPaulo = makeCity();
    const lisboa = makeLisboa();
    const config = makeConfig({ cities: [saoPaulo, lisboa] });
    await setDefaultCity(config);
    expect(config.defaultCity).toEqual(lisboa);
    expect(config.cities).toHaveLength(2);
    expect(await loadCities()).toEqual({ cities: [saoPaulo, lisboa], defaultCity: lisboa });
    expect(lines.map(stripAnsi)).toContain("  Cidade padrão definida: Lisboa (Lisboa), Portugal");
  });

  test("opção 0 alterna para busca por nome e adiciona cidade nova", async () => {
    installPrompt(["0", "Lisboa"]);
    const fetchMock = installFetch(() => geocodingResponse([LISBOA_RESULT]));
    const config = makeConfig({ cities: [makeCity()] });
    await setDefaultCity(config);
    expect(config.cities).toEqual([makeCity(), makeLisboa()]);
    expect(config.defaultCity).toEqual(makeLisboa());
    expect(await loadCities()).toEqual({ cities: [makeCity(), makeLisboa()], defaultCity: makeLisboa() });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("não duplica cidade existente ao definir por busca", async () => {
    installPrompt(["0", "São Paulo"]);
    installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    const config = makeConfig({ cities: [makeCity()] });
    await setDefaultCity(config);
    expect(config.cities).toEqual([makeCity()]);
    expect(config.defaultCity).toEqual(makeCity());
    expect(lines.map(stripAnsi)).not.toContain("  Adicionada: São Paulo (São Paulo), Brasil");
    expect(lines.map(stripAnsi)).toContain("  Cidade padrão definida: São Paulo (São Paulo), Brasil");
  });

  test("rejeita escolha inválida sem salvar", async () => {
    installPrompt(["xyz"]);
    const config = makeConfig({ cities: [makeCity()] });
    await setDefaultCity(config);
    expect(config.defaultCity).toBeUndefined();
    expect(lines.map(stripAnsi)).toContain("  Escolha inválida.");
    expect(await pathExists("cities.json")).toBe(false);
  });

  test("busca sem resultado avisa e não salva", async () => {
    installPrompt(["Atlantida"]);
    installFetch(() => geocodingResponse([]));
    const config = makeConfig();
    await setDefaultCity(config);
    expect(config.cities).toEqual([]);
    expect(config.defaultCity).toBeUndefined();
    expect(lines.map(stripAnsi)).toContain('  Cidade não encontrada: "Atlantida"');
    expect(await pathExists("cities.json")).toBe(false);
  });
});
