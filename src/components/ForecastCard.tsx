import React from "react";
import { DailyForecast } from "../types";
import { getWeatherCondition } from "../utils/weatherUtils";
import { getWeatherTheme } from "../utils/themeUtils";
import { WeatherIcon } from "./WeatherIcon";
import { Droplet, Sun } from "lucide-react";
import { motion } from "motion/react";

interface ForecastCardProps {
  forecast: DailyForecast[];
  isCelsius: boolean;
  onSelectDay?: (day: DailyForecast) => void;
  selectedDay?: DailyForecast | null;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  isCelsius,
  onSelectDay,
  selectedDay,
}) => {
  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    // Is it today?
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatMonthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toDisplayTemp = (temp: number) => {
    if (isCelsius) {
      return `${Math.round(temp)}°C`;
    }
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  };

  // Find overall max and min to scale the temperature bars correctly
  const allMax = Math.max(...forecast.map((d) => d.temperatureMax));
  const allMin = Math.min(...forecast.map((d) => d.temperatureMin));
  const range = allMax - allMin || 1;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>5-Day Forecast</span>
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            (Tap a day to inspect details)
          </span>
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {forecast.map((day, idx) => {
          const condition = getWeatherCondition(day.weatherCode);
          const isSelected = selectedDay?.date === day.date;

          // Calculate temperature bar bounds
          const minPercent = ((day.temperatureMin - allMin) / range) * 100;
          const maxPercent = ((day.temperatureMax - allMin) / range) * 100;
          const barWidth = maxPercent - minPercent;
          const itemTheme = getWeatherTheme(day.weatherCode);

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              whileHover={{ x: 4 }}
              onClick={() => onSelectDay?.(day)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none flex items-center justify-between gap-4 ${
                isSelected
                  ? `${itemTheme.accentBg} dark:border-slate-750/70 border-slate-300 shadow-[0_4px_16px_rgba(15,23,42,0.04)] ring-1 ${itemTheme.focusRing.replace("focus:", "")}`
                  : "bg-white border-slate-100/80 hover:border-slate-300 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.02)] dark:bg-slate-900 dark:border-slate-800 hover:dark:border-slate-750"
              }`}
            >
              {/* Day / Date labels */}
              <div className="w-[85px] flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDayName(day.date)}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                  {formatMonthDate(day.date)}
                </span>
              </div>

              {/* Weather icon & description summary */}
              <div className="flex items-center gap-3 w-[120px]">
                <WeatherIcon condition={condition.iconName} size={30} className="shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                    {condition.label}
                  </span>
                  {day.precipitationSum > 0 ? (
                    <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 flex items-center gap-0.5 mt-0.5">
                      <Droplet size={10} className="fill-current" />
                      {day.precipitationSum.toFixed(1)} mm
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-500/80 flex items-center gap-0.5 mt-0.5">
                      <Sun size={10} />
                      No Rain
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature spectrum visualizer (Apple Weather template style) */}
              <div className="hidden sm:flex items-center flex-1 gap-3 px-2 max-w-xs">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-8 text-right">
                  {toDisplayTemp(day.temperatureMin)}
                </span>
                <div className="relative h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden select-none">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400"
                    style={{
                      left: `${minPercent}%`,
                      width: `${Math.max(barWidth, 6)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-left">
                  {toDisplayTemp(day.temperatureMax)}
                </span>
              </div>

              {/* Mobile-only Min/Max text */}
              <div className="sm:hidden flex flex-col items-end text-right">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {toDisplayTemp(day.temperatureMax)}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {toDisplayTemp(day.temperatureMin)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
