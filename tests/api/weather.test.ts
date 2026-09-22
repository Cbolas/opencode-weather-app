import { afterEach, describe, expect, test } from "bun:test";
import { getDailyForecast, getTemperature } from "../../src/api/weather.ts";
import {
  currentForecastResponse,
  dailyForecastResponse,
  installFetch,
  makeCity,
  makeForecastDays,
  restoreGlobals,
} from "../helpers.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

afterEach(restoreGlobals);

describe("getTemperature", () => {
  test("retorna a temperatura atual e monta a URL correta", async () => {
    const fetchMock = installFetch(() => currentForecastResponse(22.5));
    expect(await getTemperature(makeCity(), "celsius")).toBe(22.5);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${FORECAST_URL}?latitude=-23.5505&longitude=-46.6333&current=temperature_2m&temperature_unit=celsius`,
    );
  });

  test("propaga a unidade escolhida para a URL", async () => {
    const fetchMock = installFetch(() => currentForecastResponse(72.5));
    expect(await getTemperature(makeCity(), "fahrenheit")).toBe(72.5);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("temperature_unit=fahrenheit");
  });

  test("rejeita quando a resposta não traz temperatura", async () => {
    installFetch(() => new Response(JSON.stringify({})));
    await expect(getTemperature(makeCity(), "celsius")).rejects.toThrow(
      "Resposta inesperada da API de previsão.",
    );
  });

  test("rejeita quando a temperatura não é numérica", async () => {
    installFetch(() =>
      new Response(JSON.stringify({ current: { temperature_2m: "quente" } })),
    );
    await expect(getTemperature(makeCity(), "celsius")).rejects.toThrow(
      "Resposta inesperada da API de previsão.",
    );
  });
});

describe("getDailyForecast", () => {
  test("mapeia 7 dias e monta a URL correta", async () => {
    const days = makeForecastDays(7);
    const fetchMock = installFetch(() => dailyForecastResponse(days));
    const forecast = await getDailyForecast(makeCity(), "celsius");
    expect(forecast).toEqual(
      days.map((day) => ({ date: day.date, min: day.min, max: day.max, weatherCode: day.code })),
    );
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${FORECAST_URL}?latitude=-23.5505&longitude=-46.6333&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto&temperature_unit=celsius`,
    );
  });

  test("rejeita quando as séries diárias têm tamanhos diferentes", async () => {
    installFetch(() =>
      new Response(
        JSON.stringify({
          daily: {
            time: ["2026-09-20", "2026-09-21"],
            temperature_2m_max: [30, 31, 32],
            temperature_2m_min: [15, 16],
            weather_code: [0, 1],
          },
        }),
      ),
    );
    await expect(getDailyForecast(makeCity(), "celsius")).rejects.toThrow(
      "Resposta inesperada da API de previsão.",
    );
  });

  test("rejeita quando um valor diário não é numérico", async () => {
    installFetch(() =>
      new Response(
        JSON.stringify({
          daily: {
            time: ["2026-09-20", "2026-09-21"],
            temperature_2m_max: [30, "quente"],
            temperature_2m_min: [15, 16],
            weather_code: [0, 1],
          },
        }),
      ),
    );
    await expect(getDailyForecast(makeCity(), "celsius")).rejects.toThrow(
      "Resposta inesperada da API de previsão.",
    );
  });

  test("rejeita quando a resposta não traz o bloco daily", async () => {
    installFetch(() => new Response(JSON.stringify({})));
    await expect(getDailyForecast(makeCity(), "celsius")).rejects.toThrow(
      "Resposta inesperada da API de previsão.",
    );
  });
});
