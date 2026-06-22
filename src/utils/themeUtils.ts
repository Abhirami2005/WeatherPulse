export interface WeatherThemeDetails {
  primaryGradient: string;       // Gradient for primary buttons (light mode)
  darkPrimaryGradient: string;   // Gradient for primary buttons (dark mode)
  accentHex: string;             // Theme hex color
  accentText: string;            // Text color class (light)
  darkAccentText: string;        // Text color class (dark)
  shadowGlow: string;            // Shadow glow color class for custom cards
  focusRing: string;             // Focus ring color class
  badgeBg: string;               // Quick badge background classes
  accentBg: string;              // Light bg tinted container
}

export function getWeatherTheme(code?: number): WeatherThemeDetails {
  if (code === undefined || code === null) {
    // Default neutral theme
    return {
      primaryGradient: "from-sky-500 via-blue-500 to-indigo-600",
      darkPrimaryGradient: "from-sky-600 via-blue-600 to-indigo-700",
      accentHex: "#0284c7",
      accentText: "text-sky-600",
      darkAccentText: "text-sky-400",
      shadowGlow: "shadow-sky-500/5",
      focusRing: "focus:ring-sky-500",
      badgeBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
      accentBg: "bg-sky-500/5 dark:bg-sky-950/20",
    };
  }

  // Clear Sky / Sunny
  if (code === 0) {
    return {
      primaryGradient: "from-amber-500 via-orange-450 to-yellow-500",
      darkPrimaryGradient: "from-amber-600 via-orange-500 to-yellow-600",
      accentHex: "#f59e0b",
      accentText: "text-amber-600 dark:text-amber-400",
      darkAccentText: "text-amber-400",
      shadowGlow: "shadow-amber-500/10",
      focusRing: "focus:ring-amber-500",
      badgeBg: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      accentBg: "bg-amber-500/5 dark:bg-amber-950/20",
    };
  }

  // Partly Cloudy / Cloudy
  if (code >= 1 && code <= 3) {
    return {
      primaryGradient: "from-sky-450 via-blue-500 to-slate-500",
      darkPrimaryGradient: "from-sky-600 via-blue-600 to-slate-600",
      accentHex: "#38bdf8",
      accentText: "text-sky-600 dark:text-sky-450",
      darkAccentText: "text-sky-400",
      shadowGlow: "shadow-sky-400/8",
      focusRing: "focus:ring-sky-400",
      badgeBg: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-305",
      accentBg: "bg-sky-500/5 dark:bg-sky-950/15",
    };
  }

  // Foggy
  if (code === 45 || code === 48) {
    return {
      primaryGradient: "from-zinc-500 to-slate-500",
      darkPrimaryGradient: "from-zinc-650 to-slate-650",
      accentHex: "#71717a",
      accentText: "text-zinc-650 dark:text-zinc-300",
      darkAccentText: "text-zinc-400",
      shadowGlow: "shadow-zinc-500/5",
      focusRing: "focus:ring-zinc-450",
      badgeBg: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
      accentBg: "bg-zinc-500/5 dark:bg-zinc-950/20",
    };
  }

  // Drizzle
  if (code >= 51 && code <= 57) {
    return {
      primaryGradient: "from-teal-450 via-cyan-500 to-blue-500",
      darkPrimaryGradient: "from-teal-650 via-cyan-600 to-blue-600",
      accentHex: "#0d9488",
      accentText: "text-teal-600 dark:text-teal-400",
      darkAccentText: "text-teal-300",
      shadowGlow: "shadow-teal-500/10",
      focusRing: "focus:ring-teal-500",
      badgeBg: "bg-teal-500/10 text-teal-700 dark:bg-teal-555/20 dark:text-teal-300",
      accentBg: "bg-teal-500/5 dark:bg-teal-950/20",
    };
  }

  // Rain / Showers
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 86)) {
    return {
      primaryGradient: "from-blue-500 via-indigo-500 to-sky-600",
      darkPrimaryGradient: "from-blue-600 via-indigo-600 to-sky-700",
      accentHex: "#2563eb",
      accentText: "text-blue-600 dark:text-sky-400",
      darkAccentText: "text-sky-400",
      shadowGlow: "shadow-blue-500/12",
      focusRing: "focus:ring-blue-500",
      badgeBg: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-sky-300",
      accentBg: "bg-blue-500/5 dark:bg-blue-950/20",
    };
  }

  // Snowy
  if (code >= 71 && code <= 77) {
    return {
      primaryGradient: "from-cyan-400 via-sky-500 to-blue-400",
      darkPrimaryGradient: "from-cyan-600 via-sky-600 to-blue-600",
      accentHex: "#0284c7",
      accentText: "text-cyan-600 dark:text-cyan-400",
      darkAccentText: "text-cyan-300",
      shadowGlow: "shadow-cyan-400/8",
      focusRing: "focus:ring-cyan-400",
      badgeBg: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
      accentBg: "bg-cyan-500/5 dark:bg-cyan-950/20",
    };
  }

  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return {
      primaryGradient: "from-violet-600 via-indigo-600 to-slate-900",
      darkPrimaryGradient: "from-violet-750 via-indigo-750 to-slate-950",
      accentHex: "#7c3aed",
      accentText: "text-violet-600 dark:text-violet-400",
      darkAccentText: "text-violet-300",
      shadowGlow: "shadow-violet-600/15",
      focusRing: "focus:ring-violet-500",
      badgeBg: "bg-violet-500/10 text-violet-700 dark:bg-violet-555/20 dark:text-violet-300",
      accentBg: "bg-violet-500/5 dark:bg-violet-950/30",
    };
  }

  // Default Fallback (Cloudy)
  return {
    primaryGradient: "from-slate-500 to-zinc-550",
    darkPrimaryGradient: "from-slate-650 to-zinc-700",
    accentHex: "#4b5563",
    accentText: "text-slate-600 dark:text-slate-300",
    darkAccentText: "text-slate-400",
    shadowGlow: "shadow-slate-500/5",
    focusRing: "focus:ring-slate-500",
    badgeBg: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
    accentBg: "bg-slate-500/5 dark:bg-slate-950/20",
  };
}

/**
 * Returns dynamic background gradient overlays based on weather for light and dark modes
 */
export function getWeatherBackgroundClasses(code?: number, isDarkMode: boolean = false): string {
  if (code === undefined || code === null) {
    return isDarkMode 
      ? "bg-slate-950 text-slate-100" 
      : "bg-slate-50/75 text-slate-900";
  }

  if (isDarkMode) {
    // Elegant ambient dark gradients with tinted weather glow elements
    switch (getWeatherGroup(code)) {
      case "clear":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/20 text-slate-100";
      case "cloudy":
      case "fog":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-slate-100";
      case "drizzle":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950/20 text-slate-100";
      case "rain":
      case "showers":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950/20 text-slate-100";
      case "snow":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-cyan-950/20 text-slate-100";
      case "thunderstorm":
        return "bg-gradient-to-tr from-slate-950 via-slate-900 to-purple-950/30 text-slate-100";
      default:
        return "bg-slate-950 text-slate-100";
    }
  } else {
    // Light mode: Vibrant, airy, soft pastel color palettes
    switch (getWeatherGroup(code)) {
      case "clear":
        return "bg-gradient-to-tr from-orange-50/70 via-amber-50 to-yellow-50 text-slate-905";
      case "cloudy":
        return "bg-gradient-to-tr from-slate-50 via-slate-50/90 to-blue-50/40 text-slate-905";
      case "fog":
        return "bg-gradient-to-tr from-zinc-50 via-slate-100 to-stone-50/80 text-slate-905";
      case "drizzle":
        return "bg-gradient-to-tr from-teal-50/50 via-cyan-50/60 to-sky-50 text-slate-905";
      case "rain":
      case "showers":
        return "bg-gradient-to-tr from-blue-50/70 via-sky-50/80 to-slate-100 text-slate-905";
      case "snow":
        return "bg-gradient-to-tr from-cyan-50/50 via-sky-50/60 to-blue-50/40 text-slate-905";
      case "thunderstorm":
        return "bg-gradient-to-tr from-slate-100 via-violet-50/40 to-indigo-100/70 text-slate-905";
      default:
        return "bg-slate-50 text-slate-900";
    }
  }
}

function getWeatherGroup(code: number): string {
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 86) return "showers";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloudy";
}
