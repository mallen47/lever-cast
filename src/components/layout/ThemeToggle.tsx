"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/providers/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center rounded-lg p-2 transition-colors",
        "hover:bg-accent/10 hover:text-accent",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900"
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

