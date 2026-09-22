import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { openSettings } from "../../src/actions/openSettings.ts";
import { loadUnit } from "../../src/storage/settingsStorage.ts";
import {
  installLogSpy,
  installPrompt,
  makeConfig,
  pathExists,
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

describe("openSettings", () => {
  test("mostra a unidade atual e as opções", async () => {
    installPrompt(["0"]);
    await openSettings(makeConfig({ unit: "celsius" }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  Unidade de temperatura: °C");
    expect(stripped).toContain("  1. Alternar para °F");
    expect(stripped).toContain("  0. Voltar");
  });

  test("alterna celsius → fahrenheit e persiste", async () => {
    installPrompt(["1"]);
    const config = makeConfig({ unit: "celsius" });
    await openSettings(config);
    expect(config.unit).toBe("fahrenheit");
    expect(await loadUnit()).toBe("fahrenheit");
    expect(lines.map(stripAnsi)).toContain("  Unidade salva: °F");
  });

  test("alterna fahrenheit → celsius e persiste", async () => {
    installPrompt(["1"]);
    const config = makeConfig({ unit: "fahrenheit" });
    await openSettings(config);
    expect(config.unit).toBe("celsius");
    expect(await loadUnit()).toBe("celsius");
    expect(lines.map(stripAnsi)).toContain("  Unidade salva: °C");
  });

  test("opção inválida não altera nada", async () => {
    installPrompt(["7"]);
    const config = makeConfig({ unit: "celsius" });
    await openSettings(config);
    expect(config.unit).toBe("celsius");
    expect(await pathExists("settings.json")).toBe(false);
    expect(lines.map(stripAnsi)).toContain("  Opção inválida.");
  });

  test("EOF (null) retorna sem alterar nada", async () => {
    installPrompt([null]);
    const config = makeConfig({ unit: "fahrenheit" });
    await openSettings(config);
    expect(config.unit).toBe("fahrenheit");
    expect(await pathExists("settings.json")).toBe(false);
    expect(lines.map(stripAnsi)).not.toContain("  Opção inválida.");
  });
});
