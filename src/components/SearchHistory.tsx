import React from "react";
import { SearchHistoryItem } from "../types";
import { Clock, Trash2, MapPin, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (history.length === 0) {
    return null;
  }

  // Display only the most recent 6 items to avoid UI clutter
  const recentItems = history.slice(0, 6);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] select-none">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Recent Searches</span>
        </h4>
        <button
          onClick={onClearAll}
          type="button"
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors py-1.5 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95"
          id="clear-history-btn"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <AnimatePresence initial={false}>
          {recentItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelect(item)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-250 cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:text-slate-500 shrink-0 transition-colors" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-1">
                    {item.name}
                  </span>
                  {(item.region || item.country) && (
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                      {item.region ? `${item.region}, ` : ""}
                      {item.country}
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => onRemove(item.id, e)}
                type="button"
                className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 md:opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
