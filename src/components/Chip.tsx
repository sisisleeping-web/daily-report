"use client";

import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface ChipProps extends HTMLMotionProps<"button"> {
  selected?: boolean;
  label: string;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export function Chip({ selected, label, onRemove, icon, className, ...props }: ChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        "border border-zinc-200 dark:border-zinc-800",
        selected
          ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
          : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-300 dark:bg-zinc-700/50 dark:hover:bg-zinc-600 transition-colors"
        >
          ×
        </span>
      )}
    </motion.button>
  );
}
