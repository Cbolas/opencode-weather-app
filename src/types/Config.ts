import type { City } from "./City.ts";
import type { Unit } from "./Weather.ts";

export interface Config {
  unit: Unit;
  defaultCity?: City;
  cities: City[];
}
