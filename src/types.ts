export interface Coordinates {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string; // State / Region
}

export interface WeatherData {
  cityName: string;
  country?: string;
  region?: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  weatherCode: number;
  time: string;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitationSum: number;
  uvIndexMax: number;
}

export interface SearchHistoryItem {
  id: string;
  name: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}
