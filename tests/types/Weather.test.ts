import { describe, expect, test } from "bun:test";
import type {
  DailyForecast,
  DailyForecastResponse,
  ForecastResponse,
  Unit,
} from "../../src/types/Weather.ts";
import { currentForecastResponse, dailyForecastResponse, makeForecastDays } from "../helpers.ts";

describe("Unit", () => {
  test("restringe as unidades a celsius e fahrenheit", () => {
    const units: Unit[] = ["celsius", "fahrenheit"];

    expect(units).toHaveLength(2);
    expect(units.includes("celsius")).toBe(true);
    expect(units.includes("fahrenheit")).toBe(true);
  });
});

describe("ForecastResponse", () => {
  test("payload de temperatura atual do OpenMeteo satisfaz a interface", async () => {
    const response = (await currentForecastResponse(23.7).json()) as ForecastResponse;

    expect(response.current?.temperature_2m).toBe(23.7);
  });

  test("todos os campos são opcionais (resposta sem dados)", () => {
    const empty: ForecastResponse = {};

    expect(empty.current).toBeUndefined();
  });
});

describe("DailyForecast", () => {
  test("dia de previsão contém data, mínima, máxima e código do clima", () => {
    const days = makeForecastDays(7);
    const first: DailyForecast = {
      date: days[0]?.date ?? "",
      min: days[0]?.min ?? 0,
      max: days[0]?.max ?? 0,
      weatherCode: days[0]?.code ?? 0,
    };

    expect(first.date).toBe("2026-09-20");
    expect(first.min).toBe(10);
    expect(first.max).toBe(20);
    expect(first.weatherCode).toBe(0);
  });
});

describe("DailyForecastResponse", () => {
  test("payload diário do OpenMeteo satisfaz a interface", async () => {
    const days = makeForecastDays(7);
    const response = (await dailyForecastResponse(days).json()) as DailyForecastResponse;
    const daily = response.daily;

    expect(daily?.time).toHaveLength(7);
    expect(daily?.temperature_2m_max).toHaveLength(7);
    expect(daily?.temperature_2m_min).toHaveLength(7);
    expect(daily?.weather_code).toHaveLength(7);
  });

  test("daily é opcional (resposta sem dados)", () => {
    const empty: DailyForecastResponse = {};

    expect(empty.daily).toBeUndefined();
  });
});
