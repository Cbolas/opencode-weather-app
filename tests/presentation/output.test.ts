import { afterEach, describe, expect, test } from "bun:test";
import {
  errorMessage,
  printCityList,
  printDailyForecast,
  printWeather,
} from "../../src/presentation/output.ts";
import {
  currentForecastResponse,
  installFetch,
  installLogSpy,
  makeCity,
  makeConfig,
  makeLisboa,
  restoreGlobals,
  stripAnsi,
} from "../helpers.ts";
import type { DailyForecast } from "../../src/types/Weather.ts";

afterEach(restoreGlobals);

describe("errorMessage", () => {
  test("extrai a mensagem de um Error", () => {
    expect(errorMessage(new Error("algo deu errado"))).toBe("algo deu errado");
  });

  test("devolve mensagem genérica para valores que não são Error", () => {
    expect(errorMessage("string")).toBe("Erro inesperado.");
    expect(errorMessage(null)).toBe("Erro inesperado.");
    expect(errorMessage(undefined)).toBe("Erro inesperado.");
    expect(errorMessage({ code: 500 })).toBe("Erro inesperado.");
  });
});

describe("printCityList", () => {
  test("numera as cidades e marca a padrão", () => {
    const lines = installLogSpy();
    printCityList(makeConfig({ cities: [makeCity(), makeLisboa()], defaultCity: makeLisboa() }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("   1. São Paulo (São Paulo), Brasil");
    expect(stripped).toContain("   2. Lisboa (Lisboa), Portugal (padrão)");
  });

  test("não marca nenhuma cidade sem padrão definido", () => {
    const lines = installLogSpy();
    printCityList(makeConfig({ cities: [makeCity()] }));
    expect(lines.map(stripAnsi)).toContain("   1. São Paulo (São Paulo), Brasil");
  });
});

describe("printWeather", () => {
  test("mostra cidade e temperatura formatadas", async () => {
    const lines = installLogSpy();
    installFetch(() => currentForecastResponse(22.5));
    await printWeather(makeCity(), "celsius");
    expect(lines.map(stripAnsi)).toContain("  São Paulo (São Paulo), Brasil — 22.5 °C");
  });

  test("mostra indisponível quando a API falha", async () => {
    const lines = installLogSpy();
    installFetch(() => new Response("erro", { status: 503 }));
    await printWeather(makeLisboa(), "celsius");
    expect(lines.map(stripAnsi)).toContain(
      "  Lisboa (Lisboa), Portugal — indisponível (Falha ao contatar o OpenMeteo. Verifique sua conexão.)",
    );
  });
});

describe("printDailyForecast", () => {
  test("mostra data, condição e temperaturas do dia", () => {
    const lines = installLogSpy();
    const day: DailyForecast = { date: "2026-09-22", min: 15, max: 25, weatherCode: 61 };
    printDailyForecast(day, "celsius");
    expect(lines.map(stripAnsi)).toContain("  ter 22/09 — Chuva fraca, 15° / 25 °C");
  });

  test("usa o símbolo da unidade recebida", () => {
    const lines = installLogSpy();
    const day: DailyForecast = { date: "2026-09-22", min: 59, max: 77, weatherCode: 0 };
    printDailyForecast(day, "fahrenheit");
    expect(lines.map(stripAnsi)).toContain("  ter 22/09 — Céu limpo, 59° / 77 °F");
  });
});
