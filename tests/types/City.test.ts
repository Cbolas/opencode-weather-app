import { describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import { makeCity, makeLisboa } from "../helpers.ts";

describe("City", () => {
  test("fábrica padrão produz uma cidade válida com todos os campos obrigatórios", () => {
    const city: City = makeCity();

    expect(city.id).toBe(1);
    expect(city.name).toBe("São Paulo");
    expect(city.country).toBe("Brasil");
    expect(city.latitude).toBe(-23.5505);
    expect(city.longitude).toBe(-46.6333);
  });

  test("admin1 é opcional e pode ser omitido", () => {
    const { admin1: _admin1, ...withoutAdmin1 } = makeCity();
    const city: City = withoutAdmin1;

    expect(city.admin1).toBeUndefined();
    expect(city.name).toBe("São Paulo");
  });

  test("cidades diferentes podem coexistir com ids distintos", () => {
    const saoPaulo = makeCity();
    const lisboa = makeLisboa();
    const cities: City[] = [saoPaulo, lisboa];

    expect(cities.length).toBe(2);
    expect(cities[0]?.name).toBe("São Paulo");
    expect(cities[1]?.id).toBe(2);
    expect(new Set(cities.map((city) => city.id)).size).toBe(2);
  });

  test("sobrevive a serialização/desserialização JSON (formato de cities.json)", () => {
    const original = makeLisboa();
    const restored: City = JSON.parse(JSON.stringify(original));

    expect(restored).toEqual(original);
    expect(typeof restored.id).toBe("number");
    expect(typeof restored.latitude).toBe("number");
    expect(typeof restored.longitude).toBe("number");
  });
});
