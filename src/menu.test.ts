import { describe, expect, test } from "bun:test";
import { describeWeatherCode, formatForecastDate } from "./menu.ts";

describe("describeWeatherCode", () => {
  test("descreve códigos WMO conhecidos", () => {
    expect(describeWeatherCode(0)).toBe("Céu limpo");
    expect(describeWeatherCode(3)).toBe("Nublado");
    expect(describeWeatherCode(61)).toBe("Chuva fraca");
    expect(describeWeatherCode(71)).toBe("Neve fraca");
    expect(describeWeatherCode(95)).toBe("Tempestade");
    expect(describeWeatherCode(99)).toBe("Tempestade com granizo forte");
  });

  test("retorna fallback para códigos desconhecidos", () => {
    expect(describeWeatherCode(42)).toBe("Condição desconhecida");
    expect(describeWeatherCode(-1)).toBe("Condição desconhecida");
  });
});

describe("formatForecastDate", () => {
  test("formata data da API em português", () => {
    expect(formatForecastDate("2026-09-22")).toBe("ter 22/09");
    expect(formatForecastDate("2026-12-25")).toBe("sex 25/12");
  });

  test("devolve a data original quando inválida", () => {
    expect(formatForecastDate("não é data")).toBe("não é data");
  });
});
