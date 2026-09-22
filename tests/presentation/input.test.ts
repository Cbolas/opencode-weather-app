import { afterEach, describe, expect, test } from "bun:test";
import { ask } from "../../src/presentation/input.ts";
import { installPrompt, restoreGlobals } from "../helpers.ts";

afterEach(restoreGlobals);

describe("ask", () => {
  test("remove espaços das pontas da resposta", () => {
    installPrompt(["  São Paulo  "]);
    expect(ask("Nome da cidade: ")).toBe("São Paulo");
  });

  test("preserva null quando o prompt recebe EOF", () => {
    installPrompt([null]);
    expect(ask("Nome da cidade: ")).toBeNull();
  });

  test("repassa a mensagem ao prompt", () => {
    const promptMock = installPrompt(["ok"]);
    ask("Selecione uma opção: ");
    expect(promptMock.mock.calls[0]?.[0]).toBe("Selecione uma opção: ");
  });

  test("consome respostas em sequência", () => {
    installPrompt(["primeira", "  segunda  "]);
    expect(ask("A: ")).toBe("primeira");
    expect(ask("B: ")).toBe("segunda");
  });
});
