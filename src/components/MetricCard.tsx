import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  statusText?: string;
  statusColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  label,
  icon: Icon,
  colorClass,
  bgClass,
  statusText,
  statusColor = "text-slate-500",
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 rounded-3xl bg-white border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-[150px] overflow-hidden relative"
    >
      {/* Decorative ambient background blur inside cards */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 ${bgClass}`} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${bgClass} ${colorClass}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            {value}
          </span>
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500 select-none">
            {label}
          </span>
        </div>

        {statusText && (
          <p className={`text-xs font-semibold mt-1.5 ${statusColor} flex items-center gap-1`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
            {statusText}
          </p>
        )}
      </div>
    </motion.div>
  );
};
