import React, { useState, useEffect } from "react";
import { Coordinates, WeatherData, DailyForecast, SearchHistoryItem } from "./types";
import {
  searchCity,
  fetchWeatherAndForecast,
  getWeatherCondition,
} from "./utils/weatherUtils";
import { WeatherDetails } from "./components/WeatherDetails";
import { ForecastCard } from "./components/ForecastCard";
import { SearchHistory } from "./components/SearchHistory";
import { WeatherIcon } from "./components/WeatherIcon";
import { AtmosphericParticles } from "./components/AtmosphericParticles";
import { getWeatherTheme, getWeatherBackgroundClasses } from "./utils/themeUtils";
import {
  Search,
  MapPin,
  Sun,
  Moon,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  X,
  Droplets,
  Wind,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function App() {
  // Global Units & theme
  const [isCelsius, setIsCelsius] = useState<boolean>(() => {
    const saved = localStorage.getItem("weather-use-celsius");
    return saved !== null ? saved === "true" : true;
  });

  const [isDarkMode] = useState<boolean>(true);

  // Querying & Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Coordinates[] | null>(null);

  // Weather States
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<DailyForecast[] | null>(null);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DailyForecast | null>(null);
  const [activeLocation, setActiveLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
    region?: string;
  } | null>(null);

  // General indicators
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Weather Theme config derived from active weather data
  const theme = getWeatherTheme(weatherData?.weatherCode);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem("recent-weather-searches");
    return saved ? JSON.parse(saved) : [];
  });

  // Browser system notification states
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  });

  // Check severe weather conditions and trigger a native Web Notification on load/update
  const checkSevereAlertNotification = (weather: WeatherData, forceNotify: boolean = false) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const isHeavyPrecipitation = weather.weatherCode >= 51;
    const isHighWind = weather.windSpeed > 20;

    if (isHeavyPrecipitation || isHighWind || forceNotify) {
      let conditions = [];
      if (isHeavyPrecipitation) conditions.push("precipitation rainfall");
      if (isHighWind) conditions.push(`elevated winds of ${Math.round(weather.windSpeed)} km/h`);
      
      const conditionStr = conditions.length > 0 ? conditions.join(" and ") : "active storm patterns";
      const severeMsg = `Severe weather warning alert initialized for ${weather.cityName}. Detected concerns include: ${conditionStr}.`;

      if (Notification.permission === "granted") {
        try {
          new Notification(`⚠️ Aero Weather Alert for ${weather.cityName}`, {
            body: severeMsg,
            requireInteraction: true,
          });
        } catch (e) {
          console.error("Browser dismissed system notification dispatch:", e);
        }
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === "granted" && weatherData) {
        new Notification("🔔 Aero Climate Alerts Approved!", {
          body: `Desktop alerts successfully synchronized for ${weatherData.cityName}. Severe indicators will fire alerts in the background.`,
        });
        checkSevereAlertNotification(weatherData, true);
      }
    }
  };

  // Run alerts review when active weather metrics reload
  useEffect(() => {
    if (weatherData && notificationStatus === "granted") {
      checkSevereAlertNotification(weatherData);
    }
  }, [weatherData, notificationStatus]);

  // 1. Sync theme classes with DocumentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("weather-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("weather-theme", "light");
    }
  }, [isDarkMode]);

  // Sync Temperature unit preference
  useEffect(() => {
    localStorage.setItem("weather-use-celsius", String(isCelsius));
  }, [isCelsius]);

  // Sync Search History to localStorage
  useEffect(() => {
    localStorage.setItem("recent-weather-searches", JSON.stringify(history));
  }, [history]);

  // 2. Default Initial search on startup
  useEffect(() => {
    // Try auto-loading client history choice OR load default capital (Tokyo)
    if (history.length > 0) {
      loadHistoryLocation(history[0]);
    } else {
      // Auto Geolocate on load if granted, else fallback seed Tokyo
      triggerGeolocation(true);
    }
  }, []);

  // 3. Trigger Core Weather API calls
  const loadLocationWeather = async (
    lat: number,
    lon: number,
    name: string,
    country?: string,
    region?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSearchResults(null);
    setSelectedForecastDay(null);

    try {
      const result = await fetchWeatherAndForecast(lat, lon, name, country, region);
      setWeatherData(result.current);
      setForecastData(result.forecast);
      setActiveLocation({ latitude: lat, longitude: lon, name, country, region });

      // Add to search history if not already present
      saveToSearchHistory(name, country, region, lat, lon);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load meteorological details.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Autocomplete Geocoding Submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim() === "") return;

    setIsSearching(true);
    setErrorMessage(null);
    setSearchResults(null);

    try {
      const results = await searchCity(searchQuery);

      if (results.length === 1) {
        // Only 1 result, load it direct
        const target = results[0];
        await loadLocationWeather(
          target.latitude,
          target.longitude,
          target.name,
          target.country,
          target.admin1
        );
        setSearchQuery("");
      } else {
        // Multi location match list
        setSearchResults(results);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong searching.");
    } finally {
      setIsSearching(false);
    }
  };

  // 5. Save recent location queries to storage (maximum 10 entries)
  const saveToSearchHistory = (
    name: string,
    country: string | undefined,
    region: string | undefined,
    latitude: number,
    longitude: number
  ) => {
    setHistory((prev) => {
      // Filter out duplication
      const filtered = prev.filter(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase() &&
          (item.country || "").toLowerCase() === (country || "").toLowerCase()
      );

      const newItem: SearchHistoryItem = {
        id: `${latitude}-${longitude}-${Date.now()}`,
        name,
        country,
        region,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      return [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 10);
    });
  };

  // Click history item to query
  const loadHistoryLocation = (item: SearchHistoryItem) => {
    loadLocationWeather(item.latitude, item.longitude, item.name, item.country, item.region);
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering trigger weather load
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // 6. Geolocation Core Engine with reverse geocoding lookup
  const triggerGeolocation = (isInitial: boolean = false) => {
    if (!navigator.geolocation) {
      if (!isInitial) {
        setErrorMessage("Geolocation is not supported by your browser software.");
      } else {
        // Fallback standard default location (San Francisco)
        loadLocationWeather(37.7749, -122.4194, "San Francisco", "United States", "California");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsLoading(true);
        try {
          // Attempt reverse geocode to fetch human city name
          const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const resp = await fetch(revUrl);

          if (resp.ok) {
            const data = await resp.json();
            const cityName = data.city || data.locality || "GPS Coordinates";
            const countryName = data.countryName || "";
            const regionName = data.principalSubdivision || "";
            await loadLocationWeather(latitude, longitude, cityName, countryName, regionName);
          } else {
            await loadLocationWeather(latitude, longitude, "My Current Location");
          }
        } catch {
          // Soft reverse geocode fallback
          await loadLocationWeather(latitude, longitude, "My Coordinates");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        if (!isInitial) {
          if (err.code === 1) {
            setErrorMessage("GPS reference denied. Please grant browser geolocation access permissions.");
          } else {
            setErrorMessage("Failed to read geolocation status coordinates.");
          }
        } else {
          // Default start load placeholder capital (New York) if GPS gets silent/denied
          loadLocationWeather(40.7128, -74.006, "New York", "United States", "New York");
        }
      }
    );
  };

  // Dynamic theme backdrop values matching active weather condition
  const getAppBackdrop = () => {
    return getWeatherBackgroundClasses(weatherData?.weatherCode, isDarkMode);
  };

  return (
    <div className={`min-h-screen pb-16 transition-all duration-1000 ease-in-out font-sans antialiased ${getAppAppBg()}`}>
      {/* Dynamic Animated Particles Canvas */}
      <AtmosphericParticles weatherCode={weatherData?.weatherCode} isDarkMode={isDarkMode} />

      {/* Dynamic atmospheric grid decor elements built using pure CSS */}
      <div className="absolute top-0 inset-x-0 h-[450px] bg-gradient-to-b from-sky-100/10 via-transparent to-transparent pointer-events-none dark:from-slate-900/15" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-900 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${isDarkMode ? theme.darkPrimaryGradient : theme.primaryGradient} shadow-md text-white transition-all duration-1000`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-lg font-black tracking-tight font-display text-slate-800 dark:text-slate-100">
                WEATHER PULSE
              </h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Real-Time Weather Insights at Your Fingertips
                      Smart Forecasting for Every Day
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Temperature Unit Toggle */}
            <button
              onClick={() => setIsCelsius(!isCelsius)}
              type="button"
              className="p-2.5 px-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-100/85 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 text-sm font-extrabold text-slate-700 dark:text-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition cursor-pointer active:scale-95"
              id="unit-toggle-btn"
            >
              {isCelsius ? "°C" : "°F"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 relative z-10 flex flex-col gap-6">
        {/* Search layout rows */}
         <section className="w-full flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none stroke-[2]" />
              <input
                type="text"
                placeholder="Enter city name (e.g. Hyderabad, London, Tokyo...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-505 focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent shadow-[0_4px_16px_-4px_rgba(0,0,0,0.02)] transition-all`}
                id="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  id="clear-search-btn"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className={`p-4 px-6 rounded-2xl bg-gradient-to-tr ${isDarkMode ? theme.darkPrimaryGradient : theme.primaryGradient} disabled:opacity-50 text-white font-bold text-sm tracking-wide transition shadow-lg ${theme.shadowGlow} cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 duration-350`}
              id="search-submit-btn"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>

          {/* Quick GPS auto detection button */}
          <button
            onClick={() => triggerGeolocation(false)}
            type="button"
            className={`p-4 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ${theme.accentText} hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold text-sm tracking-wide shadow-[0_4px_16px_-4px_rgba(0,0,0,0.02)] transition cursor-pointer flex items-center justify-center gap-2 active:scale-95`}
            id="gps-trigger-btn"
          >
            <MapPin className="w-4 h-4 animate-bounce shrink-0" />
            <span>Find My Location</span>
          </button>
        </section>

        {/* Multi-city Autocomplete Dialog Match Dropdown */}
        <AnimatePresence>
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.1)] flex flex-col gap-3 relative text-left"
            >
              <button
                onClick={() => setSearchResults(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                id="close-results-btn"
              >
                <X size={16} />
              </button>

              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles size={14} className="text-sky-500" />
                Multiple Matches Found ({searchResults.length})
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Please match your precise regional location search target from the options below:
              </p>

              <div className="flex flex-col gap-1.5 mt-1 max-h-[220px] overflow-y-auto">
                {searchResults.map((city, idx) => (
                  <button
                    key={`${city.latitude}-${city.longitude}-${idx}`}
                    onClick={() => {
                      loadLocationWeather(
                        city.latitude,
                        city.longitude,
                        city.name,
                        city.country,
                        city.admin1
                      );
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-55 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
                  >
                    <span>
                      {city.name}
                      {city.admin1 && (
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({city.admin1})
                        </span>
                      )}
                    </span>
                    {city.country && (
                      <span className="text-xs py-0.5 px-2 bg-white dark:bg-slate-900 dark:border-slate-800 border border-slate-100 text-slate-400 dark:text-slate-400 rounded-md font-medium uppercase">
                        {city.country}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Indicators */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30 flex items-center gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="flex-1 text-sm font-semibold leading-relaxed">
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs font-black p-1 bg-white/20 hover:bg-white/40 rounded-lg shrink-0"
                id="clear-error-btn"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browser Alert Permissions request banner */}
        <AnimatePresence>
          {typeof window !== "undefined" && "Notification" in window && notificationStatus === "default" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 sm:p-5 rounded-3xl border text-left flex flex-col md:flex-row md:items-center justify-between gap-4 select-none ${
                weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20)
                  ? "bg-amber-500/10 border-amber-500/25 text-slate-800 dark:text-slate-100"
                  : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20)
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-sky-500/10 text-sky-500"
                }`}>
                  <AlertCircle size={20} className={`${weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20) ? "animate-bounce" : "animate-pulse"} stroke-[2.2]`} />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20) ? (
                      <span>Severe Weather Desktop Notifications</span>
                    ) : (
                      <span>Active Meteorological Tracking Alerts</span>
                    )}
                    {weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20) && (
                      <span className="text-[10px] font-black tracking-widest bg-amber-500 text-white rounded p-0.5 px-2.5 uppercase animate-pulse">
                        Severe Risk
                      </span>
                    )}
                  </h4>
                  <p className="text-xs font-semibold opacity-85 mt-1 leading-relaxed">
                    {weatherData && (weatherData.weatherCode >= 51 || weatherData.windSpeed > 20) ? (
                      `Rain, storms, or heavy gusts are detected for ${weatherData.cityName}. Activate push notifications to keep severe alerts running in the background.`
                    ) : (
                      "Grant browser permissions to enable automated warning alerts for high winds, rapid precipitation, and thermal shocks in real-time."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <button
                  onClick={requestNotificationPermission}
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-550 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Enable Desktop Alerts
                </button>
                <button
                  onClick={() => setNotificationStatus("denied")}
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                  title="Dismiss alert prompt permanently"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search history component row */}
        <SearchHistory
          history={history}
          onSelect={loadHistoryLocation}
          onRemove={removeHistoryItem}
          onClearAll={clearHistory}
        />

        {/* Core Layout Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main dashboard columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isLoading ? (
              <WeatherLoadingSkeleton />
            ) : weatherData ? (
              <WeatherDetails
                weather={weatherData}
                forecast={forecastData || []}
                isCelsius={isCelsius}
                selectedForecastDay={selectedForecastDay}
                onCloseForecastInspection={() => setSelectedForecastDay(null)}
              />
            ) : (
              <EmptyPlaceholderView onGeolocate={() => triggerGeolocation(false)} />
            )}
          </div>

          {/* Right side static/forecast columns info */}
          <div className="flex flex-col gap-6">
            {!isLoading && forecastData && (
              <ForecastCard
                forecast={forecastData}
                isCelsius={isCelsius}
                onSelectDay={(day) => setSelectedForecastDay(day)}
                selectedDay={selectedForecastDay}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 text-center border-t border-slate-100 dark:border-slate-900 pt-8 max-w-6xl mx-auto px-4 select-none">
        <p className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          Aero Climate Informatics Dashboard
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
          Asynchronous meteorological telemetry compiled with Open-Meteo REST parameters.
        </p>
      </footer>
    </div>
  );

  // Helper theme bg calculator
  function getAppAppBg() {
    return getWeatherBackgroundClasses(weatherData?.weatherCode, isDarkMode);
  }
}

// Sub-view: Active Loading Skeleton module
function WeatherLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse text-left select-none">
      {/* Top Banner Skeleton */}
      <div className="h-[250px] rounded-3xl bg-slate-200 dark:bg-slate-800" />

      {/* Warning Alert skeleton */}
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[150px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      {/* Wind Compas Card Skeleton */}
      <div className="h-20 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

// Sub-view: Empty query landing state placeholder
interface PlaceholderProps {
  onGeolocate: () => void;
}
const EmptyPlaceholderView: React.FC<PlaceholderProps> = ({ onGeolocate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 text-center select-none">
      <div className="p-4 bg-sky-500/10 rounded-full text-sky-500 mb-4 animate-bounce">
        <MapPin size={32} className="stroke-[2]" />
      </div>
      <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-200">
        No active weather telemetry rendered
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mt-2 leading-relaxed">
        Search for a city name, click entries from your history drawer or tap detect to locate current weather metrics.
      </p>
      <button
        onClick={onGeolocate}
        type="button"
        className="mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-550 text-white text-sm font-bold rounded-2xl shadow-md transition cursor-pointer active:scale-95"
      >
        Track Current GPS Location
      </button>
    </div>
  );
};
