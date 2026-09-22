import { describe, expect, test } from "bun:test";
import {
  describeWeatherCode,
  formatCity,
  formatForecastDate,
  unitSymbol,
} from "../../src/utils/format.ts";
import { makeCity, makeLisboa } from "../helpers.ts";

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
    expect(formatForecastDate("2026-09-20")).toBe("dom 20/09");
  });

  test("devolve a data original quando inválida", () => {
    expect(formatForecastDate("não é data")).toBe("não é data");
    expect(formatForecastDate("")).toBe("");
  });
});

describe("unitSymbol", () => {
  test("mapeia unidades para símbolos", () => {
    expect(unitSymbol("celsius")).toBe("°C");
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatCity", () => {
  test("exibe nome, região e país", () => {
    expect(formatCity(makeCity())).toBe("São Paulo (São Paulo), Brasil");
    expect(formatCity(makeLisboa())).toBe("Lisboa (Lisboa), Portugal");
  });

  test("omite região e país quando ausentes", () => {
    const city = makeCity({ name: "Porto", country: "", admin1: undefined });
    expect(formatCity(city)).toBe("Porto");
  });
});
