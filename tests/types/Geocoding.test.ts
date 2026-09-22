import { describe, expect, test } from "bun:test";
import type { GeocodingResponse, GeocodingResult } from "../../src/types/Geocoding.ts";
import { GEOCODING_RESULT } from "../helpers.ts";

describe("GeocodingResult", () => {
  test("resultado da API satisfaz o contrato com os campos obrigatórios", () => {
    const result: GeocodingResult = GEOCODING_RESULT;

    expect(result.id).toBe(1);
    expect(result.name).toBe("São Paulo");
    expect(result.latitude).toBe(-23.5505);
    expect(result.longitude).toBe(-46.6333);
  });

  test("campos de localização (country, country_code, admin1) são opcionais", () => {
    const minimal = JSON.parse(
      JSON.stringify({ id: 7, name: "Tóquio", latitude: 35.6895, longitude: 139.6917 }),
    ) as GeocodingResult;

    expect(minimal.country).toBeUndefined();
    expect(minimal.country_code).toBeUndefined();
    expect(minimal.admin1).toBeUndefined();
    expect(minimal.name).toBe("Tóquio");
  });

  test("payload real do OpenMeteo satisfaz a interface após JSON.parse", () => {
    const payload = JSON.stringify({
      results: [
        {
          id: 2,
          name: "Lisboa",
          latitude: 38.7223,
          longitude: -9.1393,
          country: "Portugal",
          country_code: "PT",
          admin1: "Lisboa",
        },
      ],
    });
    const response: GeocodingResponse = JSON.parse(payload);
    const result = response.results?.[0];

    expect(result?.name).toBe("Lisboa");
    expect(result?.country_code).toBe("PT");
  });
});

describe("GeocodingResponse", () => {
  test("results é opcional (resposta vazia quando a cidade não é encontrada)", () => {
    const empty: GeocodingResponse = {};

    expect(empty.results).toBeUndefined();
  });
});
