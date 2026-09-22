import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { showAllWeather, showDefaultWeather } from "../../src/actions/getWeather.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import {
  currentForecastResponse,
  geocodingResponse,
  GEOCODING_RESULT,
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

describe("showDefaultWeather", () => {
  test("mostra o clima da cidade padrão", async () => {
    const fetchMock = installFetch(() => currentForecastResponse(22.5));
    await showDefaultWeather(makeConfig({ defaultCity: makeCity() }));
    expect(lines.map(stripAnsi)).toContain("  São Paulo (São Paulo), Brasil — 22.5 °C");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("sem cidade padrão, pergunta e aceita definir quando a resposta é s", async () => {
    installPrompt(["s", "São Paulo"]);
    const fetchMock = installFetch(() => geocodingResponse([GEOCODING_RESULT]));
    const config = makeConfig();
    await showDefaultWeather(config);
    expect(lines.map(stripAnsi)).toContain("  Nenhuma cidade padrão definida.");
    expect(config.defaultCity).toEqual(makeCity());
    expect(config.cities).toEqual([makeCity()]);
    expect(await loadCities()).toEqual({ cities: [makeCity()], defaultCity: makeCity() });
    expect(lines.map(stripAnsi)).toContain("  Cidade padrão definida: São Paulo (São Paulo), Brasil");
  });

  test("sem cidade padrão, recusa definir quando a resposta não é s", async () => {
    installPrompt(["n"]);
    const config = makeConfig();
    await showDefaultWeather(config);
    expect(lines.map(stripAnsi)).toContain("  Nenhuma cidade padrão definida.");
    expect(config.defaultCity).toBeUndefined();
    expect(config.cities).toEqual([]);
    expect(await pathExists("cities.json")).toBe(false);
  });
});

describe("showAllWeather", () => {
  test("avisa quando não há cidades cadastradas", async () => {
    await showAllWeather(makeConfig());
    expect(lines.map(stripAnsi)).toContain("  Nenhuma cidade cadastrada. Use a opção 3 para adicionar.");
  });

  test("mostra o clima de todas as cidades", async () => {
    const fetchMock = installFetch(() => currentForecastResponse(20));
    const config = makeConfig({ cities: [makeCity(), makeLisboa()] });
    await showAllWeather(config);
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  Clima de todas as cidades:");
    expect(stripped).toContain("  São Paulo (São Paulo), Brasil — 20 °C");
    expect(stripped).toContain("  Lisboa (Lisboa), Portugal — 20 °C");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("marca cidade como indisponível quando a API falha", async () => {
    installFetch(() => new Response("erro", { status: 503 }));
    await showAllWeather(makeConfig({ cities: [makeCity()] }));
    expect(lines.map(stripAnsi)).toContain(
      "  São Paulo (São Paulo), Brasil — indisponível (Falha ao contatar o OpenMeteo. Verifique sua conexão.)",
    );
  });
});
