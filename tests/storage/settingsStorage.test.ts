import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { loadUnit, saveUnit } from "../../src/storage/settingsStorage.ts";
import { useTempDir } from "../helpers.ts";

let restoreDir: () => void;
beforeEach(() => {
  restoreDir = useTempDir();
});
afterEach(() => restoreDir());

describe("loadUnit", () => {
  test("devolve celsius quando não há arquivo", async () => {
    expect(await loadUnit()).toBe("celsius");
  });

  test("carrega fahrenheit salvo", async () => {
    await Bun.write("settings.json", JSON.stringify({ unit: "fahrenheit" }));
    expect(await loadUnit()).toBe("fahrenheit");
  });

  test("trata valores inválidos como celsius", async () => {
    await Bun.write("settings.json", JSON.stringify({ unit: "CELSIUS" }));
    expect(await loadUnit()).toBe("celsius");
    await Bun.write("settings.json", JSON.stringify({ unit: 42 }));
    expect(await loadUnit()).toBe("celsius");
    await Bun.write("settings.json", JSON.stringify({}));
    expect(await loadUnit()).toBe("celsius");
  });

  test("trata corpo não-objeto como celsius", async () => {
    await Bun.write("settings.json", JSON.stringify("fahrenheit"));
    expect(await loadUnit()).toBe("celsius");
  });

  test("ignora JSON corrompido", async () => {
    await Bun.write("settings.json", "não é json");
    expect(await loadUnit()).toBe("celsius");
  });
});

describe("saveUnit", () => {
  test("grava a unidade com indentação e quebra de linha final", async () => {
    await saveUnit("fahrenheit");
    const text = await Bun.file("settings.json").text();
    expect(text).toBe(`${JSON.stringify({ unit: "fahrenheit" }, null, 2)}\n`);
  });

  test("roundtrip save → load preserva a unidade", async () => {
    await saveUnit("celsius");
    expect(await loadUnit()).toBe("celsius");
    await saveUnit("fahrenheit");
    expect(await loadUnit()).toBe("fahrenheit");
  });
});
