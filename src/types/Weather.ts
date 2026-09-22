export type Unit = "celsius" | "fahrenheit";

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
