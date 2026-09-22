import { describe, expect, test } from "bun:test";

const COLORS_URL = new URL("../../src/utils/colors.ts", import.meta.url).href;

interface ColorsOutput {
  red: string;
  green: string;
  bold: string;
}

async function runColors(env: Record<string, string>): Promise<ColorsOutput> {
  const code = `
    const m = await import(${JSON.stringify(COLORS_URL)});
    console.log(JSON.stringify({ red: m.red("erro"), green: m.green("ok"), bold: m.bold("título") }));
  `;
  const proc = Bun.spawn([process.execPath, "-e", code], {
    stdout: "pipe",
    stderr: "pipe",
    env,
  });
  const text = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  expect(exitCode).toBe(0);
  return JSON.parse(text.trim()) as ColorsOutput;
}

describe("cores do terminal", () => {
  test("pinta com códigos ANSI quando FORCE_COLOR=1", async () => {
    const result = await runColors({ PATH: process.env.PATH ?? "", FORCE_COLOR: "1" });
    expect(result.red).toBe("\x1b[31merro\x1b[0m");
    expect(result.green).toBe("\x1b[32mok\x1b[0m");
    expect(result.bold).toBe("\x1b[1mtítulo\x1b[0m");
  });

  test("mantém o texto puro quando NO_COLOR está definido", async () => {
    const result = await runColors({ PATH: process.env.PATH ?? "", NO_COLOR: "1" });
    expect(result.red).toBe("erro");
    expect(result.green).toBe("ok");
    expect(result.bold).toBe("título");
  });

  test("stdout sem TTY e sem cor forçada mantém o texto puro", async () => {
    const result = await runColors({ PATH: process.env.PATH ?? "" });
    expect(result.red).toBe("erro");
    expect(result.bold).toBe("título");
  });

  test("FORCE_COLOR=0 não força a cor", async () => {
    const result = await runColors({ PATH: process.env.PATH ?? "", FORCE_COLOR: "0" });
    expect(result.red).toBe("erro");
  });
});
