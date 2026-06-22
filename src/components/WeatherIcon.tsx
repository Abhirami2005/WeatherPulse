import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { motion } from "motion/react";

interface WeatherIconProps {
  condition: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "", size = 48 }) => {
  const iconProps = {
    size,
    className: "text-current stroke-[1.8]",
  };

  switch (condition) {
    case "Sun":
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className={className}
        >
          <Sun {...iconProps} className={`${iconProps.className} text-amber-500`} />
        </motion.div>
      );

    case "CloudSun":
      return (
        <div className={`relative ${className}`}>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Cloud {...iconProps} className={`${iconProps.className} text-slate-400`} />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute -top-3 -right-2"
          >
            <Sun size={size * 0.6} className="text-amber-500 stroke-[1.8]" />
          </motion.div>
        </div>
      );

    case "Cloud":
      return (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className={className}
        >
          <Cloud {...iconProps} className={`${iconProps.className} text-slate-500`} />
        </motion.div>
      );

    case "CloudFog":
      return (
        <div className={`relative ${className}`}>
          <motion.div
            animate={{ x: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            <CloudFog {...iconProps} className={`${iconProps.className} text-zinc-400`} />
          </motion.div>
        </div>
      );

    case "CloudDrizzle":
      return (
        <div className={`relative ${className}`}>
          <Cloud {...iconProps} className={`${iconProps.className} text-slate-400`} />
          <div className="absolute inset-x-0 bottom-[-8px] flex justify-center gap-1.5 overflow-hidden h-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [-10, 10], opacity: [0, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.3,
                  ease: "linear",
                }}
                className="w-[1.5px] h-2 bg-cyan-400 rounded-full"
              />
            ))}
          </div>
        </div>
      );

    case "CloudRain":
      return (
        <div className={`relative ${className}`}>
          <motion.div
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Cloud {...iconProps} className={`${iconProps.className} text-blue-400`} />
          </motion.div>
          <div className="absolute inset-x-0 bottom-[-10px] flex justify-center gap-1.5 overflow-hidden h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [-15, 15], opacity: [0, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.25,
                  ease: "linear",
                }}
                className="w-[2px] h-2.5 bg-blue-500 rounded-full"
              />
            ))}
          </div>
        </div>
      );

    case "CloudSnow":
      return (
        <div className={`relative ${className}`}>
          <motion.div
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Cloud {...iconProps} className={`${iconProps.className} text-sky-200`} />
          </motion.div>
          <div className="absolute inset-x-0 bottom-[-10px] flex justify-center gap-1.5 overflow-hidden h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-15, 15],
                  x: [i * 2 - 2, i * 2 - 4],
                  opacity: [0, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  delay: i * 0.4,
                  ease: "linear",
                }}
              >
                <CloudSnow size={size * 0.3} className="text-sky-300 stroke-[1.5]" />
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "CloudLightning":
      return (
        <div className={`relative ${className}`}>
          <motion.div
            animate={{ y: [0, -1.5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Cloud {...iconProps} className={`${iconProps.className} text-indigo-400`} />
          </motion.div>
          <motion.div
            animate={{
              opacity: [0, 1, 0, 1, 0],
              scale: [0.95, 1.05, 0.95, 1, 0.95],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              repeatDelay: 1.5,
            }}
            className="absolute bottom-[-12px] left-[35%]"
          >
            <CloudLightning size={size * 0.55} className="text-yellow-400 stroke-[1.8] fill-yellow-400/20" />
          </motion.div>
        </div>
      );

    default:
      return <Cloud {...iconProps} className={`${iconProps.className} text-slate-500`} />;
  }
};
