import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { listCities } from "../../src/actions/listCities.ts";
import {
  installLogSpy,
  makeCity,
  makeConfig,
  makeLisboa,
  restoreGlobals,
  stripAnsi,
  useTempDir,
} from "../helpers.ts";

let lines: string[];
let restoreDir: () => void;
beforeEach(() => {
  restoreDir = useTempDir();
  lines = installLogSpy();
});
afterEach(() => {
  restoreDir();
  restoreGlobals();
});

describe("listCities", () => {
  test("avisa quando não há cidades cadastradas", async () => {
    await listCities(makeConfig());
    expect(lines.map(stripAnsi)).toContain("  Nenhuma cidade cadastrada. Use a opção 3 para adicionar.");
  });

  test("lista cidades numeradas e marca a padrão", async () => {
    await listCities(makeConfig({ cities: [makeCity(), makeLisboa()], defaultCity: makeLisboa() }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  Cidades cadastradas:");
    expect(stripped).toContain("   1. São Paulo (São Paulo), Brasil");
    expect(stripped).toContain("   2. Lisboa (Lisboa), Portugal (padrão)");
  });

  test("não marca nenhuma cidade sem padrão definido", async () => {
    await listCities(makeConfig({ cities: [makeCity()] }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("   1. São Paulo (São Paulo), Brasil");
    expect(stripped.some((line) => line.includes("(padrão)"))).toBe(false);
  });
});
