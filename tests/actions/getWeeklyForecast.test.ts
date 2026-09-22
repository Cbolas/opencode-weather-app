import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { showWeeklyForecast } from "../../src/actions/getWeeklyForecast.ts";
import {
  GEOCODING_RESULT,
  LISBOA_RESULT,
  dailyForecastResponse,
  geocodingResponse,
  installFetch,
  installLogSpy,
  installPrompt,
  makeCity,
  makeConfig,
  makeForecastDays,
  makeLisboa,
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

describe("showWeeklyForecast", () => {
  test("com lista vazia, busca por nome e mostra os 7 dias", async () => {
    installPrompt(["São Paulo"]);
    const fetchMock = installFetch((url) =>
      url.includes("geocoding")
        ? geocodingResponse([GEOCODING_RESULT])
        : dailyForecastResponse(makeForecastDays(7)),
    );
    await showWeeklyForecast(makeConfig());
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  Previsão para 7 dias — São Paulo (São Paulo), Brasil:");
    expect(stripped).toContain("  ter 22/09 — Parcialmente nublado, 12° / 22 °C");
    expect(stripped.filter((line) => /, \d+° \/ \d+ °C$/.test(line))).toHaveLength(7);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("escolhe cidade cadastrada pelo número", async () => {
    installPrompt(["1"]);
    const fetchMock = installFetch(() => dailyForecastResponse(makeForecastDays(7)));
    const config = makeConfig({ cities: [makeCity()] });
    await showWeeklyForecast(config);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0]?.[0] ?? "";
    expect(url).toContain("latitude=-23.5505");
    expect(url).toContain("forecast_days=7");
    expect(lines.map(stripAnsi)).toContain("  Previsão para 7 dias — São Paulo (São Paulo), Brasil:");
  });

  test("opção 0 alterna para busca por nome", async () => {
    installPrompt(["0", "Lisboa"]);
    const fetchMock = installFetch((url) =>
      url.includes("geocoding")
        ? geocodingResponse([LISBOA_RESULT])
        : dailyForecastResponse(makeForecastDays(7)),
    );
    const config = makeConfig({ cities: [makeCity()] });
    await showWeeklyForecast(config);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lines.map(stripAnsi)).toContain("  Previsão para 7 dias — Lisboa (Lisboa), Portugal:");
  });

  test("rejeita número fora da faixa sem chamar a API", async () => {
    installPrompt(["99"]);
    const fetchMock = installFetch(() => dailyForecastResponse([]));
    const config = makeConfig({ cities: [makeCity(), makeLisboa()] });
    await showWeeklyForecast(config);
    expect(lines.map(stripAnsi)).toContain("  Escolha inválida.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("rejeita entrada não numérica (e EOF) sem chamar a API", async () => {
    installPrompt(["abc", null]);
    const config = makeConfig({ cities: [makeCity()] });
    await showWeeklyForecast(config);
    await showWeeklyForecast(config);
    const invalid = lines.map(stripAnsi).filter((line) => line === "  Escolha inválida.");
    expect(invalid).toHaveLength(2);
  });

  test("avisa quando a cidade buscada não é encontrada", async () => {
    installPrompt(["0", "Atlantida"]);
    const fetchMock = installFetch((url) =>
      url.includes("geocoding") ? geocodingResponse([]) : dailyForecastResponse([]),
    );
    const config = makeConfig({ cities: [makeCity()] });
    await showWeeklyForecast(config);
    expect(lines.map(stripAnsi)).toContain('  Cidade não encontrada: "Atlantida"');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("reporta erro da API de previsão", async () => {
    installPrompt(["1"]);
    installFetch(() => new Response("erro", { status: 500 }));
    const config = makeConfig({ cities: [makeCity()] });
    await showWeeklyForecast(config);
    expect(lines.map(stripAnsi)).toContain("  Falha ao contatar o OpenMeteo. Verifique sua conexão.");
  });
});
