import { Coordinates, WeatherData, DailyForecast } from "../types";

/**
 * Weather details matching WMO codes
 */
export interface WeatherConditionDetails {
  label: string;
  description: string;
  iconName: string; // Used to select components dynamically
  gradient: string; // Tailwind gradient classes
  darkGradient: string; // Tailwind gradient for dark mode
  accentColor: string; // Hex or tailwind brand color
  bgClass: string; // Background backdrop color
}

export function getWeatherCondition(code: number): WeatherConditionDetails {
  // WMO Code interpretation
  if (code === 0) {
    return {
      label: "Clear Sky",
      description: "Cloudless, sunny conditions",
      iconName: "Sun",
      gradient: "from-amber-400 via-orange-400 to-yellow-500",
      darkGradient: "from-slate-900 via-amber-950 to-slate-900",
      accentColor: "#f59e0b",
      bgClass: "bg-amber-500/10",
    };
  }
  if (code === 1 || code === 2 || code === 3) {
    return {
      label: "Partly Cloudy",
      description: "Mainly clear to overcast skies",
      iconName: "CloudSun",
      gradient: "from-sky-400 via-blue-400 to-slate-400",
      darkGradient: "from-slate-900 via-slate-800 to-slate-900",
      accentColor: "#38bdf8",
      bgClass: "bg-sky-500/10",
    };
  }
  if (code === 45 || code === 48) {
    return {
      label: "Foggy",
      description: "Persistent fog or depositing rime",
      iconName: "CloudFog",
      gradient: "from-zinc-400 via-slate-400 to-zinc-500",
      darkGradient: "from-zinc-900 via-stone-800 to-zinc-900",
      accentColor: "#a1a1aa",
      bgClass: "bg-zinc-500/10",
    };
  }
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return {
      label: "Drizzle",
      description: "Light misting and dense drizzle drizzle",
      iconName: "CloudDrizzle",
      gradient: "from-teal-400 via-cyan-400 to-blue-400",
      darkGradient: "from-slate-900 via-teal-950 to-slate-900",
      accentColor: "#2dd4bf",
      bgClass: "bg-teal-500/10",
    };
  }
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) {
    return {
      label: "Rainy",
      description: "Steady rainfall, slight to heavy precipitation",
      iconName: "CloudRain",
      gradient: "from-blue-500 via-indigo-500 to-sky-600",
      darkGradient: "from-slate-950 via-slate-900 to-slate-950",
      accentColor: "#3b82f6",
      bgClass: "bg-blue-500/10",
    };
  }
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return {
      label: "Snowy",
      description: "Snowfall, light grains to heavy blizzard",
      iconName: "CloudSnow",
      gradient: "from-cyan-200 via-sky-300 to-blue-300",
      darkGradient: "from-slate-900 via-sky-950 to-slate-900",
      accentColor: "#06b6d4",
      bgClass: "bg-cyan-500/10",
    };
  }
  if (code === 80 || code === 81 || code === 82 || code === 85 || code === 86) {
    return {
      label: "Showers",
      description: "Passing rain or snow shower bursts",
      iconName: "CloudRain",
      gradient: "from-sky-500 via-blue-600 to-indigo-600",
      darkGradient: "from-slate-950 via-blue-950 to-slate-950",
      accentColor: "#0284c7",
      bgClass: "bg-sky-500/10",
    };
  }
  if (code === 95 || code === 96 || code === 99) {
    return {
      label: "Thunderstorm",
      description: "Violent lightning, convective storm activity",
      iconName: "CloudLightning",
      gradient: "from-violet-600 via-indigo-600 to-slate-800",
      darkGradient: "from-slate-950 via-purple-950 to-slate-950",
      accentColor: "#8b5cf6",
      bgClass: "bg-violet-500/10",
    };
  }

  // Fallback
  return {
    label: "Cloudy",
    description: "Unknown condition code",
    iconName: "Cloud",
    gradient: "from-gray-400 to-slate-500",
    darkGradient: "from-slate-900 to-gray-900",
    accentColor: "#6b7280",
    bgClass: "bg-gray-500/10",
  };
}

/**
 * Searches for coordinates based on city name using the Open-Meteo Geocoding API
 */
export async function searchCity(query: string): Promise<Coordinates[]> {
  if (!query || query.trim() === "") {
    throw new Error("Please enter a city name to search.");
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=5&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch city results. Please check your internet connection.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`Could not find "${query}". Try checking the spelling.`);
    }

    return data.results.map((item: any) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      country: item.country,
      admin1: item.admin1,
    }));
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred while searching.");
  }
}

/**
 * Fetches current weather and 5-day forecast for given coordinates
 */
export async function fetchWeatherAndForecast(
  lat: number,
  lon: number,
  locationName: string,
  country?: string,
  region?: string
): Promise<{ current: WeatherData; forecast: DailyForecast[] }> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Unable to retrieve weather indices for this location.");
    }

    const data = await response.json();

    if (!data.current || !data.daily) {
      throw new Error("Incomplete data received from weather services.");
    }

    const current: WeatherData = {
      cityName: locationName,
      country: country,
      region: region,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.pressure_msl,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    };

    const forecast: DailyForecast[] = data.daily.time.map((timeStr: string, idx: number) => ({
      date: timeStr,
      temperatureMax: data.daily.temperature_2m_max[idx],
      temperatureMin: data.daily.temperature_2m_min[idx],
      weatherCode: data.daily.weather_code[idx],
      precipitationSum: data.daily.precipitation_sum[idx],
      uvIndexMax: data.daily.uv_index_max[idx],
    }));

    // Return current and up to 5 days of forecast
    return {
      current,
      forecast: forecast.slice(0, 5), // Guarantee standard 5-day forecast limit
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to retrieve real-time weather analytics.");
  }
}

/**
 * Simple unit helper conversion structures
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371);
}
