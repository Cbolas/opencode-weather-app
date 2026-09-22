export interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export type Unit = "celsius" | "fahrenheit";

export interface Config {
  unit: Unit;
  defaultCity?: City;
  cities: City[];
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

export interface DailyForecast {
  date: string;
  min: number;
  max: number;
  weatherCode: number;
}

export interface DailyForecastResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}
