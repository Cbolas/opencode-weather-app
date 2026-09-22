import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { Mock } from "bun:test";
import {
  installLogSpy,
  installPrompt,
  makeCity,
  makeConfig,
  restoreGlobals,
  stripAnsi,
} from "../helpers.ts";
import type { Config } from "../../src/types/Config.ts";

type ActionMock = Mock<(config: Config) => Promise<void>>;

const noopAction = (): ActionMock => mock((_config: Config) => Promise.resolve());

const addCityMock = noopAction();
const removeCityMock = noopAction();
const setDefaultCityMock = noopAction();
const showWeeklyForecastMock = noopAction();
const listCitiesMock = noopAction();
const openSettingsMock = noopAction();
const showDefaultWeatherMock = noopAction();
const showAllWeatherMock = noopAction();

mock.module("../../src/actions/addCity.ts", () => ({ addCity: addCityMock }));
mock.module("../../src/actions/getWeather.ts", () => ({
  showDefaultWeather: showDefaultWeatherMock,
  showAllWeather: showAllWeatherMock,
}));
mock.module("../../src/actions/getWeeklyForecast.ts", () => ({
  showWeeklyForecast: showWeeklyForecastMock,
}));
mock.module("../../src/actions/listCities.ts", () => ({ listCities: listCitiesMock }));
mock.module("../../src/actions/openSettings.ts", () => ({ openSettings: openSettingsMock }));
mock.module("../../src/actions/removeCity.ts", () => ({ removeCity: removeCityMock }));
mock.module("../../src/actions/setDefaultCity.ts", () => ({ setDefaultCity: setDefaultCityMock }));

const allMocks: Record<string, ActionMock> = {
  addCity: addCityMock,
  removeCity: removeCityMock,
  setDefaultCity: setDefaultCityMock,
  showWeeklyForecast: showWeeklyForecastMock,
  listCities: listCitiesMock,
  openSettings: openSettingsMock,
  showDefaultWeather: showDefaultWeatherMock,
  showAllWeather: showAllWeatherMock,
};

const { printMenu, runMenu } = await import("../../src/presentation/menu.ts");

let lines: string[];
beforeEach(() => {
  lines = installLogSpy();
  for (const actionMock of Object.values(allMocks)) {
    actionMock.mockClear();
  }
});
afterEach(restoreGlobals);

describe("printMenu", () => {
  test("renderiza cabeçalho, as nove opções e rodapé", () => {
    printMenu(makeConfig({ cities: [makeCity()] }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("         WEATHER CLI");
    expect(stripped).toContain("  1. Clima da cidade padrão");
    expect(stripped).toContain("  2. Clima de todas as cidades (1)");
    expect(stripped).toContain("  3. Buscar e adicionar cidade");
    expect(stripped).toContain("  4. Remover cidade");
    expect(stripped).toContain("  5. Definir cidade padrão");
    expect(stripped).toContain("  6. Previsão para 7 dias");
    expect(stripped).toContain("  7. Listar cidades");
    expect(stripped).toContain("  8. Configurações (°C)");
    expect(stripped).toContain("  9. Sair");
  });

  test("mostra a contagem de cidades e a unidade atual", () => {
    printMenu(makeConfig({ cities: [], unit: "fahrenheit" }));
    const stripped = lines.map(stripAnsi);
    expect(stripped).toContain("  2. Clima de todas as cidades (0)");
    expect(stripped).toContain("  8. Configurações (°F)");
  });
});

describe("runMenu", () => {
  test("encerra o loop com a opção 9", async () => {
    installPrompt(["9"]);
    await runMenu(makeConfig());
    expect(lines.map(stripAnsi)).toContain("  Até logo!");
  });

  test("encerra com Até logo! ao receber EOF (null)", async () => {
    installPrompt([null]);
    await runMenu(makeConfig());
    expect(lines.map(stripAnsi)).toContain("  Até logo!");
  });

  test("avisa sobre opção inválida e continua o loop até sair", async () => {
    installPrompt(["42", "0", "9"]);
    await runMenu(makeConfig());
    const stripped = lines.map(stripAnsi);
    expect(stripped.filter((line) => line === "  Opção inválida.")).toHaveLength(2);
    expect(stripped).toContain("  Até logo!");
  });

  const DISPATCH: ReadonlyArray<readonly [string, ActionMock]> = [
    ["1", showDefaultWeatherMock],
    ["2", showAllWeatherMock],
    ["3", addCityMock],
    ["4", removeCityMock],
    ["5", setDefaultCityMock],
    ["6", showWeeklyForecastMock],
    ["7", listCitiesMock],
    ["8", openSettingsMock],
  ];

  for (const [option, actionMock] of DISPATCH) {
    test(`a opção ${option} aciona a ação correspondente`, async () => {
      installPrompt([option, "9"]);
      const config = makeConfig();
      await runMenu(config);
      expect(actionMock).toHaveBeenCalledTimes(1);
      expect(actionMock.mock.calls[0]?.[0]).toBe(config);
    });
  }

  test("nenhuma ação além da escolhida é acionada", async () => {
    installPrompt(["3", "9"]);
    await runMenu(makeConfig());
    for (const [name, actionMock] of Object.entries(allMocks)) {
      if (name === "addCity") continue;
      expect(actionMock).not.toHaveBeenCalled();
    }
  });
});
