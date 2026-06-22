import React from "react";
import { WeatherData, DailyForecast } from "../types";
import { getWeatherCondition, celsiusToFahrenheit, kmToMiles } from "../utils/weatherUtils";
import { getWeatherTheme } from "../utils/themeUtils";
import { WeatherIcon } from "./WeatherIcon";
import { MetricCard } from "./MetricCard";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Compass,
  Sprout,
  Sun,
  CloudRain,
  ShieldAlert,
  MapPin,
  Clock,
  CalendarCheck2,
  Share2,
  Check,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface WeatherDetailsProps {
  weather: WeatherData;
  forecast: DailyForecast[];
  isCelsius: boolean;
  selectedForecastDay: DailyForecast | null;
  onCloseForecastInspection?: () => void;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  weather,
  forecast,
  isCelsius,
  selectedForecastDay,
  onCloseForecastInspection,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [chartMode, setChartMode] = React.useState<"hourly" | "5day">("hourly");

  const condition = getWeatherCondition(weather.weatherCode);
  const theme = getWeatherTheme(weather.weatherCode);

  const displayTemp = (celsius: number) => {
    if (isCelsius) {
      return `${Math.round(celsius)}°C`;
    }
    return `${celsiusToFahrenheit(celsius)}°F`;
  };

  const displayWindSpeed = (speed: number) => {
    if (isCelsius) {
      return `${Math.round(speed)} km/h`;
    }
    return `${kmToMiles(speed)} mph`;
  };

  const getWindDirectionLabel = (degree: number): string => {
    const directions = [
      "North (N)",
      "North-East (NE)",
      "East (E)",
      "South-East (SE)",
      "South (S)",
      "South-West (SW)",
      "West (W)",
      "North-West (NW)",
    ];
    const index = Math.round(((degree % 360) / 45)) % 8;
    return directions[index];
  };

  const handleShareClipboard = () => {
    const conditionText = condition.label;
    const tempF = celsiusToFahrenheit(weather.temperature);
    const tempDisplay = isCelsius ? `${Math.round(weather.temperature)}°C` : `${tempF}°F`;
    const apparentDisplay = isCelsius ? `${Math.round(weather.apparentTemperature)}°C` : `${celsiusToFahrenheit(weather.apparentTemperature)}°F`;
    const todayForecast = forecast[0] || { temperatureMax: weather.temperature, temperatureMin: weather.temperature };
    
    const summary = `🌤️ Aero Weather Snapshot - ${weather.cityName}${weather.country ? `, ${weather.country}` : ""}
--------------------------------------------
🌡️ Temperature: ${tempDisplay} (Feels like ${apparentDisplay})
📋 Condition: ${conditionText} (${condition.description})
💧 Humidity Index: ${weather.humidity}%
🌀 Wind Velocity: ${weather.windSpeed} km/h (${getWindDirectionLabel(weather.windDirection)})
📈 Max UV Level Projected: ${todayForecast.uvIndexMax?.toFixed(1) || "N/A"}
--------------------------------------------
Generated via Aero Digital Weather Informatics.`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate 24-hr diurnal trend for Temperature, Humidity, and UV Index
  const hourlyData = React.useMemo(() => {
    const data = [];
    const uvMax = forecast[0]?.uvIndexMax || 5.0;
    for (let hour = 0; hour <= 24; hour += 3) {
      const tempOffset = Math.sin(((hour - 9) / 12) * Math.PI) * 4.5;
      const hourlyTemp = parseFloat((weather.temperature + tempOffset).toFixed(1));

      const humOffset = -Math.sin(((hour - 9) / 12) * Math.PI) * 16;
      const hourlyHumidity = Math.min(Math.max(Math.round(weather.humidity + humOffset), 12), 100);

      let hourlyUV = 0;
      if (hour >= 6 && hour <= 18) {
        hourlyUV = parseFloat((Math.sin(((hour - 6) / 12) * Math.PI) * uvMax).toFixed(1));
      }

      data.push({
        time: `${hour.toString().padStart(2, "0")}:05`,
        Temperature: hourlyTemp,
        Humidity: hourlyHumidity,
        "UV Index": hourlyUV,
      });
    }
    return data;
  }, [weather.temperature, weather.humidity, forecast]);

  // Transform 5-day forecast for the weekly view
  const chartForecastData = React.useMemo(() => {
    return forecast.map((day) => {
      const dateObj = new Date(day.date);
      const name = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      return {
        name,
        "Max UV": day.uvIndexMax,
        "Precipitation (mm)": day.precipitationSum,
        "Max Temp": day.temperatureMax,
        "Min Temp": day.temperatureMin,
      };
    });
  }, [forecast]);

  // Get diagnostic status strings for metrics
  const getHumidityStatus = (humidity: number) => {
    if (humidity < 35) return { text: "Dry Air", color: "text-amber-500 bg-amber-500/10" };
    if (humidity > 70) return { text: "High Moisture", color: "text-blue-500 bg-blue-500/10" };
    return { text: "Recommended", color: "text-emerald-500 bg-emerald-500/10" };
  };

  const getWindStatus = (speed: number) => {
    if (speed < 10) return { text: "Calm breeze", color: "text-emerald-500 bg-emerald-500/10" };
    if (speed > 25) return { text: "Strong winds", color: "text-rose-500 bg-rose-500/10" };
    return { text: "Moderate flow", color: "text-sky-500 bg-sky-500/10" };
  };

  const getPressureStatus = (pressure: number) => {
    if (pressure < 1009) return { text: "Low Pressure", color: "text-blue-500 bg-blue-500/10" };
    if (pressure > 1022) return { text: "High Pressure", color: "text-amber-500 bg-amber-500/10" };
    return { text: "Standard Sea Level", color: "text-emerald-500 bg-emerald-500/10" };
  };

  const getApparentTempStatus = (apparent: number, actual: number) => {
    const diffusion = apparent - actual;
    if (diffusion > 2) return { text: "Feels warmer", color: "text-orange-500 bg-orange-500/10" };
    if (diffusion < -2) return { text: "Wind chill effect", color: "text-cyan-500 bg-cyan-500/10" };
    return { text: "Matches Thermometer", color: "text-slate-500 bg-slate-500/10" };
  };

  // Dynamic advice engine based on indicators
  const getAdvisoryTip = () => {
    if (weather.weatherCode >= 95) {
      return {
        title: "Electrical Storm Advisory",
        text: "Severe thunderstorm detected. Stay safe indoors, disconnect sensitive electrical hardware, and avoid watery outdoor hazards.",
        icon: ShieldAlert,
        colorClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 border-purple-100 dark:border-purple-900/50",
      };
    }
    if (weather.weatherCode >= 61 && weather.weatherCode <= 67) {
      return {
        title: "Rain Preparedness",
        text: "Heavy rain is occurring or likely. Keep an umbrella handy, secure outdoor furniture, and drive with headlight awareness due to wet surfaces.",
        icon: CloudRain,
        colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border-blue-100 dark:border-blue-900/50",
      };
    }
    if (weather.temperature > 30) {
      return {
        title: "Elevated Heat Notice",
        text: "Temperatures are quite warm. Ensure steady hydration, prioritize shade during peak UV hours, and use sunscreen protectors.",
        icon: Sun,
        colorClass: "bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-300 border-amber-100 dark:border-amber-900/50",
      };
    }
    if (weather.temperature < 4) {
      return {
        title: "Cold Weather Warning",
        text: "Extreme chill levels. Bundle up in layers to prevent frost, secure indoor pets, and watch for icy conditions along walking paths.",
        icon: Thermometer,
        colorClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-300 border-cyan-100 dark:border-cyan-900/50",
      };
    }
    return {
      title: "Perfect Air Balance",
      text: "Weather conditions are mild. It's an excellent day to ventilate your living space, pursue outdoor jogging steps, or plant garden foliage.",
      icon: Sprout,
      colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-100 dark:border-emerald-950/30",
    };
  };

  const advisory = getAdvisoryTip();
  const HumidityStatus = getHumidityStatus(weather.humidity);
  const WindStatus = getWindStatus(weather.windSpeed);
  const PressureStatus = getPressureStatus(weather.pressure);
  const ApparentStatus = getApparentTempStatus(weather.apparentTemperature, weather.temperature);

  // Extract High & Low for today
  const todayForecast = forecast[0] || { temperatureMax: weather.temperature, temperatureMin: weather.temperature };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Main Current Weather Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`gradient-banner relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br shadow-[0_10px_30px_rgba(30,41,59,0.06)] ${condition.gradient} text-white`}
      >
        {/* Animated fluid particle backdrop */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden pointer-events-none select-none opacity-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border-[10px] border-white/5"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1 px-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold tracking-wide select-none flex items-center gap-1">
                  <MapPin size={12} className="stroke-[2.5]" />
                  CURRENTLY IN
                </span>
                {weather.region && (
                  <span className="text-white/80 text-xs font-medium">{weather.region}</span>
                )}
              </div>

              {/* Share/Copy Snapshot Action Button */}
              <button
                onClick={handleShareClipboard}
                type="button"
                className="p-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-black tracking-wide cursor-pointer text-white shadow-sm select-none border border-white/10"
                id="share-snapshot-btn"
                title="Copy weather snapshot to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-300 stroke-[3]" />
                    <span className="text-emerald-200">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} className="stroke-[2.5]" />
                    <span>Share Snapshot</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight select-all">
              {weather.cityName}
              {weather.country && (
                <span className="text-xl sm:text-2xl font-light opacity-85 ml-2">
                  , {weather.country}
                </span>
              )}
            </h2>

            <p className="text-xs text-white/70 font-semibold mt-1 flex items-center gap-1.5 select-all">
              <Clock size={12} />
              Refreshed at: {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

            <div className="flex items-baseline gap-2 mt-6 select-all">
              <span className="text-5xl sm:text-7xl font-sans font-black tracking-tighter">
                {displayTemp(weather.temperature)}
              </span>
              <div className="flex flex-col text-white/90">
                <span className="text-sm font-extrabold tracking-wide uppercase select-none">
                  {condition.label}
                </span>
                <span className="text-xs opacity-75 font-medium max-w-[200px] select-none">
                  {condition.description}
                </span>
              </div>
            </div>

            {/* High / Low details */}
            <div className="flex items-center gap-4 mt-6 text-sm font-semibold text-white/90 bg-black/10 self-start p-2 px-4 rounded-2xl backdrop-blur-sm select-none">
              <span className="flex items-center gap-1.5 ">
                <Thermometer size={14} className="text-amber-300 fill-amber-300/10" />
                Hi: <strong className="text-white font-extrabold">{displayTemp(todayForecast.temperatureMax)}</strong>
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Thermometer size={14} className="text-cyan-300 fill-cyan-300/10" />
                Lo: <strong className="text-white font-extrabold">{displayTemp(todayForecast.temperatureMin)}</strong>
              </span>
            </div>
          </div>

          <div className="flex justify-end items-center md:mr-4 shrink-0">
            <WeatherIcon condition={condition.iconName} size={110} className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] filter" />
          </div>
        </div>
      </motion.div>

      {/* 2. Advisory alert banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-2xl border flex gap-3.5 ${advisory.colorClass}`}
      >
        <div className="p-2 rounded-xl bg-white/40 dark:bg-black/15 self-start shrink-0">
          <advisory.icon size={20} className="stroke-[2.2]" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold tracking-tight">{advisory.title}</span>
          <p className="text-xs font-medium opacity-85 mt-0.5 leading-relaxed leading-snug">
            {advisory.text}
          </p>
        </div>
      </motion.div>

      {/* 3. Bento Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Apparent Temperature"
          value={displayTemp(weather.apparentTemperature)}
          label={isCelsius ? "°C" : "°F"}
          icon={Thermometer}
          colorClass="text-orange-500"
          bgClass="bg-orange-500/10"
          statusText={ApparentStatus.text}
          statusColor={ApparentStatus.color}
        />

        <MetricCard
          title="Humidity Index"
          value={weather.humidity}
          label="%"
          icon={Droplets}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
          statusText={HumidityStatus.text}
          statusColor={HumidityStatus.color}
        />

        <MetricCard
          title="Wind Velocity"
          value={displayWindSpeed(weather.windSpeed)}
          label={isCelsius ? "km/h" : "mph"}
          icon={Wind}
          colorClass="text-teal-500"
          bgClass="bg-teal-500/10"
          statusText={WindStatus.text}
          statusColor={WindStatus.color}
        />

        <MetricCard
          title="Pressure"
          value={weather.pressure}
          label="hPa"
          icon={Gauge}
          colorClass="text-violet-500"
          bgClass="bg-violet-500/10"
          statusText={PressureStatus.text}
          statusColor={PressureStatus.color}
        />
      </div>

      {/* 4. Meteorological wind orientation details */}
      <div className="p-4 p-5 rounded-3xl bg-white border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
            <Compass size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block select-none">
              Wind Aspect Angle
            </span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 block">
              {getWindDirectionLabel(weather.windDirection)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 select-none">
            Bearing angle: <strong className="text-slate-800 dark:text-slate-100">{weather.windDirection}°</strong>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800 select-none">
            {/* Wind Compass Graphic Dial */}
            <span className="absolute top-0.5 text-[7px] font-black text-rose-500">N</span>
            <motion.div
              animate={{ rotate: weather.windDirection }}
              className="w-8 h-8 flex items-center justify-center"
              style={{ transformOrigin: "center" }}
            >
              <div className="w-1.5 h-6 bg-rose-500 rounded-full relative">
                <div className="absolute top-0 left-0 right-0 h-3 bg-red-600 rounded-t-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 5. Metrics & Trends Visualization Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-805 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${theme.accentText}`} />
              <span>Meteorological Trends</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-505 mt-1">
              Analyze diurnal relative humidity, actual temperature, and UV patterns.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl self-start select-none">
            <button
              onClick={() => setChartMode("hourly")}
              type="button"
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                chartMode === "hourly"
                  ? `bg-white dark:bg-slate-900 ${theme.accentText} shadow-sm font-black scale-[1.03]`
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              Today's Cycle
            </button>
            <button
              onClick={() => setChartMode("5day")}
              type="button"
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                chartMode === "5day"
                  ? `bg-white dark:bg-slate-900 ${theme.accentText} shadow-sm font-black scale-[1.03]`
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              5-Day Outlook
            </button>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === "hourly" ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xl text-left text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1.5">Hour {label}</p>
                          <div className="flex flex-col gap-1 flex-wrap">
                            <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                              Temperature: <strong className="text-slate-800 dark:text-slate-100">{payload[0]?.value}°C</strong>
                            </p>
                            <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              Humidity: <strong className="text-slate-800 dark:text-slate-100">{payload[1]?.value}%</strong>
                            </p>
                            <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              UV Index: <strong className="text-slate-800 dark:text-slate-100">{payload[2]?.value}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />
                <Area
                  type="monotone"
                  dataKey="Temperature"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempGrad)"
                  name="Temperature (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="Humidity"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#humidityGrad)"
                  name="Humidity (%)"
                />
                <Area
                  type="monotone"
                  dataKey="UV Index"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#uvGrad)"
                  name="UV Index"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xl text-left text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1.5">{label}</p>
                          <div className="flex flex-col gap-1 flex-wrap">
                            <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              UV protection: <strong className="text-slate-800 dark:text-slate-100">{payload[0]?.value}</strong>
                            </p>
                            <p className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-indigo-505" />
                              Rain Fall: <strong className="text-slate-800 dark:text-slate-100">{payload[1]?.value} mm</strong>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />
                <Bar dataKey="Max UV" fill="#eab308" radius={[4, 4, 0, 0]} name="Max UV index" />
                <Bar dataKey="Precipitation (mm)" fill="#6366f1" radius={[4, 4, 0, 0]} name="Precipitation (mm)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. In-depth Forecast Day Inspection card */}
      <AnimatePresence>
        {selectedForecastDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-3xl bg-sky-50/20 dark:bg-slate-900/40 border border-sky-100 dark:border-sky-900/40 relative">
              <button
                onClick={onCloseForecastInspection}
                type="button"
                className="absolute top-4 right-4 text-xs font-extrabold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 px-3 rounded-xl transition"
                id="close-inspection-btn"
              >
                Close View
              </button>

              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase select-none">
                <CalendarCheck2 size={14} />
                <span>Forecast Inspection Analysis</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Target Date</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                    {new Date(selectedForecastDay.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-col text-left bg-white/50 dark:bg-black/10 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">UV Exposure Peak</span>
                  <div className="flex items-center gap-2 mt-1 select-all">
                    <Sun size={15} className="text-yellow-500" />
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {selectedForecastDay.uvIndexMax.toFixed(1)} indices
                    </span>
                    <span className={`text-[10px] font-bold p-0.5 px-1.5 rounded-md ${
                      selectedForecastDay.uvIndexMax > 6
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20"
                        : selectedForecastDay.uvIndexMax > 3
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20"
                    }`}>
                      {selectedForecastDay.uvIndexMax > 6 ? "High Risk" : selectedForecastDay.uvIndexMax > 3 ? "Moderate" : "Safe levels"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col text-left bg-white/50 dark:bg-black/10 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 font-sans">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Precipitation depth</span>
                  <div className="flex items-center gap-2 mt-1 select-all">
                    <CloudRain size={15} className="text-blue-500" />
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {selectedForecastDay.precipitationSum.toFixed(2)} mm
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">accumulated depth</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
