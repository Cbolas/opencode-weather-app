import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeCity } from "./helpers.ts";

const ENTRY = join(import.meta.dir, "../src/index.ts");

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

async function runApp(dir: string, input: string): Promise<RunResult> {
  const proc = Bun.spawn([process.execPath, ENTRY], {
    cwd: dir,
    stdin: new Response(input),
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "" },
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

function newRunDir(): string {
  return mkdtempSync(join(tmpdir(), "weather-smoke-"));
}

describe("app ponta a ponta (bun src/index.ts)", () => {
  test("exibe o menu e sai limpo com a opção 9", async () => {
    const dir = newRunDir();
    const run = await runApp(dir, "9\n");
    rmSync(dir, { recursive: true, force: true });
    expect(run.exitCode).toBe(0);
    expect(run.stderr).toBe("");
    expect(run.stdout).toContain("WEATHER CLI");
    expect(run.stdout).toContain("9. Sair");
    expect(run.stdout).toContain("Até logo!");
    expect(existsSync(join(dir, "cities.json"))).toBe(false);
  });

  test("rejeita opção inválida e encerra na sequência", async () => {
    const dir = newRunDir();
    const run = await runApp(dir, "42\n9\n");
    rmSync(dir, { recursive: true, force: true });
    expect(run.exitCode).toBe(0);
    expect(run.stdout).toContain("Opção inválida.");
    expect(run.stdout).toContain("Até logo!");
  });

  test("migra weather.json legado na primeira execução", async () => {
    const dir = newRunDir();
    const city = makeCity();
    const legacy = { unit: "fahrenheit", cities: [city], defaultCity: city };
    const legacyPath = join(dir, "weather.json");
    writeFileSync(legacyPath, JSON.stringify(legacy));
    const run = await runApp(dir, "9\n");
    expect(run.exitCode).toBe(0);
    expect(run.stdout).toContain("Clima de todas as cidades (1)");
    expect(existsSync(legacyPath)).toBe(false);
    expect(existsSync(join(dir, "weather.json.bak"))).toBe(true);
    expect(JSON.parse(readFileSync(join(dir, "cities.json"), "utf8"))).toEqual({
      cities: [city],
      defaultCity: city,
    });
    expect(JSON.parse(readFileSync(join(dir, "settings.json"), "utf8"))).toEqual({ unit: "fahrenheit" });
    rmSync(dir, { recursive: true, force: true });
  });
});
