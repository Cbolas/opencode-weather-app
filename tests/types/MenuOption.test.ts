import { describe, expect, test } from "bun:test";
import { isMenuOption } from "../../src/types/MenuOption.ts";

describe("isMenuOption", () => {
  test("aceita as opções válidas do menu (1 a 9)", () => {
    for (const option of ["1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
      expect(isMenuOption(option)).toBe(true);
    }
  });

  test("rejeita valores fora do intervalo e não numéricos", () => {
    for (const option of ["", "0", "10", "a", " 1", "9 ", "01"]) {
      expect(isMenuOption(option)).toBe(false);
    }
  });
});
