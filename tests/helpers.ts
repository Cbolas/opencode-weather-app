import { mock } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { City } from "../src/types/City.ts";
import type { Config } from "../src/types/Config.ts";

const originalFetch = globalThis.fetch;
const originalPrompt = globalThis.prompt;
const originalLog = console.log;

export type FetchHandler = (url: string) => Response | Promise<Response>;

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 1,
    name: "São Paulo",
    country: "Brasil",
    admin1: "São Paulo",
    latitude: -23.5505,
    longitude: -46.6333,
    ...overrides,
  };
}

export function makeLisboa(): City {
  return makeCity({
    id: 2,
    name: "Lisboa",
    country: "Portugal",
    admin1: "Lisboa",
    latitude: 38.7223,
    longitude: -9.1393,
  });
}

export function makeConfig(overrides: Partial<Config> = {}): Config {
  return { unit: "celsius", cities: [], ...overrides };
}

export const GEOCODING_RESULT = {
  id: 1,
  name: "São Paulo",
  latitude: -23.5505,
  longitude: -46.6333,
  country: "Brasil",
  country_code: "BR",
  admin1: "São Paulo",
};

export const LISBOA_RESULT = {
  id: 2,
  name: "Lisboa",
  latitude: 38.7223,
  longitude: -9.1393,
  country: "Portugal",
  admin1: "Lisboa",
};

export function geocodingResponse(results: unknown[]): Response {
  return new Response(JSON.stringify({ results }));
}

export function currentForecastResponse(temperature: number): Response {
  return new Response(JSON.stringify({ current: { temperature_2m: temperature } }));
}

export interface ForecastDayFixture {
  date: string;
  min: number;
  max: number;
  code: number;
}

export function makeForecastDays(count = 7): ForecastDayFixture[] {
  const codes = [0, 1, 2, 3, 61, 3, 95];
  return Array.from({ length: count }, (_unused, index) => ({
    date: `2026-09-${String(20 + index).padStart(2, "0")}`,
    min: 10 + index,
    max: 20 + index,
    code: codes[index % codes.length] ?? 0,
  }));
}

export function dailyForecastResponse(days: ForecastDayFixture[]): Response {
  return new Response(
    JSON.stringify({
      daily: {
        time: days.map((day) => day.date),
        temperature_2m_max: days.map((day) => day.max),
        temperature_2m_min: days.map((day) => day.min),
        weather_code: days.map((day) => day.code),
      },
    }),
  );
}

export function installFetch(handler: FetchHandler) {
  const fetchMock = mock((url: string) => handler(url));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

export function installPrompt(answers: (string | null)[]) {
  let index = 0;
  const promptMock = mock((_message?: string): string | null => {
    const answer = answers[index];
    index += 1;
    return answer === undefined ? null : answer;
  });
  globalThis.prompt = promptMock as unknown as typeof prompt;
  return promptMock;
}

export function installLogSpy(): string[] {
  const lines: string[] = [];
  const logMock = mock((...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  });
  console.log = logMock as unknown as typeof console.log;
  return lines;
}

export function restoreGlobals(): void {
  globalThis.fetch = originalFetch;
  globalThis.prompt = originalPrompt;
  console.log = originalLog;
}

export function useTempDir(): () => void {
  const previousDir = process.cwd();
  const dir = mkdtempSync(join(tmpdir(), "weather-test-"));
  process.chdir(dir);
  return () => {
    process.chdir(previousDir);
    rmSync(dir, { recursive: true, force: true });
  };
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export async function pathExists(path: string): Promise<boolean> {
  return await Bun.file(path).exists();
}

export async function readJsonFile(path: string): Promise<unknown> {
  return JSON.parse(await Bun.file(path).text());
}

export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await Bun.write(path, `${JSON.stringify(data, null, 2)}\n`);
}
