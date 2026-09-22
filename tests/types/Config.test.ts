import { describe, expect, test } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import type { Unit } from "../../src/types/Weather.ts";
import { makeCity, makeConfig } from "../helpers.ts";

describe("Config", () => {
  test("fábrica padrão produz uma configuração mínima válida", () => {
    const config: Config = makeConfig();

    expect(config.unit).toBe("celsius");
    expect(config.cities).toEqual([]);
    expect(config.defaultCity).toBeUndefined();
  });

  test("defaultCity é opcional e aceita uma cidade cadastrada", () => {
    const saoPaulo = makeCity();
    const config: Config = makeConfig({ defaultCity: saoPaulo, cities: [saoPaulo] });

    expect(config.defaultCity?.name).toBe("São Paulo");
    expect(config.cities).toHaveLength(1);
  });

  test("unit aceita as duas unidades suportadas", () => {
    const units: Unit[] = ["celsius", "fahrenheit"];
    const configs: Config[] = units.map((unit) => makeConfig({ unit }));

    expect(configs[0]?.unit).toBe("celsius");
    expect(configs[1]?.unit).toBe("fahrenheit");
  });

  test("sobrevive a serialização/desserialização JSON (formato de settings.json)", () => {
    const original = makeConfig({ cities: [makeCity()] });
    const restored: Config = JSON.parse(JSON.stringify(original));

    expect(restored).toEqual(original);
    expect(restored.cities[0]?.name).toBe("São Paulo");
  });
});
