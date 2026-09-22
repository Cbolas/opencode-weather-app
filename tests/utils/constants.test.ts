import { describe, expect, test } from "bun:test";
import { WEATHER_CODES } from "../../src/utils/constants.ts";

describe("WEATHER_CODES", () => {
  test("contém os códigos WMO principais com descrições em português", () => {
    expect(WEATHER_CODES[0]).toBe("Céu limpo");
    expect(WEATHER_CODES[3]).toBe("Nublado");
    expect(WEATHER_CODES[61]).toBe("Chuva fraca");
    expect(WEATHER_CODES[95]).toBe("Tempestade");
  });

  test("todas as descrições são strings não vazias", () => {
    for (const description of Object.values(WEATHER_CODES)) {
      expect(description.length > 0).toBe(true);
    }
  });

  test("não deixa buracos nas famílias de códigos", () => {
    for (const code of [1, 2, 45, 51, 55, 63, 71, 80, 96, 99]) {
      expect(WEATHER_CODES[code]).toBeDefined();
    }
  });
});
