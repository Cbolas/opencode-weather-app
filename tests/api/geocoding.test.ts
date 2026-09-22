import { afterEach, describe, expect, test } from "bun:test";
import { geocode } from "../../src/api/geocoding.ts";
import { GEOCODING_RESULT, installFetch, makeCity, restoreGlobals } from "../helpers.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

afterEach(restoreGlobals);

describe("geocode", () => {
  test("mapeia o primeiro resultado para City e monta a URL correta", async () => {
    const fetchMock = installFetch(() => new Response(JSON.stringify({ results: [GEOCODING_RESULT] })));
    const city = await geocode("São Paulo");
    expect(city).toEqual(makeCity());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${GEOCODING_URL}?name=S%C3%A3o%20Paulo&count=1&language=pt&format=json`,
    );
  });

  test("usa country_code quando country não vem na resposta", async () => {
    installFetch(() =>
      new Response(
        JSON.stringify({
          results: [{ id: 7, name: "Porto", latitude: 41.1579, longitude: -8.6291, country_code: "PT" }],
        }),
      ),
    );
    expect(await geocode("Porto")).toEqual({
      id: 7,
      name: "Porto",
      country: "PT",
      admin1: undefined,
      latitude: 41.1579,
      longitude: -8.6291,
    });
  });

  test("devolve país vazio quando não há country nem country_code", async () => {
    installFetch(() =>
      new Response(JSON.stringify({ results: [{ id: 8, name: "Nada", latitude: 0, longitude: 0 }] })),
    );
    expect(await geocode("Nada")).toEqual({
      id: 8,
      name: "Nada",
      country: "",
      admin1: undefined,
      latitude: 0,
      longitude: 0,
    });
  });

  test("retorna null quando não há resultados", async () => {
    installFetch(() => new Response(JSON.stringify({ results: [] })));
    expect(await geocode("Atlantida")).toBeNull();
  });

  test("retorna null quando a resposta não traz results", async () => {
    installFetch(() => new Response(JSON.stringify({})));
    expect(await geocode("Atlantida")).toBeNull();
  });

  test("rejeita quando o corpo da resposta não é um objeto", async () => {
    installFetch(() => new Response("null"));
    await expect(geocode("Atlantida")).rejects.toThrow("Resposta inesperada da API de geocoding.");
  });

  test("rejeita resultado malformado", async () => {
    installFetch(() => new Response(JSON.stringify({ results: [{ id: "abc" }] })));
    await expect(geocode("Atlantida")).rejects.toThrow("Resposta inesperada da API de geocoding.");
  });

  test("rejeita resultado sem coordenadas", async () => {
    installFetch(() =>
      new Response(JSON.stringify({ results: [{ id: 9, name: "SemLocal", latitude: "x", longitude: null }] })),
    );
    await expect(geocode("SemLocal")).rejects.toThrow("Resposta inesperada da API de geocoding.");
  });
});
